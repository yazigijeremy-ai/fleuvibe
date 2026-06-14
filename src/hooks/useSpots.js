import { useEffect, useCallback } from 'react';
import { useSpotStore } from '../stores/spotStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { fetchSpots } from '../services/supabase/spots.js';
import { GLOBAL_SPOTS_FLAT } from '../spots.js';
import { ALL_COUNTRIES, GLOBAL_PARTNERS, WORLD_ROUTES } from '../data.js';
import { PROVIDERS } from '../utils/constants.js';
import { idb } from '../utils/idb.js';
import { logger } from '../utils/analytics.js';

const _dedupCoords = (arr) => {
  const seen = new Set();
  return arr.filter((s) => {
    if (!s.coords) return true;
    const key = `${Math.round(s.coords[0] * 10)},${Math.round(s.coords[1] * 10)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const ALL_PROVIDERS = [...PROVIDERS, ...GLOBAL_PARTNERS];

export const useSpots = () => {
  const { spots, dbSpots, favorites, filters, page, total, loading,
          setSpots, setDbSpots, setLoading, setPage, setFilter, resetFilters,
          setFavorites, toggleFavorite } = useSpotStore();
  const { session } = useAuthStore();

  // Initialize world spots from local data
  useEffect(() => {
    const SPOTS_WORLD = _dedupCoords([...WORLD_ROUTES, ...GLOBAL_SPOTS_FLAT]);
    setSpots(SPOTS_WORLD);
  }, []);

  // Fetch from DB whenever filters or page change
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, total: t } = await fetchSpots({
          page,
          pageSize:   20,
          type:       filters.type       !== 'ALL' ? filters.type       : undefined,
          difficulty: filters.difficulty !== 'ALL' ? filters.difficulty : undefined,
          continent:  filters.continent  !== 'ALL' ? filters.continent  : undefined,
          search:     filters.search || undefined,
        });

        if (data.length > 0) {
          setDbSpots(data, t);
        } else {
          // Fallback to local data
          let filtered = spots;
          if (filters.type       !== 'ALL') filtered = filtered.filter((s) => s.type === filters.type);
          if (filters.difficulty !== 'ALL') filtered = filtered.filter((s) => s.difficulty === filters.difficulty);
          if (filters.continent  !== 'ALL') {
            const codes = Object.entries(ALL_COUNTRIES).filter(([, v]) => v.continent === filters.continent).map(([k]) => k);
            filtered = filtered.filter((s) => codes.includes(s.country));
          }
          if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter((s) => s.name?.toLowerCase().includes(q) || s.river?.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q));
          }
          setDbSpots(filtered.slice((page - 1) * 20, page * 20), filtered.length);
        }
      } catch (e) {
        logger.error('fetchSpots failed', e);
        setDbSpots(spots.slice(0, 20), spots.length);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, page, spots]);

  const saveFavorites = useCallback(async (favs) => {
    setFavorites(favs);
    if (session?.user) await idb.set(`favs_${session.user.id}`, favs);
  }, [session, setFavorites]);

  const handleToggleFavorite = useCallback((spotId) => {
    const next = favorites.includes(spotId)
      ? favorites.filter((id) => id !== spotId)
      : [...favorites, spotId];
    saveFavorites(next);
  }, [favorites, saveFavorites]);

  return {
    spots, dbSpots, favorites, filters, page, total, loading,
    setFilter, resetFilters, setPage,
    toggleFavorite: handleToggleFavorite,
  };
};
