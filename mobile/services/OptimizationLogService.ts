/**
 * Optimization Log Service — Mobile
 * Submits encrypted agent performance benchmarks on-chain.
 * Reuses the same program ID and instruction layout as the web BlockchainService.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { SOLANA_CONFIG, getRpcEndpoint } from '../config/solana';

export interface OptimizationLogSubmission {
  /** Base58 public key of the submitting agent/developer */
  agentPublicKey: string;
  /** Encrypted baseline metrics (e.g., pass@1 before optimization) */
  encryptedBaseline: Uint8Array;
  /** Encrypted outcome metrics (e.g., pass@1 after optimization) */
  encryptedOutcome: Uint8Array;
  /** Architecture / protocol tag (e.g., "chain-of-thought", "tool-use-v2") */
  architectureProtocol: string;
  /** Duration of the optimization experiment in days */
  durationDays: number;
  /** Estimated cost in USD */
  costUSD: number;
}

export interface SubmissionResult {
  signature: string;
  accountPubkey: string;
  success: boolean;
  error?: string;
}

export class OptimizationLogService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(getRpcEndpoint(), 'confirmed');
    this.programId = new PublicKey(SOLANA_CONFIG.blockchain.optimizationLogProgramId);
  }

  /**
   * Builds the submit transaction. Caller signs and sends via MWA (useWallet.signAndSendTransaction).
   */
  async buildSubmitTransaction(submission: OptimizationLogSubmission): Promise<Transaction> {
    const agentPubkey = new PublicKey(submission.agentPublicKey);

    // Derive PDA for the optimization log account
    const [logPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('optimization_log'), agentPubkey.toBuffer()],
      this.programId,
    );

    // 0.10 USDC fee represented as lamports for devnet demo (swap for USDC transfer on mainnet)
    const feeLamports = Math.floor(SOLANA_CONFIG.fees.optimizationLogSubmit * LAMPORTS_PER_SOL * 0.001);

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: agentPubkey,
        toPubkey: new PublicKey(SOLANA_CONFIG.treasuryAddress),
        lamports: feeLamports,
      }),
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = agentPubkey;

    return tx;
  }

  /** Fetch recent optimization logs for the feed */
  async fetchRecentLogs(limit = 20): Promise<{ pubkey: string; protocol: string; approved: boolean }[]> {
    try {
      const accounts = await this.connection.getProgramAccounts(this.programId, {
        dataSlice: { offset: 0, length: 64 },
        filters: [{ dataSize: 256 }],
      });
      return accounts.slice(0, limit).map(({ pubkey }) => ({
        pubkey: pubkey.toBase58(),
        protocol: 'unknown',
        approved: false,
      }));
    } catch {
      return [];
    }
  }
}

export const optimizationLogService = new OptimizationLogService();
