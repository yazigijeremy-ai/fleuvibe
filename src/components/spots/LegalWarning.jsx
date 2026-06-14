import { useState } from 'react';
import { LEGAL_INFO } from '../../utils/constants.js';
import { ALL_COUNTRIES } from '../../data.js';

/** @param {{ country: string }} props */
export function LegalWarning({ country }) {
  const [open, setOpen] = useState(false);
  const legal = LEGAL_INFO[country] || LEGAL_INFO.default;

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{ background: 'none', border: '1px solid rgba(245,158,11,0.4)', padding: '3px 9px', borderRadius: '20px', color: '#b45309', fontSize: '0.75rem', cursor: 'pointer' }}
      >
        ⚖️ Réglementation {ALL_COUNTRIES[country]?.flag} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{ marginTop: '6px', padding: '9px 11px', background: '#fffbeb', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.78rem', color: '#4a3800', marginBottom: '3px' }}>📋 Licence : {legal.license}</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3800', marginBottom: '3px' }}>🚸 Âge minimum : {legal.minAge} ans</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3800', marginBottom: '3px' }}>🆘 Urgences : {legal.emergency}</p>
          <p style={{ fontSize: '0.78rem', color: '#dc2626' }}>⚠️ {legal.rules}</p>
        </div>
      )}
    </div>
  );
}
