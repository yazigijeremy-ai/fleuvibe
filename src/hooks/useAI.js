import { useState, useCallback } from 'react';
import { rateLimiters } from '../utils/cache.js';

/**
 * Wraps any AI service call with loading state and rate-limit feedback.
 * @template T
 * @param {(...args: unknown[]) => Promise<T>} aiFn
 * @returns {{ call: (...args: unknown[]) => Promise<T|null>, loading: boolean, error: string|null }}
 */
export const useAI = (aiFn) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const call = useCallback(async (...args) => {
    const rl = rateLimiters.ai.check('global');
    if (!rl.allowed) { setError(rl.reason); return null; }

    setLoading(true);
    setError(null);
    try {
      return await aiFn(...args);
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [aiFn]);

  return { call, loading, error };
};
