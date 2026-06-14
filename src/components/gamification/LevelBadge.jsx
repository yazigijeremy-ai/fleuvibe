import { useGamification } from '../../hooks/useGamification.js';

export function LevelBadge() {
  const { xp, currentLevel, nextLevel, progress } = useGamification();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', border: `1px solid ${currentLevel.color}30` }}>
      <span style={{ fontSize: '1.3rem' }}>{currentLevel.icon}</span>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: currentLevel.color }}>{currentLevel.name}</div>
        <div style={{ fontSize: '0.6rem', color: '#4a7a6a' }}>{xp} XP</div>
        {nextLevel && (
          <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '2px' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: currentLevel.color, borderRadius: '2px', transition: 'width 0.5s' }} />
          </div>
        )}
      </div>
    </div>
  );
}
