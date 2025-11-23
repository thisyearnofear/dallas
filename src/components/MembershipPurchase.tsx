import { useState } from 'preact/hooks';
import { SolanaTransfer } from './SolanaTransfer';
import { useWallet } from '../context/WalletContext';
import { SOLANA_CONFIG } from '../config/solana';

export function MembershipPurchase() {
  const { connected } = useWallet();
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
      <div class="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedTier(null)}
          class="mb-4 text-brand hover:underline"
        >
          ← Back to membership options
        </button>

        <div class="bg-gradient-to-br from-brand/20 to-brand/5 border-2 border-brand p-8 rounded-lg">
          <h2 class="text-4xl font-bold mb-4">{tier.name}</h2>
          <div class="text-4xl font-bold text-brand mb-6">{tier.price} SOL</div>

          <div class="mb-8">
            <h3 class="text-xl font-bold mb-4">Membership Benefits:</h3>
            <ul class="space-y-2">
              {tier.benefits.map((benefit) => (
                <li class="flex items-center text-lg">
                  <span class="text-brand mr-3">✓</span>
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
    <div class="grid md:grid-cols-3 gap-6">
      {Object.entries(tiers).map(([key, tier]) => (
        <div key={key} class="bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 p-6 rounded-lg hover:border-brand/40 transition-all hover:scale-105">
          <h3 class="text-2xl font-bold mb-2">{tier.name}</h3>
          <div class="text-3xl font-bold text-brand mb-4">{tier.price} SOL</div>

          <ul class="mb-6 space-y-2">
            {tier.benefits.map((benefit) => (
              <li class="text-sm text-gray-600">✓ {benefit}</li>
            ))}
          </ul>

          <button
            onClick={() => setSelectedTier(key as 'bronze' | 'silver' | 'gold')}
            disabled={!connected}
            class="w-full bg-brand hover:bg-brand-accent text-white font-bold py-2 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connected ? 'Select & Pay' : 'Connect Wallet to Purchase'}
          </button>
        </div>
      ))}
    </div>
  );
}
