import { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useUIStore } from '../../stores/uiStore.js';
import { useAuth } from '../../hooks/useAuth.js';

export function AuthModal() {
  const { modals, closeModal } = useUIStore();
  if (!modals.auth) return null;

  const onClose = () => closeModal('auth');
  return <AuthModalInner onClose={onClose} />;
}

function AuthModalInner({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode]     = useState('login');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      if (mode === 'login') { await login(email, password); onClose(); }
      else                  { await register(email, password, username); onClose(); }
    } catch (error) { setErr(error.message); }
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '100%', animation: 'pop 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌊</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a2e28' }}>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nom d'utilisateur" required style={{ padding: '12px 16px', border: '1px solid #e0ece7', borderRadius: '12px', fontSize: '0.88rem', color: '#1a2e28', width: '100%', boxSizing: 'border-box' }} />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '12px 16px', border: '1px solid #e0ece7', borderRadius: '12px', fontSize: '0.88rem', color: '#1a2e28', width: '100%', boxSizing: 'border-box' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required minLength={6} style={{ padding: '12px 16px', border: '1px solid #e0ece7', borderRadius: '12px', fontSize: '0.88rem', color: '#1a2e28', width: '100%', boxSizing: 'border-box' }} />
          {err && <p style={{ color: '#e11d48', fontSize: '0.8rem' }}>{err}</p>}
          <button type="submit" disabled={loading} style={{ padding: '13px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6a8a80', marginTop: '16px' }}>
          {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }} style={{ background: 'none', border: 'none', color: '#1a9e6e', fontWeight: 600, cursor: 'pointer' }}>
            {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </p>
      </div>
    </Modal>
  );
}
