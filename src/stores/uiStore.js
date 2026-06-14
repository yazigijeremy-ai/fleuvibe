import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme:      'ocean',
  isOnline:   true,
  showFilters:false,

  // Modal visibility
  modals: {
    auth:         false,
    premium:      false,
    profile:      false,
    submit:       false,
    admin:        false,
    challenges:   false,
    groups:       false,
    affiliate:    false,
    aiChat:       false,
    partnerPortal:false,
  },

  /** @type {import('../types/index.js').Spot|null} */
  bookingSpot: null,

  /** @type {import('../types/index.js').Provider|null} */
  partnerPortalTarget: null,

  setTheme:    (theme)    => set({ theme }),
  setIsOnline: (isOnline) => set({ isOnline }),
  toggleFilters: ()       => set((s) => ({ showFilters: !s.showFilters })),

  openModal:  (name) => set((s) => ({ modals: { ...s.modals, [name]: true  } })),
  closeModal: (name) => set((s) => ({ modals: { ...s.modals, [name]: false } })),

  setBookingSpot:        (spot)    => set({ bookingSpot: spot }),
  setPartnerPortalTarget:(partner) => set({ partnerPortalTarget: partner }),
}));
