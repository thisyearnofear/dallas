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
import { AttentionTokenAnalyticsDashboard } from './AttentionTokenAnalyticsDashboard';

export const AttentionTokenMarket: React.FC = () => {
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<CaseStudyWithAttentionToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<AttentionToken | null>(null);
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

  if (selectedToken) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fadeIn">
        <button
          onClick={() => setSelectedToken(null)}
          className="mb-8 flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-white transition-all group font-black uppercase tracking-widest text-xs"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Attention Market</span>
        </button>
        <AttentionTokenAnalyticsDashboard token={selectedToken} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 transition-colors duration-300">
      <div className="mb-12">
        <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent uppercase tracking-tighter">
          💎 Attention Token Market
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">
          Discover and trade treatment-specific initiatives. Support breakthrough protocols with your
          capital and intelligence.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-wrap gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Research Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-brand shadow-inner"
          >
            <option value="all">All Disciplines</option>
            <option value="experimental">Experimental</option>
            <option value="metabolic">Metabolic</option>
            <option value="supplement">Supplement</option>
            <option value="therapy">Therapy</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Rank By</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ ...filters, sortBy: e.target.value as any })
            }
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-brand shadow-inner"
          >
            <option value="marketCap">Market Cap</option>
            <option value="volume24h">24h Volume</option>
            <option value="holders">Supporter Count</option>
            <option value="createdAt">Newly Deployed</option>
            <option value="price">Initiative Price</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Sequence</label>
          <select
            value={filters.sortOrder}
            onChange={(e) =>
              setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })
            }
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-brand shadow-inner"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse h-[500px]">
              <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6"></div>
              <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 mb-8"></div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty/Error States */}
      {!loading && tokens.length === 0 && (
        <div className="bg-white dark:bg-slate-900 p-20 rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-800 text-center shadow-xl">
          <div className="text-8xl mb-8 opacity-20">💎</div>
          <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tighter uppercase mb-4 text-center">No Active Initiatives</p>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium max-w-md mx-auto leading-relaxed">
            The market is currently dormant. Be the first to launch an attention token for your validated research.
          </p>
          <a
            href="/experiences"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-black px-10 py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-purple-500/20 uppercase tracking-widest text-sm"
          >
            Deploy Research Profile
          </a>
        </div>
      )}

      {!loading && tokens.length > 0 && filteredTokens.length === 0 && (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="text-5xl mb-6 opacity-20">🔍</div>
          <p className="text-slate-900 dark:text-white text-xl font-black tracking-tighter uppercase mb-2">No Matching Data</p>
          <p className="text-slate-500 dark:text-slate-500 mb-8 font-medium">Adjust your research parameters to find active cells.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setFilters({ sortBy: 'marketCap', sortOrder: 'desc' });
            }}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black px-8 py-3 rounded-xl transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Reset Intelligence Filters
          </button>
        </div>
      )}

      {!loading && filteredTokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredTokens.map((token) => (
            <AttentionTokenCard 
              key={token.publicKey.toString()} 
              caseStudy={token} 
              onEnterWarRoom={() => token.attentionToken && setSelectedToken(token.attentionToken)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Individual Token Card Component
const AttentionTokenCard: React.FC<{ 
  caseStudy: CaseStudyWithAttentionToken,
  onEnterWarRoom: () => void 
}> = ({
  caseStudy,
  onEnterWarRoom,
}) => {
  const analytics = caseStudy.attentionToken?.analytics;

  if (!analytics) return null;

  const priceChangeColor = analytics.priceChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const priceChangeSymbol = analytics.priceChange24h >= 0 ? '▲' : '▼';

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all transform hover:scale-[1.03] group shadow-sm hover:shadow-2xl">
      {/* Token Image */}
      <div className="relative mb-6 overflow-hidden rounded-2xl shadow-inner bg-slate-50 dark:bg-black/20">
        <img
          src={caseStudy.imageUrl}
          alt={caseStudy.treatmentName}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg border border-purple-400/30 uppercase tracking-widest">
          {caseStudy.attentionToken?.symbol}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Token Info */}
      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-purple-600 transition-colors mb-1">{caseStudy.treatmentName}</h3>
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">{caseStudy.treatmentCategory}</p>

      {/* Reputation Badges */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
          <span className="text-green-600 dark:text-green-400 font-black text-sm tracking-tighter">{caseStudy.reputationScore}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trust</span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
          <span className="text-blue-600 dark:text-blue-400 font-black text-sm tracking-tighter">{caseStudy.validatorCount}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nodes</span>
        </div>
      </div>

      {/* Analytics */}
      <div className="space-y-3 mb-8 bg-slate-50 dark:bg-black/20 p-5 rounded-2xl shadow-inner border border-slate-100 dark:border-white/5">
        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/5 pb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Cap</span>
          <span className="font-black text-slate-900 dark:text-white tracking-tighter text-lg">${analytics.marketCap.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/5 pb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Price</span>
          <div className="text-right">
            <div className="font-black text-slate-900 dark:text-white tracking-tighter text-lg font-mono">${analytics.price.toFixed(6)}</div>
            <div className={`text-[10px] font-black ${priceChangeColor} tracking-widest`}>
              {priceChangeSymbol} {Math.abs(analytics.priceChange24h).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* ENHANCEMENT: Initiative Metrics */}
      <div className="bg-slate-900 dark:bg-black p-5 rounded-2xl border-2 border-purple-500/20 mb-8 shadow-xl relative overflow-hidden group/intel">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-scan"></div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <span className="text-purple-400 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
            Underground Intel
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{analytics.communityStats?.researchUpdates || 0} Signal Updates</span>
        </div>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center group-hover/intel:border-purple-500/30 transition-colors">
            <span className="text-xl mb-1">👥</span>
            <span className="text-white font-black tracking-tighter">{analytics.communityStats?.activeSupporters || 0}</span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Cells</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center group-hover/intel:border-purple-500/30 transition-colors">
            <span className="text-xl mb-1">🔬</span>
            <span className="text-white font-black tracking-tighter">{analytics.communityStats?.validationMilestones || 0}</span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Validations</span>
          </div>
        </div>
        {/* Sentiment Bar */}
        <div className="mt-6 relative z-10">
          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">
            <span>Cell Sentiment</span>
            <span className="text-purple-400">{analytics.communityStats?.sentiment || 0}% Consensus</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden shadow-inner border border-white/5">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-500 h-full transition-all duration-1000 shadow-sm shadow-purple-500/50"
              style={{ width: `${analytics.communityStats?.sentiment || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20 uppercase tracking-widest text-xs">
          Buy Position
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onEnterWarRoom(); }}
          className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-700 group/btn shadow-md"
          title="Enter Coordination Cell"
        >
          <span className="text-xl group-hover/btn:rotate-12 transition-transform">☣️</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Volume</span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-tighter">${analytics.volume24h.toLocaleString()}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Fees</span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-tighter">${analytics.lifetimeFees.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
