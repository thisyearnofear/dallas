/**
 * NoirService - Zero-Knowledge Proof Service
 * 
 * Single source of truth for all Noir ZK-SNARK proof operations.
 * Provides a clean, modular interface for generating validation proofs
 * without revealing sensitive agent execution data or proprietary architectures.
 * 
 * Uses @noir-lang/noir_js and @noir-lang/backend_barretenberg for ZK proofs.
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Enhances existing validation flow
 * - DRY: Single service for all circuit operations
 * - MODULAR: Each circuit has its own typed interface
 * - CLEAN: Clear separation between circuit types
 */

export type CircuitType =
  | 'benchmark_delta'
  | 'execution_duration'
  | 'data_completeness'
  | 'resource_range';

export interface BenchmarkDeltaInputs {
  baseline_severity: number;
  outcome_severity: number;
}

export interface ExecutionDurationInputs {
  duration_days: number;
}

export interface DataCompletenessInputs {
  has_baseline: boolean;
  has_outcome: boolean;
  has_duration: boolean;
  has_strategy: boolean;
  has_cost: boolean;
}

export interface ResourceRangeInputs {
  cost_usd_cents: number;
}

export interface BenchmarkDeltaPublicInputs {
  min_improvement_percent: number;
}

export interface ExecutionDurationPublicInputs {
  min_days: number;
  max_days: number;
}

export interface DataCompletenessPublicInputs {
  minimum_required: number;
}

export interface ResourceRangePublicInputs {
  min_cost_cents: number;
  max_cost_cents: number;
}

export type CircuitPrivateInputs =
  | BenchmarkDeltaInputs
  | ExecutionDurationInputs
  | DataCompletenessInputs
  | ResourceRangeInputs;

export type CircuitPublicInputs =
  | BenchmarkDeltaPublicInputs
  | ExecutionDurationPublicInputs
  | DataCompletenessPublicInputs
  | ResourceRangePublicInputs;

export interface ProofResult {
  proof: Uint8Array;
  publicInputs: CircuitPublicInputs;
  circuitType: CircuitType;
  verified: boolean;
  error?: string;
}

export interface CircuitMetadata {
  type: CircuitType;
  name: string;
  description: string;
  requiredFields: string[];
}

export const CIRCUIT_METADATA: Record<CircuitType, CircuitMetadata> = {
  benchmark_delta: {
    type: 'benchmark_delta',
    name: 'Benchmark Delta',
    description: 'Proves benchmark score improved by at least a threshold percentage without revealing actual scores',
    requiredFields: ['baseline_severity', 'outcome_severity'],
  },
  execution_duration: {
    type: 'execution_duration',
    name: 'Execution Duration',
    description: 'Proves evaluation duration is within acceptable bounds',
    requiredFields: ['duration_days'],
  },
  data_completeness: {
    type: 'data_completeness',
    name: 'Data Completeness',
    description: 'Proves required optimization log fields are present',
    requiredFields: ['has_baseline', 'has_outcome', 'has_duration', 'has_strategy', 'has_cost'],
  },
  resource_range: {
    type: 'resource_range',
    name: 'Resource Range',
    description: 'Proves compute cost is within an acceptable range without revealing exact spend',
    requiredFields: ['cost_usd_cents'],
  },
};

export const DEFAULT_PUBLIC_INPUTS: Record<CircuitType, CircuitPublicInputs> = {
  benchmark_delta: { min_improvement_percent: 20 },
  execution_duration: { min_days: 7, max_days: 90 },
  data_completeness: { minimum_required: 4 },
  resource_range: { min_cost_cents: 1000, max_cost_cents: 1000000 },
};

interface CircuitArtifact {
  bytecode: string;
  abi?: any;
}

class NoirServiceClass {
  private initialized = false;
  private backends: Map<CircuitType, any> = new Map();
  private noirInstances: Map<CircuitType, any> = new Map();
  private artifacts: Map<CircuitType, CircuitArtifact> = new Map();

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🔐 Initializing NoirService with @noir-lang...');
      
      const { Noir } = await import('@noir-lang/noir_js');
      const { BarretenbergBackend } = await import('@noir-lang/backend_barretenberg');
      
      await this.loadCircuitArtifacts(Noir, BarretenbergBackend);
      
      this.initialized = true;
      console.log('✅ NoirService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize NoirService:', error);
      console.warn('⚠️ Using simulated proofs - install @noir-lang packages for real ZK proofs');
      this.initialized = true;
    }
  }

  private async loadCircuitArtifacts(Noir: any, BarretenbergBackend: any): Promise<void> {
    const circuitTypes: CircuitType[] = [
      'benchmark_delta', 
      'execution_duration', 
      'data_completeness', 
      'resource_range'
    ];

    for (const circuitType of circuitTypes) {
      try {
        const artifactUrl = `/circuits/${circuitType}/target/${circuitType}.json`;
        const response = await fetch(artifactUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch circuit artifact: ${response.status}`);
        }
        
        const artifact: CircuitArtifact = await response.json();
        this.artifacts.set(circuitType, artifact);
        
        const backend = new BarretenbergBackend(artifact.bytecode);
        const noir = new Noir(artifact);
        
        this.backends.set(circuitType, backend);
        this.noirInstances.set(circuitType, noir);
        
        console.log(`✅ Loaded circuit: ${circuitType}`);
      } catch (error) {
        console.error(`❌ Failed to load circuit ${circuitType}:`, error);
      }
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isCircuitAvailable(circuitType: CircuitType): boolean {
    return this.backends.has(circuitType) && this.noirInstances.has(circuitType);
  }

  async proveBenchmarkDelta(
    inputs: BenchmarkDeltaInputs,
    publicInputs: BenchmarkDeltaPublicInputs = DEFAULT_PUBLIC_INPUTS.benchmark_delta
  ): Promise<ProofResult> {
    return this.generateProof('benchmark_delta', {
      baseline_severity: inputs.baseline_severity.toString(),
      outcome_severity: inputs.outcome_severity.toString(),
      min_improvement_percent: publicInputs.min_improvement_percent.toString(),
    }, publicInputs);
  }

  async proveExecutionDuration(
    inputs: ExecutionDurationInputs,
    publicInputs: ExecutionDurationPublicInputs = DEFAULT_PUBLIC_INPUTS.execution_duration
  ): Promise<ProofResult> {
    return this.generateProof('execution_duration', {
      duration_days: inputs.duration_days.toString(),
      min_days: publicInputs.min_days.toString(),
      max_days: publicInputs.max_days.toString(),
    }, publicInputs);
  }

  async proveDataCompleteness(
    inputs: DataCompletenessInputs,
    publicInputs: DataCompletenessPublicInputs = DEFAULT_PUBLIC_INPUTS.data_completeness
  ): Promise<ProofResult> {
    return this.generateProof('data_completeness', {
      has_baseline: inputs.has_baseline ? '1' : '0',
      has_outcome: inputs.has_outcome ? '1' : '0',
      has_duration: inputs.has_duration ? '1' : '0',
      has_protocol: inputs.has_strategy ? '1' : '0',
      has_cost: inputs.has_cost ? '1' : '0',
      minimum_required: publicInputs.minimum_required.toString(),
    }, publicInputs);
  }

  async proveResourceRange(
    inputs: ResourceRangeInputs,
    publicInputs: ResourceRangePublicInputs = DEFAULT_PUBLIC_INPUTS.resource_range
  ): Promise<ProofResult> {
    return this.generateProof('resource_range', {
      cost_usd_cents: inputs.cost_usd_cents.toString(),
      min_cost_cents: publicInputs.min_cost_cents.toString(),
      max_cost_cents: publicInputs.max_cost_cents.toString(),
    }, publicInputs);
  }

  private async generateProof(
    circuitType: CircuitType,
    inputs: Record<string, string>,
    publicInputs: CircuitPublicInputs
  ): Promise<ProofResult> {
    const backend = this.backends.get(circuitType);
    const noir = this.noirInstances.get(circuitType);

    if (!backend || !noir) {
      throw new Error(`Circuit ${circuitType} not loaded`);
    }

    try {
      const startTime = performance.now();
      
      const { witness } = await noir.execute(inputs);
      const proof = await backend.generateProof(witness);
      const isValid = await backend.verifyProof(proof);
      
      const endTime = performance.now();
      console.log(`✅ ${circuitType} proof generated in ${(endTime - startTime).toFixed(2)}ms, verified: ${isValid}`);

      return {
        proof: new Uint8Array(proof),
        publicInputs,
        circuitType,
        verified: isValid,
      };
    } catch (error) {
      console.error(`❌ Failed to generate proof for ${circuitType}:`, error);
      throw error;
    }
  }

  async generateValidationProofs(
    optimizationLogData: {
      baselineSeverity: number;
      outcomeSeverity: number;
      durationDays: number;
      costUsd: number;
      hasBaseline: boolean;
      hasOutcome: boolean;
      hasDuration: boolean;
      hasStrategy: boolean;
      hasCost: boolean;
    }
  ): Promise<ProofResult[]> {
    const proofs: ProofResult[] = [];

    proofs.push(
      await this.proveBenchmarkDelta({
        baseline_severity: optimizationLogData.baselineSeverity,
        outcome_severity: optimizationLogData.outcomeSeverity,
      })
    );

    proofs.push(
      await this.proveExecutionDuration({
        duration_days: optimizationLogData.durationDays,
      })
    );

    proofs.push(
      await this.proveDataCompleteness({
        has_baseline: optimizationLogData.hasBaseline,
        has_outcome: optimizationLogData.hasOutcome,
        has_duration: optimizationLogData.hasDuration,
        has_strategy: optimizationLogData.hasStrategy,
        has_cost: optimizationLogData.hasCost,
      })
    );

    proofs.push(
      await this.proveResourceRange({
        cost_usd_cents: Math.round(optimizationLogData.costUsd * 100),
      })
    );

    return proofs;
  }

  getCircuitMetadata(type: CircuitType): CircuitMetadata {
    return CIRCUIT_METADATA[type];
  }

  getAvailableCircuits(): CircuitMetadata[] {
    return Object.values(CIRCUIT_METADATA);
  }

  async destroy(): Promise<void> {
    for (const backend of this.backends.values()) {
      try {
        await backend.destroy();
      } catch (e) {}
    }
    this.backends.clear();
    this.noirInstances.clear();
    this.artifacts.clear();
    this.initialized = false;
  }
}

export const noirService = new NoirServiceClass();
export default noirService;
