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
  calculateStakingRewards,
  STAKING_CONFIG,
  REWARD_AMOUNTS,
  EMISSION_SCHEDULE,
} from './DbcTokenService';

export { calculateTier, TIER_THRESHOLDS } from '../types';
export type { ValidatorTier, TierThreshold, StakingRewards } from '../types';

// Privacy Services
export {
  privacyService,
  PRIVACY_SCORE_WEIGHTS,
  DEFAULT_MPC_CONFIG,
} from './privacy';

// Privacy Types - exported from types (single source of truth)
export type {
  MPCSessionStatus,
  CommitteeMember,
  MPCAccessRequest,
  DecryptionResult,
  AccessRequestInput,
} from './privacy';

// Additional Privacy Types from ../types
export type {
  NoirProof,
  CompressionResult,
  PrivacyScoreWeights,
  PrivacyLevel,
} from '../types';

// Cache Service
export { cacheService } from './CacheService';
export type { CacheStats } from './CacheService';

// Blockchain Integration
export {
  submitOptimizationLogToBlockchain,
  submitValidatorApproval,
  requestValidatorReview,
  fetchPendingCaseStudies,
  fetchAndDecryptOptimizationLog,
  fetchUserCaseStudies,
  getNetworkStatus,
} from './BlockchainIntegration';

export type { BlockchainSubmissionResult, ValidationRequest } from './BlockchainIntegration';

// Dual-Chain Submission
export {
  submitOptimizationLogDualChain,
  dualChainSubmissionService,
} from './DualChainSubmissionService';
export type {
  OptimizationLogSubmissionFormData,
  DualChainStatus,
  DualChainSubmissionResult,
  DualChainSubmissionParams,
} from './DualChainSubmissionService';

// Aleo Services
export {
  aleoVerificationService,
  AleoVerificationService,
} from './aleo';
export type {
  AleoVerificationRequest,
  AleoVerificationResult,
  AleoSubmissionPayload,
  AleoSubmissionResult,
} from './aleo';

// Stellar Services
export {
  stellarVerificationService,
  StellarVerificationService,
} from './stellar';
export type {
  VerificationResult,
  VerificationRequest,
  VerificationAdapter,
} from './VerificationAdapter';

// Attention Token Services
export { AttentionTokenService } from './AttentionTokenService';
export { AttentionTokenTradingService } from './AttentionTokenTradingService';

// Other Services
export { BlockchainService } from './BlockchainService';
export { EncryptionService } from './EncryptionService';
export { transactionHistoryService } from './transactionHistory';
export { FarcasterService } from './FarcasterService';

// Relayer Service
export { aleoRelayerService } from './relayer';
export type { RelayerSubmission, RelayerResponse, RelayerStatus } from './relayer';
