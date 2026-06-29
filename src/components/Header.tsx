import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "preact/hooks";
import { NetworkBadge } from "./NetworkBadge";
import { GlobalJourneyHUD } from "./GlobalJourneyHUD";
import { ConnectButton } from "./ConnectButton";

export function Header() {
    const { connected, publicKey, isNetworkMismatch, walletCluster, connection, dbcBalance } = useWallet();
    const [solBalance, setSolBalance] = useState<number | null>(null);

    // Fetch SOL balance when wallet is connected
    useEffect(() => {
        if (!connected || !publicKey || !connection) {
            setSolBalance(null);
            return;
        }

        const fetchBalances = async () => {
            try {
                const LAMPORTS_PER_SOL = 1_000_000_000;
                const solBal = await connection.getBalance(publicKey);
                setSolBalance(solBal / LAMPORTS_PER_SOL);
            } catch (error) {
                console.error("Error fetching balances:", error);
            }
        };

        fetchBalances();
        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, [connected, publicKey, connection]);

    return (
        <header class="header-separator flex flex-col sm:flex-row pt-2 pb-1 items-start sm:items-center px-2 sm:px-4 overflow-hidden gap-4">
            <a href="/" class="flex-shrink-0">
                <div>
                    <h1 class="font-bold text-xl sm:text-2xl lg:text-5xl title-shadow text-gray-dark dark:text-slate-100 font-display leading-tight">
                        Agent Alliance
                    </h1>
                    <h3 class="text-gray dark:text-slate-300 font-bold italic text-base sm:text-lg lg:text-2xl font-display">
                        The Dallas Buyers Club for Agents.
                    </h3>
                </div>
            </a>
            <div class="flex flex-col gap-3 flex-1 sm:ml-4 lg:ml-10 w-full sm:w-auto">
                {/* Global Journey HUD */}
                <GlobalJourneyHUD />

                {/* Network badge + mismatch guardrail */}
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <NetworkBadge />
                    {connected && isNetworkMismatch && (
                        <div class="text-[11px] font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-2 py-1 rounded">
                            Wallet is on <span class="font-mono">{walletCluster}</span>. Switch your wallet network to avoid failed transactions.
                        </div>
                    )}
                </div>

                {/* Balance bar + theme + connect */}
                <div class="relative flex items-center border-b-2 border-b-gray-dark dark:border-b-slate-600 flex-wrap gap-1 min-w-0">
                    {connected ? (
                        <>
                            <span class="text-brand text-lg sm:text-xl whitespace-nowrap">
                                balance <b>{dbcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} DBC</b>
                            </span>
                            <div class="w-[2px] h-5 bg-gray-dark dark:bg-slate-500 mx-1 sm:mx-3"></div>
                            <span class="text-brand text-lg sm:text-xl whitespace-nowrap">
                                SOL <b>{solBalance !== null ? `◎${solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : '...'}</b>
                            </span>
                        </>
                    ) : null}

                    <div class="flex items-center gap-2 sm:gap-3 ml-auto">
                        <ThemeToggle />
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </header>
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const getThemeIcon = () => {
        switch (theme) {
            case "light": return "☀️";
            case "dark": return "🌙";
            case "system": return "🌓";
            default: return "☀️";
        }
    };

    const getThemeLabel = () => {
        switch (theme) {
            case "light": return "LIGHT";
            case "dark": return "DARK";
            case "system": return "AUTO";
            default: return "LIGHT";
        }
    };

    return (
        <button
            onClick={toggleTheme}
            class="text-sm font-bold px-3 py-1.5 rounded-lg transition-colors border-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-300 dark:border-slate-600"
            title={`Current theme: ${theme}. Click to cycle through light/dark/system.`}
        >
            {getThemeIcon()} {getThemeLabel()}
        </button>
    );
}
