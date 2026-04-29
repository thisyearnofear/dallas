import { SOLANA_CONFIG } from "../config/solana";
import { useWallet } from "../context/WalletContext";

function networkLabel(n: string) {
  if (n === "mainnet-beta") return "MAINNET";
  return n.toUpperCase();
}

function networkColor(n: string) {
  switch (n) {
    case "mainnet-beta":
      return "bg-red-600 text-white border-red-800";
    case "testnet":
      return "bg-yellow-500 text-black border-yellow-700";
    case "devnet":
    default:
      return "bg-blue-600 text-white border-blue-800";
  }
}

export function NetworkBadge() {
  const { walletCluster, isNetworkMismatch } = useWallet();

  const app = SOLANA_CONFIG.network;
  const badgeClass = networkColor(app);

  return (
    <div class="flex items-center gap-2">
      <span
        class={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${badgeClass}`}
        title={`App network: ${app}`}
      >
        ⛓ {networkLabel(app)}
      </span>

      {walletCluster && (
        <span
          class={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${
            isNetworkMismatch
              ? "bg-orange-100 text-orange-900 border-orange-300"
              : "bg-green-100 text-green-900 border-green-300"
          }`}
          title={`Wallet network: ${walletCluster}`}
        >
          👛 {networkLabel(walletCluster)}
        </span>
      )}

      {isNetworkMismatch && (
        <span
          class="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border bg-orange-600 text-white border-orange-800"
          title="Network mismatch: switch your wallet cluster to match the app, or change VITE_SOLANA_NETWORK."
        >
          ⚠ MISMATCH
        </span>
      )}
    </div>
  );
}

