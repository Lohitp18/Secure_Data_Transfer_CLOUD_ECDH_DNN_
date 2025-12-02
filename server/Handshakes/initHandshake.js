import { generateServerX25519KeyPair, uint8ArrayToB64 } from '../utils/crypto.js'
import Handshake from '../models/Handshake.js'

export async function initHandshake(req, res) {
  try {
    const { publicKey: clientPubB64, signature, signingPubKey } = req.body
    
    if (!clientPubB64) {
      return res.status(400).json({ error: 'Missing client public key' })
    }

    // Generate server X25519 key pair
    const serverKeyPair = generateServerX25519KeyPair()
    const serverPublicKeyB64 = uint8ArrayToB64(serverKeyPair.publicKey)

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
