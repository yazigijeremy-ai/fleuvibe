import { useState } from 'react';

/** @param {{ spotId: number }} props */
export function LiveConditions({ spotId }) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [waterLevel, setWaterLevel] = useState('normal');
  const [crowd, setCrowd] = useState('moyenne');

  const submitReport = (e) => {
    e.stopPropagation();
    setReports([{ id: Date.now(), waterLevel, crowd, date: new Date().toISOString() }, ...reports]);
    setShowForm(false);
  };

  return (
    <div style={{ marginTop: '10px', padding: '10px 12px', background: '#f7faf9', borderRadius: '12px', border: '1px solid #e0ece7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2e28' }}>📸 Conditions en direct</p>
        <button onClick={(e) => { e.stopPropagation(); setShowForm((f) => !f); }} style={{ background: '#f0f9f5', border: '1px solid #d1ede3', padding: '3px 9px', borderRadius: '20px', color: '#1a9e6e', fontSize: '0.75rem', cursor: 'pointer' }}>+ Partager</button>
      </div>
      {showForm && (
        <div style={{ marginBottom: '8px', padding: '8px', background: '#fff', border: '1px solid #e0ece7', borderRadius: '9px' }}>
          <select value={waterLevel} onChange={(e) => setWaterLevel(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', marginBottom: '5px', padding: '6px', background: '#fff', border: '1px solid #e0ece7', borderRadius: '8px', color: '#1a2e28', fontSize: '0.78rem' }}>
            <option value="bas">💧 Niveau bas</option>
            <option value="normal">💧 Niveau normal</option>
            <option value="haut">🌊 Crue</option>
          </select>
          <select value={crowd} onChange={(e) => setCrowd(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '100%', marginBottom: '6px', padding: '6px', background: '#fff', border: '1px solid #e0ece7', borderRadius: '8px', color: '#1a2e28', fontSize: '0.78rem' }}>
            <option value="vide">👤 Désert</option>
            <option value="moyenne">👥 Calme</option>
            <option value="plein">👨‍👩‍👧‍👦 Bondé</option>
          </select>
          <button onClick={submitReport} style={{ width: '100%', padding: '6px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.78rem', cursor: 'pointer' }}>📤 Publier</button>
        </div>
      )}
      {reports.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: '#9ab0a8' }}>Aucun rapport récent. Sois le premier !</p>
      ) : (
        reports.map((r) => (
          <div key={r.id} style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: '#6a8a80', padding: '4px 0', borderBottom: '1px solid #f0f5f3' }}>
            <span>💧 {r.waterLevel === 'bas' ? 'Bas' : r.waterLevel === 'haut' ? 'Crue' : 'Normal'}</span>
            <span>👥 {r.crowd === 'vide' ? 'Désert' : r.crowd === 'plein' ? 'Bondé' : 'Calme'}</span>
            <span style={{ color: '#9ab0a8', marginLeft: 'auto' }}>{new Date(r.date).toLocaleTimeString('fr')}</span>
          </div>
        ))
      )}
    </div>
  );
}
