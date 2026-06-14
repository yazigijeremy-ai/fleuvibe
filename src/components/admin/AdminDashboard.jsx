import { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useSpotStore } from '../../stores/spotStore.js';
import { partnershipManager, PARTNERSHIP_TIERS } from '../../partnership.js';
import { ALL_PROVIDERS } from '../../hooks/useSpots.js';
import { ALL_COUNTRIES } from '../../data.js';

function StatCard({ title, value, icon, change }) {
  const positive = change?.startsWith('+');
  return (
    <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', flex: '1 1 160px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        {change && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: positive ? '#10b981' : '#ef4444', background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 7px', borderRadius: '20px' }}>{change}</span>}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#daf0e8', marginBottom: '2px' }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: '#4a7a6a' }}>{title}</div>
    </div>
  );
}

function RevenueChart() {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return { label: d.toLocaleString('fr-FR', { month: 'short' }), value: Math.floor(Math.random() * 8000 + 2000) };
  });
  const max = Math.max(...months.map((m) => m.value));
  return (
    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', marginBottom: '16px' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a8edcf', marginBottom: '14px' }}>📈 Revenus mensuels</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
        {months.map((m) => (
          <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '100%', height: `${(m.value / max) * 72}px`, background: 'linear-gradient(180deg,#1a9e6e,#0891b2)', borderRadius: '4px 4px 0 0', minHeight: '4px' }} />
            <span style={{ fontSize: '0.55rem', color: '#4a7a6a' }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { modals, closeModal } = useUIStore();
  if (!modals.admin) return null;

  const { session }  = useAuthStore();
  const { dbSpots }  = useSpotStore();
  const [stats, setStats]   = useState({ totalUsers: 0, totalBookings: 0, totalRevenue: 0, activePartners: 0, pendingPayouts: 0, changes: {} });
  const [tab, setTab]       = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${session?.access_token || ''}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  const TABS = [['overview','📊 Vue d\'ensemble'],['partners','🤝 Partenaires'],['spots','🗺️ Spots'],['ops','⚙️ API']];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)', zIndex: 1000, overflowY: 'auto', padding: '20px 16px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#daf0e8', marginBottom: '2px' }}>🌍 Dashboard Global FleuVibe</h1>
            <p style={{ fontSize: '0.7rem', color: '#4a7a6a' }}>Mis à jour : {new Date().toLocaleString('fr-FR')}</p>
          </div>
          <button onClick={() => closeModal('admin')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#a8edcf', padding: '7px 16px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer' }}>✕ Fermer</button>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${tab === key ? 'rgba(26,158,110,0.5)' : 'rgba(255,255,255,0.07)'}`, background: tab === key ? 'rgba(26,158,110,0.15)' : 'rgba(255,255,255,0.03)', color: tab === key ? '#a8edcf' : '#4a7a6a', fontSize: '0.72rem', fontWeight: tab === key ? 700 : 400, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#4a7a6a' }}>⏳ Chargement...</div>
        ) : tab === 'overview' ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <StatCard title="Utilisateurs"  value={stats.totalUsers}     icon="👥" change={stats.changes?.users    || '+0%'} />
              <StatCard title="Réservations"  value={stats.totalBookings}  icon="📅" change={stats.changes?.bookings || '+0%'} />
              <StatCard title="Revenus"       value={`${stats.totalRevenue}€`} icon="💰" change={stats.changes?.revenue || '+0%'} />
              <StatCard title="Partenaires"   value={stats.activePartners} icon="🤝" change={stats.changes?.partners || '+0%'} />
            </div>
            <RevenueChart />
          </>
        ) : tab === 'partners' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ALL_PROVIDERS.slice(0, 20).map((p) => {
              const tier = partnershipManager.getTier(p.revenue || 0);
              const t    = PARTNERSHIP_TIERS[tier];
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{p.emoji || '🏢'}</span>
                    <div><div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c8e8d8' }}>{p.name}</div><div style={{ fontSize: '0.62rem', color: '#4a7a6a' }}>{p.country} · {p.type}</div></div>
                  </div>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: t.bg, border: `1px solid ${t.color}40`, borderRadius: '20px', color: t.color }}>{t.badge} {t.label}</span>
                </div>
              );
            })}
          </div>
        ) : tab === 'spots' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.72rem', color: '#4a7a6a', marginBottom: '4px' }}>Total : {dbSpots.length} spots dans {Object.keys(ALL_COUNTRIES).length} pays</p>
            {[['RIVER','🏞️ Rivières','#2563eb'],['LAKE','🏖️ Lacs','#0891b2'],['SEA','🌊 Mer/Côtes','#7c3aed']].map(([type, label, col]) => {
              const count = dbSpots.filter((s) => s.type === type).length;
              const pct   = dbSpots.length ? Math.round((count / dbSpots.length) * 100) : 0;
              return (
                <div key={type} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#c8e8d8', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '0.72rem', color: '#a8edcf', fontWeight: 700 }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[['GET','/api/admin/stats','Stats globales'],['GET/POST','/api/admin/partners','Partenaires'],['POST','/api/admin/payouts/process','Payouts'],['GET','/api/partner/dashboard','Dashboard partenaire'],['GET/POST','/api/partner/bookings','Réservations'],['GET','/api/public/spots','Spots public'],['POST','/api/public/bookings','Créer réservation'],['POST','/api/stripe/payment','PaymentIntent'],['POST','/api/stripe/connect','Onboarding'],['POST','/api/stripe/payout','Payout']].map(([method, path, desc]) => (
              <div key={path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', background: method.includes('POST') ? 'rgba(245,158,11,0.15)' : 'rgba(26,158,110,0.15)', color: method.includes('POST') ? '#f59e0b' : '#1a9e6e', borderRadius: '6px', minWidth: '48px', textAlign: 'center' }}>{method}</span>
                <span style={{ fontSize: '0.68rem', color: '#a8edcf', fontFamily: 'monospace', flex: 1 }}>{path}</span>
                <span style={{ fontSize: '0.62rem', color: '#4a7a6a' }}>{desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
