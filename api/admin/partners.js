// GET /api/admin/partners — liste partenaires
// POST /api/admin/partners/:id/approve — approuver un partenaire
const { sb, isAdmin } = require('../_supabase');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'https://fleuvibe-8am5.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!isAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });

  try {
    if (req.method === 'GET') {
      const partners = await sb('partners').select('*').catch(() => []);
      return res.status(200).json({ partners: partners || [], total: partners?.length || 0 });
    }

    if (req.method === 'POST') {
      const { partnerId, action } = req.body;
      if (!partnerId) return res.status(400).json({ error: 'partnerId requis' });
      if (action === 'approve') {
        await sb('partners').update({ status: 'approved', approvedAt: new Date().toISOString() }, `id=eq.${partnerId}`);
        return res.status(200).json({ success: true, partnerId, status: 'approved' });
      }
      if (action === 'reject') {
        await sb('partners').update({ status: 'rejected' }, `id=eq.${partnerId}`);
        return res.status(200).json({ success: true, partnerId, status: 'rejected' });
      }
      return res.status(400).json({ error: 'action invalide (approve|reject)' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[admin/partners]', e.message);
    res.status(500).json({ error: e.message });
  }
};
