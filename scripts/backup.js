#!/usr/bin/env node
// Backup Supabase database — run with: npm run backup
// Requires: SUPABASE_URL and SUPABASE_KEY env vars (or .env.local)

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in .env.local');
  process.exit(1);
}

const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

const fetchTable = async (table) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${table}: ${res.status}`);
  return res.json();
};

const run = async () => {
  console.log(`📦 Creating backup ${timestamp}...`);
  try {
    const [profiles, reviews] = await Promise.all([
      fetchTable('profiles'),
      fetchTable('reviews'),
    ]);
    const backup = {
      timestamp,
      version: '5.0',
      counts: { profiles: profiles.length, reviews: reviews.length },
      data: { profiles, reviews },
    };
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup saved → ${backupFile}`);
    console.log(`   profiles: ${profiles.length} · reviews: ${reviews.length}`);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
  }
};

run();
