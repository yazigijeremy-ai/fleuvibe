import { Modal } from '../common/Modal.jsx';
import { useUIStore } from '../../stores/uiStore.js';
import { useGamification } from '../../hooks/useGamification.js';

export function ChallengesModal() {
  const { modals, closeModal } = useUIStore();
  if (!modals.challenges) return null;
  const onClose = () => closeModal('challenges');
  const { challengeProgress } = useGamification();

  return (
    <Modal onClose={onClose}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '480px', width: '100%', animation: 'pop 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2e28' }}>🎯 Défis</h3>
          <button onClick={onClose} style={{ background: '#f5f8f7', border: '1px solid #e0ece7', color: '#6a8a80', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {challengeProgress.map((c) => {
            const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
            return (
              <div key={c.id} style={{ padding: '14px', background: c.done ? '#f0f9f5' : '#f7faf9', border: `1px solid ${c.done ? '#d1ede3' : '#e0ece7'}`, borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a2e28' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6a8a80' }}>{c.desc}</div>
                    </div>
                  </div>
                  {c.done && <span style={{ fontSize: '0.75rem', background: '#d1ede3', color: '#1a9e6e', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>✓ Terminé</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <div style={{ flex: 1, height: '6px', background: '#e0ece7', borderRadius: '3px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: c.done ? '#1a9e6e' : 'linear-gradient(90deg,#1a9e6e,#0891b2)', borderRadius: '3px', transition: 'width 0.6s' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6a8a80', whiteSpace: 'nowrap' }}>{c.current}/{c.goal} {c.unit}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#f59e0b' }}>🏆 Récompense : {c.reward.badge} · +{c.reward.xp} XP</div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
