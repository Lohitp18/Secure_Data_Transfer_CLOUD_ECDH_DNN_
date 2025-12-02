import axios from 'axios'

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
    console.error('IDS service error:', error.message)
    // Return safe defaults if IDS is unavailable
    return {
      anomaly_score: 0.1,
      verdict: 'normal',
      confidence: 0.9
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
