// ─── FLEUVIBE MONETISATION v9.0 ──────────────────────────────────────────────

export const PREMIUM_PLANS = {
  monthly: {
    id: 'price_monthly',
    name: 'Premium Mensuel',
    price: 4.99,
    currency: '€',
    interval: 'mois',
    features: [
      '❌ Zéro publicité',
      '🗺️ Cartes hors-ligne',
      '🌟 Badge Premium',
      '🎯 Filtres avancés',
      '💬 Support prioritaire',
      '📊 Statistiques détaillées',
      '🎁 Accès anticipé nouveautés',
    ],
  },
  yearly: {
    id: 'price_yearly',
    name: 'Premium Annuel',
    price: 49.99,
    currency: '€',
    interval: 'an',
    popular: true,
    savings: '17%',
    features: [
      '❌ Zéro publicité',
      '🗺️ Cartes hors-ligne',
      '🌟 Badge Premium +',
      '🎯 Filtres avancés',
      '💬 Support prioritaire 24/7',
      '📊 Stats détaillées + export',
      '🎁 Accès anticipé nouveautés',
      '💝 2 mois offerts',
      '🤝 Parrainage boosté',
    ],
  },
  lifetime: {
    id: 'price_lifetime',
    name: 'Premium à Vie',
    price: 199.99,
    currency: '€',
    interval: 'vie',
    features: [
      '✅ Tous les avantages annuels',
      '🎖️ Badge Légende exclusif',
      '🔓 Toutes les futures features',
      '👑 Accès VIP événements',
      '📞 Support dédié',
      '🎁 Cadeau de bienvenue',
    ],
  },
};

// ─── DYNAMIC PRICING ─────────────────────────────────────────────────────────
export class DynamicPricing {
  constructor() {
    this.multipliers = { low: 0.8, normal: 1.0, high: 1.2, peak: 1.5 };
  }

  getDemandLevel(bookingCount = 0, capacity = 100) {
    const pct = (bookingCount / capacity) * 100;
    if (pct > 80) return 'peak';
    if (pct > 60) return 'high';
    if (pct > 30) return 'normal';
    return 'low';
  }

  calculate(basePrice, date, bookingCount = 0) {
    const demand = this.getDemandLevel(bookingCount);
    let price = basePrice * this.multipliers[demand];

    const daysUntil = (new Date(date) - Date.now()) / 86400000;
    if (daysUntil > 30) price *= 0.85;   // early bird -15%
    else if (daysUntil < 3 && demand !== 'peak') price *= 0.70; // last minute -30%

    return {
      final: Math.round(price * 100) / 100,
      demand,
      daysUntil: Math.floor(daysUntil),
      badge: daysUntil > 30 ? { label: '🐦 Early Bird -15%', color: '#10b981' }
           : daysUntil < 3  ? { label: '⚡ Last Minute -30%', color: '#f59e0b' }
           : demand === 'peak' ? { label: '🔥 Forte demande', color: '#ef4444' }
           : null,
    };
  }
}

// ─── LOYALTY PROGRAM ─────────────────────────────────────────────────────────
export class LoyaltyProgram {
  static MULTIPLIERS = { bronze: 1, silver: 1.5, gold: 2, platinum: 3 };
  static TIERS = [
    { name: 'Platinum', min: 10000, discount: 15, badge: '💎', color: '#7c3aed' },
    { name: 'Gold',     min: 5000,  discount: 10, badge: '🥇', color: '#d97706' },
    { name: 'Silver',   min: 1000,  discount: 5,  badge: '🥈', color: '#6b7280' },
    { name: 'Bronze',   min: 0,     discount: 0,  badge: '🥉', color: '#b45309' },
  ];

  static earnPoints(amount, partnerTier = 'bronze') {
    const mult = LoyaltyProgram.MULTIPLIERS[partnerTier] || 1;
    return Math.floor(amount * 10 * mult);
  }

  static pointsToDiscount(points) {
    return Math.min(Math.floor(points / 100), 50); // 100pts = 1€, max 50€
  }

  static getTier(points) {
    return LoyaltyProgram.TIERS.find(t => points >= t.min) || LoyaltyProgram.TIERS.at(-1);
  }

  static loadPoints() {
    return parseInt(localStorage.getItem('fv_loyalty_points') || '0');
  }

  static savePoints(pts) {
    localStorage.setItem('fv_loyalty_points', String(pts));
  }

  static addPoints(amount) {
    const pts = LoyaltyProgram.loadPoints() + amount;
    LoyaltyProgram.savePoints(pts);
    return pts;
  }
}

// ─── AFFILIATE PROGRAM ───────────────────────────────────────────────────────
export class AffiliateProgram {
  static RATES = { level1: 0.10, level2: 0.05, level3: 0.02 };
  static TIERS = [
    { name: 'Platinum', min: 100, bonus: 0.05, badge: '💎' },
    { name: 'Gold',     min: 50,  bonus: 0.03, badge: '🥇' },
    { name: 'Silver',   min: 10,  bonus: 0.01, badge: '🥈' },
    { name: 'Bronze',   min: 0,   bonus: 0,    badge: '🥉' },
  ];

  static generateLink(userId, campaign = 'share') {
    const code = btoa(`${userId}:${campaign}:${Date.now()}`).replace(/=/g, '');
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://fleuvibe-8am5.vercel.app';
    return `${base}?ref=${code}`;
  }

  static getTier(referralCount = 0) {
    return AffiliateProgram.TIERS.find(t => referralCount >= t.min) || AffiliateProgram.TIERS.at(-1);
  }

  static loadStats(userId) {
    try {
      return JSON.parse(localStorage.getItem(`fv_aff_${userId}`) || '{"referrals":0,"earned":0,"pending":0}');
    } catch { return { referrals: 0, earned: 0, pending: 0 }; }
  }
}

// ─── AD SYSTEM (UI stubs — prêt pour intégration réseau publicitaire) ────────
export const AD_SLOTS = [
  {
    id: 'ad_surf',
    type: 'native',
    label: '🏄 Cours de surf -50%',
    sub: 'Offre limitée · Partenaire certifié',
    cta: 'Voir l\'offre',
    color: '#0891b2',
    targeting: ['surf', 'SEA'],
  },
  {
    id: 'ad_kayak',
    type: 'native',
    label: '🛶 Location kayak',
    sub: 'Découvrez nos offres partenaires',
    cta: 'Réserver',
    color: '#1a9e6e',
    targeting: ['Kayak', 'RIVER'],
  },
  {
    id: 'ad_gear',
    type: 'native',
    label: '⚙️ Matériel nautique -20%',
    sub: 'Pagaies, gilets, combinaisons',
    cta: 'Voir le catalogue',
    color: '#7c3aed',
    targeting: [],
  },
];

export function getRelevantAd(activities = [], type = '') {
  const targeted = AD_SLOTS.filter(ad =>
    ad.targeting.length === 0 ||
    ad.targeting.some(t => activities.includes(t) || t === type)
  );
  return targeted[Math.floor(Math.random() * targeted.length)] || AD_SLOTS[0];
}

export const dynamicPricing = new DynamicPricing();
