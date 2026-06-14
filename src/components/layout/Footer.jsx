export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 20px 24px', marginTop: '60px', textAlign: 'center' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.75rem', color: '#4a7a6a', marginBottom: '10px' }}>
          © 2026 FleuVibe · Plateforme de découverte nautique mondiale
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[['Conditions', '#'], ['Confidentialité', '#'], ['Contact', 'mailto:hello@fleuvibe.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '0.72rem', color: '#4a7a6a', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
