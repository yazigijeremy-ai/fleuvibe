// ─── FLEUVIBE PARTNERSHIP SYSTEM ─────────────────────────────────────────────

export const PARTNERSHIP_TIERS = {
  bronze:   { commission: 12, color: "#b45309", bg: "rgba(180,83,9,0.12)",   badge: "🥉", label: "Bronze",   threshold: 0,     benefits: ["Listing basique", "Photos (5)", "Support email"] },
  silver:   { commission: 15, color: "#6b7280", bg: "rgba(107,114,128,0.12)", badge: "🥈", label: "Argent",   threshold: 5000,  benefits: ["Listing premium", "Photos (20)", "Support prioritaire", "Badge Argent"] },
  gold:     { commission: 18, color: "#d97706", bg: "rgba(217,119,6,0.12)",   badge: "🥇", label: "Or",       threshold: 15000, benefits: ["Mise en avant", "Photos illimitées", "API accès", "Badge Or", "Reporting avancé"] },
  platinum: { commission: 20, color: "#7c3aed", bg: "rgba(124,58,237,0.12)", badge: "💎", label: "Platine",  threshold: 50000, benefits: ["Page dédiée", "Marketing inclus", "Compte dédié", "Badge Platine", "Commission préférentielle"] },
};

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];

export class PartnershipManager {
  constructor() {
    this.partners  = new Map();
    this.contracts = new Map();
    this._loadFromStorage();
  }

  _loadFromStorage() {
    try {
      const saved = localStorage.getItem("fv_contracts");
      if (saved) JSON.parse(saved).forEach(([k, v]) => this.contracts.set(k, v));
    } catch {}
  }

  _save() {
    try { localStorage.setItem("fv_contracts", JSON.stringify([...this.contracts])); } catch {}
  }

  getTier(revenue = 0) {
    if (revenue >= 50000) return "platinum";
    if (revenue >= 15000) return "gold";
    if (revenue >= 5000)  return "silver";
    return "bronze";
  }

  getNextTier(currentTier) {
    const idx = TIER_ORDER.indexOf(currentTier);
    if (idx < 0 || idx === TIER_ORDER.length - 1) return null;
    const next = TIER_ORDER[idx + 1];
    return { name: next, ...PARTNERSHIP_TIERS[next] };
  }

  createContract(partner) {
    const tier = this.getTier(partner.revenue || 0);
    const t = PARTNERSHIP_TIERS[tier];
    const contract = {
      id: Date.now(),
      partnerId: partner.id,
      tier,
      commission: t.commission,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
      benefits: t.benefits,
      terms: { exclusivity: false, minimumBookings: 0, paymentTerms: "net-10", cancellationPolicy: "24h" },
    };
    this.contracts.set(partner.id, contract);
    this._save();
    return contract;
  }

  getContract(partnerId) {
    return this.contracts.get(partnerId) || null;
  }

  getOrCreateContract(partner) {
    return this.contracts.get(partner.id) || this.createContract(partner);
  }

  getPortal(partner) {
    const contract = this.getOrCreateContract(partner);
    const tier     = this.getTier(partner.revenue || 0);
    const tierData = PARTNERSHIP_TIERS[tier];
    const nextTier = this.getNextTier(tier);
    const progress = nextTier
      ? Math.min(100, Math.round(((partner.revenue || 0) / nextTier.threshold) * 100))
      : 100;

    return {
      partner,
      contract,
      tier,
      tierData,
      nextTier,
      progress,
      stats: {
        bookings:   partner.bookings   || 0,
        revenue:    partner.revenue    || 0,
        views:      partner.views      || 0,
        conversion: partner.conversion || 0,
        rating:     partner.rating     || 0,
      },
    };
  }

  // Mise à jour des stats d'un partenaire (recalcule le tier)
  updateStats(partnerId, delta) {
    const contract = this.contracts.get(partnerId);
    if (!contract) return;
    const partner = this.partners.get(partnerId) || {};
    const newRevenue = (partner.revenue || 0) + (delta.revenue || 0);
    const newTier = this.getTier(newRevenue);
    if (newTier !== contract.tier) {
      contract.tier       = newTier;
      contract.commission = PARTNERSHIP_TIERS[newTier].commission;
      contract.benefits   = PARTNERSHIP_TIERS[newTier].benefits;
    }
    this._save();
    return contract;
  }
}

export const partnershipManager = new PartnershipManager();
