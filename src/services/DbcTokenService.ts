/**
 * DBC Token Service - DALLAS BUYERS CLUB
 * 
 * Single source of truth for all DBC token operations.
 * Follows core principles:
 * - DRY: Centralized token logic
 * - MODULAR: Composable functions
 * - CLEAN: Clear separation of concerns
 */

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { SOLANA_CONFIG } from '../config/solana';

// DBC Token Constants
export const DBC_MINT = new PublicKey(SOLANA_CONFIG.blockchain.dbcMintAddress);
export const DBC_DECIMALS = 6;
export const DBC_DECIMALS_MULTIPLIER = 10 ** DBC_DECIMALS;

// Token-2022 Program ID
export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

// Treasury Program ID (update after SolPG deployment)
// Use system program as placeholder if not configured
const treasuryProgramIdStr = SOLANA_CONFIG.blockchain.treasuryProgramId;
const isPlaceholder = treasuryProgramIdStr.includes('XXXX') || treasuryProgramIdStr.includes('XXX');
export const TREASURY_PROGRAM_ID = new PublicKey(
  isPlaceholder ? '11111111111111111111111111111111' : treasuryProgramIdStr
);

/**
 * Convert DBC amount to base units (for transactions)
 * DRY: Single conversion function used across app
 */
export function toBaseUnits(dbcAmount: number): bigint {
  return BigInt(Math.round(dbcAmount * DBC_DECIMALS_MULTIPLIER));
}

/**
 * Convert base units to DBC amount (for display)
 * DRY: Single conversion function used across app
 */
export function fromBaseUnits(baseUnits: bigint | number): number {
  const units = typeof baseUnits === 'bigint' ? Number(baseUnits) : baseUnits;
  return units / DBC_DECIMALS_MULTIPLIER;
}

/**
 * Format DBC amount for display
 * Clean: Consistent formatting across UI
 */
export function formatDbc(amount: number, options?: { compact?: boolean; maxDecimals?: number }): string {
  const { compact = false, maxDecimals = 2 } = options || {};
  
  if (compact && amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M DBC`;
  }
  if (compact && amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K DBC`;
  }
  
  return `${amount.toLocaleString(undefined, { 
    maximumFractionDigits: maxDecimals 
  })} DBC`;
}

/**
 * Get associated token account address for DBC
 * DRY: Single function for ATA derivation
 */
export async function getDbcTokenAccount(owner: PublicKey): Promise<PublicKey> {
  const { getAssociatedTokenAddress } = await import('@solana/spl-token');
  return getAssociatedTokenAddress(DBC_MINT, owner, false, TOKEN_2022_PROGRAM_ID);
}

/**
 * Check if DBC token account exists
 */
export async function checkDbcAccountExists(
  connection: Connection,
  owner: PublicKey
): Promise<{ exists: boolean; balance: number; address: PublicKey }> {
  try {
    const tokenAccount = await getDbcTokenAccount(owner);
    
    try {
      const accountInfo = await connection.getTokenAccountBalance(tokenAccount);
      return {
        exists: true,
        balance: Number(accountInfo.value.uiAmount) || 0,
        address: tokenAccount,
      };
    } catch {
      // Account doesn't exist
      return {
        exists: false,
        balance: 0,
        address: tokenAccount,
      };
    }
  } catch (error) {
    console.error('Error checking DBC account:', error);
    throw error;
  }
}

/**
 * Create DBC token account (if needed)
 */
export async function createDbcAccountInstruction(
  owner: PublicKey,
  payer: PublicKey
): Promise<Transaction> {
  const { createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');
  
  const tokenAccount = await getDbcTokenAccount(owner);
  
  const instruction = createAssociatedTokenAccountInstruction(
    payer,
    tokenAccount,
    owner,
    DBC_MINT,
    TOKEN_2022_PROGRAM_ID
  );
  
  return new Transaction().add(instruction);
}

/**
 * Fetch DBC balance with caching support
 * Performant: Minimizes RPC calls
 */
export async function fetchDbcBalance(
  connection: Connection,
  owner: PublicKey
): Promise<{ balance: number; address: PublicKey | null }> {
  try {
    const { exists, balance, address } = await checkDbcAccountExists(connection, owner);
    
    if (!exists) {
      return { balance: 0, address: null };
    }
    
    return { balance, address };
  } catch (error) {
    console.error('Error fetching DBC balance:', error);
    return { balance: 0, address: null };
  }
}

// ============= Treasury Program Integration =============

/**
 * Treasury account PDA
 */
export function getTreasuryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury'), DBC_MINT.toBuffer()],
    TREASURY_PROGRAM_ID
  );
}

/**
 * Validator reputation PDA
 */
export function getValidatorReputationPDA(validator: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('reputation'), validator.toBuffer()],
    TREASURY_PROGRAM_ID
  );
}

/**
 * Stake account PDA
 */
export function getStakePDA(validator: PublicKey, timestamp: bigint): [PublicKey, number] {
  const timestampBytes = Buffer.alloc(8);
  timestampBytes.writeBigInt64LE(timestamp);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('stake'), validator.toBuffer(), timestampBytes],
    TREASURY_PROGRAM_ID
  );
}

// ============= Reward Configuration =============
// Aligned with dbc_common::REWARD_CONFIG

/**
 * Default reward amounts (in DBC)
 * DRY: Single source of truth for rewards
 * Updated for 10-year emission schedule
 */
export const REWARD_AMOUNTS = {
  BASE_SUBMISSION: 50,        // 50 DBC (was 10)
  MAX_SUBMISSION: 100,        // 100 DBC with perfect quality
  BASE_VALIDATION: 25,        // 25 DBC (was 5)
  MAX_VALIDATION: 50,         // 50 DBC with 100% accuracy
  QUALITY_BONUS_PERCENT: 100, // Up to 100% bonus (2x total)
  REFERRAL: 100,              // 100 DBC per referral
} as const;

/**
 * Emission schedule for transparency
 * Shows community how tokens are distributed over time
 */
export const EMISSION_SCHEDULE = [
  { year: 1, dailyCaseStudy: 5_000, dailyValidation: 2_500, description: "Bootstrap Phase" },
  { year: 2, dailyCaseStudy: 10_000, dailyValidation: 5_000, description: "Growth Phase" },
  { year: 3, dailyCaseStudy: 15_000, dailyValidation: 7_500, description: "Expansion Phase" },
  { year: 4, dailyCaseStudy: 12_000, dailyValidation: 6_000, description: "Stabilization" },
  { year: 5, dailyCaseStudy: 10_000, dailyValidation: 5_000, description: "Maturity" },
  { year: 6, dailyCaseStudy: 8_000, dailyValidation: 4_000, description: "Sustainability" },
  { year: 7, dailyCaseStudy: 6_000, dailyValidation: 3_000, description: "Sustainability" },
  { year: 8, dailyCaseStudy: 5_000, dailyValidation: 2_500, description: "Long-term" },
  { year: 9, dailyCaseStudy: 4_000, dailyValidation: 2_000, description: "Long-term" },
  { year: 10, dailyCaseStudy: 3_000, dailyValidation: 1_500, description: "Legacy Phase" },
] as const;

/**
 * Calculate case study reward based on quality score
 * Max 2x base reward for perfect quality
 */
export function calculateSubmissionReward(qualityScore: number): number {
  const clampedScore = Math.max(0, Math.min(100, qualityScore));
  const bonus = (REWARD_AMOUNTS.BASE_SUBMISSION * clampedScore * REWARD_AMOUNTS.QUALITY_BONUS_PERCENT) / 10000;
  return Math.min(REWARD_AMOUNTS.BASE_SUBMISSION + bonus, REWARD_AMOUNTS.MAX_SUBMISSION);
}

/**
 * Calculate validator reward based on count and accuracy
 * Max 2x base reward per validation for 100% accuracy
 */
export function calculateValidatorReward(validationCount: number, accuracyRate: number): number {
  const clampedAccuracy = Math.max(0, Math.min(100, accuracyRate));
  const baseReward = REWARD_AMOUNTS.BASE_VALIDATION * validationCount;
  const bonus = (baseReward * clampedAccuracy) / 100; // 0-100% bonus
  return Math.min(baseReward + bonus, REWARD_AMOUNTS.MAX_VALIDATION * validationCount);
}

/**
 * Get current emission year info
 */
export function getCurrentEmissionYear(): typeof EMISSION_SCHEDULE[number] {
  // For now, return year 1 (bootstrap)
  // In production, calculate from treasury initialization timestamp
  return EMISSION_SCHEDULE[0];
}

// ============= Tier System =============

export type ValidatorTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface TierThreshold {
  minValidations: number;
  minAccuracy: number;
  color: string;
  icon: string;
}

export const TIER_THRESHOLDS: Record<ValidatorTier, TierThreshold> = {
  Bronze: { minValidations: 0, minAccuracy: 0, color: '#CD7F32', icon: '🥉' },
  Silver: { minValidations: 25, minAccuracy: 60, color: '#C0C0C0', icon: '🥈' },
  Gold: { minValidations: 100, minAccuracy: 70, color: '#FFD700', icon: '🥇' },
  Platinum: { minValidations: 500, minAccuracy: 80, color: '#E5E4E2', icon: '💎' },
};

/**
 * Calculate validator tier
 */
export function calculateTier(totalValidations: number, accuracyRate: number): ValidatorTier {
  if (totalValidations >= TIER_THRESHOLDS.Platinum.minValidations && 
      accuracyRate >= TIER_THRESHOLDS.Platinum.minAccuracy) {
    return 'Platinum';
  }
  if (totalValidations >= TIER_THRESHOLDS.Gold.minValidations && 
      accuracyRate >= TIER_THRESHOLDS.Gold.minAccuracy) {
    return 'Gold';
  }
  if (totalValidations >= TIER_THRESHOLDS.Silver.minValidations && 
      accuracyRate >= TIER_THRESHOLDS.Silver.minAccuracy) {
    return 'Silver';
  }
  return 'Bronze';
}

// ============= Staking Configuration =============

export const STAKING_CONFIG = {
  MINIMUM_STAKE: 100,           // 100 DBC minimum
  LOCK_DAYS: 7,                 // 7 day lock period
  SLASH_BURN_PERCENT: 50,       // 50% of slash burned
  SLASH_TREASURY_PERCENT: 50,   // 50% to treasury
} as const;

// ============= Export Service =============

export const DbcTokenService = {
  // Constants
  DBC_MINT,
  DBC_DECIMALS,
  TOKEN_2022_PROGRAM_ID,
  TREASURY_PROGRAM_ID,
  
  // Conversion
  toBaseUnits,
  fromBaseUnits,
  formatDbc,
  
  // Account Management
  getDbcTokenAccount,
  checkDbcAccountExists,
  createDbcAccountInstruction,
  fetchDbcBalance,
  
  // PDAs
  getTreasuryPDA,
  getValidatorReputationPDA,
  getStakePDA,
  
  // Rewards
  REWARD_AMOUNTS,
  EMISSION_SCHEDULE,
  calculateSubmissionReward,
  calculateValidatorReward,
  getCurrentEmissionYear,
  
  // Tiers
  TIER_THRESHOLDS,
  calculateTier,
  
  // Staking
  STAKING_CONFIG,
} as const;

export default DbcTokenService;
