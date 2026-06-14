import { useAuthStore } from '../../stores/authStore.js';
import { useUIStore }   from '../../stores/uiStore.js';

const PLANS = [
  {
    id: 'monthly',
    name: 'Mensuel',
    price: '4,99 €',
    period: '/mois',
    features: ['Accès illimité à tous les spots', 'Descriptions IA', 'Météo avancée', 'Sans publicité'],
  },
  {
    id: 'yearly',
    name: 'Annuel',
    price: '39,99 €',
    period: '/an',
    badge: '🔥 -33%',
    features: ['Tout le mensuel', 'Rapport PDF mensuel', 'Accès anticipé aux nouvelles features', 'Support prioritaire'],
  },
];

/**
 * Page Premium : présentation des plans et redirection vers la modal de paiement.
 * @returns {JSX.Element}
 */
export function PremiumPage() {
  const { isPremium } = useAuthStore();
  const { openModal } = useUIStore();

  if (isPremium) {
    return (
      <main className="container mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-5xl">✨</span>
        <h1 className="text-3xl font-bold">Vous êtes déjà Premium !</h1>
        <p className="text-gray-400">Profitez de toutes les fonctionnalités sans limite.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Passez à Premium</h1>
        <p className="text-gray-400">Débloquez toutes les fonctionnalités de FleuVibe.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {PLANS.map(plan => (
          <div key={plan.id} className="glass-card p-6 flex flex-col gap-4 relative">
            {plan.badge && (
              <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {plan.badge}
              </span>
            )}
            <div>
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-3xl font-bold text-blue-400 mt-1">
                {plan.price}<span className="text-sm font-normal text-gray-400">{plan.period}</span>
              </p>
            </div>
            <ul className="space-y-2 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              className="fv-btn w-full mt-2"
              onClick={() => openModal('premium')}
            >
              Choisir ce plan
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-xs">
        Paiement sécurisé via Stripe · Annulez à tout moment · Sans engagement
      </p>
    </main>
  );
}
