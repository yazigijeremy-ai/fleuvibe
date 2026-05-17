import { useState, useEffect } from "react";
import { fetchSpotImage, getSpotImageById } from "../utils/getSpotImage";

const FALLBACK_GRADIENTS = {
  RIVER:   "linear-gradient(160deg,#1a4a5c,#14a085)",
  LAKE:    "linear-gradient(160deg,#1b3a2a,#4a9e5c)",
  SEA:     "linear-gradient(160deg,#1a2a4a,#0891b2)",
  default: "linear-gradient(160deg,#1a2a4a,#4a6a9e)",
};

// Type-coherent, activity-aware Unsplash query builder
function buildQuery(spot) {
  const type = spot.type?.toLowerCase() || '';
  const activity = (spot.activities?.join(' ') || '').toLowerCase();

  if (type === 'river' || activity.includes('rafting') || activity.includes('kayak')) {
    return 'river kayaking whitewater';
  }
  if (type === 'lake' || activity.includes('paddle') || activity.includes('lac')) {
    return 'lake paddleboard calm water';
  }
  if (type === 'sea' || type === 'coast' || activity.includes('mer') || activity.includes('voile')) {
    return 'sea kayaking coast ocean';
  }
  if (type === 'waterfall') {
    return 'waterfall nature wild';
  }
  return 'water sport nature outdoor';
}

// Last-resort local fallback: always type-coherent, never shows a river image on a sea spot
function getFinalFallback(spotType) {
  switch (spotType?.toUpperCase()) {
    case 'RIVER': return '/images/hero-kayaking.jpg';
    case 'LAKE':  return '/images/lake-calm.jpg';
    case 'SEA':
    case 'COAST': return '/images/sea-coast.jpg';
    default:      return '/images/hero-kayaking.jpg';
  }
}

// Cache key v2 — different prefix forces refresh of old generic-query photos
const lsKey = (id) => `fv_img2_${id}`;

export default function SpotImage({ spot, fallbackUrl }) {
  const [imgData, setImgData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  // Track whether we already fell back to the local image (prevents infinite error loop)
  const [usedLocalFallback, setUsedLocalFallback] = useState(false);

  useEffect(() => {
    setFetching(true);
    setImgLoaded(false);
    setImgError(false);
    setUsedLocalFallback(false);

    if (spot.image_url) {
      setImgData({ url: spot.image_url, credit: spot.image_credit, creditUrl: spot.image_credit_url });
      setFetching(false);
      return;
    }

    const cached = localStorage.getItem(lsKey(spot.id));
    if (cached) {
      try {
        setImgData(JSON.parse(cached));
        setFetching(false);
        return;
      } catch {}
    }

    const load = async () => {
      let data = null;
      if (spot.unsplash_id) {
        data = await getSpotImageById(spot.unsplash_id);
      } else {
        data = await fetchSpotImage(buildQuery(spot));
      }
      if (data) {
        try { localStorage.setItem(lsKey(spot.id), JSON.stringify(data)); } catch {}
        setImgData(data);
      }
      setFetching(false);
    };
    load();
  }, [spot.id]);

  const gradientFallback = FALLBACK_GRADIENTS[spot.type] || FALLBACK_GRADIENTS.default;
  const localFallback = getFinalFallback(spot.type);
  // Use Unsplash result first, then WATER_PHOTOS entry passed from parent, then type-safe local
  const srcUrl = usedLocalFallback ? localFallback : (imgData?.url || fallbackUrl);

  const handleError = () => {
    if (!usedLocalFallback && srcUrl !== localFallback) {
      // First failure: retry with the type-coherent local image
      setUsedLocalFallback(true);
      setImgLoaded(false);
    } else {
      // Already on local fallback — stop retrying, show emoji
      setImgError(true);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: gradientFallback }}>
      {(fetching || (!imgLoaded && srcUrl && !imgError)) && (
        <div className="fv-skeleton" style={{ position: "absolute", inset: 0, zIndex: 1 }} />
      )}

      {srcUrl && !imgError ? (
        <img
          src={srcUrl}
          alt={`${spot.name} - spot ${spot.type?.toLowerCase() || 'nautique'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={handleError}
          style={{
            width: "100%", height: "100%", objectFit: "cover", objectPosition: "center",
            display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s ease",
          }}
        />
      ) : !fetching && (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem" }}>
          {spot.emoji}
        </div>
      )}

      {/* Unsplash credit — CGU obligatoire */}
      {imgData?.credit && imgLoaded && !imgError && (
        <a
          href={imgData.creditUrl || "https://unsplash.com/?utm_source=fleuvibe&utm_medium=referral"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", bottom: 6, right: 8, fontSize: "9px",
            color: "rgba(255,255,255,0.5)", zIndex: 4, textDecoration: "none",
          }}
        >
          {imgData.credit} / Unsplash
        </a>
      )}
    </div>
  );
}
