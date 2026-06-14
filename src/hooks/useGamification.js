import { useCallback } from 'react';
import { useGamificationStore } from '../stores/gamificationStore.js';
import { LEVELS, BADGES_DEF, CHALLENGES } from '../utils/constants.js';

export const useGamification = () => {
  const { xp, badges, stats, addXP, setBadges, setStats, incrementStat } = useGamificationStore();

  const currentLevel = [...LEVELS].reverse().find((l) => xp >= l.minXP) || LEVELS[0];
  const levelIndex   = LEVELS.findIndex((l) => l === currentLevel);
  const nextLevel    = LEVELS[levelIndex + 1];
  const progress     = nextLevel ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 : 100;

  const earnXP = useCallback((amount) => {
    addXP(amount);
    localStorage.setItem('fv_xp', String(xp + amount));
  }, [addXP, xp]);

  const checkBadges = useCallback((newStats = stats) => {
    const earned = Object.entries(BADGES_DEF)
      .filter(([, def]) => def.condition(newStats))
      .map(([key]) => key);
    setBadges(earned);
  }, [stats, setBadges]);

  const trackActivity = useCallback((key) => {
    incrementStat(key);
    const updated = { ...stats, [key]: (stats[key] || 0) + 1 };
    localStorage.setItem('fv_stats', JSON.stringify(updated));
    checkBadges(updated);
  }, [stats, incrementStat, checkBadges]);

  const challengeProgress = CHALLENGES.map((c) => ({
    ...c,
    current: c.progress(stats, xp),
    done:    c.progress(stats, xp) >= c.goal,
  }));

  return { xp, badges, stats, currentLevel, nextLevel, progress, levelIndex, earnXP, trackActivity, challengeProgress };
};
