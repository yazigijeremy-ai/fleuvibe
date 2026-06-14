import { useState, useEffect } from 'react';
import { getWeather } from '../services/weather.js';

/**
 * Fetches weather for a [lat, lon] pair.
 * @param {[number, number]|null} coords
 * @returns {{ weather: import('../types/index.js').Weather|null, loading: boolean }}
 */
export const useWeather = (coords) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coords || !coords[0] || !coords[1] || (coords[0] === 0 && coords[1] === 0)) return;
    setLoading(true);
    getWeather(coords[0], coords[1])
      .then(setWeather)
      .finally(() => setLoading(false));
  }, [coords?.[0], coords?.[1]]);

  return { weather, loading };
};
