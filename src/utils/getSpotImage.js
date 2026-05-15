const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const TYPE_QUERIES = {
  RIVER: 'kayak river forest belgium ardennes',
  LAKE:  'paddleboard lake calm nature',
  SEA:   'sea kayak coastline ocean',
};

export async function fetchSpotImage(type, spotName) {
  if (!UNSPLASH_KEY) return null;
  const query = TYPE_QUERIES[type] || 'river outdoor adventure water nature';
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      url: d.urls.regular,
      thumbUrl: d.urls.small,
      credit: d.user.name,
      creditUrl: `${d.user.links.html}?utm_source=fleuvibe&utm_medium=referral`,
      unsplashId: d.id,
    };
  } catch { return null; }
}

export async function getSpotImageById(id) {
  if (!UNSPLASH_KEY || !id) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/${id}`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      url: d.urls.regular,
      thumbUrl: d.urls.small,
      credit: d.user.name,
      creditUrl: `${d.user.links.html}?utm_source=fleuvibe&utm_medium=referral`,
      unsplashId: d.id,
    };
  } catch { return null; }
}
