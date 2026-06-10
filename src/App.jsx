import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ALL_COUNTRIES as COUNTRIES_EXT, GLOBAL_PARTNERS, WORLD_ROUTES, GlobalStats } from "./data";
import { GLOBAL_SPOTS_FLAT } from "./spots";
import { stripeManager, calcBookingPrice } from "./stripe";
import { partnershipManager, PARTNERSHIP_TIERS } from "./partnership";
import { PREMIUM_PLANS as PLANS_V9, DynamicPricing, LoyaltyProgram, AffiliateProgram, getRelevantAd } from "./monetization";
import SpotImage from "./components/SpotImage";
import HeroSection from "./components/HeroSection";
import ProofBar from "./components/ProofBar";
import ProblemSection from "./components/ProblemSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FeaturesSection from "./components/FeaturesSection";
import TestimonialsSection from "./components/TestimonialsSection";
import PricingSection from "./components/PricingSection";
import FinalCTASection from "./components/FinalCTASection";

const SUPABASE_URL = "https://mdfzrqehdhvvhrqvinpo.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const STRIPE_MONTHLY_URL = import.meta.env.VITE_STRIPE_MONTHLY_URL || null;
const STRIPE_ANNUAL_URL = import.meta.env.VITE_STRIPE_ANNUAL_URL || null;

// ─── OPENAI ───────────────────────────────────────────────────────────────────
// aiCache initialisé après DistributedCache (voir plus bas)
let aiCache;
const callAI = async (messages, maxTokens = 200) => {
  const key = JSON.stringify(messages);
  const cached = aiCache.get(key);
  if (cached) return cached;
  const rl = rateLimiters.ai.check('global');
  if (!rl.allowed) { logger.warn('AI rate limit', { reason: rl.reason }); return null; }
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: maxTokens, temperature: 0.7 }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const content = d.choices[0].message.content.trim();
    aiCache.set(key, content, 3600000);
    logger.metric('ai_call', 1, { tokens: maxTokens });
    return content;
  } catch (e) { logger.error("AI call failed", e); return null; }
};

const generateDescription = (spot) => callAI([{ role: "user", content: `Génère une description courte et inspirante (2-3 phrases) pour ce spot nautique:\nNom: ${spot.name}, Plan d'eau: ${spot.river}, Pays: ${COUNTRIES[spot.country]?.name}, Région: ${spot.region}\nDifficulté: ${spot.difficulty}, Activités: ${spot.activities.join(", ")}\nStyle: évocateur, aventurier. En français.` }], 150);

const semanticSearch = async (query) => {
  const result = await callAI([{ role: "user", content: `Analyse cette requête: "${query}"\nExtrais les filtres nautiques: type (RIVER/LAKE/SEA), difficulty (Facile/Intermédiaire/Sportif), countries (codes ISO), activities.\nRéponds UNIQUEMENT en JSON valide: {"type":null,"difficulty":null,"countries":[],"activities":[]}\nSi non mentionné, mets null ou [].` }], 100);
  try { return JSON.parse(result); } catch { return {}; }
};

const getWeatherAdvice = (weather, spotName, difficulty) => callAI([{ role: "user", content: `Conseil météo pour "${spotName}" (difficulté ${difficulty}):\n${weather.temp}°C, vent ${weather.windKmh} km/h, pluie ${weather.rain} mm/h, ${weather.desc}\n2 phrases max, conseils pratiques en français.` }], 100);

const generateReviewSuggestion = (spotName) => callAI([{ role: "user", content: `Génère un avis naturel pour le spot nautique "${spotName}". Style: enthousiaste, utile. 2 phrases max en français.` }], 80);

const summarizeReviews = (reviews) => callAI([{ role: "user", content: `Résume ces avis en 2 phrases (points positifs, négatifs):\n${reviews.map(r => `${r.rating}/5: ${r.comment}`).join("\n")}\nEn français, concis.` }], 100);

const getRecommendations = (currentSpot, similarSpots) => callAI([{ role: "user", content: `Un kayakiste a aimé "${currentSpot.name}" (${currentSpot.difficulty}, ${currentSpot.type}).\nRecommande 2 spots parmi: ${similarSpots.map(s => s.name).join(", ")}.\n2-3 phrases inspirantes en français.` }], 120);

const generateExpeditionChecklist = (route) => callAI([{ role: "user", content: `Génère une checklist d'expédition pour ${route.name} (${route.distance}, ${route.difficulty}). Inclus équipement nautique, camping, sécurité. Format: liste courte à puces en français.` }], 200);

const translateText = (text, lang) => callAI([{ role: "user", content: `Traduis ce texte en ${lang === "en" ? "anglais" : lang === "es" ? "espagnol" : "allemand"}: "${text}"\nRéponds uniquement avec la traduction.` }], 100);

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── SÉCURITÉ & VALIDATION ────────────────────────────────────────────────────
const sanitizeHTML = (input) => {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/['";\\<>]/g, '').trim().slice(0, 2000);
};

const getContrastColor = (bgColor) => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 0.5 ? '#000000' : '#FFFFFF';
};

// Schémas Zod
const SpotSubmitSchema = z.object({
  name: z.string().min(3, 'Nom trop court (min 3 caractères)').max(100),
  river: z.string().min(1, 'Plan d\'eau requis'),
  type: z.enum(['RIVER', 'LAKE', 'SEA']),
  difficulty: z.enum(['Facile', 'Intermédiaire', 'Sportif']),
  description: z.string().max(1000).optional(),
  coords: z.string().regex(/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/, 'Format: lat, lon (ex: 50.185, 5.002)').or(z.literal('')),
  activities: z.array(z.string()).min(1, 'Sélectionne au moins une activité'),
});

const validateSpot = (data) => {
  const result = SpotSubmitSchema.safeParse(data);
  if (result.success) return { valid: true, errors: {} };
  const errors = {};
  result.error.errors.forEach(e => { errors[e.path[0]] = e.message; });
  return { valid: false, errors };
};

// Rate Limiter
class RateLimiter {
  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
    this.blocked = new Map();
  }
  check(userId = 'anon') {
    if (this.blocked.has(userId) && Date.now() < this.blocked.get(userId)) {
      return { allowed: false, reason: 'Trop de requêtes. Réessaie dans quelques secondes.', retryAfter: this.blocked.get(userId) - Date.now() };
    }
    const now = Date.now();
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

const rateLimiters = {
  ai: new RateLimiter(20, 60000),      // 20 appels IA/minute
  auth: new RateLimiter(10, 60000),    // 10 tentatives auth/minute
  review: new RateLimiter(10, 60000),  // 10 avis/minute
};

// Logger unifié (console + analytics)
const logger = {
  info: (msg, ctx = {}) => { console.info(`[FleuVibe] ${msg}`, ctx); trackEvent('log_info', { msg, ...ctx }); },
  error: (msg, err, ctx = {}) => { console.error(`[FleuVibe] ${msg}`, err, ctx); trackEvent('log_error', { msg, error: err?.message }); },
  warn: (msg, ctx = {}) => { console.warn(`[FleuVibe] ${msg}`, ctx); },
  metric: (name, value, tags = {}) => { trackEvent(`metric_${name}`, { value, ...tags }); window._gtag?.('event', name, { value, ...tags }); },
};

// Cache distribué (remplace aiCache)
class DistributedCache {
  constructor() { this.mem = new Map(); }
  get(key) {
    const item = this.mem.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) { this.mem.delete(key); return null; }
    return item.data;
  }
  set(key, data, ttl = 3600000) {
    this.mem.set(key, { data, expiry: Date.now() + ttl });
    setTimeout(() => this.mem.delete(key), ttl);
  }
  clear() { this.mem.clear(); }
}
aiCache = new DistributedCache();

// Schema.org pour SEO
const generateSchemaOrg = (spot) => ({
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": spot.name,
  "description": sanitizeHTML(spot.description),
  "address": { "@type": "PostalAddress", "addressCountry": spot.country },
  "geo": { "@type": "GeoCoordinates", "latitude": spot.coords[0], "longitude": spot.coords[1] },
  "potentialAction": { "@type": "ExploreAction", "name": "Découvrir le spot" }
});

// ─── INDEXEDDB OFFLINE ────────────────────────────────────────────────────────
const idb = {
  _open: () => new Promise((res, rej) => {
    const req = indexedDB.open('fleuvibe_v1', 1);
    req.onupgradeneeded = e => { try { e.target.result.createObjectStore('kv'); } catch {} };
    req.onsuccess = e => res(e.target.result);
    req.onerror = () => rej();
  }),
  async get(key) {
    try { const db = await this._open(); return new Promise(res => { const r = db.transaction('kv','readonly').objectStore('kv').get(key); r.onsuccess = () => res(r.result ?? null); r.onerror = () => res(null); }); } catch { return null; }
  },
  async set(key, val) {
    try { const db = await this._open(); return new Promise(res => { const tx = db.transaction('kv','readwrite'); tx.objectStore('kv').put(val, key); tx.oncomplete = res; tx.onerror = res; }); } catch {}
  },
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
const trackEvent = (event, data = {}) => {
  try {
    const events = JSON.parse(localStorage.getItem('fv_analytics') || '[]');
    events.push({ event, ...data, t: Date.now() });
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem('fv_analytics', JSON.stringify(events));
  } catch {}
};

// ─── WEATHER ──────────────────────────────────────────────────────────────────
const getWeather = async (lat, lon) => {
  try {
    const d = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&lang=fr`)).json();
    if (d.cod !== 200) return null;
    const w = Math.round(d.wind.speed * 3.6), r = d.rain?.["1h"] || 0, c = d.weather[0].main;
    let s = "good", l = "Conditions idéales", col = "#1a9e6e";
    if (w > 40 || r > 5) { s = "bad"; l = "Déconseillé"; col = "#dc2626"; }
    else if (w > 25 || r > 2 || c === "Thunderstorm") { s = "med"; l = "Difficile"; col = "#f59e0b"; }
    else if (c === "Rain" || c === "Drizzle") { s = "med"; l = "Prudence"; col = "#f59e0b"; }
    const icon = { Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Drizzle: "🌦️", Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️" }[c] || "🌤️";
    return { temp: Math.round(d.main.temp), desc: d.weather[0].description, windKmh: w, rain: r, icon, s, l, col };
  } catch { return null; }
};

// ─── LEVELS & GAMIFICATION ────────────────────────────────────────────────────
const LEVELS = [
  { name: "Moussaillon", minXP: 0, icon: "🪣", color: "#6b7280" },
  { name: "Pagayeur", minXP: 100, icon: "🛶", color: "#3b82f6" },
  { name: "Navigateur", minXP: 500, icon: "🚣", color: "#10b981" },
  { name: "Explorateur", minXP: 1500, icon: "🗺️", color: "#f59e0b" },
  { name: "Légende", minXP: 5000, icon: "🏆", color: "#ef4444" },
];

const BADGES_DEF = {
  firstSpot: { name: "Première vague", icon: "🌊", condition: (s) => s.totalSpotsVisited >= 1 },
  globeTrotter: { name: "Globe-trotter", icon: "🌍", condition: (s) => s.countriesVisited >= 5 },
  reviewer: { name: "Critique", icon: "✍️", condition: (s) => s.totalReviews >= 3 },
  community: { name: "Ambassadeur", icon: "🤝", condition: (s) => s.spotsAdded >= 1 },
  expedition: { name: "Grand voyageur", icon: "⛺", condition: (s) => s.longExpeditions >= 1 },
};

// ─── LEGAL INFO ───────────────────────────────────────────────────────────────
const LEGAL_INFO = {
  FR: { license: "Aucune pour kayak de loisir", minAge: 14, emergency: "15 / 18 / 112", rules: "Gilet obligatoire, balisage des itinéraires" },
  BE: { license: "Aucune pour kayak -500m des côtes", minAge: 12, emergency: "112", rules: "VHF recommandé sur la Meuse, respecter les zones" },
  US: { license: "Varies by state", minAge: 16, emergency: "911", rules: "Life jacket mandatory under 13, no alcohol" },
  CH: { license: "Permis bateau si moteur", minAge: 10, emergency: "117 / 144", rules: "Gilet obligatoire, respecter les zones de baignade" },
  NO: { license: "Aucune pour kayak", minAge: 0, emergency: "112", rules: "Toujours informer quelqu'un de votre itinéraire" },
  PT: { license: "Aucune pour kayak côtier", minAge: 12, emergency: "112", rules: "Gilet obligatoire, VHF recommandé en mer" },
  default: { license: "Vérifier sur place", minAge: 12, emergency: "112", rules: "Renseignez-vous auprès des autorités locales" },
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CONTINENTS = {
  ALL: { name: "Monde entier", flag: "🌍" }, EU: { name: "Europe", flag: "🇪🇺" }, AM: { name: "Amériques", flag: "🌎" },
  AS: { name: "Asie", flag: "🌏" }, AF: { name: "Afrique", flag: "🌍" }, OC: { name: "Océanie", flag: "🌊" }
};

const COUNTRIES = COUNTRIES_EXT;

const DIFF_COLOR = { Facile: "#1a9e6e", Intermédiaire: "#f59e0b", Sportif: "#dc2626" };

// ─── CHALLENGES ───────────────────────────────────────────────────────────────
const CHALLENGES = [
  { id: 1, name: "Légende des rivières", desc: "Explorez 10 rivières différentes", goal: 10, unit: "rivières", icon: "🏞️", reward: { badge: "🏆 Légende", xp: 1000 }, progress: (stats) => stats.totalSpotsVisited || 0 },
  { id: 2, name: "Globe-trotter aquatique", desc: "Visitez 5 pays différents", goal: 5, unit: "pays", icon: "🌍", reward: { badge: "🌍 Globe-trotter", xp: 1500 }, progress: (stats) => stats.countriesVisited || 0 },
  { id: 3, name: "Critique chevronné", desc: "Postez 10 avis", goal: 10, unit: "avis", icon: "✍️", reward: { badge: "✍️ Critique Pro", xp: 500 }, progress: (stats) => stats.totalReviews || 0 },
  { id: 4, name: "Ambassadeur FleuVibe", desc: "Ajoutez 3 spots communautaires", goal: 3, unit: "spots", icon: "🤝", reward: { badge: "🤝 Ambassadeur", xp: 800 }, progress: (stats) => stats.spotsAdded || 0 },
  { id: 5, name: "Grand Explorateur", desc: "Accumulez 2000 XP", goal: 2000, unit: "XP", icon: "⭐", reward: { badge: "⭐ Explorateur Légendaire", xp: 2000 }, progress: (_, xp) => xp || 0 },
];

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  ocean:    { name: "Océan",    primary: "#1a9e6e", secondary: "#0891b2", bg: "radial-gradient(ellipse at 20% 0%,#0a1628 0%,#0d2240 50%,#0a3d2e 100%)" },
  sunset:   { name: "Coucher", primary: "#f59e0b", secondary: "#ef4444", bg: "radial-gradient(ellipse at 20% 0%,#1a0a05 0%,#2d1608 50%,#1a0a0a 100%)" },
  forest:   { name: "Forêt",   primary: "#10b981", secondary: "#059669", bg: "radial-gradient(ellipse at 20% 0%,#051a0a 0%,#0a2d1a 50%,#051a0f 100%)" },
  aurora:   { name: "Aurore",  primary: "#8b5cf6", secondary: "#ec4899", bg: "radial-gradient(ellipse at 20% 0%,#0f0a1a 0%,#1a0a2d 50%,#1a0a15 100%)" },
  midnight: { name: "Nuit",    primary: "#6366f1", secondary: "#4f46e5", bg: "radial-gradient(ellipse at 20% 0%,#06060f 0%,#0a0a1e 50%,#06060f 100%)" },
};

const SPONSORED = [
  { id: "s1", name: "Ardennes Belges", flag: "🇧🇪", color: "#1a9e6e", badge: "Partenaire Officiel", desc: "450 km de rivières navigables en Wallonie." },
  { id: "s2", name: "Ardèche Tourisme", flag: "🇫🇷", color: "#dc2626", badge: "Région Spotlight", desc: "Les gorges de l'Ardèche, joyau naturel classé." },
  { id: "s3", name: "Visit Slovenia", flag: "🇸🇮", color: "#10b981", badge: "Coup de Cœur", desc: "La Soča aux eaux émeraude." },
  { id: "s4", name: "Lac d'Annecy", flag: "🇫🇷", color: "#0891b2", badge: "Lac Partenaire", desc: "Le lac le plus pur d'Europe." },
  { id: "s5", name: "Algarve Tourism", flag: "🇵🇹", color: "#7c3aed", badge: "Côte Partenaire", desc: "Paradis du kayak de mer." },
];

const HIDDEN_GEMS = [
  { id: 1001, name: "Petite Lesse Sauvage", country: "BE", region: "Ardennes", difficulty: "Intermédiaire", coords: [50.150, 5.080], season: "mai–oct", secret: "Entrée par chemin forestier à 2km du village. Aucun touriste.", emoji: "💎", type: "RIVER", activities: ["Kayak", "Camping"], description: "Un trésor caché des Ardennes, loin de toute foule." },
  { id: 1002, name: "Gorge Secrète de l'Allier", country: "FR", region: "Auvergne", difficulty: "Sportif", coords: [45.100, 3.400], season: "avr–sept", secret: "Accessible uniquement à pied 3km. Rapides classe III non cartographiés.", emoji: "🏔️", type: "RIVER", activities: ["Kayak", "Rafting"], description: "Les gorges les plus sauvages du Massif Central, inconnues des guides." },
  { id: 1003, name: "Lac Volcanique Vert", country: "IS", region: "Highlands", difficulty: "Facile", coords: [64.600, -19.000], season: "juil–août", secret: "GPS uniquement. Route F26 4x4 obligatoire. Eaux à 18°C en été.", emoji: "🌋", type: "LAKE", activities: ["Kayak", "SUP", "Baignade"], description: "Un lac volcanique émeraude au cœur des Highlands islandais, impossible à trouver sans coordonnées." },
];

const PROVIDERS = [
  { id: "p1", name: "Kayaks de Lesse", type: "Location", country: "BE", region: "Wallonie", river: "Lesse", description: "Location kayak et canoë sur la Lesse. Navettes incluses.", price: 25, currency: "€", priceLabel: "/ pers.", rating: 4.8, reviews: 234, activities: ["Kayak", "Canoë"], available: true, emoji: "🛶", badges: ["Top Prestataire"], commission: 12, routeIds: [1], inclut: ["Kayak", "Gilet", "Pagaie", "Navette"], eco: true },
  { id: "p2", name: "Ardèche Aventures", type: "Guide", country: "FR", region: "Ardèche", river: "Ardèche", description: "Guides certifiés pour les gorges de l'Ardèche.", price: 89, currency: "€", priceLabel: "/ pers. 2j", rating: 4.9, reviews: 412, activities: ["Kayak", "Camping"], available: true, emoji: "🌉", badges: ["N°1 Ardèche"], commission: 15, routeIds: [6], inclut: ["Guide", "Équipement", "Repas", "Camping"], eco: true },
  { id: "p3", name: "Annecy SUP & Kayak", type: "Location", country: "FR", region: "Haute-Savoie", river: "Lac d'Annecy", description: "Location SUP, kayak sur le lac d'Annecy.", price: 18, currency: "€", priceLabel: "/ heure", rating: 4.8, reviews: 312, activities: ["SUP", "Kayak"], available: true, emoji: "🏔️", badges: ["Lac Premium"], commission: 12, routeIds: [10], inclut: ["SUP/Kayak", "Gilet", "Pagaie"], eco: true },
];

const SPOTS = [
  { id: 1, type: "RIVER", country: "BE", name: "Lesse · Houyet → Anseremme", river: "Lesse", region: "Wallonie", distance: "21 km", duration: "4–5h", difficulty: "Facile", activities: ["Kayak", "Canoë"], description: "Le parcours emblématique de Belgique, entre falaises calcaires et forêts denses.", color: "#1a9e6e", emoji: "🏞️", open: true, coords: [50.185, 5.002], sponsored: "Ardennes Belges", camping: true, waterPoints: true, emergencyContact: "112" },
  { id: 2, type: "RIVER", country: "BE", name: "Ourthe · La Roche → Hotton", river: "Ourthe", region: "Wallonie", distance: "18 km", duration: "3–4h", difficulty: "Intermédiaire", activities: ["Kayak", "Rafting"], description: "Méandres spectaculaires avec quelques rapides dans les Ardennes.", color: "#2563eb", emoji: "🌊", open: true, coords: [50.218, 5.578], camping: false, waterPoints: true },
  { id: 3, type: "RIVER", country: "BE", name: "Semois · Bouillon → Alle", river: "Semois", region: "Gaume", distance: "34 km", duration: "2 jours", difficulty: "Intermédiaire", activities: ["Kayak", "Camping"], description: "Immersion totale dans la nature gaumaise avec nuit en camping.", color: "#7c3aed", emoji: "⛺", open: true, coords: [49.870, 5.060], camping: true, waterPoints: true },
  { id: 4, type: "RIVER", country: "BE", name: "Meuse · Namur → Dinant", river: "Meuse", region: "Wallonie", distance: "30 km", duration: "1 journée", difficulty: "Facile", activities: ["Canoë", "Kayak"], description: "Longer la Meuse entre citadelles médiévales et villages pittoresques.", color: "#0891b2", emoji: "🏰", open: true, coords: [50.362, 4.860], sponsored: "Ardennes Belges", camping: false, waterPoints: true },
  { id: 5, type: "LAKE", country: "BE", name: "Lacs de l'Eau d'Heure", river: "Eau d'Heure", region: "Namur", distance: "15 km", duration: "3h", difficulty: "Facile", activities: ["Kayak", "SUP", "Voile", "Baignade"], description: "Le plus grand lac artificiel de Belgique. Parfait pour toutes les activités nautiques.", color: "#06b6d4", emoji: "🏖️", open: true, coords: [50.188, 4.558], camping: false, waterPoints: true },
  { id: 6, type: "RIVER", country: "FR", name: "Ardèche · Vallon-Pont-d'Arc", river: "Ardèche", region: "Ardèche", distance: "30 km", duration: "2 jours", difficulty: "Intermédiaire", activities: ["Kayak", "Canoë", "Camping"], description: "Le parcours mythique de France. Gorges sous le Pont d'Arc.", color: "#dc2626", emoji: "🌉", open: true, coords: [44.400, 4.390], sponsored: "Ardèche Tourisme", camping: true, waterPoints: true },
  { id: 7, type: "RIVER", country: "FR", name: "Verdon · Gorges", river: "Verdon", region: "PACA", distance: "22 km", duration: "2 jours", difficulty: "Sportif", activities: ["Kayak", "Rafting"], description: "Le Grand Canyon européen. Eaux turquoise et falaises à pic de 700m.", color: "#06b6d4", emoji: "💎", open: true, coords: [43.760, 6.340], camping: true, waterPoints: false },
  { id: 8, type: "RIVER", country: "FR", name: "Dordogne · Argentat", river: "Dordogne", region: "Corrèze", distance: "28 km", duration: "1 journée", difficulty: "Intermédiaire", activities: ["Kayak", "Canoë"], description: "Les gorges de la Dordogne entre falaises et villages médiévaux.", color: "#f97316", emoji: "🦅", open: true, coords: [45.090, 1.940], camping: false, waterPoints: true },
  { id: 9, type: "RIVER", country: "FR", name: "Loire · Amboise → Tours", river: "Loire", region: "Indre-et-Loire", distance: "26 km", duration: "5h", difficulty: "Facile", activities: ["Kayak", "Canoë", "SUP"], description: "Glisser sur la Loire au fil des châteaux Renaissance UNESCO.", color: "#f59e0b", emoji: "👑", open: true, coords: [47.370, 0.820], camping: false, waterPoints: true },
  { id: 10, type: "LAKE", country: "FR", name: "Lac d'Annecy · Tour complet", river: "Lac d'Annecy", region: "Haute-Savoie", distance: "35 km", duration: "1 journée", difficulty: "Facile", activities: ["Kayak", "SUP", "Voile", "Baignade"], description: "Le lac le plus pur d'Europe entouré par les Alpes.", color: "#0891b2", emoji: "🏔️", open: true, coords: [45.866, 6.165], sponsored: "Lac d'Annecy", camping: false, waterPoints: true, popular: true },
  { id: 11, type: "RIVER", country: "SI", name: "Soča · Bovec → Tolmin", river: "Soča", region: "Primorska", distance: "55 km", duration: "2 jours", difficulty: "Intermédiaire", activities: ["Kayak", "Rafting", "SUP"], description: "La Soča aux eaux émeraude — l'une des plus belles rivières du monde.", color: "#10b981", emoji: "💚", open: true, coords: [46.240, 13.650], sponsored: "Visit Slovenia", camping: true, waterPoints: true, popular: true, unsplash_id: "1502920493886-4d3bfa1578d8" },
  { id: 12, type: "RIVER", country: "NO", name: "Sjoa · Åmot → Harpefoss", river: "Sjoa", region: "Innlandet", distance: "18 km", duration: "4h", difficulty: "Sportif", activities: ["Kayak", "Rafting"], description: "L'une des meilleures rivières de white-water en Europe.", color: "#dc2626", emoji: "🐺", open: true, coords: [61.680, 9.560], camping: true, waterPoints: true },
  { id: 13, type: "SEA", country: "NO", name: "Fjords de Norvège", river: "Sognefjord", region: "Vestland", distance: "50 km", duration: "3 jours", difficulty: "Intermédiaire", activities: ["Kayak", "Camping"], description: "Pagayer dans les fjords entre cascades et villages colorés.", color: "#1a9e6e", emoji: "🏔️", open: true, coords: [61.050, 6.850], camping: true, waterPoints: true },
  { id: 14, type: "RIVER", country: "DE", name: "Rhin · Vallée Romantique", river: "Rhin", region: "Rhénanie", distance: "65 km", duration: "3 jours", difficulty: "Intermédiaire", activities: ["Kayak", "Canoë"], description: "La vallée du Rhin romantique entre châteaux et vignobles UNESCO.", color: "#dc2626", emoji: "🏰", open: true, coords: [50.180, 7.620], camping: true, waterPoints: true },
  { id: 15, type: "LAKE", country: "CH", name: "Lac Léman · Lausanne", river: "Lac Léman", region: "Vaud", distance: "60 km", duration: "2 jours", difficulty: "Intermédiaire", activities: ["Kayak", "Voile", "SUP"], description: "Le plus grand lac d'Europe occidentale entre vignobles et Alpes.", color: "#2563eb", emoji: "🍇", open: true, coords: [46.500, 6.600], camping: false, waterPoints: true },
  { id: 16, type: "SEA", country: "HR", name: "Îles Dalmates · Croatie", river: "Mer Adriatique", region: "Dalmatie", distance: "40 km", duration: "3 jours", difficulty: "Intermédiaire", activities: ["Kayak", "Voile", "Plongée"], description: "Longer les îles dalmates en kayak. Criques secrètes et eau turquoise.", color: "#06b6d4", emoji: "⛵", open: true, coords: [43.508, 16.440], camping: true, waterPoints: true },
  { id: 17, type: "SEA", country: "PT", name: "Algarve · Grottes Marines", river: "Côte Algarve", region: "Algarve", distance: "15 km", duration: "3h", difficulty: "Facile", activities: ["Kayak", "Plongée", "Baignade", "SUP"], description: "Les grottes et arches naturelles de l'Algarve.", color: "#f59e0b", emoji: "🌊", open: true, coords: [37.085, -8.668], sponsored: "Algarve Tourism", camping: false, waterPoints: true, popular: true, unsplash_id: "1507525428034-b723cf961d3e" },
  { id: 18, type: "SEA", country: "GR", name: "Îles Ioniques · Grèce", river: "Mer Ionienne", region: "Îles Ioniennes", distance: "30 km", duration: "2 jours", difficulty: "Facile", activities: ["Kayak", "Plongée", "Baignade"], description: "Pagayer entre les îles grecques aux eaux cristallines.", color: "#2563eb", emoji: "🏛️", open: true, coords: [38.620, 20.630], camping: true, waterPoints: true },
  { id: 19, type: "LAKE", country: "IS", name: "Þingvallavatn · Islande", river: "Þingvallavatn", region: "Suðurland", distance: "12 km", duration: "3h", difficulty: "Facile", activities: ["Kayak", "Plongée", "SUP"], description: "Plongée dans les failles tectoniques entre deux continents.", color: "#7c3aed", emoji: "🌋", open: true, coords: [64.183, -21.117], camping: true, waterPoints: true },
  { id: 20, type: "RIVER", country: "US", name: "Colorado · Grand Canyon", river: "Colorado", region: "Arizona", distance: "360 km", duration: "14 jours", difficulty: "Sportif", activities: ["Rafting", "Kayak", "Camping"], description: "L'expédition ultime dans le Grand Canyon.", color: "#f97316", emoji: "🏜️", open: true, coords: [36.100, -112.100], camping: true, waterPoints: false },
  { id: 21, type: "SEA", country: "US", name: "Hawaï · Surf & Kayak", river: "Pacifique", region: "Hawaï", distance: "10 km", duration: "2h", difficulty: "Facile", activities: ["Surf", "Kayak", "SUP"], description: "Les vagues légendaires d'Hawaï.", color: "#f59e0b", emoji: "🌺", open: true, coords: [21.300, -157.800], camping: false, waterPoints: true },
  { id: 22, type: "RIVER", country: "CA", name: "Nahanni · Virginia Falls", river: "Nahanni", region: "Territoires NW", distance: "300 km", duration: "10 jours", difficulty: "Sportif", activities: ["Kayak", "Canoë", "Camping"], description: "Top 10 mondial. Chutes deux fois plus hautes que Niagara.", color: "#7c3aed", emoji: "🐻", open: true, coords: [61.600, -125.700], camping: true, waterPoints: true },
  { id: 23, type: "RIVER", country: "BR", name: "Amazone · Manaus", river: "Amazone", region: "Amazonas", distance: "150 km", duration: "5 jours", difficulty: "Facile", activities: ["Bateau électrique", "Canoë"], description: "S'enfoncer dans la jungle amazonienne depuis Manaus.", color: "#16a34a", emoji: "🦜", open: true, coords: [-3.100, -60.025], camping: true, waterPoints: true },
  { id: 24, type: "RIVER", country: "CO", name: "Caño Cristales · Arc-en-ciel", river: "Caño Cristales", region: "Meta", distance: "8 km", duration: "2h", difficulty: "Facile", activities: ["Kayak", "Baignade"], description: "La rivière aux 5 couleurs. La plus belle rivière du monde.", color: "#dc2626", emoji: "🌈", open: true, coords: [2.270, -73.780], camping: false, waterPoints: true },
  { id: 25, type: "RIVER", country: "CL", name: "Futaleufú · Patagonie", river: "Futaleufú", region: "Los Lagos", distance: "20 km", duration: "2 jours", difficulty: "Sportif", activities: ["Rafting", "Kayak"], description: "Top 5 mondial white water. Eaux turquoise en Patagonie.", color: "#06b6d4", emoji: "🏔️", open: true, coords: [-43.200, -71.860], camping: true, waterPoints: true },
  { id: 26, type: "SEA", country: "MX", name: "Riviera Maya · Cenotes", river: "Mer des Caraïbes", region: "Quintana Roo", distance: "8 km", duration: "2h", difficulty: "Facile", activities: ["Kayak", "Plongée", "Baignade"], description: "Explorer les cenotes et la mer des Caraïbes turquoise.", color: "#06b6d4", emoji: "🐠", open: true, coords: [20.630, -87.080], camping: false, waterPoints: true },
  { id: 27, type: "RIVER", country: "CR", name: "Pacuare · Costa Rica", river: "Río Pacuare", region: "Turrialba", distance: "28 km", duration: "2 jours", difficulty: "Intermédiaire", activities: ["Rafting", "Kayak", "Camping"], description: "Le meilleur rafting d'Amérique Centrale.", color: "#16a34a", emoji: "🐊", open: true, coords: [9.900, -83.680], camping: true, waterPoints: true },
  { id: 28, type: "RIVER", country: "NP", name: "Trisuli · Himalaya", river: "Trisuli", region: "Gandaki", distance: "50 km", duration: "2 jours", difficulty: "Intermédiaire", activities: ["Rafting", "Kayak"], description: "Rafting dans l'Himalaya depuis Katmandou.", color: "#dc2626", emoji: "🏔️", open: true, coords: [27.800, 84.400], camping: true, waterPoints: true },
  { id: 29, type: "SEA", country: "VN", name: "Baie d'Halong · Kayak", river: "Baie d'Halong", region: "Quảng Ninh", distance: "10 km", duration: "2h", difficulty: "Facile", activities: ["Kayak", "SUP"], description: "Explorer les grottes secrètes de la Baie d'Halong.", color: "#10b981", emoji: "🌅", open: true, coords: [20.910, 107.184], camping: false, waterPoints: true },
  { id: 30, type: "SEA", country: "ID", name: "Bali · Surf & SUP", river: "Océan Indien", region: "Bali", distance: "10 km", duration: "2h", difficulty: "Intermédiaire", activities: ["Surf", "SUP", "Plongée"], description: "Les vagues légendaires de Bali pour surfeurs et paddlers.", color: "#f97316", emoji: "🏄", open: true, coords: [-8.409, 115.188], camping: false, waterPoints: true },
  { id: 31, type: "SEA", country: "PH", name: "El Nido · Palawan", river: "Mer de Chine", region: "Palawan", distance: "20 km", duration: "1 journée", difficulty: "Facile", activities: ["Kayak", "Plongée", "Baignade"], description: "Les lagons cachés de Palawan. Eaux cristallines.", color: "#06b6d4", emoji: "🏝️", open: true, coords: [11.177, 119.388], camping: true, waterPoints: true },
  { id: 32, type: "RIVER", country: "IN", name: "Gange · Rishikesh Rafting", river: "Gange", region: "Uttarakhand", distance: "16 km", duration: "3h", difficulty: "Intermédiaire", activities: ["Rafting", "Kayak"], description: "Rafting sacré sur le Gange à Rishikesh.", color: "#f59e0b", emoji: "🕉️", open: true, coords: [30.086, 78.296], camping: false, waterPoints: true },
  { id: 33, type: "RIVER", country: "ZM", name: "Zambèze · Chutes Victoria", river: "Zambèze", region: "Livingstone", distance: "70 km", duration: "3 jours", difficulty: "Sportif", activities: ["Rafting", "Kayak", "Camping"], description: "Rafting sous les embruns des Chutes Victoria.", color: "#f97316", emoji: "🦁", open: true, coords: [-17.930, 25.856], camping: true, waterPoints: true },
  { id: 34, type: "SEA", country: "MA", name: "Essaouira · Kitesurf", river: "Atlantique", region: "Marrakech-Safi", distance: "10 km", duration: "2h", difficulty: "Intermédiaire", activities: ["Kitesurf", "Surf", "SUP"], description: "La capitale mondiale du kitesurf. Alizés constants.", color: "#f59e0b", emoji: "🪁", open: true, coords: [31.512, -9.770], camping: false, waterPoints: true },
  { id: 35, type: "SEA", country: "ZA", name: "Cape Town · Kayak Baleines", river: "Atlantique", region: "Western Cape", distance: "12 km", duration: "3h", difficulty: "Facile", activities: ["Kayak", "Plongée", "Baignade"], description: "Kayak avec pingouins et baleines. Table Mountain en fond.", color: "#7c3aed", emoji: "🐋", open: true, coords: [-34.357, 18.474], camping: false, waterPoints: true },
  { id: 36, type: "SEA", country: "AU", name: "Great Barrier Reef", river: "Mer de Corail", region: "Queensland", distance: "20 km", duration: "1 journée", difficulty: "Facile", activities: ["Kayak", "Plongée", "SUP"], description: "Pagayer au-dessus de la plus grande barrière de corail.", color: "#10b981", emoji: "🐢", open: true, coords: [-18.286, 147.699], camping: false, waterPoints: true },
  { id: 37, type: "RIVER", country: "NZ", name: "Whanganui · Great Journey", river: "Whanganui", region: "Manawatū", distance: "145 km", duration: "5 jours", difficulty: "Facile", activities: ["Canoë", "Kayak", "Camping"], description: "L'une des Great Walks de Nouvelle-Zélande sur l'eau.", color: "#16a34a", emoji: "🥝", open: true, coords: [-39.600, 174.800], camping: true, waterPoints: true },
  { id: 38, type: "SEA", country: "PF", name: "Bora Bora · SUP Lagon", river: "Pacifique", region: "Polynésie française", distance: "10 km", duration: "2h", difficulty: "Facile", activities: ["SUP", "Kayak", "Plongée"], description: "SUP dans le lagon de Bora Bora. Raies mantas et eau à 28°C.", color: "#7c3aed", emoji: "🌺", open: true, coords: [-16.500, -151.741], camping: false, waterPoints: true },
  { id: 39, type: "SEA", country: "FJ", name: "Fidji · Kayak Îles", river: "Pacifique", region: "Viti Levu", distance: "15 km", duration: "1 journée", difficulty: "Facile", activities: ["Kayak", "Plongée", "SUP"], description: "Pagayer entre les îles paradisiaques des Fidji.", color: "#06b6d4", emoji: "🌴", open: true, coords: [-17.713, 178.065], camping: true, waterPoints: true },
  { id: 40, type: "LAKE", country: "PE", name: "Lac Titicaca · Uros", river: "Lac Titicaca", region: "Puno", distance: "20 km", duration: "1 journée", difficulty: "Facile", activities: ["Kayak", "Bateau traditionnel"], description: "Le plus haut lac navigable du monde à 3800m.", color: "#0891b2", emoji: "🌄", open: true, coords: [-15.840, -69.330], camping: false, waterPoints: true },
];

const _dedupCoords = arr => {
  const seen = new Set();
  return arr.filter(s => {
    if (!s.coords) return true;
    const key = `${Math.round(s.coords[0] * 10)},${Math.round(s.coords[1] * 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const SPOTS_WORLD = _dedupCoords([...SPOTS, ...WORLD_ROUTES, ...GLOBAL_SPOTS_FLAT]);
const ALL_PROVIDERS = [...PROVIDERS, ...GLOBAL_PARTNERS];

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function StatCard({ title, value, icon, change }) {
  const positive = change?.startsWith('+');
  return (
    <div style={{ padding: "16px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", flex: "1 1 160px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <span style={{ fontSize: "1.4rem" }}>{icon}</span>
        {change && <span style={{ fontSize: "0.62rem", fontWeight: 700, color: positive ? "#10b981" : "#ef4444", background: positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", padding: "2px 7px", borderRadius: "20px" }}>{change}</span>}
      </div>
      <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#daf0e8", marginBottom: "2px" }}>{value}</div>
      <div style={{ fontSize: "0.68rem", color: "#4a7a6a" }}>{title}</div>
    </div>
  );
}

function RevenueChart({ data }) {
  const months = data || Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return { label: d.toLocaleString('fr-FR', { month: 'short' }), value: Math.floor(Math.random() * 8000 + 2000) };
  });
  const max = Math.max(...months.map(m => m.value));
  return (
    <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", marginBottom: "16px" }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a8edcf", marginBottom: "14px" }}>📈 Revenus mensuels</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
        {months.map(m => (
          <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "100%", height: `${(m.value / max) * 72}px`, background: "linear-gradient(180deg,#1a9e6e,#0891b2)", borderRadius: "4px 4px 0 0", minHeight: "4px" }} />
            <span style={{ fontSize: "0.55rem", color: "#4a7a6a" }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard({ session, spots, onClose }) {
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, totalRevenue: 0, activePartners: 0, pendingPayouts: 0, changes: {} });
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${session?.access_token || ''}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  const TABS = [["overview", "📊 Vue d'ensemble"], ["partners", "🤝 Partenaires"], ["spots", "🗺️ Spots"], ["ops", "⚙️ API"]];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)", zIndex: 1000, overflowY: "auto", padding: "20px 16px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#daf0e8", marginBottom: "2px" }}>🌍 Dashboard Global FleuVibe</h1>
            <p style={{ fontSize: "0.7rem", color: "#4a7a6a" }}>Mis à jour : {new Date().toLocaleString('fr-FR')}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a8edcf", padding: "7px 16px", borderRadius: "20px", fontSize: "0.75rem", cursor: "pointer" }}>✕ Fermer</button>
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: "6px 14px", borderRadius: "20px", border: `1px solid ${tab === key ? "rgba(26,158,110,0.5)" : "rgba(255,255,255,0.07)"}`, background: tab === key ? "rgba(26,158,110,0.15)" : "rgba(255,255,255,0.03)", color: tab === key ? "#a8edcf" : "#4a7a6a", fontSize: "0.72rem", fontWeight: tab === key ? 700 : 400, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
        {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#4a7a6a" }}>⏳ Chargement...</div> : tab === "overview" ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
              <StatCard title="Utilisateurs" value={stats.totalUsers} icon="👥" change={stats.changes?.users || '+0%'} />
              <StatCard title="Réservations" value={stats.totalBookings} icon="📅" change={stats.changes?.bookings || '+0%'} />
              <StatCard title="Revenus" value={`${stats.totalRevenue}€`} icon="💰" change={stats.changes?.revenue || '+0%'} />
              <StatCard title="Partenaires" value={stats.activePartners} icon="🤝" change={stats.changes?.partners || '+0%'} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
              <StatCard title="Avis" value={stats.totalReviews || 0} icon="✍️" change={null} />
              <StatCard title="Note moy." value={stats.avgRating || '—'} icon="⭐" change={null} />
              <StatCard title="Payouts en att." value={stats.pendingPayouts} icon="⏳" change={null} />
              <StatCard title="Spots live" value={spots.length} icon="🗺️" change={null} />
            </div>
            <RevenueChart />
          </>
        ) : tab === "partners" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontSize: "0.72rem", color: "#4a7a6a", marginBottom: "6px" }}>Partenaires actifs ({ALL_PROVIDERS.length})</p>
            {ALL_PROVIDERS.slice(0, 20).map(p => {
              const tier = partnershipManager.getTier(p.revenue || 0);
              const t = PARTNERSHIP_TIERS[tier];
              return (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.2rem" }}>{p.emoji || "🏢"}</span>
                    <div><div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#c8e8d8" }}>{p.name}</div><div style={{ fontSize: "0.62rem", color: "#4a7a6a" }}>{p.country} · {p.type}</div></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.65rem", padding: "2px 8px", background: t.bg, border: `1px solid ${t.color}40`, borderRadius: "20px", color: t.color }}>{t.badge} {t.label}</span>
                    <span style={{ fontSize: "0.72rem", color: "#f59e0b" }}>⭐ {p.rating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : tab === "spots" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontSize: "0.72rem", color: "#4a7a6a", marginBottom: "4px" }}>Total : {spots.length} spots dans {Object.keys(COUNTRIES).length} pays</p>
            {[["RIVER", "🏞️ Rivières", "#2563eb"], ["LAKE", "🏖️ Lacs", "#0891b2"], ["SEA", "🌊 Mer/Côtes", "#7c3aed"]].map(([type, label, col]) => {
              const count = spots.filter(s => s.type === type).length;
              const pct = Math.round((count / spots.length) * 100);
              return (
                <div key={type} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.78rem", color: "#c8e8d8", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: "0.72rem", color: "#a8edcf", fontWeight: 700 }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: "3px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <p style={{ fontSize: "0.72rem", color: "#4a7a6a", marginBottom: "4px" }}>Endpoints API disponibles</p>
            {[["GET", "/api/admin/stats", "Stats globales"], ["GET/POST", "/api/admin/partners", "Partenaires"], ["POST", "/api/admin/payouts/process", "Payouts"], ["GET", "/api/partner/dashboard", "Dashboard partenaire"], ["GET/POST", "/api/partner/bookings", "Réservations"], ["GET", "/api/public/spots", "Spots public"], ["POST", "/api/public/bookings", "Créer réservation"], ["POST", "/api/stripe/payment", "PaymentIntent"], ["POST", "/api/stripe/connect", "Onboarding"], ["POST", "/api/stripe/payout", "Payout"]].map(([method, path, desc]) => (
              <div key={path} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", background: method.includes('POST') ? "rgba(245,158,11,0.15)" : "rgba(26,158,110,0.15)", color: method.includes('POST') ? "#f59e0b" : "#1a9e6e", borderRadius: "6px", minWidth: "48px", textAlign: "center" }}>{method}</span>
                <span style={{ fontSize: "0.68rem", color: "#a8edcf", fontFamily: "monospace", flex: 1 }}>{path}</span>
                <span style={{ fontSize: "0.62rem", color: "#4a7a6a" }}>{desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PARTNER PORTAL ──────────────────────────────────────────────────────────
function PartnerPortal({ partner, onClose }) {
  const portal = partnershipManager.getPortal(partner);
  const { tier, tierData, nextTier, progress, stats, contract } = portal;
  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: `1px solid ${tierData.color}40`, borderRadius: "28px", padding: "26px", maxWidth: "500px", width: "100%", maxHeight: "88vh", overflowY: "auto", animation: "slideUp 0.3s ease", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "1.8rem" }}>{partner.emoji || "🏢"}</span>
              <div>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#daf0e8" }}>{partner.name}</h2>
                <p style={{ fontSize: "0.7rem", color: "#4a7a6a" }}>{partner.country} · {partner.type}</p>
              </div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 12px", background: tierData.bg, border: `1px solid ${tierData.color}50`, borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700, color: tierData.color }}>
              {tierData.badge} Partenaire {tierData.label} · {tierData.commission}% commission
            </span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#5a8a78", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "18px" }}>
          {[["📅", stats.bookings, "Réservations"], ["💰", `${stats.revenue}€`, "Revenus"], ["👁️", stats.views, "Vues"], ["⭐", stats.rating || partner.rating || "—", "Note"]].map(([ic, val, lbl]) => (
            <div key={lbl} style={{ padding: "10px 6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "0.9rem" }}>{ic}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#a8edcf" }}>{val}</div>
              <div style={{ fontSize: "0.55rem", color: "#4a7a6a", marginTop: "1px" }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Progression vers tier suivant */}
        {nextTier && (
          <div style={{ marginBottom: "18px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.72rem", color: "#6a9a8c", fontWeight: 600 }}>Prochain niveau : {nextTier.badge} {nextTier.label}</span>
              <span style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "5px" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg,${tierData.color},${nextTier.color})`, borderRadius: "3px", transition: "width 0.8s" }} />
            </div>
            <p style={{ fontSize: "0.62rem", color: "#4a7a6a" }}>Objectif : {nextTier.threshold.toLocaleString()}€ de revenus cumulés</p>
          </div>
        )}

        {/* Avantages */}
        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a8edcf", marginBottom: "8px" }}>Avantages inclus</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {tierData.benefits.map(b => (
              <span key={b} style={{ padding: "3px 10px", background: `${tierData.color}18`, border: `1px solid ${tierData.color}40`, borderRadius: "20px", fontSize: "0.66rem", color: tierData.color }}>✓ {b}</span>
            ))}
          </div>
        </div>

        {/* Contrat */}
        <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "16px" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6a9a8c", marginBottom: "8px" }}>Conditions du contrat</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
            {[["Paiement", contract.terms.paymentTerms], ["Annulation", contract.terms.cancellationPolicy], ["Exclusivité", contract.terms.exclusivity ? "Oui" : "Non"], ["Réservation min.", contract.terms.minimumBookings || "Aucune"]].map(([k, v]) => (
              <div key={k} style={{ fontSize: "0.65rem" }}>
                <span style={{ color: "#4a7a6a" }}>{k} : </span>
                <span style={{ color: "#a8edcf", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.62rem", color: "#4a7a6a", marginTop: "8px" }}>
            Contrat valide jusqu'au {new Date(contract.endDate).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* Tiers disponibles */}
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6a9a8c", marginBottom: "8px" }}>Tous les niveaux</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {Object.entries(PARTNERSHIP_TIERS).map(([key, t]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: tier === key ? t.bg : "rgba(255,255,255,0.02)", border: `1px solid ${tier === key ? t.color + "50" : "rgba(255,255,255,0.05)"}`, borderRadius: "10px" }}>
                <span style={{ fontSize: "0.7rem", color: tier === key ? t.color : "#5a8a78", fontWeight: tier === key ? 700 : 400 }}>{t.badge} {t.label} {tier === key ? "← actuel" : ""}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.65rem", color: "#4a7a6a" }}>{t.commission}% comm. · </span>
                  <span style={{ fontSize: "0.62rem", color: "#4a7a6a" }}>{t.threshold > 0 ? `dès ${t.threshold.toLocaleString()}€` : "Gratuit"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ACCESSIBILITÉ ────────────────────────────────────────────────────────────
function AccessibleButton({ children, onClick, ariaLabel, disabled, style, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}
      className={className}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); onClick?.(); } }}
    >
      {children}
    </button>
  );
}

// ─── MAP VIEW ─────────────────────────────────────────────────────────────────
function MapView({ spots, favorites, onFav, session, onShowAuth, onBook, isPremium, onShowPremium, userName }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mapType, setMapType] = useState("ALL");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current || typeof window.L === 'undefined') return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [20, 10], zoom: 2, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    instanceRef.current = map;
    setReady(true);
    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!instanceRef.current || !ready) return;
    const L = window.L;
    const map = instanceRef.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    const filtered = mapType === "ALL" ? spots : spots.filter(s => s.type === mapType);
    filtered.forEach(spot => {
      const col = { RIVER: '#2563eb', LAKE: '#0891b2', SEA: '#7c3aed' }[spot.type] || '#1a9e6e';
      const isFav = favorites.includes(spot.id);
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:38px;height:38px;background:${col}22;border:2px solid ${col};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 2px 10px ${col}55;cursor:pointer;transition:transform 0.2s;${isFav ? `outline:3px solid #ef444488;` : ''}">${spot.emoji}</div>`,
        iconSize: [38, 38], iconAnchor: [19, 19],
      });
      const marker = L.marker(spot.coords, { icon }).addTo(map);
      marker.bindTooltip(`<strong>${spot.name}</strong><br/><small>${spot.difficulty} · ${spot.distance}</small>`, { direction: 'top', offset: [0, -20] });
      marker.on('click', () => { setSelectedSpot(spot); trackEvent('map_spot_click', { spotId: spot.id, spotName: spot.name }); });
      markersRef.current.push(marker);
    });
  }, [spots, favorites, mapType, ready]);

  const diffColor = { Facile: '#10b981', Intermédiaire: '#f59e0b', Sportif: '#ef4444' };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2e28", marginBottom: "2px" }}>Carte des spots</h2>
          <p style={{ color: "#6a8a80", fontSize: "0.8rem" }}>{spots.length} spots · {Object.keys(COUNTRIES).length} pays</p>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {[["ALL", "Tous"], ["RIVER", "Rivières"], ["LAKE", "Lacs"], ["SEA", "Mer"]].map(([id, label]) => (
            <button key={id} onClick={() => setMapType(id)} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e0ece7", fontSize: "0.8rem", fontWeight: 600, background: mapType === id ? "#1a9e6e" : "#fff", color: mapType === id ? "#fff" : "#3a6a5e", cursor: "pointer", transition: "all 0.15s" }}>{label}</button>
          ))}
        </div>
      </div>
      <div ref={mapRef} style={{ height: "480px", borderRadius: "16px", overflow: "hidden", border: "1px solid #e0ece7", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }} />
      {!ready && typeof window.L === 'undefined' && (
        <div style={{ padding: "20px", textAlign: "center", color: "#5a8a78", fontSize: "0.8rem" }}>⏳ Chargement de la carte...</div>
      )}
      {selectedSpot && (
        <div style={{ padding: "20px", background: "#fff", border: "1px solid #e0ece7", borderRadius: "16px", animation: "slideUp 0.3s ease", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
            <span style={{ fontSize: "2rem", flexShrink: 0 }}>{selectedSpot.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2e28", marginBottom: "4px", lineHeight: 1.3 }}>{selectedSpot.name} <span style={{ fontWeight: 400, color: "#6a8a80" }}>{COUNTRIES[selectedSpot.country]?.flag}</span></h3>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.78rem", color: "#6a8a80" }}>{selectedSpot.region}</span>
                <span style={{ padding: "2px 8px", background: `${diffColor[selectedSpot.difficulty]}15`, border: `1px solid ${diffColor[selectedSpot.difficulty]}35`, borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, color: diffColor[selectedSpot.difficulty] }}>{selectedSpot.difficulty}</span>
              </div>
            </div>
            <button onClick={() => onFav(selectedSpot.id)} style={{ fontSize: "1.3rem", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>{favorites.includes(selectedSpot.id) ? "❤️" : "🤍"}</button>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#4a6a5e", lineHeight: 1.65, marginBottom: "12px" }}>{selectedSpot.description}</p>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "#6a8a80", marginBottom: "12px" }}>
            <span>{selectedSpot.distance}</span>
            <span>·</span>
            <span>{selectedSpot.duration}</span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
            {selectedSpot.activities.map(a => <span key={a} style={{ padding: "4px 10px", background: "#f0f5f3", border: "1px solid #d4e8e0", borderRadius: "8px", fontSize: "0.78rem", color: "#1a9e6e", fontWeight: 500 }}>{a}</span>)}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => onBook(selectedSpot)} style={{ flex: 1, padding: "10px 16px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>Réserver ce spot</button>
            <button onClick={() => setSelectedSpot(null)} style={{ padding: "10px 14px", background: "#f5f8f7", border: "1px solid #e0ece7", borderRadius: "10px", color: "#6a8a80", fontSize: "0.85rem", fontWeight: 500 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function LevelBadge({ xp }) {
  const level = [...LEVELS].reverse().find(l => xp >= l.minXP) || LEVELS[0];
  const idx = LEVELS.findIndex(l => l === level);
  const nextLevel = LEVELS[idx + 1];
  const progress = nextLevel ? ((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100 : 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: "12px", border: `1px solid ${level.color}30` }}>
      <span style={{ fontSize: "1.3rem" }}>{level.icon}</span>
      <div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: level.color }}>{level.name}</div>
        <div style={{ fontSize: "0.6rem", color: "#4a7a6a" }}>{xp} XP</div>
        {nextLevel && <div style={{ width: "60px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginTop: "2px" }}><div style={{ width: `${progress}%`, height: "100%", background: level.color, borderRadius: "2px", transition: "width 0.5s" }} /></div>}
      </div>
    </div>
  );
}

function WeatherWidget({ coords, spotName, difficulty, small = false }) {
  const [w, setW] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  useEffect(() => { getWeather(coords[0], coords[1]).then(setW); }, []);
  const askAdvice = async (e) => {
    e.stopPropagation();
    if (!w) return;
    setLoadingAdvice(true);
    setAdvice(await getWeatherAdvice(w, spotName || "ce spot", difficulty || "Intermédiaire"));
    setLoadingAdvice(false);
  };
  if (!w) return <span style={{ fontSize: "0.68rem", color: "#3a6a5a" }}>🌤️ ...</span>;
  if (small) return <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 8px", background: `${w.col}15`, border: `1px solid ${w.col}30`, borderRadius: "20px", fontSize: "0.65rem", color: w.col, fontWeight: 600 }}>{w.icon} {w.temp}°C</span>;
  return (
    <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${w.col}40`, borderRadius: "14px", marginTop: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.6rem" }}>{w.icon}</span>
          <div><div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#daf0e8" }}>{w.temp}°C</div><div style={{ fontSize: "0.68rem", color: "#5a8a78", textTransform: "capitalize" }}>{w.desc}</div></div>
        </div>
        <div style={{ padding: "4px 10px", background: `${w.col}20`, border: `1px solid ${w.col}40`, borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, color: w.col }}>{w.s === "good" ? "✅" : w.s === "med" ? "⚠️" : "🚫"} {w.l}</div>
      </div>
      <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: advice ? "8px" : 0 }}>
        <span style={{ fontSize: "0.68rem", color: "#4a7a6a" }}>💨 <strong style={{ color: "#8ab8b0" }}>{w.windKmh} km/h</strong></span>
        <span style={{ fontSize: "0.68rem", color: "#4a7a6a" }}>🌧️ <strong style={{ color: "#8ab8b0" }}>{w.rain} mm/h</strong></span>
        <button onClick={askAdvice} disabled={loadingAdvice} style={{ marginLeft: "auto", background: "none", border: "1px solid rgba(99,102,241,0.3)", padding: "2px 9px", borderRadius: "20px", color: "#a5b4fc", fontSize: "0.65rem", cursor: "pointer" }}>
          {loadingAdvice ? "⏳" : "🤖 Conseil IA"}
        </button>
      </div>
      {advice && <div style={{ padding: "8px 10px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px" }}><p style={{ fontSize: "0.72rem", color: "#a5b4fc", lineHeight: 1.5 }}>🧠 {advice}</p></div>}
    </div>
  );
}

function LegalWarning({ country }) {
  const [open, setOpen] = useState(false);
  const legal = LEGAL_INFO[country] || LEGAL_INFO.default;
  return (
    <div style={{ marginTop: "8px" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{ background: "none", border: "1px solid rgba(245,158,11,0.25)", padding: "3px 9px", borderRadius: "20px", color: "#fbbf24", fontSize: "0.65rem", cursor: "pointer" }}>
        ⚖️ Réglementation {COUNTRIES[country]?.flag} {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{ marginTop: "6px", padding: "9px 11px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "10px" }}>
          <p style={{ fontSize: "0.68rem", color: "#a8edcf", marginBottom: "3px" }}>📋 Licence : {legal.license}</p>
          <p style={{ fontSize: "0.68rem", color: "#a8edcf", marginBottom: "3px" }}>🚸 Âge minimum : {legal.minAge} ans</p>
          <p style={{ fontSize: "0.68rem", color: "#a8edcf", marginBottom: "3px" }}>🆘 Urgences : {legal.emergency}</p>
          <p style={{ fontSize: "0.68rem", color: "#f87171" }}>⚠️ {legal.rules}</p>
        </div>
      )}
    </div>
  );
}

function ExpeditionPlanner({ spot }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(false);
  const isLong = spot.duration?.includes("jour") || spot.duration?.includes("semaine") || parseInt(spot.distance) > 50;
  if (!isLong) return null;
  const generate = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setChecklist(await generateExpeditionChecklist(spot));
    setLoading(false);
  };
  return (
    <div style={{ marginTop: "10px", padding: "10px 12px", background: "rgba(26,158,110,0.06)", border: "1px solid rgba(26,158,110,0.18)", borderRadius: "12px" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a8edcf", marginBottom: "6px" }}>⛺ Mode expédition longue durée</p>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "7px" }}>
        {["Kayak/Canoë", "Pagaie secours", "Gilet", "Trousse 1ers soins", "GPS/VHF"].map(item => <span key={item} style={{ fontSize: "0.6rem", padding: "2px 7px", background: "rgba(26,158,110,0.1)", borderRadius: "20px", color: "#7ecfb0" }}>✓ {item}</span>)}
      </div>
      <button onClick={generate} disabled={loading} style={{ background: "none", border: "1px solid rgba(26,158,110,0.3)", padding: "4px 10px", borderRadius: "20px", color: "#a8edcf", fontSize: "0.68rem", cursor: "pointer" }}>
        {loading ? "⏳ Génération..." : "📋 Checklist IA personnalisée"}
      </button>
      {checklist && <p style={{ fontSize: "0.72rem", color: "#8ab8b0", marginTop: "8px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{checklist}</p>}
    </div>
  );
}

function ProviderComparator({ routeId, onShowPortal }) {
  const routeProviders = ALL_PROVIDERS.filter(p => p.routeIds?.includes(routeId));
  if (routeProviders.length < 1) return null;
  return (
    <div style={{ marginTop: "10px" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a8edcf", marginBottom: "7px" }}>📊 Prestataires disponibles</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {routeProviders.map(p => {
          const tier = partnershipManager.getTier(p.revenue || 0);
          const tierData = PARTNERSHIP_TIERS[tier];
          return (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#c8e8d8" }}>{p.emoji} {p.name}</span>
                  <span style={{ fontSize: "0.6rem", padding: "1px 6px", background: tierData.bg, border: `1px solid ${tierData.color}40`, borderRadius: "20px", color: tierData.color }}>{tierData.badge} {tierData.label}</span>
                </div>
                <div style={{ fontSize: "0.62rem", color: "#4a7a6a" }}>{p.inclut?.slice(0, 3).join(" · ")} {p.eco ? "· 🌿 Éco" : ""}</div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#a8edcf" }}>{p.price}{p.currency}</div>
                <div style={{ fontSize: "0.62rem", color: "#f59e0b" }}>⭐ {p.rating} ({p.reviews})</div>
                {onShowPortal && <button onClick={e => { e.stopPropagation(); onShowPortal(p); }} style={{ fontSize: "0.58rem", padding: "2px 7px", background: tierData.bg, border: `1px solid ${tierData.color}40`, borderRadius: "20px", color: tierData.color, cursor: "pointer" }}>🏢 Portail</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveConditions({ spotId }) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [waterLevel, setWaterLevel] = useState("normal");
  const [crowd, setCrowd] = useState("moyenne");
  const submitReport = (e) => {
    e.stopPropagation();
    setReports([{ id: Date.now(), waterLevel, crowd, date: new Date().toISOString() }, ...reports]);
    setShowForm(false);
  };
  return (
    <div style={{ marginTop: "10px", padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a8edcf" }}>📸 Conditions en direct</p>
        <button onClick={e => { e.stopPropagation(); setShowForm(f => !f); }} style={{ background: "rgba(26,158,110,0.15)", border: "none", padding: "3px 9px", borderRadius: "20px", color: "#a8edcf", fontSize: "0.65rem", cursor: "pointer" }}>+ Partager</button>
      </div>
      {showForm && (
        <div style={{ marginBottom: "8px", padding: "8px", background: "rgba(26,158,110,0.06)", borderRadius: "9px" }}>
          <select value={waterLevel} onChange={e => setWaterLevel(e.target.value)} onClick={e => e.stopPropagation()} style={{ width: "100%", marginBottom: "5px", padding: "5px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(26,158,110,0.2)", borderRadius: "8px", color: "#e8f4f0", fontSize: "0.7rem", outline: "none" }}>
            <option value="bas">💧 Niveau bas</option><option value="normal">💧 Niveau normal</option><option value="haut">🌊 Crue</option>
          </select>
          <select value={crowd} onChange={e => setCrowd(e.target.value)} onClick={e => e.stopPropagation()} style={{ width: "100%", marginBottom: "6px", padding: "5px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(26,158,110,0.2)", borderRadius: "8px", color: "#e8f4f0", fontSize: "0.7rem", outline: "none" }}>
            <option value="vide">👤 Désert</option><option value="moyenne">👥 Calme</option><option value="plein">👨‍👩‍👧‍👦 Bondé</option>
          </select>
          <button onClick={submitReport} style={{ width: "100%", padding: "5px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.7rem", cursor: "pointer" }}>📤 Publier</button>
        </div>
      )}
      {reports.length === 0 ? <p style={{ fontSize: "0.65rem", color: "#3a6a5a" }}>Aucun rapport récent. Sois le premier !</p> : reports.map(r => (
        <div key={r.id} style={{ display: "flex", gap: "10px", fontSize: "0.65rem", color: "#8ab8b0", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span>💧 {r.waterLevel === "bas" ? "Bas" : r.waterLevel === "haut" ? "Crue" : "Normal"}</span>
          <span>👥 {r.crowd === "vide" ? "Désert" : r.crowd === "plein" ? "Bondé" : "Calme"}</span>
          <span style={{ color: "#3a6a5a", marginLeft: "auto" }}>{new Date(r.date).toLocaleTimeString("fr")}</span>
        </div>
      ))}
    </div>
  );
}

function SeasonalCalendar() {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const statuses = ["off", "off", "low", "good", "ideal", "ideal", "ideal", "ideal", "good", "low", "off", "off"];
  const colors = { off: "#dc2626", low: "#f59e0b", good: "#10b981", ideal: "#1a9e6e" };
  const labels = { off: "Fermé", low: "Possible", good: "Bon", ideal: "Idéal" };
  const cur = new Date().getMonth();
  return (
    <div style={{ marginTop: "10px", padding: "9px 11px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a8edcf", marginBottom: "7px" }}>📅 Navigabilité saisonnière</p>
      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
        {months.map((m, i) => (
          <div key={m} style={{ textAlign: "center", padding: "3px 4px", background: `${colors[statuses[i]]}20`, border: `1px solid ${colors[statuses[i]]}40`, borderRadius: "7px", minWidth: "32px", outline: i === cur ? `2px solid ${colors[statuses[i]]}` : "none" }}>
            <div style={{ fontSize: "0.55rem", color: colors[statuses[i]], fontWeight: i === cur ? 700 : 400 }}>{m}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {Object.entries(colors).map(([k, v]) => <span key={k} style={{ fontSize: "0.58rem", color: v }}>■ {labels[k]}</span>)}
      </div>
    </div>
  );
}

function AIDescriptionButton({ spot, isPremium, onShowPremium }) {
  const [loading, setLoading] = useState(false);
  const [aiDesc, setAiDesc] = useState(null);
  const generate = async (e) => {
    e.stopPropagation();
    if (!isPremium) { onShowPremium(); return; }
    setLoading(true);
    setAiDesc(await generateDescription(spot));
    setLoading(false);
  };
  return (
    <div style={{ marginTop: "10px" }}>
      <button onClick={generate} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: loading ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 600, fontSize: "0.75rem", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" }}>
        {loading ? "⏳ Génération..." : isPremium ? "🤖 Générer description IA" : "⭐ Premium — Générer avec IA"}
      </button>
      {aiDesc && (
        <div style={{ marginTop: "10px", padding: "12px 14px", background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "12px" }}>
          <div style={{ fontSize: "0.62rem", color: "#a5b4fc", fontWeight: 700, marginBottom: "5px" }}>🤖 DESCRIPTION IA</div>
          <p style={{ fontSize: "0.84rem", color: "#c4b5fd", lineHeight: 1.65, fontStyle: "italic" }}>{aiDesc}</p>
          <button onClick={(e) => { e.stopPropagation(); setAiDesc(null); }} style={{ marginTop: "8px", padding: "3px 10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", color: "#a5b4fc", fontSize: "0.65rem", cursor: "pointer" }}>🔄 Régénérer</button>
        </div>
      )}
    </div>
  );
}

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} onClick={() => !readonly && onChange && onChange(s)} onMouseEnter={() => !readonly && setHover(s)} onMouseLeave={() => !readonly && setHover(0)}
          style={{ fontSize: readonly ? "0.85rem" : "1.3rem", cursor: readonly ? "default" : "pointer", color: s <= (hover || value) ? "#f59e0b" : "#2a4a40", transition: "color 0.15s" }}>★</span>
      ))}
    </div>
  );
}

function ReviewsSection({ spot, session, userName, allSpots }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => { load(); }, [spot.id]);
  const load = async () => { setLoading(true); const { data } = await supabase.from('reviews').select('*').eq('route_id', spot.id).order('created_at', { ascending: false }); setReviews(Array.isArray(data) ? data : []); setLoading(false); };
  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const submit = async () => {
    if (!rating) { setErr("Choisis une note !"); return; }
    if (!comment.trim()) { setErr("Écris un commentaire !"); return; }
    setSubmitting(true); setErr("");
    await supabase.from('reviews').insert({ route_id: spot.id, user_id: session.user.id, rating, comment: comment.trim(), user_name: userName });
    setRating(0); setComment(""); setShowForm(false); await load(); setSubmitting(false);
  };

  const getSuggestion = async (e) => {
    e.stopPropagation();
    setLoadingSuggestion(true);
    const s = await generateReviewSuggestion(spot.name);
    if (s) setComment(s);
    setLoadingSuggestion(false);
  };

  return (
    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a8edcf" }}>⭐ Avis</span>
          {avg && <><span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f59e0b" }}>{avg}</span><StarRating value={Math.round(avg)} readonly /><span style={{ fontSize: "0.65rem", color: "#3a6a5a" }}>({reviews.length})</span></>}
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          {reviews.length >= 2 && <button onClick={async e => { e.stopPropagation(); setLoadingSummary(true); setSummary(await summarizeReviews(reviews)); setLoadingSummary(false); }} disabled={loadingSummary} style={{ padding: "3px 8px", background: "none", border: "1px solid rgba(26,158,110,0.2)", borderRadius: "20px", color: "#7ecfb0", fontSize: "0.62rem", cursor: "pointer" }}>📋 {loadingSummary ? "..." : "Résumé IA"}</button>}
          {session && !showForm && <button onClick={() => setShowForm(true)} style={{ padding: "4px 12px", background: "rgba(26,158,110,0.12)", border: "1px solid rgba(26,158,110,0.28)", borderRadius: "20px", color: "#7ecfb0", fontSize: "0.72rem", fontWeight: 600 }}>✍️ Avis</button>}
        </div>
      </div>
      {summary && <p style={{ fontSize: "0.72rem", color: "#a8edcf", padding: "7px 9px", background: "rgba(26,158,110,0.06)", borderRadius: "9px", marginBottom: "8px" }}>📋 {summary}</p>}
      {showForm && (
        <div style={{ padding: "12px", background: "rgba(26,158,110,0.06)", border: "1px solid rgba(26,158,110,0.18)", borderRadius: "12px", marginBottom: "10px" }}>
          <div style={{ marginBottom: "8px" }}><p style={{ fontSize: "0.7rem", color: "#4a7a6a", marginBottom: "5px" }}>Ta note</p><StarRating value={rating} onChange={setRating} /></div>
          <button onClick={getSuggestion} disabled={loadingSuggestion} style={{ background: "none", border: "1px solid rgba(99,102,241,0.3)", padding: "4px 9px", borderRadius: "20px", color: "#a5b4fc", fontSize: "0.68rem", cursor: "pointer", marginBottom: "8px" }}>
            🪄 {loadingSuggestion ? "Génération..." : "Suggestion IA"}
          </button>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Partage ton expérience..." rows={2} style={{ width: "100%", padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(26,158,110,0.18)", borderRadius: "10px", color: "#e8f4f0", fontSize: "0.8rem", resize: "vertical", outline: "none", marginBottom: "8px" }} />
          {err && <p style={{ color: "#f87171", fontSize: "0.7rem", marginBottom: "6px" }}>{err}</p>}
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={submit} disabled={submitting} style={{ padding: "6px 14px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 600, fontSize: "0.75rem", opacity: submitting ? 0.7 : 1 }}>{submitting ? "⏳..." : "✅ Publier"}</button>
            <button onClick={() => { setShowForm(false); setRating(0); setComment(""); setErr(""); }} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", color: "#5a8a78", fontSize: "0.75rem" }}>Annuler</button>
          </div>
        </div>
      )}
      {!session && <p style={{ fontSize: "0.7rem", color: "#3a6a5a", marginBottom: "8px" }}>🔐 Connecte-toi pour laisser un avis</p>}
      {loading ? <p style={{ fontSize: "0.7rem", color: "#3a6a5a" }}>Chargement...</p> : reviews.length === 0 ? <p style={{ fontSize: "0.7rem", color: "#3a6a5a" }}>Aucun avis. Sois le premier ! 🚀</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {reviews.map(r => (
            <div key={r.id} style={{ padding: "9px 11px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>{(r.user_name || "?")[0].toUpperCase()}</div>
                  <div><span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#c8e8d8" }}>{r.user_name || "Utilisateur"}</span><div style={{ display: "flex", alignItems: "center", gap: "5px" }}><StarRating value={r.rating} readonly /><span style={{ fontSize: "0.6rem", color: "#3a6a5a" }}>{new Date(r.created_at).toLocaleDateString("fr-BE")}</span></div></div>
                </div>
                {session && session.user.id === r.user_id && <button onClick={() => supabase.from('reviews').delete().eq('id', r.id).then(load)} style={{ background: "none", border: "none", color: "#3a6a5a", fontSize: "0.7rem" }}>🗑️</button>}
              </div>
              {r.comment && <p style={{ fontSize: "0.76rem", color: "#8ab8b0", lineHeight: 1.5, marginTop: "4px" }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "10px", padding: "8px 11px", background: "rgba(26,158,110,0.05)", borderRadius: "11px", border: "1px solid rgba(26,158,110,0.12)" }}>
        <button onClick={async e => { e.stopPropagation(); setLoadingRecs(true); const similar = allSpots.filter(s => s.id !== spot.id && s.type === spot.type).slice(0, 6); setRecs(await getRecommendations(spot, similar)); setLoadingRecs(false); }} disabled={loadingRecs} style={{ background: "none", border: "1px solid rgba(26,158,110,0.3)", padding: "5px 12px", borderRadius: "20px", color: "#a8edcf", fontSize: "0.72rem", cursor: "pointer" }}>
          🧭 {loadingRecs ? "..." : "Spots similaires recommandés"}
        </button>
        {recs && <p style={{ fontSize: "0.75rem", color: "#8ab8b0", marginTop: "8px", lineHeight: 1.6 }}>✨ {recs}</p>}
      </div>
    </div>
  );
}

function TranslateButton({ text, onTranslated }) {
  const [lang, setLang] = useState("fr");
  const [loading, setLoading] = useState(false);
  const flags = { fr: "🇫🇷", en: "🇬🇧", es: "🇪🇸", de: "🇩🇪" };
  const next = { fr: "en", en: "es", es: "de", de: "fr" };
  const translate = async (e) => {
    e.stopPropagation();
    const nextLang = next[lang];
    if (nextLang === "fr") { onTranslated(text); setLang("fr"); return; }
    setLoading(true);
    const translated = await translateText(text, nextLang);
    if (translated) onTranslated(translated);
    setLang(nextLang);
    setLoading(false);
  };
  return (
    <button onClick={translate} disabled={loading} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "20px", fontSize: "0.62rem", color: "#6a9a8c", cursor: "pointer" }}>
      {loading ? "⏳" : `🌐 ${flags[lang]}`}
    </button>
  );
}

// Fallback pool — each type uses only semantically coherent images
// Real diversity comes from SpotImage + Unsplash API; these are last-resort fallbacks
const WATER_PHOTOS = {
  RIVER: ['/images/canyon-river.jpg', '/images/rafting-adventure.jpg', '/images/hero-kayaking.jpg', '/images/river-camping.jpg'],
  LAKE:  ['/images/kayak-lake.jpg', '/images/lake-calm.jpg', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80&fit=crop&auto=format&orientation=landscape', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop&auto=format&orientation=landscape'],
  SEA:   ['/images/sea-coast.jpg', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop&auto=format&orientation=landscape', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80&fit=crop&auto=format&orientation=landscape', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80&fit=crop&auto=format&orientation=landscape'],
};

function getSpotPhoto(spot) {
  if (spot.image_url) return spot.image_url;
  if (spot.unsplash_id) return `https://images.unsplash.com/photo-${spot.unsplash_id}?w=800&q=80&fit=crop&auto=format&orientation=landscape`;
  const pool = WATER_PHOTOS[spot.type] || WATER_PHOTOS.RIVER;
  return pool[spot.id % pool.length];
}

function getGalleryPhotos(spot) {
  const pool = WATER_PHOTOS[spot.type] || WATER_PHOTOS.RIVER;
  return [0, 1, 2].map(offset => pool[(spot.id + offset) % pool.length]);
}

function SpotCard({ spot, isFav, onFav, onBook, session, userName, isPremium, onShowPremium, allSpots }) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState(spot.description);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const typeIcon = { RIVER: "🏞️", LAKE: "🏔️", SEA: "🌊" }[spot.type] || "🌊";
  const typeName = { RIVER: "Rivière", LAKE: "Lac", SEA: "Mer" }[spot.type] || "";
  const provider = ALL_PROVIDERS.find(p => p.routeIds?.includes(spot.id));
  const gallery = getGalleryPhotos(spot);
  const fallbackUrl = getSpotPhoto(spot);
  const countryName = COUNTRIES[spot.country]?.name || "";

  return (
    <div className="fv-spot-card" style={{ marginBottom: "16px" }} onClick={() => setOpen(o => !o)}>

      {/* ── FULL IMAGE OVERLAY ── */}
      <div style={{ position: "relative", height: "300px", overflow: "hidden" }}>
        <SpotImage spot={spot} fallbackUrl={fallbackUrl} />

        {/* Deep gradient for text legibility */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)", zIndex: 2, pointerEvents: "none" }} />

        {/* TOP ROW — activity tags left, fav right */}
        <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 3 }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {spot.activities.slice(0, 2).map(a => (
              <span key={a} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px", fontSize: "0.75rem", color: "#fff", fontWeight: 500 }}>{a}</span>
            ))}
            {spot.sponsored && <span style={{ padding: "4px 10px", background: "rgba(245,158,11,0.85)", backdropFilter: "blur(6px)", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>⭐ Partenaire</span>}
          </div>
          <button className="fv-btn-fav" onClick={e => { e.stopPropagation(); onFav(spot.id); }} style={{ flexShrink: 0 }}>{isFav ? "❤️" : "🤍"}</button>
        </div>

        {/* BOTTOM INFO — location, title, price + CTA */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 16px 14px", zIndex: 3 }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "5px", display: "flex", alignItems: "center", gap: "5px", letterSpacing: "0.03em" }}>
            📍 {spot.river && spot.river !== "Lac" && spot.river !== "Océan" && spot.river !== "Mer" ? spot.river + " · " : ""}{countryName}
          </div>
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#fff", lineHeight: 1.2, marginBottom: "12px" }}>{spot.name}</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {provider ? (
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                  {provider.price} <span style={{ fontSize: "0.75rem", fontWeight: 400, opacity: 0.8 }}>{provider.currency}/pers</span>
                </span>
              ) : (
                <span style={{ display: "flex", gap: "8px", fontSize: "0.75rem", color: "rgba(255,255,255,0.75)" }}>
                  <span>{typeIcon} {typeName}</span>
                  <span>·</span>
                  <span>{spot.difficulty}</span>
                </span>
              )}
            </div>
            <button className="card-cta" onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>
              {open ? "▲" : "Voir →"}
            </button>
          </div>
        </div>
      </div>

      {/* ── EXPANDED DETAILS ── */}
      {open && (
        <div style={{ background: "#fff", borderTop: "1px solid #f0f5f3", padding: "16px", animation: "slideUp 0.3s ease" }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", marginBottom: "14px" }}>
            {gallery.map((src, idx) => (
              <div key={idx} onClick={e => { e.stopPropagation(); setLightboxIdx(idx); }}
                style={{ borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3", cursor: "zoom-in", position: "relative" }}>
                <img src={src} alt={`${spot.name} - photo ${idx + 1}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {idx === 2 && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", color: "#fff", fontWeight: 600 }}>🔍</div>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "10px" }}>
            <p style={{ color: "#4a6a5e", fontSize: "0.82rem", lineHeight: 1.7, flex: 1 }}>{desc}</p>
            <TranslateButton text={spot.description} onTranslated={setDesc} />
          </div>
          <AIDescriptionButton spot={spot} isPremium={isPremium} onShowPremium={onShowPremium} />
          <WeatherWidget coords={spot.coords} spotName={spot.name} difficulty={spot.difficulty} />
          <SeasonalCalendar />
          <LiveConditions spotId={spot.id} />
          <ExpeditionPlanner spot={spot} />
          <ProviderComparator routeId={spot.id} onShowPortal={p => window._setPartnerPortal?.(p)} />
          <LegalWarning country={spot.country} />
          <button onClick={e => { e.stopPropagation(); onBook(spot); }}
            style={{ width: "100%", marginTop: "14px", padding: "12px 18px", background: "linear-gradient(135deg,#0d6e8a,#0891b2)", border: "none", borderRadius: "14px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            🛶 Réserver ce spot
            {provider && <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "3px 12px", fontSize: "0.75rem" }}>{provider.price}{provider.currency}/pers.</span>}
          </button>
          <ReviewsSection spot={spot} session={session} userName={userName} allSpots={allSpots} />
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => { e.stopPropagation(); setLightboxIdx(null); }}>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + gallery.length) % gallery.length); }} style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: "1.2rem", cursor: "pointer" }}>&#8592;</button>
          <img src={gallery[lightboxIdx]} alt={`${spot.name} - galerie photo ${lightboxIdx + 1}`} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "16px", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % gallery.length); }} style={{ position: "absolute", right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: "1.2rem", cursor: "pointer" }}>&#8594;</button>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(null); }} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 38, height: 38, color: "#fff", fontSize: "1rem", cursor: "pointer" }}>&#10005;</button>
          <div style={{ position: "absolute", bottom: 20, color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>{lightboxIdx + 1} / {gallery.length}</div>
        </div>
      )}
    </div>
  );
}


function NativeAd({ activities, type }) {
  const ad = getRelevantAd(activities, type);
  return (
    <div style={{ padding: "10px 14px 10px 14px", background: `linear-gradient(135deg,${ad.color}18,${ad.color}08)`, border: `1px solid ${ad.color}30`, borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", position: "relative" }} onClick={() => trackEvent('ad_click', { adId: ad.id })}>
      <div style={{ position: "absolute", top: "5px", right: "8px", fontSize: "0.7rem", color: "#9ab0a8", letterSpacing: "0.3px" }}>Sponsorisé</div>
      <div style={{ flex: 1, paddingTop: "6px" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a2e28", marginBottom: "2px" }}>{ad.label}</div>
        <div style={{ fontSize: "0.8rem", color: "#6a8a80" }}>{ad.sub}</div>
      </div>
      <div style={{ padding: "6px 12px", background: ad.color, borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>{ad.cta}</div>
    </div>
  );
}

function PremiumModal({ onClose, onActivate }) {
  const plans = [
    { key: "monthly", url: STRIPE_MONTHLY_URL },
    { key: "yearly",  url: STRIPE_ANNUAL_URL },
    { key: "lifetime", url: null },
  ].map(({ key, url }) => ({ ...PLANS_V9[key], key, url }));
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const plan = plans.find(p => p.key === selectedPlan);

  const formatPrice = (p) => `${p.price}${p.currency}`;
  const formatPeriod = (p) => `/ ${p.interval}`;

  const handlePay = () => {
    trackEvent('premium_checkout_click', { plan: selectedPlan });
    if (plan.url) {
      window.open(plan.url, '_blank');
    } else {
      onActivate(); onClose();
    }
  };

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "24px", padding: "28px", maxWidth: "540px", width: "100%", animation: "pop 0.3s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>⭐</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, background: "linear-gradient(135deg,#f59e0b,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px" }}>FleuVibe Premium</h2>
          <p style={{ color: "#5a8a78", fontSize: "0.78rem" }}>Toutes les fonctionnalités IA incluses</p>
        </div>
        <div style={{ padding: "9px 14px", background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "12px", marginBottom: "16px", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#a5b4fc" }}>🤖 Propulsé par <strong>OpenAI GPT-4o mini</strong></p>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
          {plans.map(p => (
            <div key={p.key} onClick={() => setSelectedPlan(p.key)} style={{ flex: 1, minWidth: "140px", padding: "14px", background: p.popular ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)", border: `2px solid ${selectedPlan === p.key ? (p.popular ? "rgba(245,158,11,0.7)" : "rgba(26,158,110,0.6)") : (p.popular ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)")}`, borderRadius: "16px", position: "relative", cursor: "pointer", transition: "all 0.2s" }}>
              {p.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#f59e0b,#ef4444)", padding: "2px 12px", borderRadius: "20px", fontSize: "0.6rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>⭐ POPULAIRE</div>}
              {p.savings && <div style={{ position: "absolute", top: -10, right: "10px", background: "#10b981", padding: "2px 8px", borderRadius: "20px", fontSize: "0.58rem", fontWeight: 700, color: "#fff" }}>-{p.savings}</div>}
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#a8edcf", marginBottom: "4px" }}>{p.name}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b" }}>{formatPrice(p)}</div>
              <div style={{ fontSize: "0.63rem", color: "#4a7a6a", marginBottom: "10px" }}>{formatPeriod(p)}</div>
              {p.features.map(f => <div key={f} style={{ fontSize: "0.67rem", color: "#8ab8b0", marginBottom: "3px" }}>{f}</div>)}
            </div>
          ))}
        </div>
        {plan?.url ? (
          <button onClick={handlePay} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#f59e0b,#ef4444)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 4px 16px rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            💳 Payer avec Stripe · {formatPrice(plan)}
          </button>
        ) : (
          <button onClick={handlePay} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#f59e0b,#ef4444)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 4px 16px rgba(245,158,11,0.3)" }}>
            ⭐ Commencer l'essai gratuit 7 jours
          </button>
        )}
        {!STRIPE_MONTHLY_URL && !STRIPE_ANNUAL_URL && (
          <p style={{ textAlign: "center", fontSize: "0.6rem", color: "#3a6a5a", marginTop: "6px" }}>Ajoutez VITE_STRIPE_MONTHLY_URL / VITE_STRIPE_ANNUAL_URL dans Vercel pour activer Stripe</p>
        )}
        <p style={{ textAlign: "center", fontSize: "0.62rem", color: "#3a6a5a", marginTop: "8px" }}>Sans engagement · Annulable à tout moment</p>
      </div>
    </div>
  );
}

function BookingModal({ spot, provider, onClose }) {
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(1);
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [pointsEarned, setPointsEarned] = useState(0);
  const price = calcBookingPrice(provider, pax);
  const hasStripe = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const dp = new DynamicPricing();
  const dynPrice = date && price ? dp.calculate(price.total, date) : null;
  const finalTotal = dynPrice ? dynPrice.final : price?.total;

  const confirm = async () => {
    if (!date) return;
    setStatus("loading");
    setErrMsg("");
    try {
      if (hasStripe && price) {
        await stripeManager.processPayment({
          id: Date.now(),
          totalPrice: finalTotal || price.total,
          currency: price.currency === "€" ? "eur" : (price.currency || "eur").toLowerCase(),
          partnerId: provider?.id || "",
          routeId: String(spot.id),
          spotName: spot.name,
        });
      }
      const pts = LoyaltyProgram.earnPoints(finalTotal || 0);
      LoyaltyProgram.addPoints(pts);
      setPointsEarned(pts);
      setStatus("success");
      setTimeout(() => onClose(), 4000);
    } catch (e) {
      if (e.message?.includes('redirect')) { setStatus("success"); return; }
      setErrMsg(e.message || "Erreur de paiement");
      setStatus("error");
    }
  };

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: `1px solid ${spot.color}40`, borderRadius: "24px", padding: "24px", maxWidth: "420px", width: "100%", animation: "pop 0.3s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎉</div>
            <h3 style={{ color: "#a8edcf", fontSize: "1.1rem", marginBottom: "6px" }}>{hasStripe && price ? "Paiement confirmé !" : "Demande envoyée !"}</h3>
            <p style={{ color: "#5a8a78", fontSize: "0.82rem", marginBottom: "12px" }}>{hasStripe && price ? "Votre réservation est confirmée. Bonne aventure !" : "Un prestataire local vous contactera sous 24h."}</p>
            {pointsEarned > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px" }}>
                <span style={{ fontSize: "0.85rem" }}>⭐</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fbbf24" }}>+{pointsEarned} points fidélité gagnés !</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div><h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#daf0e8", marginBottom: "2px" }}>📅 Réserver ce spot</h2><p style={{ color: "#4a7a6a", fontSize: "0.75rem" }}>{spot.emoji} {spot.name}</p></div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#5a8a78", borderRadius: "50%", width: 32, height: 32, fontSize: "0.85rem" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><label style={{ display: "block", color: "#6a9a8c", fontSize: "0.72rem", marginBottom: "5px", fontWeight: 500 }}>Date souhaitée</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(26,158,110,0.25)", borderRadius: "12px", color: "#e8f4f0", fontSize: "0.84rem", outline: "none" }} /></div>
              {dynPrice?.badge && (
                <div style={{ padding: "6px 12px", background: `${dynPrice.badge.color}18`, border: `1px solid ${dynPrice.badge.color}40`, borderRadius: "10px", fontSize: "0.72rem", fontWeight: 700, color: dynPrice.badge.color, textAlign: "center" }}>{dynPrice.badge.label}</div>
              )}
              <div><label style={{ display: "block", color: "#6a9a8c", fontSize: "0.72rem", marginBottom: "5px", fontWeight: 500 }}>Personnes</label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={() => setPax(p => Math.max(1, p - 1))} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#a8edcf", fontSize: "1.1rem" }}>−</button>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#daf0e8", minWidth: "30px", textAlign: "center" }}>{pax}</span>
                  <button onClick={() => setPax(p => p + 1)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#a8edcf", fontSize: "1.1rem" }}>+</button>
                </div>
              </div>
              {price && (
                <div style={{ padding: "10px 14px", background: "rgba(26,158,110,0.08)", border: "1px solid rgba(26,158,110,0.2)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6a9a8c", marginBottom: "4px" }}>
                    <span>{price.unit}{price.currency} × {pax} pers.{dynPrice && dynPrice.final !== price.total ? <span style={{ color: "#9ca3af", textDecoration: "line-through", marginLeft: "6px" }}>{price.total}{price.currency}</span> : null}</span>
                    <span style={{ fontWeight: 700, color: "#a8edcf", fontSize: "0.95rem" }}>{finalTotal}{price.currency}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#4a7a6a" }}>
                    <span>Commission 18% incluse · Paiement sécurisé</span>
                    <span style={{ color: "#f59e0b" }}>⭐ +{LoyaltyProgram.earnPoints(finalTotal || 0)} pts</span>
                  </div>
                </div>
              )}
              {status === "error" && <div style={{ padding: "8px 12px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "10px", color: "#f87171", fontSize: "0.72rem" }}>⚠️ {errMsg}</div>}
              <button onClick={confirm} disabled={status === "loading"} style={{ padding: "12px", background: `linear-gradient(135deg,${spot.color},#0891b2)`, border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", opacity: status === "loading" ? 0.7 : 1 }}>
                {status === "loading" ? "⏳ Traitement..." : hasStripe && price ? `💳 Payer ${finalTotal}${price.currency}` : "✅ Envoyer ma demande"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SubmitSpotModal({ onClose, onAdd, session, showAuth }) {
  const [form, setForm] = useState({ name: "", river: "", country: "BE", region: "", distance: "", duration: "", difficulty: "Facile", activities: [], description: "", coords: "", emoji: "🛶", type: "RIVER" });
  const [done, setDone] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const f = (k, v) => { setForm(x => ({ ...x, [k]: v })); setValidationErrors(e => ({ ...e, [k]: undefined })); };
  const inp = (field) => ({ width: "100%", padding: "9px 13px", background: "rgba(255,255,255,0.05)", border: `1px solid ${validationErrors[field] ? "rgba(220,38,38,0.5)" : "rgba(26,158,110,0.2)"}`, borderRadius: "12px", color: "#e8f4f0", fontSize: "0.82rem", outline: "none" });
  const submit = () => {
    if (!session) { showAuth(); return; }
    const sanitized = { ...form, name: sanitizeInput(form.name), river: sanitizeInput(form.river), description: sanitizeInput(form.description) };
    const { valid, errors } = validateSpot(sanitized);
    if (!valid) { setValidationErrors(errors); return; }
    const c = sanitized.coords.split(",").map(s => parseFloat(s.trim()));
    onAdd({ ...sanitized, id: Date.now(), open: true, color: "#1a9e6e", community: true, coords: c.length === 2 && !isNaN(c[0]) ? c : [0, 0], activities: sanitized.activities.length ? sanitized.activities : ["Kayak"] });
    trackEvent('spot_submitted', { name: sanitized.name, type: sanitized.type });
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 2500);
  };
  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: "1px solid rgba(26,158,110,0.28)", borderRadius: "24px", padding: "22px", maxWidth: "480px", width: "100%", maxHeight: "88vh", overflowY: "auto", animation: "pop 0.3s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.55)" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}><div style={{ fontSize: "2.8rem", marginBottom: "10px" }}>🎉</div><h3 style={{ color: "#a8edcf" }}>Spot ajouté ! Merci 🌊</h3></div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#daf0e8" }}>➕ Ajouter un spot</h2>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#5a8a78", borderRadius: "50%", width: 32, height: 32 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", color: "#6a9a8c", fontSize: "0.72rem", marginBottom: "5px", fontWeight: 500 }}>Type</label>
                <div style={{ display: "flex", gap: "5px" }}>
                  {[["RIVER", "🏞️ Rivière", "#2563eb"], ["LAKE", "🏔️ Lac", "#0891b2"], ["SEA", "🌊 Mer", "#7c3aed"]].map(([code, label, col]) => (
                    <button key={code} onClick={() => f("type", code)} style={{ flex: 1, padding: "7px", borderRadius: "20px", border: `1px solid ${form.type === code ? col : "rgba(255,255,255,0.08)"}`, background: form.type === code ? `${col}18` : "rgba(255,255,255,0.02)", color: form.type === code ? col : "#4a7a6a", fontSize: "0.72rem", fontWeight: 600 }}>{label}</button>
                  ))}
                </div>
              </div>
              {[["Nom *", "name", "text", "Ex: Lesse · Houyet"], ["Rivière / Lac *", "river", "text", "Ex: Lesse"], ["Région", "region", "text", "Ex: Wallonie"], ["Distance", "distance", "text", "Ex: 21 km"], ["Durée", "duration", "text", "Ex: 4–5h"], ["Coordonnées GPS", "coords", "text", "Ex: 50.185, 5.002"], ["Description", "description", "textarea", "Décris ce spot..."]].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label style={{ display: "block", color: "#6a9a8c", fontSize: "0.72rem", marginBottom: "4px", fontWeight: 500 }}>{label}</label>
                  {type === "textarea" ? <textarea value={form[key]} onChange={e => f(key, e.target.value)} placeholder={ph} rows={2} style={{ ...inp(key), resize: "vertical" }} /> : <input value={form[key]} onChange={e => f(key, e.target.value)} placeholder={ph} style={inp(key)} />}
                  {validationErrors[key] && <p style={{ color: "#f87171", fontSize: "0.65rem", marginTop: "3px" }}>⚠️ {validationErrors[key]}</p>}
                </div>
              ))}
              <div>
                <label style={{ display: "block", color: "#6a9a8c", fontSize: "0.72rem", marginBottom: "4px", fontWeight: 500 }}>Pays</label>
                <select value={form.country} onChange={e => f("country", e.target.value)} style={{ ...inp("country"), background: "#0d2240" }}>
                  {Object.entries(COUNTRIES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, c]) => <option key={code} value={code}>{c.flag} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#6a9a8c", fontSize: "0.72rem", marginBottom: "4px", fontWeight: 500 }}>Difficulté</label>
                <div style={{ display: "flex", gap: "5px" }}>
                  {["Facile", "Intermédiaire", "Sportif"].map(d => <button key={d} onClick={() => f("difficulty", d)} style={{ flex: 1, padding: "7px", borderRadius: "20px", border: `1px solid ${form.difficulty === d ? DIFF_COLOR[d] : "rgba(255,255,255,0.07)"}`, background: form.difficulty === d ? `${DIFF_COLOR[d]}18` : "rgba(255,255,255,0.02)", color: form.difficulty === d ? DIFF_COLOR[d] : "#4a7a6a", fontSize: "0.72rem", fontWeight: 600 }}>{d}</button>)}
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: "#6a9a8c", fontSize: "0.72rem", marginBottom: "4px", fontWeight: 500 }}>Activités</label>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {["Kayak", "Canoë", "SUP", "Rafting", "Surf", "Voile", "Kitesurf", "Plongée", "Baignade", "Camping", "Pêche"].map(a => { const sel = form.activities.includes(a); return <button key={a} onClick={() => f("activities", sel ? form.activities.filter(x => x !== a) : [...form.activities, a])} style={{ padding: "4px 10px", borderRadius: "20px", border: `1px solid ${sel ? "#1a9e6e" : "rgba(255,255,255,0.07)"}`, background: sel ? "rgba(26,158,110,0.16)" : "rgba(255,255,255,0.02)", color: sel ? "#a8edcf" : "#4a7a6a", fontSize: "0.7rem" }}>{a}</button>; })}
                </div>
              </div>
              <button onClick={submit} style={{ padding: "11px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.86rem", marginTop: "4px" }}>🌊 Soumettre le spot</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


function GroupCreator({ spots, onCreate }) {
  const [name, setName] = useState("");
  const [spotId, setSpotId] = useState("");
  const [date, setDate] = useState("");
  const [meeting, setMeeting] = useState("");
  const [done, setDone] = useState(false);
  const inp = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(8,145,178,0.2)", borderRadius: "12px", color: "#e8f4f0", fontSize: "0.8rem", outline: "none" };
  const submit = () => {
    if (!name || !spotId) return;
    onCreate(name, spotId, date, meeting);
    setName(""); setSpotId(""); setDate(""); setMeeting("");
    setDone(true); setTimeout(() => setDone(false), 2000);
  };
  return (
    <div style={{ padding: "14px", background: "rgba(8,145,178,0.06)", border: "1px solid rgba(8,145,178,0.15)", borderRadius: "16px" }}>
      <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "#67e8f9", marginBottom: "10px" }}>➕ Nouvelle expédition</p>
      {done ? <p style={{ textAlign: "center", color: "#a8edcf", fontSize: "0.8rem", padding: "10px 0" }}>🎉 Groupe créé ! +50 XP</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input placeholder="Nom du groupe *" value={name} onChange={e => setName(e.target.value)} style={inp} />
          <select value={spotId} onChange={e => setSpotId(e.target.value)} style={{ ...inp, background: "#0d2240" }}>
            <option value="">Choisir un spot *</option>
            {spots.slice(0, 20).map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
          <input placeholder="Point de rendez-vous (optionnel)" value={meeting} onChange={e => setMeeting(e.target.value)} style={inp} />
          <button onClick={submit} style={{ padding: "9px", background: "linear-gradient(135deg,#0891b2,#1a9e6e)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>🚀 Créer l'expédition</button>
        </div>
      )}
    </div>
  );
}

// ─── AI CHAT (générique) ──────────────────────────────────────────────────────
const TRIP_FINDER_SYSTEM = `Tu es FleuVibe Trip Finder.

Objectif :
Aider l'utilisateur à trouver la meilleure activité rivière.

Méthode :
1. Pose 1 à 3 questions max
2. Comprends ce que veut l'utilisateur
3. Propose 1 ou 2 activités maximum

Style :
- naturel
- enthousiaste
- orienté expérience

Tu dois donner envie de faire l'activité.

Quand tu proposes :
- explique pourquoi c'est parfait
- reste court

Si l'utilisateur hésite :
→ guide-le vers une décision`;

const CONVERSION_SYSTEM = `Tu es un expert en conversion pour FleuVibe.

Ta mission :
Transformer l'intérêt en réservation.

Quand un utilisateur :
- hésite → rassure
- pose une question → répond + redirige vers action
- montre intérêt → propose réservation directe

Tu dois :
- rendre ça simple
- enlever les freins
- donner confiance

Style :
- humain
- direct
- pas agressif`;

function AIChat({ onClose, systemPrompt, title, subtitle, greeting, accentColor }) {
  const accent = accentColor || "rgba(26,158,110,0.3)";
  const [messages, setMessages] = useState([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    const reply = await callAI([{ role: "system", content: systemPrompt }, ...updated], 300);
    setMessages(prev => [...prev, { role: "assistant", content: reply || "Je n'ai pas pu te répondre, réessaie !" }]);
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: `1px solid ${accent}`, borderRadius: "28px", padding: "0", maxWidth: "480px", width: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column", animation: "slideUp 0.3s ease", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#a8edcf", margin: 0 }}>{title}</h2>
            <p style={{ fontSize: "0.68rem", color: "#5a8a78", margin: "2px 0 0" }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#5a8a78", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: "1rem" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "linear-gradient(135deg,#1a9e6e,#0891b2)" : "rgba(255,255,255,0.06)", border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none", fontSize: "0.82rem", color: "#daf0e8", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.82rem", color: "#5a8a78" }}>✦ ✦ ✦</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "8px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Réponds ici..." disabled={loading} style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: `1px solid ${accent}`, borderRadius: "20px", color: "#e8f4f0", fontSize: "0.82rem", outline: "none" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "10px 16px", background: loading ? "rgba(26,158,110,0.3)" : "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: loading ? "default" : "pointer", opacity: !input.trim() ? 0.5 : 1 }}>
            {loading ? "⏳" : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function FleuVibe() {
  const [spots, setSpots] = useState(SPOTS_WORLD);
  const SPOTS_PER_PAGE = 20;
  const [dbSpots, setDbSpots] = useState([]);
  const [dbTotal, setDbTotal] = useState(0);
  const [dbPage, setDbPage] = useState(1);
  const [dbLoading, setDbLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [userStats, setUserStats] = useState({ totalSpotsVisited: 0, countriesVisited: 0, totalReviews: 0, spotsAdded: 0, longExpeditions: 0 });
  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [showTripFinder, setShowTripFinder] = useState(false);
  const [showConversionChat, setShowConversionChat] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [partnerPortal, setPartnerPortal] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const isAdmin = session?.user?.email === import.meta.env.VITE_ADMIN_EMAIL || false;
  const [authForm, setAuthForm] = useState({ email: "", password: "", fullName: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [bookingSpot, setBookingSpot] = useState(null);
  const [page, setPage] = useState("explore");
  const [search, setSearch] = useState("");
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiFilters, setAiFilters] = useState(null);
  const [selType, setSelType] = useState("ALL");
  const [selDiff, setSelDiff] = useState("ALL");
  const [selContinent, setSelContinent] = useState("ALL");
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState("ocean");
  const [viewMode, setViewMode] = useState("comfort");
  const [groups, setGroups] = useState([]);
  const [affiliateCopied, setAffiliateCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageTransition, setPageTransition] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    setTimeout(() => setInitialLoading(false), 1400);
    const xp = parseInt(localStorage.getItem("fv_xp") || "0");
    const stats = JSON.parse(localStorage.getItem("fv_stats") || "{}");
    setUserXP(xp);
    if (stats.totalSpotsVisited) setUserStats(stats);
    const goOnline = () => { setIsOnline(true); logger.info('Back online'); };
    const goOffline = () => { setIsOnline(false); logger.warn('Gone offline'); };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    // Schema.org site-level
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", "name": "FleuVibe", "url": "https://fleuvibe-8am5.vercel.app", "description": `Explorez les eaux du monde — ${GlobalStats.totalSpots}+ spots nautiques dans ${GlobalStats.totalCountries} pays, météo IA`, "potentialAction": { "@type": "SearchAction", "target": "https://fleuvibe-8am5.vercel.app/?q={search_term_string}", "query-input": "required name=search_term_string" } });
    document.head.appendChild(schema);
    logger.info('FleuVibe v6 started', { online: navigator.onLine, spots: GlobalStats.totalSpots, countries: GlobalStats.totalCountries });
    window._gtag?.('event', 'app_open');
    window._setPartnerPortal = setPartnerPortal;
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); window._setPartnerPortal = null; };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        if (navigator.onLine) {
          const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (p) { setProfile(p); try { setFavorites(JSON.parse(p.favorites || "[]")); } catch { setFavorites([]); } }
        } else {
          idb.get('fv_favorites').then(cached => { if (Array.isArray(cached)) setFavorites(cached); });
        }
      } else {
        setProfile(null);
        setFavorites([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── SERVER-SIDE FILTERED SPOT FETCH ────────────────────────────────────────
  useEffect(() => {
    if (page !== "explore" && page !== "expeditions") return;
    let cancelled = false;
    const run = async () => {
      setDbLoading(true);
      let query = supabase.from("spots").select("*", { count: "exact" });
      if (page === "expeditions") {
        query = query.or("duration.ilike.%jour%,duration.ilike.%semaine%");
      } else if (aiSearchActive && aiFilters) {
        if (aiFilters.type)               query = query.eq("type", aiFilters.type);
        if (aiFilters.difficulty)         query = query.eq("difficulty", aiFilters.difficulty);
        if (aiFilters.countries?.length)  query = query.in("country", aiFilters.countries);
        if (aiFilters.activities?.length) query = query.overlaps("activities", aiFilters.activities);
      } else {
        if (selType !== "ALL")      query = query.eq("type", selType);
        if (selDiff !== "ALL")      query = query.eq("difficulty", selDiff);
        if (selContinent !== "ALL") query = query.eq("continent", selContinent);
        if (search)                 query = query.or(`name.ilike.%${search}%,river.ilike.%${search}%`);
      }
      const from = (dbPage - 1) * SPOTS_PER_PAGE;
      const { data, count } = await query.range(from, from + SPOTS_PER_PAGE - 1).order("id");
      if (!cancelled) {
        if (data?.length) {
          setDbSpots(data);
          setDbTotal(count || 0);
        } else {
          // Supabase DB vide — fallback sur les données locales avec les mêmes filtres
          let local = spots;
          if (page === "expeditions") {
            local = local.filter(s => /jour|semaine/i.test(s.duration || ""));
          } else if (aiSearchActive && aiFilters) {
            if (aiFilters.type)               local = local.filter(s => s.type === aiFilters.type);
            if (aiFilters.difficulty)         local = local.filter(s => s.difficulty === aiFilters.difficulty);
            if (aiFilters.countries?.length)  local = local.filter(s => aiFilters.countries.includes(s.country));
            if (aiFilters.activities?.length) local = local.filter(s => aiFilters.activities.some(a => s.activities?.includes(a)));
          } else {
            if (selType !== "ALL")      local = local.filter(s => s.type === selType);
            if (selDiff !== "ALL")      local = local.filter(s => s.difficulty === selDiff);
            if (selContinent !== "ALL") local = local.filter(s => (s.continent ?? COUNTRIES_EXT[s.country]?.continent) === selContinent);
            if (search)                 local = local.filter(s => [s.name, s.river, s.region].some(f => f?.toLowerCase().includes(search.toLowerCase())));
          }
          const from = (dbPage - 1) * SPOTS_PER_PAGE;
          setDbSpots(local.slice(from, from + SPOTS_PER_PAGE));
          setDbTotal(local.length);
        }
        setDbLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [page, selType, selDiff, selContinent, search, dbPage, aiSearchActive, aiFilters]);

  const addXP = (amount) => {
    const newXP = userXP + amount;
    setUserXP(newXP);
    localStorage.setItem("fv_xp", String(newXP));
  };

  const createGroup = (name, spotId, date, meeting) => {
    const spot = spots.find(s => s.id === parseInt(spotId));
    setGroups(prev => [...prev, { id: Date.now(), name, spot, date, meeting, members: [userName], createdAt: new Date().toISOString() }]);
    addXP(50);
  };

  const copyAffiliateLink = () => {
    const userId = session?.user?.id || userName.replace(/\s/g, "_");
    const link = AffiliateProgram.generateLink(userId);
    navigator.clipboard.writeText(link).then(() => { setAffiliateCopied(true); setTimeout(() => setAffiliateCopied(false), 2500); });
  };

  const currentTheme = THEMES[theme] || THEMES.ocean;

  const handlePageChange = (newPage) => {
    trackEvent('page_view', { page: newPage });
    setPageTransition(true);
    setTimeout(() => { setPage(newPage); setSearch(""); clearAISearch(); setPageTransition(false); }, 280);
  };

  const earnedBadges = Object.values(BADGES_DEF).filter(b => b.condition(userStats));

  const loadProfile = async (id) => { const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single(); if (p) { setProfile(p); try { setFavorites(JSON.parse(p.favorites || "[]")); } catch { setFavorites([]); } } };
  const handleSignUp = async () => { setAuthLoading(true); setAuthError(""); const { data, error } = await supabase.auth.signUp({ email: authForm.email, password: authForm.password, options: { data: { full_name: authForm.fullName } } }); if (error) { setAuthError(error.message); setAuthLoading(false); return; } if (data.session) { await supabase.from('profiles').upsert({ id: data.user.id, full_name: authForm.fullName, username: authForm.email.split("@")[0], favorites: "[]" }, { onConflict: 'id' }); setShowAuth(false); setAuthForm({ email: "", password: "", fullName: "" }); addXP(50); } else { setAuthError("Vérifie ton email !"); } setAuthLoading(false); };
  const handleSignIn = async () => {
    const rl = rateLimiters.auth.check(authForm.email || 'anon');
    if (!rl.allowed) { setAuthError(rl.reason); return; }
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    if (error) { setAuthError(error.message); setAuthLoading(false); logger.warn('Sign-in failed', { email: authForm.email }); return; }
    setShowAuth(false); setAuthForm({ email: "", password: "", fullName: "" });
    setAuthLoading(false);
    logger.metric('user_signin', 1);
    window._gtag?.('event', 'login', { method: 'email' });
  };
  const handleSignOut = async () => { await supabase.auth.signOut(); setIsPremium(false); setShowProfile(false); };
  const toggleFav = async (id) => {
    if (!session) { setShowAuth(true); return; }
    const n = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(n);
    if (!favorites.includes(id)) addXP(10);
    trackEvent(favorites.includes(id) ? 'unfav' : 'fav', { spotId: id });
    idb.set('fv_favorites', n);
    if (isOnline) await supabase.from('profiles').update({ favorites: JSON.stringify(n) }).eq('id', session.user.id);
  };

  const handleAISearch = async () => {
    if (!search.trim()) return;
    setAiSearchLoading(true);
    const filters = await semanticSearch(search);
    setAiFilters(filters);
    setAiSearchActive(true);
    setAiSearchLoading(false);
  };
  const clearAISearch = () => { setAiSearchActive(false); setAiFilters(null); setSearch(""); };

  const userName = profile?.full_name || profile?.username || session?.user?.email?.split("@")[0] || "Utilisateur";
  const communityCount = spots.filter(s => s.community).length;

  const filtered = spots.filter(s => {
    if (page === "favorites") return favorites.includes(s.id);
    if (page === "expeditions") return s.duration?.includes("jour") || s.duration?.includes("semaine") || parseInt(s.distance) > 50;
    if (aiSearchActive && aiFilters) {
      if (aiFilters.type && s.type !== aiFilters.type) return false;
      if (aiFilters.difficulty && s.difficulty !== aiFilters.difficulty) return false;
      if (aiFilters.countries?.length && !aiFilters.countries.includes(s.country)) return false;
      if (aiFilters.activities?.length && !aiFilters.activities.some(a => s.activities.includes(a))) return false;
      return true;
    }
    if (selType !== "ALL" && s.type !== selType) return false;
    if (selDiff !== "ALL" && s.difficulty !== selDiff) return false;
    if (selContinent !== "ALL" && COUNTRIES[s.country]?.continent !== selContinent) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.river.toLowerCase().includes(search.toLowerCase()) && !COUNTRIES[s.country]?.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (initialLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 50%,#0a1628 0%,#0d2240 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, gap: "24px", fontFamily: "'Inter',sans-serif" }}>
        <style>{`@keyframes rotate-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes loading-wave-anim{0%,100%{transform:scaleY(0.5)}50%{transform:scaleY(1)}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}.ls-spinner{width:52px;height:52px;border-radius:50%;background:conic-gradient(from 0deg,#1a9e6e,#0891b2,#38bdf8,#1a9e6e);animation:rotate-slow 1s linear infinite;-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 8px),#000 calc(100% - 6px));mask:radial-gradient(farthest-side,transparent calc(100% - 8px),#000 calc(100% - 6px))}.ls-wave{display:flex;gap:6px;align-items:center}.ls-wave span{width:4px;height:22px;background:linear-gradient(135deg,#1a9e6e,#0891b2);border-radius:4px;animation:loading-wave-anim 1s ease-in-out infinite}.ls-wave span:nth-child(1){animation-delay:0s}.ls-wave span:nth-child(2){animation-delay:.1s}.ls-wave span:nth-child(3){animation-delay:.2s}.ls-wave span:nth-child(4){animation-delay:.3s}.ls-wave span:nth-child(5){animation-delay:.4s}.ls-title{background:linear-gradient(90deg,#a8edcf 0%,#1a9e6e 30%,#38bdf8 60%,#a8edcf 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}`}</style>
        <svg style={{ position: "absolute", bottom: 0, width: "100%", opacity: 0.08 }} viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path fill="#1a9e6e" d="M0,100 C360,160 720,40 1080,100 C1260,130 1380,90 1440,100 L1440,200 L0,200Z">
            <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0,100 C360,160 720,40 1080,100 C1260,130 1380,90 1440,100 L1440,200 L0,200Z;M0,80 C360,40 720,160 1080,80 C1260,50 1380,120 1440,80 L1440,200 L0,200Z;M0,100 C360,160 720,40 1080,100 C1260,130 1380,90 1440,100 L1440,200 L0,200Z"/>
          </path>
        </svg>
        <div style={{ fontSize: "3.5rem", filter: "drop-shadow(0 0 20px rgba(26,158,110,0.5))" }}>🌊</div>
        <h1 className="ls-title" style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-1px" }}>FleuVibe</h1>
        <div className="ls-spinner" />
        <div className="ls-wave"><span /><span /><span /><span /><span /></div>
        <p style={{ color: "#5a8a78", fontSize: "0.8rem", letterSpacing: "2px", fontWeight: 500 }}>CHARGEMENT EN COURS...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f8f7", fontFamily: "'Inter',sans-serif", color: "#1a2e28" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f5f8f7}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#e8f0ed;border-radius:10px}::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#1a9e6e,#0891b2);border-radius:10px}
        button{cursor:pointer;transition:all 0.2s ease}button:active{transform:scale(0.97)}
        .fade-in{opacity:0;transform:translateY(16px);transition:opacity 0.5s ease,transform 0.5s ease}
        .fade-in.loaded{opacity:1;transform:translateY(0)}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(2deg)}}
        @keyframes float-delayed{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px);filter:blur(4px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 5px rgba(26,158,110,0.2),0 0 10px rgba(26,158,110,0.1)}50%{box-shadow:0 0 20px rgba(26,158,110,0.5),0 0 30px rgba(8,145,178,0.3)}}
        @keyframes rotate-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes loading-wave-anim{0%,100%{transform:scaleY(0.5)}50%{transform:scaleY(1)}}
        @keyframes pageTransition{0%{opacity:0;transform:scale(0.98);filter:blur(6px)}100%{opacity:1;transform:scale(1);filter:blur(0)}}
        @keyframes pop{0%{transform:scale(0.9);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes ripple-anim{0%{transform:scale(0);opacity:0.5}100%{transform:scale(4);opacity:0}}
        .shimmer-text{background:linear-gradient(90deg,#a8edcf 0%,#1a9e6e 30%,#38bdf8 60%,#a8edcf 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:2000;padding:16px}
        .glass-card{background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);transition:all 0.5s cubic-bezier(0.2,0.9,0.4,1.1)}.glass-card:hover{border-color:rgba(26,158,110,0.3);transform:translateY(-6px) scale(1.005);box-shadow:0 25px 40px -12px rgba(0,0,0,0.35)}
        .page-enter{animation:pageTransition 0.5s cubic-bezier(0.2,0.9,0.4,1.1) forwards}
        .loading-wave{display:flex;gap:5px;align-items:center;justify-content:center}
        .loading-wave span{width:4px;height:20px;background:linear-gradient(135deg,#1a9e6e,#0891b2);border-radius:4px;animation:loading-wave-anim 1s ease-in-out infinite}
        .loading-wave span:nth-child(1){animation-delay:0s}.loading-wave span:nth-child(2){animation-delay:.1s}.loading-wave span:nth-child(3){animation-delay:.2s}.loading-wave span:nth-child(4){animation-delay:.3s}.loading-wave span:nth-child(5){animation-delay:.4s}
        .loading-spinner{width:44px;height:44px;border-radius:50%;background:conic-gradient(from 0deg,#1a9e6e,#0891b2,#38bdf8,#1a9e6e);animation:rotate-slow 1s linear infinite;-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 7px),#000 calc(100% - 5px));mask:radial-gradient(farthest-side,transparent calc(100% - 7px),#000 calc(100% - 5px))}
        .ripple-btn{position:relative;overflow:hidden}.ripple-btn::after{content:'';position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.25);transform:translate(-50%,-50%);transition:width 0.4s,height 0.4s,opacity 0.4s}.ripple-btn:active::after{width:200px;height:200px;opacity:0}
        .card-3d{transition:all 0.5s cubic-bezier(0.2,0.9,0.4,1.1);transform-style:preserve-3d;perspective:1000px}
        input::placeholder,textarea::placeholder{color:#8aa89e}
        input:focus,textarea:focus,select:focus{outline:none;border-color:rgba(26,158,110,0.5)!important}
        select option{background:#fff;color:#1a2e28}
        .spot-img{width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease;display:block}
        @media(max-width:600px){.featured-grid{grid-template-columns:1fr!important}}
        .pop-img-wrap img{transition:transform 0.5s ease}.pop-img-wrap:hover img{transform:scale(1.05)}
        @keyframes slowZoom{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes skeletonPulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
        .img-skeleton{background:linear-gradient(90deg,#e8f0ed 0%,#f5f8f7 50%,#e8f0ed 100%);background-size:200% 100%;animation:skeletonShimmer 1.5s ease-in-out infinite}
        @keyframes skeletonShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ── SPOT CARD REDESIGN ───────────────────────────────── */
        .fv-spot-card{background:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;cursor:pointer;transition:transform 0.2s ease,box-shadow 0.2s ease;position:relative}
        .fv-spot-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.12)}
        .fv-spot-card .card-img-wrap{position:relative;width:100%;height:220px;overflow:hidden}
        @media(max-width:768px){.fv-spot-card .card-img-wrap{height:200px}}
        .fv-badge-level{position:absolute;bottom:12px;left:12px;font-size:11px;font-weight:500;padding:3px 10px;border-radius:20px;backdrop-filter:blur(6px);color:#fff;z-index:3}
        .fv-badge-level.debutant{background:rgba(22,163,74,0.85)}
        .fv-badge-level.intermediaire{background:rgba(202,138,4,0.85)}
        .fv-badge-level.expert{background:rgba(185,28,28,0.85)}
        .fv-btn-fav{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;color:#fff;font-size:15px;transition:background 0.2s}
        .fv-btn-fav:hover{background:rgba(255,255,255,0.35)}
        .fv-spot-card .card-body{padding:14px 16px 12px}
        .fv-spot-card .card-region{font-size:11px;color:#9ca3af;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:4px}
        .fv-spot-card .card-title{font-family:'Fraunces',Georgia,serif;font-size:17px;font-weight:600;color:#111827;line-height:1.3;margin-bottom:8px}
        .fv-spot-card .card-rating{display:flex;align-items:center;gap:4px;font-size:12px;color:#6b7280;margin-bottom:10px}
        .fv-spot-card .card-rating .star{color:#f59e0b}
        .fv-spot-card .card-meta{display:flex;gap:10px;font-size:12px;color:#6b7280;margin-bottom:10px;flex-wrap:wrap}
        .fv-spot-card .card-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px}
        .fv-spot-card .card-tag{font-size:11px;padding:3px 8px;border-radius:6px;background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb}
        .fv-spot-card .card-footer{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f3f4f6;padding:11px 16px 14px}
        .fv-spot-card .card-price-label{font-size:10px;color:#9ca3af;display:block;line-height:1;margin-bottom:2px}
        .fv-spot-card .card-price-val{font-size:20px;font-weight:700;color:#111827;line-height:1}
        .fv-spot-card .card-price-unit{font-size:12px;font-weight:400;color:#9ca3af}
        .fv-spot-card .card-cta{background:#0d6e8a;color:#fff;font-size:13px;font-weight:500;padding:8px 18px;border-radius:10px;border:none;cursor:pointer;transition:background 0.15s;font-family:'DM Sans',sans-serif}
        .fv-spot-card .card-cta:hover{background:#0a5a72}
        @keyframes fv-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .fv-skeleton{background:#e5e7eb;animation:fv-pulse 1.5s ease-in-out infinite;width:100%;height:100%}
      `}</style>

      {/* subtle light bg accents */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle,rgba(26,158,110,0.04) 0%,transparent 70%)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle,rgba(8,145,178,0.03) 0%,transparent 70%)", borderRadius: "50%", filter: "blur(60px)" }} />
      </div>

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, background: "#fff", boxShadow: "0 1px 0 rgba(0,0,0,0.08)", zIndex: 100, padding: "0 20px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <span style={{ fontSize: "1.4rem" }}>🌊</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1a9e6e", letterSpacing: "-0.5px" }}>FleuVibe</span>
            {!isOnline && <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", display: "inline-block", marginLeft: 4 }} title="Hors ligne" />}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {session && isAdmin && <button onClick={() => setShowAdmin(true)} style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 600, fontSize: "0.8rem", padding: "6px 10px" }}>Admin</button>}
            {session ? (
              <button onClick={() => setShowProfile(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px 6px 6px", background: "#f5f8f7", border: "1px solid #e0ece7", borderRadius: "40px", color: "#1a2e28", fontSize: "0.82rem", fontWeight: 600 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{userName[0].toUpperCase()}</div>
                {userName.split(" ")[0]}
                {isPremium && <span style={{ fontSize: "0.7rem", color: "#f59e0b" }}>★</span>}
              </button>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{ padding: "9px 22px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "40px", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>Connexion</button>
            )}
          </div>
        </div>
      </header>

      {/* ── LANDING (non connecté) ── */}
      {!session && (
        <>
          <HeroSection
            spots={spots}
            search={search}
            setSearch={setSearch}
            handleAISearch={handleAISearch}
            aiSearchLoading={aiSearchLoading}
            setShowAuth={setShowAuth}
            handlePageChange={handlePageChange}
          />
          <ProofBar />
          <ProblemSection />
          <HowItWorksSection />
          <FeaturesSection />
          <TestimonialsSection />
          <PricingSection setShowAuth={setShowAuth} setShowPremium={setShowPremium} />
          <FinalCTASection setShowAuth={setShowAuth} />
        </>
      )}

      {session && <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px 40px", position: "relative", zIndex: 1 }}>


        {/* SPOTS À LA UNE */}
        {page === "explore" && !search && (
          <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ marginBottom: "20px", marginTop: "32px", transitionDelay: "0.05s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2e28" }}>🔥 Spots populaires</h2>
              <button onClick={() => { setSearch(""); clearAISearch(); }} style={{ color: "#1a9e6e", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}>Voir tout →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {[...spots].sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0) || (b.rating || 0) - (a.rating || 0)).slice(0, 3).map(s => (
                <div key={s.id} onClick={() => { handlePageChange("explore"); setTimeout(() => setSearch(s.name), 100); }}
                  style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", border: "1px solid #e8f0ed", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}>
                  <div className="pop-img-wrap" style={{ position: "relative", height: "160px", overflow: "hidden" }}>
                    <SpotImage
                      spot={s}
                      fallbackUrl={getSpotPhoto(s)}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                    {s.rating && <div style={{ position: "absolute", top: 10, left: 10, padding: "3px 8px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", borderRadius: "20px", fontSize: "0.65rem", color: "#fff", fontWeight: 600 }}>⭐ {s.rating.toFixed(1)}</div>}
                    <button
                      onClick={e => { e.stopPropagation(); toggleFav(s.id); }}
                      aria-label={favorites.includes(s.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                      style={{ position: "absolute", top: 10, right: 10, background: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", cursor: "pointer" }}
                    >
                      {favorites.includes(s.id) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a2e28", marginBottom: "3px" }}>{s.name.split("·")[0].trim()}</p>
                    <p style={{ fontSize: "0.68rem", color: "#7a9a8e" }}>{COUNTRIES[s.country]?.flag} {COUNTRIES[s.country]?.name} · {s.region}</p>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", fontSize: "0.65rem", color: "#8aa89e" }}>
                      <span>📏 {s.distance}</span><span>⏱️ {s.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NAV TABS */}
        <div style={{ display: "flex", gap: "2px", marginTop: "20px", marginBottom: "24px", background: "#f0f5f3", borderRadius: "14px", padding: "4px" }}>
          {[["explore", "Explorer"], ["map", "Carte"], ["hidden", "Pépites"], ["favorites", favorites.length > 0 ? `Favoris (${favorites.length})` : "Favoris"]].map(([id, label]) => (
            <button key={id} onClick={() => handlePageChange(id)} style={{ flex: 1, padding: "9px 4px", borderRadius: "10px", border: "none", fontSize: "0.82rem", fontWeight: 600, background: (page === id || (page === "expeditions" && id === "explore")) ? "#fff" : "transparent", color: (page === id || (page === "expeditions" && id === "explore")) ? "#1a2e28" : "#6a8a80", boxShadow: (page === id || (page === "expeditions" && id === "explore")) ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s", cursor: "pointer", whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>

        {/* CONTENU PRINCIPAL avec transition */}
        {pageTransition ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="loading-spinner" style={{ margin: "0 auto 16px" }} />
              <div className="loading-wave"><span /><span /><span /><span /><span /></div>
            </div>
          </div>
        ) : (
          <div className="page-enter">

        {/* EXPLORE */}
        {(page === "explore" || page === "expeditions") && (
          <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "0.1s" }}>
            <div style={{ position: "relative", marginBottom: "14px" }}>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setDbPage(1); if (aiSearchActive) clearAISearch(); }}
                onKeyDown={e => e.key === "Enter" && handleAISearch()}
                placeholder={page === "expeditions" ? "🔍  Filtrer les expéditions..." : '🔍  Spot, activité, pays...  ou  🤖 "surf débutant Bali"'}
                style={{ width: "100%", padding: "13px 18px", paddingRight: "130px", background: "#fff", border: `1px solid ${aiSearchActive ? "rgba(99,102,241,0.5)" : "#d0dfdc"}`, borderRadius: "50px", color: "#1a2e28", fontSize: "0.84rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} />
              <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "4px" }}>
                {aiSearchActive && <button onClick={clearAISearch} style={{ padding: "5px 10px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "20px", color: "#dc2626", fontSize: "0.65rem", fontWeight: 600 }}>✕ Reset</button>}
                {page === "explore" && <button onClick={handleAISearch} disabled={aiSearchLoading || !search.trim()} style={{ padding: "5px 12px", background: aiSearchLoading ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "20px", color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>
                  {aiSearchLoading ? "⏳" : "🤖 IA"}
                </button>}
              </div>
            </div>
            {aiSearchActive && (
              <div style={{ padding: "8px 14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", marginBottom: "12px", fontSize: "0.72rem", color: "#6366f1", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span>🤖 Recherche IA · <strong>{dbTotal} résultats</strong></span>
                {aiFilters?.type && <span style={{ padding: "1px 7px", background: "rgba(99,102,241,0.1)", borderRadius: "10px" }}>{aiFilters.type}</span>}
                {aiFilters?.difficulty && <span style={{ padding: "1px 7px", background: "rgba(99,102,241,0.1)", borderRadius: "10px" }}>{aiFilters.difficulty}</span>}
                {aiFilters?.countries?.map(c => <span key={c} style={{ padding: "1px 7px", background: "rgba(99,102,241,0.1)", borderRadius: "10px" }}>{COUNTRIES[c]?.flag} {c}</span>)}
              </div>
            )}
            {page === "explore" && !aiSearchActive && (() => {
              const activeCount = [selType !== "ALL", selDiff !== "ALL", selContinent !== "ALL"].filter(Boolean).length;
              return (
                <>
                  {/* Quick pill filters */}
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px", marginBottom: "10px", scrollbarWidth: "none" }}>
                    {[
                      ["ALL","ALL","🌍 Tous"],
                      ["RIVER","ALL","🏞️ Rivières"],
                      ["LAKE","ALL","🏔️ Lacs"],
                      ["SEA","ALL","🌊 Mer"],
                      ["ALL","Facile","🟢 Facile"],
                      ["ALL","Intermédiaire","🟡 Intermédiaire"],
                      ["ALL","Sportif","🔴 Sportif"],
                    ].map(([type, diff, label]) => {
                      const active = selType === type && selDiff === diff && (type !== "ALL" || diff !== "ALL" || (selType === "ALL" && selDiff === "ALL"));
                      const isAll = type === "ALL" && diff === "ALL";
                      const pillActive = isAll ? (selType === "ALL" && selDiff === "ALL") : (selType === type && selDiff === diff);
                      return (
                        <button
                          key={label}
                          onClick={() => { setSelType(type); setSelDiff(diff); setDbPage(1); }}
                          style={{
                            padding: "7px 16px", borderRadius: "50px", whiteSpace: "nowrap",
                            fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", flexShrink: 0,
                            background: pillActive ? "linear-gradient(135deg,#1a9e6e,#0891b2)" : "#f0f5f3",
                            color: pillActive ? "#fff" : "#3a6a5e",
                            border: `1px solid ${pillActive ? "transparent" : "#d4e8e0"}`,
                            transition: "all 0.15s ease",
                          }}
                        >{label}</button>
                      );
                    })}
                    {/* Région collapse trigger */}
                    <button
                      onClick={() => setShowFilters(f => !f)}
                      style={{
                        padding: "7px 16px", borderRadius: "50px", whiteSpace: "nowrap",
                        fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", flexShrink: 0,
                        background: selContinent !== "ALL" ? "rgba(26,158,110,0.1)" : "#f0f5f3",
                        color: selContinent !== "ALL" ? "#1a9e6e" : "#3a6a5e",
                        border: `1px solid ${selContinent !== "ALL" ? "rgba(26,158,110,0.35)" : "#d4e8e0"}`,
                      }}
                    >🌍 Région {selContinent !== "ALL" ? `· ${selContinent}` : ""}</button>
                    {activeCount > 0 && (
                      <button
                        onClick={() => { setSelType("ALL"); setSelDiff("ALL"); setSelContinent("ALL"); setDbPage(1); }}
                        style={{ padding: "7px 12px", borderRadius: "50px", whiteSpace: "nowrap", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", flexShrink: 0, background: "none", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)" }}
                      >✕ Reset</button>
                    )}
                  </div>
                  {showFilters && (
                    <div style={{ background: "#f7faf9", border: "1px solid #e0ece7", borderRadius: "20px", padding: "16px", marginBottom: "14px", animation: "slideUp 0.2s ease" }}>
                      <div>
                        <p style={{ fontSize: "0.65rem", color: "#5a8a78", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.5px" }}>RÉGION</p>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {[["ALL", "🌍 Monde"], ["EU", "🇪🇺 Europe"], ["AM", "🌎 Amériques"], ["AS", "🌏 Asie"], ["AF", "🌍 Afrique"], ["OC", "🌊 Océanie"]].map(([id, label]) => (
                            <button key={id} onClick={() => { setSelContinent(id); setDbPage(1); }} style={{ padding: "7px 14px", borderRadius: "50px", border: "1px solid #d4e8e0", fontSize: "0.7rem", fontWeight: 600, background: selContinent === id ? "linear-gradient(135deg,#1a9e6e,#0891b2)" : "#fff", color: selContinent === id ? "#fff" : "#3a6a5e" }}>{label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1a9e6e", background: "rgba(26,158,110,0.08)", border: "1px solid rgba(26,158,110,0.2)", borderRadius: "20px", padding: "3px 10px" }}>{dbTotal} spots</span>
              <span style={{ fontSize: "0.68rem", color: "#6a8a80" }}>{[...new Set(dbSpots.map(s => s.country))].length} pays{page === "expeditions" ? " · ⛺ Expéditions longue durée" : ""}</span>
            </div>
            {dbLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><div className="loading-spinner" /></div>
            ) : dbSpots.length === 0 ? (
              <div style={{ padding: "50px", textAlign: "center", background: "#fff", borderRadius: "24px", border: "1px solid #e8f0ed" }}>
                <span style={{ fontSize: "3rem" }}>🏄</span>
                <p style={{ marginTop: "14px", color: "#6a8a80", marginBottom: "14px" }}>Aucun spot trouvé.</p>
                <button onClick={() => setShowSubmit(true)} style={{ padding: "9px 20px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>➕ Ajouter le premier</button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                  {dbSpots.flatMap((s, i) => {
                    const card = <SpotCard key={s.id} spot={s} isFav={favorites.includes(s.id)} onFav={toggleFav} onBook={setBookingSpot} session={session} userName={userName} isPremium={isPremium} onShowPremium={() => setShowPremium(true)} allSpots={spots} />;
                    if (!isPremium && (i + 1) % 5 === 0 && i < dbSpots.length - 1) {
                      return [card, <div key={`ad_${i}`} style={{ gridColumn: "1 / -1" }}><NativeAd activities={s.activities || []} type={s.type || ''} /></div>];
                    }
                    return [card];
                  })}
                </div>
                {dbTotal > SPOTS_PER_PAGE && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "24px", paddingBottom: "8px" }}>
                    <button
                      onClick={() => setDbPage(p => Math.max(1, p - 1))}
                      disabled={dbPage === 1}
                      style={{ padding: "8px 20px", borderRadius: "24px", border: "1px solid rgba(26,158,110,0.3)", background: dbPage === 1 ? "rgba(255,255,255,0.03)" : "rgba(26,158,110,0.1)", color: dbPage === 1 ? "#3a6a5a" : "#7ecfb0", fontSize: "0.78rem", fontWeight: 600 }}
                    >← Précédent</button>
                    <span style={{ fontSize: "0.72rem", color: "#5a8a78", minWidth: "100px", textAlign: "center" }}>
                      {(dbPage - 1) * SPOTS_PER_PAGE + 1}–{Math.min(dbPage * SPOTS_PER_PAGE, dbTotal)} / {dbTotal}
                    </span>
                    <button
                      onClick={() => setDbPage(p => p + 1)}
                      disabled={dbPage * SPOTS_PER_PAGE >= dbTotal}
                      style={{ padding: "8px 20px", borderRadius: "24px", border: "1px solid rgba(26,158,110,0.3)", background: dbPage * SPOTS_PER_PAGE >= dbTotal ? "rgba(255,255,255,0.03)" : "rgba(26,158,110,0.1)", color: dbPage * SPOTS_PER_PAGE >= dbTotal ? "#3a6a5a" : "#7ecfb0", fontSize: "0.78rem", fontWeight: 600 }}
                    >Suivant →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CARTE INTERACTIVE */}
        {page === "map" && (
          <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "0.1s" }}>
            <MapView spots={spots} favorites={favorites} onFav={toggleFav} session={session} onShowAuth={() => setShowAuth(true)} onBook={setBookingSpot} isPremium={isPremium} onShowPremium={() => setShowPremium(true)} userName={userName} />
          </div>
        )}

        {/* PÉPITES CACHÉES */}
        {page === "hidden" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#b45309", marginBottom: "5px" }}>💎 Pépites Cachées</h2>
              <p style={{ color: "#4a7a6a", fontSize: "0.8rem" }}>Spots secrets partagés par la communauté. Pas dans les guides.</p>
            </div>
            {HIDDEN_GEMS.map(gem => (
              <div key={gem.id} style={{ marginBottom: "12px", background: "linear-gradient(135deg,rgba(245,158,11,0.06),rgba(255,255,255,0.02))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "18px", overflow: "hidden" }}>
                <div style={{ height: "3px", background: "linear-gradient(90deg,#f59e0b,#ef4444,transparent)" }} />
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>{gem.emoji}</span>
                    <div>
                      <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#92400e" }}>{gem.name} {COUNTRIES[gem.country]?.flag}</h3>
                      <div style={{ color: "#6a8a80", fontSize: "0.7rem" }}>📍 {gem.region} · {COUNTRIES[gem.country]?.name} · {gem.difficulty}</div>
                    </div>
                    <span style={{ marginLeft: "auto", padding: "2px 8px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "20px", fontSize: "0.6rem", color: "#92400e" }}>📅 {gem.season}</span>
                  </div>
                  <p style={{ color: "#4a6a60", fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "8px" }}>{gem.description}</p>
                  <div style={{ padding: "8px 10px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: "10px" }}>
                    <p style={{ fontSize: "0.72rem", color: "#92400e" }}>🤫 <strong>Secret communauté :</strong> {gem.secret}</p>
                  </div>
                  <div style={{ display: "flex", gap: "5px", marginTop: "8px", flexWrap: "wrap" }}>
                    {gem.activities?.map(a => <span key={a} style={{ padding: "2px 8px", background: "rgba(245,158,11,0.1)", borderRadius: "20px", fontSize: "0.65rem", color: "#92400e" }}>{a}</span>)}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: "16px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "18px", textAlign: "center" }}>
              <p style={{ color: "#92400e", fontSize: "0.8rem", marginBottom: "10px" }}>🌟 Tu connais un spot secret ? Partage-le avec la communauté !</p>
              <button onClick={() => setShowSubmit(true)} style={{ padding: "8px 20px", background: "linear-gradient(135deg,#f59e0b,#ef4444)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>💎 Ajouter une pépite</button>
            </div>
          </div>
        )}

        {/* MÉTÉO */}
        {page === "weather" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a9e6e", marginBottom: "5px" }}>🌤️ Conditions en temps réel</h2>
              <p style={{ color: "#6a8a80", fontSize: "0.8rem" }}>Météo actuelle + 🤖 conseils IA.</p>
            </div>
            {spots.slice(0, 18).map(s => (
              <div key={s.id} style={{ marginBottom: "10px", padding: "13px 15px", background: "#fff", border: "1px solid #e8f0ed", borderRadius: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "1.1rem" }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a2e28" }}>{s.name} {COUNTRIES[s.country]?.flag}</h3>
                    <p style={{ fontSize: "0.68rem", color: "#6a8a80" }}>{s.river} · {s.region}</p>
                  </div>
                </div>
                <WeatherWidget coords={s.coords} spotName={s.name} difficulty={s.difficulty} />
              </div>
            ))}
          </div>
        )}

        {/* DESTINATIONS */}
        {page === "tourism" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2e28", marginBottom: "5px" }}>🤝 Destinations Nautiques Partenaires</h2>
              <p style={{ color: "#6a8a80", fontSize: "0.8rem" }}>Régions & clubs officiellement partenaires de FleuVibe</p>
            </div>
            {SPONSORED.map(r => (
              <div key={r.id} style={{ marginBottom: "12px", background: `linear-gradient(135deg,${r.color}07,rgba(255,255,255,0.02))`, border: `1px solid ${r.color}26`, borderRadius: "18px", overflow: "hidden" }}>
                <div style={{ height: "3px", background: `linear-gradient(90deg,${r.color},${r.color}44)` }} />
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "1.8rem" }}>{r.flag}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a2e28" }}>{r.name}</h3>
                        <span style={{ padding: "2px 7px", background: `${r.color}16`, border: `1px solid ${r.color}30`, borderRadius: "20px", fontSize: "0.6rem", color: r.color, fontWeight: 700 }}>⭐ {r.badge}</span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "#6a8a80" }}>{r.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {spots.filter(s => s.sponsored === r.name).map(s => (
                      <button key={s.id} onClick={() => { setPage("explore"); }} style={{ padding: "3px 9px", background: "#f0f5f3", border: "1px solid #d4e8e0", borderRadius: "20px", color: "#1a9e6e", fontSize: "0.7rem", fontWeight: 600 }}>{s.emoji} {s.name.split("·")[0]}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: "22px", background: "#fff", border: "1px solid #e8f0ed", borderRadius: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>🌍</div>
              <h3 style={{ fontSize: "0.97rem", fontWeight: 700, color: "#1a2e28", marginBottom: "6px" }}>Vous gérez un site ou club nautique ?</h3>
              <p style={{ color: "#6a8a80", fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "12px" }}>Mettez vos spots en avant auprès de milliers de passionnés de sports aquatiques.</p>
              <button style={{ padding: "9px 22px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>📩 Nous contacter</button>
            </div>
          </div>
        )}

        {/* FAVORIS */}
        {page === "favorites" && (
          <div>
            {favorites.length === 0 && <div style={{ padding: "50px", textAlign: "center", background: "#fff", borderRadius: "24px", border: "1px solid #e8f0ed" }}><div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏞️</div><h3 style={{ color: "#1a2e28", marginBottom: "8px" }}>Aucun favori pour l'instant</h3><button onClick={() => setPage("explore")} style={{ padding: "9px 20px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "40px", color: "#fff", fontWeight: 600, fontSize: "0.83rem" }}>Explorer les spots</button></div>}
            {filtered.map(s => <SpotCard key={s.id} spot={s} isFav={favorites.includes(s.id)} onFav={toggleFav} onBook={setBookingSpot} session={session} userName={userName} isPremium={isPremium} onShowPremium={() => setShowPremium(true)} allSpots={spots} />)}
          </div>
        )}

          </div>
        )}
      </div>}

      {/* FOOTER */}
      <footer style={{ background: "#111827", padding: "64px 32px 32px", marginTop: "60px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "40px", marginBottom: "48px", paddingBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.4rem" }}>🌊</span>
                <span style={{ fontWeight: 700, color: "#fff", fontSize: "1.1rem" }}>FleuVibe</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", lineHeight: 1.7, marginBottom: "20px" }}>Connectez les aventuriers aux plus beaux plans d'eau du monde depuis 2024.</p>
              <div style={{ display: "flex", gap: "10px" }}>
                {[["📸", "Instagram", "#"], ["👍", "Facebook", "#"], ["▶️", "YouTube", "#"], ["🎵", "TikTok", "#"]].map(([icon, label, href]) => (
                  <a key={label} href={href} aria-label={`FleuVibe sur ${label}`} rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", textDecoration: "none", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  >{icon}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Expériences</h4>
              {["Kayak & Canoë", "Rafting", "SUP & Voile", "Camping rivière", "Expéditions"].map(l => <p key={l} style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginBottom: "10px", cursor: "pointer" }}>{l}</p>)}
            </div>
            <div>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Destinations</h4>
              {["France", "Espagne", "Suisse", "Canada", "Worldwide"].map(l => <p key={l} style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginBottom: "10px", cursor: "pointer" }}>{l}</p>)}
            </div>
            <div>
              <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Support</h4>
              {["Centre d'aide", "Contact", "Sécurité", "Partenaires", "Presse"].map(l => <p key={l} style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginBottom: "10px", cursor: "pointer" }}>{l}</p>)}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>© 2026 FleuVibe — {spots.length}+ spots · {GlobalStats.totalCountries} pays · 🤖 IA · 📡 PWA</p>
            <div style={{ display: "flex", gap: "20px" }}>
              {["Confidentialité", "CGU", "Cookies"].map(l => <span key={l} style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", cursor: "pointer" }}>{l}</span>)}
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setShowConversionChat(true)}
        title="Des questions ? On t'aide"
        style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1500, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", boxShadow: "0 6px 20px rgba(26,158,110,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", transition: "transform 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >💬</button>

      {/* AI CHAT MODALS */}
      {showTripFinder && <AIChat onClose={() => setShowTripFinder(false)} systemPrompt={TRIP_FINDER_SYSTEM} title="🧭 Trip Finder" subtitle="Trouve ton activité rivière idéale" greeting="Salut ! 🌊 Je suis ton guide FleuVibe. Tu cherches plutôt une sortie tranquille ou quelque chose qui envoie du bois ?" accentColor="rgba(26,158,110,0.3)" />}
      {showConversionChat && <AIChat onClose={() => setShowConversionChat(false)} systemPrompt={CONVERSION_SYSTEM} title="💬 On t'aide à réserver" subtitle="Des questions ? On lève tous les freins." greeting="Bonjour ! 😊 Tu hésites ou tu as une question avant de réserver ? Je suis là." accentColor="rgba(245,158,11,0.3)" />}

      {/* MODALS */}
      {bookingSpot && <BookingModal spot={bookingSpot} provider={ALL_PROVIDERS.find(p => p.routeIds?.includes(bookingSpot.id))} onClose={() => setBookingSpot(null)} />}
      {partnerPortal && <PartnerPortal partner={partnerPortal} onClose={() => setPartnerPortal(null)} />}
      {showAdmin && <AdminDashboard session={session} spots={spots} onClose={() => setShowAdmin(false)} />}
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} onActivate={() => { setIsPremium(true); addXP(200); }} />}
      {showSubmit && <SubmitSpotModal onClose={() => setShowSubmit(false)} onAdd={s => { setSpots(x => [...x, s]); addXP(100); }} session={session} showAuth={() => { setShowSubmit(false); setShowAuth(true); }} />}

      {/* CHALLENGES MODAL */}
      {showChallenges && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowChallenges(false); }}>
          <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "28px", padding: "28px", maxWidth: "560px", width: "100%", maxHeight: "88vh", overflowY: "auto", animation: "slideUp 0.3s ease", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div><h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fbbf24" }}>🏆 Challenges</h2><p style={{ fontSize: "0.72rem", color: "#5a8a78" }}>Complète des défis pour gagner des badges et de l'XP</p></div>
              <button onClick={() => setShowChallenges(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#5a8a78", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {CHALLENGES.map(ch => {
                const current = Math.min(ch.progress(userStats, userXP), ch.goal);
                const pct = Math.round((current / ch.goal) * 100);
                const done = current >= ch.goal;
                return (
                  <div key={ch.id} style={{ padding: "14px 16px", background: done ? "rgba(26,158,110,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(26,158,110,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "1.4rem" }}>{ch.icon}</span>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: done ? "#a8edcf" : "#daf0e8" }}>{ch.name}</div>
                          <div style={{ fontSize: "0.65rem", color: "#5a8a78" }}>{ch.desc}</div>
                        </div>
                      </div>
                      {done ? <span style={{ fontSize: "1.2rem" }}>✅</span> : <span style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 700 }}>{current}/{ch.goal}</span>}
                    </div>
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: done ? "linear-gradient(90deg,#1a9e6e,#0891b2)" : "linear-gradient(90deg,#f59e0b,#ef4444)", borderRadius: "3px", transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "#fbbf24" }}>🎁 {ch.reward.badge} · +{ch.reward.xp} XP</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GROUPES MODAL */}
      {showGroups && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowGroups(false); }}>
          <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: "1px solid rgba(8,145,178,0.3)", borderRadius: "28px", padding: "28px", maxWidth: "540px", width: "100%", maxHeight: "88vh", overflowY: "auto", animation: "slideUp 0.3s ease", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div><h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#67e8f9" }}>👥 Groupes d'expédition</h2><p style={{ fontSize: "0.72rem", color: "#5a8a78" }}>Planifiez et coordonnez vos sorties entre passionnés</p></div>
              <button onClick={() => setShowGroups(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#5a8a78", borderRadius: "50%", width: 32, height: 32, cursor: "pointer" }}>✕</button>
            </div>
            {/* Créer un groupe */}
            <GroupCreator spots={spots} onCreate={(name, spotId, date, meeting) => { createGroup(name, spotId, date, meeting); }} />
            {/* Groupes existants */}
            {groups.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#a8edcf", marginBottom: "10px" }}>Mes expéditions ({groups.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {groups.map(g => (
                    <div key={g.id} style={{ padding: "12px 14px", background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.2)", borderRadius: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#67e8f9" }}>{g.name}</div><div style={{ fontSize: "0.65rem", color: "#5a8a78" }}>{g.spot?.name} · 📅 {g.date || "Date à définir"}</div></div>
                        <span style={{ fontSize: "0.68rem", color: "#8ab8b0" }}>👥 {g.members.length}</span>
                      </div>
                      {g.meeting && <div style={{ fontSize: "0.62rem", color: "#5a8a78", marginTop: "4px" }}>📍 {g.meeting}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {groups.length === 0 && !session && <p style={{ fontSize: "0.72rem", color: "#3a6a5a", textAlign: "center", marginTop: "10px" }}>Connecte-toi pour créer un groupe !</p>}
            {/* Affiliation en bas */}
            <div style={{ marginTop: "18px", padding: "14px", background: "rgba(26,158,110,0.06)", border: "1px solid rgba(26,158,110,0.15)", borderRadius: "14px" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#a8edcf", marginBottom: "8px" }}>🤝 Programme d'affiliation</p>
              <p style={{ fontSize: "0.65rem", color: "#5a8a78", marginBottom: "10px" }}>Parraine des amis et gagne des récompenses !</p>
              <button onClick={() => { setShowGroups(false); setShowAffiliate(true); }} style={{ padding: "7px 16px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 600, fontSize: "0.72rem", cursor: "pointer" }}>🔗 Mon lien de parrainage</button>
            </div>
          </div>
        </div>
      )}

      {/* AFFILIATE MODAL */}
      {showAffiliate && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowAffiliate(false); }}>
          <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: "1px solid rgba(26,158,110,0.3)", borderRadius: "28px", padding: "28px", maxWidth: "440px", width: "100%", animation: "slideUp 0.3s ease", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🤝</div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#a8edcf", marginBottom: "6px" }}>Programme d'affiliation</h2>
              <p style={{ fontSize: "0.78rem", color: "#5a8a78" }}>Parraine tes amis · Gagne des récompenses</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              {[["1 parrainage", "🤝 Badge Parrain", "#10b981"], ["5 parrainages", "👑 Badge Ambassadeur", "#f59e0b"], ["10 parrainages", "⭐ 3 mois Premium offerts", "#ef4444"], ["20 parrainages", "⭐ 6 mois Premium offerts", "#8b5cf6"]].map(([label, reward, col]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: `${col}10`, border: `1px solid ${col}25`, borderRadius: "12px" }}>
                  <span style={{ fontSize: "0.72rem", color: "#8ab8b0" }}>{label}</span>
                  <span style={{ fontSize: "0.72rem", color: col, fontWeight: 600 }}>{reward}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.7rem", color: "#6a9a8c", marginBottom: "6px", fontWeight: 500 }}>Ton lien unique</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input readOnly value={AffiliateProgram.generateLink(session?.user?.id || userName.replace(/\s/g,"_"))} style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(26,158,110,0.2)", borderRadius: "12px", color: "#8ab8b0", fontSize: "0.72rem", outline: "none" }} />
                <button onClick={copyAffiliateLink} style={{ padding: "10px 14px", background: affiliateCopied ? "rgba(26,158,110,0.3)" : "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 600, fontSize: "0.72rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {affiliateCopied ? "✅ Copié !" : "📋 Copier"}
                </button>
              </div>
            </div>
            <button onClick={() => setShowAffiliate(false)} style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", color: "#5a8a78", fontSize: "0.78rem", cursor: "pointer" }}>Fermer</button>
          </div>
        </div>
      )}

      {/* AUTH */}
      {showAuth && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowAuth(false); }}>
          <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", maxWidth: "380px", width: "100%", padding: "28px", animation: "pop 0.3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "2.5rem" }}>🌊</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#a8edcf", marginTop: "8px", marginBottom: "4px" }}>{authMode === "login" ? "Connexion à FleuVibe" : "Créer un compte"}</h3>
            </div>
            {authError && <div style={{ padding: "8px 12px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.22)", borderRadius: "10px", color: "#f87171", fontSize: "0.76rem", marginBottom: "12px" }}>{authError}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {authMode === "signup" && <input value={authForm.fullName} onChange={e => setAuthForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Prénom et nom" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#e8f4f0", fontSize: "0.82rem" }} />}
              <input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#e8f4f0", fontSize: "0.82rem" }} />
              <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} placeholder="Mot de passe" style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#e8f4f0", fontSize: "0.82rem" }} onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleSignIn() : handleSignUp())} />
              <button onClick={authMode === "login" ? handleSignIn : handleSignUp} disabled={authLoading} style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "20px", color: "#fff", fontWeight: 700, fontSize: "0.85rem", opacity: authLoading ? 0.7 : 1 }}>
                {authLoading ? "⏳ Chargement..." : authMode === "login" ? "🌊 Se connecter" : "✨ Créer mon compte"}
              </button>
              <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }} style={{ background: "none", border: "none", color: "#5a9a80", fontSize: "0.76rem", textDecoration: "underline" }}>
                {authMode === "login" ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE */}
      {showProfile && session && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowProfile(false); }}>
          <div style={{ background: "#fff", border: "1px solid #e0ece7", borderRadius: "24px", maxWidth: "380px", width: "100%", padding: "26px", animation: "pop 0.3s ease", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>

            {/* Close */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
              <button onClick={() => setShowProfile(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#9ab0a8", cursor: "pointer", padding: "4px 8px" }}>✕</button>
            </div>

            {/* Avatar + identity */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${currentTheme.primary},${currentTheme.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 700, color: "#fff", margin: "0 auto 10px" }}>{userName[0].toUpperCase()}</div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a2e28" }}>{userName}</h2>
              <p style={{ color: "#9ab0a8", fontSize: "0.8rem", marginTop: "3px" }}>{session.user.email}</p>
              {isPremium && <span style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "20px", fontSize: "0.78rem", color: "#92400e", fontWeight: 700 }}>⭐ Membre Premium</span>}
            </div>

            {/* Level */}
            <div style={{ marginBottom: "16px" }}><LevelBadge xp={userXP} /></div>

            {/* Earned badges */}
            {earnedBadges.length > 0 && (
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "16px" }}>
                {earnedBadges.map(b => <span key={b.name} style={{ padding: "4px 10px", background: "#f0f9f5", border: "1px solid #d1ede3", borderRadius: "20px", fontSize: "0.75rem", color: "#1a9e6e", fontWeight: 600 }}>{b.icon} {b.name}</span>)}
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {[["❤️", favorites.length, "Favoris"], ["🌊", spots.length, "Spots"], ["🤖", isPremium ? "ON" : "OFF", "IA"]].map(([ic, val, label]) => (
                <div key={label} style={{ flex: 1, padding: "12px 6px", background: "#f7faf9", border: "1px solid #e0ece7", borderRadius: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: "1rem" }}>{ic}</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: val === "OFF" ? "#dc2626" : "#1a9e6e" }}>{val}</div>
                  <div style={{ fontSize: "0.75rem", color: "#9ab0a8", marginTop: "2px" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              <button onClick={() => { setShowProfile(false); setShowSubmit(true); }} style={{ padding: "10px 8px", background: "#f0f9f5", border: "1px solid #d1ede3", borderRadius: "12px", color: "#1a9e6e", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>+ Ajouter un spot</button>
              <button onClick={() => { setShowProfile(false); setShowChallenges(true); }} style={{ padding: "10px 8px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", color: "#92400e", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>🏆 Défis</button>
              <button onClick={() => { setShowProfile(false); setShowGroups(true); }} style={{ padding: "10px 8px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "12px", color: "#0369a1", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>👥 Groupes</button>
              <button onClick={() => { setShowProfile(false); setShowAffiliate(true); }} style={{ padding: "10px 8px", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", color: "#7c3aed", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>🤝 Parrainer</button>
            </div>

            {/* Theme switcher */}
            <div style={{ marginBottom: "16px", padding: "14px", background: "#f7faf9", border: "1px solid #e0ece7", borderRadius: "14px" }}>
              <p style={{ fontSize: "0.75rem", color: "#9ab0a8", fontWeight: 600, marginBottom: "10px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Thème</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button key={key} onClick={() => setTheme(key)} title={t.name} style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${t.primary},${t.secondary})`, border: theme === key ? "2px solid #1a2e28" : "2px solid #e0ece7", cursor: "pointer" }} />
                ))}
              </div>
            </div>

            {/* Premium upsell */}
            {!isPremium && <button onClick={() => { setShowProfile(false); setShowPremium(true); }} style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#f59e0b,#ef4444)", border: "none", borderRadius: "14px", color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: "8px", cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>⭐ Passer Premium</button>}
            {!isPremium && isAdmin && <button onClick={() => { setIsPremium(true); addXP(200); setShowProfile(false); }} style={{ width: "100%", padding: "8px", background: "#f0f0ff", border: "1px solid #c7d2fe", borderRadius: "14px", color: "#6366f1", fontWeight: 500, fontSize: "0.8rem", marginBottom: "8px", cursor: "pointer" }}>🧪 Tester Premium (dev)</button>}
            {isPremium && <button onClick={() => setIsPremium(false)} style={{ width: "100%", padding: "10px", background: "#f0f0ff", border: "1px solid #c7d2fe", borderRadius: "14px", color: "#6366f1", fontWeight: 600, fontSize: "0.82rem", marginBottom: "8px", cursor: "pointer" }}>🤖 IA Premium Active ✓</button>}

            {/* Sign out */}
            <button onClick={handleSignOut} style={{ width: "100%", padding: "10px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "14px", color: "#e11d48", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>Se déconnecter</button>
          </div>
        </div>
      )}
    </div>
  );
}
