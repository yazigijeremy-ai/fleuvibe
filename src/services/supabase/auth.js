import { supabase } from './client.js';
import { rateLimiters } from '../../utils/cache.js';
import { logger } from '../../utils/analytics.js';

/**
 * @param {string} email
 * @param {string} password
 * @param {string} username
 */
export const signUp = async (email, password, username) => {
  const rl = rateLimiters.auth.check(email);
  if (!rl.allowed) throw new Error(rl.reason);

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    await supabase.from('profiles').upsert({
      id:       data.user.id,
      username: username || email.split('@')[0],
      xp:       50,
    });
    logger.info('user_signup', { userId: data.user.id });
  }
  return data;
};

/**
 * @param {string} email
 * @param {string} password
 */
export const signIn = async (email, password) => {
  const rl = rateLimiters.auth.check(email);
  if (!rl.allowed) throw new Error(rl.reason);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  logger.info('user_login', { userId: data.user?.id });
  return data;
};

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

/** @param {(event: string, session: unknown) => void} callback */
export const onAuthStateChange = (callback) =>
  supabase.auth.onAuthStateChange(callback);

/**
 * @param {string} userId
 * @returns {Promise<import('../../types/index.js').UserProfile|null>}
 */
export const fetchProfile = async (userId) => {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data ?? null;
};
