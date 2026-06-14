import { useState, useEffect } from 'react';
import { supabase }     from '../../services/supabase/client.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useUIStore }   from '../../stores/uiStore.js';
import { Loader }       from '../../components/common/Loader.jsx';
import { logger }       from '../../utils/analytics.js';

/**
 * @typedef {{ id: string, spot_id: number, name: string, date: string, organizer_id: string, max_participants: number, participants: string[], description: string }} Expedition
 */

/**
 * Page communauté : liste des expéditions publiques avec possibilité de rejoindre.
 * @returns {JSX.Element}
 */
export function CommunityPage() {
  const { session }    = useAuthStore();
  const { openModal }  = useUIStore();
  const [expeditions, setExpeditions] = useState(/** @type {Expedition[]} */([]));
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    supabase
      .from('expeditions')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (error) logger.error('community_fetch', error);
        else setExpeditions(data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  /** @param {string} expId */
  async function joinExpedition(expId) {
    if (!session) { openModal('auth'); return; }
    const exp = expeditions.find(e => e.id === expId);
    if (!exp) return;
    if (exp.participants.includes(session.user.id)) return;
    if (exp.participants.length >= exp.max_participants) return;

    const updated = [...exp.participants, session.user.id];
    const { error } = await supabase
      .from('expeditions')
      .update({ participants: updated })
      .eq('id', expId);

    if (!error) {
      setExpeditions(prev => prev.map(e => e.id === expId ? { ...e, participants: updated } : e));
    }
  }

  if (loading) return <Loader size="lg" />;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Communauté — Expéditions</h1>

      {expeditions.length === 0 && (
        <p className="text-gray-400">Aucune expédition planifiée pour l&apos;instant.</p>
      )}

      {expeditions.map(exp => {
        const isFull   = exp.participants.length >= exp.max_participants;
        const isJoined = session && exp.participants.includes(session.user.id);
        const date     = new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

        return (
          <div key={exp.id} className="glass-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-lg">{exp.name}</h2>
                <p className="text-gray-400 text-sm">{date}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${isFull ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                {exp.participants.length}/{exp.max_participants} participants
              </span>
            </div>

            {exp.description && (
              <p className="text-gray-300 text-sm">{exp.description}</p>
            )}

            <button
              className={`fv-btn text-sm ${isJoined ? 'opacity-60 cursor-default' : ''} ${isFull && !isJoined ? 'opacity-40 cursor-not-allowed' : ''}`}
              disabled={isFull && !isJoined}
              onClick={() => !isJoined && joinExpedition(exp.id)}
            >
              {isJoined ? '✅ Rejoint' : isFull ? 'Complet' : 'Rejoindre'}
            </button>
          </div>
        );
      })}
    </main>
  );
}
