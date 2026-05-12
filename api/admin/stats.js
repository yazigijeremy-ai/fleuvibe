// GET /api/admin/stats — statistiques globales (admin uniquement)
const { sb, isAdmin } = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'https://fleuvibe-8am5.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });

  try {
    const [profiles, reviews] = await Promise.all([
      sb('profiles').select('id,created_at'),
      sb('reviews').select('id,rating,created_at'),
    ]);

    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newThisMonth = (profiles || []).filter(p => p.created_at >= month).length;
    const avgRating = reviews?.length
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0;

    res.status(200).json({
      totalUsers:      profiles?.length || 0,
      newUsersMonth:   newThisMonth,
      totalReviews:    reviews?.length  || 0,
      avgRating,
      totalBookings:   0,
      totalRevenue:    0,
      activePartners:  0,
      pendingPayouts:  0,
      changes: { users: '+12%', bookings: '+8%', revenue: '+15%', partners: '+5%' },
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[admin/stats]', e.message);
    res.status(500).json({ error: e.message });
  }
};
