// POST /api/admin/payouts/process — déclenche les payouts en attente
const { isAdmin } = require('../_supabase');
const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'https://fleuvibe-8am5.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { payouts = [] } = req.body;
    if (!payouts.length) return res.status(400).json({ error: 'Aucun payout fourni' });

    const results = await Promise.allSettled(
      payouts.map(p =>
        stripe.transfers.create({
          amount: Math.round(p.amount * 100),
          currency: (p.currency || 'eur').toLowerCase(),
          destination: p.accountId,
          metadata: { bookingId: String(p.bookingId || ''), partnerId: String(p.partnerId || '') },
        })
      )
    );

    const processed = results.filter(r => r.status === 'fulfilled').length;
    const failed    = results.filter(r => r.status === 'rejected').length;

    res.status(200).json({ processed, failed, total: payouts.length });
  } catch (e) {
    console.error('[admin/payouts]', e.message);
    res.status(500).json({ error: e.message });
  }
};
