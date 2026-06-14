import { create } from 'zustand';

/**
 * @typedef {Object} SpotFilters
 * @property {string} type       - 'ALL' | 'RIVER' | 'LAKE' | 'SEA'
 * @property {string} difficulty - 'ALL' | 'Facile' | 'Intermédiaire' | 'Sportif'
 * @property {string} continent  - 'ALL' | 'EU' | 'AM' | 'AS' | 'AF' | 'OC'
 * @property {string} search
 */

export const useSpotStore = create((set, get) => ({
  /** @type {import('../types/index.js').Spot[]} */
  spots: [],

  /** @type {import('../types/index.js').Spot[]} DB-sourced spots for current page */
  dbSpots: [],

  /** @type {number[]} */
  favorites: [],

  /** @type {SpotFilters} */
  filters: { type: 'ALL', difficulty: 'ALL', continent: 'ALL', search: '' },

  page:    1,
  total:   0,
  loading: false,

  setSpots:  (spots)  => set({ spots }),
  setDbSpots:(spots, total) => set({ dbSpots: spots, total }),
  setLoading:(loading) => set({ loading }),
  setPage:   (page)   => set({ page }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value }, page: 1 })),

  resetFilters: () =>
    set({ filters: { type: 'ALL', difficulty: 'ALL', continent: 'ALL', search: '' }, page: 1 }),

  setFavorites: (favorites) => set({ favorites }),

  toggleFavorite: (spotId) =>
    set((state) => ({
      favorites: state.favorites.includes(spotId)
        ? state.favorites.filter((id) => id !== spotId)
        : [...state.favorites, spotId],
    })),
}));
