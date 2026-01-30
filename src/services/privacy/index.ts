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
  DEFAULT_COMPRESSION_OPTIONS,
  COMPRESSION_RATIO_OPTIONS,
} from './LightProtocolService';

export type {
  CompressionOptions,
  CompressedCaseStudy,
  CompressionStats,
} from './LightProtocolService';
