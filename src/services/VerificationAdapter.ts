import type { SupportedChain } from '../config/chains';

export interface VerificationRequest {
  optimizationLogId: string;
  circuit: string;
  allianceId: string;
  /** Base64-encoded UltraHonk proof bytes (generated in browser via bb.js) */
  proofBytes?: string;
  /** Base64-encoded public inputs (32-byte field elements, concatenated) */
  publicInputsBytes?: string;
  /** Legacy field — unused in the current browser-proving flow */
  publicInputs?: Record<string, string | number | boolean>;
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
