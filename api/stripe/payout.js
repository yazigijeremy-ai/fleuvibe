// Vercel serverless — transfère les fonds vers un compte connecté partenaire
const Stripe = require('stripe');

const COMMISSION_RATE = 0.18; // 18% FleuVibe

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://fleuvibe-8am5.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { accountId, amount, currency = 'eur', bookingId } = req.body;
    if (!accountId) return res.status(400).json({ error: 'accountId requis' });

    const commission = Math.round(amount * COMMISSION_RATE);
    const payoutAmount = amount - commission;

    const transfer = await stripe.transfers.create({
      amount: payoutAmount,
      currency,
      destination: accountId,
      metadata: { bookingId: bookingId || '', commission, commissionRate: COMMISSION_RATE },
    });

    res.status(200).json({
      transferId: transfer.id,
      payoutAmount,
      commission,
      commissionRate: COMMISSION_RATE,
    });
  } catch (e) {
    console.error('[stripe/payout]', e.message);
    res.status(500).json({ error: e.message });
  }
};
