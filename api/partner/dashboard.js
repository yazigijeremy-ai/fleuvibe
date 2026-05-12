// GET /api/partner/dashboard — tableau de bord partenaire
const { sb } = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'https://fleuvibe-8am5.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { partnerId } = req.query;
  if (!partnerId) return res.status(400).json({ error: 'partnerId requis' });

  try {
    const reviews = await sb('reviews').select('id,rating,created_at', `&route_id=eq.${partnerId}`).catch(() => []);
    const avgRating = reviews?.length
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0;

    // Données mensuelles simulées (à brancher sur table bookings en prod)
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      return { month: d.toLocaleString('fr-FR', { month: 'short' }), bookings: 0, revenue: 0 };
    });

    res.status(200).json({
      partnerId,
      stats: { bookings: 0, revenue: 0, views: 0, conversion: 0, rating: parseFloat(avgRating) },
      monthlyStats,
      pendingPayouts: [],
      recentReviews: (reviews || []).slice(0, 5),
      leads: [],
    });
  } catch (e) {
    console.error('[partner/dashboard]', e.message);
    res.status(500).json({ error: e.message });
  }
};
