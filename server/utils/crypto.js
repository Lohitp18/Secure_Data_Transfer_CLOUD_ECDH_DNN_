import nacl from 'tweetnacl'
import { hkdfSync } from 'node:crypto'

export function generateServerX25519KeyPair() {
  const keyPair = nacl.box.keyPair()
  return keyPair
}

export function computeSharedSecret(serverSecretKey, clientPublicKey) {
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
  return new Uint8Array(Buffer.from(b64, 'base64'))
}

export function uint8ArrayToB64(arr) {
  return Buffer.from(arr).toString('base64')
}

export function verifyEd25519(messageBytes, signatureBytes, publicKeyBytes) {
  return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
}
