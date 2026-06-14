import { useState } from 'react';
import { generateExpeditionChecklist } from '../../services/openai.js';

/** @param {{ spot: import('../../types/index.js').Spot }} props */
export function ExpeditionPlanner({ spot }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading]     = useState(false);

  const isLong = spot.duration?.includes('jour') || spot.duration?.includes('semaine') || parseInt(spot.distance) > 50;
  if (!isLong) return null;

  const generate = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setChecklist(await generateExpeditionChecklist(spot));
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '10px', padding: '10px 12px', background: '#f0f9f5', border: '1px solid #d1ede3', borderRadius: '12px' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2e28', marginBottom: '6px' }}>⛺ Mode expédition longue durée</p>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '7px' }}>
        {['Kayak/Canoë','Pagaie secours','Gilet','Trousse 1ers soins','GPS/VHF'].map((item) => (
          <span key={item} style={{ fontSize: '0.75rem', padding: '2px 7px', background: '#fff', border: '1px solid #d1ede3', borderRadius: '20px', color: '#1a9e6e' }}>✓ {item}</span>
        ))}
      </div>
      <button onClick={generate} disabled={loading} style={{ background: 'none', border: '1px solid #d1ede3', padding: '4px 10px', borderRadius: '20px', color: '#1a9e6e', fontSize: '0.75rem', cursor: 'pointer' }}>
        {loading ? '⏳ Génération...' : '📋 Checklist IA personnalisée'}
      </button>
      {checklist && <p style={{ fontSize: '0.78rem', color: '#4a6a5e', marginTop: '8px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{checklist}</p>}
    </div>
  );
}
