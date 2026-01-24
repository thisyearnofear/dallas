/**
 * Attention Token Leaderboard
 * Top tokens and traders rankings
 */

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

interface TokenLeaderboardEntry {
  rank: number;
  tokenMint: PublicKey;
  symbol: string;
  name: string;
  marketCap: number;
  volume24h: number;
  holders: number;
  priceChange24h: number;
  transactions: number;
}

interface TraderLeaderboardEntry {
  rank: number;
  wallet: PublicKey;
  displayName: string;
  totalVolume: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
  winRate: number;
  totalTrades: number;
}

export const AttentionTokenLeaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'traders'>('tokens');
  const [tokenTimeframe, setTokenTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [tokenSortBy, setTokenSortBy] = useState<'marketCap' | 'volume' | 'holders' | 'price'>('marketCap');
  const [loading, setLoading] = useState(true);

  const [topTokens, setTopTokens] = useState<TokenLeaderboardEntry[]>([]);
  const [topTraders, setTopTraders] = useState<TraderLeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, tokenTimeframe, tokenSortBy]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { SOLANA_CONFIG } = await import('../config/solana');
      const { parseCaseStudyAccount } = await import('../utils/solanaUtils');
      
      if (activeTab === 'tokens') {
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

        // Fetch analytics for all tokens
        const tokensWithAnalytics = await Promise.all(
          accounts.map(async ({ pubkey, account }, index) => {
            try {
              const parsed = parseCaseStudyAccount(account.data);
              if (!parsed.attentionTokenMint) return null;

              const analytics = await attentionTokenService.getTokenAnalytics(
                parsed.attentionTokenMint
              );

              return {
                rank: 0, // Will be set after sorting
                tokenMint: parsed.attentionTokenMint,
                symbol: 'ATT',
                name: 'Attention Token',
                marketCap: analytics.marketCap,
                volume24h: analytics.volume24h,
                holders: analytics.holders,
                priceChange24h: analytics.priceChange24h,
                transactions: analytics.transactions,
              } as TokenLeaderboardEntry;
            } catch (error) {
              console.error('Error fetching token analytics:', error);
              return null;
            }
          })
        );

        // Filter and sort
        let validTokens = tokensWithAnalytics.filter((t): t is TokenLeaderboardEntry => t !== null);
        
        // Sort based on criteria
        validTokens.sort((a, b) => {
          const aValue = a[tokenSortBy];
          const bValue = b[tokenSortBy];
          return bValue - aValue;
        });

        // Assign ranks
        validTokens = validTokens.map((token, index) => ({
          ...token,
          rank: index + 1,
        }));

        setTopTokens(validTokens);
      } else {
        // For traders leaderboard, we would need to aggregate all trades
        // across all tokens and calculate stats per wallet
        // This is complex and would require indexing or caching
        // For now, set empty array - would need proper backend indexing
        setTopTraders([]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setTopTokens([]);
      setTopTraders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`flex-1 py-3 rounded-lg font-bold transition ${
            activeTab === 'tokens'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          💎 Top Tokens
        </button>
        <button
          onClick={() => setActiveTab('traders')}
          className={`flex-1 py-3 rounded-lg font-bold transition ${
            activeTab === 'traders'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          👤 Top Traders
        </button>
      </div>

      {/* Filters (for tokens tab) */}
      {activeTab === 'tokens' && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Timeframe</label>
            <select
              value={tokenTimeframe}
              onChange={(e) => setTokenTimeframe(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Sort By</label>
            <select
              value={tokenSortBy}
              onChange={(e) => setTokenSortBy(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="marketCap">Market Cap</option>
              <option value="volume">Volume</option>
              <option value="holders">Holders</option>
              <option value="price">Price Change</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && activeTab === 'tokens' && topTokens.length === 0 && (
        <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-400 text-xl mb-2">No Tokens to Rank Yet</p>
          <p className="text-gray-500 mb-6">
            When attention tokens are created, they'll appear here ranked by performance
          </p>
        </div>
      )}

      {!loading && activeTab === 'traders' && topTraders.length === 0 && (
        <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-400 text-xl mb-2">Trader Leaderboard Coming Soon</p>
          <p className="text-gray-500 mb-6">
            This feature requires indexing all trading activity across tokens. Check back soon!
          </p>
        </div>
      )}

      {/* Top Tokens */}
      {!loading && activeTab === 'tokens' && topTokens.length > 0 && (
        <div className="space-y-4">
          {topTokens.map((token) => (
            <div
              key={token.tokenMint.toString()}
              className={`bg-gray-800 p-6 rounded-lg border transition hover:border-purple-500 ${
                token.rank === 1
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-gray-800'
                  : token.rank === 2
                  ? 'border-gray-400 bg-gradient-to-r from-gray-700/20 to-gray-800'
                  : token.rank === 3
                  ? 'border-orange-600 bg-gradient-to-r from-orange-900/20 to-gray-800'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                    token.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                      : token.rank === 2
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                      : token.rank === 3
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {token.rank === 1 ? '🥇' : token.rank === 2 ? '🥈' : token.rank === 3 ? '🥉' : `#${token.rank}`}
                </div>

                {/* Token Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{token.name}</h3>
                    <span className="bg-purple-600 px-2 py-1 rounded text-xs font-bold">
                      {token.symbol}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Market Cap</div>
                      <div className="font-bold">${token.marketCap.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">24h Volume</div>
                      <div className="font-bold">${token.volume24h.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Holders</div>
                      <div className="font-bold">{token.holders}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">24h Change</div>
                      <div
                        className={`font-bold ${
                          token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {token.priceChange24h >= 0 ? '+' : ''}
                        {token.priceChange24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition">
                  View Token
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Traders */}
      {!loading && activeTab === 'traders' && (
        <div className="space-y-4">
          {topTraders.map((trader) => (
            <div
              key={trader.wallet.toString()}
              className={`bg-gray-800 p-6 rounded-lg border transition hover:border-purple-500 ${
                trader.rank === 1
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-gray-800'
                  : trader.rank === 2
                  ? 'border-gray-400 bg-gradient-to-r from-gray-700/20 to-gray-800'
                  : trader.rank === 3
                  ? 'border-orange-600 bg-gradient-to-r from-orange-900/20 to-gray-800'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                    trader.rank === 1
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                      : trader.rank === 2
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                      : trader.rank === 3
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : trader.rank === 3 ? '🥉' : `#${trader.rank}`}
                </div>

                {/* Trader Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{trader.displayName}</h3>
                    <span className="text-xs text-gray-400 font-mono">
                      {trader.wallet.toString().slice(0, 8)}...
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Total Volume</div>
                      <div className="font-bold">${trader.totalVolume.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total P&L</div>
                      <div
                        className={`font-bold ${
                          trader.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {trader.totalProfitLoss >= 0 ? '+' : ''}$
                        {trader.totalProfitLoss.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">P&L %</div>
                      <div
                        className={`font-bold ${
                          trader.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {trader.profitLossPercentage >= 0 ? '+' : ''}
                        {trader.profitLossPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Win Rate</div>
                      <div className="font-bold">{trader.winRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Trades</div>
                      <div className="font-bold">{trader.totalTrades}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Stats */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-lg border border-purple-500">
        <h3 className="text-xl font-bold mb-4">📊 Community Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tokens" value="12" icon="💎" />
          <StatCard label="Total Traders" value="1,234" icon="👥" />
          <StatCard label="24h Volume" value="$125k" icon="📊" />
          <StatCard label="Total Value Locked" value="$2.5M" icon="🔒" />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string }> = ({
  label,
  value,
  icon,
}) => (
  <div className="bg-black/30 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);
