import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

/**
 * Derive a stable encryption key from wallet public key + signature
 * User signs a message with their wallet → use signature as key entropy
 * Same wallet will always produce same key (deterministic)
 */
export async function deriveEncryptionKey(
  walletPublicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<Uint8Array> {
  // Message to sign - includes wallet address to prevent reuse across wallets
  const message = new TextEncoder().encode(
    `Dallas Health Sovereignty - Encryption Key\nWallet: ${walletPublicKey.toString()}`
  );

  // Get signature (user controls this via their wallet)
  const signature = await signMessage(message);

  // Use first 32 bytes of signature as encryption key
  // nacl.secretbox uses 32-byte keys
  return signature.slice(0, 32);
}

/**
 * Encrypt health data with user's derived key
 * Returns base64 string: nonce (24 bytes) + ciphertext
 */
export function encryptHealthData(
  data: string,
  encryptionKey: Uint8Array
): string {
  if (encryptionKey.length !== 32) {
    throw new Error('Encryption key must be 32 bytes');
  }

  const messageBytes = new TextEncoder().encode(data);
  const nonce = nacl.randomBytes(24);

  const encrypted = nacl.secretbox(messageBytes, nonce, encryptionKey);
  if (!encrypted) {
    throw new Error('Encryption failed');
  }

  // Combine nonce + ciphertext
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);

  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypt health data with user's derived key
 */
export function decryptHealthData(
  encrypted: string,
  encryptionKey: Uint8Array
): string {
  if (encryptionKey.length !== 32) {
    throw new Error('Encryption key must be 32 bytes');
  }

  const combined = Buffer.from(encrypted, 'base64');
  if (combined.length < 24) {
    throw new Error('Invalid encrypted data (too short)');
  }

  const nonce = combined.slice(0, 24);
  const ciphertext = combined.slice(24);

  const decrypted = nacl.secretbox.open(
    ciphertext as any,
    nonce as any,
    encryptionKey
  );

  if (!decrypted) {
    throw new Error('Decryption failed - wrong key or corrupted data');
  }

  return new TextDecoder().decode(decrypted);
}

/**
 * Check if a string is valid base64 encrypted data
 */
export function isValidEncryptedData(data: string): boolean {
  try {
    const decoded = Buffer.from(data, 'base64');
    return decoded.length >= 24; // At least nonce
  } catch {
    return false;
  }
}
