// POST /api/public/bookings — créer une réservation
// GET  /api/public/countries — liste des pays
const { sb } = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // GET /api/public/countries
      const { ALL_COUNTRIES } = require('../../src/data.js');
      const list = Object.entries(ALL_COUNTRIES).map(([code, c]) => ({
        code, name: c.name, flag: c.flag, continent: c.continent,
      }));
      return res.status(200).json({ countries: list, total: list.length });
    }

    if (req.method === 'POST') {
      const { spotId, partnerId, userId, date, pax, totalPrice, currency = 'eur' } = req.body;
      if (!spotId || !date || !pax) return res.status(400).json({ error: 'spotId, date et pax requis' });

      const booking = {
        id: `bk_${Date.now()}`,
        spotId, partnerId, userId, date, pax,
        totalPrice: totalPrice || 0,
        currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Persister en Supabase si la table bookings existe
      try {
        await sb('bookings').insert(booking);
      } catch {}

      return res.status(201).json({ booking });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[public/bookings]', e.message);
    res.status(500).json({ error: e.message });
  }
};
