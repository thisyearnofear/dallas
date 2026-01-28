import { FunctionalComponent } from 'preact';

export const PrivacySponsorShowcase: FunctionalComponent = () => {
  return (
    <div class="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-8 mb-10 shadow-sm transition-colors duration-300">
      <h3 class="text-2xl font-black mb-4 flex items-center gap-3 uppercase tracking-tighter text-slate-900 dark:text-white">
        <span class="bg-brand/10 p-2 rounded-lg text-2xl">🎯</span>
        Privacy Sponsor Integrations
      </h3>
      <p class="text-slate-600 dark:text-slate-300 mb-8 font-medium leading-relaxed">
        Dallas Buyers Club leverages cutting-edge privacy technologies from leading ecosystem sponsors:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Light Protocol */}
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl p-6 transition-all hover:scale-[1.02] shadow-sm">
          <h4 class="font-black text-green-700 dark:text-green-400 mb-3 uppercase tracking-widest text-sm flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            Light Protocol
          </h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium leading-tight">
            ZK compression for scalable private case study storage with 2-100x compression ratios.
          </p>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 border-t border-green-200/50 dark:border-green-800/50 pt-3">
            <p class="font-black uppercase tracking-widest mb-2 opacity-70">Key Features:</p>
            <ul class="space-y-1.5 font-bold">
              <li class="flex items-start gap-2"><span>•</span> <span>Compressed NFTs for treatment metadata</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Proof-of-validation with ZK compression</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Scalable private state management</span></li>
            </ul>
          </div>
        </div>

        {/* Noir/Aztec */}
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-6 transition-all hover:scale-[1.02] shadow-sm">
          <h4 class="font-black text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-widest text-sm flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            Noir / Aztec
          </h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium leading-tight">
            ZK-SNARK circuits for validation proofs without decryption.
          </p>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 border-t border-blue-200/50 dark:border-blue-800/50 pt-3">
            <p class="font-black uppercase tracking-widest mb-2 opacity-70">Key Features:</p>
            <ul class="space-y-1.5 font-bold">
              <li class="flex items-start gap-2"><span>•</span> <span>Data integrity proofs</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Circuit-specific validation</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>On-chain verification</span></li>
            </ul>
          </div>
        </div>

        {/* Arcium */}
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-6 transition-all hover:scale-[1.02] shadow-sm">
          <h4 class="font-black text-yellow-700 dark:text-yellow-400 mb-3 uppercase tracking-widest text-sm flex items-center gap-2">
            <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Arcium MPC
          </h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium leading-tight">
            Threshold cryptography for validator committee decryption.
          </p>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 border-t border-yellow-200/50 dark:border-yellow-800/50 pt-3">
            <p class="font-black uppercase tracking-widest mb-2 opacity-70">Key Features:</p>
            <ul class="space-y-1.5 font-bold">
              <li class="flex items-start gap-2"><span>•</span> <span>K-of-N access control</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>End-to-end encrypted state</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>MPC session management</span></li>
            </ul>
          </div>
        </div>

        {/* Privacy Cash */}
        <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl p-6 transition-all hover:scale-[1.02] shadow-sm">
          <h4 class="font-black text-purple-700 dark:text-purple-400 mb-3 uppercase tracking-widest text-sm flex items-center gap-2">
            <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
            Privacy Cash
          </h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium leading-tight">
            Confidential token transfers for rewards and staking.
          </p>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 border-t border-purple-200/50 dark:border-purple-800/50 pt-3">
            <p class="font-black uppercase tracking-widest mb-2 opacity-70">Key Features:</p>
            <ul class="space-y-1.5 font-bold">
              <li class="flex items-start gap-2"><span>•</span> <span>Shielded EXPERIENCE distributions</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Private validator rewards</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Confidential staking amounts</span></li>
            </ul>
          </div>
        </div>

        {/* ShadowWire */}
        <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-xl p-6 transition-all hover:scale-[1.02] shadow-sm">
          <h4 class="font-black text-indigo-700 dark:text-indigo-300 mb-3 uppercase tracking-widest text-sm flex items-center gap-2">
            <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
            ShadowWire
          </h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium leading-tight">
            Private payment flows for treatment procurement.
          </p>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 border-t border-indigo-200/50 dark:border-indigo-800/50 pt-3">
            <p class="font-black uppercase tracking-widest mb-2 opacity-70">Key Features:</p>
            <ul class="space-y-1.5 font-bold">
              <li class="flex items-start gap-2"><span>•</span> <span>Shielded USD1 stablecoin transfers</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Private payment rails</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Bulletproofs integration</span></li>
            </ul>
          </div>
        </div>

        {/* Helius */}
        <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50 rounded-xl p-6 transition-all hover:scale-[1.02] shadow-sm">
          <h4 class="font-black text-orange-700 dark:text-orange-300 mb-3 uppercase tracking-widest text-sm flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
            Helius RPC
          </h4>
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium leading-tight">
            High-performance RPC infrastructure for agent coordination.
          </p>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 border-t border-orange-200/50 dark:border-orange-800/50 pt-3">
            <p class="font-black uppercase tracking-widest mb-2 opacity-70">Key Features:</p>
            <ul class="space-y-1.5 font-bold">
              <li class="flex items-start gap-2"><span>•</span> <span>High-performance node access</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Real-time event indexing</span></li>
              <li class="flex items-start gap-2"><span>•</span> <span>Webhook integration</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prize Pool Info */}
      <div class="mt-10 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-inner">
        <p class="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">
          🏆 Targeting $86,000+ in Privacy Hackathon Bounties
        </p>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">
          Spanning 8+ categories: Light Protocol, Privacy Cash, Arcium, Aztec/Noir, ShadowWire, and more.
        </p>
      </div>
    </div>
  );
};