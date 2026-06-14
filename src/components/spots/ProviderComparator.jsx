import { ALL_PROVIDERS } from '../../hooks/useSpots.js';
import { partnershipManager, PARTNERSHIP_TIERS } from '../../partnership.js';
import { useUIStore } from '../../stores/uiStore.js';

/** @param {{ routeId: number }} props */
export function ProviderComparator({ routeId }) {
  const { setPartnerPortalTarget, openModal } = useUIStore();
  const routeProviders = ALL_PROVIDERS.filter((p) => p.routeIds?.includes(routeId));
  if (routeProviders.length < 1) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2e28', marginBottom: '7px' }}>📊 Prestataires disponibles</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {routeProviders.map((p) => {
          const tier     = partnershipManager.getTier(p.revenue || 0);
          const tierData = PARTNERSHIP_TIERS[tier];
          return (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f7faf9', border: '1px solid #e0ece7', borderRadius: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a2e28' }}>{p.emoji} {p.name}</span>
                  <span style={{ fontSize: '0.72rem', padding: '1px 6px', background: tierData.bg, border: `1px solid ${tierData.color}40`, borderRadius: '20px', color: tierData.color }}>{tierData.badge} {tierData.label}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6a8a80' }}>{p.inclut?.slice(0, 3).join(' · ')} {p.eco ? '· 🌿 Éco' : ''}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1a9e6e' }}>{p.price}{p.currency}</div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>⭐ {p.rating} ({p.reviews})</div>
                <button
                  onClick={(e) => { e.stopPropagation(); setPartnerPortalTarget(p); openModal('partnerPortal'); }}
                  style={{ fontSize: '0.72rem', padding: '2px 7px', background: tierData.bg, border: `1px solid ${tierData.color}40`, borderRadius: '20px', color: tierData.color, cursor: 'pointer' }}
                >🏢 Portail</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
