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
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {
  privacyService,
  lightProtocolService,
  noirService,
  arciumMPCService,
  PRIVACY_SCORE_WEIGHTS,
} from '../services/privacy';

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

export const PrivacyDashboard: FunctionalComponent = () => {
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

  // Initialize services and load stats
  useEffect(() => {
    const init = async () => {
      await privacyService.initialize();
      
      // Load mock stats (in production, fetch from blockchain/indexer)
      setStats({
        totalProofsGenerated: 156,
        totalProofsVerified: 148,
        circuitsUsed: ['symptom_improvement', 'duration_verification', 'data_completeness', 'cost_range'],
        totalCompressed: 89,
        totalBytesSaved: 425000, // ~425 KB saved
        averageCompressionRatio: 12.5,
        activeSessions: 3,
        completedSessions: 12,
        totalCommitteeApprovals: 47,
        overallPrivacyScore: 92,
      });
      
      setIsLoading(false);
    };
    
    init();
  }, []);

  // Get privacy level
  const privacyLevel = privacyService.getPrivacyLevel(stats.overallPrivacyScore);

  // Format bytes
  const formatBytes = (bytes: number) => lightProtocolService.formatBytes(bytes);

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

  return (
    <div class="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl border-2 border-purple-500 shadow-xl transition-all duration-300">
      {/* Header */}
      <div class="mb-10">
        <h2 class="text-3xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
          <span class="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-2xl">🛡️</span>
          <span>Privacy Dashboard</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Real-time status of your privacy protection across all technologies.
        </p>
      </div>

      {/* Overall Privacy Score */}
      <div class={`mb-10 p-8 rounded-2xl border-2 ${
        privacyLevel.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' :
        privacyLevel.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
        privacyLevel.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' :
        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
      }`}>
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class={`text-[10px] font-black uppercase tracking-widest mb-1 ${
              privacyLevel.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
              privacyLevel.color === 'green' ? 'text-green-600 dark:text-green-400' :
              privacyLevel.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`}>
              Overall Privacy Score
            </p>
            <p class="text-5xl font-black tracking-tighter">
              {stats.overallPrivacyScore}<span class="text-2xl">/100</span>
            </p>
          </div>
          <div class="text-right">
            <div class="text-4xl mb-2">{privacyLevel.icon}</div>
            <p class={`text-sm font-black uppercase tracking-wider ${
              privacyLevel.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
              privacyLevel.color === 'green' ? 'text-green-700 dark:text-green-300' :
              privacyLevel.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
              'text-yellow-700 dark:text-yellow-300'
            }`}>
              {privacyLevel.label}
            </p>
          </div>
        </div>
        
        {/* Score Breakdown */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
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

      {/* Technology Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Noir Card */}
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl">🔐</span>
            <div>
              <h3 class="font-black text-blue-800 dark:text-blue-300 uppercase tracking-tight">Noir</h3>
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

        {/* Light Protocol Card */}
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl">⚡</span>
            <div>
              <h3 class="font-black text-green-800 dark:text-green-300 uppercase tracking-tight">Light Protocol</h3>
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

        {/* Arcium MPC Card */}
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-xl">🔑</span>
            <div>
              <h3 class="font-black text-yellow-800 dark:text-yellow-300 uppercase tracking-tight">Arcium MPC</h3>
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
                  style={{ width: `${(stats.completedSessions / (stats.completedSessions + stats.activeSessions)) * 100}%` }}
                />
              </div>
              <span class="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                {Math.round((stats.completedSessions / (stats.completedSessions + stats.activeSessions)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Tips */}
      <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h3 class="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>Privacy Tips</span>
        </h3>
        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li class="flex items-start gap-2">
            <span class="text-green-500">✓</span>
            <span>Use <strong>Expert Mode</strong> in Validation Dashboard to generate ZK proofs</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-500">✓</span>
            <span>Select <strong>10x compression</strong> for optimal storage savings</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-500">✓</span>
            <span>Request research access through <strong>Arcium MPC</strong> for committee-approved decryption</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyDashboard;
