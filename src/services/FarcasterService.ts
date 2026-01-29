/**
 * Farcaster Integration Service
 * Opt-in social layer for communities - Anonymous by default
 * Follows Core Principles: CLEAN, MODULAR, DRY
 */

import { PublicKey } from '@solana/web3.js';

export interface FarcasterAccount {
  fid: number;              // Farcaster ID
  username: string;         // Farcaster username
  pfpUrl?: string;          // Profile picture
  custody: string;          // Custody address
  connected: boolean;
}

export interface FarcasterChannel {
  channelId: string;        // e.g., 'collagen'
  name: string;             // e.g., 'Collagen Community'
  description: string;
  imageUrl?: string;
  memberCount: number;
  url: string;              // Full Warpcast URL
}

export interface FarcasterCast {
  hash: string;
  author: {
    fid: number;
    username: string;
  };
  text: string;
  timestamp: number;
  embeds?: string[];
}

/**
 * FarcasterService - Manages social layer integration
 * NOTE: This is a lightweight wrapper. Actual implementation requires:
 * - Farcaster Auth Kit for wallet connection
 * - Farcaster Hub API for posting/reading
 * - Neynar or Warpcast API for channel management
 */
export class FarcasterService {
  private static instance: FarcasterService;
  private connected: boolean = false;
  private account: FarcasterAccount | null = null;

  private constructor() {}

  static getInstance(): FarcasterService {
    if (!FarcasterService.instance) {
      FarcasterService.instance = new FarcasterService();
    }
    return FarcasterService.instance;
  }

  /**
   * Check if Farcaster is enabled in the app
   */
  isEnabled(): boolean {
    return import.meta.env.VITE_FARCASTER_ENABLED === 'true';
  }

  /**
   * Connect wallet to Farcaster account (optional)
   * Anonymous by default - only connect if user wants social features
   */
  async connectAccount(walletAddress: PublicKey): Promise<FarcasterAccount> {
    if (!this.isEnabled()) {
      throw new Error('Farcaster integration not enabled');
    }

    // TODO: Implement Farcaster Auth Kit
    // This would:
    // 1. Sign message with wallet
    // 2. Verify with Farcaster custody address
    // 3. Return FID and username
    
    console.log('🎭 Connecting Farcaster account for wallet:', walletAddress.toString());
    
    // Mock for now - replace with real implementation
    const mockAccount: FarcasterAccount = {
      fid: 1234,
      username: 'anon-user',
      connected: true,
      custody: walletAddress.toString()
    };

    this.account = mockAccount;
    this.connected = true;
    
    return mockAccount;
  }

  /**
   * Disconnect Farcaster account
   * Returns to anonymous mode
   */
  disconnect(): void {
    this.account = null;
    this.connected = false;
    localStorage.removeItem('farcaster_account');
    console.log('🎭 Disconnected from Farcaster - back to anonymous mode');
  }

  /**
   * Get current connection status
   */
  getAccount(): FarcasterAccount | null {
    return this.account;
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Create a channel for a community
   * Only called when community creator enables social layer
   */
  async createChannel(params: {
    name: string;
    description: string;
    communityMint: PublicKey;
    category: string;
  }): Promise<FarcasterChannel> {
    if (!this.isEnabled()) {
      throw new Error('Farcaster integration not enabled');
    }

    // Generate channel ID from name
    const channelId = params.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 32);

    console.log('🌐 Creating Farcaster channel:', channelId);

    // TODO: Implement channel creation via Neynar or Warpcast API
    // This would:
    // 1. Verify creator has connected Farcaster account
    // 2. Create channel on Farcaster
    // 3. Link channel to community mint
    // 4. Set permissions (public/token-gated)

    const channel: FarcasterChannel = {
      channelId,
      name: params.name,
      description: params.description,
      memberCount: 1,
      url: `https://warpcast.com/~/channel/${channelId}`
    };

    return channel;
  }

  /**
   * Post a cast to a community channel
   * Can be anonymous (via wallet) or with Farcaster identity
   */
  async postToChannel(params: {
    channelId: string;
    text: string;
    embeds?: string[];
    anonymous?: boolean;
  }): Promise<FarcasterCast> {
    if (!this.isEnabled()) {
      throw new Error('Farcaster integration not enabled');
    }

    if (!params.anonymous && !this.connected) {
      throw new Error('Must connect Farcaster account for non-anonymous posts');
    }

    console.log('📝 Posting to channel:', params.channelId, 'anonymous:', params.anonymous);

    // TODO: Implement posting via Farcaster Hub API
    // Anonymous posts would use a proxy account linked to wallet signature

    const cast: FarcasterCast = {
      hash: `0x${Math.random().toString(16).slice(2)}`,
      author: {
        fid: params.anonymous ? 0 : (this.account?.fid || 0),
        username: params.anonymous ? 'anon' : (this.account?.username || 'anon')
      },
      text: params.text,
      timestamp: Date.now()
    };

    return cast;
  }

  /**
   * Get casts from a community channel
   */
  async getChannelFeed(channelId: string, limit: number = 25): Promise<FarcasterCast[]> {
    if (!this.isEnabled()) {
      return [];
    }

    console.log('📖 Fetching channel feed:', channelId);

    // TODO: Implement feed fetching via Neynar or Hub API
    
    return [];
  }

  /**
   * Check if a wallet is a member of a channel
   * Used for token-gated access
   */
  async isChannelMember(channelId: string, walletAddress: PublicKey): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    // TODO: Check if wallet holds community token
    // This would query Solana for token balance
    
    return false;
  }

  /**
   * Generate a Farcaster Frame for community interactions
   * Frames allow embedded actions (buy token, join, vote, etc.)
   */
  generateFrame(params: {
    title: string;
    imageUrl: string;
    action: 'buy' | 'join' | 'vote';
    communityMint: PublicKey;
  }): string {
    if (!this.isEnabled()) {
      return '';
    }

    // TODO: Generate Frame metadata
    // Frames are HTML meta tags that Warpcast renders as interactive cards
    
    const frameHtml = `
      <meta property="fc:frame" content="vnd.farcaster.frame:vnd" />
      <meta property="fc:frame:image" content="${params.imageUrl}" />
      <meta property="fc:frame:button:1" content="${params.title}" />
      <meta property="fc:frame:post_url" content="${window.location.origin}/api/frame/${params.communityMint}" />
    `;

    return frameHtml;
  }
}

export const farcasterService = FarcasterService.getInstance();
