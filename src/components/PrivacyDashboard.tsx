/**
 * PrivacyDashboard - Unified Privacy Status Dashboard
 * 
 * Shows the combined status of all privacy technologies:
 * - Noir ZK proofs generated/verified
 * - Light Protocol compression savings
 * - Arcium MPC sessions active
 * - Overall privacy score
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: New component that ties everything together
 * - DRY: Uses unified PrivacyService
 * - CLEAN: Clear visualization of privacy stack
 * - PERFORMANT: Mobile-optimized, lazy loading
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import {
  privacyService,
  lightProtocolService,
  noirService,
  arciumMPCService,
  PRIVACY_SCORE_WEIGHTS,
  type PrivacyLevel,
} from '../services/privacy';
import { WearableIntegration } from './WearableIntegration';
import { useIsMobile } from './MobileEnhancements';
import { useWallet } from '../context/WalletContext';
import { SOLANA_CONFIG } from '../config/solana';
import { cacheService } from '../services/CacheService';
import { PublicKey } from '@solana/web3.js';

interface PrivacyStats {
  // Noir
  totalProofsGenerated: number;
  totalProofsVerified: number;
  circuitsUsed: string[];

  // Light Protocol
  totalCompressed: number;
  totalBytesSaved: number;
  averageCompressionRatio: number;

  // Arcium MPC
  activeSessions: number;
  completedSessions: number;
  totalCommitteeApprovals: number;

  // Combined
  overallPrivacyScore: number;
}

interface ProofCounts {
  totalProofsGenerated: number;
  totalProofsVerified: number;
}

interface MPCSessionCounts {
  activeSessions: number;
  completedSessions: number;
  totalCommitteeApprovals: number;
}

interface CompressionStats {
  totalCompressed: number;
  totalBytesSaved: number;
  averageCompressionRatio: number;
}

interface PrivacyDashboardProps {
  compact?: boolean;
  showTips?: boolean;
}

// Cache key for privacy stats
const PRIVACY_STATS_CACHE_KEY = 'privacy_dashboard_stats';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const PrivacyDashboard: FunctionalComponent<PrivacyDashboardProps> = ({
  compact = false,
  showTips = true,
}) => {
  const isMobile = useIsMobile();
  const { connection } = useWallet();
  const [stats, setStats] = useState<PrivacyStats>({
    totalProofsGenerated: 0,
    totalProofsVerified: 0,
    circuitsUsed: [],
    totalCompressed: 0,
    totalBytesSaved: 0,
    averageCompressionRatio: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalCommitteeApprovals: 0,
    overallPrivacyScore: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'proofs' | 'compression' | 'mpc' | 'biometrics'>('overview');

  /**
   * Fetch case study count from blockchain
   */
  const fetchCaseStudyCount = useCallback(async () => {
    try {
      const caseStudyProgramId = new PublicKey(SOLANA_CONFIG.blockchain.caseStudyProgramId);

      // Get all case study accounts for the program
      const accounts = await connection.getProgramAccounts(caseStudyProgramId, {
        filters: [
          { dataSize: 254 }, // CaseStudy account size
        ],
      });

      return accounts.length;
    } catch (err) {
      console.error('Error fetching case study count:', err);
      return 0;
    }
  }, [connection]);

  /**
   * Calculate compression stats from real data
   */
  const calculateCompressionStats = useCallback(async () => {
    try {
      const caseStudyProgramId = new PublicKey(SOLANA_CONFIG.blockchain.caseStudyProgramId);

      // Get all case study accounts to calculate compression
      const accounts = await connection.getProgramAccounts(caseStudyProgramId, {
        filters: [
          { dataSize: 254 }, // CaseStudy account size
        ],
      });

      let totalCompressed = 0;
      let totalBytesSaved = 0;
      let totalCompressionRatio = 0;

      for (const { account } of accounts) {
        try {
          const data = account.data;
          if (data.length < 100) continue;

          // Read compression_ratio from account data (offset varies based on struct)
          // Account layout: discriminator(8) + ephemeral_id(32) + patient_id(32) + ...
          // Compression ratio is stored as u16
          let offset = 8 + 32 + 32; // Skip discriminator, ephemeral_id, patient_id

          // Skip ipfs_cid (String)
          const ipfsCidLen = data.readUInt32LE(offset);
          offset += 4 + ipfsCidLen;

          // Skip treatment_protocol (String)
          const treatmentProtocolLen = data.readUInt32LE(offset);
          offset += 4 + treatmentProtocolLen;

          // Skip metadata_hash (32 bytes)
          offset += 32;

          // Skip treatment_category (1 byte)
          offset += 1;

          // Skip duration_days (2 bytes)
          offset += 2;

          // Skip proof_of_encryption (Vec<u8>)
          const proofLen = data.readUInt32LE(offset);
          offset += 4 + proofLen;

          // Skip light_protocol_proof (Vec<u8>)
          const lightProofLen = data.readUInt32LE(offset);
          offset += 4 + lightProofLen;

          // Read compression_ratio (2 bytes, u16)
          const compressionRatio = data.readUInt16LE(offset);

          if (compressionRatio > 0) {
            totalCompressed++;
            // Estimate bytes saved based on compression ratio
            // Assuming average case study size of ~500 bytes
            const originalSize = 500;
            const compressedSize = Math.floor(originalSize / compressionRatio);
            const bytesSaved = originalSize - compressedSize;

            totalBytesSaved += bytesSaved;
            totalCompressionRatio += compressionRatio;
          }
        } catch (e) {
          // Skip accounts that can't be parsed
          continue;
        }
      }

      const averageCompressionRatio = totalCompressed > 0
        ? totalCompressionRatio / totalCompressed
        : 0;

      const result: CompressionStats = {
        totalCompressed,
        totalBytesSaved,
        averageCompressionRatio,
      };

      return result;
    } catch (err) {
      console.error('Error calculating compression stats:', err);
      const result: CompressionStats = {
        totalCompressed: 0,
        totalBytesSaved: 0,
        averageCompressionRatio: 0,
      };
      return result;
    }
  }, [connection]);

  /**
   * Get proof counts from noirService
   */
  const getProofCounts = useCallback(() => {
    const proofs = noirService.getProofs();
    const result: ProofCounts = {
      totalProofsGenerated: proofs.length,
      totalProofsVerified: proofs.filter(p => p.verified).length,
    };
    return result;
  }, []);

  /**
   * Get MPC session counts from arciumMPCService
   */
  const getMPCSessionCounts = useCallback(() => {
    const activeMPC = arciumMPCService.getActiveSessions();
    const completedMPC = arciumMPCService.getCompletedSessions();

    // Calculate total committee approvals
    let totalCommitteeApprovals = 0;
    for (const session of [...activeMPC, ...completedMPC]) {
      totalCommitteeApprovals += session.committee.filter(m => m.hasApproved).length;
    }

    const result: MPCSessionCounts = {
      activeSessions: activeMPC.length,
      completedSessions: completedMPC.length,
      totalCommitteeApprovals,
    };
    return result;
  }, []);

  /**
   * Load all stats with caching
   */
  const loadStats = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = cacheService.get<PrivacyStats>(PRIVACY_STATS_CACHE_KEY);
        if (cached) {
          setStats(cached);
          setPrivacyLevel(privacyService.getPrivacyLevel(cached.overallPrivacyScore));
          setIsLoading(false);
          return;
        }
      }

      // Initialize privacy service
      await privacyService.initialize();

      // Fetch real data in parallel
      const [
        caseStudyCount,
        compressionStats,
        proofCounts,
        mpcCounts,
      ] = await Promise.all([
        fetchCaseStudyCount(),
        calculateCompressionStats(),
        Promise.resolve(getProofCounts()),
        Promise.resolve(getMPCSessionCounts()),
      ]);

      // Calculate privacy score based on real data
      const hasEncryption = caseStudyCount > 0;
      const hasZkProofs = proofCounts.totalProofsGenerated > 0;
      const hasCompression = compressionStats.totalCompressed > 0;
      const hasMPC = mpcCounts.activeSessions > 0 || mpcCounts.completedSessions > 0;

      const score = privacyService.calculatePrivacyScore(
        hasEncryption,
        hasZkProofs,
        hasCompression,
        hasMPC
      );

      const newStats: PrivacyStats = {
        totalProofsGenerated: proofCounts.totalProofsGenerated,
        totalProofsVerified: proofCounts.totalProofsVerified,
        circuitsUsed: noirService.getAvailableCircuits().map(c => c.type),
        totalCompressed: compressionStats.totalCompressed,
        totalBytesSaved: compressionStats.totalBytesSaved,
        averageCompressionRatio: compressionStats.averageCompressionRatio,
        activeSessions: mpcCounts.activeSessions,
        completedSessions: mpcCounts.completedSessions,
        totalCommitteeApprovals: mpcCounts.totalCommitteeApprovals,
        overallPrivacyScore: score,
      };

      // Update state
      setStats(newStats);
      setPrivacyLevel(privacyService.getPrivacyLevel(score));

      // Cache the results
      cacheService.set(PRIVACY_STATS_CACHE_KEY, newStats, CACHE_TTL);

    } catch (err) {
      console.error('Error loading privacy stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load privacy stats');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchCaseStudyCount, calculateCompressionStats, getProofCounts, getMPCSessionCounts]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadStats(true);
  }, [loadStats]);

  // Initialize services and load stats on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refresh stats periodically (every 30 seconds)
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      loadStats(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, loadStats]);

  // Format bytes
  const formatBytes = useCallback((bytes: number) => lightProtocolService.formatBytes(bytes), []);

  if (isLoading) {
    return (
      <div class="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl">
        <div class="text-center py-10">
          <div class="animate-spin text-4xl mb-4">🔐</div>
          <p class="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
            Initializing Privacy Stack...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div class="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-red-200 dark:border-red-800 shadow-xl">
        <div class="text-center py-6">
          <div class="text-4xl mb-4">⚠️</div>
          <p class="text-red-600 dark:text-red-400 font-bold mb-4">
            Error loading privacy stats
          </p>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Compact mode for mobile/sidebar
  if (compact) {
    return (
      <div class="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>🛡️</span>
            <span>Privacy Score</span>
          </h3>
          <span class={`text-2xl font-black ${stats.overallPrivacyScore >= 90 ? 'text-purple-600 dark:text-purple-400' :
              stats.overallPrivacyScore >= 75 ? 'text-green-600 dark:text-green-400' :
                stats.overallPrivacyScore >= 50 ? 'text-blue-600 dark:text-blue-400' :
                  'text-yellow-600 dark:text-yellow-400'
            }`}>
            {stats.overallPrivacyScore}
          </span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            class={`h-full rounded-full transition-all duration-500 ${stats.overallPrivacyScore >= 90 ? 'bg-purple-500' :
                stats.overallPrivacyScore >= 75 ? 'bg-green-500' :
                  stats.overallPrivacyScore >= 50 ? 'bg-blue-500' :
                    'bg-yellow-500'
              }`}
            style={{ width: `${stats.overallPrivacyScore}%` }}
          />
        </div>
        <div class="grid grid-cols-3 gap-2 mt-3 text-center">
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
            <div class="text-lg">🔐</div>
            <div class="text-xs font-bold text-blue-600 dark:text-blue-400">{stats.totalProofsGenerated}</div>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
            <div class="text-lg">⚡</div>
            <div class="text-xs font-bold text-green-600 dark:text-green-400">{formatBytes(stats.totalBytesSaved)}</div>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
            <div class="text-lg">🔑</div>
            <div class="text-xs font-bold text-yellow-600 dark:text-yellow-400">{stats.activeSessions}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 md:p-8 rounded-2xl border-2 border-purple-500 shadow-xl transition-all duration-300">
      {/* Header with Refresh Button */}
      <div class="mb-6 md:mb-10 flex items-start justify-between">
        <div>
          <h2 class="text-2xl md:text-3xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
            <span class="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-xl md:text-2xl">🛡️</span>
            <span>Privacy Dashboard</span>
          </h2>
          <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm md:text-base">
            Real-time status of your privacy protection across all technologies.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <span class={`text-lg ${isRefreshing ? 'animate-spin' : ''}`}>🔄</span>
        </button>
      </div>

      {/* Mobile Tab Navigation */}
      {isMobile && (
        <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['overview', 'biometrics', 'proofs', 'compression', 'mpc'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              class={`
                px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap
                transition-colors touch-manipulation
                ${activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
              `}
            >
              {tab === 'biometrics' ? '🧬 Biometrics' : tab}
            </button>
          ))}
        </div>
      )}

      {/* Desktop Navigation Tabs */}
      {!isMobile && (
        <div class="flex gap-4 mb-8 border-b-2 border-slate-100 dark:border-slate-800">
          {(['overview', 'biometrics', 'proofs', 'compression', 'mpc'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              class={`
                pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative
                ${activeTab === tab
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}
              `}
            >
              {tab === 'biometrics' ? '🧬 Biometrics' : tab}
              {activeTab === tab && (
                <div class="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-purple-500 rounded-full animate-fadeIn" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overall Privacy Score */}
      {(activeTab === 'overview' || !isMobile) && (
        <div class={`mb-6 md:mb-10 p-6 md:p-8 rounded-2xl border-2 ${privacyLevel?.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' :
            privacyLevel?.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
              privacyLevel?.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' :
                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
          }`}>
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <p class={`text-[10px] font-black uppercase tracking-widest mb-1 ${privacyLevel?.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  privacyLevel?.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    privacyLevel?.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      'text-yellow-600 dark:text-yellow-400'
                }`}>
                Overall Privacy Score
              </p>
              <p class="text-4xl md:text-5xl font-black tracking-tighter">
                {stats.overallPrivacyScore}<span class="text-xl md:text-2xl">/100</span>
              </p>
            </div>
            <div class="text-left md:text-right">
              <div class="text-3xl md:text-4xl mb-2">{privacyLevel?.icon}</div>
              <p class={`text-sm font-black uppercase tracking-wider ${privacyLevel?.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                  privacyLevel?.color === 'green' ? 'text-green-700 dark:text-green-300' :
                    privacyLevel?.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                      'text-yellow-700 dark:text-yellow-300'
                }`}>
                {privacyLevel?.label}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{privacyLevel?.description}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
            <div class="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Encryption</p>
              <p class="text-lg font-black">+{PRIVACY_SCORE_WEIGHTS.encryption}</p>
            </div>
            <div class="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">ZK Proofs</p>
              <p class="text-lg font-black">+{PRIVACY_SCORE_WEIGHTS.zk_proofs}</p>
            </div>
            <div class="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Compression</p>
              <p class="text-lg font-black">+{PRIVACY_SCORE_WEIGHTS.compression}</p>
            </div>
            <div class="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">MPC</p>
              <p class="text-lg font-black">+{PRIVACY_SCORE_WEIGHTS.mpc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Biometrics View */}
      {activeTab === 'biometrics' && (
        <div class="animate-slideUp">
          <WearableIntegration />
        </div>
      )}

      {/* Technology Cards */}
      {(activeTab === 'overview' || activeTab === 'proofs' || activeTab === 'compression' || activeTab === 'mpc') && (
        <div class={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-4 md:gap-6 mb-6 md:mb-10`}>
          {/* Noir Card */}
          {(activeTab === 'overview' || activeTab === 'proofs') && (
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 md:p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔐</span>
                <div>
                  <h3 class="font-black text-blue-800 dark:text-blue-300 uppercase tracking-tight text-sm md:text-base">Noir</h3>
                  <p class="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest">ZK-SNARK Proofs</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Proofs Generated</span>
                  <span class="font-black text-blue-700 dark:text-blue-300">{stats.totalProofsGenerated}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Verified</span>
                  <span class="font-black text-green-600 dark:text-green-400">{stats.totalProofsVerified}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Circuits</span>
                  <span class="font-black text-blue-700 dark:text-blue-300">{stats.circuitsUsed.length}</span>
                </div>
              </div>

              {/* Circuit List */}
              <div class="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Active Circuits</p>
                <div class="flex flex-wrap gap-2">
                  {stats.circuitsUsed.map(circuit => (
                    <span key={circuit} class="text-[10px] bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-bold uppercase">
                      {circuit.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Light Protocol Card */}
          {(activeTab === 'overview' || activeTab === 'compression' || !isMobile) && (
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 md:p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⚡</span>
                <div>
                  <h3 class="font-black text-green-800 dark:text-green-300 uppercase tracking-tight text-sm md:text-base">Light Protocol</h3>
                  <p class="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-widest">ZK Compression</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Compressed</span>
                  <span class="font-black text-green-700 dark:text-green-300">{stats.totalCompressed}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Space Saved</span>
                  <span class="font-black text-green-600 dark:text-green-400">{formatBytes(stats.totalBytesSaved)}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Avg Ratio</span>
                  <span class="font-black text-green-700 dark:text-green-300">{stats.averageCompressionRatio.toFixed(1)}x</span>
                </div>
              </div>

              {/* Compression Visual */}
              <div class="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Compression Levels</p>
                <div class="flex gap-1">
                  <div class="h-2 flex-1 bg-green-300 rounded-l"></div>
                  <div class="h-2 flex-1 bg-green-400"></div>
                  <div class="h-2 flex-1 bg-green-500"></div>
                  <div class="h-2 flex-1 bg-green-600 rounded-r"></div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>2x</span>
                  <span>50x</span>
                </div>
              </div>
            </div>
          )}

          {/* Arcium MPC Card */}
          {(activeTab === 'overview' || activeTab === 'mpc' || !isMobile) && (
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 md:p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔑</span>
                <div>
                  <h3 class="font-black text-yellow-800 dark:text-yellow-300 uppercase tracking-tight text-sm md:text-base">Arcium MPC</h3>
                  <p class="text-[10px] text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Threshold Decryption</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Active Sessions</span>
                  <span class="font-black text-yellow-700 dark:text-yellow-300">{stats.activeSessions}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Completed</span>
                  <span class="font-black text-green-600 dark:text-green-400">{stats.completedSessions}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-600 dark:text-slate-400">Committee Approvals</span>
                  <span class="font-black text-yellow-700 dark:text-yellow-300">{stats.totalCommitteeApprovals}</span>
                </div>
              </div>

              {/* MPC Status */}
              <div class="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Committee Status</p>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${(stats.completedSessions / (stats.completedSessions + stats.activeSessions || 1)) * 100}%` }}
                    />
                  </div>
                  <span class="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                    {Math.round((stats.completedSessions / (stats.completedSessions + stats.activeSessions || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Privacy Tips */}
      {showTips && (activeTab === 'overview' || !isMobile) && (
        <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 md:p-6">
          <h3 class="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>Privacy Tips</span>
          </h3>
          <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li class="flex items-start gap-2">
              <span class="text-green-500 flex-shrink-0">✓</span>
              <span>Use <strong>Expert Mode</strong> in Validation Dashboard to generate ZK proofs</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 flex-shrink-0">✓</span>
              <span>Select <strong>10x compression</strong> for optimal storage savings</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 flex-shrink-0">✓</span>
              <span>Request research access through <strong>Arcium MPC</strong> for committee-approved decryption</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PrivacyDashboard;
