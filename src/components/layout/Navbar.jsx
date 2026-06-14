import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';
import { useUIStore } from '../../stores/uiStore.js';
import FleuVibeLogo from '../FleuVibeLogo.jsx';

export function Navbar() {
  const navigate = useNavigate();
  const { session, isPremium, isAdmin, userName } = useAuthStore();
  const { isOnline, openModal } = useUIStore();

  return (
    <header style={{ position: 'sticky', top: 0, background: '#fff', boxShadow: '0 1px 0 rgba(0,0,0,0.08)', zIndex: 100, padding: '0 20px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <FleuVibeLogo size="md" />
          {!isOnline && <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} title="Hors ligne" />}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {session && isAdmin && (
            <button onClick={() => openModal('admin')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, fontSize: '0.8rem', padding: '6px 10px' }}>
              Admin
            </button>
          )}
          {session ? (
            <button
              onClick={() => openModal('profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px 6px 6px', background: '#f5f8f7', border: '1px solid #e0ece7', borderRadius: '40px', color: '#1a2e28', fontSize: '0.82rem', fontWeight: 600 }}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {userName[0].toUpperCase()}
              </div>
              {userName.split(' ')[0]}
              {isPremium && <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>★</span>}
            </button>
          ) : (
            <button
              onClick={() => openModal('auth')}
              style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '40px', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
