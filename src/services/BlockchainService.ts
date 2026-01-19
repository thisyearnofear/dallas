/**
 * Blockchain Service for Dallas Buyers Club
 * 
 * Handles interactions with Solana smart contracts:
 * - Case study submission & encrypted storage
 * - Validator staking & slashing mechanism
 * - EXPERIENCE token minting & burning
 * 
 * Privacy-first design:
 * - All health data encrypted before blockchain submission
 * - Platform cannot decrypt without user permission
 * - On-chain access control (patient-granted)
 */

import {
  PublicKey,
  Connection,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface CaseStudyData {
  encryptedBaseline: Uint8Array;
  encryptedOutcome: Uint8Array;
  treatmentProtocol: string;
  durationDays: number;
  costUSD: number;
}

export interface ValidatorStakeData {
  caseStudyPubkey: PublicKey;
  validationType: number; // 0=quality, 1=accuracy, 2=safety
  approved: boolean;
}

export interface CaseStudyAccount {
  patientId: PublicKey;
  encryptedBaseline: Uint8Array;
  encryptedOutcome: Uint8Array;
  treatmentProtocol: string;
  durationDays: number;
  costUsd: number;
  createdAt: number;
  isApproved: boolean;
  approvalCount: number;
  validationScore: number;
  bump: number;
}

export class BlockchainService {
  private connection: Connection;
  private caseStudyProgramId: PublicKey;
  private experienceTokenProgramId: PublicKey;
  private experienceMint: PublicKey;

  /**
   * Initialize BlockchainService with program addresses
   * 
   * @param rpcEndpoint - Solana RPC endpoint (e.g., https://api.devnet.solana.com)
   * @param caseStudyProgramId - Case study program ID from solpgf deployment
   * @param experienceTokenProgramId - EXPERIENCE token program ID from solpgf deployment
   * @param experienceMint - EXPERIENCE token mint address
   * 
   * @throws Error if any address is invalid
   */
  constructor(
    rpcEndpoint: string,
    caseStudyProgramId: string,
    experienceTokenProgramId: string,
    experienceMint: string
  ) {
    try {
      this.connection = new Connection(rpcEndpoint, 'confirmed');
      this.caseStudyProgramId = new PublicKey(caseStudyProgramId);
      this.experienceTokenProgramId = new PublicKey(experienceTokenProgramId);
      this.experienceMint = new PublicKey(experienceMint);
    } catch (error) {
      throw new Error(
        `Invalid program addresses. Make sure you've deployed contracts to solpgf first. Error: ${error}`
      );
    }
  }

  /**
   * Submit encrypted case study to blockchain
   */
  async submitCaseStudy(
    payer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    caseStudyData: CaseStudyData
  ): Promise<{
    caseStudyPubkey: PublicKey;
    transactionSignature: string;
  }> {
    // Derive PDA for case study account
    const timestamp = Math.floor(Date.now() / 1000);
    const [caseStudyPda, bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('case_study'),
        payer.toBuffer(),
        Buffer.from(timestamp.toString('hex')),
      ],
      this.caseStudyProgramId
    );

    // Create transaction to submit case study
    const transaction = new Transaction({
      feePayer: payer,
      recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
    });

    // Add instruction to submit case study
    // This is a simplified example - in real usage, you'd use the Anchor client
    const instruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: caseStudyPda,
      lamports: await this.connection.getMinimumBalanceForRentExemption(
        8 + 32 + 4 + 10000 + 4 + 10000 + 4 + 500 + 4 + 4 + 8 + 1 + 4 + 4 + 1
      ),
      space: 8 + 32 + 4 + 10000 + 4 + 10000 + 4 + 500 + 4 + 4 + 8 + 1 + 4 + 4 + 1,
      programId: this.caseStudyProgramId,
    });

    transaction.add(instruction);

    // Sign and send transaction
    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize()
    );

    await this.connection.confirmTransaction(signature, 'confirmed');

    return {
      caseStudyPubkey: caseStudyPda,
      transactionSignature: signature,
    };
  }

  /**
   * Fetch case study from blockchain
   */
  async fetchCaseStudy(caseStudyPubkey: PublicKey): Promise<CaseStudyAccount | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(caseStudyPubkey);
      if (!accountInfo) return null;

      // Decode account data (simplified - in real usage, use Anchor client)
      const data = accountInfo.data;
      
      // This is a placeholder - actual decoding would parse the Anchor account structure
      return {
        patientId: new PublicKey(data.slice(8, 40)),
        encryptedBaseline: new Uint8Array(data.slice(40, 10044)),
        encryptedOutcome: new Uint8Array(data.slice(10044, 20048)),
        treatmentProtocol: Buffer.from(data.slice(20048, 20552)).toString(),
        durationDays: data.readUInt32LE(20552),
        costUsd: data.readUInt32LE(20556),
        createdAt: Number(data.readBigInt64LE(20560)),
        isApproved: data[20568] === 1,
        approvalCount: data.readUInt32LE(20569),
        validationScore: data.readUInt32LE(20573),
        bump: data[20577],
      };
    } catch (error) {
      console.error('Error fetching case study:', error);
      return null;
    }
  }

  /**
   * Stake EXPERIENCE tokens to validate a case study
   */
  async validateCaseStudy(
    payer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    caseStudyPubkey: PublicKey,
    validatorData: ValidatorStakeData
  ): Promise<{
    validatorStakePubkey: PublicKey;
    transactionSignature: string;
  }> {
    // Create validator stake account PDA
    const [validatorStakePda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('validator_stake'),
        payer.toBuffer(),
        caseStudyPubkey.toBuffer(),
      ],
      this.caseStudyProgramId
    );

    const transaction = new Transaction({
      feePayer: payer,
      recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
    });

    // Create account for validator stake
    const instruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: validatorStakePda,
      lamports: await this.connection.getMinimumBalanceForRentExemption(
        8 + 32 + 32 + 8 + 1 + 1 + 8 + 1
      ),
      space: 8 + 32 + 32 + 8 + 1 + 1 + 8 + 1,
      programId: this.caseStudyProgramId,
    });

    transaction.add(instruction);

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize()
    );

    await this.connection.confirmTransaction(signature, 'confirmed');

    return {
      validatorStakePubkey: validatorStakePda,
      transactionSignature: signature,
    };
  }

  /**
   * Reward user with EXPERIENCE tokens
   */
  async rewardExperienceTokens(
    authority: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    recipient: PublicKey,
    amount: number,
    reason: 'case_study_submission' | 'validation'
  ): Promise<string> {
    const transaction = new Transaction({
      feePayer: authority,
      recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
    });

    // In real usage, this would be an Anchor instruction to mint EXPERIENCE tokens
    // This is a placeholder

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize()
    );

    await this.connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }

  /**
   * Slash validator's EXPERIENCE tokens
   */
  async slashValidator(
    authority: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    validatorStakePubkey: PublicKey,
    reason: string
  ): Promise<string> {
    const transaction = new Transaction({
      feePayer: authority,
      recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
    });

    // In real usage, this would be an Anchor instruction to burn EXPERIENCE tokens
    // This is a placeholder

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize()
    );

    await this.connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }

  /**
   * Grant access permission to validator
   */
  async grantAccessPermission(
    payer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    caseStudyPubkey: PublicKey,
    grantee: PublicKey,
    permissionType: number
  ): Promise<{
    accessPermissionPubkey: PublicKey;
    transactionSignature: string;
  }> {
    // Derive PDA for access permission
    const [accessPermissionPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('access_permission'),
        caseStudyPubkey.toBuffer(),
        grantee.toBuffer(),
      ],
      this.caseStudyProgramId
    );

    const transaction = new Transaction({
      feePayer: payer,
      recentBlockhash: (await this.connection.getLatestBlockhash()).blockhash,
    });

    // Add instruction to grant access
    const instruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: accessPermissionPda,
      lamports: await this.connection.getMinimumBalanceForRentExemption(
        8 + 32 + 32 + 1 + 8
      ),
      space: 8 + 32 + 32 + 1 + 8,
      programId: this.caseStudyProgramId,
    });

    transaction.add(instruction);

    const signedTx = await signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize()
    );

    await this.connection.confirmTransaction(signature, 'confirmed');

    return {
      accessPermissionPubkey: accessPermissionPda,
      transactionSignature: signature,
    };
  }

  /**
   * Get all case studies for a patient
   */
  async getCaseStudiesForPatient(patientPubkey: PublicKey): Promise<PublicKey[]> {
    try {
      const accounts = await this.connection.getProgramAccounts(
        this.caseStudyProgramId,
        {
          filters: [
            {
              memcmp: {
                offset: 8, // Skip discriminator
                bytes: patientPubkey.toBase58(),
              },
            },
          ],
        }
      );

      return accounts.map((account) => account.pubkey);
    } catch (error) {
      console.error('Error getting case studies:', error);
      return [];
    }
  }

  /**
   * Get all validator stakes for a case study
   */
  async getValidatorStakesForCaseStudy(
    caseStudyPubkey: PublicKey
  ): Promise<PublicKey[]> {
    try {
      const accounts = await this.connection.getProgramAccounts(
        this.caseStudyProgramId,
        {
          filters: [
            {
              memcmp: {
                offset: 40, // Skip discriminator + patient_id
                bytes: caseStudyPubkey.toBase58(),
              },
            },
          ],
        }
      );

      return accounts.map((account) => account.pubkey);
    } catch (error) {
      console.error('Error getting validator stakes:', error);
      return [];
    }
  }
}
