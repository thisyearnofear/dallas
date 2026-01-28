import { useState } from 'preact/hooks';
import { SolanaTransfer } from './SolanaTransfer';
import { useWallet, TIER_STYLES } from '../context/WalletContext';
import { SOLANA_CONFIG } from '../config/solana';

export function MembershipPurchase() {
  const { connected, experienceBalance, reputationTier } = useWallet();
  const [selectedTier, setSelectedTier] = useState<'bronze' | 'silver' | 'gold' | null>(null);

  const tiers = {
    bronze: {
      name: 'Bronze Member',
      price: SOLANA_CONFIG.defaults.membershipBronze,
      benefits: ['Access to forum', 'Monthly newsletter', 'Product discounts'],
    },
    silver: {
      name: 'Silver Member',
      price: SOLANA_CONFIG.defaults.membershipSilver,
      benefits: ['All Bronze benefits', 'Priority support', 'Early access to new products'],
    },
    gold: {
      name: 'Gold Member',
      price: SOLANA_CONFIG.defaults.membershipGold,
      benefits: ['All Silver benefits', 'VIP access to exclusive products', 'Special advisory board'],
    },
  };

  if (selectedTier) {
    const tier = tiers[selectedTier];
    return (
      <div class="max-w-2xl mx-auto animate-fadeIn">
        <button
          onClick={() => setSelectedTier(null)}
          class="mb-6 text-brand hover:underline font-bold flex items-center gap-2 group transition-all"
        >
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to membership options</span>
        </button>

        <div class="bg-white dark:bg-slate-900 border-2 border-brand p-8 rounded-2xl shadow-2xl transition-colors">
          <h2 class="text-4xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tighter">{tier.name}</h2>
          <div class="text-4xl font-black text-brand mb-8 tracking-tight">{tier.price} SOL</div>

          <div class="mb-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
            <h3 class="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200 uppercase tracking-widest text-sm">Membership Benefits:</h3>
            <ul class="space-y-3">
              {tier.benefits.map((benefit) => (
                <li class="flex items-center text-lg text-slate-700 dark:text-slate-300 font-medium">
                  <span class="text-brand mr-3 bg-brand/10 p-1 rounded-full text-xs">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <SolanaTransfer
            amount={tier.price}
            label={`Purchase ${tier.name}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div class="space-y-10">
      {connected && (
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm transition-colors relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h3 class="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <span>🛡️</span>
            <span>Member Status</span>
          </h3>
          <div class="flex flex-wrap gap-10 items-center relative z-10">
            <div>
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">EXPERIENCE Balance</span>
              <div class="text-3xl font-black text-brand tracking-tight">{experienceBalance.toLocaleString()} XP</div>
            </div>
            {reputationTier && (
              <div>
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Reputation Tier</span>
                <div class="mt-1">
                  <span class={`inline-block px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${TIER_STYLES[reputationTier]}`}>
                    {reputationTier}
                  </span>
                </div>
              </div>
            )}
          </div>
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center gap-2">
            <span class="text-brand">💡</span>
            <span>Your EXPERIENCE tokens earn you discounts on membership renewals</span>
          </p>
        </div>
      )}

      <div class="grid md:grid-cols-3 gap-8">
      {Object.entries(tiers).map(([key, tier]) => (
        <div key={key} class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:border-brand/50 transition-all hover:scale-[1.03] hover:shadow-xl group flex flex-col">
          <h3 class="text-2xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-brand transition-colors">{tier.name}</h3>
          <div class="text-3xl font-black text-brand mb-6 tracking-tight">{tier.price} SOL</div>

          <ul class="mb-8 space-y-3 flex-grow">
            {tier.benefits.map((benefit) => (
              <li class="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <span class="text-brand">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setSelectedTier(key as 'bronze' | 'silver' | 'gold')}
            disabled={!connected}
            class="w-full bg-brand hover:bg-brand-accent text-white font-black py-4 px-6 rounded-xl transition-all shadow-lg transform active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none uppercase tracking-widest text-xs"
          >
            {connected ? 'Select & Pay' : 'Connect Wallet'}
          </button>
        </div>
      ))}
      </div>
    </div>
  );
}
