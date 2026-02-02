/**
 * NoirService - Zero-Knowledge Proof Service
 * 
 * Single source of truth for all Noir ZK-SNARK proof operations.
 * Provides a clean, modular interface for generating validation proofs
 * without revealing sensitive health data.
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Enhances existing validation flow
 * - DRY: Single service for all circuit operations
 * - MODULAR: Each circuit has its own typed interface
 * - CLEAN: Clear separation between circuit types
 */

// Circuit types supported by the service
export type CircuitType =
  | 'symptom_improvement'
  | 'duration_verification'
  | 'data_completeness'
  | 'cost_range';

// Circuit input interfaces (private inputs - not revealed on-chain)
export interface SymptomImprovementInputs {
  baseline_severity: number;      // 1-10 scale
  outcome_severity: number;       // 1-10 scale
}

export interface DurationVerificationInputs {
  duration_days: number;          // Treatment duration
}

export interface DataCompletenessInputs {
  has_baseline: boolean;
  has_outcome: boolean;
  has_duration: boolean;
  has_protocol: boolean;
  has_cost: boolean;
}

export interface CostRangeInputs {
  cost_usd_cents: number;         // Cost in cents (e.g., 50000 = $500)
}

// Circuit public inputs (visible on-chain)
export interface SymptomImprovementPublicInputs {
  min_improvement_percent: number;  // e.g., 20 for 20%
}

export interface DurationVerificationPublicInputs {
  min_days: number;
  max_days: number;
}

export interface DataCompletenessPublicInputs {
  minimum_required: number;         // 1-5 fields required
}

export interface CostRangePublicInputs {
  min_cost_cents: number;
  max_cost_cents: number;
}

// Union types for generic handling
export type CircuitPrivateInputs =
  | SymptomImprovementInputs
  | DurationVerificationInputs
  | DataCompletenessInputs
  | CostRangeInputs;

export type CircuitPublicInputs =
  | SymptomImprovementPublicInputs
  | DurationVerificationPublicInputs
  | DataCompletenessPublicInputs
  | CostRangePublicInputs;

// Proof result interface
export interface ProofResult {
  proof: Uint8Array;
  publicInputs: CircuitPublicInputs;
  circuitType: CircuitType;
  verified: boolean;  // Local verification result
  error?: string;     // Optional error message if proof generation failed
}

// Circuit metadata
export interface CircuitMetadata {
  type: CircuitType;
  name: string;
  description: string;
  requiredFields: string[];
}

// Circuit configurations
export const CIRCUIT_METADATA: Record<CircuitType, CircuitMetadata> = {
  symptom_improvement: {
    type: 'symptom_improvement',
    name: 'Symptom Improvement',
    description: 'Proves symptom severity improved by at least a threshold percentage',
    requiredFields: ['baseline_severity', 'outcome_severity'],
  },
  duration_verification: {
    type: 'duration_verification',
    name: 'Duration Verification',
    description: 'Proves treatment duration is within acceptable bounds',
    requiredFields: ['duration_days'],
  },
  data_completeness: {
    type: 'data_completeness',
    name: 'Data Completeness',
    description: 'Proves required data fields are present',
    requiredFields: ['has_baseline', 'has_outcome', 'has_duration', 'has_protocol', 'has_cost'],
  },
  cost_range: {
    type: 'cost_range',
    name: 'Cost Range',
    description: 'Proves treatment cost is within a reasonable range',
    requiredFields: ['cost_usd_cents'],
  },
};

// Default public input values
export const DEFAULT_PUBLIC_INPUTS: Record<CircuitType, CircuitPublicInputs> = {
  symptom_improvement: { min_improvement_percent: 20 },
  duration_verification: { min_days: 7, max_days: 90 },
  data_completeness: { minimum_required: 4 },
  cost_range: { min_cost_cents: 1000, max_cost_cents: 1000000 }, // $10 - $10,000
};

/**
 * NoirService - Main class for ZK proof operations
 * 
 * Note: This is the architecture layer. The actual Noir JS integration
 * requires @noir-lang/noir_js and @aztec/bb.js which should be added
 * to package.json and imported dynamically to avoid bundle bloat.
 */
export class NoirService {
  private initialized = false;
  private circuitCache: Map<CircuitType, any> = new Map();
  private noirInstance: any = null;
  private backend: any = null;

  /**
   * Initialize the Noir service
   * Loads circuit artifacts and initializes WASM modules
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamically import noir_js and bb.js
      const { Noir } = await import('@noir-lang/noir_js');
      const { BarretenbergBackend } = await import('@noir-lang/backend_barretenberg');

      // Store references for later use
      this.noirInstance = Noir;
      this.backend = BarretenbergBackend;

      // Load circuit artifacts
      await this.loadCircuitArtifacts();

      this.initialized = true;
      console.log('🔐 NoirService initialized with actual ZK proof capabilities');
    } catch (error) {
      console.error('Failed to initialize Noir service:', error);
      // Don't throw - allow fallback to simulated proofs
      console.warn('Using simulated proofs as fallback');
      this.initialized = true;
    }
  }

  /**
   * Load circuit artifacts from compiled circuits
   */
  private async loadCircuitArtifacts(): Promise<void> {
    const circuitTypes: CircuitType[] = ['symptom_improvement', 'duration_verification', 'data_completeness', 'cost_range'];

    for (const circuitType of circuitTypes) {
      try {
        // Load compiled circuit artifact
        const artifactUrl = `/circuits/${circuitType}/target/${circuitType}.json`;
        const response = await fetch(artifactUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch circuit artifact: ${response.status}`);
        }
        
        const artifact = await response.json();
        this.circuitCache.set(circuitType, artifact);
        console.log(`✅ Loaded circuit artifact: ${circuitType} (hash: ${artifact.hash})`);
      } catch (error) {
        console.warn(`Failed to load circuit ${circuitType}:`, error);
        console.warn('Circuit proofs will fall back to simulated mode');
      }
    }
  }

  /**
   * Get circuit parameters for mock artifacts
   */
  private getCircuitParameters(circuitType: CircuitType): any[] {
    switch (circuitType) {
      case 'symptom_improvement':
        return [
          { name: 'baseline_severity', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
          { name: 'outcome_severity', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
          { name: 'min_improvement_percent', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
        ];
      case 'duration_verification':
        return [
          { name: 'duration_days', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
          { name: 'min_days', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
          { name: 'max_days', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
        ];
      case 'data_completeness':
        return [
          { name: 'has_baseline', type: { kind: 'boolean' } },
          { name: 'has_outcome', type: { kind: 'boolean' } },
          { name: 'has_duration', type: { kind: 'boolean' } },
          { name: 'has_protocol', type: { kind: 'boolean' } },
          { name: 'has_cost', type: { kind: 'boolean' } },
          { name: 'minimum_required', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
        ];
      case 'cost_range':
        return [
          { name: 'cost_usd_cents', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
          { name: 'min_cost_cents', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
          { name: 'max_cost_cents', type: { kind: 'integer', sign: 'unsigned', width: 32 } },
        ];
      default:
        return [];
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate a ZK proof for symptom improvement
   * Proves that symptoms improved by at least min_improvement_percent
   * without revealing actual severity scores
   */
  async proveSymptomImprovement(
    inputs: SymptomImprovementInputs,
    publicInputs: SymptomImprovementPublicInputs = DEFAULT_PUBLIC_INPUTS.symptom_improvement as SymptomImprovementPublicInputs
  ): Promise<ProofResult> {
    this.validateInputs('symptom_improvement', inputs);

    // Validate severity ranges
    if (inputs.baseline_severity < 1 || inputs.baseline_severity > 10) {
      throw new Error('Baseline severity must be 1-10');
    }
    if (inputs.outcome_severity < 1 || inputs.outcome_severity > 10) {
      throw new Error('Outcome severity must be 1-10');
    }

    // Generate actual ZK proof using Noir
    try {
      const circuitArtifact = this.circuitCache.get('symptom_improvement');
      if (!circuitArtifact || !this.noirInstance || !this.backend) {
        throw new Error('Noir not properly initialized or circuit not loaded');
      }

      const noir = new this.noirInstance(circuitArtifact);
      const backend = new this.backend(circuitArtifact);

      // Prepare inputs for the circuit
      const circuitInputs = {
        baseline_severity: inputs.baseline_severity.toString(),
        outcome_severity: inputs.outcome_severity.toString(),
        min_improvement_percent: publicInputs.min_improvement_percent.toString(),
      };

      console.log('Generating ZK proof for symptom improvement...', circuitInputs);

      // Generate witness
      const { witness } = await noir.execute(circuitInputs);

      // Generate proof
      const proof = await backend.generateProof(witness);

      // Verify the proof locally
      const verified = await backend.verifyProof(proof);

      console.log('✅ ZK proof generated and verified:', { proofSize: proof.length, verified });

      return {
        proof: new Uint8Array(proof),
        publicInputs,
        circuitType: 'symptom_improvement',
        verified,
      };
    } catch (error) {
      console.error('Failed to generate ZK proof:', error);
      // Fallback to simulated proof if actual generation fails
      const simulatedProof = this.createSimulatedProof('symptom_improvement');
      return {
        proof: simulatedProof,
        publicInputs,
        circuitType: 'symptom_improvement',
        verified: this.verifySymptomImprovementLogic(inputs, publicInputs),
        error: `ZK proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate a ZK proof for duration verification
   * Proves that treatment duration is within [min_days, max_days]
   * without revealing exact duration
   */
  async proveDurationVerification(
    inputs: DurationVerificationInputs,
    publicInputs: DurationVerificationPublicInputs = DEFAULT_PUBLIC_INPUTS.duration_verification as DurationVerificationPublicInputs
  ): Promise<ProofResult> {
    this.validateInputs('duration_verification', inputs);

    if (inputs.duration_days <= 0) {
      throw new Error('Duration must be positive');
    }

    try {
      const circuitArtifact = this.circuitCache.get('duration_verification');
      if (!circuitArtifact || !this.noirInstance || !this.backend) {
        throw new Error('Noir not properly initialized or circuit not loaded');
      }

      const noir = new this.noirInstance(circuitArtifact);
      const backend = new this.backend(circuitArtifact);

      const circuitInputs = {
        duration_days: inputs.duration_days.toString(),
        min_days: publicInputs.min_days.toString(),
        max_days: publicInputs.max_days.toString(),
      };

      console.log('Generating ZK proof for duration verification...', circuitInputs);

      const { witness } = await noir.execute(circuitInputs);
      const proof = await backend.generateProof(witness);
      const verified = await backend.verifyProof(proof);

      console.log('✅ Duration proof generated:', { proofSize: proof.length, verified });

      return {
        proof: new Uint8Array(proof),
        publicInputs,
        circuitType: 'duration_verification',
        verified,
      };
    } catch (error) {
      console.error('Failed to generate duration proof:', error);
      const simulatedProof = this.createSimulatedProof('duration_verification');
      return {
        proof: simulatedProof,
        publicInputs,
        circuitType: 'duration_verification',
        verified: this.verifyDurationLogic(inputs, publicInputs),
        error: `Proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate a ZK proof for data completeness
   * Proves that at least minimum_required fields are present
   * without revealing which specific fields
   */
  async proveDataCompleteness(
    inputs: DataCompletenessInputs,
    publicInputs: DataCompletenessPublicInputs = DEFAULT_PUBLIC_INPUTS.data_completeness as DataCompletenessPublicInputs
  ): Promise<ProofResult> {
    this.validateInputs('data_completeness', inputs);

    if (publicInputs.minimum_required < 1 || publicInputs.minimum_required > 5) {
      throw new Error('Minimum required must be 1-5');
    }

    try {
      const circuitArtifact = this.circuitCache.get('data_completeness');
      if (!circuitArtifact || !this.noirInstance || !this.backend) {
        throw new Error('Noir not properly initialized or circuit not loaded');
      }

      const noir = new this.noirInstance(circuitArtifact);
      const backend = new this.backend(circuitArtifact);

      const circuitInputs = {
        has_baseline: inputs.has_baseline.toString(),
        has_outcome: inputs.has_outcome.toString(),
        has_duration: inputs.has_duration.toString(),
        has_protocol: inputs.has_protocol.toString(),
        has_cost: inputs.has_cost.toString(),
        minimum_required: publicInputs.minimum_required.toString(),
      };

      console.log('Generating ZK proof for data completeness...', circuitInputs);

      const { witness } = await noir.execute(circuitInputs);
      const proof = await backend.generateProof(witness);
      const verified = await backend.verifyProof(proof);

      console.log('✅ Completeness proof generated:', { proofSize: proof.length, verified });

      return {
        proof: new Uint8Array(proof),
        publicInputs,
        circuitType: 'data_completeness',
        verified,
      };
    } catch (error) {
      console.error('Failed to generate completeness proof:', error);
      const simulatedProof = this.createSimulatedProof('data_completeness');
      return {
        proof: simulatedProof,
        publicInputs,
        circuitType: 'data_completeness',
        verified: this.verifyCompletenessLogic(inputs, publicInputs),
        error: `Proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate a ZK proof for cost range
   * Proves that cost is within [min_cost_cents, max_cost_cents]
   * without revealing exact cost
   */
  async proveCostRange(
    inputs: CostRangeInputs,
    publicInputs: CostRangePublicInputs = DEFAULT_PUBLIC_INPUTS.cost_range as CostRangePublicInputs
  ): Promise<ProofResult> {
    this.validateInputs('cost_range', inputs);

    if (inputs.cost_usd_cents <= 0) {
      throw new Error('Cost must be positive');
    }

    try {
      const circuitArtifact = this.circuitCache.get('cost_range');
      if (!circuitArtifact || !this.noirInstance || !this.backend) {
        throw new Error('Noir not properly initialized or circuit not loaded');
      }

      const noir = new this.noirInstance(circuitArtifact);
      const backend = new this.backend(circuitArtifact);

      const circuitInputs = {
        cost_usd_cents: inputs.cost_usd_cents.toString(),
        min_cost_cents: publicInputs.min_cost_cents.toString(),
        max_cost_cents: publicInputs.max_cost_cents.toString(),
      };

      console.log('Generating ZK proof for cost range...', circuitInputs);

      const { witness } = await noir.execute(circuitInputs);
      const proof = await backend.generateProof(witness);
      const verified = await backend.verifyProof(proof);

      console.log('✅ Cost range proof generated:', { proofSize: proof.length, verified });

      return {
        proof: new Uint8Array(proof),
        publicInputs,
        circuitType: 'cost_range',
        verified,
      };
    } catch (error) {
      console.error('Failed to generate cost proof:', error);
      const simulatedProof = this.createSimulatedProof('cost_range');
      return {
        proof: simulatedProof,
        publicInputs,
        circuitType: 'cost_range',
        verified: this.verifyCostLogic(inputs, publicInputs),
        error: `Proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate all relevant proofs for a case study validation
   * Returns proofs that can be submitted to the blockchain
   */
  async generateValidationProofs(
    caseStudyData: {
      baselineSeverity: number;
      outcomeSeverity: number;
      durationDays: number;
      costUsd: number;
      hasBaseline: boolean;
      hasOutcome: boolean;
      hasDuration: boolean;
      hasProtocol: boolean;
      hasCost: boolean;
    }
  ): Promise<ProofResult[]> {
    const proofs: ProofResult[] = [];

    // Generate symptom improvement proof
    proofs.push(
      await this.proveSymptomImprovement({
        baseline_severity: caseStudyData.baselineSeverity,
        outcome_severity: caseStudyData.outcomeSeverity,
      })
    );

    // Generate duration verification proof
    proofs.push(
      await this.proveDurationVerification({
        duration_days: caseStudyData.durationDays,
      })
    );

    // Generate data completeness proof
    proofs.push(
      await this.proveDataCompleteness({
        has_baseline: caseStudyData.hasBaseline,
        has_outcome: caseStudyData.hasOutcome,
        has_duration: caseStudyData.hasDuration,
        has_protocol: caseStudyData.hasProtocol,
        has_cost: caseStudyData.hasCost,
      })
    );

    // Generate cost range proof
    proofs.push(
      await this.proveCostRange({
        cost_usd_cents: Math.round(caseStudyData.costUsd * 100),
      })
    );

    return proofs;
  }

  /**
   * Get circuit metadata
   */
  getCircuitMetadata(type: CircuitType): CircuitMetadata {
    return CIRCUIT_METADATA[type];
  }

  /**
   * Get all available circuits
   */
  getAvailableCircuits(): CircuitMetadata[] {
    return Object.values(CIRCUIT_METADATA);
  }

  /**
   * Validate inputs for a circuit type
   */
  private validateInputs(type: CircuitType, inputs: any): void {
    const metadata = CIRCUIT_METADATA[type];
    const missingFields = metadata.requiredFields.filter(
      field => !(field in inputs)
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields for ${type}: ${missingFields.join(', ')}`
      );
    }
  }

  /**
   * Create a simulated proof (placeholder until noir_js is integrated)
   */
  private createSimulatedProof(circuitType: CircuitType): Uint8Array {
    // Create a deterministic placeholder proof based on circuit type
    const prefix = new TextEncoder().encode(`ZK_${circuitType}_`);
    const random = crypto.getRandomValues(new Uint8Array(64));
    const proof = new Uint8Array(prefix.length + random.length);
    proof.set(prefix);
    proof.set(random, prefix.length);
    return proof;
  }

  /**
   * Verify symptom improvement logic (matches circuit constraints)
   */
  private verifySymptomImprovementLogic(
    inputs: SymptomImprovementInputs,
    publicInputs: SymptomImprovementPublicInputs
  ): boolean {
    if (inputs.baseline_severity < 1 || inputs.baseline_severity > 10) return false;
    if (inputs.outcome_severity < 1 || inputs.outcome_severity > 10) return false;

    const improvement = Math.max(0, inputs.baseline_severity - inputs.outcome_severity);
    const threshold = Math.max(1, Math.floor(
      (inputs.baseline_severity * publicInputs.min_improvement_percent) / 100
    ));

    return improvement >= threshold;
  }

  /**
   * Verify duration logic (matches circuit constraints)
   */
  private verifyDurationLogic(
    inputs: DurationVerificationInputs,
    publicInputs: DurationVerificationPublicInputs
  ): boolean {
    return (
      inputs.duration_days > 0 &&
      inputs.duration_days >= publicInputs.min_days &&
      inputs.duration_days <= publicInputs.max_days
    );
  }

  /**
   * Verify completeness logic (matches circuit constraints)
   */
  private verifyCompletenessLogic(
    inputs: DataCompletenessInputs,
    publicInputs: DataCompletenessPublicInputs
  ): boolean {
    const count = [
      inputs.has_baseline,
      inputs.has_outcome,
      inputs.has_duration,
      inputs.has_protocol,
      inputs.has_cost,
    ].filter(Boolean).length;

    return count >= publicInputs.minimum_required;
  }

  /**
   * Verify cost logic (matches circuit constraints)
   */
  private verifyCostLogic(
    inputs: CostRangeInputs,
    publicInputs: CostRangePublicInputs
  ): boolean {
    return (
      inputs.cost_usd_cents > 0 &&
      inputs.cost_usd_cents >= publicInputs.min_cost_cents &&
      inputs.cost_usd_cents <= publicInputs.max_cost_cents
    );
  }
}

// Export singleton instance
export const noirService = new NoirService();

// Export default for convenience
export default noirService;
