import { getRelevantAd } from '../../monetization.js';
import { trackEvent } from '../../utils/analytics.js';

/** @param {{ activities: string[], type: string }} props */
export function NativeAd({ activities, type }) {
  const ad = getRelevantAd(activities, type);
  return (
    <div
      style={{ padding: '10px 14px', background: `linear-gradient(135deg,${ad.color}18,${ad.color}08)`, border: `1px solid ${ad.color}30`, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' }}
      onClick={() => trackEvent('ad_click', { adId: ad.id })}
    >
      <div style={{ position: 'absolute', top: '5px', right: '8px', fontSize: '0.7rem', color: '#9ab0a8', letterSpacing: '0.3px' }}>Sponsorisé</div>
      <div style={{ flex: 1, paddingTop: '6px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a2e28', marginBottom: '2px' }}>{ad.label}</div>
        <div style={{ fontSize: '0.8rem', color: '#6a8a80' }}>{ad.sub}</div>
      </div>
      <div style={{ padding: '6px 12px', background: ad.color, borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', flexShrink: 0 }}>{ad.cta}</div>
    </div>
  );
}
