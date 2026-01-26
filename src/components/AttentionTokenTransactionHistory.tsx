/**
 * Attention Token Transaction History
 * Displays all user trades with filtering and export
 */

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import { attentionTokenTradingService } from '../services/AttentionTokenTradingService';

interface Transaction {
  signature: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'fee_claim';
  tokenSymbol: string;
  tokenName: string;
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  status: 'success' | 'pending' | 'failed';
}

export const AttentionTokenTransactionHistory: React.FC = () => {
  const { publicKey, connection } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'fee_claim'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (publicKey) {
      loadTransactions();
    }
  }, [publicKey]);

  const loadTransactions = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const { SOLANA_CONFIG } = await import('../config/solana');
      const { parseCaseStudyAccount } = await import('../utils/solanaUtils');
      
      const programId = new PublicKey(SOLANA_CONFIG.blockchain.caseStudyProgramId);
      
      // Fetch all case study accounts with attention tokens
      const accounts = await connection.getProgramAccounts(programId, {
        filters: [
          {
            memcmp: {
              offset: 8 + 32 + 50 + 1 + 1 + 1 + 1 + 32 + 2,
              bytes: '2',
            },
          },
        ],
      });

      // Fetch trade history for each token
      const txPromises = accounts.map(async ({ account }) => {
        try {
          const parsed = parseCaseStudyAccount(account.data);
          if (!parsed.attentionTokenMint) return [];

          const trades = await attentionTokenTradingService.getTradeHistory(
            parsed.attentionTokenMint,
            publicKey!,
            50
          );

          return trades.map((trade: any) => ({
            signature: trade.signature,
            timestamp: trade.timestamp * 1000,
            type: trade.type as 'buy' | 'sell' | 'fee_claim',
            tokenSymbol: 'ATT', // Would be from metadata
            tokenName: 'Attention Token',
            amount: trade.amount,
            price: trade.price,
            totalValue: trade.totalValue,
            fee: trade.fee,
            status: trade.status as 'success' | 'pending' | 'failed',
          } as Transaction));
        } catch (error) {
          console.error('Error fetching trades for token:', error);
          return [];
        }
      });

      const allTrades = await Promise.all(txPromises);
      const flatTrades = allTrades.flat();
      
      // Sort by timestamp descending
      flatTrades.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(flatTrades);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions
    .filter((tx) => filter === 'all' || tx.type === filter)
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'value':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Token', 'Amount', 'Price', 'Value', 'Fee', 'Signature'];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.timestamp).toLocaleString(),
      tx.type,
      tx.tokenSymbol,
      tx.amount,
      tx.price,
      tx.totalValue,
      tx.fee,
      tx.signature,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attention-token-transactions-${Date.now()}.csv`;
    a.click();
  };

  if (!publicKey) {
    return (
      <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400 text-lg mb-4">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">📜 Transaction History</h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
        >
          <span>📥</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
            <option value="fee_claim">Fee Claims</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="value">Value</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Transactions"
          value={transactions.length.toString()}
          icon="📊"
        />
        <StatCard
          label="Total Buys"
          value={transactions.filter((tx) => tx.type === 'buy').length.toString()}
          icon="🟢"
        />
        <StatCard
          label="Total Sells"
          value={transactions.filter((tx) => tx.type === 'sell').length.toString()}
          icon="🔴"
        />
        <StatCard
          label="Fees Claimed"
          value={`$${transactions
            .filter((tx) => tx.type === 'fee_claim')
            .reduce((sum, tx) => sum + tx.totalValue, 0)
            .toFixed(2)}`}
          icon="💰"
        />
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
          <p className="text-gray-400">No transactions found</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Token</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Price</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Value</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Fee</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400">
                    Signature
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.signature}
                    className="hover:bg-gray-700/50 transition"
                  >
                    <td className="px-6 py-4 text-sm">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          tx.type === 'buy'
                            ? 'bg-green-900/30 text-green-400'
                            : tx.type === 'sell'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-blue-900/30 text-blue-400'
                        }`}
                      >
                        {tx.type === 'buy' && '🟢'}
                        {tx.type === 'sell' && '🔴'}
                        {tx.type === 'fee_claim' && '💰'}
                        {tx.type === 'buy' ? 'BUY' : tx.type === 'sell' ? 'SELL' : 'FEE CLAIM'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold">{tx.tokenSymbol}</div>
                        <div className="text-xs text-gray-400">{tx.tokenName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {tx.amount > 0 ? tx.amount.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm">
                      {tx.price > 0 ? `$${tx.price.toFixed(6)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      ${tx.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-400">
                      {tx.fee > 0 ? `$${tx.fee.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          tx.status === 'success'
                            ? 'bg-green-900/30 text-green-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 font-mono text-sm underline"
                      >
                        {tx.signature}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string }> = ({
  label,
  value,
  icon,
}) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);
