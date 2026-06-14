import { supabase } from './client.js';
import { rateLimiters } from '../../utils/cache.js';

/**
 * @param {number} spotId
 * @returns {Promise<import('../../types/index.js').Review[]>}
 */
export const fetchReviews = async (spotId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('route_id', spotId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

/**
 * @param {{ spotId: number, userId: string, rating: number, comment: string, userName: string }} review
 */
export const addReview = async ({ spotId, userId, rating, comment, userName }) => {
  const rl = rateLimiters.review.check(userId);
  if (!rl.allowed) throw new Error(rl.reason);

  const { data, error } = await supabase.from('reviews').insert({
    route_id:  spotId,
    user_id:   userId,
    rating,
    comment:   comment.trim(),
    user_name: userName,
  }).select().single();
  if (error) throw error;
  return data;
};

/**
 * @param {string} reviewId
 */
export const deleteReview = async (reviewId) => {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
};
