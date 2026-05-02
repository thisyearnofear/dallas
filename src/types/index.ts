/**
 * Unified Types - Single Source of Truth
 * 
 * Core Principles:
 * - DRY: All shared types in one place
 * - CLEAN: Clear interfaces with explicit dependencies
 * - MODULAR: Composable type definitions
 */

import { PublicKey } from '@solana/web3.js';

// ============= Blockchain Types =============

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
  accountPubkey?: PublicKey;
}

export interface OptimizationLogData {
  encryptedBaseline: Uint8Array;
  encryptedOutcome: Uint8Array;
  strategyDescription: string;
  evaluationDays: number;
  computeCostUSD: number;
  usePrivacyCash?: boolean;
  useShadowWire?: boolean;
  compressionRatio?: number;
}

export interface ValidationData {
  optimizationLogPubkey: PublicKey;
  validationType: 'quality' | 'accuracy' | 'safety';
  approved: boolean;
  stakeAmount: number;
}

// ============= Privacy Types =============

export interface NoirProof {
  circuitType: string;
  proof: Uint8Array;
  publicInputs: Record<string, unknown>;
  verified: boolean;
  timestamp: number;
}

export interface CompressionResult {
  compressedAccount: PublicKey;
  originalSize: number;
  compressedSize: number;
  achievedRatio: number;
  merkleRoot: Uint8Array;
  compressionProof: Uint8Array;
}

export interface MPCAccessRequest {
  id: string;
  optimizationLogId: string;
  requester: PublicKey;
  requesterType: 'researcher' | 'validator' | 'builder' | 'architect' | 'agent';
  justification: string;
  status: MPCSessionStatus;
  committee: CommitteeMember[];
  threshold: number;
  createdAt: number;
  expiresAt: number;
  encryptionScheme: EncryptionScheme;
  decryptedDataHash?: string;
  error?: string;
}

export type MPCSessionStatus = 'pending' | 'active' | 'approved' | 'rejected' | 'expired';
export type EncryptionScheme = 'aes-256-gcm' | 'chacha20-poly1305';

export interface CommitteeMember {
  validatorAddress: PublicKey;
  hasApproved: boolean;
  approvedAt?: number;
  shareCommitment?: Uint8Array;
}

export interface DecryptionResult {
  success: boolean;
  data?: Uint8Array;
  approvedBy: PublicKey[];
  error?: string;
  decryptedAt?: number;
}

export interface PrivacyScoreWeights {
  encryption: number;
  zk_proofs: number;
  compression: number;
  mpc: number;
}

export interface PrivacyLevel {
  label: string;
  color: 'purple' | 'green' | 'blue' | 'yellow';
  icon: string;
  description: string;
}

// ============= Token Types =============

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

export interface StakingRewards {
  baseReward: number;
  accuracyBonus: number;
  stakeBonus: number;
  totalReward: number;
}

export interface ValidatorStake {
  account: PublicKey;
  amount: number;
  stakedAt: number;
  unlockAt: number;
  canUnstake: boolean;
}

export interface ValidatorReputation {
  totalValidations: number;
  accurateValidations: number;
  accuracyRate: number;
  tier: ValidatorTier;
}

// ============= Community Types =============
// Re-exported from ./community (includes CommunityCategory, Community, CreateCommunityRequest)

export type { CommunityCategory, Community, CreateCommunityRequest } from './community';

// ============= Analysis Types =============

export interface TechniqueStats {
  technique: string;
  totalLogs: number;
  avgImprovement: number;
  avgDuration: number;
  avgCost: number;
  effectivenessScore: number;
  confidenceInterval: [number, number];
  regressionRate: number;
}

/** @deprecated Use TechniqueStats instead */
export type ProtocolStats = TechniqueStats;

export interface AggregateMetrics {
  totalLogs: number;
  totalOperators: number;
  avgComplexity: number;
  providerDistribution: Record<string, number>;
  challengeDistribution: Record<string, number>;
  evaluationDuration: { min: number; max: number; avg: number };
  costRange: { min: number; max: number; avg: number };
}

export interface AnalysisExport {
  id: string;
  name: string;
  createdAt: number;
  format: 'csv' | 'json' | 'pdf';
  size: number;
  downloadUrl: string;
}

/** @deprecated Use AnalysisExport instead */
export type ResearchExport = AnalysisExport;

// ============= UI Types =============

export type NotificationType = 'success' | 'warning' | 'info' | 'achievement';

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// ============= API Response Types =============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// ============= Error Types =============

export type ErrorCode = 
  | 'WALLET_NOT_CONNECTED'
  | 'INSUFFICIENT_FUNDS'
  | 'TRANSACTION_FAILED'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'RATE_LIMITED';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// ============= Utility Types =============

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: AppError };

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface FilterConfig<T> {
  key: keyof T;
  value: T[keyof T];
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains';
}

// ============= Agent Telemetry Types =============

export type AgentMetricType = 'latency' | 'token_usage' | 'success_rate' | 'error_rate' | 'throughput';

export interface AgentMetric {
  type: AgentMetricType;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  agentId?: string;
  source: 'openai' | 'anthropic' | 'custom' | 'local';
}

export interface AgentInsight {
  metricType: AgentMetricType;
  period: 'daily' | 'weekly' | 'monthly';
  averageValue: number;
  minValue: number;
  maxValue: number;
  consistencyScore: number; // 0-100
  timestamp: number;
}

export interface CompressedAccount {
  address: PublicKey;
  merkleRoot: Uint8Array;
  proof: Uint8Array;
  dataHash: Uint8Array;
}

// ============= Re-export from other type files =============

export * from './community';
export * from './attentionToken';
