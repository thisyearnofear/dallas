/**
 * Solana Utility Functions
 * Helper functions for Solana blockchain interactions
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { parseOptimizationLogAccount as parseFullOptimizationLogAccount, ParsedOptimizationLog } from './optimizationLogParser';

// Re-export the parser under both names for backward compatibility
export { parseOptimizationLogAccount, parseOptimizationLogAccount as parseFullOptimizationLogAccount, type ParsedOptimizationLog } from './optimizationLogParser';

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
