import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSpotById } from '../../services/supabase/spots.js';
import { SpotCard }       from '../../components/spots/SpotCard.jsx';
import { Loader }         from '../../components/common/Loader.jsx';
import { logger }         from '../../utils/analytics.js';

/**
 * @typedef {import('../../types/index.js').Spot} Spot
 */

/**
 * Page de détail d'un spot identifié par l'URL param :id.
 * @returns {JSX.Element}
 */
export function SpotDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [spot, setSpot]       = useState(/** @type {Spot|null} */(null));
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSpotById(Number(id))
      .then(data => {
        if (!data) { setError('Spot introuvable.'); return; }
        setSpot(data);
      })
      .catch(err => {
        logger.error('spot_detail_fetch', err);
        setError('Impossible de charger ce spot.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader size="lg" />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-red-400 text-lg">{error}</p>
        <button
          className="fv-btn"
          onClick={() => navigate('/')}
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {spot && <SpotCard spot={spot} expanded />}
    </main>
  );
}
