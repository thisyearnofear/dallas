import { FunctionalComponent } from 'preact';

export const PrivacySponsorShowcase: FunctionalComponent = () => {
  return (
    <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span class="text-2xl">🎯</span>
        Privacy Sponsor Integrations
      </h3>
      <p class="text-gray-300 mb-4">
        Dallas Buyers Club leverages cutting-edge privacy technologies from leading sponsors:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Light Protocol */}
        <div class="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
          <h4 class="font-bold text-green-300 mb-2">🟢 Light Protocol</h4>
          <p class="text-sm text-gray-300 mb-3">
            ZK compression for scalable private case study storage with 2-100x compression ratios.
          </p>
          <div class="text-xs text-gray-400">
            <p><strong>Features:</strong></p>
            <ul class="list-disc list-inside ml-2">
              <li>Compressed NFTs for treatment metadata</li>
              <li>Proof-of-validation with ZK compression</li>
              <li>Scalable private state management</li>
            </ul>
          </div>
        </div>

        {/* Noir/Aztec */}
        <div class="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <h4 class="font-bold text-blue-300 mb-2">🔵 Noir/Aztec</h4>
          <p class="text-sm text-gray-300 mb-3">
            ZK-SNARK circuits for validation proofs without decryption.
          </p>
          <div class="text-xs text-gray-400">
            <p><strong>Features:</strong></p>
            <ul class="list-disc list-inside ml-2">
              <li>Data integrity proofs</li>
              <li>Circuit-specific validation</li>
              <li>On-chain verification</li>
            </ul>
          </div>
        </div>

        {/* Arcium */}
        <div class="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <h4 class="font-bold text-yellow-300 mb-2">🟡 Arcium MPC</h4>
          <p class="text-sm text-gray-300 mb-3">
            Threshold cryptography for validator committee decryption.
          </p>
          <div class="text-xs text-gray-400">
            <p><strong>Features:</strong></p>
            <ul class="list-disc list-inside ml-2">
              <li>K-of-N access control</li>
              <li>End-to-end encrypted state</li>
              <li>MPC session management</li>
            </ul>
          </div>
        </div>

        {/* Privacy Cash */}
        <div class="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <h4 class="font-bold text-purple-300 mb-2">🟣 Privacy Cash</h4>
          <p class="text-sm text-gray-300 mb-3">
            Confidential token transfers for rewards and staking.
          </p>
          <div class="text-xs text-gray-400">
            <p><strong>Features:</strong></p>
            <ul class="list-disc list-inside ml-2">
              <li>Shielded EXPERIENCE distributions</li>
              <li>Private validator rewards</li>
              <li>Confidential staking amounts</li>
            </ul>
          </div>
        </div>

        {/* ShadowWire */}
        <div class="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
          <h4 class="font-bold text-indigo-300 mb-2">🟤 ShadowWire</h4>
          <p class="text-sm text-gray-300 mb-3">
            Private payment flows for treatment procurement.
          </p>
          <div class="text-xs text-gray-400">
            <p><strong>Features:</strong></p>
            <ul class="list-disc list-inside ml-2">
              <li>Shielded USD1 stablecoin transfers</li>
              <li>Private payment rails</li>
              <li>Bulletproofs integration</li>
            </ul>
          </div>
        </div>

        {/* Helius */}
        <div class="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
          <h4 class="font-bold text-orange-300 mb-2">🟠 Helius</h4>
          <p class="text-sm text-gray-300 mb-3">
            RPC infrastructure for agent coordination.
          </p>
          <div class="text-xs text-gray-400">
            <p><strong>Features:</strong></p>
            <ul class="list-disc list-inside ml-2">
              <li>High-performance node access</li>
              <li>Real-time event indexing</li>
              <li>Webhook integration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prize Pool Info */}
      <div class="mt-6 p-4 bg-gray-800/50 border border-gray-600 rounded-lg text-center">
        <p class="font-bold text-white">
          🏆 Targeting $86,000+ in Privacy Hackathon Sponsor Bounties
        </p>
        <p class="text-sm text-gray-400 mt-2">
          Across 8+ sponsor categories including Light Protocol, Privacy Cash, Arcium, Aztec/Noir, ShadowWire, and more.
        </p>
      </div>
    </div>
  );
};