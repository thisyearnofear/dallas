import { SOLANA_CONFIG, getRpcEndpoint } from '../config/solana';

describe('Solana Configuration', () => {
  describe('Config Constants', () => {
    test('should have valid network setting', () => {
      expect(['devnet', 'testnet', 'mainnet-beta']).toContain(SOLANA_CONFIG.network);
    });

    test('should have valid treasury address', () => {
      expect(SOLANA_CONFIG.treasuryAddress).toBeTruthy();
      expect(SOLANA_CONFIG.treasuryAddress.length).toBeGreaterThan(0);
    });

    test('should have RPC endpoints configured', () => {
      expect(SOLANA_CONFIG.rpcEndpoint.devnet).toBeTruthy();
      expect(SOLANA_CONFIG.rpcEndpoint.testnet).toBeTruthy();
      expect(SOLANA_CONFIG.rpcEndpoint['mainnet-beta']).toBeTruthy();
    });

    test('should have default amounts configured', () => {
      expect(SOLANA_CONFIG.defaults.donationAmount).toBeGreaterThan(0);
      expect(SOLANA_CONFIG.defaults.membershipBronze).toBeGreaterThan(0);
      expect(SOLANA_CONFIG.defaults.membershipSilver).toBeGreaterThan(0);
      expect(SOLANA_CONFIG.defaults.membershipGold).toBeGreaterThan(0);
    });

    test('should have membership tiers in ascending order', () => {
      const { bronze, silver, gold } = {
        bronze: SOLANA_CONFIG.defaults.membershipBronze,
        silver: SOLANA_CONFIG.defaults.membershipSilver,
        gold: SOLANA_CONFIG.defaults.membershipGold
      };

      expect(bronze).toBeLessThan(silver);
      expect(silver).toBeLessThan(gold);
    });
  });

  describe('getRpcEndpoint', () => {
    test('should return devnet endpoint by default', () => {
      const endpoint = getRpcEndpoint();
      expect(endpoint).toBe(SOLANA_CONFIG.rpcEndpoint.devnet);
    });

    test('should return valid URL format', () => {
      const endpoint = getRpcEndpoint();
      expect(endpoint).toMatch(/^https?:\/\/.+/);
    });
  });
});
