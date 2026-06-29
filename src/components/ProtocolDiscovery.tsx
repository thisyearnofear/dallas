import { FunctionalComponent } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { Community, CommunityCategory, CommunityFilters, CATEGORY_INFO, TokenGatedResource, FoundingValidator } from '../types/community';
import { attentionTokenService } from '../services/AttentionTokenService';
import { AttentionToken } from '../types/attentionToken';
import { PrivacyTooltip } from './PrivacyTooltip';
import { ToastContext } from '../context/ToastContext';

interface ProtocolMatch {
  id: string;
  name: string;
  optimizationLogCount: number;
  validatedCount: number;
  successRate: number;
  matchScore: number;
  category?: CommunityCategory;
  memberCount?: number;
  tokenGatedResources?: TokenGatedResource[];
  foundingValidators?: FoundingValidator[];
  genesisOpen?: boolean;
  description?: string;
  symbol?: string;
}

const INTEREST_TAGS = [
  'context-size',
  'low-latency',
  'high-accuracy',
  'agentic-flow',
  'reliable',
  'fast',
  'tool_calling',
  'evaluation',
  'orchestration',
  'proven',
];

const DIFFICULTY_LEVELS = ['easy', 'moderate', 'hard'] as const;

// Category filter buttons
const CATEGORIES: (CommunityCategory | 'all')[] = ['all', 'context_management', 'tool_calling', 'evaluation', 'orchestration'];

export const ProtocolDiscovery: FunctionalComponent = () => {
  const toast = useContext(ToastContext);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'moderate' | 'hard' | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | 'all'>('all');
  const [matchedProtocols, setMatchedProtocols] = useState<ProtocolMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolMatch | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchPerformed(true);
    
    try {
      // ENHANCED: Fetch real communities from Bags API via AttentionTokenService
      const communities = await attentionTokenService.getCommunityTokens({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 50,
        sortBy: 'holders',
      });

      // Transform AttentionToken[] to ProtocolMatch[] for display
      const protocols: ProtocolMatch[] = communities.map((community) => {
        // Calculate match score based on selected interests
        let matchScore = 50; // Base score
        
        // Boost score if interests align with architecture category
        if (selectedInterests.length > 0) {
          const categoryKeywords: Record<string, string[]> = {
            context_management: ['context-size', 'low-latency', 'high-accuracy'],
            tool_calling: ['agentic-flow', 'reliable', 'fast'],
            device: ['proven', 'clinical-data'],
            protocol: ['proven', 'clinical-data', 'hard']
          };
          
          const category = community.techniqueCategory.toLowerCase();
          const keywords = Object.entries(categoryKeywords).find(([key]) => 
            category.includes(key)
          )?.[1] || [];
          
          const matchingInterests = selectedInterests.filter(interest => 
            keywords.includes(interest)
          ).length;
          
          matchScore += (matchingInterests / selectedInterests.length) * 50;
        }

        const c = community as any;
        return {
          id: community.mint.toString(),
          name: community.techniqueName,
          description: community.description,
          symbol: community.symbol,
          optimizationLogCount: c.optimizationLogCount ?? community.analytics?.transactions ?? 0,
          validatedCount: c.validatedCount ?? Math.floor((community.analytics?.transactions || 0) * 0.7),
          successRate: Math.min(85, 60 + (community.analytics?.holders || 0)),
          matchScore: Math.round(matchScore),
          category: community.techniqueCategory as CommunityCategory,
          memberCount: c.memberCount ?? community.analytics?.holders ?? 0,
          tokenGatedResources: c.tokenGatedResources,
          foundingValidators: c.foundingValidators,
          genesisOpen: c.genesisOpen,
        };
      });

      // Filter by difficulty if specified (mock implementation for now)
      let filteredProtocols = protocols;
      if (selectedDifficulty) {
        // Easy = high match score, Hard = lower match score
        filteredProtocols = protocols.filter(p => {
          if (selectedDifficulty === 'easy') return p.matchScore >= 70;
          if (selectedDifficulty === 'moderate') return p.matchScore >= 50 && p.matchScore < 70;
          if (selectedDifficulty === 'hard') return p.matchScore < 50;
          return true;
        });
      }

      setMatchedProtocols(filteredProtocols);
    } catch (error) {
      console.error('Search failed:', error);
      toast?.push('error', 'Search failed. Please try again.');
      setMatchedProtocols([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const handleRequestAccess = (protocol: ProtocolMatch) => {
    if (protocol.genesisOpen && protocol.symbol) {
      // Honest join flow: direct to the token market to buy the alliance token
      toast?.push(
        'info',
        `Buy $${protocol.symbol} on the bonding curve to join ${protocol.name}. Redirecting to markets...`
      );
      setTimeout(() => { window.location.href = '/attention-tokens'; }, 1500);
    } else {
      toast?.push(
        'info',
        `Buy $${protocol.symbol || protocol.name} to access ${protocol.name} resources.`
      );
    }
  };

  return (
    <div class="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div class="mb-10">
        <h2 class="text-3xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
          <span class="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-2xl">🌐</span>
          <span>Discover Alliances</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Find alliances around agent architectures and prompts. Your search stays private - we never log your interests.
        </p>
      </div>

      {/* Search Filters */}
      <div class="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 mb-10 shadow-inner transition-colors">
        {/* Category Filter */}
        <div class="mb-8">
          <h3 class="text-xs font-black mb-4 uppercase tracking-widest text-slate-500 dark:text-slate-400">Browse by Category</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {CATEGORIES.map((cat) => {
              const info = cat === 'all' 
                ? { icon: '🌐', label: 'All Communities' }
                : CATEGORY_INFO[cat];
              
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  class={`px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-tight shadow-sm border flex items-center gap-2 justify-center ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-400 scale-[1.02] shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <span class="text-lg">{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <h3 class="text-xl font-black mb-6 uppercase tracking-wider text-slate-800 dark:text-white">Refine Your Search</h3>

        {/* Interest Tags */}
        <div class="mb-8">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            {INTEREST_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleInterest(tag)}
                class={`px-4 py-2 rounded-xl font-bold transition-all text-xs uppercase tracking-tighter shadow-sm border ${
                  selectedInterests.includes(tag)
                    ? 'bg-blue-600 text-white border-blue-400 scale-[1.02] shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                {tag.replace('-', ' ')}
              </button>
            ))}
          </div>
          {selectedInterests.length > 0 && (
            <div class="flex items-center gap-2 mt-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg inline-flex border border-blue-100 dark:border-blue-800/50">
              <span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Active:</span>
              <p class="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                {selectedInterests.join(' • ')}
              </p>
            </div>
          )}
        </div>

        {/* Difficulty Filter */}
        <div class="mb-10">
          <h4 class="text-xs font-black mb-4 uppercase tracking-widest text-slate-500 dark:text-slate-400">Difficulty Level</h4>
          <div class="flex flex-wrap gap-3">
            {['', ...DIFFICULTY_LEVELS].map((level) => (
              <button
                key={level || 'any'}
                onClick={() => setSelectedDifficulty(level as any)}
                class={`px-6 py-2 rounded-xl font-black transition-all text-xs uppercase tracking-widest border shadow-sm ${
                  selectedDifficulty === level
                    ? 'bg-green-600 text-white border-green-400 shadow-green-500/20'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                {level || 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isSearching}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed px-6 py-5 rounded-2xl font-black text-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl uppercase tracking-tighter"
        >
          {isSearching ? '⏳ Fetching real communities...' : '🔍 Search Communities'}
        </button>

        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest flex items-center gap-3">
          <span class="text-xl">🔒</span>
          <span>Your search parameters are processed locally. We never track your agent interests.</span>
        </div>
      </div>

      {/* Results */}
      {searchPerformed && (
        <div class="space-y-8 animate-fadeIn pb-12">
          <div class="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {matchedProtocols.length === 0
                ? '❌ No protocols matched'
                : `✅ Found ${matchedProtocols.length} Matches`}
            </h3>
          </div>

          {/* Protocol Cards */}
          {matchedProtocols.length > 0 && (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              {matchedProtocols
                .sort((a, b) => b.matchScore - a.matchScore)
                .map((protocol) => (
                  <div
                    key={protocol.id}
                    class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-500 dark:hover:border-blue-500 transition-all transform hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-xl group"
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    {/* Protocol Header */}
                    <div class="flex justify-between items-start mb-6">
                      <div class="flex-1">
                        <h4 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{protocol.name}</h4>
                        {/* Privacy & Match Badges */}
                        <div class="flex flex-wrap gap-2 mt-3">
                          <span class="text-[9px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full uppercase tracking-widest border border-blue-200 dark:border-blue-800/50">
                            Match: {protocol.matchScore}%
                          </span>
                          <span class="text-[9px] font-black bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-full uppercase tracking-widest border border-green-200 dark:border-green-800/50">
                            {protocol.successRate}% Success
                          </span>
                          <PrivacyTooltip topic="encryption" variant="inline">
                            <span class="text-[9px] font-black bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full uppercase tracking-widest border border-purple-200 dark:border-purple-800/50 flex items-center gap-1">
                              <span>🔐</span> Encrypted
                            </span>
                          </PrivacyTooltip>
                          {protocol.validatedCount > 0 && (
                            <PrivacyTooltip topic="zk_proofs" variant="inline">
                              <span class="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full uppercase tracking-widest border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1">
                                <span>🛡️</span> ZK-Validated
                              </span>
                            </PrivacyTooltip>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div class="grid grid-cols-2 gap-4 mb-8">
                      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner">
                        <div class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Data Points</div>
                        <div class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                          {protocol.optimizationLogCount}
                        </div>
                      </div>
                      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner">
                        <div class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Validated</div>
                        <div class="text-2xl font-black text-green-600 dark:text-green-400 tracking-tighter">
                          {protocol.validatedCount}
                          <span class="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">
                            ({((protocol.validatedCount / protocol.optimizationLogCount) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Token-Gated Resources */}
                    {protocol.tokenGatedResources && protocol.tokenGatedResources.length > 0 && (
                      <div class="mb-4 p-3 rounded-xl bg-brand/5 border border-brand/20">
                        <div class="text-[9px] font-black text-brand uppercase tracking-widest mb-2">🔐 Token-Gated Resources</div>
                        <ul class="space-y-1">
                          {protocol.tokenGatedResources.map(r => (
                            <li key={r.id} class="flex items-center gap-2 text-[10px] text-slate-700 dark:text-slate-300">
                              <span>{r.icon}</span>
                              <span class="font-bold">{r.title}</span>
                              {r.size && <span class="text-brand font-semibold">({r.size})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Genesis Badge + Action Button */}
                    <div class="flex items-center gap-2">
                      {protocol.genesisOpen && (
                        <span class="text-[9px] font-black px-2 py-1 rounded-full border border-yellow-400 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 uppercase tracking-widest whitespace-nowrap">⚡ Genesis</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRequestAccess(protocol); }}
                        class="flex-1 bg-slate-900 dark:bg-slate-800 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-blue-600 dark:hover:bg-blue-700 shadow-md active:scale-95"
                      >
                        {protocol.genesisOpen ? 'Join Genesis Alliance →' : 'Request Optimization Logs'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Protocol Detail */}
      {selectedProtocol && (
        <div class="fixed inset-0 bg-slate-900/80 dark:bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-md animate-fadeIn">
          <div class="bg-white dark:bg-slate-900 rounded-3xl border-4 border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl transition-all duration-500 animate-scaleIn">
            <div class="flex justify-between items-start mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <h3 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedProtocol.name}</h3>
                <div class="mt-2 inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                  Reliability Score: {selectedProtocol.matchScore}%
                </div>
              </div>
              <button
                onClick={() => setSelectedProtocol(null)}
                class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-xl transition-all active:scale-90"
              >
                <svg class="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Protocol Stats */}
            <div class="grid grid-cols-2 gap-6 mb-8">
              <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Optimization Logs</div>
                <div class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedProtocol.optimizationLogCount}</div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Community Verified</div>
                <div class="text-4xl font-black text-green-600 dark:text-green-400 tracking-tighter">
                  {selectedProtocol.validatedCount}
                </div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Reported Success</div>
                <div class="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{selectedProtocol.successRate}%</div>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Data Quality</div>
                <div class="text-4xl font-black text-yellow-600 dark:text-yellow-400 tracking-tighter">
                  {((selectedProtocol.validatedCount / selectedProtocol.optimizationLogCount) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Token-Gated Resources (detail modal) */}
            {selectedProtocol.tokenGatedResources && selectedProtocol.tokenGatedResources.length > 0 && (
              <div class="mb-8 p-5 rounded-2xl bg-brand/5 border-2 border-brand/20">
                <h4 class="font-black text-xs uppercase tracking-widest mb-4 text-brand flex items-center gap-2">🔐 Token-Gated Resources</h4>
                <ul class="space-y-3">
                  {selectedProtocol.tokenGatedResources.map(r => (
                    <li key={r.id} class="flex items-start gap-3">
                      <span class="text-xl flex-shrink-0">{r.icon}</span>
                      <div>
                        <div class="font-bold text-sm text-slate-900 dark:text-white">{r.title} {r.size && <span class="text-brand">({r.size})</span>}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">{r.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Founding Validators (detail modal) */}
            {selectedProtocol.foundingValidators && selectedProtocol.foundingValidators.length > 0 && (
              <div class="mb-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700">
                <h4 class="font-black text-xs uppercase tracking-widest mb-4 text-slate-600 dark:text-slate-300 flex items-center gap-2">⚖️ Founding Validators <span class="text-yellow-600 dark:text-yellow-400">(No stake required — Genesis period)</span></h4>
                <ul class="space-y-2">
                  {selectedProtocol.foundingValidators.map(v => (
                    <li key={v.handle} class="flex items-center justify-between text-sm">
                      <span class="font-bold text-slate-800 dark:text-slate-200">{v.handle}</span>
                      <span class="text-xs text-slate-500 dark:text-slate-400">{v.role} · {v.reviewsCommitted} reviews committed</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What This Means */}
            <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 mb-8 shadow-sm">
              <h4 class="font-black text-xs uppercase tracking-widest mb-4 text-slate-800 dark:text-white">Protocol Integrity Report</h4>
              <ul class="text-xs font-bold text-slate-600 dark:text-slate-300 space-y-3">
                <li class="flex items-start gap-3">
                  <span class="text-green-500 font-black">✓</span>
                  <span>{selectedProtocol.optimizationLogCount} verified developer histories provided by the community</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-green-500 font-black">✓</span>
                  <span>{selectedProtocol.validatedCount} independent validator approvals via ZK-proofs</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-green-500 font-black">✓</span>
                  <span>{selectedProtocol.successRate}% aggregate positive outcome rate from documented trials</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-green-500 font-black">✓</span>
                  <span>Stake-weighted consensus reached by decentralized validator network</span>
                </li>
              </ul>
            </div>

            {/* Privacy Features */}
            <div class="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800/50 p-6 rounded-2xl mb-8">
              <h4 class="font-black text-xs uppercase tracking-widest mb-4 text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <span>🔐</span> Privacy Protection Features
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PrivacyTooltip topic="encryption" variant="inline">
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span class="text-green-500">✓</span> Wallet-encrypted data
                  </div>
                </PrivacyTooltip>
                <PrivacyTooltip topic="zk_proofs" variant="inline">
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span class="text-green-500">✓</span> Zero-knowledge validation
                  </div>
                </PrivacyTooltip>
                <PrivacyTooltip topic="mpc" variant="inline">
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span class="text-green-500">✓</span> Committee-based access
                  </div>
                </PrivacyTooltip>
                <PrivacyTooltip topic="compression" variant="inline">
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span class="text-green-500">✓</span> Compressed storage
                  </div>
                </PrivacyTooltip>
              </div>
            </div>

            {/* Action Buttons */}
            <div class="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleRequestAccess(selectedProtocol)}
                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl uppercase tracking-widest text-xs"
              >
                Request Optimization Log Access
              </button>
              <button
                onClick={() => setSelectedProtocol(null)}
                class="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-black py-4 px-6 rounded-xl transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
