/**
 * Solana Utility Functions
 * Helper functions for Solana blockchain interactions
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';

/**
 * Get Anchor provider from connection and wallet
 */
export function getProvider(connection: Connection, wallet?: any): AnchorProvider {
  // If wallet is provided, use it; otherwise create a read-only provider
  if (wallet && wallet.publicKey) {
    return new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
  }
  
  // Read-only provider for queries
  return new AnchorProvider(
    connection,
    {} as any, // Dummy wallet for read-only operations
    { commitment: 'confirmed' }
  );
}

/**
 * Parse Solana account data with proper deserialization
 */
export function parseCaseStudyAccount(data: Buffer): {
  submitter: PublicKey;
  reputationScore: number;
  approvalCount: number;
  rejectionCount: number;
  attentionTokenMint?: PublicKey;
} {
  // Account structure (after 8-byte discriminator):
  // - submitter: 32 bytes (Pubkey)
  // - encrypted_data_uri: 4 (length) + up to 46 bytes (string)
  // - validation_status: 1 byte (enum)
  // - reputation_score: 1 byte (u8)
  // - approval_count: 1 byte (u8)
  // - rejection_count: 1 byte (u8)
  // - ... (other fields)
  // - attention_token_mint: 1 + 32 bytes (Option<Pubkey>)
  // - attention_token_created_at: 1 + 8 bytes (Option<i64>)
  
  let offset = 8; // Skip discriminator
  
  // Parse submitter (32 bytes)
  const submitter = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;
  
  // Parse encrypted_data_uri (4 bytes length + string)
  const uriLength = data.readUInt32LE(offset);
  offset += 4 + uriLength;
  
  // Parse validation_status (1 byte) - skip
  offset += 1;
  
  // Parse reputation_score (1 byte)
  const reputationScore = data.readUInt8(offset);
  offset += 1;
  
  // Parse approval_count (1 byte)
  const approvalCount = data.readUInt8(offset);
  offset += 1;
  
  // Parse rejection_count (1 byte)
  const rejectionCount = data.readUInt8(offset);
  offset += 1;
  
  // Skip other fields to get to attention_token_mint
  // light_proof_hash: 32 bytes
  // compression_ratio: 2 bytes
  offset += 32 + 2;
  
  // Parse attention_token_mint (Option<Pubkey>)
  const hasAttentionToken = data.readUInt8(offset) === 1;
  offset += 1;
  
  let attentionTokenMint: PublicKey | undefined;
  if (hasAttentionToken) {
    attentionTokenMint = new PublicKey(data.slice(offset, offset + 32));
  }
  
  return {
    submitter,
    reputationScore,
    approvalCount,
    rejectionCount,
    attentionTokenMint,
  };
}

/**
 * Validate PublicKey string
 */
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
