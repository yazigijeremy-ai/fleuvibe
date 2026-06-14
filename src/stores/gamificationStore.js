import { create } from 'zustand';

export const useGamificationStore = create((set) => ({
  xp:     0,
  level:  1,
  badges: [],

  /** @type {{ totalSpotsVisited: number, countriesVisited: number, totalReviews: number, spotsAdded: number, longExpeditions: number }} */
  stats: {
    totalSpotsVisited: 0,
    countriesVisited:  0,
    totalReviews:      0,
    spotsAdded:        0,
    longExpeditions:   0,
  },

  setXP:     (xp)     => set({ xp }),
  addXP:     (amount) => set((s) => ({ xp: s.xp + amount })),
  setBadges: (badges) => set({ badges }),
  setStats:  (stats)  => set({ stats }),

  incrementStat: (key) =>
    set((s) => ({ stats: { ...s.stats, [key]: (s.stats[key] || 0) + 1 } })),
}));
