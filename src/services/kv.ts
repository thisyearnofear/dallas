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

import { kv } from '@vercel/kv';

// Check if KV is configured
const isKVConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// In-memory fallback when KV not configured
const memoryStore = new Map<string, any>();

/**
 * Store data with automatic fallback
 */
export const db = {
  /**
   * Get a value by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (isKVConfigured) {
      const value = await kv.get<T>(key);
      return value;
    }
    return memoryStore.get(key) ?? null;
  },

  /**
   * Set a value
   */
  async set(key: string, value: any): Promise<void> {
    if (isKVConfigured) {
      await kv.set(key, value);
    } else {
      memoryStore.set(key, value);
    }
  },

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    if (isKVConfigured) {
      await kv.del(key);
    } else {
      memoryStore.delete(key);
    }
  },

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (isKVConfigured) {
      return await kv.keys(pattern);
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
    async getField<T>(key: string, field: string): Promise<T | null> {
      if (isKVConfigured) {
        const hash = await kv.hgetall(key);
        return hash?.[field] as T ?? null;
      }
      const data = memoryStore.get(key);
      return data?.[field] ?? null;
    },

    async setField(key: string, field: string, value: any): Promise<void> {
      if (isKVConfigured) {
        await kv.hset(key, { [field]: value });
      } else {
        const data = memoryStore.get(key) || {};
        data[field] = value;
        memoryStore.set(key, data);
      }
    },

    async getAll<T>(key: string): Promise<T | null> {
      if (isKVConfigured) {
        return await kv.hgetall(key);
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
        await kv.rpush(key, value);
      } else {
        const data = memoryStore.get(key) || [];
        data.push(value);
        memoryStore.set(key, data);
      }
    },

    async range(key: string, start: number = 0, stop: number = -1): Promise<any[]> {
      if (isKVConfigured) {
        return await kv.lrange(key, start, stop);
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