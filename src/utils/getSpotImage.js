const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export async function fetchSpotImage(query) {
  if (!UNSPLASH_KEY) return null;
  const q = query || 'river outdoor adventure water landscape';
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(q)}&orientation=landscape`,
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
