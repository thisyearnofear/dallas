import { useState, useCallback } from 'preact/hooks';
import { useWallet } from '../context/WalletContext';
import { useMembership } from '../hooks/useMembership';
import { MembershipService, MembershipTier } from '../services/membership/MembershipService';
import { AnchorProvider } from '@coral-xyz/anchor';
import { SOLANA_CONFIG } from '../config/solana';
import { PublicKey } from '@solana/web3.js';

interface TierConfig {
  id: MembershipTier;
  name: string;
  price: number;
  benefits: string[];
  discount: number;
  color: string;
  icon: string;
}

const TIERS: TierConfig[] = [
  {
    id: 'bronze',
    name: 'Bronze Member',
    price: SOLANA_CONFIG.defaults.membershipBronze,
    benefits: [
      '5% discount on all products',
      'Member badge on profile',
      'Access to member-only case studies',
      'Priority validation queue',
    ],
    discount: 5,
    color: 'amber',
    icon: '🥉',
  },
  {
    id: 'silver',
    name: 'Silver Member',
    price: SOLANA_CONFIG.defaults.membershipSilver,
    benefits: [
      '10% discount on all products',
      'All Bronze benefits',
      'Early access to new protocols',
      'Enhanced privacy features',
    ],
    discount: 10,
    color: 'gray',
    icon: '🥈',
  },
  {
    id: 'gold',
    name: 'Gold Member',
    price: SOLANA_CONFIG.defaults.membershipGold,
    benefits: [
      '20% discount on all products',
      'All Silver benefits',
      'VIP community access',
      'Direct researcher connections',
    ],
    discount: 20,
    color: 'yellow',
    icon: '🥇',
  },
];

export function MembershipSystem() {
  const { publicKey, connection, signTransaction } = useWallet();
  const { membership, hasMembership, tier, refreshMembership, discountPercent } = useMembership();
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [step, setStep] = useState<'select' | 'profile' | 'payment' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile form
  const [profile, setProfile] = useState({
    nickname: membership?.nickname || '',
    healthFocus: membership?.healthFocus || '',
  });

  const handlePurchase = useCallback(async () => {
    if (!publicKey || !connection || !signTransaction || !selectedTier) return;

    setIsProcessing(true);
    setError(null);

    try {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction } as any, {
        commitment: 'confirmed',
      });

      const service = new MembershipService(connection, provider);
      
      await service.purchaseMembership(
        publicKey,
        selectedTier,
        profile.nickname || `Fighter ${publicKey.toString().slice(0, 6)}`,
        profile.healthFocus || undefined
      );

      await refreshMembership();
      setStep('success');
    } catch (err) {
      console.error('Purchase failed:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  }, [publicKey, connection, signTransaction, selectedTier, profile, refreshMembership]);

  // Show existing membership
  if (hasMembership && membership) {
    return (
      <div class="max-w-4xl mx-auto">
        {/* Member Card */}
        <div class="bg-gradient-to-br from-brand to-brand-accent text-white p-8 rounded-2xl shadow-2xl mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <div class="text-sm opacity-75 uppercase tracking-widest mb-1">Active Membership</div>
              <h2 class="text-3xl font-black">{membership.nickname}</h2>
            </div>
            <div class="text-6xl">
              {tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : '🥉'}
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white/10 p-4 rounded-xl">
              <div class="text-sm opacity-75">Tier</div>
              <div class="text-xl font-bold capitalize">{tier}</div>
            </div>
            <div class="bg-white/10 p-4 rounded-xl">
              <div class="text-sm opacity-75">Discount</div>
              <div class="text-xl font-bold">{discountPercent}%</div>
            </div>
            <div class="bg-white/10 p-4 rounded-xl">
              <div class="text-sm opacity-75">Member Since</div>
              <div class="text-xl font-bold">{membership.purchasedAt.toLocaleDateString()}</div>
            </div>
            <div class="bg-white/10 p-4 rounded-xl">
              <div class="text-sm opacity-75">Expires</div>
              <div class="text-xl font-bold">{membership.expiresAt.toLocaleDateString()}</div>
            </div>
          </div>

          {membership.healthFocus && (
            <div class="bg-white/10 p-4 rounded-xl">
              <div class="text-sm opacity-75 mb-1">Health Focus</div>
              <div class="font-medium">{membership.healthFocus}</div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 class="text-xl font-bold mb-6 text-slate-900 dark:text-white">Your Benefits</h3>
          <div class="grid md:grid-cols-2 gap-4">
            {TIERS.find(t => t.id === tier)?.benefits.map((benefit, idx) => (
              <div key={idx} class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span class="text-green-500 text-xl">✓</span>
                <span class="text-slate-700 dark:text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Purchase flow
  return (
    <div class="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div class="flex items-center justify-center gap-4 mb-8">
        {['select', 'profile', 'payment', 'success'].map((s, idx) => (
          <div key={s} class="flex items-center">
            <div class={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold
              ${step === s ? 'bg-brand text-white' : 
                ['select', 'profile', 'payment', 'success'].indexOf(step) > idx ? 'bg-green-500 text-white' : 
                'bg-slate-200 dark:bg-slate-700 text-slate-500'}
            `}>
              {['select', 'profile', 'payment', 'success'].indexOf(step) > idx ? '✓' : idx + 1}
            </div>
            {idx < 3 && (
              <div class={`
                w-16 h-1 mx-2
                ${['select', 'profile', 'payment', 'success'].indexOf(step) > idx ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Step: Select Tier */}
      {step === 'select' && (
        <div>
          <h2 class="text-3xl font-black text-center mb-2 text-slate-900 dark:text-white">Choose Your Tier</h2>
          <p class="text-center text-slate-600 dark:text-slate-400 mb-8">
            Join the club. Support the mission. Get exclusive benefits.
          </p>

          <div class="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                class={`
                  p-6 rounded-2xl border-2 cursor-pointer transition-all
                  ${selectedTier === tier.id 
                    ? 'border-brand bg-brand/5 shadow-lg scale-105' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand/50'}
                `}
              >
                <div class="text-4xl mb-4">{tier.icon}</div>
                <h3 class="text-xl font-black mb-2 text-slate-900 dark:text-white">{tier.name}</h3>
                <div class="text-3xl font-black text-brand mb-4">{tier.price} SOL</div>
                <div class="text-sm text-slate-500 dark:text-slate-400 mb-4">{tier.discount}% discount on products</div>
                <ul class="space-y-2">
                  {tier.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span class="text-green-500">✓</span> {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div class="mt-8 text-center">
            <button
              onClick={() => selectedTier && setStep('profile')}
              disabled={!selectedTier}
              class="bg-brand hover:bg-brand-accent text-white font-black py-4 px-12 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step: Profile */}
      {step === 'profile' && (
        <div class="max-w-xl mx-auto">
          <h2 class="text-3xl font-black mb-2 text-slate-900 dark:text-white">Create Your Profile</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-8">
            Choose how you want to be known in our community.
          </p>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Fighter Nickname *
              </label>
              <input
                type="text"
                value={profile.nickname}
                onInput={(e) => setProfile({ ...profile, nickname: (e.target as HTMLInputElement).value })}
                placeholder="e.g., Hope Fighter, Patient #420"
                class="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand outline-none dark:bg-slate-800 dark:text-white"
                maxLength={32}
              />
              <div class="text-xs text-slate-500 mt-1">{profile.nickname.length}/32 characters</div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Health Focus (Optional)
              </label>
              <select
                value={profile.healthFocus}
                onChange={(e) => setProfile({ ...profile, healthFocus: (e.target as HTMLSelectElement).value })}
                class="w-full p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand outline-none dark:bg-slate-800 dark:text-white"
              >
                <option value="">Select your focus area</option>
                <option value="Immune Support">Immune Support</option>
                <option value="Chronic Pain">Chronic Pain</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Energy & Vitality">Energy & Vitality</option>
                <option value="Sleep">Sleep</option>
                <option value="General Wellness">General Wellness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <p class="text-sm text-green-800 dark:text-green-300">
                🔒 <strong>Privacy:</strong> Your profile is stored encrypted. Only you control your data.
              </p>
            </div>
          </div>

          <div class="mt-8 flex gap-4">
            <button
              onClick={() => setStep('select')}
              class="flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep('payment')}
              disabled={profile.nickname.length < 3}
              class="flex-1 bg-brand hover:bg-brand-accent text-white font-black py-4 rounded-xl transition-all disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && selectedTier && (
        <div class="max-w-xl mx-auto">
          <h2 class="text-3xl font-black mb-2 text-slate-900 dark:text-white">Complete Purchase</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-8">
            Review your membership details and confirm payment.
          </p>

          <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-slate-600 dark:text-slate-400">Membership</span>
              <span class="font-bold text-slate-900 dark:text-white">{TIERS.find(t => t.id === selectedTier)?.name}</span>
            </div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-slate-600 dark:text-slate-400">Nickname</span>
              <span class="font-bold text-slate-900 dark:text-white">{profile.nickname}</span>
            </div>
            {profile.healthFocus && (
              <div class="flex items-center justify-between mb-4">
                <span class="text-slate-600 dark:text-slate-400">Health Focus</span>
                <span class="font-bold text-slate-900 dark:text-white">{profile.healthFocus}</span>
              </div>
            )}
            <div class="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
              <span class="text-lg font-bold text-slate-900 dark:text-white">Total</span>
              <span class="text-2xl font-black text-brand">{TIERS.find(t => t.id === selectedTier)?.price} SOL</span>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-6">
            <p class="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ <strong>Important:</strong> Membership lasts 1 year. You'll be able to renew before expiration.
            </p>
          </div>

          <div class="flex gap-4">
            <button
              onClick={() => setStep('profile')}
              disabled={isProcessing}
              class="flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              class="flex-1 bg-brand hover:bg-brand-accent text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>Confirm Purchase</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div class="text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-3xl font-black mb-4 text-slate-900 dark:text-white">Welcome to the Club!</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            You're now a {TIERS.find(t => t.id === selectedTier)?.name}. Your membership NFT has been minted to your wallet.
          </p>

          <div class="bg-gradient-to-br from-brand to-brand-accent text-white p-8 rounded-2xl max-w-md mx-auto mb-8">
            <div class="text-4xl mb-4">{TIERS.find(t => t.id === selectedTier)?.icon}</div>
            <h3 class="text-xl font-bold mb-2">{profile.nickname}</h3>
            <p class="opacity-75">{TIERS.find(t => t.id === selectedTier)?.name}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/experiences"
              class="bg-brand hover:bg-brand-accent text-white font-bold py-4 px-8 rounded-xl transition-all"
            >
              Explore Communities
            </a>
            <a
              href="/products"
              class="border-2 border-brand text-brand hover:bg-brand/5 font-bold py-4 px-8 rounded-xl transition-all"
            >
              Browse Products
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
