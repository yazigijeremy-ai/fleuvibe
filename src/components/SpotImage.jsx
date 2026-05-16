import { useState, useEffect } from "react";
import { fetchSpotImage, getSpotImageById } from "../utils/getSpotImage";

const FALLBACK_GRADIENTS = {
  RIVER:   "linear-gradient(160deg,#1a4a5c,#14a085)",
  LAKE:    "linear-gradient(160deg,#1b3a2a,#4a9e5c)",
  SEA:     "linear-gradient(160deg,#1a2a4a,#0891b2)",
  default: "linear-gradient(160deg,#1a2a4a,#4a6a9e)",
};

// Type-based landscape terms for Unsplash queries
const TYPE_TERMS = {
  RIVER: "river gorge water nature landscape",
  LAKE:  "lake mountain reflection nature landscape",
  SEA:   "sea coast cliffs ocean landscape",
};

// Build a spot-specific query to minimise photo repetition
function buildQuery(spot) {
  const parts = [];
  // Use the river/water body name when it's specific
  const skip = ["Lac", "Océan", "Mer", "Fjord", "Cenotes", "Lac Malawi", "Lac Louise"];
  if (spot.river && !skip.includes(spot.river)) parts.push(spot.river);
  parts.push(TYPE_TERMS[spot.type] || "water outdoor adventure");
  return parts.join(" ");
}

// Cache key v2 — different prefix forces refresh of old generic-query photos
const lsKey = (id) => `fv_img2_${id}`;

export default function SpotImage({ spot, fallbackUrl }) {
  const [imgData, setImgData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setFetching(true);
    setImgLoaded(false);
    setImgError(false);

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

  const fallback = FALLBACK_GRADIENTS[spot.type] || FALLBACK_GRADIENTS.default;
  const srcUrl = imgData?.url || fallbackUrl;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: fallback }}>
      {(fetching || (!imgLoaded && srcUrl && !imgError)) && (
        <div className="fv-skeleton" style={{ position: "absolute", inset: 0, zIndex: 1 }} />
      )}

      {srcUrl && !imgError ? (
        <img
          src={srcUrl}
          alt={spot.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
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
