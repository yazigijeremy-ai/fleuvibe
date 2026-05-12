// GET /api/partner/bookings — réservations d'un partenaire
// POST /api/partner/payouts/request — demander un payout
const { sb } = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'https://fleuvibe-8am5.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  try {
    if (req.method === 'GET') {
      const { partnerId, limit = 20, offset = 0 } = req.query;
      if (!partnerId) return res.status(400).json({ error: 'partnerId requis' });
      // Table bookings à créer en Supabase (stub pour l'instant)
      return res.status(200).json({ bookings: [], total: 0, partnerId });
    }

    if (req.method === 'POST') {
      const { partnerId, amount, currency = 'eur', reason } = req.body;
      if (!partnerId || !amount) return res.status(400).json({ error: 'partnerId et amount requis' });
      // Créer une demande de payout en DB (stub)
      const payout = { id: Date.now(), partnerId, amount, currency, reason, status: 'pending', createdAt: new Date().toISOString() };
      return res.status(201).json({ payout });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[partner/bookings]', e.message);
    res.status(500).json({ error: e.message });
  }
};
