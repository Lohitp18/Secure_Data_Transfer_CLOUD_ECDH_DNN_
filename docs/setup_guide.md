# Secure Data Transfer System - Setup Guide

## Overview
This is a secure cloud data transfer system with hybrid cryptography (X25519 + Ed25519 + AES-256-GCM) and deep learning-based intrusion detection.

## Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)
- Docker (optional)

## Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone and navigate to project
cd project

# Start all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# IDS Service: http://localhost:6000
```

### Option 2: Local Development

#### 1. Backend Setup
```bash
cd project
npm install
npm run server
```

#### 2. IDS Service Setup
```bash
cd project/ids_service
pip install -r requirements.txt

# Train models (optional - dummy models will be used if not found)
python train.py

# Start IDS service
python app.py
```

#### 3. Frontend Setup
```bash
cd project
npm run dev
```

## Environment Configuration

### Backend (.env)
```env
MONGO_URL=mongodb+srv://4al22is018_db_user:CodeTech2004@cluster0.hfweelr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=super_secret_key
PORT=5000
IDS_URL=http://localhost:6000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Features

### 🔐 Cryptography
- **X25519** for key exchange (Perfect Forward Secrecy)
- **Ed25519** for digital signatures (MITM prevention)
- **AES-256-GCM** for authenticated encryption
- **HKDF-SHA256** for key derivation

### 🤖 Intrusion Detection
- **DNN-based IDS** for anomaly detection
- **Real-time analysis** of handshake patterns
- **File entropy analysis** for suspicious content
- **WebSocket alerts** for immediate threat notification

### 🏗️ Architecture
- **Microservices**: Frontend (React), Backend (Node.js), IDS (Python)
- **Database**: MongoDB for user data and handshake sessions
- **Containerized**: Docker Compose for easy deployment
- **Scalable**: Each service can be scaled independently

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Handshake
- `POST /api/handshake/init` - Initialize X25519 handshake
- `POST /api/handshake/validate` - Validate handshake with Ed25519

### File Transfer
- `POST /api/files/upload` - Upload file with IDS analysis
- `GET /api/logs/transfers` - Get transfer history

### Monitoring
- `GET /api/alerts` - Get intrusion alerts
- `GET /api/logs/connections` - Get connection logs
- `WS /api/ws` - WebSocket for real-time alerts

## Security Features

1. **Mutual Authentication**: Both client and server verify each other
2. **Perfect Forward Secrecy**: Session keys are derived per connection
3. **Integrity Protection**: AES-GCM provides authenticated encryption
4. **Anomaly Detection**: ML models detect suspicious patterns
5. **Real-time Monitoring**: WebSocket alerts for immediate response

## Development

### Training IDS Models
```bash
cd ids_service
python train.py
```

### Running Tests
```bash
# Backend tests
npm test

# IDS service tests
cd ids_service
python -m pytest
```

### Monitoring
- Backend logs: Console output
- IDS logs: Console output
- Database: MongoDB Atlas dashboard

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGO_URL in .env
   - Verify network access to MongoDB Atlas

2. **IDS Service Unavailable**
   - Check if Python dependencies are installed
   - Verify port 6000 is not in use

3. **Handshake Failures**
   - Check browser console for crypto errors
   - Verify WebCrypto API support

4. **File Upload Issues**
   - Check file size limits
   - Verify multer configuration

### Logs
- Backend: `npm run server` output
- IDS: `python app.py` output
- Frontend: Browser console

## Production Deployment

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Scale services
docker-compose up --scale backend=3 --scale ids_service=2
```

### Environment Variables
Set production environment variables:
- `NODE_ENV=production`
- `JWT_SECRET=<strong-secret>`
- `MONGO_URL=<production-mongo-url>`

## Support
For issues and questions, check the logs and ensure all services are running correctly.
