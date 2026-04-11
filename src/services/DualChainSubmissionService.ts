import { PublicKey } from '@solana/web3.js';
import {
  BlockchainPrivacyOptions,
  BlockchainSubmissionResult,
  submitOptimizationLogToBlockchain,
} from './BlockchainIntegration';
import { aleoVerificationService, AleoVerificationResult } from './aleo';
import { isAleoEnabled } from '../config/chains';

export interface OptimizationLogSubmissionFormData {
  architectureProtocol: string;
  durationDays: number;
  costUSD: number;
  baselineMetrics: Record<string, number | string | boolean>;
  outcomeMetrics: Record<string, number | string | boolean>;
  sideEffects: Array<Record<string, number | string | boolean>>;
  context?: string;
}

export interface DualChainSubmissionResult {
  solana: BlockchainSubmissionResult;
  aleo?: AleoVerificationResult;
}

export async function submitOptimizationLogDualChain(
  walletAddress: PublicKey,
  signTransaction: (tx: any) => Promise<any>,
  formData: OptimizationLogSubmissionFormData,
  encryptionKey: Uint8Array,
  privacyOptions?: BlockchainPrivacyOptions
): Promise<DualChainSubmissionResult> {
  const solanaResult = await submitOptimizationLogToBlockchain(
    walletAddress,
    signTransaction,
    formData,
    encryptionKey,
    privacyOptions
  );

  if (!solanaResult.success || !solanaResult.optimizationLogPubkey || !isAleoEnabled()) {
    return { solana: solanaResult };
  }

  const aleoResult = await aleoVerificationService.submitVerification({
    optimizationLogId: solanaResult.optimizationLogPubkey.toBase58(),
    circuit: 'benchmark_delta',
    publicInputs: {
      baselineLatencySeverity: Number(formData.baselineMetrics.latencySeverity || 0),
      outcomeLatencySeverity: Number(formData.outcomeMetrics.latencySeverity || 0),
      durationDays: formData.durationDays,
      costUSD: formData.costUSD,
    },
  });

  return {
    solana: solanaResult,
    aleo: aleoResult,
  };
}
