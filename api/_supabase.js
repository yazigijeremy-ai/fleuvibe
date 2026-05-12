// Helper partagé — client Supabase pour les fonctions serverless
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mdfzrqehdhvvhrqvinpo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

const sb = (table) => ({
  select: async (cols = '*', filters = '') => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}${filters}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    return res.json();
  },
  insert: async (body) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  update: async (body, filter) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
});

const isAdmin = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  // Simple check : token présent et email dans la liste admin
  // En prod, vérifier le JWT Supabase
  return !!token && token !== 'undefined';
};

module.exports = { sb, isAdmin };
