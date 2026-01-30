import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { Membership, IDL } from './membership_idl';
import { SOLANA_CONFIG } from '../../config/solana';

export type MembershipTier = 'bronze' | 'silver' | 'gold';

export interface MembershipData {
  member: PublicKey;
  tier: MembershipTier;
  nickname: string;
  healthFocus: string;
  purchasedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface MembershipPrices {
  bronze: number; // in SOL
  silver: number;
  gold: number;
}

const TIER_MAP: Record<number, MembershipTier> = {
  0: 'bronze',
  1: 'silver',
  2: 'gold',
};

const PROGRAM_ID = new PublicKey('Memb3rsh1pDBCpRoGramJ4q4vfHwe57x7hRjcQMJfV3Y');

export class MembershipService {
  private program: Program<Membership>;
  private connection: Connection;

  constructor(connection: Connection, provider: AnchorProvider) {
    this.connection = connection;
    this.program = new Program(IDL, PROGRAM_ID, provider);
  }

  // Get membership PDA for a wallet
  getMembershipPDA(member: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('membership'), member.toBuffer()],
      PROGRAM_ID
    );
  }

  // Get config PDA
  getConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      PROGRAM_ID
    );
  }

  // Get membership mint PDA for a tier
  getMembershipMintPDA(tier: MembershipTier): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('membership_mint'), Buffer.from(tier.charAt(0).toUpperCase() + tier.slice(1))],
      PROGRAM_ID
    );
  }

  // Check if user has active membership
  async hasActiveMembership(member: PublicKey): Promise<boolean> {
    try {
      const [membershipPDA] = this.getMembershipPDA(member);
      const membership = await this.program.account.membership.fetch(membershipPDA);
      return membership.isActive && membership.expiresAt.toNumber() > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  // Get membership data
  async getMembership(member: PublicKey): Promise<MembershipData | null> {
    try {
      const [membershipPDA] = this.getMembershipPDA(member);
      const membership = await this.program.account.membership.fetch(membershipPDA);
      
      return {
        member: membership.member,
        tier: TIER_MAP[membership.tier],
        nickname: membership.nickname,
        healthFocus: membership.healthFocus,
        purchasedAt: new Date(membership.purchasedAt.toNumber() * 1000),
        expiresAt: new Date(membership.expiresAt.toNumber() * 1000),
        isActive: membership.isActive,
      };
    } catch {
      return null;
    }
  }

  // Purchase membership
  async purchaseMembership(
    member: PublicKey,
    tier: MembershipTier,
    nickname: string,
    healthFocus?: string
  ): Promise<string> {
    const [membershipPDA, membershipBump] = this.getMembershipPDA(member);
    const [configPDA] = this.getConfigPDA();
    const [membershipMintPDA] = this.getMembershipMintPDA(tier);

    // Get associated token account
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const memberTokenAccount = await getAssociatedTokenAddress(
      membershipMintPDA,
      member
    );

    // Get tier number
    const tierNumber = tier === 'bronze' ? 0 : tier === 'silver' ? 1 : 2;

    const tx = await this.program.methods
      .purchaseMembership(
        tierNumber,
        nickname,
        healthFocus || null
      )
      .accounts({
        config: configPDA,
        membership: membershipPDA,
        membershipMint: membershipMintPDA,
        memberTokenAccount,
        treasury: new PublicKey(SOLANA_CONFIG.treasuryAddress),
        member,
        systemProgram: SystemProgram.programId,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  }

  // Renew membership
  async renewMembership(member: PublicKey): Promise<string> {
    const [membershipPDA] = this.getMembershipPDA(member);
    const [configPDA] = this.getConfigPDA();

    const tx = await this.program.methods
      .renewMembership()
      .accounts({
        config: configPDA,
        membership: membershipPDA,
        treasury: new PublicKey(SOLANA_CONFIG.treasuryAddress),
        member,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Update profile
  async updateProfile(
    member: PublicKey,
    nickname?: string,
    healthFocus?: string
  ): Promise<string> {
    const [membershipPDA] = this.getMembershipPDA(member);

    const tx = await this.program.methods
      .updateProfile(
        nickname || null,
        healthFocus || null
      )
      .accounts({
        membership: membershipPDA,
        member,
      })
      .rpc();

    return tx;
  }

  // Get discount for tier
  getDiscountPercent(tier: MembershipTier): number {
    switch (tier) {
      case 'bronze': return 5;
      case 'silver': return 10;
      case 'gold': return 20;
      default: return 0;
    }
  }

  // Calculate discounted price
  calculateDiscountedPrice(originalPrice: number, tier: MembershipTier): number {
    const discount = this.getDiscountPercent(tier);
    return originalPrice * (1 - discount / 100);
  }
}

// Singleton instance
let membershipService: MembershipService | null = null;

export function getMembershipService(connection: Connection, provider: AnchorProvider): MembershipService {
  if (!membershipService) {
    membershipService = new MembershipService(connection, provider);
  }
  return membershipService;
}
