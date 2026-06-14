import { useState } from 'react';
import { Modal } from '../common/Modal.jsx';
import { useUIStore } from '../../stores/uiStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { addSpot } from '../../services/supabase/spots.js';
import { validateSpot } from '../../utils/validators.js';
import { sanitizeInput } from '../../utils/sanitizers.js';
import { useGamification } from '../../hooks/useGamification.js';

const ACTIVITIES = ['Kayak','Canoë','SUP','Rafting','Voile','Surf','Plongée','Baignade','Kitesurf'];

export function SubmitSpotModal() {
  const { modals, closeModal } = useUIStore();
  if (!modals.submit) return null;
  const onClose = () => closeModal('submit');
  return <SubmitSpotInner onClose={onClose} />;
}

function SubmitSpotInner({ onClose }) {
  const { session } = useAuthStore();
  const { earnXP, trackActivity } = useGamification();
  const [form, setForm]     = useState({ name: '', river: '', type: 'RIVER', difficulty: 'Facile', description: '', coords: '', activities: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggle = (act) => setForm((f) => ({ ...f, activities: f.activities.includes(act) ? f.activities.filter((a) => a !== act) : [...f.activities, act] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitized = { ...form, name: sanitizeInput(form.name), description: sanitizeInput(form.description) };
    const { valid, errors: errs } = validateSpot(sanitized);
    if (!valid) { setErrors(errs); return; }
    setLoading(true);
    try {
      let coords;
      if (sanitized.coords) {
        const [lat, lng] = sanitized.coords.split(',').map(Number);
        coords = [lat, lng];
      }
      await addSpot({ ...sanitized, coords }, session.user.id);
      earnXP(200);
      trackActivity('spotsAdded');
      setSuccess(true);
    } catch (err) { setErrors({ _: err.message }); }
    setLoading(false);
  };

  const field = (label, key, props = {}) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', color: '#6a8a80', fontWeight: 600, marginBottom: '5px' }}>{label}</label>
      <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} {...props} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${errors[key] ? '#e11d48' : '#e0ece7'}`, borderRadius: '12px', fontSize: '0.85rem', color: '#1a2e28', boxSizing: 'border-box' }} />
      {errors[key] && <p style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '4px' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '500px', width: '100%', animation: 'pop 0.3s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2e28', marginBottom: '8px' }}>Spot soumis !</h3>
            <p style={{ color: '#6a8a80', fontSize: '0.85rem', marginBottom: '16px' }}>Ton spot sera examiné par l'équipe FleuVibe. +200 XP gagnés !</p>
            <button onClick={onClose} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Fermer</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2e28' }}>➕ Ajouter un spot</h3>
              <button onClick={onClose} style={{ background: '#f5f8f7', border: '1px solid #e0ece7', color: '#6a8a80', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {field('Nom du spot *', 'name', { placeholder: 'Ex: Lesse · Houyet → Anseremme' })}
              {field('Plan d\'eau *', 'river', { placeholder: 'Rivière, lac, mer...' })}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6a8a80', fontWeight: 600, marginBottom: '5px' }}>Type *</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0ece7', borderRadius: '12px', fontSize: '0.85rem', color: '#1a2e28', background: '#fff' }}>
                    <option value="RIVER">🏞️ Rivière</option>
                    <option value="LAKE">🏔️ Lac</option>
                    <option value="SEA">🌊 Mer</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#6a8a80', fontWeight: 600, marginBottom: '5px' }}>Difficulté *</label>
                  <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0ece7', borderRadius: '12px', fontSize: '0.85rem', color: '#1a2e28', background: '#fff' }}>
                    <option value="Facile">🟢 Facile</option>
                    <option value="Intermédiaire">🟡 Intermédiaire</option>
                    <option value="Sportif">🔴 Sportif</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#6a8a80', fontWeight: 600, marginBottom: '5px' }}>Activités * {errors.activities && <span style={{ color: '#e11d48' }}>— {errors.activities}</span>}</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ACTIVITIES.map((a) => (
                    <button type="button" key={a} onClick={() => toggle(a)} style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${form.activities.includes(a) ? '#1a9e6e' : '#e0ece7'}`, background: form.activities.includes(a) ? '#f0f9f5' : '#fff', color: form.activities.includes(a) ? '#1a9e6e' : '#6a8a80', fontSize: '0.78rem', fontWeight: form.activities.includes(a) ? 600 : 400, cursor: 'pointer' }}>{a}</button>
                  ))}
                </div>
              </div>
              {field('Coordonnées (optionnel)', 'coords', { placeholder: '50.185, 5.002' })}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#6a8a80', fontWeight: 600, marginBottom: '5px' }}>Description (optionnel)</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Décris ce spot en quelques phrases..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0ece7', borderRadius: '12px', fontSize: '0.85rem', color: '#1a2e28', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              {errors._ && <p style={{ color: '#e11d48', fontSize: '0.8rem' }}>{errors._}</p>}
              <button type="submit" disabled={loading} style={{ padding: '13px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Envoi...' : '🗺️ Soumettre le spot'}
              </button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
