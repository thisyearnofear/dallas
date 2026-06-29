import { CHAINS_CONFIG, getEnabledChains, getChainReadiness, type ChainConfig } from "../config/chains";
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

const ROLE_LABEL: Record<ChainConfig["role"], string> = {
  zk_verification: "ZK Verify",
  public_coordination: "Coordination",
  private_verification: "Private Verify",
};

function chainGlyph(id: ChainConfig["id"]) {
  return id === "stellar" ? "★" : id === "aleo" ? "◈" : "◎";
}

export function NetworkBadge() {
  const { walletCluster, isNetworkMismatch } = useWallet();

  // Stellar (zk_verification) first and prominent, Solana second, Aleo only if enabled.
  const enabled = getEnabledChains();
  const ordered = [
    CHAINS_CONFIG.stellar,
    CHAINS_CONFIG.solana,
    CHAINS_CONFIG.aleo,
  ].filter((c) => enabled.some((e) => e.id === c.id));

  const app = SOLANA_CONFIG.network;

  return (
    <div class="flex items-center gap-1.5 flex-wrap">
      {ordered.map((chain) => {
        const readiness = getChainReadiness(chain.id);
        const ready = readiness.ready;
        const isStellar = chain.id === "stellar";
        return (
          <span
            key={chain.id}
            class={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${
              isStellar
                ? "bg-purple-600 text-white border-purple-800"
                : chain.id === "aleo"
                  ? "bg-orange-500 text-white border-orange-700"
                  : networkColor(app)
            } ${ready ? "" : "opacity-60"}`}
            title={`${chain.name} · ${ROLE_LABEL[chain.role]}${ready ? "" : ` — ${readiness.reason}`}`}
          >
            {chainGlyph(chain.id)} {chain.name} · {ROLE_LABEL[chain.role]}
            {!ready && " ⚠"}
          </span>
        );
      })}

      {walletCluster && (
        <span
          class={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${
            isNetworkMismatch
              ? "bg-orange-100 text-orange-900 border-orange-300"
              : "bg-green-100 text-green-900 border-green-300"
          }`}
          title={`Solana wallet cluster: ${walletCluster}`}
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
