import { useState, useEffect, useCallback } from 'preact/hooks';
import { useWallet } from '../context/WalletContext';
import { MembershipService, MembershipData, MembershipTier } from '../services/membership/MembershipService';
import { AnchorProvider } from '@coral-xyz/anchor';

export interface UseMembershipReturn {
  membership: MembershipData | null;
  isLoading: boolean;
  error: string | null;
  hasMembership: boolean;
  tier: MembershipTier | null;
  discountPercent: number;
  refreshMembership: () => Promise<void>;
  isGateOpen: (requiredTier?: MembershipTier) => boolean;
}

export function useMembership(): UseMembershipReturn {
  const { publicKey, connection, signTransaction } = useWallet();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = useCallback(async () => {
    if (!publicKey || !connection) {
      setMembership(null);
      return;
    }

    // Skip if signTransaction is not available (read-only mode not supported by AnchorProvider)
    if (!signTransaction) {
      setMembership(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a minimal provider for read-only operations
      // Need to provide a valid signer interface
      const mockWallet = {
        publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };
      
      const provider = new AnchorProvider(
        connection,
        mockWallet as any,
        { commitment: 'confirmed' }
      );

      const service = new MembershipService(connection, provider);
      const data = await service.getMembership(publicKey);
      setMembership(data);
    } catch (err) {
      console.error('Error fetching membership:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch membership');
      setMembership(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, signTransaction]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  // Check if user has required tier (or any tier if not specified)
  const isGateOpen = useCallback((requiredTier?: MembershipTier): boolean => {
    if (!membership || !membership.isActive) return false;
    
    if (!requiredTier) return true;
    
    const tierLevels: Record<MembershipTier, number> = {
      bronze: 1,
      silver: 2,
      gold: 3,
    };
    
    return tierLevels[membership.tier] >= tierLevels[requiredTier];
  }, [membership]);

  // Calculate discount based on tier
  const discountPercent = (() => {
    if (!membership) return 0;
    switch (membership.tier) {
      case 'bronze': return 5;
      case 'silver': return 10;
      case 'gold': return 20;
      default: return 0;
    }
  })();

  return {
    membership,
    isLoading,
    error,
    hasMembership: !!membership && membership.isActive,
    tier: membership?.tier || null,
    discountPercent,
    refreshMembership: fetchMembership,
    isGateOpen,
  };
}

// Hook for checking if a feature is gated
export function useMembershipGate(requiredTier?: MembershipTier): {
  isAllowed: boolean;
  isLoading: boolean;
  currentTier: MembershipTier | null;
  upgradeMessage: string;
} {
  const { hasMembership, tier, isLoading, isGateOpen } = useMembership();

  const isAllowed = isGateOpen(requiredTier);

  const upgradeMessage = (() => {
    if (!hasMembership) {
      return requiredTier 
        ? `This feature requires ${requiredTier} membership. Join the club to access it!`
        : 'This feature requires membership. Join the club to access it!';
    }
    if (!isAllowed && requiredTier) {
      return `This feature requires ${requiredTier} membership. Upgrade to access it!`;
    }
    return '';
  })();

  return {
    isAllowed,
    isLoading,
    currentTier: tier,
    upgradeMessage,
  };
}
