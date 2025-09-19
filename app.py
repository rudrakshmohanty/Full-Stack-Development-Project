import os
import datetime
import jwt
import secrets
import base64
from functools import wraps

from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename

load_dotenv()  # load environment variables from .env

app = Flask(__name__)

# --- Configurations ---
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "a_default_secret_key")
app.config["MONGO_URI"] = "mongodb://localhost:27017/blockcreds_db"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# --- Extensions ---
try:
    mongo = PyMongo(app)
    # Test MongoDB connection
    mongo.db.command('ismaster')
    print("✅ Connected to MongoDB successfully")
except Exception as e:
    print(f"⚠️ MongoDB connection failed: {e}")
    print("🔄 Running in demo mode without database")
    mongo = None

CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
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

# --- Core & Authentication Routes ---

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
            'role': data.get('role', 'recipient'),
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
                'role': user['role'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({
                'message': 'Login successful', 
                'token': token,
                'user': {'id': str(user['_id']), 'role': user['role'], 'isAuthenticated': True}
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
            user_info['user'] = {'id': str(user['_id']), 'role': user['role']}
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
    user_data = dict(current_user)
    user_data.pop('password', None)
    user_data['_id'] = str(user_data.get('_id'))
    return jsonify({'user': user_data}), 200

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    profile = current_user.copy()
    profile.pop('password', None)
    profile['_id'] = str(profile['_id'])
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
        if mongo is None:
            return jsonify({'credentials': [
                {'_id': 'demo_cred_1', 'title': 'University Diploma', 'issuer_name': 'Demo University', 'issue_date': '2024-01-15', 'is_verified': True},
                {'_id': 'demo_cred_2', 'title': 'Professional Certificate', 'issuer_name': 'Demo Institute', 'issue_date': '2024-01-10', 'is_verified': False}
            ]}), 200
        
        output = []
        for credential in mongo.db.credentials.find({'recipient_id': current_user['_id']}):
            issuer = mongo.db.users.find_one({'_id': credential['issuer_id']})
            output.append({
                '_id': str(credential['_id']),
                'title': credential['title'],
                'issuer_name': issuer['username'] if issuer else 'Unknown Issuer',
                'issue_date': credential['issue_date'].strftime('%Y-%m-%d'),
                'is_verified': credential.get('is_verified', False)
            })
        return jsonify({'credentials': output})
    except Exception as e:
        print(f"💥 Get credentials error: {str(e)}")
        return jsonify({'error': f'Failed to get credentials: {str(e)}'}), 500

@app.route('/api/credentials', methods=['POST'])
@token_required
def create_credential(current_user):
    try:
        data = request.get_json()
        
        verification_code = f"BC-{secrets.token_hex(4).upper()}-{secrets.token_hex(4).upper()}"
        blockchain_hash = f"0x{secrets.token_hex(32)}"
        
        if mongo is None:
            return jsonify({
                'message': 'Credential created successfully!', 
                'credential_id': 'demo_cred_123',
                'verification_code': verification_code,
                'blockchain_hash': blockchain_hash,
                'status': 'verified'
            }), 201
        
        recipient = mongo.db.users.find_one({'email': data['recipient_email']})
        if not recipient:
            return jsonify({'error': 'Recipient not found'}), 404

        new_credential = {
            'title': data['title'],
            'issuer_id': current_user['_id'],
            'recipient_id': recipient['_id'],
            'issue_date': datetime.datetime.utcnow(),
            'expiry_date': data.get('expiry_date'),
            'credential_data': data.get('credential_data', {}),
            'verification_code': verification_code,
            'transaction_hash': blockchain_hash,
            'is_verified': True,
            'status': 'verified'
        }
        result = mongo.db.credentials.insert_one(new_credential)
        new_credential['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Credential created successfully', 
            'credential': new_credential,
            'verification_code': verification_code,
            'blockchain_hash': blockchain_hash
        }), 201
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
            'credential_data': cred.get('credential_data', {}),
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
        if mongo is None:
            return jsonify({'message': 'Credential deleted successfully! (Demo mode)'}), 200
            
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

@app.route('/api/credentials/<credential_id>/export', methods=['GET'])
@token_required
def export_credential(current_user, credential_id):
    """Export credential as PDF"""
    try:
        if mongo is None:
            # Demo mode - return a mock PDF
            from io import BytesIO
            import base64
            
            # Create a simple mock PDF content
            mock_pdf_content = b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(BlockCreds Certificate) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF'
            
            from flask import Response
            return Response(
                mock_pdf_content,
                mimetype='application/pdf',
                headers={'Content-Disposition': f'attachment; filename=credential_{credential_id}.pdf'}
            )
        
        oid = to_object_id(credential_id)
        if not oid: 
            return jsonify({'error': 'Invalid ID'}), 400

        cred = mongo.db.credentials.find_one({'_id': oid})
        if not cred: 
            return jsonify({'error': 'Credential not found'}), 404

        # Check permissions
        is_owner = cred.get('recipient_id') == current_user['_id']
        is_issuer = cred.get('issuer_id') == current_user['_id']
        if not (is_owner or is_issuer or current_user.get('role') == 'admin'):
            return jsonify({'error': 'Access denied'}), 403

        # Get issuer info
        issuer = mongo.db.users.find_one({'_id': cred.get('issuer_id')})
        
        # Generate PDF (simplified version - in production you'd use a proper PDF library)
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            from io import BytesIO
            
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            
            # Add content to PDF
            p.drawString(100, 750, f"BlockCreds Certificate")
            p.drawString(100, 720, f"Title: {cred.get('title', 'N/A')}")
            p.drawString(100, 690, f"Issued by: {issuer.get('username', 'Unknown') if issuer else 'Unknown'}")
            p.drawString(100, 660, f"Issue Date: {cred.get('issue_date', 'N/A')}")
            p.drawString(100, 630, f"Verification Hash: {cred.get('transaction_hash', 'N/A')}")
            p.drawString(100, 600, f"Status: {'Verified' if cred.get('is_verified') else 'Pending'}")
            
            p.save()
            buffer.seek(0)
            
            from flask import Response
            return Response(
                buffer.getvalue(),
                mimetype='application/pdf',
                headers={'Content-Disposition': f'attachment; filename={cred.get("title", "credential")}.pdf'}
            )
            
        except ImportError:
            # Fallback if reportlab is not installed
            mock_pdf = b'%PDF-1.4\nMock PDF for credential export'
            from flask import Response
            return Response(
                mock_pdf,
                mimetype='application/pdf',
                headers={'Content-Disposition': f'attachment; filename=credential_{credential_id}.pdf'}
            )
            
    except Exception as e:
        print(f"💥 Export credential error: {str(e)}")
        return jsonify({'error': f'Failed to export credential: {str(e)}'}), 500

@app.route('/api/verify/<verification_code>', methods=['GET'])
def verify_credential_by_code(verification_code):
    """Public endpoint to verify credentials by verification code"""
    try:
        if mongo is None:
            # Demo mode verification
            return jsonify({
                'verified': True,
                'credential': {
                    'title': 'Demo Certificate',
                    'issuer': 'Demo University',
                    'issue_date': '2024-01-15',
                    'verification_code': verification_code,
                    'status': 'verified'
                }
            }), 200
        
        credential = mongo.db.credentials.find_one({'verification_code': verification_code})
        if not credential:
            return jsonify({'verified': False, 'message': 'Credential not found'}), 404
        
        issuer = mongo.db.users.find_one({'_id': credential.get('issuer_id')})
        
        return jsonify({
            'verified': True,
            'credential': {
                'title': credential.get('title'),
                'issuer': issuer.get('username') if issuer else 'Unknown',
                'issue_date': credential.get('issue_date').strftime('%Y-%m-%d') if credential.get('issue_date') else None,
                'verification_code': verification_code,
                'status': 'verified' if credential.get('is_verified') else 'pending'
            }
        }), 200
        
    except Exception as e:
        print(f"💥 Verify credential error: {str(e)}")
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500

# --- Issuer Routes ---

@app.route('/api/issuer/credentials', methods=['GET'])
@token_required
def get_issued_credentials(current_user):
    if current_user.get('role') not in ['issuer', 'admin']:
        return jsonify({'error': 'Issuer access required'}), 403
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        issued_credentials = []
        for cred in mongo.db.credentials.find({'issuer_id': current_user['_id']}):
            recipient = mongo.db.users.find_one({'_id': cred['recipient_id']})
            issued_credentials.append({
                '_id': str(cred['_id']),
                'title': cred.get('title'),
                'recipient': recipient.get('email') if recipient else 'Unknown',
                'issue_date': cred.get('issue_date').strftime('%Y-%m-%d') if cred.get('issue_date') else None,
                'status': cred.get('status', 'active')
            })
        return jsonify({'credentials': issued_credentials}), 200
    except Exception as e:
        print(f"💥 Get issued credentials error: {str(e)}")
        return jsonify({'error': f'Failed to get issued credentials: {str(e)}'}), 500

@app.route('/api/issuer/templates', methods=['GET'])
@token_required
def get_credential_templates(current_user):
    if current_user.get('role') not in ['issuer', 'admin']:
        return jsonify({'error': 'Issuer access required'}), 403
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        templates = list(mongo.db.templates.find({'created_by': current_user['_id']}))
        for t in templates:
            t['_id'] = str(t['_id'])
        return jsonify({'templates': templates}), 200
    except Exception as e:
        print(f"💥 Get templates error: {str(e)}")
        return jsonify({'error': f'Failed to get templates: {str(e)}'}), 500

@app.route('/api/issuer/templates', methods=['POST'])
@token_required
def create_template(current_user):
    if current_user.get('role') not in ['issuer', 'admin']:
        return jsonify({'error': 'Issuer access required'}), 403
    data = request.get_json()
    if 'name' not in data or 'fields' not in data:
        return jsonify({'error': 'Name and fields are required'}), 400
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        new_template = {
            'name': data['name'],
            'fields': data['fields'],
            'created_by': current_user['_id'],
            'created_at': datetime.datetime.utcnow()
        }
        result = mongo.db.templates.insert_one(new_template)
        new_template['_id'] = str(result.inserted_id)
        return jsonify({'message': 'Template created successfully', 'template': new_template}), 201
    except Exception as e:
        print(f"💥 Create template error: {str(e)}")
        return jsonify({'error': f'Failed to create template: {str(e)}'}), 500

@app.route('/api/search', methods=['GET'])
@token_required
def search_credentials(current_user):
    query = request.args.get('q', '')
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        results = []
        for cred in mongo.db.credentials.find({'title': {'$regex': query, '$options': 'i'}}):
            issuer = mongo.db.users.find_one({'_id': cred['issuer_id']})
            results.append({
                '_id': str(cred['_id']),
                'title': cred.get('title'),
                'issuer': issuer.get('username') if issuer else 'Unknown'
            })
        return jsonify({'results': results}), 200
    except Exception as e:
        print(f"💥 Search error: {str(e)}")
        return jsonify({'error': f'Failed to search: {str(e)}'}), 500

@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        notifications = list(mongo.db.notifications.find({'user_id': current_user['_id']}))
        for n in notifications:
            n['_id'] = str(n['_id'])
        return jsonify({'notifications': notifications}), 200
    except Exception as e:
        print(f"💥 Get notifications error: {str(e)}")
        return jsonify({'error': f'Failed to get notifications: {str(e)}'}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notification_id):
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        oid = to_object_id(notification_id)
        if not oid:
            return jsonify({'error': 'Invalid notification ID'}), 400
        mongo.db.notifications.update_one({'_id': oid, 'user_id': current_user['_id']}, {'$set': {'read': True}})
        return jsonify({'message': 'Notification marked as read'}), 200
    except Exception as e:
        print(f"💥 Mark notification read error: {str(e)}")
        return jsonify({'error': f'Failed to mark notification as read: {str(e)}'}), 500

@app.route('/api/notifications/mark-all-read', methods=['PUT'])
@token_required
def mark_all_notifications_read(current_user):
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        mongo.db.notifications.update_many({'user_id': current_user['_id']}, {'$set': {'read': True}})
        return jsonify({'message': 'All notifications marked as read'}), 200
    except Exception as e:
        print(f"💥 Mark all notifications read error: {str(e)}")
        return jsonify({'error': f'Failed to mark all notifications as read: {str(e)}'}), 500

@app.route('/api/analytics/overview', methods=['GET'])
@token_required
def get_analytics_overview(current_user):
    try:
        if mongo is None:
            return jsonify({'error': 'Database not available'}), 500
        # Example: aggregate credentials by month
        pipeline = [
            {'$group': {
                '_id': {'month': {'$month': '$issue_date'}},
                'count': {'$sum': 1}
            }}
        ]
        credentials_by_month = list(mongo.db.credentials.aggregate(pipeline))
        # Add more analytics as needed
        analytics = {
            'credentials_by_month': credentials_by_month,
            # Add other analytics fields here
        }
        return jsonify({'analytics': analytics}), 200
    except Exception as e:
        print(f"💥 Analytics error: {str(e)}")
        return jsonify({'error': f'Failed to get analytics: {str(e)}'}), 500

# --- Main Application Runner ---
if __name__ == "__main__":
    print("🚀 Starting BlockCreds API Server...")
    # Use 0.0.0.0 to make it accessible on the network, port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
