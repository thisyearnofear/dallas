// Encryption Service - Secure Data Handling
// Core Principles: CLEAN, MODULAR, PERFORMANT

export class EncryptionService {
  private key: CryptoKey | null = null;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_STORAGE_KEY = 'dallas_secure_key';
  private isDerived = false;

  async initialize(): Promise<void> {
    if (this.key) return; // Already initialized

    // Try to load existing session key first
    const storedKey = localStorage.getItem(this.KEY_STORAGE_KEY);
    if (storedKey) {
      try {
        this.key = await this.importKey(storedKey);
        return;
      } catch (e) {
        console.error('Failed to import stored key, generating new one', e);
      }
    }
    
    // Generate new session key if none exists
    this.key = await this.generateKey();
    const exported = await this.exportKey(this.key);
    localStorage.setItem(this.KEY_STORAGE_KEY, exported);
  }

  // ENHANCEMENT: Wallet-Derived Key Generation
  // Uses the wallet signature as a seed to deterministically derive the encryption key
  async initializeWithSignature(signature: Uint8Array): Promise<void> {
    try {
      // 1. Import signature as key material
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        signature as unknown as BufferSource,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      // 2. Derive AES-GCM key using PBKDF2
      // We use a fixed salt because the signature itself is unique and high-entropy
      // This allows deterministic regeneration of the same key from the same signature
      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode('dallas-buyers-club-salt-v1') as unknown as BufferSource,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true, // Extractable for debugging, but in prod could be false
        ['encrypt', 'decrypt']
      );

      this.key = derivedKey;
      this.isDerived = true;
      console.log('🔐 Wallet-Derived Key generated successfully');

      // Clear the insecure session key if it exists
      localStorage.removeItem(this.KEY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to derive key from signature:', error);
      throw new Error('Key derivation failed');
    }
  }

  isWalletKeyActive(): boolean {
    return this.isDerived;
  }

  async encrypt(data: string): Promise<string> {
    if (!this.key) await this.initialize();
    
    const encodedData = new TextEncoder().encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      this.key!,
      encodedData as unknown as BufferSource
    );

    // Combine IV and encrypted data for storage
    const combined = new Uint8Array(iv.length + new Uint8Array(encryptedContent).length);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedContent), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  async decrypt(encryptedString: string): Promise<string> {
    if (!this.key) await this.initialize();

    try {
      const combined = new Uint8Array(this.base64ToArrayBuffer(encryptedString));
      
      // Extract IV (first 12 bytes)
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.key!,
        data as unknown as BufferSource
      );

      return new TextDecoder().decode(decryptedContent);
    } catch (e) {
      console.error('Decryption failed:', e);
      throw new Error('Failed to decrypt data');
    }
  }

  // Key Management Helpers
  private async generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('jwk', key);
    return JSON.stringify(exported);
  }

  private async importKey(keyString: string): Promise<CryptoKey> {
    const jwk = JSON.parse(keyString);
    return window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: this.ALGORITHM,
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Utility Helpers
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const encryptionService = new EncryptionService();
