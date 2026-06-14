import { useState } from 'react';
import { useWeather } from '../../hooks/useWeather.js';
import { getWeatherAdvice } from '../../services/openai.js';

/**
 * @param {{ coords: [number,number], spotName?: string, difficulty?: string, small?: boolean }} props
 */
export function WeatherWidget({ coords, spotName, difficulty, small = false }) {
  const { weather: w } = useWeather(coords);
  const [advice, setAdvice]               = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const askAdvice = async (e) => {
    e.stopPropagation();
    if (!w) return;
    setLoadingAdvice(true);
    setAdvice(await getWeatherAdvice(w, spotName || 'ce spot', difficulty || 'Intermédiaire'));
    setLoadingAdvice(false);
  };

  if (!w) return <span style={{ fontSize: '0.75rem', color: '#9ab0a8' }}>🌤️ Météo indisponible</span>;

  if (small) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', background: `${w.col}15`, border: `1px solid ${w.col}30`, borderRadius: '20px', fontSize: '0.75rem', color: w.col, fontWeight: 600 }}>
        {w.icon} {w.temp}°C
      </span>
    );
  }

  return (
    <div style={{ padding: '12px 14px', background: '#f7faf9', border: `1px solid ${w.col}40`, borderRadius: '14px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.6rem' }}>{w.icon}</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2e28' }}>{w.temp}°C</div>
            <div style={{ fontSize: '0.78rem', color: '#6a8a80', textTransform: 'capitalize' }}>{w.desc}</div>
          </div>
        </div>
        <div style={{ padding: '4px 10px', background: `${w.col}15`, border: `1px solid ${w.col}40`, borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: w.col }}>
          {w.s === 'good' ? '✅' : w.s === 'med' ? '⚠️' : '🚫'} {w.l}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: advice ? '8px' : 0 }}>
        <span style={{ fontSize: '0.78rem', color: '#6a8a80' }}>💨 <strong style={{ color: '#1a2e28' }}>{w.windKmh} km/h</strong></span>
        <span style={{ fontSize: '0.78rem', color: '#6a8a80' }}>🌧️ <strong style={{ color: '#1a2e28' }}>{w.rain} mm/h</strong></span>
        <button onClick={askAdvice} disabled={loadingAdvice} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #e0ece7', padding: '3px 10px', borderRadius: '20px', color: '#6366f1', fontSize: '0.75rem', cursor: 'pointer' }}>
          {loadingAdvice ? '⏳' : '🤖 Conseil IA'}
        </button>
      </div>
      {advice && (
        <div style={{ padding: '8px 10px', background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.78rem', color: '#7c3aed', lineHeight: 1.5 }}>🧠 {advice}</p>
        </div>
      )}
    </div>
  );
}
