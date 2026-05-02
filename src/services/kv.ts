/**
 * KV Storage Service for Dallas Buyers Club
 * 
 * Provides persistent storage using Vercel KV (Redis) with fallback to in-memory
 * when KV credentials are not configured.
 * 
 * Setup:
 * 1. Add KV database in Vercel Dashboard (Storage → Create KV)
 * 2. Add environment variables:
 *    - KV_REST_API_URL
 *    - KV_REST_API_TOKEN
 */

// Check if KV is configured
const isKVConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// In-memory fallback when KV not configured
const memoryStore = new Map<string, any>();

async function kvCommand<T = any>(command: string, ...args: any[]): Promise<T> {
  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });

  if (!response.ok) {
    throw new Error(`KV ${command} failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`KV ${command} failed: ${payload.error}`);
  }

  return payload.result as T;
}

function serialize(value: any): string {
  return JSON.stringify(value);
}

function deserialize<T = any>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value !== 'string') return value as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

/**
 * Store data with automatic fallback
 */
export const db = {
  /**
   * Get a value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (isKVConfigured) {
      const value = await kvCommand<string | null>('GET', key);
      return deserialize<T>(value);
    }
    return memoryStore.get(key) ?? null;
  },

  /**
   * Set a value
   */
  async set(key: string, value: any): Promise<void> {
    if (isKVConfigured) {
      await kvCommand('SET', key, serialize(value));
    } else {
      memoryStore.set(key, value);
    }
  },

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    if (isKVConfigured) {
      await kvCommand('DEL', key);
    } else {
      memoryStore.delete(key);
    }
  },

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (isKVConfigured) {
      return await kvCommand<string[]>('KEYS', pattern);
    }
    if (pattern === '*') {
      return Array.from(memoryStore.keys());
    }
    return Array.from(memoryStore.keys()).filter(k => k.includes(pattern.replace('*', '')));
  },

  /**
   * Hash operations
   */
  hash: {
    async getField<T = any>(key: string, field: string): Promise<T | null> {
      if (isKVConfigured) {
        const value = await kvCommand<string | null>('HGET', key, field);
        return deserialize<T>(value);
      }
      const data = memoryStore.get(key);
      return data?.[field] ?? null;
    },

    async setField(key: string, field: string, value: any): Promise<void> {
      if (isKVConfigured) {
        await kvCommand('HSET', key, field, serialize(value));
      } else {
        const data = memoryStore.get(key) || {};
        data[field] = value;
        memoryStore.set(key, data);
      }
    },

    async getAll<T = any>(key: string): Promise<T | null> {
      if (isKVConfigured) {
        const values = await kvCommand<Record<string, string> | null>('HGETALL', key);
        if (!values) return null;
        return Object.fromEntries(
          Object.entries(values).map(([field, value]) => [field, deserialize(value)])
        ) as T;
      }
      return memoryStore.get(key) || null;
    }
  },

  /**
   * List operations
   */
  list: {
    async push(key: string, value: any): Promise<void> {
      if (isKVConfigured) {
        await kvCommand('RPUSH', key, serialize(value));
      } else {
        const data = memoryStore.get(key) || [];
        data.push(value);
        memoryStore.set(key, data);
      }
    },

    async range<T = any>(key: string, start: number = 0, stop: number = -1): Promise<T[]> {
      if (isKVConfigured) {
        const values = await kvCommand<string[]>('LRANGE', key, start, stop);
        return values.map(value => deserialize<T>(value) as T);
      }
      const data = memoryStore.get(key) || [];
      if (stop === -1) return data.slice(start);
      return data.slice(start, stop + 1);
    }
  },

  /**
   * Check if using persistent storage
   */
  isPersistent(): boolean {
    return isKVConfigured;
  }
};

export default db;
