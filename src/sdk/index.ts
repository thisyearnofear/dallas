/**
 * DBC Agent SDK — minimal wrapper around the browser proof + submission flow.
 *
 * This is the real implementation behind the code snippet on the home page.
 * It wraps generateProofInBrowser (noir_js WASM) and stellarVerificationService
 * (Soroban submit) into a clean dbc.prove() / dbc.anchor() API.
 */

import { generateProofInBrowser, type ProveInputs } from '../services/stellar/browserProver';
import { stellarVerificationService } from '../services';
import { saveProof } from '../services/proofHistory';

export interface ProveOptions {
  metric: string;
  before: number;      // 1-10, lower = better
  after: number;       // 1-10, lower = better
  threshold: number;   // min % improvement
}

export interface ProofResult {
  witnessBytes: string;
  baseline: number;
  outcome: number;
  threshold: number;
  metric: string;
  improvement: number;
  passed: boolean;
}

export interface AnchorResult {
  txId: string;
  explorerUrl: string;
  attestation: {
    allianceId: string;
    submissionId: string;
    passed: boolean;
    threshold: number;
  };
}

export class DBC {
  private alliance: string;

  constructor(opts: { alliance: string }) {
    this.alliance = opts.alliance;
  }

  /**
   * Execute the Noir benchmark_delta circuit in the browser via WASM.
   * Private inputs (before/after) never leave the device.
   * Returns a witness + metadata that can be anchored on-chain.
   */
  async prove(opts: ProveOptions): Promise<ProofResult> {
    const proveInputs: ProveInputs = {
      baselineMetric: opts.before,
      outcomeMetric: opts.after,
      minImprovementPercent: opts.threshold,
    };

    const result = await generateProofInBrowser(proveInputs);

    const improvement = Math.round(((opts.before - opts.after) / opts.before) * 100);

    return {
      witnessBytes: result.witnessBytes,
      baseline: opts.before,
      outcome: opts.after,
      threshold: opts.threshold,
      metric: opts.metric,
      improvement,
      passed: improvement >= opts.threshold,
    };
  }

  /**
   * Submit the proof to Soroban's verify_and_attest contract.
   * The server generates the UltraHonk proof and anchors a permanent
   * on-chain attestation.
   */
  async anchor(proof: ProofResult): Promise<AnchorResult> {
    const res = await stellarVerificationService.submit({
      optimizationLogId: `sdk-log-${Date.now()}`,
      circuit: 'benchmark_delta',
      allianceId: this.alliance,
      witnessBytes: proof.witnessBytes,
      publicInputs: {
        baselineLatencySeverity: proof.baseline,
        outcomeLatencySeverity: proof.outcome,
        minImprovementPercent: proof.threshold,
      },
    });

    if (res.status !== 'verified') {
      throw new Error(res.error || 'On-chain verification failed');
    }

    // Persist to localStorage
    saveProof({
      txHash: res.txId || '',
      explorerUrl: res.explorerUrl || '',
      allianceId: this.alliance,
      threshold: proof.threshold,
      passed: proof.passed,
      metric: proof.metric,
      baseline: proof.baseline,
      outcome: proof.outcome,
      improvement: proof.improvement,
      timestamp: Date.now(),
      submissionId: res.attestation?.submissionId,
    });

    return {
      txId: res.txId || '',
      explorerUrl: res.explorerUrl || '',
      attestation: {
        allianceId: this.alliance,
        submissionId: res.attestation?.submissionId || '',
        passed: res.attestation?.passed ?? proof.passed,
        threshold: proof.threshold,
      },
    };
  }
}
