import { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useUIStore } from '../../stores/uiStore.js';
import { stripeManager, calcBookingPrice } from '../../services/stripe.js';
import { DynamicPricing, LoyaltyProgram } from '../../monetization.js';
import { ALL_PROVIDERS } from '../../hooks/useSpots.js';

export function BookingModal() {
  const { modals, bookingSpot, closeModal } = useUIStore();
  if (!modals.booking || !bookingSpot) return null;

  const onClose = () => closeModal('booking');
  return <BookingModalInner spot={bookingSpot} onClose={onClose} />;
}

function BookingModalInner({ spot, onClose }) {
  const provider   = ALL_PROVIDERS.find((p) => p.routeIds?.includes(spot.id));
  const [date, setDate]         = useState('');
  const [pax, setPax]           = useState(1);
  const [status, setStatus]     = useState('idle');
  const [errMsg, setErrMsg]     = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);

  const hasStripe  = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const price      = calcBookingPrice(provider, pax);
  const dp         = new DynamicPricing();
  const dynPrice   = date && price ? dp.calculate(price.total, date) : null;
  const finalTotal = dynPrice ? dynPrice.final : price?.total;

  const confirm = async () => {
    if (!date) return;
    setStatus('loading'); setErrMsg('');
    try {
      if (hasStripe && price) {
        await stripeManager.processPayment({ id: Date.now(), totalPrice: finalTotal || price.total, currency: price.currency === '€' ? 'eur' : (price.currency || 'eur').toLowerCase(), partnerId: provider?.id || '', routeId: String(spot.id), spotName: spot.name });
      }
      const pts = LoyaltyProgram.earnPoints(finalTotal || 0);
      LoyaltyProgram.addPoints(pts);
      setPointsEarned(pts);
      setStatus('success');
      setTimeout(() => onClose(), 4000);
    } catch (e) {
      if (e.message?.includes('redirect')) { setStatus('success'); return; }
      setErrMsg(e.message || 'Erreur de paiement'); setStatus('error');
    }
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ background: '#fff', border: '1px solid #e0ece7', borderRadius: '24px', padding: '24px', maxWidth: '420px', width: '100%', animation: 'pop 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2e28', marginBottom: '8px' }}>Réservation confirmée !</h3>
            <p style={{ fontSize: '0.85rem', color: '#6a8a80', marginBottom: '8px' }}>Tu vas recevoir une confirmation par email.</p>
            {pointsEarned > 0 && <p style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>🎉 +{pointsEarned} points de fidélité gagnés !</p>}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div><h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a2e28' }}>Réserver</h3><p style={{ fontSize: '0.8rem', color: '#6a8a80' }}>{spot.name}</p></div>
              <button onClick={onClose} style={{ background: '#f5f8f7', border: '1px solid #e0ece7', color: '#6a8a80', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#6a8a80', fontWeight: 600, marginBottom: '6px' }}>📅 Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0ece7', borderRadius: '12px', fontSize: '0.85rem', color: '#1a2e28', background: '#f7faf9', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#6a8a80', fontWeight: 600, marginBottom: '6px' }}>👥 Participants</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setPax((p) => Math.max(1, p - 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f9f5', border: '1px solid #d1ede3', color: '#1a9e6e', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>−</button>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2e28', minWidth: '24px', textAlign: 'center' }}>{pax}</span>
                <button onClick={() => setPax((p) => Math.min(20, p + 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f9f5', border: '1px solid #d1ede3', color: '#1a9e6e', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>+</button>
              </div>
            </div>
            {price && (
              <div style={{ padding: '14px', background: '#f7faf9', borderRadius: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#6a8a80' }}>{pax}× {provider?.name || 'Forfait'}</span>
                  <span style={{ fontSize: '0.82rem', color: '#1a2e28', fontWeight: 600 }}>{price.total}{price.currency}</span>
                </div>
                {dynPrice?.modifier !== 1 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: dynPrice?.modifier < 1 ? '#10b981' : '#ef4444' }}>{dynPrice?.label}</span>
                  <span style={{ fontSize: '0.78rem', color: dynPrice?.modifier < 1 ? '#10b981' : '#ef4444' }}>{dynPrice?.modifier < 1 ? '−' : '+'}{Math.abs(Math.round((1 - dynPrice?.modifier) * 100))}%</span>
                </div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e0ece7' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a2e28' }}>Total</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a9e6e' }}>{finalTotal || price.total}{price.currency}</span>
                </div>
              </div>
            )}
            {errMsg && <p style={{ color: '#e11d48', fontSize: '0.8rem', marginBottom: '12px' }}>{errMsg}</p>}
            <button onClick={confirm} disabled={!date || status === 'loading'} style={{ width: '100%', padding: '13px', background: !date ? '#e0ece7' : 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '14px', color: !date ? '#9ab0a8' : '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: !date ? 'not-allowed' : 'pointer' }}>
              {status === 'loading' ? '⏳ Traitement...' : hasStripe ? '💳 Payer maintenant' : '✅ Confirmer la réservation'}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
