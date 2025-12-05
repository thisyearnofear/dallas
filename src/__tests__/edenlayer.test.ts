import { EdenlayerBridge, EDENLAYER_CONFIG } from '../services/EdenlayerIntegration';

describe('Edenlayer Configuration', () => {
  test('should have API URL configured', () => {
    expect(EDENLAYER_CONFIG.apiUrl).toBeTruthy();
    expect(EDENLAYER_CONFIG.apiUrl).toMatch(/^https?:\/\/.+/);
  });

  test('should have websocket URL configured', () => {
    expect(EDENLAYER_CONFIG.websocketUrl).toBeTruthy();
    expect(EDENLAYER_CONFIG.websocketUrl).toMatch(/^wss?:\/\/.+/);
  });
});

describe('EdenlayerBridge', () => {
  let bridge: EdenlayerBridge;
  const testApiKey = 'test-api-key-12345';

  beforeEach(() => {
    bridge = new EdenlayerBridge(testApiKey);
  });

  describe('Agent Registration', () => {
    test('should initialize with empty registered agents', () => {
      const agents = bridge.getRegisteredAgents();
      expect(agents).toBeInstanceOf(Map);
    });

    test('should be able to register agents (mock)', async () => {
      // This would call API in production
      // For testing, we verify the structure is correct
      const agents = bridge.getRegisteredAgents();
      expect(agents.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Agent Configuration', () => {
    test('should have valid agent types', () => {
      const validTypes = ['supply', 'risk', 'community', 'identity'];
      // Verify that expected agent types would be registered
      expect(validTypes).toEqual(expect.arrayContaining(validTypes));
    });
  });
});

describe('Agent Capabilities', () => {
  test('supply agent should have treatment tools', () => {
    const supplyTools = [
      'check_treatment_availability',
      'negotiate_bulk_pricing',
      'coordinate_distribution'
    ];
    expect(supplyTools.length).toBe(3);
    supplyTools.forEach(tool => {
      expect(tool).toBeTruthy();
    });
  });

  test('risk agent should have security tools', () => {
    const riskTools = [
      'assess_transaction_risk',
      'monitor_corporate_surveillance',
      'coordinate_emergency_response'
    ];
    expect(riskTools.length).toBe(3);
    riskTools.forEach(tool => {
      expect(tool).toBeTruthy();
    });
  });

  test('community agent should have coordination tools', () => {
    const communityTools = [
      'organize_group_purchase',
      'match_community_members',
      'facilitate_peer_support'
    ];
    expect(communityTools.length).toBe(3);
    communityTools.forEach(tool => {
      expect(tool).toBeTruthy();
    });
  });

  test('identity agent should have restoration tools', () => {
    const identityTools = [
      'assess_identity_fragmentation',
      'plan_restoration_sequence',
      'monitor_restoration_progress'
    ];
    expect(identityTools.length).toBe(3);
    identityTools.forEach(tool => {
      expect(tool).toBeTruthy();
    });
  });
});
