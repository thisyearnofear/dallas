import { CHAINS_CONFIG, isStellarEnabled, type SupportedChain } from '../../config/chains';
import type { VerificationAdapter, VerificationRequest, VerificationResult } from '../VerificationAdapter';

export class StellarVerificationService implements VerificationAdapter {
  readonly chainId: SupportedChain = 'stellar';
  private results: Map<string, VerificationResult> = new Map();

  /**
   * Submit a browser-generated proof to the Soroban attestation contract.
   *
   * The proof + public inputs are generated in the browser via WASM (noir_js + bb.js)
   * and sent to the Vercel API which uses @stellar/stellar-sdk to invoke verify_and_attest.
   */
  async submit(request: VerificationRequest): Promise<VerificationResult> {
    if (!isStellarEnabled()) {
      return { submitted: false, status: 'disabled' };
    }

    if (!CHAINS_CONFIG.stellar.contractId) {
      return {
        submitted: false,
        status: 'failed',
        error: 'Stellar contract ID not configured. Set VITE_STELLAR_CONTRACT_ID.',
      };
    }

    const verificationId = this.buildVerificationId(request.optimizationLogId, request.circuit);

    try {
      const response = await fetch('/api/stellar-prove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          optimizationLogId: request.optimizationLogId,
          circuit: request.circuit,
          allianceId: request.allianceId,
          proofBytes: request.proof ? this.uint8ArrayToBase64(request.proof) : undefined,
          publicInputsBytes: request.publicInputsBytes
            ? this.uint8ArrayToBase64(request.publicInputsBytes)
            : undefined,
          publicInputs: request.publicInputs,
          contractId: CHAINS_CONFIG.stellar.contractId,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Stellar prove API failed (${response.status}): ${err}`);
      }

      const data = await response.json();
      const result: VerificationResult = {
        submitted: true,
        verificationId,
        status: data.status === 'verified' ? 'verified' : 'pending',
        txId: data.txHash,
        explorerUrl: data.txHash ? this.getExplorerUrl(data.txHash) : undefined,
        attestation: data.attestation,
      };
      this.results.set(verificationId, result);
      return result;
    } catch (error) {
      const r: VerificationResult = {
        submitted: false,
        verificationId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown Stellar error',
      };
      this.results.set(verificationId, r);
      return r;
    }
  }

  async checkStatus(verificationId: string): Promise<VerificationResult> {
    return this.results.get(verificationId) ?? {
      submitted: false,
      status: 'failed',
      error: 'Unknown verification ID',
    };
  }

  getExplorerUrl(txId: string): string {
    return `${CHAINS_CONFIG.stellar.explorerUrl}/${txId}`;
  }

  isConfigured(): boolean {
    return isStellarEnabled();
  }

  private buildVerificationId(optimizationLogId: string, circuit: string): string {
    return `stellar_${circuit}_${optimizationLogId}_${Date.now()}`;
  }

  private uint8ArrayToBase64(arr: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
  }
}

export const stellarVerificationService = new StellarVerificationService();
