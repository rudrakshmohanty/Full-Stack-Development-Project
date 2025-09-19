from flask import send_file, jsonify, request
from weasyprint import HTML
from PyPDF2 import PdfWriter, PdfReader
from bson import ObjectId
import io
import qrcode
from datetime import datetime

def generate_verification_qr(credential_id, base_url):
    """Generate QR code for credential verification"""
    verify_url = f"{base_url}/verification/{credential_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert PIL image to bytes
    img_byte_arr = io.BytesIO()
    qr_img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr

def setup_pdf_routes(app, mongo, token_required):
    """Setup PDF export routes with the given Flask app instance"""
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
                    .qr-code {{ text-align: center; margin: 20px 0; }}
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
                
                <div class="qr-code">
                    <img src="[QR_CODE_PLACEHOLDER]" width="150" height="150">
                    <p>Scan to verify this credential</p>
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
        
        # Generate QR code
        qr_buffer = generate_verification_qr(credential_id, request.host_url.rstrip('/'))
        
        # Merge PDF with QR code
        pdf_buffer.seek(0)
        qr_buffer.seek(0)
        
        # Create the final PDF
        output = PdfWriter()
        existing_pdf = PdfReader(pdf_buffer)
        
        # Add the main content
        page = existing_pdf.pages[0]
        output.add_page(page)
        
        # Create final buffer
        final_buffer = io.BytesIO()
        output.write(final_buffer)
        final_buffer.seek(0)
        
        return send_file(
            final_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'credential-{credential_id}.pdf'
        )

    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return jsonify({'error': 'Failed to generate PDF'}), 500
