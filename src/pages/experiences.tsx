import { useState } from 'preact/hooks';
import { EncryptedCaseStudyForm } from '../components/EncryptedCaseStudyForm';
import { ProtocolDiscovery } from '../components/ProtocolDiscovery';

type Tab = 'discover' | 'share';

export function Experiences() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');

  return (
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div class="bg-gradient-to-r from-blue-100/50 via-green-100/50 to-purple-100/50 dark:from-blue-900/20 dark:via-green-900/20 dark:to-purple-900/20 border-b border-gray-300 dark:border-gray-700 p-8 mb-12">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 dark:from-blue-400 dark:via-green-400 dark:to-purple-400 bg-clip-text text-transparent">
            Health Sovereignty Platform
          </h1>
          <p class="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Share your health journey privately. Discover what works. Support others. All encrypted, all on-chain.
          </p>
          <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-800 dark:text-gray-200">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🔐</span>
              <span>End-to-end encrypted</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">👥</span>
              <span>Community validated</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">⛓️</span>
              <span>Blockchain permanent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div class="max-w-4xl mx-auto mb-8">
        <div class="flex gap-2 border-b border-gray-300 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('discover')}
            class={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'discover'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            🔍 Discover Protocols
          </button>
          <button
            onClick={() => setActiveTab('share')}
            class={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'share'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            📋 Share Your Experience
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div class="max-w-4xl mx-auto px-4 pb-12">
        {activeTab === 'discover' && <ProtocolDiscovery />}
        {activeTab === 'share' && <EncryptedCaseStudyForm />}
      </div>

      {/* Information Section */}
      <div class="bg-gray-200/50 dark:bg-gray-800/30 border-t border-gray-300 dark:border-gray-700 mt-16 py-12">
        <div class="max-w-4xl mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Privacy */}
            <div class="text-center">
              <div class="text-4xl mb-4">🔒</div>
              <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Your Data, Your Control</h3>
              <p class="text-gray-700 dark:text-gray-400">
                Health metrics are encrypted with your wallet key. Only you can decrypt them. We
                never see your unencrypted data.
              </p>
            </div>

            {/* Community */}
            <div class="text-center">
              <div class="text-4xl mb-4">👥</div>
              <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Community Validated</h3>
              <p class="text-gray-700 dark:text-gray-400">
                Community validators stake tokens to review case studies. False claims get caught.
                Accuracy is rewarded.
              </p>
            </div>

            {/* Decentralized */}
            <div class="text-center">
              <div class="text-4xl mb-4">⛓️</div>
              <h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white">Permanently Recorded</h3>
              <p class="text-gray-700 dark:text-gray-400">
                Your health journey lives on Solana blockchain. Immutable, transparent, globally
                accessible.
              </p>
            </div>
          </div>

          {/* DBC Reference */}
          <div class="mt-12 p-8 bg-gradient-to-r from-amber-100/50 via-red-100/50 to-amber-100/50 dark:from-amber-900/10 dark:via-red-900/10 dark:to-amber-900/10 border border-amber-500/50 dark:border-amber-600/30 rounded-lg">
            <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <span>🕋</span> The Dallas Buyers Club Legacy
            </h3>
            <p class="text-gray-800 dark:text-gray-300 mb-4">
              In 1985, Ron Woodroof was diagnosed with AIDS and given 30 days to live. He didn't accept
              that verdict. He built an underground network to access experimental treatments the system
              blocked. He saved hundreds of lives.
            </p>
            <p class="text-gray-800 dark:text-gray-300 mb-4">
              In 2026, the barriers aren't legal—they're informational. The system still profits from your
              dependence. We're rebuilding Ron's vision for the age of privacy technology.
            </p>
            <p class="text-gray-900 dark:text-gray-300 font-bold text-lg">
              Health autonomy starts with information sovereignty. Information sovereignty starts with you.
            </p>
          </div>

          {/* Disclaimer */}
          <div class="mt-8 p-6 bg-red-100/80 dark:bg-red-900/20 border border-red-500 dark:border-red-600 rounded-lg">
            <h4 class="font-bold text-red-700 dark:text-red-300 mb-2">⚠️ Important Disclaimer</h4>
            <p class="text-sm text-gray-800 dark:text-gray-300">
              This platform is for sharing personal experiences with experimental treatments, not medical
              advice. Case studies are not scientific proof. Always consult healthcare professionals before
              making medical decisions. Outcomes vary by individual. Some treatments may be unsafe or
              ineffective.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
