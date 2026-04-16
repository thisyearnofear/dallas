import { PublicKey } from '@solana/web3.js';
import { isAleoEnabled } from '../config/chains';
import { aleoVerificationService, AleoSubmissionResult } from './aleo';
import { BlockchainSubmissionResult, submitOptimizationLogToBlockchain } from './BlockchainIntegration';

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
  aleo?: AleoSubmissionResult;
  dualStatus: DualChainStatus;
  message: string;
}

export interface DualChainSubmissionParams {
  walletAddress: PublicKey;
  signTransaction: (tx: any) => Promise<any>;
  formData: {
    architectureProtocol: string;
    durationDays: number;
    costUSD: number;
    baselineMetrics: Record<string, any>;
    outcomeMetrics: Record<string, any>;
    sideEffects: any[];
    context?: string;
  };
  encryptionKey: Uint8Array;
  privacyOptions?: {
    usePrivacyCash?: boolean;
    useShadowWire?: boolean;
    compressionRatio?: number;
  };
  compressedData?: {
    compressedAccount: string;
    achievedRatio: number;
    compressionProof: number[];
  };
}

class DualChainSubmissionService {
  async submit(params: DualChainSubmissionParams): Promise<DualChainSubmissionResult> {
    const initialStatus: DualChainStatus = {
      solana: { confirmed: false },
      aleo: isAleoEnabled() ? { status: 'pending' } : { status: 'disabled' },
    };

    let solanaResult: BlockchainSubmissionResult;

    try {
      solanaResult = await submitOptimizationLogToBlockchain(
        params.walletAddress,
        params.signTransaction,
        params.formData,
        params.encryptionKey,
        params.privacyOptions
      );

      if (!solanaResult.success) {
        return {
          success: false,
          solana: solanaResult,
          dualStatus: initialStatus,
          message: `Solana submission failed: ${solanaResult.message}`,
        };
      }

      initialStatus.solana = {
        confirmed: true,
        txHash: solanaResult.transactionSignature,
        logId: solanaResult.optimizationLogPubkey?.toString(),
        explorerUrl: solanaResult.transactionSignature
          ? `https://explorer.solana.com/tx/${solanaResult.transactionSignature}?cluster=devnet`
          : undefined,
      };

      if (isAleoEnabled()) {
        const encryptedData = Buffer.from(
          JSON.stringify(params.formData)
        ).toString('base64');
        const metadataHash = Buffer.from(params.encryptionKey).toString('base64').slice(0, 32);

        const aleoResult = await aleoVerificationService.submitForVerification({
          encryptedData,
          metadataHash,
          solanaTxHash: solanaResult.transactionSignature || '',
          submitterAddress: params.walletAddress.toString(),
        });

        initialStatus.aleo = {
          status: aleoResult.status === 'queued' ? 'pending' : aleoResult.status,
          queueId: aleoResult.queueId,
          txHash: aleoResult.aleoTxHash,
          explorerUrl: aleoResult.explorerUrl,
        };

        return {
          success: true,
          solana: solanaResult,
          aleo: aleoResult,
          dualStatus: initialStatus,
          message: `${solanaResult.message}\n\n${aleoResult.message}`,
        };
      }

      return {
        success: true,
        solana: solanaResult,
        dualStatus: initialStatus,
        message: solanaResult.message,
      };
    } catch (error) {
      return {
        success: false,
        solana: {
          success: false,
          message: `Dual-chain submission error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        dualStatus: initialStatus,
        message: `Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async pollAleoStatus(queueId: string): Promise<AleoSubmissionResult> {
    return aleoVerificationService.checkVerificationStatus(queueId);
  }
}

export const dualChainSubmissionService = new DualChainSubmissionService();
