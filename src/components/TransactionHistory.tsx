import { useWallet } from '../context/WalletContext';
import { TransactionRecord } from '../services/transactionHistory';
import { useState } from 'preact/hooks';

export function TransactionHistory() {
  const { getTransactionHistory } = useWallet();
  const [filter, setFilter] = useState<'all' | 'donation' | 'membership' | 'other'>('all');
  const [showHistory, setShowHistory] = useState(false);

  const transactions = getTransactionHistory().filter(tx => 
    filter === 'all' || tx.type === filter
  );

  // Sort by most recent
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  if (!showHistory) {
    return (
      <button 
        onClick={() => setShowHistory(true)}
        class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
      >
        View Transaction History
      </button>
    );
  }

  return (
    <div class="bg-white border border-gray-300 rounded-lg p-6 max-h-96 overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">Transaction History</h3>
        <button 
          onClick={() => setShowHistory(false)}
          class="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Filter by type:</label>
        <select 
          value={filter}
          onInput={(e) => setFilter((e.target as HTMLSelectElement).value as any)}
          class="border border-gray-300 rounded px-3 py-1"
        >
          <option value="all">All Transactions</option>
          <option value="donation">Donations</option>
          <option value="membership">Membership</option>
          <option value="other">Other</option>
        </select>
      </div>

      {sortedTransactions.length === 0 ? (
        <p class="text-gray-500 italic">No transactions found</p>
      ) : (
        <div class="space-y-3">
          {sortedTransactions.map((tx: TransactionRecord) => (
            <div key={tx.id} class="border-b border-gray-200 pb-3 last:border-0">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-semibold capitalize">{tx.type}</div>
                  <div class="text-sm text-gray-600">
                    {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-brand">{tx.amount} SOL</div>
                  <div class="text-xs text-gray-500">To: ...{tx.to.slice(-4)}</div>
                </div>
              </div>
              
              <div class="mt-2 text-sm">
                <div>From: ...{tx.from.slice(-4)}</div>
                <div class="truncate text-gray-600">Hash: {tx.signature}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}