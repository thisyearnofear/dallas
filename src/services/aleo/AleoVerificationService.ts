import { ALEO_CONFIG, CHAINS_CONFIG, isAleoEnabled } from '../../config/chains';

/**
 * Two complementary submission shapes are supported:
 *
 * 1. submitVerification(request) — structured benchmark-delta proofs
 *    Caller provides circuit name and public inputs.
 *    Returns AleoVerificationResult.
 *
 * 2. submitForVerification(payload) — relayer-based encrypted blob submission
 *    Caller provides encryptedData / metadataHash / solanaTxHash.
 *    Returns AleoSubmissionResult and supports checkVerificationStatus polling.
 *
 * Both routes are queue-friendly: when no relayer is configured, they
 * return a "queued" status without throwing.
 */

export interface AleoVerificationRequest {
  optimizationLogId: string;
  circuit: string;
  proof?: Uint8Array;
  publicInputs: Record<string, string | number | boolean>;
}

export interface AleoVerificationResult {
  submitted: boolean;
  verificationId?: string;
  txId?: string;
  status: 'disabled' | 'queued' | 'verified' | 'failed';
  error?: string;
}

export interface AleoSubmissionPayload {
  encryptedData: string;
  metadataHash: string;
  solanaTxHash: string;
  submitterAddress: string;
}

export interface AleoSubmissionResult {
  success: boolean;
  queueId?: string;
  aleoTxHash?: string;
  status: 'queued' | 'verified' | 'failed';
  message: string;
  explorerUrl?: string;
}

export class AleoVerificationService {
  private get relayerUrl(): string {
    return CHAINS_CONFIG.aleo.relayerUrl || ALEO_CONFIG.relayerUrl || '';
  }

  /**
   * Structured verification path used by EncryptedOptimizationLogForm
   * and the dual-chain submission helper. Carries circuit + publicInputs.
   */
  async submitVerification(request: AleoVerificationRequest): Promise<AleoVerificationResult> {
    if (!isAleoEnabled()) {
      return { submitted: false, status: 'disabled' };
    }

    if (!ALEO_CONFIG.programId) {
      return {
        submitted: false,
        status: 'failed',
        error: 'Aleo program ID missing. Set VITE_ALEO_PROGRAM_ID.',
      };
    }

    if (!this.relayerUrl) {
      return {
        submitted: true,
        status: 'queued',
        verificationId: this.buildVerificationId(request.optimizationLogId, request.circuit),
      };
    }

    try {
      const payload = {
        network: ALEO_CONFIG.network,
        programId: ALEO_CONFIG.programId,
        optimizationLogId: request.optimizationLogId,
        circuit: request.circuit,
        proof: request.proof ? Array.from(request.proof) : undefined,
        publicInputs: request.publicInputs,
      };

      const response = await fetch(`${this.relayerUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Aleo relayer failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        submitted: true,
        status: data.status || 'queued',
        verificationId: data.verificationId,
        txId: data.txId,
      };
    } catch (error) {
      return {
        submitted: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown Aleo error',
      };
    }
  }

  /**
   * Relayer-based encrypted-blob submission. Used by the dual-chain
   * orchestrator class for opaque payload routing.
   */
  async submitForVerification(payload: AleoSubmissionPayload): Promise<AleoSubmissionResult> {
    if (!isAleoEnabled() || !this.relayerUrl) {
      return {
        success: true,
        status: 'queued',
        message: 'Aleo verification queued - relayer not configured, will process when available',
      };
    }

    try {
      const response = await fetch(`${this.relayerUrl}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encrypted_data: payload.encryptedData,
          metadata_hash: payload.metadataHash,
          solana_tx_hash: payload.solanaTxHash,
          submitter_address: payload.submitterAddress,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Relayer returned ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        queueId: result.queue_id,
        aleoTxHash: result.aleo_tx_hash,
        status: result.status || 'queued',
        message: result.message || 'Submission queued for Aleo verification',
        explorerUrl: result.aleo_tx_hash
          ? `${CHAINS_CONFIG.aleo.explorerUrl}/${result.aleo_tx_hash}`
          : undefined,
      };
    } catch (error) {
      console.error('Aleo submission error:', error);
      return {
        success: false,
        status: 'failed',
        message: `Aleo submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async checkVerificationStatus(queueId: string): Promise<AleoSubmissionResult> {
    if (!isAleoEnabled() || !this.relayerUrl || !queueId) {
      return {
        success: false,
        status: 'queued',
        message: 'Cannot check status - Aleo not enabled or missing queue ID',
      };
    }

    try {
      const response = await fetch(`${this.relayerUrl}/status/${queueId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Status check returned ${response.status}`);
      }

      const result = await response.json();

      return {
        success: result.status !== 'failed',
        queueId,
        aleoTxHash: result.aleo_tx_hash,
        status: result.status,
        message: result.message || `Verification ${result.status}`,
        explorerUrl: result.aleo_tx_hash
          ? `${CHAINS_CONFIG.aleo.explorerUrl}/${result.aleo_tx_hash}`
          : undefined,
      };
    } catch (error) {
      console.error('Aleo status check error:', error);
      return {
        success: false,
        status: 'queued',
        message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  isConfigured(): boolean {
    return isAleoEnabled();
  }

  private buildVerificationId(optimizationLogId: string, circuit: string): string {
    return `${circuit}_${optimizationLogId}_${Date.now()}`;
  }
}

export const aleoVerificationService = new AleoVerificationService();
