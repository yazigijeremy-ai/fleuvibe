import { Modal } from '../common/Modal.jsx';
import { useUIStore } from '../../stores/uiStore.js';
import { partnershipManager, PARTNERSHIP_TIERS } from '../../partnership.js';

export function PartnerPortal() {
  const { modals, partnerPortalTarget, closeModal } = useUIStore();
  if (!modals.partnerPortal || !partnerPortalTarget) return null;
  const onClose = () => closeModal('partnerPortal');
  return <PartnerPortalInner partner={partnerPortalTarget} onClose={onClose} />;
}

function PartnerPortalInner({ partner, onClose }) {
  const portal = partnershipManager.getPortal(partner);
  const { tier, tierData, nextTier, progress, stats, contract } = portal;

  return (
    <Modal onClose={onClose}>
      <div style={{ background: 'linear-gradient(160deg,#0d2240,#0a3d2e)', border: `1px solid ${tierData.color}40`, borderRadius: '28px', padding: '26px', maxWidth: '500px', width: '100%', maxHeight: '88vh', overflowY: 'auto', animation: 'slideUp 0.3s ease', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.8rem' }}>{partner.emoji || '🏢'}</span>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#daf0e8' }}>{partner.name}</h2>
                <p style={{ fontSize: '0.7rem', color: '#4a7a6a' }}>{partner.country} · {partner.type}</p>
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 12px', background: tierData.bg, border: `1px solid ${tierData.color}50`, borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, color: tierData.color }}>
              {tierData.badge} Partenaire {tierData.label} · {tierData.commission}% commission
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#5a8a78', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '18px' }}>
          {[['📅',stats.bookings,'Réservations'],['💰',`${stats.revenue}€`,'Revenus'],['👁️',stats.views,'Vues'],['⭐',stats.rating || partner.rating || '—','Note']].map(([ic, val, lbl]) => (
            <div key={lbl} style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem' }}>{ic}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a8edcf' }}>{val}</div>
              <div style={{ fontSize: '0.55rem', color: '#4a7a6a', marginTop: '1px' }}>{lbl}</div>
            </div>
          ))}
        </div>

        {nextTier && (
          <div style={{ marginBottom: '18px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#6a9a8c', fontWeight: 600 }}>Prochain niveau : {nextTier.badge} {nextTier.label}</span>
              <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${tierData.color},${nextTier.color})`, borderRadius: '3px', transition: 'width 0.8s' }} />
            </div>
            <p style={{ fontSize: '0.62rem', color: '#4a7a6a' }}>Objectif : {nextTier.threshold.toLocaleString()}€ de revenus cumulés</p>
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a8edcf', marginBottom: '8px' }}>Avantages inclus</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tierData.benefits?.map((b) => (
              <span key={b} style={{ padding: '3px 10px', background: `${tierData.color}18`, border: `1px solid ${tierData.color}40`, borderRadius: '20px', fontSize: '0.66rem', color: tierData.color }}>✓ {b}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {Object.entries(PARTNERSHIP_TIERS).map(([key, t]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: tier === key ? t.bg : 'rgba(255,255,255,0.02)', border: `1px solid ${tier === key ? t.color + '50' : 'rgba(255,255,255,0.05)'}`, borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: tier === key ? t.color : '#5a8a78', fontWeight: tier === key ? 700 : 400 }}>{t.badge} {t.label} {tier === key ? '← actuel' : ''}</span>
              <span style={{ fontSize: '0.62rem', color: '#4a7a6a' }}>{t.commission}% · {t.threshold > 0 ? `dès ${t.threshold.toLocaleString()}€` : 'Gratuit'}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
