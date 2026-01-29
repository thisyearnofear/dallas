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
  // Community and Research Metrics
  communityStats?: {
    activeSupporters: number;
    researchUpdates: number;
    validationMilestones: number;
    sentiment: number; // 0-100
  };
  intelReports?: {
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    summary: string;
    timestamp: number;
    isEncrypted: boolean;
  }[];
}

/**
 * Attention Token Creation Parameters
 * ENHANCED: Made case study optional, added community fields
 */
export interface CreateAttentionTokenParams {
  caseStudyPda?: PublicKey;           // Optional for standalone communities
  treatmentName: string;
  treatmentCategory: string;
  description: string;
  imageUrl: string;
  submitter: PublicKey;
  validators?: ValidatorInfo[];       // Optional for communities
  reputationScore?: number;           // Optional for communities
  // ADDED: Community-specific parameters
  communityCategory?: 'supplement' | 'lifestyle' | 'device' | 'protocol';
  isCommunityToken?: boolean;
  socialEnabled?: boolean;
}

/**
 * Bags API Token Launch Request
 * ENHANCED: Added community-specific fields for category taxonomy and social layer
 */
export interface BagsTokenLaunchRequest {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  partnerConfig?: string; // Optional partner config for fee sharing
  metadata: {
    caseStudyPda?: string;              // Optional - not required for standalone communities
    submitter: string;
    validators: string[];
    reputationScore: number;
    treatmentName: string;
    treatmentCategory: string;
    // ADDED: Community-specific metadata
    communityCategory?: 'supplement' | 'lifestyle' | 'device' | 'protocol';
    isCommunityToken?: boolean;         // Flag to identify community vs case study tokens
    socialEnabled?: boolean;            // Whether Farcaster integration is enabled
    farcasterChannel?: string;          // Farcaster channel ID if social enabled
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

/**
 * Cell - Community hub for a token (1:1 with token mint)
 */
export interface Cell {
  id: string;
  tokenMint: string;
  caseStudyPda: string;
  ownerWallet: string;
  name: string;
  description: string;
  policy: CellAccessPolicy;
  createdAt: number;
  updatedAt: number;
}

export type CellAccessPolicy = 'public' | 'token_gated' | 'mixed';

/**
 * Post - Community content within a Cell
 */
export interface CellPost {
  id: string;
  cellId: string;
  authorWallet: string;
  authorCallsign?: string;
  type: CellPostType;
  title: string;
  summary: string;
  contentRef?: string;
  visibility: PostVisibility;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  attachments: PostAttachment[];
  reactions: number;
  comments: number;
  createdAt: number;
  isEncrypted: boolean;
}

export type CellPostType = 'intel' | 'update' | 'question' | 'media' | 'milestone';
export type PostVisibility = 'public' | 'token_gated' | 'holders_only';

/**
 * Post Attachment - Media/files attached to posts
 */
export interface PostAttachment {
  id: string;
  postId: string;
  kind: 'image' | 'video' | 'file';
  storageUrl: string;
  thumbUrl?: string;
  mimeType: string;
  size: number;
  isEncrypted: boolean;
}

/**
 * Create Post params
 */
export interface CreatePostParams {
  cellId: string;
  type: CellPostType;
  title: string;
  summary: string;
  content?: string;
  visibility: PostVisibility;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  attachments?: File[];
}

/**
 * Cell activation checklist
 */
export interface CellActivationStatus {
  hasFirstIntel: boolean;
  hasFollowUp: boolean;
  hasQuestion: boolean;
  hasBounty: boolean;
  completedSteps: number;
  totalSteps: number;
}
