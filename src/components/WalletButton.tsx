import { useWallet } from '../context/WalletContext';
import { useState, useEffect } from 'preact/hooks';
import { isAleoEnabled } from '../config/chains';

function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function WalletButton() {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();
  const [aleoEnabled, setAleoEnabled] = useState(false);
  const [aleoAddress, setAleoAddress] = useState<string | null>(null);
  const [aleoConnecting, setAleoConnecting] = useState(false);

  useEffect(() => {
    setAleoEnabled(isAleoEnabled());
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    const anyWindow = window as any;
    const wallet = anyWindow.shield || anyWindow.aleo;
    if (wallet?.address) {
      setAleoAddress(wallet.address);
    }
  };

  const handleAleoConnect = async () => {
    if (!aleoEnabled) return;
    setAleoConnecting(true);
    try {
      const anyWindow = window as any;
      const wallet = anyWindow.shield || anyWindow.aleo;
      if (wallet) {
        try {
          const result = await wallet.connect();
          if (result?.address) {
            setAleoAddress(result.address);
          }
        } catch (e) {
          
        }
      } else {
        window.open('https://aleo.org/shield', '_blank');
      }
    } finally {
      setAleoConnecting(false);
    }
  };

  const handleAleoDisconnect = async () => {
    const anyWindow = window as any;
    const wallet = anyWindow.shield || anyWindow.aleo;
    if (wallet?.disconnect) {
      await wallet.disconnect();
    }
    setAleoAddress(null);
  };

  const handleSolanaConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Solana connection error:', error);
    }
  };

  if (!connected && !aleoAddress) {
    return (
      <div class="flex flex-col gap-2">
        <button
          onClick={handleSolanaConnect}
          disabled={connecting}
          class="bg-brand hover:bg-brand-accent text-white font-bold py-2 px-3 sm:px-4 rounded transition-colors disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
        >
          {connecting ? '⏳ Connecting...' : '🔗 Connect Solana'}
        </button>
        {aleoEnabled && (
          <button
            onClick={handleAleoConnect}
            disabled={aleoConnecting}
            class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded transition-all disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
          >
            {aleoConnecting ? '⏳ Connecting...' : '🔐 Connect Aleo'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {connected && publicKey && (
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono" title={publicKey.toString()}>
            {shortenAddress(publicKey.toString())}
          </span>
          <button
            onClick={disconnect}
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 sm:px-3 rounded transition-colors text-xs sm:text-sm"
          >
            Disconnect SOL
          </button>
        </div>
      )}
      {aleoAddress && (
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-mono" title={aleoAddress}>
            {shortenAddress(aleoAddress, 6)}
          </span>
          <button
            onClick={handleAleoDisconnect}
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 sm:px-3 rounded transition-colors text-xs sm:text-sm"
          >
            Disconnect Aleo
          </button>
        </div>
      )}
    </div>
  );
}