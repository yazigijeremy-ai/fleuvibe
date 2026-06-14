// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const SUPABASE_URL = "https://mdfzrqehdhvvhrqvinpo.supabase.co";

export const CONTINENTS = {
  ALL: { name: "Monde entier", flag: "🌍" },
  EU:  { name: "Europe",       flag: "🇪🇺" },
  AM:  { name: "Amériques",    flag: "🌎" },
  AS:  { name: "Asie",         flag: "🌏" },
  AF:  { name: "Afrique",      flag: "🌍" },
  OC:  { name: "Océanie",      flag: "🌊" },
};

/** @type {Record<string, {name: string, icon: string, minXP: number, color: string}>} */
export const LEVELS = [
  { name: "Moussaillon", minXP: 0,    icon: "🪣", color: "#6b7280" },
  { name: "Pagayeur",    minXP: 100,  icon: "🛶", color: "#3b82f6" },
  { name: "Navigateur",  minXP: 500,  icon: "🚣", color: "#10b981" },
  { name: "Explorateur", minXP: 1500, icon: "🗺️", color: "#f59e0b" },
  { name: "Légende",     minXP: 5000, icon: "🏆", color: "#ef4444" },
];

export const BADGES_DEF = {
  firstSpot:   { name: "Première vague",  icon: "🌊", condition: (s) => s.totalSpotsVisited >= 1 },
  globeTrotter:{ name: "Globe-trotter",   icon: "🌍", condition: (s) => s.countriesVisited >= 5 },
  reviewer:    { name: "Critique",         icon: "✍️", condition: (s) => s.totalReviews >= 3 },
  community:   { name: "Ambassadeur",     icon: "🤝", condition: (s) => s.spotsAdded >= 1 },
  expedition:  { name: "Grand voyageur",  icon: "⛺", condition: (s) => s.longExpeditions >= 1 },
};

export const CHALLENGES = [
  { id: 1, name: "Légende des rivières",   desc: "Explorez 10 rivières différentes",    goal: 10,   unit: "rivières", icon: "🏞️", reward: { badge: "🏆 Légende",               xp: 1000 }, progress: (stats)     => stats.totalSpotsVisited || 0 },
  { id: 2, name: "Globe-trotter aquatique",desc: "Visitez 5 pays différents",            goal: 5,    unit: "pays",     icon: "🌍", reward: { badge: "🌍 Globe-trotter",          xp: 1500 }, progress: (stats)     => stats.countriesVisited || 0 },
  { id: 3, name: "Critique chevronné",     desc: "Postez 10 avis",                       goal: 10,   unit: "avis",     icon: "✍️", reward: { badge: "✍️ Critique Pro",           xp: 500  }, progress: (stats)     => stats.totalReviews || 0 },
  { id: 4, name: "Ambassadeur FleuVibe",   desc: "Ajoutez 3 spots communautaires",       goal: 3,    unit: "spots",    icon: "🤝", reward: { badge: "🤝 Ambassadeur",            xp: 800  }, progress: (stats)     => stats.spotsAdded || 0 },
  { id: 5, name: "Grand Explorateur",      desc: "Accumulez 2000 XP",                    goal: 2000, unit: "XP",       icon: "⭐", reward: { badge: "⭐ Explorateur Légendaire", xp: 2000 }, progress: (_, xp) => xp || 0 },
];

export const THEMES = {
  ocean:    { name: "Océan",    primary: "#1a9e6e", secondary: "#0891b2", bg: "radial-gradient(ellipse at 20% 0%,#0a1628 0%,#0d2240 50%,#0a3d2e 100%)" },
  sunset:   { name: "Coucher", primary: "#f59e0b", secondary: "#ef4444", bg: "radial-gradient(ellipse at 20% 0%,#1a0a05 0%,#2d1608 50%,#1a0a0a 100%)" },
  forest:   { name: "Forêt",   primary: "#10b981", secondary: "#059669", bg: "radial-gradient(ellipse at 20% 0%,#051a0a 0%,#0a2d1a 50%,#051a0f 100%)" },
  aurora:   { name: "Aurore",  primary: "#8b5cf6", secondary: "#ec4899", bg: "radial-gradient(ellipse at 20% 0%,#0f0a1a 0%,#1a0a2d 50%,#1a0a15 100%)" },
  midnight: { name: "Nuit",    primary: "#6366f1", secondary: "#4f46e5", bg: "radial-gradient(ellipse at 20% 0%,#06060f 0%,#0a0a1e 50%,#06060f 100%)" },
};

export const LEGAL_INFO = {
  FR: { license: "Aucune pour kayak de loisir", minAge: 14, emergency: "15 / 18 / 112", rules: "Gilet obligatoire, balisage des itinéraires" },
  BE: { license: "Aucune pour kayak -500m des côtes", minAge: 12, emergency: "112", rules: "VHF recommandé sur la Meuse, respecter les zones" },
  US: { license: "Varies by state", minAge: 16, emergency: "911", rules: "Life jacket mandatory under 13, no alcohol" },
  CH: { license: "Permis bateau si moteur", minAge: 10, emergency: "117 / 144", rules: "Gilet obligatoire, respecter les zones de baignade" },
  NO: { license: "Aucune pour kayak", minAge: 0, emergency: "112", rules: "Toujours informer quelqu'un de votre itinéraire" },
  PT: { license: "Aucune pour kayak côtier", minAge: 12, emergency: "112", rules: "Gilet obligatoire, VHF recommandé en mer" },
  default: { license: "Vérifier sur place", minAge: 12, emergency: "112", rules: "Renseignez-vous auprès des autorités locales" },
};

export const SPONSORED = [
  { id: "s1", name: "Ardennes Belges",   flag: "🇧🇪", color: "#1a9e6e", badge: "Partenaire Officiel", desc: "450 km de rivières navigables en Wallonie." },
  { id: "s2", name: "Ardèche Tourisme",  flag: "🇫🇷", color: "#dc2626", badge: "Région Spotlight",   desc: "Les gorges de l'Ardèche, joyau naturel classé." },
  { id: "s3", name: "Visit Slovenia",    flag: "🇸🇮", color: "#10b981", badge: "Coup de Cœur",       desc: "La Soča aux eaux émeraude." },
  { id: "s4", name: "Lac d'Annecy",     flag: "🇫🇷", color: "#0891b2", badge: "Lac Partenaire",     desc: "Le lac le plus pur d'Europe." },
  { id: "s5", name: "Algarve Tourism",   flag: "🇵🇹", color: "#7c3aed", badge: "Côte Partenaire",   desc: "Paradis du kayak de mer." },
];

export const HIDDEN_GEMS = [
  { id: 1001, name: "Petite Lesse Sauvage",    country: "BE", region: "Ardennes",  difficulty: "Intermédiaire", coords: [50.150, 5.080],  season: "mai–oct",  secret: "Entrée par chemin forestier à 2km du village. Aucun touriste.", emoji: "💎", type: "RIVER", activities: ["Kayak","Camping"],          description: "Un trésor caché des Ardennes, loin de toute foule." },
  { id: 1002, name: "Gorge Secrète de l'Allier", country: "FR", region: "Auvergne", difficulty: "Sportif",       coords: [45.100, 3.400],  season: "avr–sept", secret: "Accessible uniquement à pied 3km. Rapides classe III non cartographiés.", emoji: "🏔️", type: "RIVER", activities: ["Kayak","Rafting"],           description: "Les gorges les plus sauvages du Massif Central, inconnues des guides." },
  { id: 1003, name: "Lac Volcanique Vert",     country: "IS", region: "Highlands", difficulty: "Facile",        coords: [64.600, -19.000], season: "juil–août", secret: "GPS uniquement. Route F26 4x4 obligatoire. Eaux à 18°C en été.", emoji: "🌋", type: "LAKE",  activities: ["Kayak","SUP","Baignade"],   description: "Un lac volcanique émeraude au cœur des Highlands islandais, impossible à trouver sans coordonnées." },
];

export const PROVIDERS = [
  { id: "p1", name: "Kayaks de Lesse",     type: "Location", country: "BE", region: "Wallonie",     river: "Lesse",           description: "Location kayak et canoë sur la Lesse. Navettes incluses.", price: 25, currency: "€", priceLabel: "/ pers.", rating: 4.8, reviews: 234, activities: ["Kayak","Canoë"],    available: true, emoji: "🛶", badges: ["Top Prestataire"], commission: 12, routeIds: [1],  inclut: ["Kayak","Gilet","Pagaie","Navette"],      eco: true },
  { id: "p2", name: "Ardèche Aventures",   type: "Guide",    country: "FR", region: "Ardèche",      river: "Ardèche",         description: "Guides certifiés pour les gorges de l'Ardèche.", price: 89, currency: "€", priceLabel: "/ pers. 2j", rating: 4.9, reviews: 412, activities: ["Kayak","Camping"], available: true, emoji: "🌉", badges: ["N°1 Ardèche"],    commission: 15, routeIds: [6],  inclut: ["Guide","Équipement","Repas","Camping"],  eco: true },
  { id: "p3", name: "Annecy SUP & Kayak", type: "Location", country: "FR", region: "Haute-Savoie", river: "Lac d'Annecy",    description: "Location SUP, kayak sur le lac d'Annecy.", price: 18, currency: "€", priceLabel: "/ heure", rating: 4.8, reviews: 312,    activities: ["SUP","Kayak"],     available: true, emoji: "🏔️", badges: ["Lac Premium"],    commission: 12, routeIds: [10], inclut: ["SUP/Kayak","Gilet","Pagaie"],            eco: true },
];

export const DIFF_COLOR = {
  Facile:        "#1a9e6e",
  Intermédiaire: "#f59e0b",
  Sportif:       "#dc2626",
};

export const WATER_PHOTOS = {
  RIVER: ['/images/canyon-river.jpg', '/images/rafting-adventure.jpg', '/images/hero-kayaking.jpg', '/images/river-camping.jpg'],
  LAKE:  ['/images/kayak-lake.jpg', '/images/lake-calm.jpg', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop'],
  SEA:   ['/images/sea-coast.jpg', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80&fit=crop', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80&fit=crop'],
};
