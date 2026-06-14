export function SeasonalCalendar() {
  const months   = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const statuses = ['off','off','low','good','ideal','ideal','ideal','ideal','good','low','off','off'];
  const colors   = { off: '#dc2626', low: '#f59e0b', good: '#10b981', ideal: '#1a9e6e' };
  const labels   = { off: 'Fermé', low: 'Possible', good: 'Bon', ideal: 'Idéal' };
  const cur      = new Date().getMonth();

  return (
    <div style={{ marginTop: '10px', padding: '9px 11px', background: '#f7faf9', borderRadius: '12px', border: '1px solid #e0ece7' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2e28', marginBottom: '7px' }}>📅 Navigabilité saisonnière</p>
      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
        {months.map((m, i) => (
          <div key={m} style={{ textAlign: 'center', padding: '3px 4px', background: `${colors[statuses[i]]}18`, border: `1px solid ${colors[statuses[i]]}50`, borderRadius: '7px', minWidth: '32px', outline: i === cur ? `2px solid ${colors[statuses[i]]}` : 'none' }}>
            <div style={{ fontSize: '0.75rem', color: colors[statuses[i]], fontWeight: i === cur ? 700 : 500 }}>{m}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
        {Object.entries(colors).map(([k, v]) => <span key={k} style={{ fontSize: '0.75rem', color: v }}>■ {labels[k]}</span>)}
      </div>
    </div>
  );
}
