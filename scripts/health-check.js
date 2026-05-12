#!/usr/bin/env node
// Health check — run with: npm run health
// Vérifie Supabase, OpenWeatherMap et la DB locale

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;
const WEATHER_KEY = process.env.VITE_WEATHER_KEY;

const checkHealth = async () => {
  const results = {};
  const start = Date.now();

  console.log('🏥 FleuVibe Health Check\n');

  // Supabase
  try {
    const t = Date.now();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    results.supabase = { ok: res.ok, status: res.status, ms: Date.now() - t };
  } catch (e) {
    results.supabase = { ok: false, error: e.message };
  }

  // OpenWeatherMap
  try {
    const t = Date.now();
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Paris&appid=${WEATHER_KEY}`
    );
    results.weather = { ok: res.ok, status: res.status, ms: Date.now() - t };
  } catch (e) {
    results.weather = { ok: false, error: e.message };
  }

  // OpenAI (simple ping — pas de vrai appel pour ne pas facturer)
  results.openai = { ok: !!process.env.VITE_OPENAI_KEY, note: 'Key presence check only' };

  // Stripe
  results.stripe = {
    ok: !!(process.env.VITE_STRIPE_MONTHLY_URL || process.env.VITE_STRIPE_ANNUAL_URL),
    note: 'Payment links configured',
  };

  // Affichage
  const rows = Object.entries(results).map(([service, data]) => ({
    Service: service,
    Status: data.ok ? '✅ OK' : '❌ FAIL',
    'Response (ms)': data.ms ?? '—',
    Note: data.error || data.note || '',
  }));

  console.table(rows);
  console.log(`\n⏱️  Total: ${Date.now() - start}ms`);

  const allOk = Object.values(results).every((r) => r.ok);
  if (allOk) {
    console.log('✅ All systems operational!\n');
    process.exit(0);
  } else {
    console.error('⚠️  Some checks failed — see table above\n');
    process.exit(1);
  }
};

checkHealth();
