import { useEffect, useRef, useState } from 'react';
import { useSpotStore } from '../../stores/spotStore.js';
import { trackEvent } from '../../utils/analytics.js';
import { ALL_COUNTRIES } from '../../data.js';
import { MapFilter } from './MapFilter.jsx';

/** @param {{ onBook: (spot: import('../../types/index.js').Spot) => void }} props */
export function LeafletMap({ onBook }) {
  const mapRef      = useRef(null);
  const instanceRef = useRef(null);
  const markersRef  = useRef([]);

  const { dbSpots, favorites, toggleFavorite } = useSpotStore();
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mapType, setMapType]           = useState('ALL');
  const [ready, setReady]               = useState(false);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current || typeof window.L === 'undefined') return;
    const L   = window.L;
    const map = L.map(mapRef.current, { center: [20, 10], zoom: 2, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    instanceRef.current = map;
    setReady(true);
    return () => { instanceRef.current?.remove(); instanceRef.current = null; };
  }, []);

  useEffect(() => {
    if (!instanceRef.current || !ready) return;
    const L   = window.L;
    const map = instanceRef.current;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const filtered = mapType === 'ALL' ? dbSpots : dbSpots.filter((s) => s.type === mapType);
    filtered.forEach((spot) => {
      if (!spot.coords) return;
      const col   = { RIVER: '#2563eb', LAKE: '#0891b2', SEA: '#7c3aed' }[spot.type] || '#1a9e6e';
      const isFav = favorites.includes(spot.id);
      const icon  = L.divIcon({
        className: '',
        html: `<div style="width:38px;height:38px;background:${col}22;border:2px solid ${col};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 2px 10px ${col}55;cursor:pointer;${isFav ? `outline:3px solid #ef444488;` : ''}">${spot.emoji}</div>`,
        iconSize: [38, 38], iconAnchor: [19, 19],
      });
      const marker = L.marker(spot.coords, { icon }).addTo(map);
      marker.bindTooltip(`<strong>${spot.name}</strong><br/><small>${spot.difficulty} · ${spot.distance}</small>`, { direction: 'top', offset: [0, -20] });
      marker.on('click', () => { setSelectedSpot(spot); trackEvent('map_spot_click', { spotId: spot.id }); });
      markersRef.current.push(marker);
    });
  }, [dbSpots, favorites, mapType, ready]);

  const DIFF_COLOR = { Facile: '#10b981', Intermédiaire: '#f59e0b', Sportif: '#ef4444' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2e28', marginBottom: '2px' }}>Carte des spots</h2>
          <p style={{ color: '#6a8a80', fontSize: '0.8rem' }}>{dbSpots.length} spots · {Object.keys(ALL_COUNTRIES).length} pays</p>
        </div>
        <MapFilter value={mapType} onChange={setMapType} />
      </div>

      <div ref={mapRef} style={{ height: '480px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0ece7', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} />

      {!ready && typeof window.L === 'undefined' && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#5a8a78', fontSize: '0.8rem' }}>⏳ Chargement de la carte...</div>
      )}

      {selectedSpot && (
        <div style={{ padding: '20px', background: '#fff', border: '1px solid #e0ece7', borderRadius: '16px', animation: 'slideUp 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2rem', flexShrink: 0 }}>{selectedSpot.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2e28', marginBottom: '4px', lineHeight: 1.3 }}>
                {selectedSpot.name} <span style={{ fontWeight: 400, color: '#6a8a80' }}>{ALL_COUNTRIES[selectedSpot.country]?.flag}</span>
              </h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#6a8a80' }}>{selectedSpot.region}</span>
                <span style={{ padding: '2px 8px', background: `${DIFF_COLOR[selectedSpot.difficulty]}15`, border: `1px solid ${DIFF_COLOR[selectedSpot.difficulty]}35`, borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: DIFF_COLOR[selectedSpot.difficulty] }}>{selectedSpot.difficulty}</span>
              </div>
            </div>
            <button onClick={() => toggleFavorite(selectedSpot.id)} style={{ fontSize: '1.3rem', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              {favorites.includes(selectedSpot.id) ? '❤️' : '🤍'}
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4a6a5e', lineHeight: 1.65, marginBottom: '12px' }}>{selectedSpot.description}</p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#6a8a80', marginBottom: '12px' }}>
            <span>{selectedSpot.distance}</span><span>·</span><span>{selectedSpot.duration}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {selectedSpot.activities?.map((a) => <span key={a} style={{ padding: '4px 10px', background: '#f0f5f3', border: '1px solid #d4e8e0', borderRadius: '8px', fontSize: '0.78rem', color: '#1a9e6e', fontWeight: 500 }}>{a}</span>)}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onBook(selectedSpot)} style={{ flex: 1, padding: '10px 16px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Réserver ce spot</button>
            <button onClick={() => setSelectedSpot(null)} style={{ padding: '10px 14px', background: '#f5f8f7', border: '1px solid #e0ece7', borderRadius: '10px', color: '#6a8a80', fontSize: '0.85rem', fontWeight: 500 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
