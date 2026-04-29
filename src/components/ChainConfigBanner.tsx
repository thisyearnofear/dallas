import { getBlockchainConfigErrors, SOLANA_CONFIG } from '../config/solana';

export function ChainConfigBanner() {
  let errors: string[] = [];
  try {
    errors = getBlockchainConfigErrors();
  } catch {
    errors = ['Blockchain config error'];
  }

  if (errors.length === 0) return null;

  return (
    <div class="w-full border-b border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-3">
      <div class="max-w-6xl mx-auto flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="font-black">⚠ Chain not configured for {SOLANA_CONFIG.network}</div>
          <div class="text-sm font-semibold opacity-90">
            Some features are disabled until program IDs are set.
          </div>
          <ul class="mt-2 text-sm list-disc ml-5">
            {errors.slice(0, 4).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
        <div class="flex items-center gap-2">
          <a
            class="px-3 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-black text-sm"
            href="https://github.com/thisyearnofear/dallas/blob/main/docs/0_GETTING_STARTED.md"
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
