import { computeSharedSecret, deriveAesKey, b64ToUint8Array, uint8ArrayToB64, verifyEd25519 } from '../utils/crypto.js'
import Handshake from '../models/Handshake.js'
import ConnectionLog from '../models/ConnectionLog.js'
import { callIDS } from '../utils/ids.js'

export async function validateHandshake(req, res) {
  try {
    const { handshakeId, signature, signingPubKey } = req.body
    
    if (!handshakeId) {
      return res.status(400).json({ error: 'Missing handshake ID' })
    }

    // Find handshake record
    const handshake = await Handshake.findById(handshakeId)
    if (!handshake) {
      return res.status(404).json({ error: 'Handshake not found' })
    }

    if (handshake.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Track retry attempts for IDS features
    handshake.metadata = handshake.metadata || {}
    handshake.metadata.retryCount = (handshake.metadata.retryCount || 0) + 1

    // Compute shared secret
    const clientPub = b64ToUint8Array(handshake.clientPublicKeyB64)
    const serverSecret = b64ToUint8Array(handshake.serverSecretKeyB64)
    
    // Validate key sizes before computing shared secret
    if (clientPub.length !== 32) {
      console.error(`Invalid client public key size: ${clientPub.length} bytes (expected 32)`)
      console.error(`Client public key B64: ${handshake.clientPublicKeyB64.substring(0, 50)}...`)
      return res.status(400).json({ error: `Invalid client public key size: ${clientPub.length} bytes (expected 32)` })
    }
    if (serverSecret.length !== 32) {
      console.error(`Invalid server secret key size: ${serverSecret.length} bytes (expected 32)`)
      return res.status(500).json({ error: `Invalid server secret key size: ${serverSecret.length} bytes (expected 32)` })
    }
    
    const sharedSecret = computeSharedSecret(serverSecret, clientPub)
    
    // Derive AES session key
    const sessionKey = deriveAesKey(sharedSecret)
    const sessionKeyB64 = uint8ArrayToB64(sessionKey)

    // Verify Ed25519 signature if provided
    let signatureValid = true
    const signatureProvided = Boolean(signature && signingPubKey)
    if (signatureProvided) {
      const message = Buffer.from(handshake.serverPublicKeyB64, 'utf8')
      const sig = b64ToUint8Array(signature)
      const signPub = b64ToUint8Array(signingPubKey)
      signatureValid = verifyEd25519(message, sig, signPub)
    }

    // Prepare features for IDS
    const handshakeFeatures = {
      handshake_duration: Date.now() - new Date(handshake.createdAt).getTime(),
      key_size: 32, // X25519 key size
      signature_valid: signatureValid,
      client_entropy: calculateEntropy(handshake.clientPublicKeyB64),
      server_entropy: calculateEntropy(handshake.serverPublicKeyB64),
      retry_count: handshake.metadata?.retryCount || 0,
      timestamp_hour: new Date().getHours(),
      ip_reputation: 0.8, // Placeholder
      geolocation_risk: 0.2, // Placeholder
      protocol_version: 1.0
    }

    // Call IDS for anomaly detection
    let idsResult = { anomaly_score: 0.1, verdict: 'normal' }
    try {
      idsResult = await callIDS('/predict/handshake', handshakeFeatures)
    } catch (idsError) {
      console.warn('IDS call failed:', idsError.message)
    }

    const entropyScore = handshakeFeatures.client_entropy
    const suspiciousHandshake = (!signatureValid && signatureProvided) 
      || idsResult.anomaly_score >= 0.6 
      || idsResult.verdict !== 'normal'
      || (!signatureProvided && entropyScore < 4.0) // weak / tampered key material

    // Update handshake record
    handshake.sharedSecretB64 = uint8ArrayToB64(sharedSecret)
    handshake.sessionKeyB64 = sessionKeyB64
    handshake.verified = signatureValid && !suspiciousHandshake
    handshake.status = suspiciousHandshake ? 'suspicious' : 'completed'
    handshake.idsResult = idsResult
    handshake.completedAt = new Date()
    await handshake.save()

    if (suspiciousHandshake) {
      try {
        await ConnectionLog.create({
          userId: req.user.id,
          status: 'failed',
          handshake_type: 'X25519',
          details: `Handshake rejected - IDS verdict: ${idsResult.verdict}, signatureValid=${signatureValid}`
        })
      } catch (logErr) {
        console.error('Failed to create connection log:', logErr)
      }

      return res.status(403).json({
        verified: false,
        reason: 'Handshake flagged by intrusion detection',
        idsResult: {
          anomaly_score: idsResult.anomaly_score,
          verdict: idsResult.verdict
        }
      })
    }

    // Prepare response
    const response = {
      verified: signatureValid && idsResult.verdict === 'normal',
      sessionKey: sessionKeyB64,
      algorithm: 'X25519+HKDF-SHA256',
      idsResult: {
        anomaly_score: idsResult.anomaly_score,
        verdict: idsResult.verdict
      }
    }

    // Create connection log
    try {
      await ConnectionLog.create({
        userId: req.user.id,
        status: response.verified ? 'success' : 'failed',
        handshake_type: 'X25519',
        details: response.verified 
          ? 'Handshake validated successfully' 
          : `Handshake validation failed - IDS verdict: ${idsResult.verdict}`
      })
    } catch (logErr) {
      console.error('Failed to create connection log:', logErr)
    }

    res.json(response)
  } catch (error) {
    console.error('Handshake validation error:', error)
    res.status(500).json({ error: 'Handshake validation failed' })
  }
}

function calculateEntropy(str) {
  // Simple entropy calculation
  const freq = {}
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1
  }
  
  let entropy = 0
  const len = str.length
  for (let count of Object.values(freq)) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }
  
  return entropy
}
