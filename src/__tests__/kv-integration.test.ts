import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import db from '../services/kv';

describe('KV persistence and state integration', () => {
  const testKey = 'test_key_integration_123';
  const testHashKey = 'test_hash_key_123';

  beforeAll(async () => {
    // Clear potentially lingering test keys
    await db.del(testKey);
    await db.del(testHashKey);
  });

  afterAll(async () => {
    // Cleanup
    await db.del(testKey);
    await db.del(testHashKey);
  });

  it('correctly persists complex state through the KV interface', async () => {
    const complexState = {
      id: 'val_123',
      status: 'pending',
      metadata: { attempts: 1, lastAttempt: Date.now() },
      history: ['initiated', 'processing']
    };

    await db.set(testKey, complexState);
    const stored = await db.get(testKey);

    expect(stored).toEqual(complexState);
    expect(stored.status).toBe('pending');
  });

  it('handles state transitions for optimization log validations', async () => {
    const logId = 'log_123';
    await db.hash.setField(testHashKey, logId, { status: 'submitted', score: 0 });

    // Simulate validator processing
    const current = await db.hash.getField(testHashKey, logId);
    expect(current.status).toBe('submitted');

    await db.hash.setField(testHashKey, logId, { status: 'approved', score: 95 });

    const updated = await db.hash.getField(testHashKey, logId);
    expect(updated.status).toBe('approved');
    expect(updated.score).toBe(95);
  });
});
