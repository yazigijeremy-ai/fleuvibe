import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth }    from './hooks/useAuth.js';
import { useUIStore } from './stores/uiStore.js';

import { Navbar }   from './components/layout/Navbar.jsx';
import { Footer }   from './components/layout/Footer.jsx';
import { Loader }   from './components/common/Loader.jsx';

import { AuthModal }       from './components/modals/AuthModal.jsx';
import { PremiumModal }    from './components/modals/PremiumModal.jsx';
import { BookingModal }    from './components/modals/BookingModal.jsx';
import { ProfileModal }    from './components/modals/ProfileModal.jsx';
import { SubmitSpotModal } from './components/modals/SubmitSpotModal.jsx';
import { ChallengesModal } from './components/modals/ChallengesModal.jsx';
import { AdminDashboard }  from './components/admin/AdminDashboard.jsx';
import { PartnerPortal }   from './components/partners/PartnerPortal.jsx';
import { AffiliateModal }  from './components/affiliate/AffiliateModal.jsx';

import './styles/themes.css';
import { logger } from './utils/analytics.js';

// Lazy-loaded pages for code splitting
const LandingPage   = lazy(() => import('./pages/Landing/index.jsx').then(m => ({ default: m.LandingPage })));
const HomePage      = lazy(() => import('./pages/Home/index.jsx').then(m => ({ default: m.HomePage })));
const SpotDetailPage = lazy(() => import('./pages/SpotDetail/index.jsx').then(m => ({ default: m.SpotDetailPage })));
const ProfilePage   = lazy(() => import('./pages/Profile/index.jsx').then(m => ({ default: m.ProfilePage })));
const CommunityPage = lazy(() => import('./pages/Community/index.jsx').then(m => ({ default: m.CommunityPage })));
const PremiumPage   = lazy(() => import('./pages/Premium/index.jsx').then(m => ({ default: m.PremiumPage })));

/** @param {{ children: React.ReactNode }} props */
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  const { session }     = useAuth();
  const { setIsOnline } = useUIStore();

  useEffect(() => {
    const online  = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);
    logger.info('app_start', { version: '6.0.0' });
    return () => {
      window.removeEventListener('online',  online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader size="lg" />}>
        <Routes>
          <Route path="/" element={
            session
              ? <AppLayout><HomePage /></AppLayout>
              : <LandingPage />
          } />
          <Route path="/spot/:id" element={
            <AppLayout><SpotDetailPage /></AppLayout>
          } />
          <Route path="/profile" element={
            session
              ? <AppLayout><ProfilePage /></AppLayout>
              : <Navigate to="/" replace />
          } />
          <Route path="/community" element={
            <AppLayout><CommunityPage /></AppLayout>
          } />
          <Route path="/premium" element={
            <AppLayout><PremiumPage /></AppLayout>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global modals — rendered outside routes to persist across navigation */}
      <AuthModal />
      <PremiumModal />
      <BookingModal />
      <ProfileModal />
      <SubmitSpotModal />
      <ChallengesModal />
      <AdminDashboard />
      <PartnerPortal />
      <AffiliateModal />
    </BrowserRouter>
  );
}
