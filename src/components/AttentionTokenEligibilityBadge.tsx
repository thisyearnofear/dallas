/**
 * Attention Token Eligibility Badge
 * Shows if a case study is eligible for attention token creation
 */

import React from 'react';
import { SOLANA_CONFIG } from '../config/solana';

interface AttentionTokenEligibilityBadgeProps {
  reputationScore: number;
  validatorCount: number;
  hasAttentionToken: boolean;
  compact?: boolean;
}

export const AttentionTokenEligibilityBadge: React.FC<AttentionTokenEligibilityBadgeProps> = ({
  reputationScore,
  validatorCount,
  hasAttentionToken,
  compact = false,
}) => {
  const { minReputationScore, minValidators } = SOLANA_CONFIG.attentionToken;

  const reputationMet = reputationScore >= minReputationScore;
  const validatorsMet = validatorCount >= minValidators;
  const isEligible = reputationMet && validatorsMet && !hasAttentionToken;

  if (hasAttentionToken) {
    return (
      <div className={`${compact ? 'inline-flex' : 'flex'} items-center gap-2 bg-green-900/30 border border-green-600 px-3 py-2 rounded`}>
        <span className="text-green-400">💎</span>
        <div className="text-sm">
          <div className="font-bold text-green-400">Token Created</div>
          {!compact && <div className="text-xs text-gray-400">Trading on market</div>}
        </div>
      </div>
    );
  }

  if (isEligible) {
    return (
      <div className={`${compact ? 'inline-flex' : 'flex'} items-center gap-2 bg-purple-900/30 border border-purple-600 px-3 py-2 rounded animate-pulse-slow`}>
        <span className="text-purple-400">🚀</span>
        <div className="text-sm">
          <div className="font-bold text-purple-400">Token Eligible!</div>
          {!compact && <div className="text-xs text-gray-400">Create your attention token</div>}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs">
        <span>🔒</span>
        <span className="text-gray-400">
          {reputationScore}/{minReputationScore} rep
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-3 py-2 rounded">
      <span className="text-gray-400">🔒</span>
      <div className="text-sm">
        <div className="font-bold text-gray-400">Token Locked</div>
        <div className="text-xs text-gray-500">
          Need {minReputationScore - reputationScore} more reputation, {minValidators - validatorCount} more validators
        </div>
      </div>
    </div>
  );
};

/**
 * Attention Token Progress Bar
 * Shows progress towards token eligibility
 */
interface AttentionTokenProgressProps {
  reputationScore: number;
  validatorCount: number;
}

export const AttentionTokenProgress: React.FC<AttentionTokenProgressProps> = ({
  reputationScore,
  validatorCount,
}) => {
  const { minReputationScore, minValidators } = SOLANA_CONFIG.attentionToken;

  const reputationProgress = Math.min((reputationScore / minReputationScore) * 100, 100);
  const validatorProgress = Math.min((validatorCount / minValidators) * 100, 100);
  const overallProgress = (reputationProgress + validatorProgress) / 2;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Token Eligibility Progress</span>
        <span className="font-bold text-purple-400">{Math.round(overallProgress)}%</span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500">Reputation</div>
          <div className={reputationScore >= minReputationScore ? 'text-green-400' : 'text-yellow-400'}>
            {reputationScore}/{minReputationScore} {reputationScore >= minReputationScore ? '✓' : ''}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Validators</div>
          <div className={validatorCount >= minValidators ? 'text-green-400' : 'text-yellow-400'}>
            {validatorCount}/{minValidators} {validatorCount >= minValidators ? '✓' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
