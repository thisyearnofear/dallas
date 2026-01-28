import { useState } from 'preact/hooks';
import { useWallet } from '../context/WalletContext';
import { PublicKey, Connection } from '@solana/web3.js';
import { SOLANA_CONFIG } from '../config/solana';
import { confidentialTransferService } from '../services/ConfidentialTransferService';
import { transactionHistoryService } from '../services/transactionHistory';

interface SolanaTransferProps {
  recipientAddress?: string;
  amount?: number;
  label?: string;
}

export function SolanaTransfer({
  recipientAddress = SOLANA_CONFIG.treasuryAddress,
  amount = SOLANA_CONFIG.defaults.donationAmount,
  label = 'Donate SOL'
}: SolanaTransferProps) {
  const { publicKey, connected, sendTransaction, connection } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState(amount);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recipientInput, setRecipientInput] = useState(recipientAddress);
  const [networkFees, setNetworkFees] = useState<number>(0.000005);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Calculate total cost including fees
  const totalCost = customAmount + networkFees;

  const validateAddress = async (address: string): Promise<boolean> => {
    try {
      new PublicKey(address);
      return true;
    } catch (err) {
      setError('Invalid Solana address format');
      return false;
    }
  };

  const handlePreview = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    // Validate amount
    if (customAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Validate recipient address format
    if (!(await validateAddress(recipientInput))) {
      return;
    }

    // Get user balance to ensure they have sufficient funds
    try {
      const balance = await connection.getBalance(publicKey);
      const balanceInSol = balance / 1e9; // LAMPORTS_PER_SOL is 1e9

      if (balanceInSol < totalCost) {
        setError(`Insufficient funds. Required: ${totalCost.toFixed(5)} SOL, Available: ${balanceInSol.toFixed(5)} SOL`);
        return;
      }
    } catch (err) {
      setError('Error checking balance. Please try again.');
      return;
    }

    setError(null);
    setShowConfirmation(true);
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const recipient = new PublicKey(recipientInput);
      // Determine transaction type based on context
      let transactionType: 'donation' | 'membership' | 'other' = 'other';

      if (label.toLowerCase().includes('donate')) {
        transactionType = 'donation';
      } else if (label.toLowerCase().includes('purchase') || label.toLowerCase().includes('membership')) {
        transactionType = 'membership';
      }

      let signature = '';

      if (isPrivacyMode) {
        // CONFIDENTIAL TRANSFER FLOW
        const provider = (window as any).solana;
        if (!provider) throw new Error("Wallet not found");

        const transaction = await confidentialTransferService.createConfidentialTransfer(
          connection,
          publicKey!,
          {
            recipient,
            amount: customAmount,
            isStrictPrivacy: true
          }
        );
        
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.feePayer = publicKey!;

        const signed = await provider.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');

        // Manually add to history since we bypassed sendTransaction
        await transactionHistoryService.addTransaction({
          from: publicKey!.toString(),
          to: recipient.toString(),
          amount: customAmount,
          signature,
          type: transactionType,
          agentData: { privacyMode: true, protocol: 'SPL Token 2022 (Simulated)' }
        });

      } else {
        // STANDARD FLOW
        signature = await sendTransaction(recipient, customAmount, transactionType);
      }

      setSuccess(`Transaction successful! Hash: ${signature.slice(0, 20)}...`);
      setCustomAmount(amount); // Reset to default
      setShowConfirmation(false);
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      console.error('Transfer error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setError(null);
  };

  return (
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl transition-all duration-300">
      <h3 class="text-2xl font-bold mb-6 text-brand flex items-center gap-2">
        <span>💸</span>
        <span>{label}</span>
      </h3>

      {!showConfirmation ? (
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recipient Address</label>
            <input
              type="text"
              value={recipientInput}
              onInput={(e) => setRecipientInput((e.currentTarget as HTMLInputElement).value)}
              disabled={!connected || isLoading}
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand outline-none transition-all shadow-inner text-slate-900 dark:text-white font-mono text-sm"
              placeholder="Enter Solana address"
            />
          </div>

          <div>
            <label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider">Amount (SOL)</label>
            <input
              type="number"
              value={customAmount}
              onInput={(e) => setCustomAmount(parseFloat((e.currentTarget as HTMLInputElement).value) || 0)}
              disabled={!connected || isLoading}
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand outline-none transition-all shadow-inner text-slate-900 dark:text-white font-bold"
              step="0.01"
              min="0.001"
            />
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Min: 0.001 SOL</p>
          </div>

          <div class="flex items-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                class="sr-only peer"
                checked={isPrivacyMode}
                onChange={() => setIsPrivacyMode(!isPrivacyMode)}
                disabled={!connected || isLoading}
              />
              <div class="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              <span class="ml-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                {isPrivacyMode ? '🤫 Shielded Protocol (ZK)' : 'Standard Transfer (Public)'}
              </span>
            </label>
          </div>

          {connected && (
            <div class="text-sm font-medium text-slate-600 dark:text-slate-400 flex justify-between">
              <span>Connected:</span>
              <span class="font-mono text-brand">{publicKey?.toString().slice(0, 8)}...</span>
            </div>
          )}

          <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="text-xs font-bold text-slate-500 dark:text-slate-500 flex justify-between uppercase tracking-tighter">
              <span>Network fees:</span>
              <span>~{networkFees.toFixed(6)} SOL</span>
            </div>

            <div class="text-lg font-black text-slate-900 dark:text-white flex justify-between items-center">
              <span>Total cost:</span>
              <span class="text-brand">{totalCost.toFixed(5)} SOL</span>
            </div>
          </div>

          {error && (
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <button
            onClick={handlePreview}
            disabled={!connected || isLoading}
            class={`w-full font-black py-4 px-6 rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isPrivacyMode ? 'bg-slate-800 dark:bg-black hover:bg-black dark:hover:bg-slate-900 text-green-400 border-2 border-green-500/50' : 'bg-brand hover:bg-brand-accent text-white'}`}
          >
            {isLoading ? 'Processing...' : isPrivacyMode ? 'Preview Confidential Transfer' : 'Preview Transaction'}
          </button>
        </div>
      ) : (
        <div class="space-y-6 animate-fadeIn">
          <h4 class="text-xl font-bold text-center text-slate-900 dark:text-white uppercase tracking-widest">Confirm Transaction</h4>

          <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3 shadow-inner">
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">From:</span>
              <span class="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-4)}</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">To:</span>
              <span class="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{recipientInput.slice(0, 8)}...{recipientInput.slice(-4)}</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount:</span>
              <span class="font-bold text-slate-900 dark:text-white text-lg">{customAmount.toFixed(5)} SOL</span>
            </div>
             <div class="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Protocol:</span>
              <span class={isPrivacyMode ? 'text-green-600 dark:text-green-400 font-black tracking-tighter' : 'font-bold text-slate-700 dark:text-slate-300'}>
                {isPrivacyMode ? 'CLUB_MEMBERSHIP_ZK' : 'STANDARD_WIRE'}
              </span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Total Due:</span>
              <span class="text-2xl font-black text-brand">{totalCost.toFixed(5)} SOL</span>
            </div>
          </div>

          {error && (
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <div class="flex gap-4">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              class="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={isLoading}
              class={`flex-1 font-black py-4 px-6 rounded-xl transition-all shadow-lg transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isPrivacyMode ? 'bg-slate-800 dark:bg-black hover:bg-black dark:hover:bg-slate-900 text-green-400 border-2 border-green-500/50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {isLoading ? 'Processing...' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div class="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-4 rounded-xl mt-6 text-sm font-bold shadow-md flex items-center gap-3">
          <span class="text-2xl">✅</span>
          <div class="truncate">{success}</div>
        </div>
      )}
    </div>
  );
}
