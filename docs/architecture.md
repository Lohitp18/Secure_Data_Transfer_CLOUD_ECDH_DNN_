# System Architecture

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │  Python IDS     │
│                 │    │                 │    │                 │
│  - WebCrypto    │◄──►│  - Express API  │◄──►│  - Flask API    │
│  - X25519/Ed25519│    │  - X25519+HKDF  │    │  - ML Models    │
│  - AES-256-GCM  │    │  - JWT Auth     │    │  - Anomaly Det. │
│  - Real-time UI │    │  - MongoDB      │    │  - Feature Eng. │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │    MongoDB      │    │   Model Files   │
│   Connection    │    │   Database      │    │   (.pkl)        │
│                 │    │                 │    │                 │
│  - Real-time    │    │  - Users        │    │  - handshake_   │
│    Alerts       │    │  - Handshakes   │    │    model.pkl    │
│  - Status       │    │  - Sessions     │    │  - file_model.  │
│    Updates      │    │  - Audit Logs   │    │    pkl          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Details

### Frontend (React + TypeScript)
- **Port**: 3000
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS
- **Cryptography**: WebCrypto API, tweetnacl
- **Communication**: REST API + WebSocket

### Backend (Node.js + Express)
- **Port**: 5000
- **Technology**: Node.js 18, Express.js, MongoDB, Mongoose
- **Cryptography**: X25519, Ed25519, AES-256-GCM, HKDF-SHA256
- **Authentication**: JWT with bcrypt password hashing

### IDS Service (Python + Flask)
- **Port**: 6000
- **Technology**: Python 3.10, Flask, scikit-learn, TensorFlow
- **ML Models**: Random Forest Classifiers
- **Features**: Handshake and file transfer anomaly detection

### Database (MongoDB)
- **Type**: Document database
- **Collections**: users, handshakes, alerts, transfers
- **Security**: Encrypted connections, access control

## Data Flow

### 1. User Authentication
```
User → Frontend → Backend → MongoDB
     ← JWT Token ←
```

### 2. Secure Handshake
```
Client → Generate X25519 key pair
      → Sign with Ed25519
      → POST /handshake/init
      ← Server public key
      → Compute shared secret
      → POST /handshake/validate
      ← Session key + IDS verdict
```

### 3. File Transfer
```
Client → Encrypt file (AES-256-GCM)
      → Upload with metadata
      → Backend → IDS analysis
      ← Transfer result + anomaly score
```

### 4. Real-time Monitoring
```
IDS → Anomaly detection
   → WebSocket alert
   → Frontend dashboard update
```

## Security Layers

### Layer 1: Network Security
- HTTPS/TLS encryption
- CORS configuration
- Rate limiting
- IP whitelisting (optional)

### Layer 2: Authentication
- JWT token validation
- Password hashing (bcrypt)
- Session management
- Role-based access control

### Layer 3: Cryptographic Security
- X25519 key exchange
- Ed25519 digital signatures
- AES-256-GCM encryption
- HKDF key derivation

### Layer 4: Intrusion Detection
- ML-based anomaly detection
- Real-time monitoring
- Automated alerting
- Threat response

### Layer 5: Data Protection
- End-to-end encryption
- Perfect forward secrecy
- Integrity verification
- Secure key management

## Deployment Architecture

### Docker Compose
```yaml
services:
  frontend:    # React app on port 3000
  backend:     # Node.js API on port 5000
  ids_service: # Python ML service on port 6000
  mongodb:     # Database (optional local instance)
```

### Production Considerations
- Load balancing for backend services
- Horizontal scaling of IDS service
- Database clustering and replication
- CDN for frontend assets
- Monitoring and logging infrastructure

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Handshake
- `POST /api/handshake/init` - Initialize X25519 handshake
- `POST /api/handshake/validate` - Validate with Ed25519

### File Operations
- `POST /api/files/upload` - Upload file with IDS analysis
- `GET /api/files/download/:id` - Download encrypted file
- `GET /api/files/list` - List user files

### Monitoring
- `GET /api/alerts` - Get intrusion alerts
- `GET /api/logs/connections` - Connection logs
- `GET /api/logs/transfers` - Transfer logs
- `WS /api/ws` - WebSocket for real-time updates

### IDS Service
- `POST /predict/handshake` - Handshake anomaly detection
- `POST /predict/file` - File transfer anomaly detection
- `GET /health` - Service health check

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  passwordHash: String,
  name: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Handshakes Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  clientPublicKeyB64: String,
  serverPublicKeyB64: String,
  serverSecretKeyB64: String,
  sharedSecretB64: String,
  sessionKeyB64: String,
  verified: Boolean,
  status: String,
  idsResult: Object,
  metadata: Object,
  createdAt: Date,
  completedAt: Date
}
```

### Alerts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,
  severity: String,
  message: String,
  metadata: Object,
  resolved: Boolean,
  createdAt: Date
}
```

## Security Considerations

### Cryptographic Security
- Use of industry-standard algorithms
- Proper key management and derivation
- Secure random number generation
- Protection against timing attacks

### Application Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Infrastructure Security
- Container security best practices
- Network segmentation
- Secret management
- Regular security updates

### Operational Security
- Comprehensive logging
- Real-time monitoring
- Incident response procedures
- Regular security audits
