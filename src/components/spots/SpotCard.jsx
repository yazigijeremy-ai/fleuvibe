import { useState } from 'react';
import SpotImage from '../SpotImage.jsx';
import { WeatherWidget }      from '../weather/WeatherWidget.jsx';
import { SeasonalCalendar }   from './SeasonalCalendar.jsx';
import { LiveConditions }     from './LiveConditions.jsx';
import { ExpeditionPlanner }  from './ExpeditionPlanner.jsx';
import { ProviderComparator } from './ProviderComparator.jsx';
import { LegalWarning }       from './LegalWarning.jsx';
import { TranslateButton }    from './TranslateButton.jsx';
import { AIDescriptionButton} from './AIDescriptionButton.jsx';
import { ReviewsSection }     from './ReviewsSection.jsx';
import { WATER_PHOTOS }       from '../../utils/constants.js';
import { ALL_COUNTRIES }      from '../../data.js';
import { ALL_PROVIDERS }      from '../../hooks/useSpots.js';
import { useSpotStore }       from '../../stores/spotStore.js';
import { useUIStore }         from '../../stores/uiStore.js';

/** @param {{ spot: import('../../types/index.js').Spot }} props */
export function SpotCard({ spot }) {
  const { favorites, toggleFavorite, spots } = useSpotStore();
  const { setBookingSpot, openModal }        = useUIStore();

  const [open, setOpen]           = useState(false);
  const [desc, setDesc]           = useState(spot.description);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const isFav      = favorites.includes(spot.id);
  const typeIcon   = { RIVER: '🏞️', LAKE: '🏔️', SEA: '🌊' }[spot.type] || '🌊';
  const typeName   = { RIVER: 'Rivière', LAKE: 'Lac', SEA: 'Mer' }[spot.type] || '';
  const provider   = ALL_PROVIDERS.find((p) => p.routeIds?.includes(spot.id));
  const pool       = WATER_PHOTOS[spot.type] || WATER_PHOTOS.RIVER;
  const gallery    = [0, 1, 2].map((offset) => pool[(spot.id + offset) % pool.length]);
  const fallbackUrl = spot.image_url || (spot.unsplash_id ? `https://images.unsplash.com/photo-${spot.unsplash_id}?w=800&q=80&fit=crop` : pool[spot.id % pool.length]);
  const countryName = ALL_COUNTRIES[spot.country]?.name || '';

  const onBook = (e) => {
    e.stopPropagation();
    setBookingSpot(spot);
    openModal('booking');
  };

  return (
    <div className="fv-spot-card" style={{ marginBottom: '16px' }} onClick={() => setOpen((o) => !o)}>
      {/* HERO IMAGE */}
      <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
        <SpotImage spot={spot} fallbackUrl={fallbackUrl} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)', zIndex: 2, pointerEvents: 'none' }} />
        {/* Tags + fav */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 3 }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {spot.activities?.slice(0, 2).map((a) => (
              <span key={a} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', fontSize: '0.75rem', color: '#fff', fontWeight: 500 }}>{a}</span>
            ))}
            {spot.sponsored && <span style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.85)', backdropFilter: 'blur(6px)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>⭐ Partenaire</span>}
          </div>
          <button className="fv-btn-fav" onClick={(e) => { e.stopPropagation(); toggleFavorite(spot.id); }}>{isFav ? '❤️' : '🤍'}</button>
        </div>
        {/* Bottom overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 16px 14px', zIndex: 3 }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            📍 {spot.river && !['Lac','Océan','Mer'].includes(spot.river) ? `${spot.river} · ` : ''}{countryName}
          </div>
          <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: '12px' }}>{spot.name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {provider ? (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{provider.price} <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>{provider.currency}/pers</span></span>
              ) : (
                <span style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>
                  <span>{typeIcon} {typeName}</span><span>·</span><span>{spot.difficulty}</span>
                </span>
              )}
            </div>
            <button className="card-cta" onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>{open ? '▲' : 'Voir →'}</button>
          </div>
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid #f0f5f3', padding: '16px', animation: 'slideUp 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
          {/* Gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '14px' }}>
            {gallery.map((src, idx) => (
              <div key={idx} onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3', cursor: 'zoom-in', position: 'relative' }}>
                <img src={src} alt={`${spot.name} photo ${idx + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {idx === 2 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: '#fff', fontWeight: 600 }}>🔍</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px' }}>
            <p style={{ color: '#4a6a5e', fontSize: '0.82rem', lineHeight: 1.7, flex: 1 }}>{desc}</p>
            <TranslateButton text={spot.description} onTranslated={setDesc} />
          </div>

          <AIDescriptionButton spot={spot} />
          <WeatherWidget coords={spot.coords} spotName={spot.name} difficulty={spot.difficulty} />
          <SeasonalCalendar />
          <LiveConditions spotId={spot.id} />
          <ExpeditionPlanner spot={spot} />
          <ProviderComparator routeId={spot.id} />
          <LegalWarning country={spot.country} />

          <button onClick={onBook} style={{ width: '100%', marginTop: '14px', padding: '12px 18px', background: 'linear-gradient(135deg,#0d6e8a,#0891b2)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
            🛶 Réserver ce spot
            {provider && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '3px 12px', fontSize: '0.75rem' }}>{provider.price}{provider.currency}/pers.</span>}
          </button>

          <ReviewsSection spot={spot} allSpots={spots} />
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i - 1 + gallery.length) % gallery.length); }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
          <img src={gallery[lightboxIdx]} alt={`${spot.name} galerie ${lightboxIdx + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => (i + 1) % gallery.length); }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>→</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>✕</button>
          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{lightboxIdx + 1} / {gallery.length}</div>
        </div>
      )}
    </div>
  );
}
