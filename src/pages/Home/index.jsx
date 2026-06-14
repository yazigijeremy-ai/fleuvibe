import { useState, useEffect, lazy, Suspense } from 'react';
import { useSpots } from '../../hooks/useSpots.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useUIStore } from '../../stores/uiStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useSpotStore } from '../../stores/spotStore.js';
import { SpotCard } from '../../components/spots/SpotCard.jsx';
import { NativeAd } from '../../components/ads/NativeAd.jsx';
import { Loader } from '../../components/common/Loader.jsx';
import SpotImage from '../../components/SpotImage.jsx';
import { HIDDEN_GEMS, WATER_PHOTOS } from '../../utils/constants.js';
import { ALL_COUNTRIES } from '../../data.js';
import { semanticSearch } from '../../services/openai.js';
import { trackEvent } from '../../utils/analytics.js';

const LeafletMap = lazy(() => import('../../components/map/LeafletMap.jsx').then(m => ({ default: m.LeafletMap })));

const SPOTS_PER_PAGE = 20;

function getSpotPhoto(spot) {
  if (spot.image_url) return spot.image_url;
  if (spot.unsplash_id) return `https://images.unsplash.com/photo-${spot.unsplash_id}?w=800&q=80&fit=crop`;
  const pool = WATER_PHOTOS[spot.type] || WATER_PHOTOS.RIVER;
  return pool[spot.id % pool.length];
}

export function HomePage() {
  const { dbSpots, favorites, filters, page, total, loading,
          setFilter, resetFilters, setPage, toggleFavorite } = useSpots();
  const { session } = useAuth();
  const { isPremium } = useAuthStore();
  const { openModal, setBookingSpot, modals } = useUIStore();

  const [tabPage, setTabPage]               = useState('explore');
  const [loaded, setLoaded]                 = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [showFilters, setShowFilters]       = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [aiFilters, setAiFilters]           = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const handlePageChange = (newPage) => {
    setPageTransition(true);
    setTimeout(() => { setTabPage(newPage); setPageTransition(false); }, 300);
    trackEvent('page_change', { page: newPage });
  };

  const handleAISearch = async () => {
    if (!filters.search.trim()) return;
    setAiSearchLoading(true);
    const parsed = await semanticSearch(filters.search);
    if (parsed) {
      setAiFilters(parsed);
      if (parsed.type)       setFilter('type', parsed.type);
      if (parsed.difficulty) setFilter('difficulty', parsed.difficulty);
      setAiSearchActive(true);
    }
    setAiSearchLoading(false);
  };

  const clearAISearch = () => {
    setAiSearchActive(false);
    setAiFilters(null);
    resetFilters();
  };

  const onBook = (spot) => {
    setBookingSpot(spot);
    openModal('booking');
  };

  const favSpots = dbSpots.filter((s) => favorites.includes(s.id));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px 40px', position: 'relative', zIndex: 1 }}>
      {/* SPOTS POPULAIRES */}
      {tabPage === 'explore' && !filters.search && (
        <div className={`fade-in ${loaded ? 'loaded' : ''}`} style={{ marginBottom: '20px', marginTop: '32px', transitionDelay: '0.05s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a2e28' }}>🔥 Spots populaires</h2>
            <button onClick={() => setFilter('search', '')} style={{ color: '#1a9e6e', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>Voir tout →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {dbSpots.sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0)).slice(0, 3).map((s) => (
              <div key={s.id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e8f0ed', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                  <SpotImage spot={s} fallbackUrl={getSpotPhoto(s)} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(s.id); }} aria-label={favorites.includes(s.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'} style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', cursor: 'pointer' }}>
                    {favorites.includes(s.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a2e28', marginBottom: '3px' }}>{s.name?.split('·')[0]?.trim()}</p>
                  <p style={{ fontSize: '0.68rem', color: '#7a9a8e' }}>{ALL_COUNTRIES[s.country]?.flag} {ALL_COUNTRIES[s.country]?.name} · {s.region}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '0.65rem', color: '#8aa89e' }}>
                    <span>📏 {s.distance}</span><span>⏱️ {s.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAV TABS */}
      <div style={{ display: 'flex', gap: '2px', marginTop: '20px', marginBottom: '24px', background: '#f0f5f3', borderRadius: '14px', padding: '4px' }}>
        {[['explore','Explorer'],['map','Carte'],['hidden','Pépites'],[`favorites`,'Favoris' + (favorites.length > 0 ? ` (${favorites.length})` : '')]].map(([id, label]) => (
          <button key={id} onClick={() => handlePageChange(id)} style={{ flex: 1, padding: '9px 4px', borderRadius: '10px', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: tabPage === id ? '#fff' : 'transparent', color: tabPage === id ? '#1a2e28' : '#6a8a80', boxShadow: tabPage === id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      {pageTransition ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <Loader />
        </div>
      ) : (
        <div className="page-enter">

          {/* EXPLORE */}
          {(tabPage === 'explore') && (
            <div className={`fade-in ${loaded ? 'loaded' : ''}`} style={{ transitionDelay: '0.1s' }}>
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <input
                  type="text" value={filters.search}
                  onChange={(e) => { setFilter('search', e.target.value); setPage(1); if (aiSearchActive) clearAISearch(); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                  placeholder='🔍  Spot, activité, pays...  ou  🤖 "surf débutant Bali"'
                  style={{ width: '100%', padding: '13px 18px', paddingRight: '130px', background: '#fff', border: `1px solid ${aiSearchActive ? 'rgba(99,102,241,0.5)' : '#d0dfdc'}`, borderRadius: '50px', color: '#1a2e28', fontSize: '0.84rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                />
                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px' }}>
                  {aiSearchActive && <button onClick={clearAISearch} style={{ padding: '5px 10px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '20px', color: '#dc2626', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>✕ Reset</button>}
                  <button onClick={handleAISearch} disabled={aiSearchLoading || !filters.search.trim()} style={{ padding: '5px 12px', background: aiSearchLoading ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: '20px', color: '#fff', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
                    {aiSearchLoading ? '⏳' : '🤖 IA'}
                  </button>
                </div>
              </div>

              {/* Quick filter pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px', scrollbarWidth: 'none' }}>
                {[['ALL','ALL','🌍 Tous'],['RIVER','ALL','🏞️ Rivières'],['LAKE','ALL','🏔️ Lacs'],['SEA','ALL','🌊 Mer'],['ALL','Facile','🟢 Facile'],['ALL','Intermédiaire','🟡 Intermédiaire'],['ALL','Sportif','🔴 Sportif']].map(([type, diff, label]) => {
                  const isAll      = type === 'ALL' && diff === 'ALL';
                  const pillActive = isAll ? (filters.type === 'ALL' && filters.difficulty === 'ALL') : (filters.type === type && filters.difficulty === diff);
                  return (
                    <button key={label} onClick={() => { setFilter('type', type); setFilter('difficulty', diff); setPage(1); }} style={{ padding: '7px 16px', borderRadius: '50px', whiteSpace: 'nowrap', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0, background: pillActive ? 'linear-gradient(135deg,#1a9e6e,#0891b2)' : '#f0f5f3', color: pillActive ? '#fff' : '#3a6a5e', border: `1px solid ${pillActive ? 'transparent' : '#d4e8e0'}`, transition: 'all 0.15s ease' }}>
                      {label}
                    </button>
                  );
                })}
                <button onClick={() => setShowFilters((f) => !f)} style={{ padding: '7px 16px', borderRadius: '50px', whiteSpace: 'nowrap', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0, background: filters.continent !== 'ALL' ? 'rgba(26,158,110,0.1)' : '#f0f5f3', color: filters.continent !== 'ALL' ? '#1a9e6e' : '#3a6a5e', border: `1px solid ${filters.continent !== 'ALL' ? 'rgba(26,158,110,0.35)' : '#d4e8e0'}` }}>
                  🌍 Région {filters.continent !== 'ALL' ? `· ${filters.continent}` : ''}
                </button>
              </div>

              {showFilters && (
                <div style={{ background: '#f7faf9', border: '1px solid #e0ece7', borderRadius: '20px', padding: '16px', marginBottom: '14px', animation: 'slideUp 0.2s ease' }}>
                  <p style={{ fontSize: '0.65rem', color: '#5a8a78', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>RÉGION</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[['ALL','🌍 Monde'],['EU','🇪🇺 Europe'],['AM','🌎 Amériques'],['AS','🌏 Asie'],['AF','🌍 Afrique'],['OC','🌊 Océanie']].map(([id, label]) => (
                      <button key={id} onClick={() => { setFilter('continent', id); setPage(1); }} style={{ padding: '7px 14px', borderRadius: '50px', border: '1px solid #d4e8e0', fontSize: '0.7rem', fontWeight: 600, background: filters.continent === id ? 'linear-gradient(135deg,#1a9e6e,#0891b2)' : '#fff', color: filters.continent === id ? '#fff' : '#3a6a5e', cursor: 'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1a9e6e', background: 'rgba(26,158,110,0.08)', border: '1px solid rgba(26,158,110,0.2)', borderRadius: '20px', padding: '3px 10px' }}>{total} spots</span>
              </div>

              {loading ? (
                <Loader />
              ) : dbSpots.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #e8f0ed' }}>
                  <span style={{ fontSize: '3rem' }}>🏄</span>
                  <p style={{ marginTop: '14px', color: '#6a8a80', marginBottom: '14px' }}>Aucun spot trouvé.</p>
                  <button onClick={() => openModal('submit')} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>➕ Ajouter le premier</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {dbSpots.flatMap((s, i) => {
                      const card = <SpotCard key={s.id} spot={s} />;
                      if (!isPremium && (i + 1) % 5 === 0 && i < dbSpots.length - 1) {
                        return [card, <div key={`ad_${i}`} style={{ gridColumn: '1 / -1' }}><NativeAd activities={s.activities || []} type={s.type || ''} /></div>];
                      }
                      return [card];
                    })}
                  </div>
                  {total > SPOTS_PER_PAGE && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '8px 20px', borderRadius: '24px', border: '1px solid rgba(26,158,110,0.3)', background: page === 1 ? '#f0f5f3' : 'rgba(26,158,110,0.1)', color: page === 1 ? '#9ab0a8' : '#1a9e6e', fontSize: '0.78rem', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Précédent</button>
                      <span style={{ fontSize: '0.72rem', color: '#5a8a78' }}>{(page - 1) * SPOTS_PER_PAGE + 1}–{Math.min(page * SPOTS_PER_PAGE, total)} / {total}</span>
                      <button onClick={() => setPage(page + 1)} disabled={page * SPOTS_PER_PAGE >= total} style={{ padding: '8px 20px', borderRadius: '24px', border: '1px solid rgba(26,158,110,0.3)', background: page * SPOTS_PER_PAGE >= total ? '#f0f5f3' : 'rgba(26,158,110,0.1)', color: page * SPOTS_PER_PAGE >= total ? '#9ab0a8' : '#1a9e6e', fontSize: '0.78rem', fontWeight: 600, cursor: page * SPOTS_PER_PAGE >= total ? 'not-allowed' : 'pointer' }}>Suivant →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* MAP */}
          {tabPage === 'map' && (
            <Suspense fallback={<Loader />}>
              <LeafletMap onBook={onBook} />
            </Suspense>
          )}

          {/* PÉPITES CACHÉES */}
          {tabPage === 'hidden' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b45309', marginBottom: '5px' }}>💎 Pépites Cachées</h2>
                <p style={{ color: '#4a7a6a', fontSize: '0.8rem' }}>Spots secrets partagés par la communauté. Pas dans les guides.</p>
              </div>
              {!isPremium ? (
                <div style={{ padding: '24px 20px', background: 'linear-gradient(135deg,#fffbeb,#fff7ed)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🔒</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>Contenu Premium</h3>
                  <p style={{ color: '#b45309', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '14px' }}>Les pépites cachées sont réservées aux membres Premium.</p>
                  <button onClick={() => openModal('premium')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>⭐ Passer Premium</button>
                </div>
              ) : (
                HIDDEN_GEMS.map((gem) => (
                  <div key={gem.id} style={{ marginBottom: '12px', background: 'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(255,255,255,0.02))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '18px', overflow: 'hidden' }}>
                    <div style={{ height: '3px', background: 'linear-gradient(90deg,#f59e0b,#ef4444,transparent)' }} />
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{gem.emoji}</span>
                        <div>
                          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#92400e' }}>{gem.name} {ALL_COUNTRIES[gem.country]?.flag}</h3>
                          <div style={{ color: '#6a8a80', fontSize: '0.7rem' }}>📍 {gem.region} · {ALL_COUNTRIES[gem.country]?.name} · {gem.difficulty}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', padding: '2px 8px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '20px', fontSize: '0.6rem', color: '#92400e' }}>📅 {gem.season}</span>
                      </div>
                      <p style={{ color: '#4a6a60', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '8px' }}>{gem.description}</p>
                      <div style={{ padding: '8px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '10px' }}>
                        <p style={{ fontSize: '0.72rem', color: '#92400e' }}>🤫 <strong>Secret communauté :</strong> {gem.secret}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FAVORIS */}
          {tabPage === 'favorites' && (
            <div>
              {favSpots.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #e8f0ed' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏞️</div>
                  <h3 style={{ color: '#1a2e28', marginBottom: '8px' }}>Aucun favori pour l'instant</h3>
                  <button onClick={() => handlePageChange('explore')} style={{ padding: '9px 20px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '40px', color: '#fff', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer' }}>Explorer les spots</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {favSpots.map((s) => <SpotCard key={s.id} spot={s} />)}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
