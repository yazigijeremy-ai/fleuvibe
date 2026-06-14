import { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useUIStore } from '../../stores/uiStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { PREMIUM_PLANS as PLANS_V9 } from '../../monetization.js';
import { trackEvent } from '../../utils/analytics.js';

const STRIPE_MONTHLY_URL = import.meta.env.VITE_STRIPE_MONTHLY_URL || null;
const STRIPE_ANNUAL_URL  = import.meta.env.VITE_STRIPE_ANNUAL_URL  || null;

export function PremiumModal() {
  const { modals, closeModal } = useUIStore();
  const { setIsPremium }       = useAuthStore();
  if (!modals.premium) return null;

  const onClose    = () => closeModal('premium');
  const onActivate = () => setIsPremium(true);

  const plans = [
    { key: 'monthly',  url: STRIPE_MONTHLY_URL },
    { key: 'yearly',   url: STRIPE_ANNUAL_URL  },
    { key: 'lifetime', url: null               },
  ].map(({ key, url }) => ({ ...PLANS_V9[key], key, url }));

  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const plan = plans.find((p) => p.key === selectedPlan);

  const handlePay = () => {
    trackEvent('premium_checkout_click', { plan: selectedPlan });
    if (plan?.url) { window.open(plan.url, '_blank'); }
    else           { onActivate(); onClose(); }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ background: '#fff', border: '1px solid #e0ece7', borderRadius: '24px', padding: '28px', maxWidth: '540px', width: '100%', animation: 'pop 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⭐</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a2e28', marginBottom: '6px' }}>FleuVibe Premium</h2>
          <p style={{ color: '#6a8a80', fontSize: '0.85rem' }}>Toutes les fonctionnalités IA incluses</p>
        </div>
        <div style={{ padding: '10px 14px', background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 500 }}>🤖 Propulsé par <strong>OpenAI GPT-4o mini</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {plans.map((p) => (
            <div key={p.key} onClick={() => setSelectedPlan(p.key)} style={{ flex: 1, minWidth: '140px', padding: '16px', background: selectedPlan === p.key ? '#f0f9f5' : '#f7faf9', border: `2px solid ${selectedPlan === p.key ? '#1a9e6e' : '#e0ece7'}`, borderRadius: '16px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
              {p.popular  && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', padding: '2px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>⭐ POPULAIRE</div>}
              {p.savings  && <div style={{ position: 'absolute', top: -10, right: '10px', background: '#10b981', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>-{p.savings}</div>}
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a2e28', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{p.price}{p.currency}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ab0a8', marginBottom: '10px' }}>/ {p.interval}</div>
              {p.features?.map((f) => <div key={f} style={{ fontSize: '0.78rem', color: '#4a6a5e', marginBottom: '4px' }}>✓ {f}</div>)}
            </div>
          ))}
        </div>
        <button onClick={handlePay} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(245,158,11,0.3)', cursor: 'pointer' }}>
          {plan?.url ? `💳 Payer avec Stripe · ${plan.price}${plan.currency}` : '⭐ Commencer l\'essai gratuit 7 jours'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ab0a8', marginTop: '10px' }}>Sans engagement · Annulable à tout moment</p>
      </div>
    </Modal>
  );
}
