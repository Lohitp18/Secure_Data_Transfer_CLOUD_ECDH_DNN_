import nacl from 'tweetnacl'
import { hkdfSync } from 'node:crypto'

export function generateServerX25519KeyPair() {
  const keyPair = nacl.box.keyPair()
  return keyPair
}

export function computeSharedSecret(serverSecretKey, clientPublicKey) {
  // Validate key sizes (X25519 keys must be exactly 32 bytes)
  if (!serverSecretKey || serverSecretKey.length !== 32) {
    throw new Error(`Invalid server secret key size: expected 32 bytes, got ${serverSecretKey?.length || 0}`)
  }
  if (!clientPublicKey || clientPublicKey.length !== 32) {
    throw new Error(`Invalid client public key size: expected 32 bytes, got ${clientPublicKey?.length || 0}`)
  }
  // nacl.box.before uses Curve25519 to compute a shared key
  return nacl.box.before(clientPublicKey, serverSecretKey)
}

export function deriveAesKey(sharedSecret) {
  // HKDF-SHA256 derive 32-byte key for AES-256
  // sharedSecret is Uint8Array length 32
  const ikm = Buffer.from(sharedSecret)
  const salt = Buffer.alloc(0)
  const info = Buffer.from('secure-transfer-session')
  const key = hkdfSync('sha256', ikm, salt, info, 32)
  return new Uint8Array(key)
}

export function b64ToUint8Array(b64) {
  if (!b64 || typeof b64 !== 'string') {
    throw new Error('Invalid base64 string provided')
  }
  try {
    // Trim whitespace and handle potential padding issues
    const cleaned = b64.trim().replace(/\s/g, '')
    const buffer = Buffer.from(cleaned, 'base64')
    return new Uint8Array(buffer)
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error.message}`)
  }
}

export function uint8ArrayToB64(arr) {
  return Buffer.from(arr).toString('base64')
}

export function verifyEd25519(messageBytes, signatureBytes, publicKeyBytes) {
  return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
}
