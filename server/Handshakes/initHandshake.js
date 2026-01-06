import { generateServerX25519KeyPair, uint8ArrayToB64, b64ToUint8Array } from '../utils/crypto.js'
import Handshake from '../models/Handshake.js'

export async function initHandshake(req, res) {
  try {
    const { publicKey: clientPubB64, signature, signingPubKey } = req.body
    
    if (!clientPubB64) {
      return res.status(400).json({ error: 'Missing client public key' })
    }

    // Validate client public key size before storing
    try {
      const clientPub = b64ToUint8Array(clientPubB64)
      if (clientPub.length !== 32) {
        console.error(`Invalid client public key size during init: ${clientPub.length} bytes (expected 32)`)
        return res.status(400).json({ error: `Invalid client public key size: ${clientPub.length} bytes (expected 32)` })
      }
    } catch (keyError) {
      console.error('Failed to decode client public key:', keyError.message)
      return res.status(400).json({ error: `Invalid client public key format: ${keyError.message}` })
    }

    // Generate server X25519 key pair
    const serverKeyPair = generateServerX25519KeyPair()
    const serverPublicKeyB64 = uint8ArrayToB64(serverKeyPair.publicKey)
    
    // Validate server keys
    if (serverKeyPair.publicKey.length !== 32 || serverKeyPair.secretKey.length !== 32) {
      console.error(`Invalid server key pair size: pub=${serverKeyPair.publicKey.length}, sec=${serverKeyPair.secretKey.length}`)
      return res.status(500).json({ error: 'Server key generation failed' })
    }

    // Create handshake record
    const handshake = await Handshake.create({
      userId: req.user.id,
      clientPublicKeyB64: clientPubB64,
      serverPublicKeyB64: serverPublicKeyB64,
      serverSecretKeyB64: uint8ArrayToB64(serverKeyPair.secretKey),
      status: 'initiated',
      metadata: {
        algorithm: 'X25519',
        timestamp: new Date().toISOString(),
        clientIP: req.ip || req.connection.remoteAddress
      }
    })

    // Prepare response
    const response = {
      handshakeId: handshake._id.toString(),
      serverPublicKey: serverPublicKeyB64,
      algorithm: 'X25519'
    }

    // Add server signature if Ed25519 is enabled
    if (signature && signingPubKey) {
      // In a real implementation, you'd sign the server public key
      // For now, we'll just acknowledge the client signature
      response.serverSignature = 'server_signature_placeholder'
    }

    res.json(response)
  } catch (error) {
    console.error('Handshake initialization error:', error)
    res.status(500).json({ error: 'Handshake initialization failed' })
  }
}
