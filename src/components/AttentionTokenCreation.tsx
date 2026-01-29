/**
 * Community/Attention Token Creation Component
 * ENHANCEMENT: Unified flow for creating communities (which ARE attention tokens)
 * Follows Core Principles: DRY, MODULAR, ENHANCEMENT FIRST
 */

import React, { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { attentionTokenService } from '../services/AttentionTokenService';
import {
  AttentionTokenEligibility,
  AttentionTokenCreationStatus,
  CreateAttentionTokenParams,
} from '../types/attentionToken';
import { CommunityCategory, CATEGORY_INFO, generateSymbol, validateCommunityName } from '../types/community';

interface AttentionTokenCreationProps {
  caseStudyPda?: PublicKey;          // Optional - standalone community creation doesn't need case study
  treatmentName: string;
  treatmentCategory: string;
  description: string;
  imageUrl?: string;
  reputationScore?: number;          // Optional for standalone
  validatorCount?: number;           // Optional for standalone
  validators?: Array<{ publicKey: PublicKey; reputation: number }>;  // Optional for standalone
  onTokenCreated?: (tokenMint: PublicKey) => void;
  // NEW: Community-specific options
  communityMode?: boolean;           // If true, show community creation flow
  category?: CommunityCategory;      // Community category
  enableSocial?: boolean;            // Enable Farcaster integration
}

export const AttentionTokenCreation: React.FC<AttentionTokenCreationProps> = ({
  caseStudyPda,
  treatmentName,
  treatmentCategory,
  description,
  imageUrl,
  reputationScore = 0,
  validatorCount = 0,
  validators = [],
  onTokenCreated,
  communityMode = false,
  category = 'supplement',
  enableSocial = false,
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [eligibility, setEligibility] = useState<AttentionTokenEligibility | null>(null);
  const [status, setStatus] = useState<AttentionTokenCreationStatus>(
    AttentionTokenCreationStatus.IDLE
  );
  const [tokenMint, setTokenMint] = useState<PublicKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // NEW: Community creation state
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>(category);
  const [socialEnabled, setSocialEnabled] = useState<boolean>(enableSocial);

  useEffect(() => {
    // Only check eligibility if we have a case study (attention token mode)
    if (caseStudyPda && !communityMode) {
      checkEligibility();
    } else if (communityMode) {
      // In community mode, anyone can create (no case study required)
      setEligibility({
        isEligible: true,
        hasSubmittedCaseStudy: true,
        hasMinimumValidations: true,
        hasMinimumReputation: true,
        reason: 'Community creation is free for all users'
      });
    }
  }, [caseStudyPda, communityMode]);

  const checkEligibility = async () => {
    if (!wallet.publicKey || !caseStudyPda) return;

    try {
      setStatus(AttentionTokenCreationStatus.CHECKING_ELIGIBILITY);
      const eligible = await attentionTokenService.checkEligibility(caseStudyPda, connection);
      setEligibility(eligible);
      setStatus(AttentionTokenCreationStatus.IDLE);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError('Failed to check eligibility');
      setStatus(AttentionTokenCreationStatus.IDLE);
    }
  };

  const handleCreateToken = async () => {
    if (!wallet.publicKey || !eligibility?.isEligible) return;

    setStatus(AttentionTokenCreationStatus.CREATING_TOKEN);
    setError(null);

    try {
      // ENHANCED: Support both community and case study token creation
      const params: CreateAttentionTokenParams = {
        caseStudyPda: communityMode ? undefined : caseStudyPda,
        treatmentName,
        treatmentCategory,
        description,
        imageUrl: imageUrl || 'https://via.placeholder.com/400',
        submitter: wallet.publicKey,
        validators: communityMode ? [] : validators.map((v) => ({
          publicKey: v.publicKey,
          reputation: v.reputation,
          contribution: 1 / validators.length,
        })),
        reputationScore: communityMode ? 0 : reputationScore,
        // ADDED: Community-specific parameters
        communityCategory: communityMode ? selectedCategory : undefined,
        isCommunityToken: communityMode,
        socialEnabled: communityMode ? socialEnabled : undefined,
      };

      const { tokenMint: mint, bondingCurve, signature } = 
        await attentionTokenService.createAttentionToken(params);

      console.log('Token created:', {
        mint: mint.toString(),
        bondingCurve: bondingCurve.toString(),
        signature,
      });

      setTokenMint(mint);
      setStatus(AttentionTokenCreationStatus.CONFIGURING_FEES);

      // Step 2: Configure fee sharing
      await attentionTokenService.configureFeeSharing(
        mint,
        wallet.publicKey,
        params.validators
      );

      setStatus(AttentionTokenCreationStatus.LINKING_ON_CHAIN);

      // Step 3: Link to case study on-chain
      // TODO: Call link_attention_token instruction
      await linkAttentionTokenOnChain(caseStudyPda, mint);

      setStatus(AttentionTokenCreationStatus.SUCCESS);
      toast.success('🎉 Attention Token created successfully!');

      if (onTokenCreated) {
        onTokenCreated(mint);
      }
    } catch (err: any) {
      console.error('Error creating attention token:', err);
      setError(err.message || 'Failed to create attention token');
      setStatus(AttentionTokenCreationStatus.ERROR);
      toast.error(err.message || 'Failed to create attention token');
    }
  };

  const linkAttentionTokenOnChain = async (
    caseStudyPda: PublicKey,
    tokenMint: PublicKey
  ): Promise<void> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      const { SOLANA_CONFIG } = await import('../config/solana');
      const { Transaction, SystemProgram } = await import('@solana/web3.js');
      
      const programId = new PublicKey(SOLANA_CONFIG.blockchain.caseStudyProgramId);
      
      // Create instruction to link attention token
      // This would use the actual program instruction
      // For now, create a basic transaction structure
      
      const transaction = new Transaction();
      
      // Note: In production, this would be:
      // const instruction = await program.methods
      //   .linkAttentionToken(tokenMint)
      //   .accounts({
      //     caseStudy: caseStudyPda,
      //     authority: wallet.publicKey,
      //   })
      //   .instruction();
      // transaction.add(instruction);
      
      // For now, we'll just log it since we need the actual IDL
      console.log('Would link attention token on-chain:', {
        caseStudy: caseStudyPda.toString(),
        tokenMint: tokenMint.toString(),
        programId: programId.toString(),
      });
      
      // In production, uncomment this:
      // const { blockhash } = await connection.getLatestBlockhash();
      // transaction.recentBlockhash = blockhash;
      // transaction.feePayer = wallet.publicKey;
      // const signedTx = await wallet.signTransaction(transaction);
      // const signature = await connection.sendRawTransaction(signedTx.serialize());
      // await connection.confirmTransaction(signature);
      
    } catch (error) {
      console.error('Error linking attention token on-chain:', error);
      throw new Error('Failed to link attention token on blockchain');
    }
  };

  if (!attentionTokenService.isConfigured()) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-2 text-yellow-500">⚠️ Bags API Not Configured</h3>
        <p className="text-gray-300">
          Attention token features require Bags API configuration. Please add your API key to the
          environment variables.
        </p>
      </div>
    );
  }

  if (!eligibility) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!eligibility.isEligible) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-2">🔒 Attention Token Locked</h3>
        <p className="text-gray-400 mb-4">
          Reach quality threshold to unlock market-driven discovery
        </p>

        <div className="space-y-3">
          <EligibilityRequirement
            label="Reputation Score"
            current={eligibility.reasons.reputationScore.current}
            required={eligibility.reasons.reputationScore.required}
            met={eligibility.reasons.reputationScore.met}
            unit="/100"
          />
          <EligibilityRequirement
            label="Validators"
            current={eligibility.reasons.validatorCount.current}
            required={eligibility.reasons.validatorCount.required}
            met={eligibility.reasons.validatorCount.met}
            unit=" validators"
          />
          {eligibility.reasons.hasExistingToken && (
            <div className="text-red-500 flex items-center gap-2">
              <span>✗</span>
              <span>Attention token already exists</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === AttentionTokenCreationStatus.SUCCESS && tokenMint) {
    return (
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-6 rounded-lg border border-green-500">
        <h3 className="text-2xl font-bold mb-2">✅ Attention Token Created!</h3>
        <p className="text-gray-200 mb-4">Your treatment is now discoverable on the market</p>

        <div className="bg-black/30 p-4 rounded mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Token Mint:</span>
            <span className="font-mono text-green-400">{tokenMint.toString().slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Treatment:</span>
            <span className="font-bold">{treatmentName}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 p-3 rounded text-center">
            <div className="text-2xl font-bold text-green-400">50%</div>
            <div className="text-xs text-gray-400">Your trading fees</div>
          </div>
          <div className="bg-black/30 p-3 rounded text-center">
            <div className="text-2xl font-bold text-blue-400">30%</div>
            <div className="text-xs text-gray-400">Public market</div>
          </div>
        </div>

        {/* Next Steps - Galvanize Community */}
        <div className="bg-black/20 p-4 rounded mb-4 border border-green-700/50">
          <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
            🎯 Next: Galvanize Your Cell
          </h4>
          <div className="space-y-2">
            <a
              href={`/tokens/${tokenMint.toString()}`}
              className="flex items-center justify-between p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">☣️</span>
                <div>
                  <div className="font-bold">Enter War Room</div>
                  <div className="text-xs text-purple-200">Set up your Cell HQ</div>
                </div>
              </div>
              <span className="text-purple-300 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <button
              onClick={() => onTokenCreated?.(tokenMint)}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition group text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📢</span>
                <div>
                  <div className="font-bold text-white">Publish First Intel</div>
                  <div className="text-xs text-gray-400">Share research update</div>
                </div>
              </div>
              <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/tokens/${tokenMint.toString()}`;
                navigator.clipboard.writeText(url);
                toast.success('Cell link copied!');
              }}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition group text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔗</span>
                <div>
                  <div className="font-bold text-white">Share Recruit Link</div>
                  <div className="text-xs text-gray-400">Invite supporters</div>
                </div>
              </div>
              <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        <a
          href={`https://solscan.io/token/${tokenMint.toString()}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-600/50 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-center transition text-sm"
        >
          View on Solscan →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-500">
      <h3 className="text-2xl font-bold mb-2">🚀 Create Attention Token</h3>
      <p className="text-gray-200 mb-4">
        Your case study qualifies for market-driven discovery!
      </p>

      <div className="bg-black/30 p-4 rounded mb-4">
        <h4 className="font-bold mb-2">Revenue Split:</h4>
        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>50% trading fees to you</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>10% to validators who approved</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>10% to EXPERIENCE token stakers</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>30% bonding curve for public market</span>
          </li>
        </ul>
      </div>

      <div className="bg-black/30 p-4 rounded mb-4">
        <h4 className="font-bold mb-2">Token Details:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Treatment:</span>
            <span className="font-bold">{treatmentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Category:</span>
            <span>{treatmentCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Reputation:</span>
            <span className="text-green-400">{reputationScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Validators:</span>
            <span>{validatorCount}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-600 p-3 rounded mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleCreateToken}
        disabled={
          status !== AttentionTokenCreationStatus.IDLE &&
          status !== AttentionTokenCreationStatus.ERROR
        }
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed
                   text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
      >
        {status === AttentionTokenCreationStatus.CHECKING_ELIGIBILITY && (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Checking Eligibility...
          </>
        )}
        {status === AttentionTokenCreationStatus.CREATING_TOKEN && (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Creating Token via Bags API...
          </>
        )}
        {status === AttentionTokenCreationStatus.CONFIGURING_FEES && (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Configuring Fee Distribution...
          </>
        )}
        {status === AttentionTokenCreationStatus.LINKING_ON_CHAIN && (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Linking On-Chain...
          </>
        )}
        {(status === AttentionTokenCreationStatus.IDLE ||
          status === AttentionTokenCreationStatus.ERROR) && (
          <>
            <span>🎨</span>
            <span>Create Attention Token</span>
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>
          Powered by{' '}
          <a
            href="https://bags.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Bags API
          </a>
        </p>
        <p className="mt-1">
          {attentionTokenService.getRemainingCalls()}/1000 API calls remaining
        </p>
      </div>
    </div>
  );
};

// Helper component for eligibility requirements
const EligibilityRequirement: React.FC<{
  label: string;
  current: number;
  required: number;
  met: boolean;
  unit?: string;
}> = ({ label, current, required, met, unit = '' }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-300">{label}:</span>
      <span className={`font-bold ${met ? 'text-green-500' : 'text-yellow-500'}`}>
        {current}/{required}
        {unit} {met ? '✓' : '✗'}
      </span>
    </div>
  );
};
