/**
 * Case Study Account Parser
 * 
 * Parses Anchor program account data for the CaseStudy struct.
 * The struct stores metadata on-chain, with encrypted data on IPFS.
 * 
 * Rust struct layout (from programs/case_study/src/lib.rs):
 * ```rust
 * pub struct CaseStudy {
 *     pub ephemeral_id: Pubkey,              // 32 bytes
 *     pub submitter: Pubkey,                 // 32 bytes
 *     pub ipfs_cid: String,                  // 4 + len bytes
 *     pub metadata_hash: [u8; 32],           // 32 bytes
 *     pub treatment_category: u8,            // 1 byte
 *     pub duration_days: u16,                // 2 bytes
 *     pub created_at: i64,                   // 8 bytes
 *     pub validation_status: ValidationStatus, // 1 byte (enum)
 *     pub approval_count: u32,               // 4 bytes
 *     pub rejection_count: u32,              // 4 bytes
 *     pub reputation_score: u8,              // 1 byte
 *     pub is_paused: bool,                   // 1 byte
 *     pub threshold_shares_required: u8,     // 1 byte
 *     pub light_proof_hash: [u8; 32],        // 32 bytes
 *     pub compression_ratio: u16,            // 2 bytes
 *     pub attention_token_mint: Option<Pubkey>, // 1 + 32 bytes (if Some)
 *     pub attention_token_created_at: Option<i64>, // 1 + 8 bytes (if Some)
 *     pub bump: u8,                          // 1 byte
 * }
 * ```
 */

import { PublicKey } from '@solana/web3.js';

// Anchor discriminator size (8 bytes)
const ANCHOR_DISCRIMINATOR_SIZE = 8;

// ValidationStatus enum mapping
export enum ValidationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  UnderReview = 3,
}

// Treatment category mapping (from Rust)
export enum TreatmentCategory {
  Pharmaceutical = 0,
  Lifestyle = 1,
  Alternative = 2,
  Surgical = 3,
  Other = 4,
}

export interface ParsedCaseStudy {
  // Core identifiers
  ephemeralId: PublicKey;
  submitter: PublicKey;
  
  // IPFS reference (encrypted data stored off-chain)
  ipfsCid: string;
  
  // Metadata
  metadataHash: Uint8Array;
  treatmentCategory: TreatmentCategory;
  treatmentCategoryName: string;
  durationDays: number;
  createdAt: Date;
  
  // Validation state
  validationStatus: ValidationStatus;
  validationStatusName: string;
  approvalCount: number;
  rejectionCount: number;
  reputationScore: number;
  
  // Control flags
  isPaused: boolean;
  thresholdSharesRequired: number;
  
  // Privacy/Compression
  lightProofHash: Uint8Array;
  compressionRatio: number;
  
  // Attention token (optional)
  attentionTokenMint: PublicKey | null;
  attentionTokenCreatedAt: Date | null;
  hasAttentionToken: boolean;
  
  // Anchor bump
  bump: number;
}

// Treatment category names for display
const TREATMENT_CATEGORY_NAMES: Record<TreatmentCategory, string> = {
  [TreatmentCategory.Pharmaceutical]: 'Pharmaceutical',
  [TreatmentCategory.Lifestyle]: 'Lifestyle',
  [TreatmentCategory.Alternative]: 'Alternative',
  [TreatmentCategory.Surgical]: 'Surgical',
  [TreatmentCategory.Other]: 'Other',
};

// Validation status names for display
const VALIDATION_STATUS_NAMES: Record<ValidationStatus, string> = {
  [ValidationStatus.Pending]: 'Pending',
  [ValidationStatus.Approved]: 'Approved',
  [ValidationStatus.Rejected]: 'Rejected',
  [ValidationStatus.UnderReview]: 'Under Review',
};

/**
 * Parse a CaseStudy account from buffer data
 * 
 * @param data - Raw account data from Solana (includes 8-byte Anchor discriminator)
 * @param pubkey - The account's public key
 * @returns Parsed case study or null if parsing fails
 */
export function parseCaseStudyAccount(
  data: Buffer,
  pubkey: PublicKey
): ParsedCaseStudy | null {
  try {
    // Minimum size check (discriminator + fixed-size fields)
    // Fixed fields: 32+32+4+32+1+2+8+1+4+4+1+1+1+32+2+1+1 = 158 bytes minimum
    // Plus variable-length ipfs_cid string
    if (data.length < ANCHOR_DISCRIMINATOR_SIZE + 158) {
      console.warn(`Account data too small: ${data.length} bytes`);
      return null;
    }

    // Skip Anchor discriminator (first 8 bytes)
    let offset = ANCHOR_DISCRIMINATOR_SIZE;
    const accountData = data;

    // Helper to read pubkey (32 bytes)
    const readPubkey = (): PublicKey => {
      const key = new PublicKey(accountData.slice(offset, offset + 32));
      offset += 32;
      return key;
    };

    // ephemeral_id: Pubkey (32 bytes)
    const ephemeralId = readPubkey();

    // submitter: Pubkey (32 bytes)
    const submitter = readPubkey();

    // ipfs_cid: String (4 byte length prefix + UTF-8 bytes)
    const ipfsCidLen = accountData.readUInt32LE(offset);
    offset += 4;
    
    // Sanity check on string length (IPFS CIDs are typically 46-60 characters)
    if (ipfsCidLen < 1 || ipfsCidLen > 100) {
      console.warn(`Invalid IPFS CID length: ${ipfsCidLen}`);
      return null;
    }
    
    const ipfsCid = accountData.slice(offset, offset + ipfsCidLen).toString('utf8');
    offset += ipfsCidLen;

    // metadata_hash: [u8; 32]
    const metadataHash = new Uint8Array(accountData.slice(offset, offset + 32));
    offset += 32;

    // treatment_category: u8
    const treatmentCategory = accountData.readUInt8(offset) as TreatmentCategory;
    offset += 1;

    // duration_days: u16 (2 bytes, little-endian)
    const durationDays = accountData.readUInt16LE(offset);
    offset += 2;

    // created_at: i64 (8 bytes, little-endian)
    const createdAtTimestamp = Number(accountData.readBigInt64LE(offset));
    offset += 8;

    // validation_status: ValidationStatus (u8 enum)
    const validationStatus = accountData.readUInt8(offset) as ValidationStatus;
    offset += 1;

    // approval_count: u32 (4 bytes, little-endian)
    const approvalCount = accountData.readUInt32LE(offset);
    offset += 4;

    // rejection_count: u32 (4 bytes, little-endian)
    const rejectionCount = accountData.readUInt32LE(offset);
    offset += 4;

    // reputation_score: u8
    const reputationScore = accountData.readUInt8(offset);
    offset += 1;

    // is_paused: bool (1 byte, 0 or 1)
    const isPaused = accountData.readUInt8(offset) === 1;
    offset += 1;

    // threshold_shares_required: u8
    const thresholdSharesRequired = accountData.readUInt8(offset);
    offset += 1;

    // light_proof_hash: [u8; 32]
    const lightProofHash = new Uint8Array(accountData.slice(offset, offset + 32));
    offset += 32;

    // compression_ratio: u16 (2 bytes, little-endian)
    const compressionRatio = accountData.readUInt16LE(offset);
    offset += 2;

    // attention_token_mint: Option<Pubkey> (1 byte discriminant + 32 bytes if Some)
    const hasAttentionTokenMint = accountData.readUInt8(offset) === 1;
    offset += 1;
    
    let attentionTokenMint: PublicKey | null = null;
    if (hasAttentionTokenMint) {
      attentionTokenMint = readPubkey();
    }

    // attention_token_created_at: Option<i64> (1 byte discriminant + 8 bytes if Some)
    const hasAttentionTokenCreatedAt = accountData.readUInt8(offset) === 1;
    offset += 1;
    
    let attentionTokenCreatedAt: number | null = null;
    if (hasAttentionTokenCreatedAt) {
      attentionTokenCreatedAt = Number(accountData.readBigInt64LE(offset));
      offset += 8;
    }

    // bump: u8
    const bump = accountData.readUInt8(offset);
    offset += 1;

    // Build and return parsed account
    return {
      ephemeralId,
      submitter,
      ipfsCid,
      metadataHash,
      treatmentCategory,
      treatmentCategoryName: TREATMENT_CATEGORY_NAMES[treatmentCategory] || 'Unknown',
      durationDays,
      createdAt: new Date(createdAtTimestamp * 1000),
      validationStatus,
      validationStatusName: VALIDATION_STATUS_NAMES[validationStatus] || 'Unknown',
      approvalCount,
      rejectionCount,
      reputationScore,
      isPaused,
      thresholdSharesRequired,
      lightProofHash,
      compressionRatio,
      attentionTokenMint,
      attentionTokenCreatedAt: attentionTokenCreatedAt ? new Date(attentionTokenCreatedAt * 1000) : null,
      hasAttentionToken: attentionTokenMint !== null,
      bump,
    };
  } catch (error) {
    console.error('Failed to parse case study account:', error);
    return null;
  }
}

/**
 * Parse multiple case study accounts
 * 
 * @param accounts - Array of { pubkey, account } from getProgramAccounts
 * @returns Array of successfully parsed case studies
 */
export function parseCaseStudyAccounts(
  accounts: Array<{ pubkey: PublicKey; account: { data: Buffer } }>
): ParsedCaseStudy[] {
  const parsed: ParsedCaseStudy[] = [];

  for (const { pubkey, account } of accounts) {
    const caseStudy = parseCaseStudyAccount(account.data, pubkey);
    if (caseStudy) {
      parsed.push(caseStudy);
    }
  }

  return parsed;
}

/**
 * Get the minimum account size for a CaseStudy
 * Used for filtering accounts in getProgramAccounts
 */
export function getCaseStudyMinAccountSize(): number {
  // Minimum size with empty strings and None options
  // discriminator + fixed fields + empty string (4 bytes) + None options (2 bytes) + bump
  return ANCHOR_DISCRIMINATOR_SIZE + 158;
}

/**
 * Format IPFS CID to a gateway URL
 */
export function getIpfsUrl(cid: string, path = ''): string {
  // Use a public IPFS gateway
  const gateway = 'https://ipfs.io/ipfs';
  return `${gateway}/${cid}${path}`;
}

/**
 * Check if an IPFS CID is valid
 */
export function isValidIpfsCid(cid: string): boolean {
  // IPFS CIDs typically start with 'Qm' (v0) or are base32 encoded (v1)
  return typeof cid === 'string' && (cid.startsWith('Qm') || cid.startsWith('bafy'));
}
