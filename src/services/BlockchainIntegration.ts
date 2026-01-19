/**
 * Blockchain Integration for Case Study Submission
 * Handles end-to-end flow: encryption → blockchain submission → verification
 */

import { PublicKey } from '@solana/web3.js';
import { BlockchainService } from './BlockchainService';
import { encryptHealthData } from '../utils/encryption';

export interface BlockchainSubmissionResult {
  success: boolean;
  caseStudyPubkey?: PublicKey;
  transactionSignature?: string;
  error?: string;
  message: string;
}

export interface ValidationRequest {
  caseStudyPubkey: PublicKey;
  validatorAddress: PublicKey;
  validationType: 'quality' | 'accuracy' | 'safety';
}

/**
 * Submit encrypted case study to blockchain
 */
export async function submitCaseStudyToBlockchain(
  blockchainService: BlockchainService,
  walletAddress: PublicKey,
  signTransaction: (tx: any) => Promise<any>,
  formData: {
    treatmentProtocol: string;
    durationDays: number;
    costUSD: number;
    baselineMetrics: Record<string, any>;
    outcomeMetrics: Record<string, any>;
    sideEffects: any[];
    context?: string;
  },
  encryptionKey: Uint8Array
): Promise<BlockchainSubmissionResult> {
  try {
    // Encrypt sensitive data locally
    const encryptedBaseline = Buffer.from(
      encryptHealthData(JSON.stringify(formData.baselineMetrics), encryptionKey),
      'base64'
    );
    const encryptedOutcome = Buffer.from(
      encryptHealthData(JSON.stringify(formData.outcomeMetrics), encryptionKey),
      'base64'
    );

    // Submit to blockchain
    const result = await blockchainService.submitCaseStudy(
      walletAddress,
      signTransaction,
      {
        encryptedBaseline: new Uint8Array(encryptedBaseline),
        encryptedOutcome: new Uint8Array(encryptedOutcome),
        treatmentProtocol: formData.treatmentProtocol,
        durationDays: formData.durationDays,
        costUSD: formData.costUSD,
      }
    );

    return {
      success: true,
      caseStudyPubkey: result.caseStudyPubkey,
      transactionSignature: result.transactionSignature,
      message: `✅ Case study submitted to blockchain! Transaction: ${result.transactionSignature.slice(0, 20)}...`,
    };
  } catch (error) {
    console.error('Blockchain submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `❌ Failed to submit to blockchain: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

/**
 * Request validator to review case study
 * (This sends an on-chain permission grant)
 */
export async function requestValidatorReview(
  blockchainService: BlockchainService,
  caseStudyOwner: PublicKey,
  signTransaction: (tx: any) => Promise<any>,
  caseStudyPubkey: PublicKey,
  validatorAddress: PublicKey
): Promise<BlockchainSubmissionResult> {
  try {
    const result = await blockchainService.grantAccessPermission(
      caseStudyOwner,
      signTransaction,
      caseStudyPubkey,
      validatorAddress,
      0 // Permission type: read-only
    );

    return {
      success: true,
      transactionSignature: result.transactionSignature,
      message: `✅ Access granted to validator. Transaction: ${result.transactionSignature.slice(
        0,
        20
      )}...`,
    };
  } catch (error) {
    console.error('Permission grant error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `❌ Failed to grant access: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

/**
 * Fetch case study from blockchain and decrypt locally
 */
export async function fetchAndDecryptCaseStudy(
  blockchainService: BlockchainService,
  caseStudyPubkey: PublicKey,
  encryptionKey: Uint8Array,
  decryptFunction: (encrypted: string, key: Uint8Array) => string
): Promise<{
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}> {
  try {
    const caseStudy = await blockchainService.fetchCaseStudy(caseStudyPubkey);

    if (!caseStudy) {
      return {
        success: false,
        error: 'Case study not found on blockchain',
      };
    }

    // Convert encrypted data back to base64 for decryption
    const encryptedBaselineB64 = Buffer.from(caseStudy.encryptedBaseline).toString('base64');
    const encryptedOutcomeB64 = Buffer.from(caseStudy.encryptedOutcome).toString('base64');

    // Decrypt locally
    const decryptedBaseline = decryptFunction(encryptedBaselineB64, encryptionKey);
    const decryptedOutcome = decryptFunction(encryptedOutcomeB64, encryptionKey);

    return {
      success: true,
      data: {
        patientId: caseStudy.patientId.toString(),
        treatmentProtocol: caseStudy.treatmentProtocol,
        durationDays: caseStudy.durationDays,
        costUsd: caseStudy.costUsd,
        createdAt: new Date(caseStudy.createdAt * 1000),
        isApproved: caseStudy.isApproved,
        approvalCount: caseStudy.approvalCount,
        validationScore: caseStudy.validationScore,
        baselineMetrics: JSON.parse(decryptedBaseline),
        outcomeMetrics: JSON.parse(decryptedOutcome),
      },
    };
  } catch (error) {
    console.error('Fetch/decrypt error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Submit validator approval stake to blockchain
 */
export async function submitValidatorApproval(
  blockchainService: BlockchainService,
  validator: PublicKey,
  signTransaction: (tx: any) => Promise<any>,
  caseStudyPubkey: PublicKey,
  validationType: 'quality' | 'accuracy' | 'safety',
  approved: boolean
): Promise<BlockchainSubmissionResult> {
  try {
    const validationTypeMap = {
      quality: 0,
      accuracy: 1,
      safety: 2,
    };

    const result = await blockchainService.validateCaseStudy(
      validator,
      signTransaction,
      caseStudyPubkey,
      {
        caseStudyPubkey,
        validationType: validationTypeMap[validationType],
        approved,
      }
    );

    return {
      success: true,
      transactionSignature: result.transactionSignature,
      message: `✅ Validation submitted! You staked 10 EXPERIENCE tokens. ${
        approved ? 'Case study approved.' : 'Concerns flagged.'
      }`,
    };
  } catch (error) {
    console.error('Validator submission error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `❌ Failed to submit validation: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

/**
 * Get all case studies for display in UI
 */
export async function fetchUserCaseStudies(
  blockchainService: BlockchainService,
  userAddress: PublicKey
): Promise<{
  success: boolean;
  caseStudies?: Array<{
    pubkey: PublicKey;
    protocol: string;
    createdAt: Date;
    isApproved: boolean;
    approvalCount: number;
  }>;
  error?: string;
}> {
  try {
    const caseStudyPubkeys = await blockchainService.getCaseStudiesForPatient(userAddress);

    if (caseStudyPubkeys.length === 0) {
      return {
        success: true,
        caseStudies: [],
      };
    }

    // Fetch details for each case study (in real usage, batch this)
    const caseStudies = [];
    for (const pubkey of caseStudyPubkeys) {
      const caseStudy = await blockchainService.fetchCaseStudy(pubkey);
      if (caseStudy) {
        caseStudies.push({
          pubkey,
          protocol: caseStudy.treatmentProtocol,
          createdAt: new Date(caseStudy.createdAt * 1000),
          isApproved: caseStudy.isApproved,
          approvalCount: caseStudy.approvalCount,
        });
      }
    }

    return {
      success: true,
      caseStudies: caseStudies.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      ),
    };
  } catch (error) {
    console.error('Fetch case studies error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
