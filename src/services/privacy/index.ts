/**
 * Privacy Services Module
 * 
 * Centralized exports for all privacy-related services.
 * Follows domain-driven design with clear separation of concerns.
 */

// Noir ZK-SNARK Service
export {
  NoirService,
  noirService,
  CIRCUIT_METADATA,
  DEFAULT_PUBLIC_INPUTS,
} from './NoirService';

export type {
  CircuitType,
  CircuitMetadata,
  CircuitPrivateInputs,
  CircuitPublicInputs,
  ProofResult,
  SymptomImprovementInputs,
  SymptomImprovementPublicInputs,
  DurationVerificationInputs,
  DurationVerificationPublicInputs,
  DataCompletenessInputs,
  DataCompletenessPublicInputs,
  CostRangeInputs,
  CostRangePublicInputs,
} from './NoirService';

// Light Protocol ZK Compression Service
export {
  LightProtocolService,
  lightProtocolService,
} from './LightProtocolService';

export type {
  CompressedCaseStudy,
} from './LightProtocolService';

// Arcium MPC Threshold Decryption Service
export {
  ArciumMPCService,
  arciumMPCService,
  DEFAULT_MPC_CONFIG,
  ENCRYPTION_SCHEME_OPTIONS,
} from './ArciumMPCService';

export type {
  MPCSessionStatus,
  CommitteeMember,
  MPCAccessRequest,
  EncryptionScheme,
  DecryptionResult,
  AccessRequestInput,
} from './ArciumMPCService';

// Unified Privacy Service Facade
export {
  PrivacyService,
  privacyService,
  PRIVACY_SCORE_WEIGHTS,
} from './PrivacyService';

export type {
  PrivacyOperationResult,
  PrivacyOperation,
  PrivacyEnhancedCaseStudy,
  PrivacyEnhancedValidation,
  PrivacyEnhancedAccessRequest,
} from './PrivacyService';

// Centralized Privacy Service Manager
export {
  PrivacyServiceManager,
  privacyServiceManager,
} from './PrivacyServiceManager';

export type {
  PrivacyServiceStatus,
  PrivacyCaseStudyData,
  PrivacyProcessingResult,
} from './PrivacyServiceManager';

// Private Messaging Service
export {
  PrivateMessagingService,
  privateMessagingService,
  MESSAGING_CONFIG,
  MESSAGE_TYPE_OPTIONS,
} from './PrivateMessagingService';

export type {
  MessageType,
  MessageStatus,
  EncryptedMessage,
  DecryptedMessage,
  MessageThread,
  SendMessageInput,
} from './PrivateMessagingService';
