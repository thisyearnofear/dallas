import { getBlockchainConfigErrors } from '../config/solana';
import { getEnabledChains, getChainReadiness, type SupportedChain } from '../config/chains';

interface ChainIssue {
  chain: string;
  reason: string;
}

export function ChainConfigBanner() {
  const issues: ChainIssue[] = [];

  // Stellar / Aleo readiness (Stellar first — it's the load-bearing ZK chain)
  for (const chain of getEnabledChains()) {
    const r = getChainReadiness(chain.id as SupportedChain);
    if (r.enabled && !r.ready) {
      issues.push({ chain: chain.name, reason: r.reason });
    }
  }

  // Solana program-id config errors
  let solanaErrors: string[] = [];
  try {
    solanaErrors = getBlockchainConfigErrors();
  } catch {
    solanaErrors = ['Solana config error'];
  }
  if (solanaErrors.length > 0) {
    issues.push({ chain: 'Solana', reason: solanaErrors.slice(0, 4).join('; ') });
  }

  if (issues.length === 0) return null;

  const stellarIssue = issues.find((i) => i.chain === 'Stellar');
  const headline = stellarIssue
    ? `⚠ Stellar ZK verification not fully configured`
    : `⚠ Some chains not fully configured`;

  return (
    <div class="w-full border-b border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-3">
      <div class="max-w-6xl mx-auto flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="font-black">{headline}</div>
          <div class="text-sm font-semibold opacity-90">
            The app still runs — disabled chains are skipped during submission.
          </div>
          <ul class="mt-2 text-sm list-disc ml-5">
            {issues.map((i) => (
              <li key={i.chain}><strong>{i.chain}:</strong> {i.reason}</li>
            ))}
          </ul>
        </div>
        <div class="flex items-center gap-2">
          <a
            class="px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-black text-sm"
            href="https://github.com/thisyearnofear/dallas/blob/main/docs/DEPLOYMENT.md"
            target="_blank"
            rel="noreferrer"
          >
            Setup Docs
          </a>
        </div>
      </div>
    </div>
  );
}
