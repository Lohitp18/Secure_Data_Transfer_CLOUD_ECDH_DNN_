// WebCrypto API utilities for ECDH and AES-GCM encryption

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptionResult {
  ciphertext: ArrayBuffer;
  nonce: ArrayBuffer;
  authTag: ArrayBuffer;
}

export class CryptoUtils {
  // Generate ECDH key pair
  static async generateECDHKeyPair(): Promise<KeyPair> {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        true, // extractable
        ['deriveKey', 'deriveBits']
      );
      
      return keyPair;
    } catch (error) {
      throw new Error(`Failed to generate ECDH key pair: ${error}`);
    }
  }

  // Export public key to send to server
  static async exportPublicKey(publicKey: CryptoKey): Promise<ArrayBuffer> {
    try {
      return await window.crypto.subtle.exportKey('spki', publicKey);
    } catch (error) {
      throw new Error(`Failed to export public key: ${error}`);
    }
  }

  // Import server's public key
  static async importPublicKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    try {
      return await window.crypto.subtle.importKey(
        'spki',
        keyData,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        false,
        []
      );
    } catch (error) {
      throw new Error(`Failed to import public key: ${error}`);
    }
  }

  // Derive shared secret using ECDH
  static async deriveSharedSecret(
    privateKey: CryptoKey,
    publicKey: CryptoKey
  ): Promise<CryptoKey> {
    try {
      return await window.crypto.subtle.deriveKey(
        {
          name: 'ECDH',
          public: publicKey,
        },
        privateKey,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      throw new Error(`Failed to derive shared secret: ${error}`);
    }
  }

  // Encrypt file using AES-256-GCM
  static async encryptFile(
    file: File,
    key: CryptoKey,
    onProgress?: (progress: number) => void
  ): Promise<EncryptionResult> {
    try {
      const fileBuffer = await file.arrayBuffer();
      const nonce = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Simulate progress for large files
      if (onProgress) {
        onProgress(50);
      }
      
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
        },
        key,
        fileBuffer
      );

      if (onProgress) {
        onProgress(100);
      }

      // Split encrypted data and auth tag (last 16 bytes)
      const ciphertext = encrypted.slice(0, -16);
      const authTag = encrypted.slice(-16);

      return {
        ciphertext,
        nonce: nonce.buffer,
        authTag,
      };
    } catch (error) {
      throw new Error(`Failed to encrypt file: ${error}`);
    }
  }

  // Convert ArrayBuffer to Base64 for transmission
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Convert Base64 to ArrayBuffer
  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Verify digital signature (placeholder - would use actual server public key)
  static async verifySignature(
    data: ArrayBuffer,
    signature: ArrayBuffer,
    publicKey: CryptoKey
  ): Promise<boolean> {
    try {
      return await window.crypto.subtle.verify(
        {
          name: 'ECDSA',
          hash: 'SHA-256',
        },
        publicKey,
        signature,
        data
      );
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }
}