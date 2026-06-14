import { Modal } from '../common/Modal.jsx';
import { useUIStore } from '../../stores/uiStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useGamification } from '../../hooks/useGamification.js';
import { LevelBadge } from '../gamification/LevelBadge.jsx';
import { useSpotStore } from '../../stores/spotStore.js';
import { BADGES_DEF } from '../../utils/constants.js';

export function ProfileModal() {
  const { modals, closeModal, openModal } = useUIStore();
  if (!modals.profile) return null;

  const onClose = () => closeModal('profile');
  const { session, userName, isPremium, logout } = useAuth();
  const { badges, challengeProgress } = useGamification();
  const { favorites } = useSpotStore();

  const handleLogout = async () => { await logout(); onClose(); };

  return (
    <Modal onClose={onClose}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%', animation: 'pop 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', maxHeight: '88vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              {userName[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2e28' }}>{userName}</div>
              <div style={{ fontSize: '0.78rem', color: '#6a8a80' }}>{session?.user?.email}</div>
              {isPremium && <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>★ Membre Premium</div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f5f8f7', border: '1px solid #e0ece7', color: '#6a8a80', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Level badge */}
        <div style={{ marginBottom: '16px' }}><LevelBadge /></div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px', marginBottom: '16px' }}>
          {[['❤️', favorites.length, 'Favoris'], ['🏅', badges.length, 'Badges']].map(([icon, val, label]) => (
            <div key={label} style={{ padding: '12px', background: '#f7faf9', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem' }}>{icon}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2e28' }}>{val}</div>
              <div style={{ fontSize: '0.72rem', color: '#6a8a80' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Badges earned */}
        {badges.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6a8a80', marginBottom: '8px' }}>Badges obtenus</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {badges.map((key) => (
                <span key={key} title={BADGES_DEF[key]?.name} style={{ fontSize: '1.5rem' }}>{BADGES_DEF[key]?.icon}</span>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!isPremium && (
            <button onClick={() => { onClose(); openModal('premium'); }} style={{ padding: '11px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              ⭐ Passer Premium
            </button>
          )}
          <button onClick={() => { onClose(); openModal('challenges'); }} style={{ padding: '11px', background: '#f0f9f5', border: '1px solid #d1ede3', borderRadius: '12px', color: '#1a9e6e', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            🎯 Mes défis ({challengeProgress.filter((c) => c.done).length}/{challengeProgress.length})
          </button>
          <button onClick={handleLogout} style={{ padding: '11px', background: '#fff0f0', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </Modal>
  );
}
