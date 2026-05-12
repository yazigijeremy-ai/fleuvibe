// GET /api/public/spots — liste des spots (endpoint public)
// GET /api/public/spots?id=xxx — détail d'un spot
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Les spots sont dans le frontend (src/App.jsx + src/spots.js)
    // Cet endpoint retourne les métadonnées de base pour les intégrations tierces
    const { id, type, country, difficulty, limit = 50 } = req.query;

    const meta = {
      version: '6.0',
      totalSpots: 197,
      endpoint: '/api/public/spots',
      note: 'Données complètes disponibles via le SDK FleuVibe',
      filters: { id, type, country, difficulty },
      docs: 'https://fleuvibe-8am5.vercel.app',
    };

    res.status(200).json(meta);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
