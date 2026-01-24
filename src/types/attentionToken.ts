/**
 * Attention Token Types for Dallas Buyers Club
 * Treatment-specific tokens created via Bags API for market discovery
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Attention Token Metadata
 */
export interface AttentionToken {
  // On-chain identifiers
  mint: PublicKey;
  bondingCurve: PublicKey;
  caseStudyPda: PublicKey;
  
  // Token information
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  
  // Stakeholder addresses
  submitter: PublicKey;
  validators: ValidatorInfo[];
  
  // Metadata
  treatmentName: string;
  treatmentCategory: string;
  reputationScore: number;
  createdAt: number;
  
  // Market data (from Bags API)
  analytics?: AttentionTokenAnalytics;
}

/**
 * Validator information for fee distribution
 */
export interface ValidatorInfo {
  publicKey: PublicKey;
  reputation: number;
  contribution: number; // percentage of validation work
}

/**
 * Attention Token Analytics (from Bags API)
 */
export interface AttentionTokenAnalytics {
  marketCap: number;
  volume24h: number;
  volumeAll: number;
  holders: number;
  price: number;
  priceChange24h: number;
  lifetimeFees: number;
  transactions: number;
  createdAt: number;
  lastTradeAt: number;
}

/**
 * Attention Token Creation Parameters
 */
export interface CreateAttentionTokenParams {
  caseStudyPda: PublicKey;
  treatmentName: string;
  treatmentCategory: string;
  description: string;
  imageUrl: string;
  submitter: PublicKey;
  validators: ValidatorInfo[];
  reputationScore: number;
}

/**
 * Bags API Token Launch Request
 */
export interface BagsTokenLaunchRequest {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  metadata: {
    caseStudyPda: string;
    submitter: string;
    validators: string[];
    reputationScore: number;
    treatmentName: string;
    treatmentCategory: string;
  };
  initialBuy?: {
    amount: number; // lamports
    buyerPublicKey: string;
  };
}

/**
 * Bags API Token Launch Response
 */
export interface BagsTokenLaunchResponse {
  success: boolean;
  response?: {
    mint: string;
    bondingCurve: string;
    signature: string;
  };
  error?: string;
}

/**
 * Bags API Fee Sharing Configuration
 */
export interface BagsFeeShareConfig {
  tokenMint: string;
  recipients: BagsFeeRecipient[];
}

export interface BagsFeeRecipient {
  publicKey: string;
  percentage: number;
}

/**
 * Bags API Analytics Response
 */
export interface BagsAnalyticsResponse {
  success: boolean;
  response?: {
    marketCap: number;
    volume24h: number;
    volumeAll: number;
    holders: number;
    price: number;
    priceChange24h: number;
    lifetimeFees: number;
    transactions: number;
    createdAt: number;
    lastTradeAt: number;
  };
  error?: string;
}

/**
 * Attention Token Eligibility Status
 */
export interface AttentionTokenEligibility {
  isEligible: boolean;
  reasons: {
    reputationScore: {
      current: number;
      required: number;
      met: boolean;
    };
    validatorCount: {
      current: number;
      required: number;
      met: boolean;
    };
    hasExistingToken: boolean;
  };
}

/**
 * Attention Token Creation Status
 */
export enum AttentionTokenCreationStatus {
  IDLE = 'idle',
  CHECKING_ELIGIBILITY = 'checking_eligibility',
  CREATING_TOKEN = 'creating_token',
  CONFIGURING_FEES = 'configuring_fees',
  LINKING_ON_CHAIN = 'linking_on_chain',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Attention Token Trade Parameters
 */
export interface AttentionTokenTradeParams {
  tokenMint: PublicKey;
  amount: number; // tokens or SOL depending on direction
  slippage: number; // percentage
  buyer: PublicKey;
}

/**
 * Attention Token Graduation Status
 */
export interface AttentionTokenGraduationStatus {
  isEligible: boolean;
  progress: {
    marketCap: {
      current: number;
      required: number;
      percentage: number;
    };
    dailyVolume: {
      current: number;
      required: number;
      percentage: number;
    };
    consecutiveDays: {
      current: number;
      required: number;
      percentage: number;
    };
  };
}

/**
 * Attention Token Filter Options
 */
export interface AttentionTokenFilters {
  category?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume24h?: number;
  sortBy?: 'marketCap' | 'volume24h' | 'holders' | 'createdAt' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Case Study with Attention Token (extended type)
 */
export interface CaseStudyWithAttentionToken {
  publicKey: PublicKey;
  submitter: PublicKey;
  treatmentName: string;
  treatmentCategory: string;
  description: string;
  imageUrl: string;
  reputationScore: number;
  validatorCount: number;
  validators: ValidatorInfo[];
  attentionTokenMint?: PublicKey;
  attentionToken?: AttentionToken;
  createdAt: number;
}

/**
 * Attention Token Revenue Stats
 */
export interface AttentionTokenRevenue {
  totalFees: number;
  submitterEarnings: number;
  validatorEarnings: number;
  platformEarnings: number;
  liquidityEarnings: number;
  claimableAmount: number;
  lastClaimAt?: number;
}

/**
 * Symbol generation options
 */
export interface SymbolGenerationOptions {
  maxLength?: number;
  prefix?: string;
  suffix?: string;
}
