/**
 * Services Index - Centralized Service Exports
 * 
 * Core Principles:
 * - DRY: Single import point for all services
 * - CLEAN: Clear organization by domain
 * - MODULAR: Easy to discover and use
 */

// Core Services
export { 
  DbcTokenService,
  formatDbc,
  calculateTier,
  calculateStakingRewards,
  STAKING_CONFIG,
  REWARD_AMOUNTS,
  TIER_THRESHOLDS,
  EMISSION_SCHEDULE,
} from './DbcTokenService';

export type { ValidatorTier, TierThreshold, StakingRewards } from './DbcTokenService';

// Privacy Services
export {
  noirService,
  lightProtocolService,
  arciumMPCService,
  privacyService,
  privacyServiceManager,
  PRIVACY_SCORE_WEIGHTS,
  DEFAULT_MPC_CONFIG,
} from './privacy';

export type {
  NoirProof,
  CompressionResult,
  MPCAccessRequest,
  CommitteeMember,
  DecryptionResult,
  PrivacyScoreWeights,
  PrivacyLevel,
} from './privacy';

// Cache Service
export { cacheService } from './CacheService';
export type { CacheStats } from './CacheService';

// Blockchain Integration
export {
  submitCaseStudyToBlockchain,
  submitValidatorApproval,
  requestValidatorReview,
  fetchPendingCaseStudies,
  fetchAndDecryptCaseStudy,
  fetchUserCaseStudies,
  getNetworkStatus,
} from './BlockchainIntegration';

export type { BlockchainSubmissionResult, ValidationRequest } from './BlockchainIntegration';

// Attention Token Services
export { AttentionTokenService } from './AttentionTokenService';
export { AttentionTokenTradingService } from './AttentionTokenTradingService';

// Other Services
export { BlockchainService } from './BlockchainService';
export { EncryptionService } from './EncryptionService';
export { transactionHistoryService } from './transactionHistory';
export { FarcasterService } from './FarcasterService';
