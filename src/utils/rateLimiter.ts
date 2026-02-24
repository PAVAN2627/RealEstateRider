/**
 * Rate Limiter Utility
 * 
 * Provides client-side rate limiting to prevent brute force attacks
 * and excessive API calls.
 * 
 * Requirement 23.7: Add rate limiting for authentication
 */

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

/**
 * Rate limit attempt record
 */
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

/**
 * Rate limiter class
 */
class RateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Checks if an action is allowed
   * 
   * @param key - Unique key for the action (e.g., email address)
   * @returns Object with allowed status and remaining attempts
   */
  check(key: string): { allowed: boolean; remainingAttempts: number; retryAfter?: number } {
    const now = Date.now();
    const record = this.records.get(key);

    // No previous attempts
    if (!record) {
      return {
        allowed: true,
        remainingAttempts: this.config.maxAttempts - 1,
      };
    }

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
      };
    }

    // Check if window has expired
    const windowExpired = now - record.firstAttemptTime > this.config.windowMs;
    if (windowExpired) {
      // Reset the record
      this.records.delete(key);
      return {
        allowed: true,
        remainingAttempts: this.config.maxAttempts - 1,
      };
    }

    // Check if max attempts reached
    if (record.attempts >= this.config.maxAttempts) {
      // Block the key
      record.blockedUntil = now + this.config.blockDurationMs;
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfter: Math.ceil(this.config.blockDurationMs / 1000),
      };
    }

    // Allow the attempt
    return {
      allowed: true,
      remainingAttempts: this.config.maxAttempts - record.attempts - 1,
    };
  }

  /**
   * Records an attempt
   * 
   * @param key - Unique key for the action
   */
  recordAttempt(key: string): void {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record) {
      this.records.set(key, {
        attempts: 1,
        firstAttemptTime: now,
      });
      return;
    }

    // Check if window has expired
    const windowExpired = now - record.firstAttemptTime > this.config.windowMs;
    if (windowExpired) {
      // Reset the record
      this.records.set(key, {
        attempts: 1,
        firstAttemptTime: now,
      });
      return;
    }

    // Increment attempts
    record.attempts++;
  }

  /**
   * Resets the rate limit for a key (e.g., after successful login)
   * 
   * @param key - Unique key for the action
   */
  reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * Clears all rate limit records
   */
  clearAll(): void {
    this.records.clear();
  }

  /**
   * Clears expired records
   */
  clearExpired(): void {
    const now = Date.now();
    this.records.forEach((record, key) => {
      const windowExpired = now - record.firstAttemptTime > this.config.windowMs;
      const blockExpired = record.blockedUntil && now > record.blockedUntil;
      
      if (windowExpired || blockExpired) {
        this.records.delete(key);
      }
    });
  }
}

/**
 * Login rate limiter
 * Allows 5 attempts per 15 minutes, blocks for 30 minutes after
 * 
 * Requirement 23.7: Implement rate limiting on login endpoint
 */
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
});

/**
 * Registration rate limiter
 * Allows 3 attempts per hour
 */
export const registrationRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // 1 hour
});

/**
 * Password reset rate limiter
 * Allows 3 attempts per hour
 */
export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // 1 hour
});

/**
 * API call rate limiter
 * Allows 100 calls per minute
 */
export const apiRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 60 * 1000, // 1 minute
});

/**
 * Wraps a function with rate limiting
 * 
 * @param fn - Function to wrap
 * @param rateLimiter - Rate limiter instance
 * @param getKey - Function to extract key from arguments
 * @returns Wrapped function with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  rateLimiter: RateLimiter,
  getKey: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = getKey(...args);
    const { allowed, remainingAttempts, retryAfter } = rateLimiter.check(key);

    if (!allowed) {
      throw new Error(
        `Too many attempts. Please try again in ${retryAfter} seconds.`
      );
    }

    try {
      const result = await fn(...args);
      // Reset on success (e.g., successful login)
      rateLimiter.reset(key);
      return result;
    } catch (error) {
      // Record failed attempt
      rateLimiter.recordAttempt(key);
      throw error;
    }
  }) as T;
}

// Set up periodic cleanup of expired records (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    loginRateLimiter.clearExpired();
    registrationRateLimiter.clearExpired();
    passwordResetRateLimiter.clearExpired();
    apiRateLimiter.clearExpired();
  }, 5 * 60 * 1000);
}
