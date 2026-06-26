import type { SupportedChain } from '../config/chains';

export interface VerificationRequest {
  optimizationLogId: string;
  circuit: string;
  proof?: Uint8Array;
  publicInputs: Record<string, string | number | boolean>;
}

export interface VerificationResult {
  submitted: boolean;
  verificationId?: string;
  txId?: string;
  status: 'disabled' | 'pending' | 'queued' | 'verified' | 'verifying' | 'failed';
  error?: string;
  explorerUrl?: string;
}

export interface VerificationAdapter {
  readonly chainId: SupportedChain;
  submit(request: VerificationRequest): Promise<VerificationResult>;
  checkStatus(verificationId: string): Promise<VerificationResult>;
  isConfigured(): boolean;
  getExplorerUrl(txId: string): string;
}
