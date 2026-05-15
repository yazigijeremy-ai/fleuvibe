import { useState, useEffect } from "react";
import { fetchSpotImage, getSpotImageById } from "../utils/getSpotImage";

const FALLBACK_GRADIENTS = {
  RIVER:   "linear-gradient(135deg,#1a4a5c,#14a085)",
  LAKE:    "linear-gradient(135deg,#1b3a2a,#4a9e5c)",
  SEA:     "linear-gradient(135deg,#1a2a4a,#0891b2)",
  default: "linear-gradient(135deg,#1a2a4a,#4a6a9e)",
};

const lsKey = (id) => `fv_img_${id}`;

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
        data = await fetchSpotImage(spot.type, spot.name);
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
      {/* Skeleton shown while fetching or while image is loading */}
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
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
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
            position: "absolute", bottom: 6, right: 8, fontSize: "10px",
            color: "rgba(255,255,255,0.6)", zIndex: 4, textDecoration: "none",
          }}
        >
          Photo: {imgData.credit} / Unsplash
        </a>
      )}
    </div>
  );
}
