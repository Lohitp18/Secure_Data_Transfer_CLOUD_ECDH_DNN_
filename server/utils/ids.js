import axios from 'axios'

// Simple rate-limit for IDS warnings to avoid log spam during brute force tests
let lastWarnTs = 0
const WARN_INTERVAL_MS = 30_000

const IDS_URL = process.env.IDS_URL || 'http://localhost:6000'

export async function callIDS(endpoint, features) {
  try {
    const response = await axios.post(`${IDS_URL}${endpoint}`, features, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    return response.data
  } catch (error) {
    // Fallback: keep operations running even if IDS is down
    const reason = error?.message || 'unknown'
    const detail = error?.response?.data?.error || error?.code
    const now = Date.now()
    if (now - lastWarnTs > WARN_INTERVAL_MS) {
      console.warn(`IDS service unavailable, falling back to normal verdict (${reason}${detail ? `: ${detail}` : ''})`)
      lastWarnTs = now
    }
    return {
      anomaly_score: 0.1,
      verdict: 'normal',
      confidence: 0.0,
      error: reason
    }
  }
}

export async function checkIDSHealth() {
  try {
    const response = await axios.get(`${IDS_URL}/health`, { timeout: 2000 })
    return response.data
  } catch (error) {
    console.error('IDS health check failed:', error.message)
    return { status: 'unhealthy' }
  }
}
