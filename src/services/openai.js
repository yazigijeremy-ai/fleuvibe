import { DistributedCache, rateLimiters } from '../utils/cache.js';
import { logger } from '../utils/analytics.js';

const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const aiCache    = new DistributedCache();

/**
 * Core OpenAI call with caching and rate limiting.
 * @param {Array<{role:string,content:string}>} messages
 * @param {number} [maxTokens=200]
 * @returns {Promise<string|null>}
 */
export const callAI = async (messages, maxTokens = 200) => {
  const key    = JSON.stringify(messages);
  const cached = aiCache.get(key);
  if (cached) return cached;

  const rl = rateLimiters.ai.check('global');
  if (!rl.allowed) { logger.warn('AI rate limit', { reason: rl.reason }); return null; }

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: maxTokens, temperature: 0.7 }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const content = d.choices[0].message.content.trim();
    aiCache.set(key, content, 3_600_000);
    logger.metric('ai_call', 1, { tokens: maxTokens });
    return content;
  } catch (e) { logger.error('AI call failed', e); return null; }
};

/** @param {import('../types/index.js').Spot} spot */
export const generateDescription = (spot) =>
  callAI([{ role: 'user', content: `Génère une description courte et inspirante (2-3 phrases) pour ce spot nautique:\nNom: ${spot.name}, Plan d'eau: ${spot.river}, Pays: ${spot.country}, Région: ${spot.region}\nDifficulté: ${spot.difficulty}, Activités: ${spot.activities.join(', ')}\nStyle: évocateur, aventurier. En français.` }], 150);

/** @param {string} query */
export const semanticSearch = async (query) => {
  const result = await callAI([{ role: 'user', content: `Analyse cette requête: "${query}"\nExtrais les filtres nautiques: type (RIVER/LAKE/SEA), difficulty (Facile/Intermédiaire/Sportif), countries (codes ISO), activities.\nRéponds UNIQUEMENT en JSON valide: {"type":null,"difficulty":null,"countries":[],"activities":[]}\nSi non mentionné, mets null ou [].` }], 100);
  try { return JSON.parse(result); } catch { return {}; }
};

/**
 * @param {import('../types/index.js').Weather} weather
 * @param {string} spotName
 * @param {string} difficulty
 */
export const getWeatherAdvice = (weather, spotName, difficulty) =>
  callAI([{ role: 'user', content: `Conseil météo pour "${spotName}" (difficulté ${difficulty}):\n${weather.temp}°C, vent ${weather.windKmh} km/h, pluie ${weather.rain} mm/h, ${weather.desc}\n2 phrases max, conseils pratiques en français.` }], 100);

/** @param {string} spotName */
export const generateReviewSuggestion = (spotName) =>
  callAI([{ role: 'user', content: `Génère un avis naturel pour le spot nautique "${spotName}". Style: enthousiaste, utile. 2 phrases max en français.` }], 80);

/** @param {import('../types/index.js').Review[]} reviews */
export const summarizeReviews = (reviews) =>
  callAI([{ role: 'user', content: `Résume ces avis en 2 phrases (points positifs, négatifs):\n${reviews.map(r => `${r.rating}/5: ${r.comment}`).join('\n')}\nEn français, concis.` }], 100);

/**
 * @param {import('../types/index.js').Spot} currentSpot
 * @param {import('../types/index.js').Spot[]} similarSpots
 */
export const getRecommendations = (currentSpot, similarSpots) =>
  callAI([{ role: 'user', content: `Un kayakiste a aimé "${currentSpot.name}" (${currentSpot.difficulty}, ${currentSpot.type}).\nRecommande 2 spots parmi: ${similarSpots.map(s => s.name).join(', ')}.\n2-3 phrases inspirantes en français.` }], 120);

/** @param {{ name: string, distance: string, difficulty: string }} route */
export const generateExpeditionChecklist = (route) =>
  callAI([{ role: 'user', content: `Génère une checklist d'expédition pour ${route.name} (${route.distance}, ${route.difficulty}). Inclus équipement nautique, camping, sécurité. Format: liste courte à puces en français.` }], 200);

/**
 * @param {string} text
 * @param {'en'|'es'|'de'} lang
 */
export const translateText = (text, lang) =>
  callAI([{ role: 'user', content: `Traduis ce texte en ${lang === 'en' ? 'anglais' : lang === 'es' ? 'espagnol' : 'allemand'}: "${text}"\nRéponds uniquement avec la traduction.` }], 100);
