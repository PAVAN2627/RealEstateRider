/**
 * Caching Utility
 * 
 * Provides caching strategies for frequently accessed data.
 * Works with React Query for data fetching and caching.
 * 
 * Requirement 22.5: Implement caching for frequently accessed data
 */

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  // User profile - cache for 5 minutes
  userProfile: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  
  // Properties list - cache for 2 minutes
  properties: {
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  },
  
  // Single property - cache for 5 minutes
  property: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  
  // Notifications - cache for 30 seconds
  notifications: {
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
  },
  
  // Inquiries - cache for 1 minute
  inquiries: {
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  },
  
  // Wishlist - cache for 2 minutes
  wishlist: {
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  },
  
  // Activity logs - cache for 5 minutes
  activityLogs: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  
  // Agent profiles - cache for 10 minutes
  agentProfiles: {
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  },
};

/**
 * Query keys for React Query
 */
export const QUERY_KEYS = {
  userProfile: (userId: string) => ['user', userId],
  properties: (filters?: any) => ['properties', filters],
  property: (propertyId: string) => ['property', propertyId],
  userProperties: (userId: string) => ['userProperties', userId],
  notifications: (userId: string) => ['notifications', userId],
  unreadNotifications: (userId: string) => ['unreadNotifications', userId],
  inquiriesByBuyer: (buyerId: string) => ['inquiries', 'buyer', buyerId],
  inquiriesByAgent: (agentId: string) => ['inquiries', 'agent', agentId],
  wishlist: (userId: string) => ['wishlist', userId],
  activityLogs: (filters?: any) => ['activityLogs', filters],
  agentProfile: (agentId: string) => ['agentProfile', agentId],
  users: (filters?: any) => ['users', filters],
  pendingUsers: () => ['users', 'pending'],
  pendingProperties: () => ['properties', 'pending'],
};

/**
 * Local storage cache utility
 */
class LocalStorageCache {
  private prefix = 'estate_sphere_';
  
  /**
   * Sets a value in local storage with expiration
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  set(key: string, value: any, ttl: number): void {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }
  
  /**
   * Gets a value from local storage
   * 
   * @param key - Cache key
   * @returns Cached value or null if expired/not found
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      
      return item.value as T;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }
  
  /**
   * Removes a value from local storage
   * 
   * @param key - Cache key
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }
  
  /**
   * Clears all cached values
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
  
  /**
   * Clears expired cache entries
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
}

export const localCache = new LocalStorageCache();

/**
 * In-memory cache utility for temporary data
 */
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();
  
  /**
   * Sets a value in memory cache with expiration
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  set(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }
  
  /**
   * Gets a value from memory cache
   * 
   * @param key - Cache key
   * @returns Cached value or null if expired/not found
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }
  
  /**
   * Removes a value from memory cache
   * 
   * @param key - Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clears all cached values
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clears expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
}

export const memoryCache = new MemoryCache();

/**
 * Clears all caches (both local storage and memory)
 */
export function clearAllCaches(): void {
  localCache.clear();
  memoryCache.clear();
}

/**
 * Clears expired entries from all caches
 */
export function clearExpiredCaches(): void {
  localCache.clearExpired();
  memoryCache.clearExpired();
}

// Set up periodic cleanup of expired cache entries (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    clearExpiredCaches();
  }, 5 * 60 * 1000);
}
