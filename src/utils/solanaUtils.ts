/**
 * Solana Utility Functions
 * Helper functions for Solana blockchain interactions
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { parseOptimizationLogAccount as parseFullOptimizationLogAccount, ParsedOptimizationLog } from './optimizationLogParser';

// Re-export the full parser
export { parseOptimizationLogAccount as parseFullOptimizationLogAccount, type ParsedOptimizationLog } from './optimizationLogParser';

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
 * 
 * DEPRECATED: Use parseFullOptimizationLogAccount from './optimizationLogParser' for full parsing
 * This simplified version is kept for backward compatibility
 */
export function parseOptimizationLogAccount(data: Buffer): {
  submitter: PublicKey;
  reputationScore: number;
  approvalCount: number;
  rejectionCount: number;
  attentionTokenMint?: PublicKey;
} {
  // Use the full parser for accuracy
  const pubkey = new PublicKey('11111111111111111111111111111111'); // Dummy pubkey for parsing
  const parsed = parseFullOptimizationLogAccount(data, pubkey);
  
  if (!parsed) {
    throw new Error('Failed to parse optimization log account');
  }
  
  return {
    submitter: parsed.submitter,
    reputationScore: parsed.reputationScore,
    approvalCount: parsed.approvalCount,
    rejectionCount: parsed.rejectionCount,
    attentionTokenMint: parsed.attentionTokenMint || undefined,
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
