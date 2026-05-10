/**
 * Privacy Services Module
 * 
 * Centralized exports for all privacy-related services.
 * Follows domain-driven design with clear separation of concerns.
 * 
 * NOTE: For heavy proof generation/verification, import from './prover'.
 * This index only provides types and the lightweight PrivacyService facade.
 */

// Types & Metadata
export {
  CIRCUIT_METADATA,
  DEFAULT_PUBLIC_INPUTS,
} from './NoirService';

export type {
  NoirServiceClass,
  CircuitType,
  CircuitMetadata,
  CircuitPrivateInputs,
  CircuitPublicInputs,
  ProofResult,
  BenchmarkDeltaInputs,
  BenchmarkDeltaPublicInputs,
  ExecutionDurationInputs,
  ExecutionDurationPublicInputs,
  DataCompletenessInputs,
  DataCompletenessPublicInputs,
  ResourceRangeInputs,
  ResourceRangePublicInputs,
} from './NoirService';

export {
  COMPRESSION_RATIO_OPTIONS,
} from './LightProtocolService';

export type {
  LightProtocolServiceClass,
  CompressedOptimizationLog,
} from './LightProtocolService';

export {
  DEFAULT_MPC_CONFIG,
  ENCRYPTION_SCHEME_OPTIONS,
} from './ArciumMPCService';

export type {
  ArciumMPCServiceClass,
  AccessRequestInput,
  EncryptionScheme,
} from './ArciumMPCService';

// Re-export MPC types from types (single source of truth)
export type {
  MPCSessionStatus,
  CommitteeMember,
  MPCAccessRequest,
  DecryptionResult,
  PrivacyLevel,
} from '../../types';

// Unified Privacy Service Facade (LIGHTWEIGHT ENTRY POINT)
export {
  PrivacyService,
  privacyService,
  PRIVACY_SCORE_WEIGHTS,
} from './PrivacyService';

export type {
  PrivacyOperationResult,
  PrivacyOperation,
  PrivacyEnhancedOptimizationLog,
  PrivacyEnhancedValidation,
  PrivacyEnhancedAccessRequest,
} from './PrivacyService';

// Centralized Privacy Service Manager Types
export type {
  PrivacyServiceManagerClass,
  PrivacyServiceStatus,
  PrivacyOptimizationLogData,
  PrivacyProcessingResult,
} from './PrivacyServiceManager';

// Private Messaging Service Types
export {
  MESSAGING_CONFIG,
  MESSAGE_TYPE_OPTIONS,
} from './PrivateMessagingService';

export type {
  PrivateMessagingServiceClass,
  MessageType,
  MessageStatus,
  EncryptedMessage,
  DecryptedMessage,
  MessageThread,
  SendMessageInput,
} from './PrivateMessagingService';
