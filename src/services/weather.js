import { DistributedCache } from '../utils/cache.js';

const WEATHER_KEY   = import.meta.env.VITE_WEATHER_KEY;
const weatherCache  = new DistributedCache();

/**
 * Fetches current weather for a location with a 30-min cache.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<import('../types/index.js').Weather|null>}
 */
export const getWeather = async (lat, lon) => {
  const key    = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached) return cached;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&lang=fr`;
    const d   = await (await fetch(url)).json();
    if (d.cod !== 200) return null;

    const windKmh = Math.round(d.wind.speed * 3.6);
    const rain    = d.rain?.['1h'] || 0;
    const main    = d.weather[0].main;

    let s = 'good', l = 'Conditions idéales', col = '#1a9e6e';
    if (windKmh > 40 || rain > 5)                      { s = 'bad'; l = 'Déconseillé'; col = '#dc2626'; }
    else if (windKmh > 25 || rain > 2 || main === 'Thunderstorm') { s = 'med'; l = 'Difficile'; col = '#f59e0b'; }
    else if (main === 'Rain' || main === 'Drizzle')     { s = 'med'; l = 'Prudence';   col = '#f59e0b'; }

    const ICONS = { Clear: '☀️', Clouds: '⛅', Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️' };
    const result = {
      temp:    Math.round(d.main.temp),
      desc:    d.weather[0].description,
      windKmh, rain,
      icon:    ICONS[main] || '🌤️',
      s, l, col,
    };
    weatherCache.set(key, result, 30 * 60 * 1000); // 30 min
    return result;
  } catch { return null; }
};
