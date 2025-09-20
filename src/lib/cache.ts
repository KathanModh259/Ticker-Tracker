// src/lib/cache.ts
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private storage: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 60000; // 1 minute default TTL

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
    this.storage.set(key, {
      data,
      timestamp: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    if (!item) return null;
    
    if (Date.now() > item.timestamp) {
      this.storage.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.storage.clear();
  }
}

export const cache = new Cache();