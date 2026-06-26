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
import { stellarVerificationService } from './stellar';
import { isAleoEnabled, isStellarEnabled, CHAINS_CONFIG, type SupportedChain } from '../config/chains';
import type { VerificationResult } from './VerificationAdapter';

export interface OptimizationLogSubmissionFormData {
  architectureProtocol: string;
  durationDays: number;
  costUSD: number;
  baselineMetrics: any;
  outcomeMetrics: any;
  sideEffects: object[];
  context?: string;
}

export interface ChainStatus {
  confirmed: boolean;
  txHash?: string;
  explorerUrl?: string;
}

export interface VerifierStatus {
  status: 'pending' | 'verifying' | 'verified' | 'failed' | 'disabled';
  verificationId?: string;
  txHash?: string;
  explorerUrl?: string;
}

export interface DualChainStatus {
  solana: ChainStatus;
  aleo: VerifierStatus;
  /** @deprecated Use `verifications` map instead */
}

export interface MultiChainStatus {
  solana: ChainStatus;
  /** Map of chainId → verification status for all enabled verifiers */
  verifications: Partial<Record<Exclude<SupportedChain, 'solana'>, VerifierStatus>>;
}

export interface DualChainSubmissionResult {
  success: boolean;
  solana: BlockchainSubmissionResult;
  aleo?: AleoVerificationResult;
  aleoSubmission?: AleoSubmissionResult;
  stellar?: VerificationResult;
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
    verificationId: aleo.verificationId,
    txHash: aleo.txId,
    explorerUrl: aleo.txId
      ? `${CHAINS_CONFIG.aleo.explorerUrl}/${aleo.txId}`
      : undefined,
  };
}

function mapVerificationResult(v: VerificationResult): VerifierStatus {
  const map: Record<string, VerifierStatus['status']> = {
    disabled: 'disabled',
    pending: 'pending',
    queued: 'pending',
    verifying: 'verifying',
    verified: 'verified',
    failed: 'failed',
  };
  return {
    status: map[v.status] || 'failed',
    verificationId: v.verificationId,
    txHash: v.txId,
    explorerUrl: v.explorerUrl,
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
 * Orchestrates Solana submission → Stellar verification (headline) → Aleo verification (optional).
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

    const optimizationLogId = solanaResult.optimizationLogPubkey.toBase58();
    dualStatus.solana = {
      confirmed: true,
      txHash: solanaResult.transactionSignature,
      logId: optimizationLogId,
      explorerUrl: solanaResult.transactionSignature
        ? `https://explorer.solana.com/tx/${solanaResult.transactionSignature}?cluster=devnet`
        : undefined,
    };

    // Stellar: headline ZK verification (runs by default when enabled)
    let stellarResult: VerificationResult | undefined;
    if (isStellarEnabled()) {
      stellarResult = await stellarVerificationService.submit({
        optimizationLogId,
        circuit: 'benchmark_delta',
        publicInputs: buildAleoPublicInputs(params.formData),
      });
    }

    // Aleo: optional private verification
    let aleoResult: AleoVerificationResult | undefined;
    if (isAleoEnabled()) {
      aleoResult = await aleoVerificationService.submitVerification({
        optimizationLogId,
        circuit: 'benchmark_delta',
        publicInputs: buildAleoPublicInputs(params.formData),
      });

      dualStatus.aleo = mapStructuredAleoToStatus(aleoResult);
    }

    const stellarMsg = stellarResult?.error ? `\n\nStellar: ${stellarResult.error}` : '';
    const aleoMsg = aleoResult?.error ? `\n\nAleo: ${aleoResult.error}` : '';

    return {
      success: true,
      solana: solanaResult,
      aleo: aleoResult,
      stellar: stellarResult,
      aleoSubmission: undefined,
      dualStatus,
      message: `${solanaResult.message}${stellarMsg}${aleoMsg}`,
    };
  }

  async pollAleoStatus(queueId: string): Promise<AleoSubmissionResult> {
    return aleoVerificationService.checkVerificationStatus(queueId);
  }

  async pollStellarStatus(verificationId: string): Promise<VerificationResult> {
    return stellarVerificationService.checkStatus(verificationId);
  }
}

export const dualChainSubmissionService = new DualChainSubmissionService();
