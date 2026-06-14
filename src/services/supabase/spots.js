import { supabase } from './client.js';

/**
 * @param {{ page?: number, pageSize?: number, type?: string, difficulty?: string, continent?: string, search?: string, countries?: string[] }} opts
 */
export const fetchSpots = async ({
  page = 1,
  pageSize = 20,
  type,
  difficulty,
  continent,
  search,
  countries = [],
} = {}) => {
  let q = supabase.from('spots').select('*', { count: 'exact' });

  if (type && type !== 'ALL')       q = q.eq('type', type);
  if (difficulty && difficulty !== 'ALL') q = q.eq('difficulty', difficulty);
  if (search)                       q = q.ilike('name', `%${search}%`);
  if (countries.length > 0)         q = q.in('country', countries);

  if (continent && continent !== 'ALL') {
    const { ALL_COUNTRIES } = await import('../../data.js');
    const codes = Object.entries(ALL_COUNTRIES)
      .filter(([, v]) => v.continent === continent)
      .map(([k]) => k);
    if (codes.length > 0) q = q.in('country', codes);
  }

  const from = (page - 1) * pageSize;
  q = q.range(from, from + pageSize - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
};

/**
 * @param {number|string} id
 */
export const fetchSpotById = async (id) => {
  const { data, error } = await supabase.from('spots').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

/**
 * @param {Partial<import('../../types/index.js').Spot>} spot
 * @param {string} userId
 */
export const addSpot = async (spot, userId) => {
  const { data, error } = await supabase.from('spots').insert({
    ...spot,
    created_by: userId,
    created_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
};
