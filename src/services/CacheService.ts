/**
 * CacheService - Performance Optimization Layer
 * 
 * Features:
 * - In-memory caching for case study data
 * - Persistent cache with localStorage
 * - Cache invalidation strategies
 * - Request deduplication
 * 
 * Core Principles:
 * - PERFORMANT: Minimize blockchain RPC calls
 * - CLEAN: Clear cache lifecycle management
 * - MODULAR: Pluggable cache strategies
 */

import { PublicKey } from '@solana/web3.js';

// ============= Types =============

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  oldestEntry: number;
}

type CacheStrategy = 'memory' | 'persistent' | 'hybrid';

// ============= Configuration =============

const DEFAULT_TTL = {
  caseStudy: 5 * 60 * 1000,      // 5 minutes
  validator: 30 * 1000,          // 30 seconds
  balance: 10 * 1000,            // 10 seconds
  protocol: 60 * 60 * 1000,      // 1 hour
  leaderboard: 5 * 60 * 1000,    // 5 minutes
};

const MAX_CACHE_SIZE = 1000;
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// ============= Cache Service =============

class CacheService {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private strategy: CacheStrategy = 'hybrid';
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, oldestEntry: Date.now() };
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private cleanupInterval: number | null = null;

  constructor(strategy: CacheStrategy = 'hybrid') {
    this.strategy = strategy;
    this.startCleanupInterval();
    this.loadFromStorage();
  }

  // ============= Core Operations =============

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.getEntry<T>(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL.caseStudy): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    // Enforce max cache size
    if (this.memoryCache.size >= MAX_CACHE_SIZE) {
      this.evictLRU();
    }

    this.memoryCache.set(key, entry as CacheEntry<unknown>);
    this.stats.size = this.memoryCache.size;

    // Persist to localStorage if using hybrid strategy
    if (this.strategy === 'hybrid' || this.strategy === 'persistent') {
      this.persistEntry(key, entry);
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    
    if (this.strategy === 'hybrid' || this.strategy === 'persistent') {
      localStorage.removeItem(`cache_${key}`);
    }
    
    this.stats.size = this.memoryCache.size;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    
    if (this.strategy === 'hybrid' || this.strategy === 'persistent') {
      // Clear only cache items from localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    }
    
    this.stats = { hits: 0, misses: 0, size: 0, oldestEntry: Date.now() };
  }

  // ============= Deduplication =============

  /**
   * Execute function with request deduplication
   */
  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Check for pending request
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Execute and cache
    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }

  // ============= Typed Cache Methods =============

  /**
   * Cache case study data
   */
  getCaseStudy(pubkey: PublicKey): unknown | null {
    return this.get(`caseStudy_${pubkey.toString()}`);
  }

  setCaseStudy(pubkey: PublicKey, data: unknown): void {
    this.set(`caseStudy_${pubkey.toString()}`, data, DEFAULT_TTL.caseStudy);
  }

  /**
   * Cache validator data
   */
  getValidator(address: PublicKey): unknown | null {
    return this.get(`validator_${address.toString()}`);
  }

  setValidator(address: PublicKey, data: unknown): void {
    this.set(`validator_${address.toString()}`, data, DEFAULT_TTL.validator);
  }

  /**
   * Cache balance
   */
  getBalance(address: PublicKey): unknown | null {
    return this.get(`balance_${address.toString()}`);
  }

  setBalance(address: PublicKey, data: unknown): void {
    this.set(`balance_${address.toString()}`, data, DEFAULT_TTL.balance);
  }

  /**
   * Cache protocol stats
   */
  getProtocolStats(): unknown | null {
    return this.get('protocolStats');
  }

  setProtocolStats(data: unknown): void {
    this.set('protocolStats', data, DEFAULT_TTL.protocol);
  }

  /**
   * Cache leaderboard
   */
  getLeaderboard(): unknown | null {
    return this.get('leaderboard');
  }

  setLeaderboard(data: unknown): void {
    this.set('leaderboard', data, DEFAULT_TTL.leaderboard);
  }

  // ============= Statistics =============

  getStats(): CacheStats {
    let oldest = Date.now();
    for (const entry of this.memoryCache.values()) {
      oldest = Math.min(oldest, entry.timestamp);
    }
    
    return {
      ...this.stats,
      oldestEntry: oldest,
    };
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  // ============= Private Methods =============

  private getEntry<T>(key: string): CacheEntry<T> | undefined {
    // Try memory first
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memoryEntry) return memoryEntry;

    // Try localStorage for hybrid strategy
    if (this.strategy === 'hybrid' || this.strategy === 'persistent') {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        try {
          const entry: CacheEntry<T> = JSON.parse(stored);
          // Restore to memory
          this.memoryCache.set(key, entry as CacheEntry<unknown>);
          return entry;
        } catch {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    }

    return undefined;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private persistEntry<T>(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      // localStorage full, clear old entries
      this.clearOldStorageEntries();
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    }
  }

  private loadFromStorage(): void {
    if (this.strategy === 'memory') return;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry<unknown> = JSON.parse(stored);
            const cacheKey = key.replace('cache_', '');
            
            // Only load if not expired
            if (!this.isExpired(entry)) {
              this.memoryCache.set(cacheKey, entry);
            } else {
              localStorage.removeItem(key);
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
    
    this.stats.size = this.memoryCache.size;
  }

  private clearOldStorageEntries(): void {
    const entries: Array<{ key: string; timestamp: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp and remove oldest 20%
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// ============= Singleton Export =============

export const cacheService = new CacheService();

export default cacheService;
