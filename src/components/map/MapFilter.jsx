/** @param {{ value: string, onChange: (v: string) => void }} props */
export function MapFilter({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[['ALL','Tous'],['RIVER','Rivières'],['LAKE','Lacs'],['SEA','Mer']].map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            padding: '6px 14px', borderRadius: '8px', border: '1px solid #e0ece7',
            fontSize: '0.8rem', fontWeight: 600,
            background: value === id ? '#1a9e6e' : '#fff',
            color:      value === id ? '#fff'    : '#3a6a5e',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
