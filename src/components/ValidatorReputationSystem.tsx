/**
 * ValidatorReputationSystem - Enhanced Validator Reputation Dashboard
 * 
 * Features:
 * - Accuracy tracking over time
 * - Tier-based rewards visualization
 * - Dispute resolution mechanism
 * - Validator leaderboard
 * - Historical performance charts
 * 
 * Core Principles:
 * - ENHANCEMENT FIRST: Extends existing ValidatorDashboard
 * - DRY: Uses unified DbcTokenService
 * - CLEAN: Clear separation of concerns
 * - PERFORMANT: Lazy loading, caching
 */

import { FunctionalComponent } from 'preact';
import { useState, useEffect, useCallback, useContext } from 'preact/hooks';
import { WalletContext, type WalletContextType } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { useDbcToken } from '../hooks/useDbcToken';
import { 
  DbcTokenService, 
  calculateTier, 
  type ValidatorTier,
  TIER_THRESHOLDS,
} from '../services/DbcTokenService';
import { useIsMobile } from './MobileEnhancements';

// ============= Types =============

interface ValidationHistory {
  id: string;
  timestamp: number;
  caseStudyId: string;
  validationType: 'quality' | 'accuracy' | 'safety';
  approved: boolean;
  consensus: 'agreed' | 'disagreed' | 'pending';
  reward: number;
  stakeAmount: number;
}

interface Dispute {
  id: string;
  caseStudyId: string;
  filedBy: string;
  filedAt: number;
  reason: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  resolution?: string;
  validatorStakeAtRisk: number;
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  tier: ValidatorTier;
  totalValidations: number;
  accuracyRate: number;
  totalRewards: number;
  isCurrentUser: boolean;
}

interface AccuracyDataPoint {
  date: string;
  accuracy: number;
  validations: number;
}

// ============= Mock Data Generators =============

const generateMockHistory = (count: number): ValidationHistory[] => {
  const types: ('quality' | 'accuracy' | 'safety')[] = ['quality', 'accuracy', 'safety'];
  const history: ValidationHistory[] = [];
  
  for (let i = 0; i < count; i++) {
    const approved = Math.random() > 0.15; // 85% approval rate
    history.push({
      id: `val_${Date.now()}_${i}`,
      timestamp: Date.now() - i * 86400000,
      caseStudyId: `cs_${Math.floor(Math.random() * 1000)}`,
      validationType: types[Math.floor(Math.random() * types.length)],
      approved,
      consensus: approved ? (Math.random() > 0.2 ? 'agreed' : 'disagreed') : 'pending',
      reward: approved ? Math.floor(Math.random() * 25) + 25 : 0,
      stakeAmount: 10,
    });
  }
  
  return history;
};

const generateMockLeaderboard = (): LeaderboardEntry[] => {
  const tiers: ValidatorTier[] = ['Platinum', 'Gold', 'Silver', 'Bronze'];
  const entries: LeaderboardEntry[] = [];
  
  for (let i = 0; i < 20; i++) {
    const tier = tiers[Math.min(Math.floor(i / 5), 3)];
    entries.push({
      rank: i + 1,
      address: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      tier,
      totalValidations: Math.floor(Math.random() * 500) + 50,
      accuracyRate: Math.floor(Math.random() * 20) + 80,
      totalRewards: Math.floor(Math.random() * 10000) + 1000,
      isCurrentUser: i === 5, // Mock current user at rank 6
    });
  }
  
  return entries.sort((a, b) => b.accuracyRate - a.accuracyRate || b.totalValidations - a.totalValidations)
    .map((e, i) => ({ ...e, rank: i + 1 }));
};

const generateAccuracyHistory = (): AccuracyDataPoint[] => {
  const data: AccuracyDataPoint[] = [];
  let accuracy = 75;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    accuracy += (Math.random() - 0.5) * 5;
    accuracy = Math.max(60, Math.min(100, accuracy));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: Math.round(accuracy),
      validations: Math.floor(Math.random() * 10) + 1,
    });
  }
  
  return data;
};

// ============= Components =============

export const ValidatorReputationSystem: FunctionalComponent = () => {
  const walletContext = useContext(WalletContext) as WalletContextType;
  const { publicKey, validationCount, accuracyRate } = walletContext;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isMobile = useIsMobile();
  
  const { formattedBalance: dbcFormattedBalance, canStake } = useDbcToken();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'leaderboard' | 'disputes'>('overview');
  const [history, setHistory] = useState<ValidationHistory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<AccuracyDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const calculatedTier = calculateTier(validationCount, accuracyRate);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHistory(generateMockHistory(50));
      setLeaderboard(generateMockLeaderboard());
      setAccuracyHistory(generateAccuracyHistory());
      setDisputes([
        {
          id: 'disp_001',
          caseStudyId: 'cs_123',
          filedBy: '0xabc...def',
          filedAt: Date.now() - 86400000,
          reason: 'Validation appears to contradict evidence in case study',
          status: 'pending',
          validatorStakeAtRisk: 10,
        },
      ]);
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Calculate statistics
  const stats = {
    totalValidations: history.length,
    agreedValidations: history.filter(h => h.consensus === 'agreed').length,
    disagreedValidations: history.filter(h => h.consensus === 'disagreed').length,
    totalRewards: history.reduce((sum, h) => sum + h.reward, 0),
    averageReward: history.length > 0 
      ? history.reduce((sum, h) => sum + h.reward, 0) / history.length 
      : 0,
    currentStreak: calculateStreak(history),
    bestStreak: calculateBestStreak(history),
  };
  
  const nextTier = getNextTier(calculatedTier);
  const nextTierRequirements = nextTier ? {
    validationsNeeded: Math.max(0, TIER_THRESHOLDS[nextTier].minValidations - validationCount),
    accuracyNeeded: Math.max(0, TIER_THRESHOLDS[nextTier].minAccuracy - accuracyRate),
  } : null;
  
  if (!publicKey) {
    return (
      <div class={`w-full mx-auto p-6 rounded-lg border-2 transition-all duration-300 ${
        isDark ? 'bg-slate-900 text-white border-purple-500/50' : 'bg-white text-slate-900 border-purple-400 shadow-lg'
      }`}>
        <div class="flex items-center gap-3 mb-3">
          <span class="text-3xl">🏆</span>
          <h2 class={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Validator Reputation
          </h2>
        </div>
        <p class={isDark ? 'text-slate-300' : 'text-slate-600'}>
          Connect your wallet to view your validator reputation, track accuracy over time, and compete on the leaderboard.
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div class={`w-full mx-auto p-8 rounded-lg border-2 transition-all duration-300 ${
        isDark ? 'bg-slate-900 text-white border-purple-500/50' : 'bg-white text-slate-900 border-purple-400 shadow-lg'
      }`}>
        <div class="text-center py-10">
          <div class="animate-spin text-4xl mb-4">🏆</div>
          <p class="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
            Loading Reputation Data...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div class={`w-full mx-auto p-4 md:p-8 rounded-lg border-2 transition-all duration-300 ${
      isDark ? 'bg-slate-900 text-white border-purple-500/50' : 'bg-white text-slate-900 border-purple-400 shadow-xl'
    }`}>
      {/* Header */}
      <div class="mb-6 md:mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-3xl">🏆</span>
              <h2 class={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Validator Reputation
              </h2>
            </div>
            <p class={`text-sm md:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Track your validation accuracy, earn tier rewards, and build your reputation.
            </p>
          </div>
          
          {/* Tier Badge */}
          <div class={`flex items-center gap-3 px-4 py-2 rounded-xl ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <span class="text-3xl">{TIER_THRESHOLDS[calculatedTier].icon}</span>
            <div>
              <p class={`text-xs uppercase tracking-widest font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>Current Tier</p>
              <p class="text-xl font-black" style={{ color: TIER_THRESHOLDS[calculatedTier].color }}>
                {calculatedTier}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['overview', 'history', 'leaderboard', 'disputes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            class={`
              px-4 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap
              transition-colors touch-manipulation
              ${activeTab === tab 
                ? 'bg-purple-500 text-white' 
                : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
            `}
          >
            {tab === 'disputes' && disputes.length > 0 && (
              <span class="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {disputes.length}
              </span>
            )}
            {tab}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div class="space-y-6">
          {/* Stats Grid */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Total Validations" 
              value={stats.totalValidations} 
              icon="✅"
              color="blue"
              isDark={isDark}
            />
            <StatCard 
              label="Accuracy Rate" 
              value={`${accuracyRate}%`} 
              icon="🎯"
              color="green"
              isDark={isDark}
            />
            <StatCard 
              label="Total Rewards" 
              value={`${stats.totalRewards} DBC`} 
              icon="💰"
              color="yellow"
              isDark={isDark}
            />
            <StatCard 
              label="Current Streak" 
              value={`${stats.currentStreak}`} 
              icon="🔥"
              color="orange"
              isDark={isDark}
            />
          </div>
          
          {/* Accuracy Chart */}
          <div class={`p-4 md:p-6 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <h3 class="font-bold mb-4 flex items-center gap-2">
              <span>📈</span>
              <span>30-Day Accuracy History</span>
            </h3>
            <div class="h-32 md:h-48 flex items-end gap-1">
              {accuracyHistory.map((point, i) => (
                <div 
                  key={i}
                  class="flex-1 flex flex-col items-center gap-1"
                >
                  <div 
                    class={`w-full rounded-t transition-all duration-300 ${
                      point.accuracy >= 90 ? 'bg-green-500' :
                      point.accuracy >= 75 ? 'bg-blue-500' :
                      point.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${point.accuracy}%` }}
                    title={`${point.date}: ${point.accuracy}% (${point.validations} validations)`}
                  />
                  {i % 5 === 0 && (
                    <span class="text-[8px] text-slate-400 hidden md:block">{point.date}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Next Tier Progress */}
          {nextTier && nextTierRequirements && (
            <div class={`p-4 md:p-6 rounded-xl border-2 ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold flex items-center gap-2">
                  <span>🎯</span>
                  <span>Next Tier: {nextTier}</span>
                </h3>
                <span class="text-2xl">{TIER_THRESHOLDS[nextTier].icon}</span>
              </div>
              
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      Validations ({validationCount} / {TIER_THRESHOLDS[nextTier].minValidations})
                    </span>
                    <span class="font-bold">
                      {Math.min(100, Math.round((validationCount / TIER_THRESHOLDS[nextTier].minValidations) * 100))}%
                    </span>
                  </div>
                  <div class={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      class="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (validationCount / TIER_THRESHOLDS[nextTier].minValidations) * 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      Accuracy ({accuracyRate}% / {TIER_THRESHOLDS[nextTier].minAccuracy}%)
                    </span>
                    <span class="font-bold">
                      {Math.min(100, Math.round((accuracyRate / TIER_THRESHOLDS[nextTier].minAccuracy) * 100))}%
                    </span>
                  </div>
                  <div class={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      class="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (accuracyRate / TIER_THRESHOLDS[nextTier].minAccuracy) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <div class="space-y-4">
          <div class={`overflow-x-auto rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <table class="w-full text-sm">
              <thead>
                <tr class={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <th class="text-left p-3 font-bold">Date</th>
                  <th class="text-left p-3 font-bold">Type</th>
                  <th class="text-left p-3 font-bold">Decision</th>
                  <th class="text-left p-3 font-bold">Consensus</th>
                  <th class="text-right p-3 font-bold">Reward</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map((entry) => (
                  <tr key={entry.id} class={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                    <td class="p-3">{new Date(entry.timestamp).toLocaleDateString()}</td>
                    <td class="p-3">
                      <span class={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        entry.validationType === 'quality' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        entry.validationType === 'accuracy' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {entry.validationType}
                      </span>
                    </td>
                    <td class="p-3">
                      <span class={entry.approved ? 'text-green-500' : 'text-red-500'}>
                        {entry.approved ? '✅ Approved' : '❌ Rejected'}
                      </span>
                    </td>
                    <td class="p-3">
                      <span class={
                        entry.consensus === 'agreed' ? 'text-green-500' :
                        entry.consensus === 'disagreed' ? 'text-red-500' :
                        'text-yellow-500'
                      }>
                        {entry.consensus === 'agreed' ? '✓ Agreed' :
                         entry.consensus === 'disagreed' ? '✗ Disagreed' :
                         '⏳ Pending'}
                      </span>
                    </td>
                    <td class="p-3 text-right font-bold">
                      {entry.reward > 0 ? `+${entry.reward} DBC` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div class="space-y-4">
          <div class={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            {leaderboard.map((entry, i) => (
              <div 
                key={entry.address}
                class={`flex items-center gap-3 p-3 ${
                  entry.isCurrentUser ? (isDark ? 'bg-purple-900/30' : 'bg-purple-50') : ''
                } ${i !== leaderboard.length - 1 ? (isDark ? 'border-b border-slate-700' : 'border-b border-slate-200') : ''}`}
              >
                <div class={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  entry.rank === 1 ? 'bg-yellow-500 text-white' :
                  entry.rank === 2 ? 'bg-gray-400 text-white' :
                  entry.rank === 3 ? 'bg-amber-600 text-white' :
                  isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  {entry.rank}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold truncate">{entry.address}</span>
                    {entry.isCurrentUser && (
                      <span class="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <div class="flex items-center gap-2 text-xs text-slate-500">
                    <span>{entry.tier} {TIER_THRESHOLDS[entry.tier].icon}</span>
                    <span>•</span>
                    <span>{entry.totalValidations} validations</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-green-500">{entry.accuracyRate}%</div>
                  <div class="text-xs text-slate-500">{entry.totalRewards.toLocaleString()} DBC</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div class="space-y-4">
          {disputes.length === 0 ? (
            <div class={`text-center py-10 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div class="text-4xl mb-3">✅</div>
              <p class="font-bold">No Active Disputes</p>
              <p class="text-sm text-slate-500 mt-1">Great job! Your validations are accurate.</p>
            </div>
          ) : (
            disputes.map(dispute => (
              <div 
                key={dispute.id}
                class={`p-4 md:p-6 rounded-xl border-2 ${
                  dispute.status === 'pending' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  dispute.status === 'under_review' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                  dispute.status === 'resolved' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <h3 class="font-bold">Dispute #{dispute.id}</h3>
                  <span class={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    dispute.status === 'pending' ? 'bg-yellow-500 text-white' :
                    dispute.status === 'under_review' ? 'bg-blue-500 text-white' :
                    dispute.status === 'resolved' ? 'bg-green-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>
                <p class={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <strong>Case Study:</strong> {dispute.caseStudyId}
                </p>
                <p class={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <strong>Reason:</strong> {dispute.reason}
                </p>
                <div class={`p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                  <p class="text-sm">
                    <strong>⚠️ Stake at Risk:</strong> {dispute.validatorStakeAtRisk} DBC
                  </p>
                </div>
                {dispute.resolution && (
                  <div class="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p class="text-sm"><strong>Resolution:</strong> {dispute.resolution}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============= Helper Components =============

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'red';
  isDark: boolean;
}

const StatCard: FunctionalComponent<StatCardProps> = ({ label, value, icon, color, isDark }) => {
  const colorClasses = {
    blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700',
    green: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700',
    yellow: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-700',
    orange: isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-700',
    purple: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-700',
    red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-700',
  };
  
  return (
    <div class={`p-4 rounded-xl ${colorClasses[color]}`}>
      <div class="text-2xl mb-2">{icon}</div>
      <div class="text-2xl font-black">{value}</div>
      <div class={`text-xs uppercase tracking-wider font-bold ${isDark ? 'opacity-75' : 'opacity-60'}`}>
        {label}
      </div>
    </div>
  );
};

// ============= Helper Functions =============

function calculateStreak(history: ValidationHistory[]): number {
  let streak = 0;
  for (const entry of history) {
    if (entry.consensus === 'agreed') {
      streak++;
    } else if (entry.consensus === 'disagreed') {
      break;
    }
  }
  return streak;
}

function calculateBestStreak(history: ValidationHistory[]): number {
  let bestStreak = 0;
  let currentStreak = 0;
  
  for (const entry of history) {
    if (entry.consensus === 'agreed') {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else if (entry.consensus === 'disagreed') {
      currentStreak = 0;
    }
  }
  
  return bestStreak;
}

function getNextTier(currentTier: ValidatorTier): ValidatorTier | null {
  const tiers: ValidatorTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

export default ValidatorReputationSystem;
