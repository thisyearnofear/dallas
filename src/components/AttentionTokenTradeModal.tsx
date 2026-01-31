/**
 * Attention Token Trade Modal
 * Buy/Sell interface with slippage control and quotes
 */

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import { toast } from 'react-hot-toast';
import { attentionTokenTradingService, TradeQuote } from '../services/AttentionTokenTradingService';

interface AttentionTokenTradeModalProps {
  tokenMint: PublicKey;
  tokenSymbol: string;
  tokenName: string;
  currentPrice: number;
  mode: 'buy' | 'sell';
  userBalance?: number;
  onClose: () => void;
  onSuccess?: (signature: string) => void;
}

export const AttentionTokenTradeModal: React.FC<AttentionTokenTradeModalProps> = ({
  tokenMint,
  tokenSymbol,
  tokenName,
  currentPrice,
  mode,
  userBalance = 0,
  onClose,
  onSuccess,
}) => {
  const { connection, publicKey, signTransaction } = useWallet();

  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(1);
  const [customSlippage, setCustomSlippage] = useState<string>('');
  const [quote, setQuote] = useState<TradeQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Fetch quote when amount or slippage changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      fetchQuote();
    } else {
      setQuote(null);
    }
  }, [amount, slippage]);

  const fetchQuote = async () => {
    if (!publicKey) return;

    setQuoteLoading(true);
    try {
      const amountNum = parseFloat(amount);
      
      if (mode === 'buy') {
        const quote = await attentionTokenTradingService.getBuyQuote({
          tokenMint,
          solAmount: amountNum,
          slippage,
          buyer: publicKey,
        });
        setQuote(quote);
      } else {
        const quote = await attentionTokenTradingService.getSellQuote({
          tokenMint,
          tokenAmount: amountNum,
          slippage,
          seller: publicKey,
        });
        setQuote(quote);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const amountNum = parseFloat(amount);
      let signature: string;

      if (mode === 'buy') {
        signature = await attentionTokenTradingService.executeBuy(
          {
            tokenMint,
            solAmount: amountNum,
            slippage,
            buyer: wallet.publicKey,
          },
          connection,
          wallet.signTransaction
        );
        toast.success(`Successfully bought ${tokenSymbol}!`);
      } else {
        signature = await attentionTokenTradingService.executeSell(
          {
            tokenMint,
            tokenAmount: amountNum,
            slippage,
            seller: wallet.publicKey,
          },
          connection,
          wallet.signTransaction
        );
        toast.success(`Successfully sold ${tokenSymbol}!`);
      }

      if (onSuccess) {
        onSuccess(signature);
      }
      onClose();
    } catch (error: any) {
      console.error('Trade error:', error);
      toast.error(error.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    if (mode === 'sell') {
      setAmount(userBalance.toString());
    }
    // For buy, would need to check SOL balance
  };

  const slippagePresets = [0.5, 1, 2, 5];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'buy' ? '🟢 Buy' : '🔴 Sell'} {tokenSymbol}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Token Info */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Token:</span>
            <span className="font-bold">{tokenName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Price:</span>
            <span className="font-mono">${currentPrice.toFixed(6)}</span>
          </div>
          {mode === 'sell' && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400">Your Balance:</span>
              <span className="font-bold">{userBalance.toLocaleString()} {tokenSymbol}</span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            {mode === 'buy' ? 'SOL Amount' : 'Token Amount'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-lg focus:border-purple-500 outline-none"
              step="0.01"
              min="0"
            />
            {mode === 'sell' && (
              <button
                onClick={handleMaxAmount}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm font-bold"
              >
                MAX
              </button>
            )}
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Slippage Tolerance</label>
          <div className="flex gap-2 mb-2">
            {slippagePresets.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setSlippage(preset);
                  setCustomSlippage('');
                }}
                className={`flex-1 py-2 rounded font-bold transition ${
                  slippage === preset && !customSlippage
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={customSlippage}
            onChange={(e) => {
              setCustomSlippage(e.target.value);
              if (e.target.value) {
                setSlippage(parseFloat(e.target.value));
              }
            }}
            placeholder="Custom %"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            step="0.1"
            min="0"
            max="50"
          />
        </div>

        {/* Quote Display */}
        {quoteLoading && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        )}

        {quote && !quoteLoading && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">You'll {mode === 'buy' ? 'receive' : 'get'}:</span>
              <span className="font-bold text-green-400">
                {quote.outputAmount.toFixed(6)} {mode === 'buy' ? tokenSymbol : 'SOL'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Minimum received:</span>
              <span>{quote.minimumReceived.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price impact:</span>
              <span className={quote.priceImpact > 5 ? 'text-red-400' : 'text-yellow-400'}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trading fee (2%):</span>
              <span>{quote.tradingFee.toFixed(6)}</span>
            </div>
          </div>
        )}

        {/* Warning for high price impact */}
        {quote && quote.priceImpact > 5 && (
          <div className="bg-yellow-900/20 border border-yellow-600 p-3 rounded-lg mb-6 text-sm">
            <p className="text-yellow-400">⚠️ High price impact detected!</p>
            <p className="text-gray-400 text-xs mt-1">
              This trade will significantly affect the price. Consider reducing your amount.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleTrade}
            disabled={loading || !quote || !amount}
            className={`flex-1 py-3 rounded-lg font-bold transition ${
              mode === 'buy'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:bg-gray-600 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </span>
            ) : (
              `${mode === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
            )}
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          By trading, you agree to the platform's terms and understand the risks involved.
        </p>
      </div>
    </div>
  );
};
