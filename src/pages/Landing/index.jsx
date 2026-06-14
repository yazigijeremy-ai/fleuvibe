import { useState } from 'react';
import HeroSection        from '../../components/HeroSection.jsx';
import ProofBar           from '../../components/ProofBar.jsx';
import ProblemSection     from '../../components/ProblemSection.jsx';
import HowItWorksSection  from '../../components/HowItWorksSection.jsx';
import FeaturesSection    from '../../components/FeaturesSection.jsx';
import TestimonialsSection from '../../components/TestimonialsSection.jsx';
import PricingSection     from '../../components/PricingSection.jsx';
import FinalCTASection    from '../../components/FinalCTASection.jsx';
import FleuVibeLogo       from '../../components/FleuVibeLogo.jsx';
import { useUIStore }     from '../../stores/uiStore.js';
import { useSpotStore }   from '../../stores/spotStore.js';

export function LandingPage() {
  const { openModal }    = useUIStore();
  const { spots }        = useSpotStore();
  const [search, setSearch] = useState('');

  const handleAISearch = () => {
    openModal('auth');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8f7', fontFamily: "'Inter', sans-serif" }}>
      {/* Minimal header for landing */}
      <header style={{ position: 'sticky', top: 0, background: '#fff', boxShadow: '0 1px 0 rgba(0,0,0,0.08)', zIndex: 100, padding: '0 20px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <FleuVibeLogo size="md" />
          <button onClick={() => openModal('auth')} style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#1a9e6e,#0891b2)', border: 'none', borderRadius: '40px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Connexion
          </button>
        </div>
      </header>

      <HeroSection spots={spots} search={search} setSearch={setSearch} handleAISearch={handleAISearch} aiSearchLoading={false} setShowAuth={() => openModal('auth')} />
      <ProofBar />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection setShowAuth={() => openModal('auth')} setShowPremium={() => openModal('premium')} />
      <FinalCTASection setShowAuth={() => openModal('auth')} />
    </div>
  );
}
