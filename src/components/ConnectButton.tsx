import { useState } from 'preact/hooks';
import { useWallet } from '../context/WalletContext';

function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Unified wallet connection button.
 *
 * Shows a single "Connect" button that opens a modal offering chain choice.
 * Currently only Solana (Phantom) is functional; the modal sets up the pattern
 * for adding Stellar and other chains later.
 */
export function ConnectButton() {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const handleSolanaConnect = async () => {
    try {
      await connect();
      setShowModal(false);
    } catch (error) {
      console.error('Solana connection error:', error);
    }
  };

  // ── Connected state: show address + disconnect ──
  if (connected && publicKey) {
    return (
      <div class="flex items-center gap-2">
        <span
          class="text-xs sm:text-sm font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
          title={publicKey.toString()}
        >
          {shortenAddress(publicKey.toString())}
        </span>
        <button
          onClick={disconnect}
          class="text-xs font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          title="Disconnect wallet"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // ── Disconnected: single Connect button → modal ──
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={connecting}
        class="bg-brand hover:bg-brand-accent text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
      >
        {connecting ? '⏳ Connecting…' : '🔗 Connect'}
      </button>

      {showModal && (
        <div
          class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Connect wallet"
          onClick={() => setShowModal(false)}
        >
          <div
            class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white">Connect Wallet</h3>
              <button
                onClick={() => setShowModal(false)}
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-4 space-y-3">
              {/* Solana / Phantom */}
              <button
                onClick={handleSolanaConnect}
                disabled={connecting}
                class="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left disabled:opacity-50"
              >
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  ◎
                </div>
                <div class="flex-grow min-w-0">
                  <div class="font-bold text-slate-900 dark:text-white">Solana</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">Phantom · for alliances & tokens</div>
                </div>
                {connecting && <span class="animate-spin text-purple-500">★</span>}
              </button>

              {/* Stellar (coming soon) */}
              <div class="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed text-left">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  ★
                </div>
                <div class="flex-grow min-w-0">
                  <div class="font-bold text-slate-700 dark:text-slate-300">Stellar</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">Coming soon · for ZK attestations</div>
                </div>
                <span class="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">SOON</span>
              </div>
            </div>
            <div class="px-5 pb-4 text-[11px] text-slate-400 dark:text-slate-500">
              The ZK proof flow doesn't need a wallet — it runs in your browser and the server
              submits to Soroban. Connect only if you want to join alliances or trade tokens.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
