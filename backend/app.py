import os
import datetime
import jwt
import secrets
import base64
from functools import wraps
import json

from flask import Flask, request, jsonify, send_file
from weasyprint import HTML
import io
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
from web3 import Web3

# --- Mock CLIP Service for functionality without the actual model ---
class MockClipService:
    def compare_images(self, image1_b64, image2_b64):
        """Mocks the comparison of two base64 encoded images."""
        # In a real scenario, this would involve loading models and processing images.
        # Here, we'll just pretend by checking if the strings are not empty.
        if image1_b64 and image2_b64:
            return {
                'success': True,
                'similarity_score': 0.92  # Return a high score for demo purposes
            }
        return {'success': False, 'error': 'Invalid image data'}

clip_service = MockClipService()
# from services.clip_verification import clip_service # Your original import

load_dotenv()  # load environment variables from .env

app = Flask(__name__)

# --- Blockchain Setup ---
WEB3_PROVIDER_URI = os.environ.get('WEB3_PROVIDER_URI', 'http://127.0.0.1:8545')
CONTRACT_ADDRESS = os.environ.get('CREDENTIAL_CONTRACT_ADDRESS')
CONTRACT_ABI_PATH = os.environ.get('CREDENTIAL_CONTRACT_ABI', './blockchain/contracts/CredentialRegistry.json')

w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER_URI))
contract = None
try:
    if not CONTRACT_ADDRESS:
        print('⚠️ Contract address not set in environment variables')
    elif not CONTRACT_ABI_PATH:
        print('⚠️ Contract ABI path not set in environment variables')
    elif not os.path.exists(CONTRACT_ABI_PATH):
        print(f'⚠️ Contract ABI file not found at: {CONTRACT_ABI_PATH}')
        print(f'Current working directory: {os.getcwd()}')
    else:
        print(f'📄 Loading contract ABI from: {CONTRACT_ABI_PATH}')
        with open(CONTRACT_ABI_PATH) as f:
            contract_json = json.load(f)
            contract_abi = contract_json['abi']  # Extract just the ABI from the Hardhat artifact
            print('✅ Contract ABI loaded successfully')
        contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=contract_abi)
        print(f'✅ Contract initialized at address: {CONTRACT_ADDRESS}')
except Exception as e:
    print(f'⚠️ Error initializing blockchain contract: {str(e)}')

# --- Configurations ---
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "a_default_secret_key")
app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/blockcreds_db")
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Enable debug logging for MongoDB operations
app.config['MONGO_LOGGING'] = True

# --- Extensions ---
try:
    mongo = PyMongo(app)
    # Test MongoDB connection
    mongo.db.command('ismaster')
    print("✅ Connected to MongoDB successfully")

# --- Main Application Runner ---
except Exception as e:
    print(f"⚠️ MongoDB connection failed: {e}")
    print("🔄 Running in demo mode without database")
    mongo = None

CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Accept"],
    "expose_headers": ["Content-Type"],
    "supports_credentials": True
}}, supports_credentials=True)
bcrypt = Bcrypt(app)


# --- Helper Functions & Decorators ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            if mongo:
                current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            else:
                # Demo mode user
                current_user = {
                    '_id': 'demo_user_123',
                    'email': 'demo@example.com',
                    'username': 'Demo User',
                    'role': data.get('role', 'recipient'),
                    'first_name': 'Demo',
                    'last_name': 'User'
                }
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def to_object_id(value):
    try:
        return ObjectId(value)
    except Exception:
        return None

def json_serialize(obj):
    """Helper function to convert non-serializable types to JSON serializable format."""
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    if isinstance(obj, bytes):
        return base64.b64encode(obj).decode('utf-8')
    if isinstance(obj, dict):
        return {k: json_serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [json_serialize(item) for item in obj]
    return obj

# --- Core & Authentication Routes ---
# --- Hardcoded Admin User ---
def ensure_admin_user():
    if mongo:
        admin_email = "admin@example.com"
        admin_password = "adminpass123"
        admin = mongo.db.users.find_one({"email": admin_email})
        if not admin:
            hashed_pw = bcrypt.generate_password_hash(admin_password).decode('utf-8')
            mongo.db.users.insert_one({
                "username": "admin",
                "email": admin_email,
                "password": hashed_pw,
                "role": "admin"
            })
            print("[INFO] Hardcoded admin user created.")
        elif admin.get("role") != "admin":
            mongo.db.users.update_one({"email": admin_email}, {"$set": {"role": "admin"}})
            print("[INFO] Hardcoded admin user role updated to admin.")

ensure_admin_user()

@app.route("/api")
def index():
    return jsonify({"message": "Welcome to the BlockCreds API!"})

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print(f"📨 Received registration data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if mongo is None:
            return jsonify({'message': 'Registration successful! (Demo mode)', 'user_id': 'demo_user_123'}), 201
            
        users = mongo.db.users
        required_fields = ['email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required.'}), 400

        if users.find_one({'email': data['email']}):
            return jsonify({'error': 'A user with this email already exists.'}), 409

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user_doc = {
            'username': data.get('username', data['email']),
            'email': data['email'],
            'password': hashed_password,
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'organization': data.get('organization', ''),
            'role': 'recipient',  # Always user privilege
            'status': 'active',
            'settings': {'email_notifications': True, 'two_factor_auth': False},
            'created_at': datetime.datetime.utcnow()
        }
        
        new_user_id = users.insert_one(user_doc).inserted_id
        return jsonify({'message': 'User registered successfully!', 'user_id': str(new_user_id)}), 201

    except Exception as e:
        print(f"💥 Registration error: {str(e)}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if mongo is None:
            demo_token = jwt.encode({
                'user_id': 'demo_user_123',
                'role': 'recipient',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({
                'message': 'Login successful! (Demo mode)',
                'token': demo_token,
                'user': {'id': 'demo_user_123', 'role': 'recipient', 'isAuthenticated': True}
            }), 200
        
        required_fields = ['email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required.'}), 400
        
        user = mongo.db.users.find_one({'email': data['email']})
        if user and bcrypt.check_password_hash(user['password'], data['password']):
            token = jwt.encode({
                'user_id': str(user['_id']),
                'role': user.get('role'),
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({
                'message': 'Login successful', 
                'token': token,
                'user': {'id': str(user['_id']), 'role': user.get('role'), 'isAuthenticated': True}
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        print(f"💥 Login error: {str(e)}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/check', methods=['GET'])
def check_auth_status():
    """Check authentication status"""
    try:
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'isAuthenticated': False, 'message': 'No token provided'}), 200

        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_info = {'isAuthenticated': True}
        if mongo:
            user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not user:
                return jsonify({'isAuthenticated': False, 'message': 'User not found'}), 200
            user_info['user'] = {'id': str(user['_id']), 'role': user.get('role')}
        else:
            user_info['user'] = {'id': 'demo_user_123', 'role': data.get('role', 'recipient')}
        return jsonify(user_info), 200
                
    except jwt.ExpiredSignatureError:
        return jsonify({'isAuthenticated': False, 'message': 'Token has expired'}), 200
    except jwt.InvalidTokenError:
        return jsonify({'isAuthenticated': False, 'message': 'Invalid token'}), 200
    except Exception as e:
        print(f"💥 Auth check error: {str(e)}")
        return jsonify({'isAuthenticated': False, 'message': f'Error: {str(e)}'}), 200

@app.route('/api/auth/refresh', methods=['POST'])
@token_required
def refresh_token(current_user):
    try:
        new_token = jwt.encode({
            'user_id': str(current_user['_id']),
            'role': current_user.get('role', 'recipient'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': new_token, 'message': 'Token refreshed'}), 200
    except Exception as e:
        print(f"💥 Token refresh error: {str(e)}")
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500

@app.route('/api/logout', methods=['POST'])
@token_required
def logout(current_user):
    return jsonify({'message': 'Logout successful'}), 200

# --- User Profile Routes ---
@app.route('/api/me', methods=['GET'])
@token_required
def me(current_user):
    user_data = json_serialize(dict(current_user))
    user_data.pop('password', None)
    return jsonify({'user': user_data}), 200

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    profile = json_serialize(dict(current_user))
    profile.pop('password', None)
    return jsonify({'profile': profile}), 200

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    try:
        data = request.get_json()
        if mongo is None:
            return jsonify({'message': 'Profile updated successfully! (Demo mode)'}), 200
        
        update_data = {k: v for k, v in data.items() if k in ['username', 'first_name', 'last_name', 'organization']}
        if update_data:
            mongo.db.users.update_one({'_id': current_user['_id']}, {'$set': update_data})
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        print(f"💥 Update profile error: {str(e)}")
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

# --- Credential Routes ---
@app.route('/api/credentials', methods=['GET'])
@token_required
def get_credentials(current_user):
    try:
        if not mongo:
            return jsonify({'credentials': [], 'total': 0, 'isIssuer': False})

        user_id = current_user['_id']
        query = {'$or': [{'recipient_id': user_id}, {'issuer_id': user_id}]}
        
        output = []
        credentials_cursor = mongo.db.credentials.find(query).sort('issue_date', -1)

        for credential in credentials_cursor:
            try:
                issuer = None
                issuer_id = credential.get('issuer_id')
                if issuer_id:
                    issuer = mongo.db.users.find_one({'_id': issuer_id})

                is_verified = False
                if contract and credential.get('transaction_hash'):
                    try:
                        is_verified = contract.functions.verifyCredential(str(credential['_id'])).call()
                    except Exception as e:
                        print(f"Blockchain verification failed for {credential['_id']}: {e}")
                        is_verified = credential.get('is_verified', False)
                else:
                    is_verified = credential.get('is_verified', False)
                
                cred_data = {
                    '_id': str(credential['_id']),
                    'title': credential.get('title', 'Untitled'),
                    'issuer_name': issuer.get('username', 'Unknown Issuer') if issuer else 'Unknown Issuer',
                    'issuer_id': str(issuer_id) if issuer_id else None,
                    'recipient_id': str(credential.get('recipient_id')),
                    'issue_date': credential.get('issue_date').strftime('%Y-%m-%d') if credential.get('issue_date') else None,
                    'is_verified': bool(is_verified),
                    'credential_type': credential.get('credential_type', 'General'),
                    'transaction_hash': credential.get('transaction_hash'),
                    'metadata': json_serialize(credential.get('credential_data', {}))
                }
                output.append(cred_data)

            except Exception as e:
                print(f"Error processing credential {credential.get('_id')}: {str(e)}")
                continue

        return jsonify({
            'credentials': output,
            'total': len(output),
            'isIssuer': current_user.get('role') in ['issuer', 'admin']
        })

    except Exception as e:
        print(f"💥 Get credentials error: {str(e)}")
        return jsonify({'error': f'Failed to get credentials: {str(e)}'}), 500

@app.route('/api/credentials', methods=['POST'])
@token_required
def create_credential(current_user):
    try:
        data = request.get_json()
        
        # Create recipient if they don't exist
        recipient_address = data['recipient_email']  # Assuming this is an email for user lookup
        recipient = mongo.db.users.find_one({'email': recipient_address})
        if not recipient:
            # Create a new user with the provided email
            recipient_id = mongo.db.users.insert_one({
                'email': recipient_address,
                'role': 'recipient',
                'status': 'active',
                'created_at': datetime.datetime.utcnow()
            }).inserted_id
        else:
            recipient_id = recipient['_id']

        transaction_hash = data.get('transaction_hash')
        if not transaction_hash:
            return jsonify({'error': 'Transaction hash required from frontend'}), 400

        # Verify transaction on-chain if contract is configured
        if contract:
            try:
                tx_receipt = w3.eth.get_transaction_receipt(transaction_hash)
                if not tx_receipt or tx_receipt['status'] != 1:
                    return jsonify({'error': 'Transaction not found or failed on blockchain'}), 400
            except Exception as e:
                return jsonify({'error': f'Blockchain verification failed: {str(e)}'}), 400

        # Process and save image if provided
        image_data = None
        if 'image' in data:
            try:
                # Handle base64 image
                image_str = data['image']
                if ',' in image_str:  # Remove data URL prefix if present
                    image_str = image_str.split(',')[1]
                image_data = image_str
            except Exception as e:
                print(f"Error processing image: {e}")
                return jsonify({'error': 'Invalid image format'}), 400

        new_credential = {
            'title': data['title'],
            'issuer_id': current_user['_id'],
            'recipient_id': recipient_id,
            'issue_date': datetime.datetime.utcnow(),
            'expiry_date': data.get('expiry_date'),
            'credential_data': data.get('credential_data', {}),
            'transaction_hash': transaction_hash,
            'verification_code': data.get('verification_code'),
            'image': image_data,  # Store the base64 image
            'is_verified': True,
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }

        # Add optional fields if present
        if 'image_uri' in data:
            new_credential['image_uri'] = data['image_uri']

        result = mongo.db.credentials.insert_one(new_credential)
        
        # Prepare response
        response_data = json_serialize(new_credential)
        response_data['_id'] = str(result.inserted_id)
        
        return jsonify({'message': 'Credential created successfully', 'credential': response_data}), 201

    except Exception as e:
        print(f"💥 Create credential error: {str(e)}")
        return jsonify({'error': f'Failed to create credential: {str(e)}'}), 500

@app.route('/api/credentials/<credential_id>', methods=['GET'])
@token_required
def get_credential_by_id(current_user, credential_id):
    try:
        oid = to_object_id(credential_id)
        if not oid: return jsonify({'error': 'Invalid ID'}), 400
        
        cred = mongo.db.credentials.find_one({'_id': oid})
        if not cred: return jsonify({'error': 'Not found'}), 404

        is_owner = cred.get('recipient_id') == current_user['_id']
        is_issuer = cred.get('issuer_id') == current_user['_id']
        if not (is_owner or is_issuer or current_user.get('role') == 'admin'):
            return jsonify({'error': 'Forbidden'}), 403

        issuer = mongo.db.users.find_one({'_id': cred.get('issuer_id')})
        cred_data = {
            '_id': str(cred['_id']),
            'title': cred.get('title'),
            'issuer_name': issuer.get('username') if issuer else 'Unknown',
            'issue_date': cred.get('issue_date').strftime('%Y-%m-%d') if cred.get('issue_date') else None,
            'is_verified': cred.get('is_verified', False),
            'credential_data': json_serialize(cred.get('credential_data', {})),
            'transaction_hash': cred.get('transaction_hash')
        }
        return jsonify({'credential': cred_data}), 200
    except Exception as e:
        print(f"💥 Get credential error: {str(e)}")
        return jsonify({'error': f'Failed to get credential: {str(e)}'}), 500

@app.route('/api/credentials/<credential_id>', methods=['PUT'])
@token_required
def update_credential(current_user, credential_id):
    try:
        oid = to_object_id(credential_id)
        if not oid: return jsonify({'error': 'Invalid ID'}), 400

        cred = mongo.db.credentials.find_one({'_id': oid})
        if not cred: return jsonify({'error': 'Not found'}), 404

        if not (cred.get('issuer_id') == current_user['_id'] or current_user.get('role') == 'admin'):
            return jsonify({'error': 'Forbidden'}), 403

        data = request.get_json() or {}
        allowed = {k: v for k, v in data.items() if k in ['title', 'credential_data', 'expiry_date', 'is_verified']}
        if allowed:
            mongo.db.credentials.update_one({'_id': oid}, {'$set': allowed})
        return jsonify({'message': 'Credential updated successfully'}), 200
    except Exception as e:
        print(f"💥 Update credential error: {str(e)}")
        return jsonify({'error': f'Failed to update credential: {str(e)}'}), 500

@app.route('/api/credentials/<credential_id>', methods=['DELETE'])
@token_required
def remove_credential(current_user, credential_id):
    try:
        oid = to_object_id(credential_id)
        if not oid: return jsonify({'error': 'Invalid ID'}), 400

        cred = mongo.db.credentials.find_one({'_id': oid})
        if not cred: return jsonify({'error': 'Not found'}), 404

        if not (cred.get('issuer_id') == current_user['_id'] or current_user.get('role') == 'admin'):
            return jsonify({'error': 'Forbidden'}), 403

        mongo.db.credentials.delete_one({'_id': oid})
        return jsonify({'message': 'Credential deleted successfully'}), 200
    except Exception as e:
        print(f"💥 Delete credential error: {str(e)}")
        return jsonify({'error': f'Failed to delete credential: {str(e)}'}), 500

# --- Verification & Upload Routes ---
@app.route('/api/verify', methods=['POST'])
def verify_credential():
    try:
        print("\n=== Starting Credential Verification ===")
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        code = data.get('verification_code')
        if not code:
            return jsonify({'error': 'Verification code required'}), 400

        # Normalize verification code format
        code = code[2:] if code.startswith('0x') else code
        print(f"Looking up credential with code: {code}")

        credential = mongo.db.credentials.find_one({"verification_code": {"$in": [code, f"0x{code}"]}})

        if not credential:
            print("Credential not found in database")
            return jsonify({'error': 'Credential not found'}), 404
        
        print("Found credential in database")

        # 1. Verify on blockchain first
        print("\nVerifying on blockchain...")
        blockchain_valid = False
        if contract:
            try:
                verify_code = f"0x{code}"
                print(f"Calling contract with code: {verify_code}")
                result = contract.functions.verifyCredential(verify_code).call()
                blockchain_valid = result[0] if isinstance(result, (list, tuple)) else result
                print(f"Blockchain verification result: {result}")
            except Exception as e:
                print(f"Blockchain verification error: {e}")
                # Don't fail the whole request, just mark as not verified
                blockchain_valid = False
        else:
            print("Blockchain contract not configured. Skipping verification.")
            # If no contract, we cannot verify. Decide if this should be an error.
            # For now, we'll let it pass but it won't be blockchain_valid.

        # 2. Compare images if provided
        uploaded_image = data.get('image')
        stored_image = credential.get('image')
        images_match = False
        similarity_score = 0.0

        if uploaded_image and stored_image:
            print("\nComparing images using CLIP...")
            try:
                comparison_result = clip_service.compare_images(uploaded_image, stored_image)
                
                if comparison_result['success']:
                    similarity_score = comparison_result['similarity_score']
                    print(f"Image similarity score: {similarity_score:.4f}")
                    
                    SIMILARITY_THRESHOLD = 0.85
                    images_match = similarity_score >= SIMILARITY_THRESHOLD
                else:
                    print("Image comparison service failed.")
            except Exception as e:
                print(f"Error during image comparison: {str(e)}")
        elif not uploaded_image:
            return jsonify({'error': 'No image provided for verification'}), 400
        elif not stored_image:
            return jsonify({'error': 'No stored image found for this credential to compare against'}), 404

        # Format the final response
        credential_data = json_serialize(credential.get('credential_data', {}))
        
        verification_result = {
            'is_valid': blockchain_valid and images_match,
            'image_match_score': float(similarity_score),
            'blockchain_verified': blockchain_valid,
            'credential': {
                'id': str(credential['_id']),
                'title': credential.get('title'),
                'issuer': credential_data.get('issuerName') or credential_data.get('issuer', {}).get('name'),
                'organization': credential_data.get('issuerOrganization'),
                'issue_date': credential.get('issue_date').strftime('%Y-%m-%d') if credential.get('issue_date') else None,
                'expiry_date': credential.get('expiry_date').strftime('%Y-%m-%d') if credential.get('expiry_date') else None,
            }
        }

        print("\nVerification complete:")
        print(f"Blockchain verified: {blockchain_valid}")
        print(f"Images match: {images_match} (score: {similarity_score:.4f})")
        print(f"Overall validity: {verification_result['is_valid']}")
        
        return jsonify({'verification_result': verification_result}), 200
        
    except Exception as e:
        print(f"💥 Verification error: {str(e)}")
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500

@app.route('/api/verify/<verification_code>', methods=['GET'])
def verify_by_code(verification_code):
    """Verify credential by code (GET for link-based verification)"""
    import random
    is_valid = random.random() > 0.2
    if is_valid:
        payload = {
            'is_valid': True,
            'credential_id': verification_code,
            'similarity': 0.91,
            'confidence': 'high',
            'issuer': 'University of Technology',
            'owner': 'John Doe',
            'issue_date': '2024-01-15',
            'credential_type': 'Certificate',
            'blockchain_hash': f'0x{secrets.token_hex(32)}'
        }
    else:
        payload = {
            'is_valid': False,
            'credential_id': verification_code,
            'error': 'Credential not found or invalid'
        }
    return jsonify({'verification_result': payload}), 200

@app.route('/api/verify/batch', methods=['POST'])
@token_required
def batch_verify(current_user):
    """Batch verify multiple credentials"""
    data = request.get_json()
    codes = data.get('codes', [])
    if not codes:
        return jsonify({'error': 'No codes provided'}), 400
    results = []
    for c in codes:
        is_valid = False
        if contract:
            try:
                is_valid = contract.functions.verifyCredential(c).call()
            except Exception:
                is_valid = False
        results.append({'credential_id': c, 'is_valid': is_valid})
    return jsonify({
        'message': f'Batch verification completed for {len(codes)} credentials',
        'results': results,
        'summary': {'valid': sum(r['is_valid'] for r in results), 'invalid': sum(not r['is_valid'] for r in results)}
    }), 200

@app.route('/api/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    """Accept multipart file OR JSON base64 data"""
    filename = None
    file_data = None
    # Multipart
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            filename = secure_filename(file.filename)
            file_data = file.read()
    # JSON base64
    if not file_data and request.is_json:
        data = request.get_json() or {}
        b64_data = data.get('file_base64') or data.get('file')
        filename = data.get('filename', 'upload.bin')
        if b64_data:
            if ',' in b64_data:
                b64_data = b64_data.split(',', 1)[1]
            try:
                file_data = base64.b64decode(b64_data)
            except Exception:
                return jsonify({'error': 'Invalid base64 data'}), 400
    if not file_data:
        return jsonify({'error': 'No file provided'}), 400
    import time; time.sleep(0.5)
    return jsonify({
        'message': 'File processed successfully',
        'result': {
            'file_name': filename,
            'verification_id': f'VER-{secrets.token_hex(8).upper()}',
            'confidence': 'high'
        }
    }), 200

# --- Issuer Routes ---
@app.route('/api/issuer/credentials', methods=['GET'])
@token_required
def get_issued_credentials(current_user):
    if current_user.get('role') not in ['issuer', 'admin']:
        return jsonify({'error': 'Issuer access required'}), 403
    issued = []
    for cred in mongo.db.credentials.find({'issuer_id': current_user['_id']}):
        recipient = mongo.db.users.find_one({'_id': cred['recipient_id']})
        issued.append({
            '_id': str(cred['_id']),
            'title': cred['title'],
            'recipient': recipient['email'] if recipient else 'Unknown',
            'issue_date': cred['issue_date'].strftime('%Y-%m-%d'),
            'status': cred.get('status', 'active')
        })
    return jsonify({'credentials': issued}), 200

@app.route('/api/issuer/templates', methods=['GET'])
@token_required
def get_credential_templates(current_user):
    if current_user.get('role') not in ['issuer', 'admin']:
        return jsonify({'error': 'Issuer access required'}), 403
    
    demo_templates = [
        {'_id': 'template_1', 'name': 'University Diploma', 'fields': ['student_name', 'degree']},
        {'_id': 'template_2', 'name': 'Professional Certificate', 'fields': ['recipient_name', 'certification']}
    ]
    return jsonify({'templates': demo_templates}), 200

@app.route('/api/issuer/templates', methods=['POST'])
@token_required
def create_template(current_user):
    if current_user.get('role') not in ['issuer', 'admin']:
        return jsonify({'error': 'Issuer access required'}), 403
    data = request.get_json()
    if 'name' not in data or 'fields' not in data:
        return jsonify({'error': 'Name and fields are required'}), 400
    
    new_template = {
        '_id': f'template_{secrets.token_hex(8)}',
        'name': data['name'],
        'fields': data['fields'],
        'created_at': datetime.datetime.utcnow().isoformat()
    }
    return jsonify({'message': 'Template created successfully', 'template': new_template}), 201

# --- Admin Routes ---
@app.route('/api/admin/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    try:
        if mongo is None:
            return jsonify({'users': [
                {'_id': 'demo_user_1', 'username': 'John Doe', 'email': 'john@example.com', 'role': 'recipient'},
                {'_id': 'demo_user_2', 'username': 'Jane Smith', 'email': 'jane@example.com', 'role': 'issuer'}
            ]}), 200

        all_users = list(mongo.db.users.find({'_id': {'$ne': current_user['_id']}}))
        for user in all_users:
            user['_id'] = str(user['_id'])
            user.pop('password', None)
        return jsonify({'users': all_users}), 200
    except Exception as e:
        print(f"💥 Get users error: {str(e)}")
        return jsonify({'error': f'Failed to get users: {str(e)}'}), 500

@app.route('/api/admin/users/<user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user, user_id):
    try:
        data = request.get_json()
        update_data = {k: v for k, v in data.items() if k in ['role', 'status', 'username']}
        # Only admin can change roles
        if 'role' in update_data and current_user.get('role') != 'admin':
            return jsonify({'error': 'Only admin can change roles'}), 403
        
        result = mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404
        
        updated_user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        updated_user = json_serialize(updated_user)
        updated_user.pop('password', None)
        
        return jsonify({'message': 'User updated successfully', 'user': updated_user}), 200
    except Exception as e:
        print(f"💥 Update user error: {str(e)}")
        return jsonify({'error': f'Failed to update user: {str(e)}'}), 500

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    try:
        oid = ObjectId(user_id)
        mongo.db.credentials.delete_many({'recipient_id': oid})
        result = mongo.db.users.delete_one({'_id': oid})
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'message': 'User and their credentials deleted'}), 200
    except Exception as e:
        print(f"💥 Delete user error: {str(e)}")
        return jsonify({'error': f'Failed to delete user: {str(e)}'}), 500

@app.route('/api/admin/credentials', methods=['GET'])
@token_required
@admin_required
def get_all_credentials(current_user):
    try:
        all_credentials = list(mongo.db.credentials.find())
        for cred in all_credentials:
            cred['_id'] = str(cred['_id'])
            cred['recipient_id'] = str(cred.get('recipient_id'))
            cred['issuer_id'] = str(cred.get('issuer_id'))
            owner = mongo.db.users.find_one({'_id': ObjectId(cred['recipient_id'])})
            cred['owner'] = owner['username'] if owner else 'Unknown'
        return jsonify({'credentials': all_credentials}), 200
    except Exception as e:
        print(f"💥 Get all credentials error: {str(e)}")
        return jsonify({'error': f'Failed to get credentials: {str(e)}'}), 500

# --- Miscellaneous and Mock Routes ---
@app.route('/api/search', methods=['GET'])
@token_required
def search_credentials(current_user):
    query = request.args.get('q', '')
    return jsonify({'results': [
        {'_id': 'search_1', 'title': f'Diploma matching "{query}"', 'issuer': 'Demo University'},
        {'_id': 'search_2', 'title': f'Certificate matching "{query}"', 'issuer': 'Demo Institute'}
    ]}), 200

@app.route('/api/analytics/overview', methods=['GET'])
@token_required
def get_analytics_overview(current_user):
    try:
        if not mongo:
            return jsonify({'error': 'Database not available'}), 500

        now = datetime.datetime.utcnow()
        this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_week = now - datetime.timedelta(days=now.weekday())
        
        # Current period stats
        analytics = {
            'summary': {
                'credentials': {
                    'total': mongo.db.credentials.count_documents({'owner_id': current_user['_id']}),
                    'this_month': mongo.db.credentials.count_documents({
                        'owner_id': current_user['_id'],
                        'created_at': {'$gte': this_month}
                    })
                },
                'verifications': {
                    'total': mongo.db.verifications.count_documents({'credential.owner_id': current_user['_id']}),
                    'this_week': mongo.db.verifications.count_documents({
                        'credential.owner_id': current_user['_id'],
                        'created_at': {'$gte': this_week}
                    })
                }
            }
        }
        
        # Calculate success rate
        total_verifications = analytics['summary']['verifications']['total']
        successful_verifications = mongo.db.verifications.count_documents({
            'credential.owner_id': current_user['_id'],
            'is_valid': True
        })
        analytics['summary']['success_rate'] = round((successful_verifications / total_verifications * 100) if total_verifications > 0 else 0, 1)
        
        # Credential types distribution
        type_pipeline = [{'$group': {'_id': '$credential_type', 'count': {'$sum': 1}}}]
        type_results = list(mongo.db.credentials.aggregate(type_pipeline))
        total_creds = sum(r['count'] for r in type_results)
        analytics['credential_types'] = [{'type': r['_id'] or 'Other', 'count': r['count'], 'percentage': round((r['count'] / total_creds * 100) if total_creds > 0 else 0, 1)} for r in type_results]
        
        # Top issuers
        issuer_pipeline = [{'$group': {'_id': '$issuer_id', 'count': {'$sum': 1}}}, {'$sort': {'count': -1}}, {'$limit': 5}]
        issuer_results = list(mongo.db.credentials.aggregate(issuer_pipeline))
        analytics['top_issuers'] = []
        for r in issuer_results:
            issuer = mongo.db.users.find_one({'_id': r['_id']})
            if issuer:
                analytics['top_issuers'].append({'name': issuer.get('username', 'Unknown'), 'count': r['count']})
        
        # Summary statistics
        analytics['summary']['total_credentials'] = total_creds
        analytics['summary']['total_verified'] = mongo.db.credentials.count_documents({'is_verified': True})
        analytics['summary']['total_users'] = mongo.db.users.count_documents({})
        
        return jsonify({'analytics': analytics}), 200
        
    except Exception as e:
        print(f"💥 Analytics error: {str(e)}")
        return jsonify({'error': f'Failed to get analytics: {str(e)}'}), 500

# Setup PDF routes
#setup_pdf_routes(app, mongo, token_required)

# PDF Export Route
@app.route('/api/credentials/<credential_id>/export', methods=['GET'])
@token_required
def export_credential_pdf(current_user, credential_id):
    try:
        # Get credential from database
        credential = mongo.db.credentials.find_one({'_id': ObjectId(credential_id)})
        if not credential:
            return jsonify({'error': 'Credential not found'}), 404
            
        if str(credential.get('owner_id')) != str(current_user['_id']):
            return jsonify({'error': 'Unauthorized'}), 403

        # Generate HTML for the credential
        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 40px; }}
                    .header {{ text-align: center; margin-bottom: 30px; }}
                    .credential-info {{ margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; font-size: 12px; }}
                    .blockchain-info {{ background: #f5f5f5; padding: 15px; border-radius: 5px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>{credential.get('title', 'Blockchain Verified Credential')}</h1>
                    <p>Issued on: {credential.get('issue_date').strftime('%B %d, %Y')}</p>
                </div>
                
                <div class="credential-info">
                    <h2>Credential Details</h2>
                    <p><strong>Issuer:</strong> {credential.get('issuer_name')}</p>
                    <p><strong>Recipient:</strong> {current_user.get('name', current_user.get('username'))}</p>
                    <p><strong>Type:</strong> {credential.get('credential_type', 'Certificate')}</p>
                    {'<p><strong>Expiry:</strong> ' + credential['expiry_date'].strftime('%B %d, %Y') + '</p>' if credential.get('expiry_date') else ''}
                </div>
                
                <div class="blockchain-info">
                    <h3>Blockchain Verification</h3>
                    <p>This credential has been verified and stored on the blockchain.</p>
                    <p><strong>Transaction ID:</strong> {credential.get('blockchain_tx_id', 'N/A')}</p>
                    <p><strong>Verification Date:</strong> {datetime.utcnow().strftime('%B %d, %Y')}</p>
                </div>
                
                <div class="footer">
                    <p>This is an official credential issued through the BlockCreds platform.</p>
                    <p>Verify this credential at: {request.host_url}verification/{credential_id}</p>
                </div>
            </body>
        </html>
        """

        # Create PDF from HTML
        pdf_buffer = io.BytesIO()
        HTML(string=html_content).write_pdf(pdf_buffer)
        pdf_buffer.seek(0)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'credential-{credential_id}.pdf'
        )

    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return jsonify({'error': 'Failed to generate PDF'}), 500

# --- Main Application Runner ---
if __name__ == "__main__":
    print("🚀 Starting BlockCreds API Server...")
    # Use 0.0.0.0 to make it accessible on the network, port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)