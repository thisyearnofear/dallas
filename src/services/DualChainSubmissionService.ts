import { PublicKey } from '@solana/web3.js';
import {
  BlockchainPrivacyOptions,
  BlockchainSubmissionResult,
  submitOptimizationLogToBlockchain,
} from './BlockchainIntegration';
import {
  aleoVerificationService,
  AleoVerificationResult,
  AleoSubmissionResult,
} from './aleo';
import { isAleoEnabled, CHAINS_CONFIG } from '../config/chains';

export interface OptimizationLogSubmissionFormData {
  architectureProtocol: string;
  durationDays: number;
  costUSD: number;
  baselineMetrics: Record<string, number | string | boolean>;
  outcomeMetrics: Record<string, number | string | boolean>;
  sideEffects: Array<Record<string, number | string | boolean>>;
  context?: string;
}

export interface DualChainStatus {
  solana: {
    confirmed: boolean;
    txHash?: string;
    logId?: string;
    explorerUrl?: string;
  };
  aleo: {
    status: 'pending' | 'verifying' | 'verified' | 'failed' | 'disabled';
    queueId?: string;
    txHash?: string;
    explorerUrl?: string;
  };
}

export interface DualChainSubmissionResult {
  success: boolean;
  solana: BlockchainSubmissionResult;
  aleo?: AleoVerificationResult;
  aleoSubmission?: AleoSubmissionResult;
  dualStatus: DualChainStatus;
  message: string;
}

export interface DualChainSubmissionParams {
  walletAddress: PublicKey;
  signTransaction: (tx: any) => Promise<any>;
  formData: OptimizationLogSubmissionFormData;
  encryptionKey: Uint8Array;
  privacyOptions?: BlockchainPrivacyOptions;
  compressedData?: {
    compressedAccount: string;
    achievedRatio: number;
    compressionProof: number[];
  };
}

function buildAleoPublicInputs(formData: OptimizationLogSubmissionFormData) {
  return {
    baselineLatencySeverity: Number(formData.baselineMetrics.latencySeverity || 0),
    outcomeLatencySeverity: Number(formData.outcomeMetrics.latencySeverity || 0),
    durationDays: formData.durationDays,
    costUSD: formData.costUSD,
  };
}

function emptyAleoStatus(): DualChainStatus['aleo'] {
  return isAleoEnabled() ? { status: 'pending' } : { status: 'disabled' };
}

function mapStructuredAleoToStatus(
  aleo: AleoVerificationResult,
): DualChainStatus['aleo'] {
  const map: Record<AleoVerificationResult['status'], DualChainStatus['aleo']['status']> = {
    disabled: 'disabled',
    queued: 'pending',
    verified: 'verified',
    failed: 'failed',
  };
  return {
    status: map[aleo.status],
    queueId: aleo.verificationId,
    txHash: aleo.txId,
    explorerUrl: aleo.txId
      ? `${CHAINS_CONFIG.aleo.explorerUrl}/${aleo.txId}`
      : undefined,
  };
}

async function runSolanaSubmission(
  params: DualChainSubmissionParams,
): Promise<BlockchainSubmissionResult> {
  return submitOptimizationLogToBlockchain(
    params.walletAddress,
    params.signTransaction,
    params.formData,
    params.encryptionKey,
    params.privacyOptions,
  );
}

/**
 * High-level function form (preferred for components):
 * submits to Solana, then optionally requests structured Aleo verification.
 * Returns BOTH the structured `aleo` result and the `dualStatus` snapshot
 * so UIs that consume either shape continue to work.
 */
export async function submitOptimizationLogDualChain(
  walletAddress: PublicKey,
  signTransaction: (tx: any) => Promise<any>,
  formData: OptimizationLogSubmissionFormData,
  encryptionKey: Uint8Array,
  privacyOptions?: BlockchainPrivacyOptions,
  compressedData?: DualChainSubmissionParams['compressedData'],
): Promise<DualChainSubmissionResult> {
  return dualChainSubmissionService.submit({
    walletAddress,
    signTransaction,
    formData,
    encryptionKey,
    privacyOptions,
    compressedData,
  });
}

/**
 * Class form (preferred for orchestration / testing).
 * Wraps Solana submission + structured Aleo verification + dualStatus.
 */
class DualChainSubmissionService {
  async submit(params: DualChainSubmissionParams): Promise<DualChainSubmissionResult> {
    const dualStatus: DualChainStatus = {
      solana: { confirmed: false },
      aleo: emptyAleoStatus(),
    };

    let solanaResult: BlockchainSubmissionResult;

    try {
      solanaResult = await runSolanaSubmission(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        solana: { success: false, message: `Dual-chain submission error: ${message}` },
        dualStatus,
        message: `Submission failed: ${message}`,
      };
    }

    if (!solanaResult.success || !solanaResult.optimizationLogPubkey) {
      return {
        success: false,
        solana: solanaResult,
        dualStatus,
        message: `Solana submission failed: ${solanaResult.message}`,
      };
    }

    dualStatus.solana = {
      confirmed: true,
      txHash: solanaResult.transactionSignature,
      logId: solanaResult.optimizationLogPubkey.toString(),
      explorerUrl: solanaResult.transactionSignature
        ? `https://explorer.solana.com/tx/${solanaResult.transactionSignature}?cluster=devnet`
        : undefined,
    };

    if (!isAleoEnabled()) {
      return {
        success: true,
        solana: solanaResult,
        dualStatus,
        message: solanaResult.message,
      };
    }

    const aleoResult = await aleoVerificationService.submitVerification({
      optimizationLogId: solanaResult.optimizationLogPubkey.toBase58(),
      circuit: 'benchmark_delta',
      publicInputs: buildAleoPublicInputs(params.formData),
    });

    dualStatus.aleo = mapStructuredAleoToStatus(aleoResult);

    return {
      success: true,
      solana: solanaResult,
      aleo: aleoResult,
      dualStatus,
      message: `${solanaResult.message}${aleoResult.error ? `\n\nAleo: ${aleoResult.error}` : ''}`,
    };
  }

  async pollAleoStatus(queueId: string): Promise<AleoSubmissionResult> {
    return aleoVerificationService.checkVerificationStatus(queueId);
  }
}

export const dualChainSubmissionService = new DualChainSubmissionService();
