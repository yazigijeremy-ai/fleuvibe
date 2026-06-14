import { create } from 'zustand';

/**
 * @typedef {Object} AuthState
 * @property {import('@supabase/supabase-js').Session|null} session
 * @property {import('../types/index.js').UserProfile|null} profile
 * @property {boolean} isPremium
 * @property {boolean} isAdmin
 * @property {string}  userName
 * @property {(session: import('@supabase/supabase-js').Session|null) => void} setSession
 * @property {(profile: import('../types/index.js').UserProfile|null) => void} setProfile
 * @property {(v: boolean) => void} setIsPremium
 * @property {() => void} reset
 */

export const useAuthStore = create((set) => ({
  session:   null,
  profile:   null,
  isPremium: false,
  isAdmin:   false,
  userName:  'Aventurier',

  setSession: (session) => set({ session }),

  setProfile: (profile) =>
    set({
      profile,
      isAdmin:  profile?.is_admin   ?? false,
      isPremium:profile?.is_premium ?? false,
      userName: profile?.username   ?? 'Aventurier',
    }),

  setIsPremium: (isPremium) => set({ isPremium }),

  reset: () => set({ session: null, profile: null, isPremium: false, isAdmin: false, userName: 'Aventurier' }),
}));
