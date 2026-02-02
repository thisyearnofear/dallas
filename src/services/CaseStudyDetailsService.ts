/**
 * Case Study Details Service
 * Fetches and decrypts encrypted case study data from IPFS
 * 
 * Privacy Architecture:
 * - Data is encrypted client-side before IPFS upload
 * - Encryption key derived from wallet signature (deterministic)
 * - Only the wallet owner can derive the key and decrypt
 * - Platform never sees plaintext or encryption keys
 * - All decryption happens locally in user's browser
 */

import { PublicKey } from '@solana/web3.js';
import { decryptHealthData, deriveEncryptionKey } from '../utils/encryption';

// IPFS Gateway URLs (fallback order)
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs',
  'https://gateway.ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://dweb.link/ipfs',
];

export interface DecryptedCaseStudyDetails {
  // Treatment information
  treatmentProtocol: string;
  treatmentCategory: string;
  durationDays: number;
  costUSD?: number;
  
  // Symptoms (baseline)
  symptoms: {
    name: string;
    severity: number; // 1-10
    frequency: string;
  }[];
  
  // Outcomes
  outcomes: {
    metric: string;
    baseline: number;
    afterTreatment: number;
    unit: string;
  }[];
  
  // Additional data
  sideEffects?: string[];
  notes?: string;
  
  // Metadata
  submittedAt: string;
  submitterPubkey: string;
}

export interface FetchDetailsResult {
  success: boolean;
  data?: DecryptedCaseStudyDetails;
  error?: string;
  requiresWallet?: boolean;
}

/**
 * Fetch encrypted data from IPFS with fallback gateways
 */
async function fetchFromIpfs(cid: string): Promise<Uint8Array | null> {
  // Validate CID format
  if (!cid || cid.length < 10) {
    console.error('Invalid IPFS CID:', cid);
    return null;
  }

  // Try each gateway in order
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}/${cid}`;
      console.log(`Fetching from IPFS: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, */*',
        },
      });

      if (!response.ok) {
        console.warn(`IPFS gateway ${gateway} returned ${response.status}`);
        continue;
      }

      const data = new Uint8Array(await response.arrayBuffer());
      console.log(`Successfully fetched ${data.length} bytes from ${gateway}`);
      return data;
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}:`, error);
      continue;
    }
  }

  console.error('All IPFS gateways failed');
  return null;
}

/**
 * Detect if data is encrypted (base64 with nonce) or plaintext JSON
 */
function detectDataFormat(data: Uint8Array): 'encrypted' | 'json' | 'unknown' {
  const text = new TextDecoder().decode(data);
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return 'json';
    }
  } catch {
    // Not JSON, might be encrypted
  }
  
  // Check if it's valid base64 (encrypted data format)
  try {
    const decoded = Buffer.from(text, 'base64');
    // Encrypted data: nonce (24 bytes) + ciphertext (at least 16 bytes for secretbox overhead)
    if (decoded.length >= 40) {
      return 'encrypted';
    }
  } catch {
    // Not valid base64
  }
  
  return 'unknown';
}

/**
 * Decrypt data using wallet-derived key
 * 
 * Privacy: This requires user's wallet signature to derive the decryption key.
 * The platform never sees the key - it's derived locally and used immediately.
 */
async function decryptWithWallet(
  encryptedBase64: string,
  walletPublicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<DecryptedCaseStudyDetails | null> {
  try {
    // Derive encryption key from wallet (deterministic - same wallet = same key)
    const encryptionKey = await deriveEncryptionKey(walletPublicKey, signMessage);
    
    // Decrypt the data
    const decryptedJson = decryptHealthData(encryptedBase64, encryptionKey);
    
    // Parse the decrypted JSON
    const parsed = JSON.parse(decryptedJson);
    return normalizeCaseStudyData(parsed);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Normalize various data formats to DecryptedCaseStudyDetails
 */
function normalizeCaseStudyData(data: any): DecryptedCaseStudyDetails | null {
  if (!data) return null;

  return {
    treatmentProtocol: data.treatmentProtocol || data.protocol || data.treatment || 'Unknown',
    treatmentCategory: data.treatmentCategory || data.category || 'Other',
    durationDays: data.durationDays || data.duration || 0,
    costUSD: data.costUSD || data.cost,
    symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
    outcomes: Array.isArray(data.outcomes) ? data.outcomes : 
              Array.isArray(data.metrics) ? data.metrics.map((m: any) => ({
                metric: m.name || m.metric,
                baseline: m.baseline || m.before || 0,
                afterTreatment: m.after || m.afterTreatment || 0,
                unit: m.unit || '',
              })) : [],
    sideEffects: Array.isArray(data.sideEffects) ? data.sideEffects : undefined,
    notes: data.notes || data.additionalNotes,
    submittedAt: data.submittedAt || data.createdAt || new Date().toISOString(),
    submitterPubkey: data.submitterPubkey || data.submitter || '',
  };
}

/**
 * Fetch and decrypt case study details from IPFS
 * 
 * Privacy Model:
 * 1. Fetches encrypted blob from IPFS (public, but encrypted)
 * 2. If data is plaintext JSON (testing), returns it directly
 * 3. If encrypted: requires wallet signature to derive decryption key
 * 4. Decryption happens locally - key never leaves browser
 * 
 * @param cid - IPFS Content Identifier
 * @param walletPublicKey - User's wallet public key (to derive key)
 * @param signMessage - Wallet sign function (to derive key)
 * @returns FetchDetailsResult with decrypted data or error
 */
export async function fetchCaseStudyDetails(
  cid: string,
  walletPublicKey?: PublicKey,
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>
): Promise<FetchDetailsResult> {
  try {
    // Fetch encrypted data from IPFS
    const data = await fetchFromIpfs(cid);
    
    if (!data) {
      return {
        success: false,
        error: 'Failed to fetch data from IPFS. The content may be unavailable or the CID may be invalid.',
      };
    }

    // Detect data format
    const format = detectDataFormat(data);
    console.log(`Detected data format: ${format}`);

    if (format === 'json') {
      // Unencrypted JSON (testing mode)
      const text = new TextDecoder().decode(data);
      const parsed = JSON.parse(text);
      const normalized = normalizeCaseStudyData(parsed);
      
      if (normalized) {
        return { success: true, data: normalized };
      }
      
      return {
        success: false,
        error: 'Invalid data format received from IPFS.',
      };
    }

    if (format === 'encrypted') {
      // Encrypted data - need wallet to decrypt
      if (!walletPublicKey || !signMessage) {
        return {
          success: false,
          requiresWallet: true,
          error: 'This case study is encrypted. Please connect your wallet to decrypt and view your data.',
        };
      }

      const encryptedBase64 = new TextDecoder().decode(data);
      const decrypted = await decryptWithWallet(
        encryptedBase64,
        walletPublicKey,
        signMessage
      );
      
      if (!decrypted) {
        return {
          success: false,
          error: 'Decryption failed. This may not be your case study, or the data may be corrupted.',
        };
      }

      return { success: true, data: decrypted };
    }

    return {
      success: false,
      error: 'Unknown data format. The case study data may be corrupted or stored in an unsupported format.',
    };
  } catch (error) {
    console.error('Error fetching case study details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if a CID is valid
 */
export function isValidCid(cid: string): boolean {
  if (!cid || typeof cid !== 'string') return false;
  
  // IPFS v0 CIDs start with 'Qm' and are 46 characters
  // IPFS v1 CIDs start with 'bafy' or similar
  return (
    (cid.startsWith('Qm') && cid.length === 46) ||
    (cid.startsWith('bafy') && cid.length >= 50)
  );
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getIpfsUrl(cid: string, gatewayIndex = 0): string {
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}/${cid}`;
}
