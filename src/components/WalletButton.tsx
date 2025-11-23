import { useWallet } from '../context/WalletContext';

export function WalletButton() {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();

  if (!connected) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        class="bg-brand hover:bg-brand-accent text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : '🔗 Connect Wallet'}
      </button>
    );
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">
        {shortenAddress(publicKey!.toString())}
      </span>
      <button
        onClick={disconnect}
        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
      >
        Disconnect
      </button>
    </div>
  );
}
