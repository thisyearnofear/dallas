import { isAleoEnabled, CHAINS_CONFIG } from '../../config/chains';

export interface RelayerSubmission {
  programId: string;
  functionName: string;
  inputs: string[];
  submitterAddress: string;
}

export interface RelayerResponse {
  success: boolean;
  queueId?: string;
  aleoTxHash?: string;
  status: 'queued' | 'processing' | 'verified' | 'failed';
  message: string;
  explorerUrl?: string;
}

export interface RelayerStatus {
  status: 'queued' | 'processing' | 'verified' | 'failed';
  queueId: string;
  aleoTxHash?: string;
  message: string;
  explorerUrl?: string;
}

class AleoRelayerService {
  private relayerUrl: string | null = null;

  constructor() {
    if (isAleoEnabled()) {
      this.relayerUrl = CHAINS_CONFIG.aleo.relayerUrl || null;
    }
  }

  isConfigured(): boolean {
    return isAleoEnabled() && !!this.relayerUrl;
  }

  async submitProgram(submission: RelayerSubmission): Promise<RelayerResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        status: 'failed',
        message: 'Relayer not configured. Set VITE_ALEO_RELAYER_URL in environment.',
      };
    }

    try {
      const response = await fetch(`${this.relayerUrl}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program_id: submission.programId,
          function: submission.functionName,
          inputs: submission.inputs,
          submitter: submission.submitterAddress,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Relayer error: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        queueId: result.queue_id,
        aleoTxHash: result.aleo_tx_hash,
        status: result.status || 'queued',
        message: result.message || 'Submission processed',
        explorerUrl: result.aleo_tx_hash
          ? `${CHAINS_CONFIG.aleo.explorerUrl}/${result.aleo_tx_hash}`
          : undefined,
      };
    } catch (error) {
      console.error('Relayer submission error:', error);
      return {
        success: false,
        status: 'failed',
        message: `Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async checkStatus(queueId: string): Promise<RelayerStatus> {
    if (!this.isConfigured() || !queueId) {
      return {
        status: 'failed',
        queueId,
        message: 'Relayer not configured or missing queue ID',
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
        throw new Error(`Status check error: ${response.status}`);
      }

      const result = await response.json();

      return {
        status: result.status,
        queueId,
        aleoTxHash: result.aleo_tx_hash,
        message: result.message || `Status: ${result.status}`,
        explorerUrl: result.aleo_tx_hash
          ? `${CHAINS_CONFIG.aleo.explorerUrl}/${result.aleo_tx_hash}`
          : undefined,
      };
    } catch (error) {
      console.error('Relayer status error:', error);
      return {
        status: 'failed',
        queueId,
        message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  getRelayerUrl(): string | null {
    return this.relayerUrl;
  }
}

export const aleoRelayerService = new AleoRelayerService();
export default AleoRelayerService;