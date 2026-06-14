/** @param {{ size?: 'sm'|'md'|'lg', center?: boolean }} props */
export function Loader({ size = 'md', center = true }) {
  const px = { sm: 24, md: 44, lg: 64 }[size];
  return (
    <div style={center ? { display: 'flex', justifyContent: 'center', padding: '60px 0' } : undefined}>
      <div className="loading-spinner" style={{ width: px, height: px }} />
    </div>
  );
}

export function LoadingWave() {
  return (
    <div className="loading-wave">
      <span /><span /><span /><span /><span />
    </div>
  );
}
