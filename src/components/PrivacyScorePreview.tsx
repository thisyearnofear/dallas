/**
 * PrivacyScorePreview - Real-time privacy score during submission
 * 
 * Shows users how their privacy protection increases as they complete steps.
 * Gamifies privacy to encourage best practices.
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Adds to existing forms
 * - CLEAN: Clear visual feedback
 * - MODULAR: Reusable across submission flows
 */

import { FunctionalComponent } from 'preact';
import { privacyService } from '../services/privacy';

interface PrivacyScorePreviewProps {
  score: number;
  features: {
    encryption: boolean;
    compression: boolean;
    compressionRatio?: number;
    zkProofs?: number;
  };
  variant?: 'compact' | 'full';
}

export const PrivacyScorePreview: FunctionalComponent<PrivacyScorePreviewProps> = ({
  score,
  features,
  variant = 'full',
}) => {
  const privacyLevel = privacyService.getPrivacyLevel(score);
  
  // Compact variant for forms
  if (variant === 'compact') {
    return (
      <div class={`p-4 rounded-xl border-2 ${
        score >= 70 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : score >= 40
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      }`}>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{privacyLevel.icon}</span>
            <div>
              <p class={`text-xs font-black uppercase tracking-widest ${
                score >= 70 
                  ? 'text-green-700 dark:text-green-400' 
                  : score >= 40
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                Privacy Score
              </p>
              <p class="text-2xl font-black tracking-tighter">
                {score}<span class="text-sm text-slate-400">/100</span>
              </p>
            </div>
          </div>
          <div class="text-right">
            <span class={`text-xs font-black uppercase px-3 py-1 rounded-full ${
              score >= 70 
                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' 
                : score >= 40
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
            }`}>
              {privacyLevel.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full variant with breakdown
  return (
    <div class={`p-6 rounded-2xl border-2 ${
      score >= 70 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : score >= 40
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }`}>
      {/* Header */}
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl">{privacyLevel.icon}</span>
          <div>
            <p class={`text-[10px] font-black uppercase tracking-widest ${
              score >= 70 
                ? 'text-green-700 dark:text-green-400' 
                : score >= 40
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              Your Privacy Protection
            </p>
            <p class="text-4xl font-black tracking-tighter">
              {score}<span class="text-xl text-slate-400">/100</span>
            </p>
          </div>
        </div>
        <span class={`text-sm font-black uppercase px-4 py-2 rounded-full ${
          score >= 70 
            ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' 
            : score >= 40
            ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
            : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
        }`}>
          {privacyLevel.label}
        </span>
      </div>

      {/* Feature Breakdown */}
      <div class="space-y-3">
        {/* Encryption */}
        <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
          <div class="flex items-center gap-3">
            <span class={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              features.encryption ? 'bg-green-500 text-white' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
              {features.encryption ? '✓' : '○'}
            </span>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Wallet-Locked Encryption</span>
          </div>
          <span class={`text-xs font-black ${features.encryption ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
            {features.encryption ? '+20' : '—'}
          </span>
        </div>

        {/* Compression */}
        <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
          <div class="flex items-center gap-3">
            <span class={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              features.compression ? 'bg-green-500 text-white' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
              {features.compression ? '✓' : '○'}
            </span>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
              Storage Saver {features.compressionRatio && `(${features.compressionRatio}x)`}
            </span>
          </div>
          <span class={`text-xs font-black ${features.compression ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
            {features.compression ? '+20' : '—'}
          </span>
        </div>

        {/* ZK Proofs */}
        <div class="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
          <div class="flex items-center gap-3">
            <span class={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              features.zkProofs && features.zkProofs > 0 ? 'bg-green-500 text-white' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
              {features.zkProofs && features.zkProofs > 0 ? '✓' : '○'}
            </span>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
              Zero-Knowledge Validation {features.zkProofs && `(${features.zkProofs} proofs)`}
            </span>
          </div>
          <span class={`text-xs font-black ${features.zkProofs && features.zkProofs > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
            {features.zkProofs && features.zkProofs > 0 ? '+30' : '—'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div class="mt-6">
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            class={`h-full rounded-full transition-all duration-500 ${
              score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-blue-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      {score < 100 && (
        <div class="mt-4 p-3 bg-white/30 dark:bg-black/10 rounded-lg">
          <p class="text-xs text-slate-600 dark:text-slate-400">
            <strong>Tip:</strong> {score < 40 
              ? 'Enable compression to increase your privacy score and save on storage costs.' 
              : score < 70 
              ? 'Complete validation with Zero-Knowledge proofs for maximum privacy protection.'
              : 'Great job! Your submission has excellent privacy protection.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PrivacyScorePreview;
