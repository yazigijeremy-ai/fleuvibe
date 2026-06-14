/** In-memory cache with TTL. */
export class DistributedCache {
  constructor() { this.mem = new Map(); }

  get(key) {
    const item = this.mem.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) { this.mem.delete(key); return null; }
    return item.data;
  }

  /** @param {string} key @param {unknown} data @param {number} [ttl=3600000] */
  set(key, data, ttl = 3600000) {
    this.mem.set(key, { data, expiry: Date.now() + ttl });
    setTimeout(() => this.mem.delete(key), ttl);
  }

  clear() { this.mem.clear(); }
}

/** Client-side rate limiter. */
export class RateLimiter {
  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow  = timeWindow;
    this.requests    = new Map();
    this.blocked     = new Map();
  }

  /** @param {string} [userId='anon'] @returns {{ allowed: boolean, reason?: string, retryAfter?: number, remaining?: number }} */
  check(userId = 'anon') {
    if (this.blocked.has(userId) && Date.now() < this.blocked.get(userId)) {
      return { allowed: false, reason: 'Trop de requêtes. Réessaie dans quelques secondes.', retryAfter: this.blocked.get(userId) - Date.now() };
    }
    const now    = Date.now();
    const recent = (this.requests.get(userId) || []).filter(t => now - t < this.timeWindow);
    if (recent.length >= this.maxRequests) {
      this.blocked.set(userId, now + 30000);
      return { allowed: false, reason: 'Limite atteinte. Réessaie dans 30 secondes.', retryAfter: 30000 };
    }
    recent.push(now);
    this.requests.set(userId, recent);
    return { allowed: true, remaining: this.maxRequests - recent.length };
  }
}

export const rateLimiters = {
  ai:     new RateLimiter(20, 60000),
  auth:   new RateLimiter(10, 60000),
  review: new RateLimiter(10, 60000),
};
