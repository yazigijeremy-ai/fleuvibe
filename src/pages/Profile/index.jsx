import { useAuthStore }         from '../../stores/authStore.js';
import { useGamificationStore } from '../../stores/gamificationStore.js';
import { useGamification }      from '../../hooks/useGamification.js';
import { LevelBadge }           from '../../components/gamification/LevelBadge.jsx';
import { BADGES_DEF, CHALLENGES } from '../../utils/constants.js';

/**
 * Page profil utilisateur : niveau, badges, défis, statistiques.
 * @returns {JSX.Element}
 */
export function ProfilePage() {
  const { profile, userName }   = useAuthStore();
  const { badges, stats }       = useGamificationStore();
  const { currentLevel, progress, nextLevel, challengeProgress } = useGamification();

  const earnedIds = new Set((badges || []).map(b => b.id));

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
      {/* En-tête */}
      <section className="glass-card p-6 flex items-center gap-6">
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          : <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl text-white font-bold">
              {(userName || '?')[0].toUpperCase()}
            </div>
        }
        <div>
          <h1 className="text-2xl font-bold">{userName || 'Explorateur'}</h1>
          <p className="text-gray-400 text-sm">{profile?.is_premium ? '✨ Premium' : 'Gratuit'}</p>
        </div>
        <div className="ml-auto">
          <LevelBadge />
        </div>
      </section>

      {/* Statistiques */}
      <section className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Spots visités',     value: stats.totalSpotsVisited },
            { label: 'Pays',              value: stats.countriesVisited },
            { label: 'Avis rédigés',      value: stats.totalReviews },
            { label: 'Spots ajoutés',     value: stats.spotsAdded },
            { label: 'Expéditions longues', value: stats.longExpeditions },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{value ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Niveau et XP */}
      <section className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-3">
          Niveau {currentLevel?.level} — {currentLevel?.title}
        </h2>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {progress.toFixed(0)}% vers {nextLevel?.title || 'Niveau max'}
        </p>
      </section>

      {/* Badges */}
      <section className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Badges</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {BADGES_DEF.map(badge => {
            const earned = earnedIds.has(badge.id);
            return (
              <div
                key={badge.id}
                title={badge.description}
                className={`p-3 rounded-xl text-center transition ${earned ? 'bg-blue-500/20 opacity-100' : 'bg-white/5 opacity-40 grayscale'}`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <p className="text-xs mt-1 font-medium">{badge.name}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Défis */}
      <section className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Défis</h2>
        <div className="space-y-4">
          {CHALLENGES.map(ch => {
            const cp = challengeProgress.find(c => c.id === ch.id);
            const pct = cp ? Math.min(100, (cp.current / ch.target) * 100) : 0;
            return (
              <div key={ch.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{ch.emoji} {ch.name}</span>
                  <span className="text-gray-400">{cp?.current ?? 0}/{ch.target}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
