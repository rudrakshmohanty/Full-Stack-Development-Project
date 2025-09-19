# BlockCreds - Free Blockchain Credential Verification

A free, open-source blockchain-based credential verification platform with AI-powered image authentication.

## Features

- 🔒 **Free Blockchain Security** - Immutable credential storage
- 🤖 **AI-Powered Verification** - Advanced image comparison and authenticity verification
- 🗄️ **Secure Storage** - Encrypted credential storage with MongoDB
- ⚡ **Real-time Verification** - Instant verification with confidence scoring
- 🔐 **End-to-End Encryption** - Complete data protection
- 📱 **Smart Contracts** - Automated verification processes

## Quick Start

### Prerequisites

- Python 3.8+
- MongoDB (optional - runs in demo mode without it)
- Node.js 18+ (for frontend)

### Backend Setup

1. Install Python dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. Start the Flask server:
\`\`\`bash
python app.py
\`\`\`

The API will be available at `http://localhost:5001`

### Frontend Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/auth/check` - Check authentication status
- `POST /api/logout` - User logout

### Credentials
- `GET /api/credentials` - Get user credentials
- `POST /api/credentials` - Create new credential
- `GET /api/credentials/<id>` - Get specific credential
- `PUT /api/credentials/<id>` - Update credential
- `DELETE /api/credentials/<id>` - Delete credential

### Verification
- `POST /api/verify` - Verify credential by code
- `GET /api/verify/<code>` - Verify credential by URL
- `POST /api/verify/batch` - Batch verify multiple credentials

### File Upload
- `POST /api/upload` - Upload credential files

### Admin (Admin role required)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/<id>` - Update user
- `DELETE /api/admin/users/<id>` - Delete user
- `GET /api/admin/credentials` - Get all credentials

## Demo Mode

The application runs in demo mode when MongoDB is not available, providing:
- Mock data for testing
- All API endpoints functional
- No persistent storage

## Technology Stack

### Backend
- **Flask** - Web framework
- **MongoDB** - Database (optional)
- **JWT** - Authentication
- **Flask-CORS** - Cross-origin requests
- **Bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## License

This project is free and open-source. No subscriptions, no costs, no limitations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
