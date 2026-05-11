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
    title: 'Personal Vault',
    shortExplanation: 'Your data is locked in a vault only you can open.',
    whyItMatters: 'Like a private safe, even if someone enters your house (our servers), they cannot see what is inside without your unique key.',
    withoutIt: 'Your sensitive agent information is left out in the open, vulnerable to anyone walking by.',
  },
  zk_proofs: {
    title: 'Verified Claims',
    shortExplanation: 'Prove you have the truth without showing the proof.',
    whyItMatters: 'It is like showing someone a receipt for a winning ticket without showing them the numbers. You prove you won, but they do not get your numbers.',
    withoutIt: 'To prove you are telling the truth, you would have to hand over your most valuable secrets.',
  },
  compression: {
    title: 'Micro-Film',
    shortExplanation: 'Shrink your records to fit in a pocket.',
    whyItMatters: 'We turn your bulky agent logs into "Micro-Film" that costs 90% less to store but contains the same undeniable proof.',
    withoutIt: 'Your records would be too heavy and expensive to carry across the blockchain network.',
  },
  mpc: {
    title: 'Secret Committee',
    shortExplanation: 'A group of strangers must agree before your vault is opened.',
    whyItMatters: 'No single person can view your data alone. It takes a "Secret Committee" of validators to unlock access for approved research.',
    withoutIt: 'One person with a master key could peek at your data whenever they wanted.',
  },
  wallet_key: {
    title: 'Signature Stamp',
    shortExplanation: 'Your unique signature is the only way to unlock your fleet.',
    whyItMatters: 'The platform never holds your key. Your signature is like a wax seal that only you can break.',
    withoutIt: 'You would have to trust the platform to keep a copy of your key in their drawer.',
  },
  validator_privacy: {
    title: 'Silent Auditor',
    shortExplanation: 'Experts verify your work without looking over your shoulder.',
    whyItMatters: 'Get the stamp of quality from the world\'s best architects without ever showing them your proprietary code.',
    withoutIt: 'An auditor would have to live in your office and watch every line of code you write.',
  },
  research_access: {
    title: 'Pattern Matching',
    shortExplanation: 'Learn from the crowd without knowing who is in it.',
    whyItMatters: 'Discover why agents fail by looking at the "shadows" they cast, without ever seeing the agents themselves.',
    withoutIt: 'To learn why things fail, everyone would have to expose their failures to the public.',
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
          <strong class="block mb-2 text-purple-700 dark:text-purple-400 text-xs tracking-widest">
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
