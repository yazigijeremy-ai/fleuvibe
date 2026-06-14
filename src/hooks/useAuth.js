import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useGamificationStore } from '../stores/gamificationStore.js';
import { signIn, signUp, signOut, onAuthStateChange, fetchProfile } from '../services/supabase/auth.js';
import { idb } from '../utils/idb.js';
import { useSpotStore } from '../stores/spotStore.js';

export const useAuth = () => {
  const { session, profile, isPremium, isAdmin, userName, setSession, setProfile, setIsPremium, reset } = useAuthStore();
  const { setXP, setStats }    = useGamificationStore();
  const { setFavorites }       = useSpotStore();

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const p = await fetchProfile(newSession.user.id);
        setProfile(p);
        if (p?.is_premium) setIsPremium(true);

        const savedXP    = parseInt(localStorage.getItem('fv_xp')    || '0', 10);
        const savedStats = JSON.parse(localStorage.getItem('fv_stats') || '{}');
        setXP(savedXP);
        setStats({ totalSpotsVisited: 0, countriesVisited: 0, totalReviews: 0, spotsAdded: 0, longExpeditions: 0, ...savedStats });

        const offlineFavs = await idb.get(`favs_${newSession.user.id}`);
        if (Array.isArray(offlineFavs)) setFavorites(offlineFavs);
      } else {
        reset();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login  = useCallback((email, password) => signIn(email, password), []);
  const register = useCallback((email, password, username) => signUp(email, password, username), []);
  const logout   = useCallback(() => { reset(); return signOut(); }, [reset]);

  return { session, profile, isPremium, isAdmin, userName, login, register, logout };
};
