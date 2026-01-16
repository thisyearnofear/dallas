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
    <div class="bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 p-6 rounded-lg">
      <h3 class="text-2xl font-bold mb-4 text-brand">{label}</h3>

      {!showConfirmation ? (
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipientInput}
              onInput={(e) => setRecipientInput((e.currentTarget as HTMLInputElement).value)}
              disabled={!connected || isLoading}
              class="w-full px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              placeholder="Enter Solana address"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2">Amount (SOL)</label>
            <input
              type="number"
              value={customAmount}
              onInput={(e) => setCustomAmount(parseFloat((e.currentTarget as HTMLInputElement).value) || 0)}
              disabled={!connected || isLoading}
              class="w-full px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
              step="0.01"
              min="0.001"
            />
            <p class="text-xs text-gray-500 mt-1">Min: 0.001 SOL</p>
          </div>

          <div class="flex items-center gap-2 py-2">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                class="sr-only peer"
                checked={isPrivacyMode}
                onChange={() => setIsPrivacyMode(!isPrivacyMode)}
                disabled={!connected || isLoading}
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              <span class="ml-3 text-sm font-medium text-gray-900">
                {isPrivacyMode ? '🤫 Club Membership Protocol (Shielded)' : 'Standard Transfer (Public)'}
              </span>
            </label>
          </div>

          {connected && (
            <div class="text-sm text-gray-600">
              Connected: {publicKey?.toString().slice(0, 8)}...
            </div>
          )}

          <div class="text-sm text-gray-600">
            Estimated network fees: ~{networkFees.toFixed(6)} SOL
          </div>

          <div class="text-sm font-semibold">
            Total cost: {totalCost.toFixed(5)} SOL
          </div>

          {error && (
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handlePreview}
            disabled={!connected || isLoading}
            class={`w-full font-bold py-3 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isPrivacyMode ? 'bg-gray-800 hover:bg-black text-green-400 border border-green-500' : 'bg-brand hover:bg-brand-accent text-white'}`}
          >
            {isLoading ? 'Processing...' : isPrivacyMode ? 'Preview Confidential Transfer' : 'Preview Transaction'}
          </button>
        </div>
      ) : (
        <div class="space-y-4">
          <h4 class="text-xl font-bold text-center">Confirm Transaction</h4>

          <div class="bg-gray-100 p-4 rounded">
            <div class="flex justify-between mb-2">
              <span class="font-semibold">From:</span>
              <span class="truncate max-w-[120px]">{publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-4)}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="font-semibold">To:</span>
              <span class="truncate max-w-[120px]">{recipientInput.slice(0, 8)}...{recipientInput.slice(-4)}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="font-semibold">Amount:</span>
              <span>{customAmount.toFixed(5)} SOL</span>
            </div>
             <div class="flex justify-between mb-2">
              <span class="font-semibold">Protocol:</span>
              <span class={isPrivacyMode ? 'text-green-600 font-bold' : ''}>
                {isPrivacyMode ? 'MEMBERSHIP_FEE (ZK)' : 'STANDARD_WIRE'}
              </span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="font-semibold">Network fee:</span>
              <span>{networkFees.toFixed(6)} SOL</span>
            </div>
            <div class="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
              <span>Total:</span>
              <span>{totalCost.toFixed(5)} SOL</span>
            </div>
          </div>

          {error && (
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div class="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={isLoading}
              class={`flex-1 font-bold py-3 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isPrivacyMode ? 'bg-gray-800 hover:bg-black text-green-400 border border-green-500' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {isLoading ? 'Processing...' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mt-4">
          {success}
        </div>
      )}
    </div>
  );
}
