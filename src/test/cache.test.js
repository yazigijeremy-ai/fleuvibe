import { describe, it, expect, vi } from 'vitest';
import { DistributedCache, RateLimiter } from '../utils/cache.js';

describe('DistributedCache', () => {
  it('returns null for missing key', () => {
    const c = new DistributedCache();
    expect(c.get('missing')).toBeNull();
  });

  it('returns stored value', () => {
    const c = new DistributedCache();
    c.set('k', 'v', 1000);
    expect(c.get('k')).toBe('v');
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    const c = new DistributedCache();
    c.set('k', 'v', 100);
    vi.advanceTimersByTime(200);
    expect(c.get('k')).toBeNull();
    vi.useRealTimers();
  });
});

describe('RateLimiter', () => {
  it('allows requests under the limit', () => {
    const rl = new RateLimiter(3, 60000);
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(true);
    expect(rl.check('u').allowed).toBe(true);
  });

  it('blocks after limit exceeded', () => {
    const rl = new RateLimiter(2, 60000);
    rl.check('u'); rl.check('u');
    const result = rl.check('u');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });
});
