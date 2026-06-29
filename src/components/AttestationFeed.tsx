import { useState, useEffect } from "preact/hooks";

interface Attestation {
  allianceId: string;
  submissionId: string;
  passed: boolean;
  threshold: number;
  ledger: number;
  timestamp: number;
  txHash: string;
  explorerUrl: string;
}

/**
 * Live feed of recent ZK attestations from the Soroban contract.
 * Queries the /api/stellar-attestations endpoint which fetches ATST
 * events from Stellar RPC.
 */
export function AttestationFeed() {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchFeed = async () => {
      try {
        const res = await fetch("/api/stellar-attestations");
        const data = await res.json();
        if (!cancelled) {
          setAttestations(data.attestations || []);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="animate-spin text-purple-500">★</span>
          <span class="text-sm text-slate-400 dark:text-slate-500">Loading recent attestations...</span>
        </div>
      </div>
    );
  }

  if (error || attestations.length === 0) {
    return (
      <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <h3 class="font-bold text-slate-900 dark:text-white mb-2">Recent attestations</h3>
        <p class="text-sm text-slate-400 dark:text-slate-500">
          {error
            ? "Could not reach Stellar RPC. The feed will retry automatically."
            : "No attestations found yet. Run the proof above to anchor the first one."}
        </p>
      </div>
    );
  }

  return (
    <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div class="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 class="font-bold text-slate-900 dark:text-white">Recent attestations</h3>
        <span class="text-[10px] font-black bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          LIVE
        </span>
      </div>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        {attestations.map((a, i) => (
          <a
            key={a.txHash || i}
            href={a.explorerUrl}
            target="_blank"
            rel="noreferrer"
            class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
              a.passed
                ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
            }`}>
              {a.passed ? "✓" : "✕"}
            </div>
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-slate-900 dark:text-white">
                  {a.passed ? "Proved" : "Failed"} {a.threshold}% improvement
                </span>
                <span class="text-[10px] font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                  {a.allianceId}
                </span>
              </div>
              <div class="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {a.txHash ? `${a.txHash.slice(0, 12)}...${a.txHash.slice(-8)}` : `ledger ${a.ledger}`}
              </div>
            </div>
            <span class="text-slate-300 dark:text-slate-600 text-xs flex-shrink-0">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
