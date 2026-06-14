import { useState } from 'react';
import { generateDescription } from '../../services/openai.js';
import { useUIStore } from '../../stores/uiStore.js';
import { useAuthStore } from '../../stores/authStore.js';

/** @param {{ spot: import('../../types/index.js').Spot }} props */
export function AIDescriptionButton({ spot }) {
  const { isPremium } = useAuthStore();
  const { openModal } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [aiDesc, setAiDesc]   = useState(null);

  const generate = async (e) => {
    e.stopPropagation();
    if (!isPremium) { openModal('premium'); return; }
    setLoading(true);
    setAiDesc(await generateDescription(spot));
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={generate}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: loading ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 600, fontSize: '0.75rem', boxShadow: '0 2px 10px rgba(99,102,241,0.3)', cursor: 'pointer' }}
      >
        {loading ? '⏳ Génération...' : isPremium ? '🤖 Générer description IA' : '⭐ Premium — Générer avec IA'}
      </button>
      {aiDesc && (
        <div style={{ marginTop: '10px', padding: '12px 14px', background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700, marginBottom: '5px' }}>🤖 DESCRIPTION IA</div>
          <p style={{ fontSize: '0.84rem', color: '#4c1d95', lineHeight: 1.65, fontStyle: 'italic' }}>{aiDesc}</p>
          <button onClick={(e) => { e.stopPropagation(); setAiDesc(null); }} style={{ marginTop: '8px', padding: '3px 10px', background: '#fff', border: '1px solid #e9d5ff', borderRadius: '20px', color: '#7c3aed', fontSize: '0.75rem', cursor: 'pointer' }}>🔄 Régénérer</button>
        </div>
      )}
    </div>
  );
}
