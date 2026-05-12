// Vercel serverless — crée un compte Stripe Connect Express pour un partenaire
const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://fleuvibe-8am5.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { email, country = 'FR', businessType = 'individual' } = req.body;
    if (!email) return res.status(400).json({ error: 'email requis' });

    const account = await stripe.accounts.create({
      type: 'express',
      email,
      country,
      business_type: businessType,
      capabilities: { transfers: { requested: true } },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.APP_URL || 'https://fleuvibe-8am5.vercel.app'}/onboarding/refresh`,
      return_url:  `${process.env.APP_URL || 'https://fleuvibe-8am5.vercel.app'}/onboarding/complete`,
      type: 'account_onboarding',
    });

    res.status(200).json({ accountId: account.id, onboardingUrl: accountLink.url });
  } catch (e) {
    console.error('[stripe/connect]', e.message);
    res.status(500).json({ error: e.message });
  }
};
