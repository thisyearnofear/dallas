import type { SupportedChain } from '../config/chains';

export interface VerificationRequest {
  optimizationLogId: string;
  circuit: string;
  allianceId: string;
  proof?: Uint8Array;
  /** Base64-encoded public inputs bytes (from browser-side proving) */
  publicInputsBytes?: Uint8Array;
  publicInputs: Record<string, string | number | boolean>;
}

export interface VerificationAttestation {
  submissionId: string;
  allianceId: string;
  passed: boolean;
  threshold: number;
}

export interface VerificationResult {
  submitted: boolean;
  verificationId?: string;
  txId?: string;
  status: 'disabled' | 'pending' | 'queued' | 'verified' | 'verifying' | 'failed';
  error?: string;
  explorerUrl?: string;
  attestation?: VerificationAttestation;
}

export interface VerificationAdapter {
  readonly chainId: SupportedChain;
  submit(request: VerificationRequest): Promise<VerificationResult>;
  checkStatus(verificationId: string): Promise<VerificationResult>;
  isConfigured(): boolean;
  getExplorerUrl(txId: string): string;
}
