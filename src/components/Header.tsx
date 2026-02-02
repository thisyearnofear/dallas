import { meta } from "./constants";
import { WalletButton } from "./WalletButton";
import { useWallet } from "../context/WalletContext";
import { encryptionService } from "../services/EncryptionService";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "preact/hooks";
import { useConnection } from "@solana/wallet-adapter-react";
import { fetchDbcBalance, formatDbc } from "../services/DbcTokenService";
import { SOLANA_CONFIG } from "../config/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { privacyService } from "../services/privacy/PrivacyService";
import { cacheService } from "../services/CacheService";

export function Header() {
    const { connected, signMessage, publicKey } = useWallet();
    const { connection } = useConnection();
    const { settings, toggleSetting } = useSettings();
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [dbcBalance, setDbcBalance] = useState<number | null>(null);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [privacyScore, setPrivacyScore] = useState(0);
    const [privacyLevel, setPrivacyLevel] = useState(privacyService.getPrivacyLevel(0));

    useEffect(() => {
        // Check if we're using a temporary session key or a wallet-derived key
        const checkSovereignty = () => {
            setIsEncrypted(encryptionService.isWalletKeyActive());

            // Fetch privacy score from cache or calculate
            const cachedStats = cacheService.get('privacy_dashboard_stats') as any;
            if (cachedStats) {
                setPrivacyScore(cachedStats.overallPrivacyScore);
                setPrivacyLevel(privacyService.getPrivacyLevel(cachedStats.overallPrivacyScore));
            } else if (publicKey) {
                // Fallback: estimate if service is available
                if (privacyService.isInitialized()) {
                    const estimated = privacyService.calculatePrivacyScore({
                        hasEncryption: encryptionService.isWalletKeyActive(),
                        zkProofCount: 2, // Assume some activity if returning
                        hasCompression: true,
                        hasMPC: encryptionService.isWalletKeyActive()
                    });
                    setPrivacyScore(estimated);
                    setPrivacyLevel(privacyService.getPrivacyLevel(estimated));
                }
            }
        };
        // Initial check
        checkSovereignty();
        // Poll for changes
        const interval = setInterval(checkSovereignty, 2000);
        return () => clearInterval(interval);
    }, [publicKey]);

    // Fetch DBC and SOL balances when wallet is connected
    useEffect(() => {
        if (!connected || !publicKey || !connection) {
            setDbcBalance(null);
            setSolBalance(null);
            return;
        }

        const fetchBalances = async () => {
            try {
                // Fetch DBC balance
                const { balance: dbcBal } = await fetchDbcBalance(connection, publicKey);
                setDbcBalance(dbcBal);

                // Fetch SOL balance
                const solBal = await connection.getBalance(publicKey);
                setSolBalance(solBal / LAMPORTS_PER_SOL);
            } catch (error) {
                console.error("Error fetching balances:", error);
            }
        };

        fetchBalances();

        // Refresh balances every 30 seconds
        const interval = setInterval(fetchBalances, 30000);
        return () => clearInterval(interval);
    }, [connected, publicKey, connection]);

    const handleDecrypt = async () => {
        if (!connected) return;
        setIsDecrypting(true);
        try {
            const message = new TextEncoder().encode("Authenticate Dallas Buyers Club Identity Node");
            const signature = await signMessage(message);
            await encryptionService.initializeWithSignature(signature);
            setIsEncrypted(true);
        } catch (error) {
            console.error("Decryption failed:", error);
            alert("Authentication failed. " + error.message);
        } finally {
            setIsDecrypting(false);
        }
    };

    return (
        <header class="header-separator flex flex-col sm:flex-row pt-2 pb-1 items-start sm:items-center px-2 sm:px-4 overflow-hidden gap-4">
            <a href="/" class="flex-shrink-0">
                <div>
                    <h1 class="font-bold text-xl sm:text-2xl lg:text-5xl title-shadow text-gray-dark font-sans leading-tight">
                        Dallas Buyers Club
                    </h1>
                    <h3 class="text-gray font-bold italic text-base sm:text-lg lg:text-2xl font-sans">
                        Welcome to the club.
                    </h3>
                </div>
            </a>
            <div class="flex flex-col gap-3 flex-1 sm:ml-4 lg:ml-10 w-full sm:w-auto">
                <div class="relative flex items-center border-b-2 border-b-gray-dark flex-wrap gap-1 min-w-0">
                    <a class="text-brand text-lg sm:text-xl cursor-not-allowed whitespace-nowrap">
                        {connected && dbcBalance !== null ? (
                            <>balance <b>{dbcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} DBC</b></>
                        ) : (
                            <>messages <b>420</b></>
                        )}
                    </a>
                    <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                    <a class="text-brand text-lg sm:text-xl cursor-not-allowed whitespace-nowrap">
                        orders <b>69</b>
                    </a>
                    <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                    <a class="text-brand text-lg sm:text-xl cursor-not-allowed whitespace-nowrap">
                        {connected && solBalance !== null ? (
                            <>account <b>◎{solBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</b></>
                        ) : (
                            <>account <b>&#8383;80085</b></>
                        )}
                    </a>
                    {connected && !isEncrypted && (
                        <>
                            <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                            <button
                                onClick={handleDecrypt}
                                disabled={isDecrypting}
                                class="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-3 py-1 rounded shadow-md transition-colors animate-pulse"
                            >
                                {isDecrypting ? "AUTHENTICATING..." : "🛑 AUTHENTICATE NODE"}
                            </button>
                        </>
                    )}
                    {connected && isEncrypted && (
                        <>
                            <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                            <span class="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
                                🔐 SECURE
                            </span>
                            <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-2"></div>
                            <a
                                href="/underground"
                                class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all group"
                            >
                                <span class="text-xs">{privacyLevel.icon}</span>
                                <span class="text-[10px] font-black uppercase tracking-tighter text-slate-500 group-hover:text-brand">Sovereignty:</span>
                                <span class={`text-[10px] font-black ${privacyScore > 80 ? 'text-purple-500' :
                                    privacyScore > 50 ? 'text-green-500' : 'text-blue-500'
                                    }`}>
                                    {privacyScore}%
                                </span>
                            </a>
                        </>
                    )}

                    {/* Popup Toggle */}
                    <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                    <button
                        onClick={() => toggleSetting("popupsEnabled")}
                        class={`text-sm font-bold px-3 py-1 rounded shadow-md transition-colors border-2 ${settings.popupsEnabled
                            ? "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-700 animate-pulse"
                            : "bg-white hover:bg-gray-100 text-gray-900 border-gray-400 shadow-lg"
                            }`}
                        title={settings.popupsEnabled ? "Disable 90s popups" : "Enable 90s popups"}
                    >
                        {settings.popupsEnabled ? "🎲 POPUPS ON" : "🚫 POPUPS OFF"}
                    </button>

                    {/* Theme Toggle */}
                    <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                    <ThemeToggle />
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    {/* Search Section */}
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                        <label class="text-gray-dark text-base sm:text-lg font-bold whitespace-nowrap hidden sm:block">
                            Search
                        </label>
                        <div class="flex flex-1 min-w-0">
                            <input
                                class="search-bar flex-1 min-w-0 background-white-secondary text-gray-dark text-base sm:text-lg border-[1px] border-gray-light px-3 py-2 disabled:cursor-not-allowed rounded-l-lg"
                                disabled
                                placeholder="Search..."
                            />
                            <input
                                class="text-base sm:text-lg text-gray-dark px-3 search-button py-2 border-[1px] border-gray-light disabled:cursor-not-allowed rounded-r-lg"
                                type="button"
                                value="Go"
                                disabled
                            />
                        </div>
                    </div>

                    {/* Wallet/User Section */}
                    <div class="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:ml-auto">
                        <WalletButton />
                        <div class="hidden sm:flex flex-col items-end gap-1">
                            <p class="text-sm sm:text-lg whitespace-nowrap">
                                Hi, <b>{meta.author}</b>
                            </p>
                            <div class="flex whitespace-nowrap text-xs sm:text-sm">
                                <a class="text-brand italic cursor-not-allowed">
                                    settings
                                </a>
                                <p class="text-brand italic font-medium mx-2">-</p>
                                <a class="text-brand italic cursor-not-allowed">
                                    logout
                                </a>
                            </div>
                        </div>
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
            class="text-sm font-bold px-3 py-1 rounded shadow-md transition-colors border-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-gray-400 dark:border-gray-600"
            title={`Current theme: ${theme}. Click to cycle through light/dark/system.`}
        >
            {getThemeIcon()} {getThemeLabel()}
        </button>
    );
}
