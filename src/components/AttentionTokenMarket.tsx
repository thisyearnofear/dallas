/**
 * Attention Token Market Component
 * Displays all attention tokens with analytics and trading interface
 */

import React, { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { attentionTokenService } from '../services/AttentionTokenService';
import {
  AttentionToken,
  AttentionTokenFilters,
  CaseStudyWithAttentionToken,
} from '../types/attentionToken';

export const AttentionTokenMarket: React.FC = () => {
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<CaseStudyWithAttentionToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AttentionTokenFilters>({
    sortBy: 'marketCap',
    sortOrder: 'desc',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAttentionTokens();
  }, []);

  const loadAttentionTokens = async () => {
    setLoading(true);
    try {
      const { SOLANA_CONFIG } = await import('../config/solana');
      const { parseCaseStudyAccount } = await import('../utils/solanaUtils');
      
      const programId = new PublicKey(SOLANA_CONFIG.blockchain.caseStudyProgramId);
      
      // Fetch all case study accounts from the program
      const accounts = await connection.getProgramAccounts(programId, {
        filters: [
          {
            // Filter for accounts that have attention_token_mint set
            memcmp: {
              offset: 8 + 32 + 50 + 1 + 1 + 1 + 1 + 32 + 2, // Position of attention_token_mint option flag
              bytes: '2', // 1 in base58 = Some(...)
            },
          },
        ],
      });

      // Parse and enrich with analytics
      const tokensWithAnalytics = await Promise.all(
        accounts.map(async ({ pubkey, account }) => {
          try {
            const parsed = parseCaseStudyAccount(account.data);
            
            if (!parsed.attentionTokenMint) {
              return null;
            }

            // Fetch analytics from Bags API
            const analytics = await attentionTokenService.getTokenAnalytics(
              parsed.attentionTokenMint
            );

            return {
              publicKey: pubkey,
              submitter: parsed.submitter,
              treatmentName: 'Treatment', // Would need to be stored in account or fetched from URI
              treatmentCategory: 'General',
              description: 'Treatment description',
              imageUrl: 'https://via.placeholder.com/400',
              reputationScore: parsed.reputationScore,
              validatorCount: parsed.approvalCount,
              validators: [],
              createdAt: Date.now(),
              attentionTokenMint: parsed.attentionTokenMint,
              attentionToken: {
                mint: parsed.attentionTokenMint,
                bondingCurve: new PublicKey('11111111111111111111111111111111'), // Would be fetched from Bags
                caseStudyPda: pubkey,
                name: `Attention Token`,
                symbol: 'ATT',
                description: 'Treatment attention token',
                imageUrl: 'https://via.placeholder.com/400',
                submitter: parsed.submitter,
                validators: [],
                treatmentName: 'Treatment',
                treatmentCategory: 'General',
                reputationScore: parsed.reputationScore,
                createdAt: Date.now(),
                analytics,
              },
            } as CaseStudyWithAttentionToken;
          } catch (error) {
            console.error('Failed to parse case study:', error);
            return null;
          }
        })
      );

      // Filter out nulls
      const validTokens = tokensWithAnalytics.filter((t): t is CaseStudyWithAttentionToken => t !== null);
      setTokens(validTokens);
    } catch (error) {
      console.error('Error loading attention tokens:', error);
      // Set empty array on error rather than mock data
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens
    .filter((token) => {
      if (selectedCategory === 'all') return true;
      return token.treatmentCategory.toLowerCase() === selectedCategory.toLowerCase();
    })
    .sort((a, b) => {
      if (!a.attentionToken?.analytics || !b.attentionToken?.analytics) return 0;

      const sortBy = filters.sortBy || 'marketCap';
      const order = filters.sortOrder === 'asc' ? 1 : -1;

      const aValue = a.attentionToken.analytics[sortBy] || 0;
      const bValue = b.attentionToken.analytics[sortBy] || 0;

      return (aValue - bValue) * order;
    });

  if (!attentionTokenService.isConfigured()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-900/20 border border-yellow-600 p-6 rounded-lg max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-2 text-yellow-500">⚠️ Bags API Not Configured</h3>
          <p className="text-gray-300">
            Attention token market requires Bags API configuration. Please add your API key to the
            environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          💎 Attention Token Market
        </h1>
        <p className="text-gray-400">
          Discover and trade treatment-specific tokens. Support breakthrough treatments with your
          capital.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
          >
            <option value="all">All Categories</option>
            <option value="experimental">Experimental</option>
            <option value="metabolic">Metabolic</option>
            <option value="supplement">Supplement</option>
            <option value="therapy">Therapy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ ...filters, sortBy: e.target.value as any })
            }
            className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
          >
            <option value="marketCap">Market Cap</option>
            <option value="volume24h">24h Volume</option>
            <option value="holders">Holders</option>
            <option value="createdAt">Recently Created</option>
            <option value="price">Price</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Order</label>
          <select
            value={filters.sortOrder}
            onChange={(e) =>
              setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })
            }
            className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
          >
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-lg border border-gray-700 animate-pulse">
              <div className="h-32 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty/Error States */}
      {!loading && tokens.length === 0 && (
        <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
          <div className="text-6xl mb-4">💎</div>
          <p className="text-gray-400 text-xl mb-2">No Attention Tokens Yet</p>
          <p className="text-gray-500 mb-6">
            Be the first to create an attention token for your validated case study!
          </p>
          <a
            href="/experiences"
            className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition"
          >
            Submit Case Study
          </a>
        </div>
      )}

      {!loading && tokens.length > 0 && filteredTokens.length === 0 && (
        <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
          <p className="text-gray-400 text-lg mb-2">No tokens match your filters</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setFilters({ sortBy: 'marketCap', sortOrder: 'desc' });
            }}
            className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {!loading && filteredTokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTokens.map((token) => (
            <AttentionTokenCard key={token.publicKey.toString()} caseStudy={token} />
          ))}
        </div>
      )}
    </div>
  );
};

// Individual Token Card Component
const AttentionTokenCard: React.FC<{ caseStudy: CaseStudyWithAttentionToken }> = ({
  caseStudy,
}) => {
  const analytics = caseStudy.attentionToken?.analytics;

  if (!analytics) return null;

  const priceChangeColor = analytics.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400';
  const priceChangeSymbol = analytics.priceChange24h >= 0 ? '+' : '';

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition group">
      {/* Token Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={caseStudy.imageUrl}
          alt={caseStudy.treatmentName}
          className="w-full h-40 object-cover group-hover:scale-105 transition"
        />
        <div className="absolute top-2 right-2 bg-purple-600 px-2 py-1 rounded text-xs font-bold">
          {caseStudy.attentionToken?.symbol}
        </div>
      </div>

      {/* Token Info */}
      <h3 className="text-xl font-bold mb-1">{caseStudy.treatmentName}</h3>
      <p className="text-sm text-gray-400 mb-4">{caseStudy.treatmentCategory}</p>

      {/* Reputation Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-green-900/30 border border-green-600 px-2 py-1 rounded text-xs">
          <span className="text-green-400 font-bold">{caseStudy.reputationScore}/100</span>
          <span className="text-gray-400 ml-1">reputation</span>
        </div>
        <div className="bg-blue-900/30 border border-blue-600 px-2 py-1 rounded text-xs">
          <span className="text-blue-400 font-bold">{caseStudy.validatorCount}</span>
          <span className="text-gray-400 ml-1">validators</span>
        </div>
      </div>

      {/* Analytics */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Market Cap:</span>
          <span className="font-bold">${analytics.marketCap.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Volume:</span>
          <span>${analytics.volume24h.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Holders:</span>
          <span>{analytics.holders.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Price:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono">${analytics.price.toFixed(6)}</span>
            <span className={`text-xs ${priceChangeColor}`}>
              {priceChangeSymbol}
              {analytics.priceChange24h.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-bold transition">
          Buy
        </button>
        <button className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded font-bold transition">
          Sell
        </button>
        <button className="px-4 bg-gray-700 hover:bg-gray-600 rounded transition">
          <span>ℹ️</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-xs text-gray-500">
        <span>{analytics.transactions.toLocaleString()} trades</span>
        <span>${analytics.lifetimeFees.toLocaleString()} fees</span>
      </div>
    </div>
  );
};
