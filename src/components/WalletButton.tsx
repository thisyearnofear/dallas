import { useWallet } from '../context/WalletContext';

export function WalletButton() {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();

  if (!connected) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        class="bg-brand hover:bg-brand-accent text-white font-bold py-2 px-3 sm:px-4 rounded transition-colors disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
      >
        {connecting ? 'Connecting...' : '🔗 Connect'}
      </button>
    );
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
      <span class="text-xs sm:text-sm text-gray-600 font-mono">
        {publicKey ? shortenAddress(publicKey.toString()) : 'Connected'}
      </span>
      <button
        onClick={disconnect}
        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 sm:py-2 sm:px-3 rounded transition-colors text-xs sm:text-sm"
      >
        Disconnect
      </button>
    </div>
  );
}
