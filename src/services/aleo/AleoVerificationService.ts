import { isAleoEnabled, CHAINS_CONFIG } from '../../config/chains';

export interface AleoSubmissionResult {
  success: boolean;
  queueId?: string;
  aleoTxHash?: string;
  status: 'queued' | 'verified' | 'failed';
  message: string;
  explorerUrl?: string;
}

export interface AleoSubmissionPayload {
  encryptedData: string;
  metadataHash: string;
  solanaTxHash: string;
  submitterAddress: string;
}

class AleoVerificationService {
  private relayerUrl: string | null = null;

  constructor() {
    if (isAleoEnabled()) {
      this.relayerUrl = CHAINS_CONFIG.aleo.relayerUrl || null;
    }
  }

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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
}

export const aleoVerificationService = new AleoVerificationService();
