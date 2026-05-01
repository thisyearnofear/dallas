import { useState, useEffect } from 'preact/hooks';
import { isAleoEnabled } from '../config/chains';

interface AleoWalletButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  compact?: boolean;
}

export function AleoWalletButton({ onConnect, onDisconnect, compact = false }: AleoWalletButtonProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isAleoEnabled());
  }, []);

  const handleConnect = async () => {
    if (!enabled) return;

    setConnecting(true);
    try {
      const { useAleoWallet } = await import('../context/AleoWalletContext');
      const wallet = useAleoWallet();
      await wallet.connect();
      setAddress(wallet.address);
      setConnected(wallet.connected);
      if (wallet.address && onConnect) {
        onConnect(wallet.address);
      }
    } catch (error) {
      console.error('Aleo connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { useAleoWallet } = await import('../context/AleoWalletContext');
      const wallet = useAleoWallet();
      await wallet.disconnect();
      setAddress(null);
      setConnected(false);
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error('Aleo disconnect error:', error);
    }
  };

  if (!enabled) {
    return (
      <button
        disabled
        class={`bg-slate-400 text-white font-bold rounded transition-colors cursor-not-allowed ${
          compact ? 'py-1 px-2 text-xs' : 'py-2 px-3 sm:px-4 text-sm sm:text-base'
        }`}
        title="Aleo disabled - set VITE_ALEO_ENABLED=true"
      >
        ⚪ Aleo
      </button>
    );
  }

  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        class={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded transition-all disabled:opacity-50 ${
          compact ? 'py-1 px-2 text-xs' : 'text-sm sm:text-base'
        }`}
      >
        {connecting ? '⏳ Connecting...' : '🔐 Connect Aleo'}
      </button>
    );
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div class={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span class="text-purple-600 dark:text-purple-400 font-mono">
        {address ? shortenAddress(address) : 'Aleo'}
      </span>
      <button
        onClick={handleDisconnect}
        class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 sm:px-3 rounded transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}

export default AleoWalletButton;