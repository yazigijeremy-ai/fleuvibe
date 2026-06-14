import { useState, useEffect } from 'react';
import { StarRating } from '../common/StarRating.jsx';
import { fetchReviews, addReview, deleteReview } from '../../services/supabase/reviews.js';
import { generateReviewSuggestion, summarizeReviews, getRecommendations } from '../../services/openai.js';
import { useAuthStore } from '../../stores/authStore.js';

/** @param {{ spot: import('../../types/index.js').Spot, allSpots: import('../../types/index.js').Spot[] }} props */
export function ReviewsSection({ spot, allSpots }) {
  const { session, userName } = useAuthStore();
  const [reviews, setReviews]                   = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [showForm, setShowForm]                 = useState(false);
  const [rating, setRating]                     = useState(0);
  const [comment, setComment]                   = useState('');
  const [submitting, setSubmitting]             = useState(false);
  const [err, setErr]                           = useState('');
  const [summary, setSummary]                   = useState(null);
  const [recs, setRecs]                         = useState(null);
  const [loadingSummary, setLoadingSummary]     = useState(false);
  const [loadingRecs, setLoadingRecs]           = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setReviews(await fetchReviews(spot.id)); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [spot.id]);

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const submit = async () => {
    if (!rating)         { setErr('Choisis une note !');      return; }
    if (!comment.trim()) { setErr('Écris un commentaire !'); return; }
    setSubmitting(true); setErr('');
    try {
      await addReview({ spotId: spot.id, userId: session.user.id, rating, comment, userName });
      setRating(0); setComment(''); setShowForm(false); await load();
    } catch (e) { setErr(e.message); }
    setSubmitting(false);
  };

  const getSuggestion = async (e) => {
    e.stopPropagation();
    setLoadingSuggestion(true);
    const s = await generateReviewSuggestion(spot.name);
    if (s) setComment(s);
    setLoadingSuggestion(false);
  };

  return (
    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f5f3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a2e28' }}>Avis</span>
          {avg && <><span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b' }}>{avg}</span><StarRating value={Math.round(avg)} readonly /><span style={{ fontSize: '0.78rem', color: '#9ab0a8' }}>({reviews.length})</span></>}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {reviews.length >= 2 && (
            <button onClick={async (e) => { e.stopPropagation(); setLoadingSummary(true); setSummary(await summarizeReviews(reviews)); setLoadingSummary(false); }} disabled={loadingSummary} style={{ padding: '4px 10px', background: '#f0f9f5', border: '1px solid #d1ede3', borderRadius: '20px', color: '#1a9e6e', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' }}>
              📋 {loadingSummary ? '...' : 'Résumé IA'}
            </button>
          )}
          {session && !showForm && (
            <button onClick={() => setShowForm(true)} style={{ padding: '4px 12px', background: '#f0f9f5', border: '1px solid #d1ede3', borderRadius: '20px', color: '#1a9e6e', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>✍️ Avis</button>
          )}
        </div>
      </div>

      {summary && <p style={{ fontSize: '0.8rem', color: '#4a6a5e', padding: '8px 11px', background: '#f0f9f5', border: '1px solid #d1ede3', borderRadius: '10px', marginBottom: '10px', lineHeight: 1.6 }}>📋 {summary}</p>}

      {showForm && (
        <div style={{ padding: '14px', background: '#f7faf9', border: '1px solid #e0ece7', borderRadius: '14px', marginBottom: '12px' }}>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '0.78rem', color: '#6a8a80', marginBottom: '6px', fontWeight: 600 }}>Ta note</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <button onClick={getSuggestion} disabled={loadingSuggestion} style={{ background: '#f5f3ff', border: '1px solid #e9d5ff', padding: '5px 11px', borderRadius: '20px', color: '#7c3aed', fontSize: '0.78rem', cursor: 'pointer', marginBottom: '10px', fontWeight: 500 }}>
            🪄 {loadingSuggestion ? 'Génération...' : 'Suggestion IA'}
          </button>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Partage ton expérience..." rows={2} style={{ width: '100%', padding: '9px 12px', background: '#fff', border: '1px solid #e0ece7', borderRadius: '10px', color: '#1a2e28', fontSize: '0.82rem', resize: 'vertical', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
          {err && <p style={{ color: '#e11d48', fontSize: '0.78rem', marginBottom: '8px' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={submit} disabled={submitting} style={{ padding: '7px 16px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', opacity: submitting ? 0.7 : 1, cursor: 'pointer' }}>{submitting ? '⏳...' : 'Publier'}</button>
            <button onClick={() => { setShowForm(false); setRating(0); setComment(''); setErr(''); }} style={{ padding: '7px 14px', background: '#f5f8f7', border: '1px solid #e0ece7', borderRadius: '10px', color: '#6a8a80', fontSize: '0.82rem', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      {!session && <p style={{ fontSize: '0.8rem', color: '#9ab0a8', marginBottom: '10px' }}>🔐 Connecte-toi pour laisser un avis</p>}

      {loading ? (
        <p style={{ fontSize: '0.8rem', color: '#9ab0a8' }}>Chargement...</p>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: '#9ab0a8' }}>Aucun avis. Sois le premier ! 🚀</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ padding: '10px 12px', background: '#f7faf9', border: '1px solid #e0ece7', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {(r.user_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a2e28' }}>{r.user_name || 'Utilisateur'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                      <StarRating value={r.rating} readonly />
                      <span style={{ fontSize: '0.75rem', color: '#9ab0a8' }}>{new Date(r.created_at).toLocaleDateString('fr-BE')}</span>
                    </div>
                  </div>
                </div>
                {session?.user.id === r.user_id && (
                  <button onClick={() => deleteReview(r.id).then(load)} style={{ background: 'none', border: 'none', color: '#9ab0a8', fontSize: '0.8rem', cursor: 'pointer' }}>🗑️</button>
                )}
              </div>
              {r.comment && <p style={{ fontSize: '0.82rem', color: '#4a6a5e', lineHeight: 1.6, marginTop: '5px' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f0f9f5', borderRadius: '12px', border: '1px solid #d1ede3' }}>
        <button
          onClick={async (e) => { e.stopPropagation(); setLoadingRecs(true); const similar = allSpots.filter((s) => s.id !== spot.id && s.type === spot.type).slice(0, 6); setRecs(await getRecommendations(spot, similar)); setLoadingRecs(false); }}
          disabled={loadingRecs}
          style={{ background: 'none', border: '1px solid #d1ede3', padding: '5px 12px', borderRadius: '20px', color: '#1a9e6e', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}
        >
          🧭 {loadingRecs ? '...' : 'Spots similaires'}
        </button>
        {recs && <p style={{ fontSize: '0.82rem', color: '#4a6a5e', marginTop: '8px', lineHeight: 1.6 }}>✨ {recs}</p>}
      </div>
    </div>
  );
}
