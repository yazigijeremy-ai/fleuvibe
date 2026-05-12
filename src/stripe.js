// ─── FLEUVIBE STRIPE CONNECT ──────────────────────────────────────────────────
import { loadStripe } from '@stripe/stripe-js';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

export class StripeConnectManager {
  constructor() {
    this.connectedAccounts = new Map();
  }

  // Onboard un partenaire → retourne l'URL d'onboarding Stripe Express
  async createConnectedAccount(partner) {
    const res = await fetch('/api/stripe/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: partner.email, country: partner.country || 'FR' }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur Connect');
    const { accountId, onboardingUrl } = await res.json();
    this.connectedAccounts.set(partner.id, accountId);
    return { accountId, onboardingUrl };
  }

  // Crée un PaymentIntent et confirme le paiement via Stripe.js
  async processPayment(booking) {
    if (!stripePromise) throw new Error('Clé Stripe non configurée');
    const stripe = await stripePromise;

    const res = await fetch('/api/stripe/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(booking.totalPrice * 100),
        currency: (booking.currency || 'eur').toLowerCase(),
        metadata: {
          bookingId: String(booking.id || Date.now()),
          partnerId: String(booking.partnerId || ''),
          routeId:   String(booking.routeId || ''),
          spotName:  booking.spotName || '',
        },
      }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur paiement');
    const { clientSecret, paymentIntentId } = await res.json();

    const result = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/?booking=confirmed&id=${paymentIntentId}`,
      },
    });

    if (result.error) throw new Error(result.error.message);
    return { success: true, paymentIntentId };
  }

  // Déclenche le payout vers un partenaire (commission 18% retenue)
  async triggerPayout(partnerId, amount, bookingId) {
    const accountId = this.connectedAccounts.get(partnerId);
    if (!accountId) return null;

    const res = await fetch('/api/stripe/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, amount: Math.round(amount * 100), bookingId }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  // Dashboard simplifié (à brancher sur Supabase)
  getPartnerDashboard(partnerId) {
    return {
      totalBookings: 0,
      totalRevenue: 0,
      pendingPayouts: [],
      completedPayouts: [],
      monthlyStats: [],
      accountId: this.connectedAccounts.get(partnerId) || null,
    };
  }
}

export const stripeManager = new StripeConnectManager();

// Helper: calcul du prix total d'une réservation
export const calcBookingPrice = (provider, pax) => {
  if (!provider?.price) return null;
  return { unit: provider.price, total: provider.price * pax, currency: provider.currency || '€' };
};
