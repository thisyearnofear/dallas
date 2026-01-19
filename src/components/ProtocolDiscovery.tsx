import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { PrivacyCoordinationAgent } from '../agents/PrivacyCoordinationAgent';

interface ProtocolMatch {
  id: string;
  name: string;
  caseStudyCount: number;
  validatedCount: number;
  successRate: number;
  matchScore: number;
}

const INTEREST_TAGS = [
  'immune-support',
  'energy-boost',
  'pain-relief',
  'mental-health',
  'sleep',
  'natural',
  'clinical-data',
  'proven',
  'easy',
  'lifestyle',
];

const DIFFICULTY_LEVELS = ['easy', 'moderate', 'hard'] as const;

export const ProtocolDiscovery: FunctionalComponent = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'moderate' | 'hard' | ''>('');
  const [matchedProtocols, setMatchedProtocols] = useState<ProtocolMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolMatch | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const agent = new PrivacyCoordinationAgent();

  const handleSearch = async () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest');
      return;
    }

    setIsSearching(true);
    setSearchPerformed(true);
    try {
      const result = await agent.matchUserToProtocols({
        treatmentInterests: selectedInterests,
        difficulty: selectedDifficulty as 'easy' | 'moderate' | 'hard' | undefined,
      });

      if (result.modifications?.matchedProtocols) {
        setMatchedProtocols(result.modifications.matchedProtocols);
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('❌ Search failed');
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
    alert(
      `Request sent to protocol creator.\n\nYou'll be notified when ${protocol.name} owner grants access to see the full case studies.`
    );
  };

  return (
    <div class="w-full bg-gray-900 text-white">
      {/* Header */}
      <div class="mb-8">
        <h2 class="text-3xl font-bold mb-2">🔍 Discover Health Protocols</h2>
        <p class="text-gray-300">
          Find what others have tried. Your search stays private - we never log your interests.
        </p>
      </div>

      {/* Search Filters */}
      <div class="bg-gray-800 p-8 rounded-lg border border-gray-700 mb-8">
        <h3 class="text-xl font-bold mb-4">What are you interested in?</h3>

        {/* Interest Tags */}
        <div class="mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {INTEREST_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleInterest(tag)}
                class={`px-4 py-2 rounded font-semibold transition text-sm ${
                  selectedInterests.includes(tag)
                    ? 'bg-blue-600 text-white border border-blue-400'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedInterests.length > 0 && (
            <p class="text-sm text-gray-400">
              Selected: {selectedInterests.join(', ')}
            </p>
          )}
        </div>

        {/* Difficulty Filter */}
        <div class="mb-6">
          <h4 class="text-sm font-bold mb-3 text-gray-300">Difficulty Level (optional)</h4>
          <div class="flex gap-3">
            {['', ...DIFFICULTY_LEVELS].map((level) => (
              <button
                key={level || 'any'}
                onClick={() => setSelectedDifficulty(level as any)}
                class={`px-4 py-2 rounded font-semibold transition text-sm ${
                  selectedDifficulty === level
                    ? 'bg-green-600 text-white border border-green-400'
                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
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
          disabled={isSearching || selectedInterests.length === 0}
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-4 rounded font-bold text-lg transition"
        >
          {isSearching ? '⏳ Searching privately...' : '🔍 Search Protocols'}
        </button>

        <div class="mt-4 p-4 bg-blue-900/20 border border-blue-600 rounded text-sm text-gray-300">
          🔒 Your search parameters are processed locally. We never track what you search for.
        </div>
      </div>

      {/* Results */}
      {searchPerformed && (
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold">
              {matchedProtocols.length === 0
                ? '❌ No protocols matched'
                : `✅ Found ${matchedProtocols.length} Protocol${matchedProtocols.length !== 1 ? 's' : ''}`}
            </h3>
          </div>

          {/* Protocol Cards */}
          {matchedProtocols.length > 0 && (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchedProtocols
                .sort((a, b) => b.matchScore - a.matchScore)
                .map((protocol) => (
                  <div
                    key={protocol.id}
                    class="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer"
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    {/* Protocol Header */}
                    <div class="flex justify-between items-start mb-4">
                      <div class="flex-1">
                        <h4 class="text-xl font-bold text-blue-400 mb-2">{protocol.name}</h4>
                        <div class="flex gap-2 mb-3">
                          <span class="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded">
                            Match: {protocol.matchScore}%
                          </span>
                          <span class="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded">
                            {protocol.successRate}% success
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div class="bg-gray-700/50 p-3 rounded">
                        <div class="text-gray-400 text-xs">Total Case Studies</div>
                        <div class="text-lg font-bold text-white">
                          {protocol.caseStudyCount}
                        </div>
                      </div>
                      <div class="bg-gray-700/50 p-3 rounded">
                        <div class="text-gray-400 text-xs">Validated by Community</div>
                        <div class="text-lg font-bold text-green-400">
                          {protocol.validatedCount}
                          <span class="text-xs text-gray-400 ml-1">
                            ({((protocol.validatedCount / protocol.caseStudyCount) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleRequestAccess(protocol)}
                      class="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold text-sm transition"
                    >
                      📖 Request Access to Case Studies
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Protocol Detail */}
      {selectedProtocol && (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-gray-900 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-3xl font-bold text-blue-400 mb-2">{selectedProtocol.name}</h3>
                <p class="text-gray-400">Match Score: {selectedProtocol.matchScore}%</p>
              </div>
              <button
                onClick={() => setSelectedProtocol(null)}
                class="text-2xl text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Protocol Stats */}
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-gray-800 p-4 rounded border border-gray-700">
                <div class="text-gray-400 text-sm mb-1">Total Case Studies</div>
                <div class="text-3xl font-bold">{selectedProtocol.caseStudyCount}</div>
              </div>
              <div class="bg-gray-800 p-4 rounded border border-gray-700">
                <div class="text-gray-400 text-sm mb-1">Community Validated</div>
                <div class="text-3xl font-bold text-green-400">
                  {selectedProtocol.validatedCount}
                </div>
              </div>
              <div class="bg-gray-800 p-4 rounded border border-gray-700">
                <div class="text-gray-400 text-sm mb-1">Success Rate</div>
                <div class="text-3xl font-bold text-blue-400">{selectedProtocol.successRate}%</div>
              </div>
              <div class="bg-gray-800 p-4 rounded border border-gray-700">
                <div class="text-gray-400 text-sm mb-1">Validation Quality</div>
                <div class="text-3xl font-bold text-yellow-400">
                  {((selectedProtocol.validatedCount / selectedProtocol.caseStudyCount) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* What This Means */}
            <div class="bg-gray-800/50 p-4 rounded border border-gray-700 mb-6">
              <h4 class="font-bold mb-2">What This Means</h4>
              <ul class="text-sm text-gray-300 space-y-2">
                <li>
                  ✓ {selectedProtocol.caseStudyCount} people have tried this and shared their
                  experience
                </li>
                <li>
                  ✓ {selectedProtocol.validatedCount} of these experiences have been verified by
                  the community
                </li>
                <li>
                  ✓ {selectedProtocol.successRate}% reported positive outcomes
                </li>
                <li>✓ Community validators confirm data quality and consistency</li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div class="bg-blue-900/20 border border-blue-600 p-4 rounded mb-6 text-sm">
              🔒 <strong>Your Privacy:</strong> When you request access to case studies, the
              protocol owner will be notified. You can choose to share additional details about
              your situation, or request anonymously.
            </div>

            {/* Action Buttons */}
            <div class="flex gap-3">
              <button
                onClick={() => handleRequestAccess(selectedProtocol)}
                class="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-bold transition"
              >
                ✓ Request Access to Case Studies
              </button>
              <button
                onClick={() => setSelectedProtocol(null)}
                class="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
