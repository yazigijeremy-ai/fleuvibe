import { useState } from 'react';
import { Modal }        from '../common/Modal.jsx';
import { useUIStore }   from '../../stores/uiStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { sanitizeInput } from '../../utils/sanitizers.js';
import { logger }        from '../../utils/analytics.js';

const COMMISSION_RATES = { basic: '5%', pro: '10%', elite: '15%' };

/**
 * Modal du programme d'affiliation partenaire.
 * @returns {JSX.Element|null}
 */
export function AffiliateModal() {
  const { modals, closeModal } = useUIStore();
  const { profile }            = useAuthStore();

  const [step, setStep]         = useState(/** @type {'info'|'apply'|'success'} */('info'));
  const [businessName, setBiz]  = useState('');
  const [website, setWebsite]   = useState('');
  const [loading, setLoading]   = useState(false);

  if (!modals.affiliate) return null;

  async function handleApply(e) {
    e.preventDefault();
    if (!businessName.trim()) return;
    setLoading(true);
    try {
      logger.info('affiliate_apply', {
        business: sanitizeInput(businessName),
        website:  sanitizeInput(website),
        userId:   profile?.id,
      });
      await new Promise(r => setTimeout(r, 800));
      setStep('success');
    } catch (err) {
      logger.error('affiliate_apply', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={() => { closeModal('affiliate'); setStep('info'); }}>
      <div className="p-6 max-w-md w-full space-y-5">
        <h2 className="text-xl font-bold">Programme Affilié FleuVibe</h2>

        {step === 'info' && (
          <>
            <p className="text-gray-300 text-sm">
              Devenez partenaire et gagnez des commissions sur chaque réservation générée par votre audience.
            </p>

            <div className="space-y-3">
              {Object.entries(COMMISSION_RATES).map(([tier, rate]) => (
                <div key={tier} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <span className="capitalize font-medium">{tier}</span>
                  <span className="text-blue-400 font-bold">{rate} de commission</span>
                </div>
              ))}
            </div>

            <ul className="text-sm text-gray-400 space-y-1.5">
              <li>✅ Tableau de bord dédié avec statistiques temps réel</li>
              <li>✅ Lien de suivi unique généré automatiquement</li>
              <li>✅ Paiement mensuel via virement ou PayPal</li>
              <li>✅ Accès aux ressources créatives (bannières, logos)</li>
            </ul>

            <button className="fv-btn w-full" onClick={() => setStep('apply')}>
              Déposer ma candidature
            </button>
          </>
        )}

        {step === 'apply' && (
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400" htmlFor="aff-biz">Nom de votre entreprise / marque</label>
              <input
                id="aff-biz"
                type="text"
                value={businessName}
                onChange={e => setBiz(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-400" htmlFor="aff-web">Site web (optionnel)</label>
              <input
                id="aff-web"
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="https://…"
              />
            </div>
            <button type="submit" disabled={loading} className="fv-btn w-full">
              {loading ? 'Envoi…' : 'Envoyer ma candidature'}
            </button>
            <button type="button" className="w-full text-sm text-gray-400 hover:text-white" onClick={() => setStep('info')}>
              Retour
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <span className="text-5xl">🎉</span>
            <p className="font-semibold">Candidature envoyée !</p>
            <p className="text-gray-400 text-sm">Notre équipe vous contactera sous 48h.</p>
            <button className="fv-btn" onClick={() => { closeModal('affiliate'); setStep('info'); }}>
              Fermer
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
