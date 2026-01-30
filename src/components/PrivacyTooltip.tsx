/**
 * PrivacyTooltip - Reusable privacy explanation component
 * 
 * Provides clear, jargon-free explanations of why privacy features matter.
 * Used across all forms to educate users without overwhelming them.
 * 
 * Core Principles:
 * - DRY: Single component for all privacy explanations
 * - CLEAN: Clear separation between UI and content
 * - MODULAR: Reusable across all forms
 */

import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

export type PrivacyTopic = 
  | 'encryption'
  | 'zk_proofs'
  | 'compression'
  | 'mpc'
  | 'wallet_key'
  | 'validator_privacy'
  | 'research_access';

interface PrivacyExplanation {
  title: string;
  shortExplanation: string;
  whyItMatters: string;
  withoutIt: string;
}

const PRIVACY_EXPLANATIONS: Record<PrivacyTopic, PrivacyExplanation> = {
  encryption: {
    title: 'Encryption',
    shortExplanation: 'Your data is locked with a key only you control',
    whyItMatters: 'Even if our servers are hacked, your health data remains unreadable without your wallet key.',
    withoutIt: 'Your sensitive health information could be exposed in a data breach.',
  },
  zk_proofs: {
    title: 'Zero-Knowledge Validation',
    shortExplanation: 'Prove your data is real without revealing the details',
    whyItMatters: 'Validators can confirm your submission is legitimate without seeing your symptoms, diagnoses, or treatment details.',
    withoutIt: 'Validators would need to see your sensitive health information to verify your submission.',
  },
  compression: {
    title: 'Data Compression',
    shortExplanation: 'Shrink your data to save 90% on storage costs',
    whyItMatters: 'Makes it affordable to store detailed health records on the blockchain.',
    withoutIt: 'Storage costs would be 10x higher, making detailed submissions prohibitively expensive.',
  },
  mpc: {
    title: 'Committee Approval',
    shortExplanation: 'Multiple validators must agree before anyone can access your data',
    whyItMatters: 'No single person—not even a researcher or platform admin—can view your data alone.',
    withoutIt: 'A single compromised account could expose your health information.',
  },
  wallet_key: {
    title: 'Wallet-Derived Key',
    shortExplanation: 'Your wallet creates a unique encryption key',
    whyItMatters: 'Only someone with access to your wallet can decrypt your data. We literally cannot access it.',
    withoutIt: 'The platform could potentially decrypt and view your health information.',
  },
  validator_privacy: {
    title: 'Validator Privacy',
    shortExplanation: 'Validators verify quality without seeing sensitive data',
    whyItMatters: 'Medical experts can ensure data quality while your privacy is preserved.',
    withoutIt: 'You would have to choose between privacy and data quality assurance.',
  },
  research_access: {
    title: 'Research Access',
    shortExplanation: 'Researchers can find patterns without seeing individual records',
    whyItMatters: 'Your data contributes to medical research while your identity and details stay private.',
    withoutIt: 'Research would require exposing patient identities and sensitive health details.',
  },
};

interface PrivacyTooltipProps {
  topic: PrivacyTopic;
  children: preact.ComponentChildren;
  variant?: 'inline' | 'section' | 'icon';
}

export const PrivacyTooltip: FunctionalComponent<PrivacyTooltipProps> = ({
  topic,
  children,
  variant = 'inline',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const explanation = PRIVACY_EXPLANATIONS[topic];

  // Icon-only variant (for compact UI)
  if (variant === 'icon') {
    return (
      <span class="relative inline-block group">
        {children}
        <span class="ml-1 text-slate-400 hover:text-purple-500 cursor-help transition-colors">
          ⓘ
        </span>
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-0 hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
          <strong class="block mb-1 text-purple-300">{explanation.title}</strong>
          {explanation.shortExplanation}
        </span>
      </span>
    );
  }

  // Section variant (for major form sections)
  if (variant === 'section') {
    return (
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          {children}
          <span 
            class="text-slate-400 hover:text-purple-500 cursor-pointer transition-colors text-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
        
        {isExpanded && (
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl animate-fadeIn">
            <p class="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <strong class="text-purple-700 dark:text-purple-400">Why this matters:</strong>{' '}
              {explanation.whyItMatters}
            </p>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              <strong class="text-red-600 dark:text-red-400">Without it:</strong>{' '}
              {explanation.withoutIt}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Inline variant (default - for labels and descriptions)
  return (
    <span class="relative inline-block">
      {children}
      <span class="group relative">
        <span class="ml-1 text-purple-500 hover:text-purple-700 cursor-help transition-colors text-sm">
          ⓘ
        </span>
        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <strong class="block mb-2 text-purple-700 dark:text-purple-400 text-xs uppercase tracking-widest">
            {explanation.title}
          </strong>
          <p class="mb-2">{explanation.shortExplanation}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">
            <strong>Why it matters:</strong> {explanation.whyItMatters}
          </p>
          <p class="text-xs text-red-500 dark:text-red-400">
            <strong>Without it:</strong> {explanation.withoutIt}
          </p>
        </span>
      </span>
    </span>
  );
};

// Convenience component for common privacy labels
export const PrivacyLabel: FunctionalComponent<{
  topic: PrivacyTopic;
  label: string;
}> = ({ topic, label }) => (
  <PrivacyTooltip topic={topic} variant="inline">
    <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
      {label}
    </span>
  </PrivacyTooltip>
);

export default PrivacyTooltip;
