import { useState, useEffect } from 'preact/hooks';
import { getProofHistory, type ProofRecord } from '../services/proofHistory';

/**
 * Shows the user's recent ZK proofs from localStorage.
 * Only renders if there are stored proofs.
 */
export function ProofHistory() {
  const [proofs, setProofs] = useState<ProofRecord[]>([]);

  useEffect(() => {
    setProofs(getProofHistory());
  }, []);

  if (proofs.length === 0) return null;

  return (
    <div class="bg-white dark:bg-slate-900 border-2 border-green-200 dark:border-green-800 rounded-xl overflow-hidden">
      <div class="px-5 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 class="font-bold text-slate-900 dark:text-white">Your recent proofs</h3>
      </div>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        {proofs.slice(0, 5).map((p, i) => (
          <a
            key={p.txHash || i}
            href={p.explorerUrl}
            target="_blank"
            rel="noreferrer"
            class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
              p.passed
                ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
            }`}>
              {p.passed ? '✓' : '✕'}
            </div>
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-slate-900 dark:text-white">
                  {p.metric ? p.metric.charAt(0).toUpperCase() + p.metric.slice(1) : 'Metric'}: {p.improvement}% improvement
                </span>
                <span class="text-[10px] font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                  {p.allianceId}
                </span>
              </div>
              <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {new Date(p.timestamp).toLocaleDateString()} {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <span class="text-slate-300 dark:text-slate-600 text-xs flex-shrink-0">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
