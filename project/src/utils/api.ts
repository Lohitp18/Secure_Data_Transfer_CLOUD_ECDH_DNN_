import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface KeyExchangeRequest {
  publicKey: string; // Base64 encoded
}

export interface KeyExchangeResponse {
  serverPublicKey: string; // Base64 encoded
  signature: string; // Base64 encoded digital signature
  sessionId: string;
}

export interface FileUploadRequest {
  sessionId: string;
  fileName: string;
  fileSize: number;
  ciphertext: string; // Base64 encoded
  nonce: string; // Base64 encoded
  authTag: string; // Base64 encoded
}

export interface FileUploadResponse {
  uploadId: string;
  status: 'success' | 'failed';
  idsResult: 'safe' | 'suspicious' | 'intrusion';
  message: string;
}

export interface TransferLog {
  id: string;
  fileName: string;
  timestamp: string;
  encryptionMethod: string;
  idsResult: 'safe' | 'suspicious' | 'intrusion';
  sessionId: string;
  fileSize: number;
  status: 'completed' | 'failed' | 'in_progress';
}

export class ApiService {
  // Authentication
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  static async register(userData: LoginRequest & { name: string }) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Key exchange for ECDH
  static async exchangeKeys(request: KeyExchangeRequest): Promise<KeyExchangeResponse> {
    const response = await api.post('/crypto/key-exchange', request);
    return response.data;
  }

  // File upload
  static async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    const response = await api.post('/files/upload', request);
    return response.data;
  }

  // Get transfer logs
  static async getTransferLogs(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    idsResult?: string;
  }): Promise<TransferLog[]> {
    const response = await api.get('/logs/transfers', { params: filters });
    return response.data;
  }

  // Get real-time transfer status
  static async getTransferStatus(uploadId: string) {
    const response = await api.get(`/files/status/${uploadId}`);
    return response.data;
  }

  // Health check
  static async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  }
}

export default api;