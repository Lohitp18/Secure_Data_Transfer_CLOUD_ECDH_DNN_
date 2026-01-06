import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export type HandshakeStatus = 'secure' | 'suspicious'
export interface HandshakeInitResponse {
  handshakeId: string
  serverPublicKey: string
  algorithm?: string
  serverSignature?: string
}
export interface HandshakeValidateResult {
  status: HandshakeStatus
  sessionKey: string
  ids?: { anomaly_score: number; verdict: string }
}

export type FileStatus = 'normal' | 'suspicious'
export interface FileUploadResult {
  status: FileStatus
  details: Record<string, unknown>
}

export interface Alert {
  id: string
  user_id: string
  severity: string
  threat_type: string
  confidence: number
  source_ip: string
  created_at: string
  resolved: boolean
  ml_score: number
  details?: Record<string, unknown>
}

export interface Transfer {
  id: string
  user_id: string
  filename: string
  size: number
  status: string
  progress: number
  encryption_method: string
  created_at: string
}

export interface ConnectionLog {
  id: string
  user_id: string
  status: string
  handshake_type: string
  created_at: string
  details: string
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      // Don't set default Content-Type - let axios set it based on data type
    })

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      // Set Content-Type for JSON requests, but not for FormData (axios will set it automatically)
      if (!(config.data instanceof FormData)) {
        config.headers = config.headers || {}
        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json'
        }
      } else {
        // For FormData, explicitly remove Content-Type to let browser/axios set it with boundary
        if (config.headers) {
          delete config.headers['Content-Type']
        }
      }
      return config
    })

    this.client.interceptors.response.use(
      (resp) => resp,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          sessionStorage.removeItem('auth_token')
        }
        return Promise.reject(error)
      }
    )
  }

  // Handshake
  async initHandshake(payload: {
    publicKey: string
    signature?: string
    signingPubKey?: string
  }): Promise<HandshakeInitResponse> {
    const { data } = await this.client.post('/handshake/init', payload)
    return {
      handshakeId: data.handshakeId,
      serverPublicKey: data.serverPublicKey,
      algorithm: data.algorithm,
      serverSignature: data.serverSignature,
    }
  }

  async validateHandshake(payload: {
    handshakeId: string
    signature?: string
    signingPubKey?: string
  }): Promise<HandshakeValidateResult> {
    const { data } = await this.client.post('/handshake/validate', payload)
    const verdict: string | undefined = data?.idsResult?.verdict
    const status: HandshakeStatus = data.verified && verdict !== 'suspicious' ? 'secure' : 'suspicious'
    return {
      status,
      sessionKey: data.sessionKey,
      ids: data.idsResult,
    }
  }

  // Files
  async uploadFile(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    const { data } = await this.client.post('/files/upload', formData, {
      // Don't set Content-Type manually - axios will set it automatically with boundary for FormData
      // This preserves the Authorization header set by the interceptor
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          const p = Math.round((evt.loaded * 100) / evt.total)
          onProgress(p)
        }
      },
    })
    return {
      status: data.status as FileStatus,
      details: data.details ?? data.ids_result ?? null,
    }
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    const { data } = await this.client.get('/alerts')
    return data as Alert[]
  }

  async getAlertById(id: string): Promise<Alert> {
    const { data } = await this.client.get(`/alerts/${id}`)
    return data as Alert
  }

  // Transfers
  async getTransfers(): Promise<Transfer[]> {
    const { data } = await this.client.get('/logs/transfers')
    return data as Transfer[]
  }

  // Connection Logs
  async getConnectionLogs(): Promise<ConnectionLog[]> {
    const { data } = await this.client.get('/logs/connections')
    return data as ConnectionLog[]
  }

  // Health check
  async checkHealth(): Promise<{ ok: boolean; status?: string }> {
    try {
      const { data } = await this.client.get('/health', { timeout: 5000 })
      return { ok: true, status: data.status || 'healthy' }
    } catch (error: unknown) {
      const err = error as { code?: string; response?: unknown }
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || !err.response) {
        return { ok: false, status: 'backend_unavailable' }
      }
      return { ok: false, status: 'unhealthy' }
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient
