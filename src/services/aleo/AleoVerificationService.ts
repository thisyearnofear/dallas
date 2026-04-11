import { ALEO_CONFIG, isAleoEnabled } from '../../config/chains';

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

/**
 * Thin Aleo adapter.
 *
 * This keeps Aleo integration isolated so Solana flow remains unchanged.
 * If a relayer is configured, it submits verification payload there.
 */
export class AleoVerificationService {
  async submitVerification(request: AleoVerificationRequest): Promise<AleoVerificationResult> {
    if (!isAleoEnabled()) {
      return {
        submitted: false,
        status: 'disabled',
      };
    }

    if (!ALEO_CONFIG.programId) {
      return {
        submitted: false,
        status: 'failed',
        error: 'Aleo program ID missing. Set VITE_ALEO_PROGRAM_ID.',
      };
    }

    if (!ALEO_CONFIG.relayerUrl) {
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

      const response = await fetch(`${ALEO_CONFIG.relayerUrl}/verify`, {
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

  private buildVerificationId(optimizationLogId: string, circuit: string): string {
    return `${circuit}_${optimizationLogId}_${Date.now()}`;
  }
}

export const aleoVerificationService = new AleoVerificationService();

