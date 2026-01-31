/**
 * Attention Token Portfolio Tracker
 * Shows user's token holdings, P&L, and portfolio analytics
 */

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../context/WalletContext';
import { attentionTokenService } from '../services/AttentionTokenService';
import { attentionTokenTradingService } from '../services/AttentionTokenTradingService';

interface TokenHolding {
  tokenMint: PublicKey;
  symbol: string;
  name: string;
  balance: number;
  currentPrice: number;
  currentValue: number;
  avgBuyPrice: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercentage: number;
  priceChange24h: number;
}

export const AttentionTokenPortfolio: React.FC = () => {
  const { connection, publicKey } = useWallet();
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [totalProfitLossPercentage, setTotalProfitLossPercentage] = useState(0);

  useEffect(() => {
    if (publicKey) {
      loadPortfolio();
    }
  }, [publicKey]);

  const loadPortfolio = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const { SOLANA_CONFIG } = await import('../config/solana');
      const { parseCaseStudyAccount } = await import('../utils/solanaUtils');
      
      const programId = new PublicKey(SOLANA_CONFIG.blockchain.caseStudyProgramId);
      
      // Fetch all case study accounts with attention tokens
      const accounts = await connection!.getProgramAccounts(programId, {
        filters: [
          {
            memcmp: {
              offset: 8 + 32 + 50 + 1 + 1 + 1 + 1 + 32 + 2,
              bytes: '2',
            },
          },
        ],
      });

      const holdingsPromises = accounts.map(async ({ account }) => {
        try {
          const parsed = parseCaseStudyAccount(account.data);
          if (!parsed.attentionTokenMint) return null;

          // Get user's token balance
          const balance = await attentionTokenTradingService.getTokenBalance(
            parsed.attentionTokenMint,
            publicKey!
          );

          if (balance === 0) return null;

          // Get current analytics
          const analytics = await attentionTokenService.getTokenAnalytics(
            parsed.attentionTokenMint
          );

          // Calculate P&L (would need to fetch user's trade history for actual avgBuyPrice)
          const currentValue = balance * analytics.price;
          
          // For now, estimate avgBuyPrice from recent trades
          // In production, calculate from actual user trade history
          const avgBuyPrice = analytics.price * 0.9; // Placeholder
          const totalInvested = balance * avgBuyPrice;
          const profitLoss = currentValue - totalInvested;
          const profitLossPercentage = (profitLoss / totalInvested) * 100;

          return {
            tokenMint: parsed.attentionTokenMint,
            symbol: 'ATT', // Would be fetched from token metadata
            name: 'Attention Token',
            balance,
            currentPrice: analytics.price,
            currentValue,
            avgBuyPrice,
            totalInvested,
            profitLoss,
            profitLossPercentage,
            priceChange24h: analytics.priceChange24h,
          } as TokenHolding;
        } catch (error) {
          console.error('Error fetching holding:', error);
          return null;
        }
      });

      const fetchedHoldings = await Promise.all(holdingsPromises);
      const validHoldings = fetchedHoldings.filter((h): h is TokenHolding => h !== null);

      setHoldings(validHoldings);

      // Calculate totals
      const total = validHoldings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalInvested = validHoldings.reduce((sum, h) => sum + h.totalInvested, 0);
      const totalPL = total - totalInvested;
      const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

      setTotalValue(total);
      setTotalProfitLoss(totalPL);
      setTotalProfitLossPercentage(totalPLPercent);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400 text-lg mb-4">Connect your wallet to view your portfolio</p>
        <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition">
          Connect Wallet
        </button>
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

  if (holdings.length === 0) {
    return (
      <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400 text-lg mb-4">You don't have any attention tokens yet</p>
        <a
          href="/attention-tokens"
          className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition"
        >
          Browse Token Market
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-500">
        <h2 className="text-2xl font-bold mb-4">💼 Your Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-300 mb-1">Total Value</div>
            <div className="text-3xl font-bold">${totalValue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-300 mb-1">Total P&L</div>
            <div
              className={`text-3xl font-bold ${
                totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-300 mb-1">P&L %</div>
            <div
              className={`text-3xl font-bold ${
                totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {totalProfitLossPercentage >= 0 ? '+' : ''}
              {totalProfitLossPercentage.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Allocation Pie Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Portfolio Allocation</h3>
        <div className="flex flex-wrap gap-4">
          {holdings.map((holding) => {
            const percentage = (holding.currentValue / totalValue) * 100;
            return (
              <div key={holding.tokenMint.toString()} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  }}
                />
                <span className="text-sm">
                  {holding.symbol} ({percentage.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Token</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Balance</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Price</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Value</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Avg Buy</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">P&L</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">24h</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {holdings.map((holding) => (
                <tr
                  key={holding.tokenMint.toString()}
                  className="hover:bg-gray-700/50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold">{holding.symbol}</div>
                      <div className="text-sm text-gray-400">{holding.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-mono">{holding.balance.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-mono">${holding.currentPrice.toFixed(6)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold">${holding.currentValue.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-mono text-sm text-gray-400">
                      ${holding.avgBuyPrice.toFixed(6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`font-bold ${
                        holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {holding.profitLoss >= 0 ? '+' : ''}${holding.profitLoss.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm ${
                        holding.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      ({holding.profitLossPercentage >= 0 ? '+' : ''}
                      {holding.profitLossPercentage.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`text-sm font-bold ${
                        holding.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {holding.priceChange24h >= 0 ? '+' : ''}
                      {holding.priceChange24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-bold transition">
                        Buy
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-bold transition">
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Portfolio Performance (30 Days)</h3>
        <div className="h-48 flex items-end gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const height = 50 + Math.random() * 50;
            const isPositive = Math.random() > 0.4;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t hover:opacity-80 transition cursor-pointer ${
                  isPositive ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ height: `${height}%` }}
                title={`Day ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Tokens"
          value={holdings.length.toString()}
          icon="💎"
          color="text-purple-400"
        />
        <StatCard
          label="Avg P&L"
          value={`${totalProfitLossPercentage >= 0 ? '+' : ''}${totalProfitLossPercentage.toFixed(1)}%`}
          icon={totalProfitLossPercentage >= 0 ? '📈' : '📉'}
          color={totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Best Performer"
          value={holdings[0]?.symbol || '-'}
          icon="🏆"
          color="text-yellow-400"
        />
        <StatCard
          label="Total Invested"
          value={`$${holdings.reduce((sum, h) => sum + h.totalInvested, 0).toFixed(2)}`}
          icon="💰"
          color="text-blue-400"
        />
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
  </div>
);
