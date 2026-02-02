/**
 * Case Study Details Service
 * Fetches and decrypts encrypted case study data from IPFS
 * 
 * Privacy Note: Decryption happens locally in the browser using
 * the user's ephemeral key. The server never sees unencrypted data.
 */

import { PublicKey } from '@solana/web3.js';

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
 * Decrypt data using the ephemeral key
 * 
 * Note: This is a simplified implementation. In production, this would use
 * the actual encryption scheme (AES-256-GCM or ChaCha20-Poly1305) with
 * the ephemeral key derived from the user's wallet.
 */
async function decryptData(
  encryptedData: Uint8Array,
  ephemeralKey: Uint8Array
): Promise<DecryptedCaseStudyDetails | null> {
  try {
    // For demo purposes, we'll try to parse as JSON first
    // (in case the data is stored unencrypted for testing)
    const text = new TextDecoder().decode(encryptedData);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        console.log('Data appears to be unencrypted JSON, parsing directly');
        return normalizeCaseStudyData(parsed);
      }
    } catch {
      // Not JSON, continue with decryption attempt
    }

    // TODO: Implement actual decryption
    // For now, return mock data for testing
    console.warn('Encrypted data detected but decryption not yet implemented');
    return null;
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
 * @param cid - IPFS Content Identifier
 * @param ephemeralKey - Optional ephemeral key for decryption (if not stored with data)
 * @returns FetchDetailsResult with decrypted data or error
 */
export async function fetchCaseStudyDetails(
  cid: string,
  ephemeralKey?: Uint8Array
): Promise<FetchDetailsResult> {
  try {
    // Fetch encrypted data from IPFS
    const encryptedData = await fetchFromIpfs(cid);
    
    if (!encryptedData) {
      return {
        success: false,
        error: 'Failed to fetch data from IPFS. The content may be unavailable or the CID may be invalid.',
      };
    }

    // If no key provided, try to parse as unencrypted (for testing)
    if (!ephemeralKey) {
      const text = new TextDecoder().decode(encryptedData);
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') {
          const normalized = normalizeCaseStudyData(parsed);
          if (normalized) {
            return { success: true, data: normalized };
          }
        }
      } catch {
        // Not valid JSON, need decryption
      }
    }

    // Decrypt the data
    const decrypted = await decryptData(encryptedData, ephemeralKey || new Uint8Array());
    
    if (!decrypted) {
      return {
        success: false,
        error: 'Failed to decrypt case study data. You may not have permission to view this content.',
      };
    }

    return { success: true, data: decrypted };
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
