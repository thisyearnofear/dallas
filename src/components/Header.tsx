import { meta } from "./constants";
import { WalletButton } from "./WalletButton";
import { useWallet } from "../context/WalletContext";
import { encryptionService } from "../services/EncryptionService";
import { useState, useEffect } from "preact/hooks";

export function Header() {
    const { connected, signMessage } = useWallet();
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);

    useEffect(() => {
        // Check if we're using a temporary session key or a wallet-derived key
        const checkEncryption = () => {
             setIsEncrypted(encryptionService.isWalletKeyActive());
        };
        // Initial check
        checkEncryption();
        // Poll for changes (simple way to keep sync without complex context for now)
        const interval = setInterval(checkEncryption, 1000);
        return () => clearInterval(interval);
    }, []);

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
        <header class="header-separator flex pt-2 pb-1 items-center px-2 sm:px-4 overflow-hidden">
            <a href="/">
                <div>
                    <h1 class="font-bold text-2xl sm:text-3xl lg:text-5xl title-shadow text-gray-dark font-sans">
                        Dallas Buyers Club
                    </h1>
                    <h3 class="text-gray font-bold italic text-lg sm:text-xl lg:text-2xl font-sans">
                        Welcome to the club.
                    </h3>
                </div>
            </a>
            <div class="flex flex-col gap-3 flex-1 ml-4 sm:ml-10 lg:ml-20">
                <div class="relative flex items-center border-b-2 border-b-gray-dark flex-wrap gap-1">
                    <a class="text-brand text-lg sm:text-xl cursor-not-allowed whitespace-nowrap">
                        messages <b>420</b>
                    </a>
                    <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                    <a class="text-brand text-lg sm:text-xl cursor-not-allowed whitespace-nowrap">
                        orders <b>69</b>
                    </a>
                    <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                    <a class="text-brand text-lg sm:text-xl cursor-not-allowed whitespace-nowrap">
                        account <b>&#8383;80085</b>
                    </a>
                    {connected && !isEncrypted && (
                        <>
                            <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                            <button 
                                onClick={handleDecrypt}
                                disabled={isDecrypting}
                                class="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-3 py-1 rounded shadow-md transition-colors animate-pulse"
                            >
                                {isDecrypting ? "DECRYPTING..." : "🔓 DECRYPT LOGS"}
                            </button>
                        </>
                    )}
                    {connected && isEncrypted && (
                         <>
                            <div class="w-[2px] h-5 bg-gray-dark mx-1 sm:mx-3"></div>
                            <span class="text-green-600 text-sm font-bold flex items-center gap-1">
                                🔐 SECURE
                            </span>
                        </>
                    )}
                </div>
                <div class="flex items-center flex-wrap gap-2">
                    <label class="text-gray-dark text-lg sm:text-[20px] font-bold mr-2 sm:mr-[20px] whitespace-nowrap">
                        Search
                    </label>
                    <input
                        class="search-bar flex-1 min-w-0 sm:w-1/2 background-white-secondary text-gray-dark text-lg sm:text-[20px] border-[1px] border-gray-light px-3 py-2 disabled:cursor-not-allowed"
                        disabled
                    />
                    <input
                        class="text-lg sm:text-[20px] rounded-r-lg text-gray-dark px-3 search-button py-2 border-[1px] border-gray-light disabled:cursor-not-allowed"
                        type="button"
                        value="Go"
                        disabled
                    />

                    <div class="flex flex-col items-end ml-auto mr-2 sm:mr-5 gap-2">
                         <WalletButton />
                         <p class="text-lg sm:text-xl whitespace-nowrap">
                             Hi, <b>{meta.author}</b>
                         </p>
                         <div class="flex whitespace-nowrap">
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
        </header>
    );
}
