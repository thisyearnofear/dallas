import { useWallet } from '../context/WalletContext';
import { TransactionRecord } from '../services/transactionHistory';
import { encryptionService } from '../services/EncryptionService';
import { useState, useEffect } from 'preact/hooks';

export function TransactionHistory() {
  const { getTransactionHistory } = useWallet();
  const [filter, setFilter] = useState<'all' | 'donation' | 'membership' | 'other'>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      // Check if data exists but key is missing
      const hasData = localStorage.getItem('dallas-club-transactions');
      const isDecrypted = encryptionService.isWalletKeyActive();
      
      if (hasData && !isDecrypted) {
        setIsLocked(true);
        setTransactions([]);
      } else {
        setIsLocked(false);
        const txs = await getTransactionHistory();
        setTransactions(txs);
      }
    };
    
    if (showHistory) {
      loadTransactions();
      const interval = setInterval(loadTransactions, 2000); // Poll for updates/decryption
      return () => clearInterval(interval);
    }
  }, [showHistory]);

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  // Sort by most recent
  const sortedTransactions = [...filteredTransactions].sort((a, b) => b.timestamp - a.timestamp);

  if (!showHistory) {
    return (
      <button 
        onClick={() => setShowHistory(true)}
        class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-sm border-2 border-slate-200 dark:border-slate-700 py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-3 transform hover:scale-105 active:scale-95 uppercase tracking-widest font-black"
      >
        <span>📓</span> Open Black Book
      </button>
    );
  }

  return (
    <div class="bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-h-[500px] overflow-y-auto font-mono text-slate-900 dark:text-slate-300 shadow-2xl transition-all duration-500 animate-fadeIn custom-scrollbar">
      <div class="flex justify-between items-center mb-8 border-b-2 border-slate-100 dark:border-slate-900 pb-4">
        <h3 class="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter flex items-center gap-3">
          <span class="bg-slate-900 text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-sm">BOOK</span>
          <span>Ron's Black Book</span>
        </h3>
        <button 
          onClick={() => setShowHistory(false)}
          class="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 font-black text-xs uppercase tracking-widest transition-colors"
        >
          [Close_File]
        </button>
      </div>

      <div class="mb-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
        <label class="block text-[10px] font-black mb-2 uppercase tracking-widest text-slate-500">Filter By Classification:</label>
        <div class="flex flex-wrap gap-2">
          {['all', 'donation', 'membership', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              class={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${
                filter === type
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {isLocked ? (
        <div class="flex flex-col items-center justify-center h-64 space-y-6 border-2 border-dashed border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-8 animate-pulse">
          <div class="text-6xl bg-white dark:bg-slate-800 p-4 rounded-full shadow-lg border border-red-100 dark:border-red-900/50">🤐</div>
          <div class="text-center">
            <h4 class="text-xl font-black text-red-600 dark:text-red-500 tracking-tighter uppercase mb-2">Black Book Sealed</h4>
            <p class="text-xs text-red-500 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              // EYES ONLY PROTOCOL //<br/>
              Signature required to decrypt ledger
            </p>
          </div>
        </div>
      ) : sortedTransactions.length === 0 ? (
        <div class="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p class="text-slate-400 dark:text-slate-600 font-black text-xs uppercase tracking-widest italic">No classified entries found</p>
        </div>
      ) : (
        <div class="space-y-4">
          {sortedTransactions.map((tx: TransactionRecord) => (
            <div key={tx.id} class="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand/30 transition-all group shadow-sm">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-1">{tx.type}</div>
                  <div class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                    {new Date(tx.timestamp).toLocaleDateString()} <span class="mx-1 opacity-30">•</span> {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{tx.amount} <span class="text-xs text-slate-400 dark:text-slate-500">SOL</span></div>
                  <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">To: ...{tx.to.slice(-4)}</div>
                </div>
              </div>
              
              <div class="space-y-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <div class="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Source:</span>
                  <span class="font-mono tracking-tighter text-slate-700 dark:text-slate-300">...{tx.from.slice(-4)}</span>
                </div>
                <div class="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest overflow-hidden">
                  <span>Signature:</span>
                  <span class="font-mono tracking-tighter text-slate-400 dark:text-slate-600 truncate ml-4 group-hover:text-slate-500 transition-colors">{tx.signature}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}