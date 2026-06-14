import { useState } from 'react';
import { supabase }     from '../../services/supabase/client.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useUIStore }   from '../../stores/uiStore.js';
import { sanitizeInput } from '../../utils/sanitizers.js';
import { logger }        from '../../utils/analytics.js';

/**
 * Formulaire de création d'une expédition (groupe).
 * @param {{ spotId?: number, onCreated?: () => void }} props
 * @returns {JSX.Element}
 */
export function GroupCreator({ spotId, onCreated }) {
  const { session }   = useAuthStore();
  const { openModal } = useUIStore();

  const [name, setName]           = useState('');
  const [date, setDate]           = useState('');
  const [maxPax, setMaxPax]       = useState(10);
  const [description, setDesc]    = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) { openModal('auth'); return; }
    if (!name.trim() || !date) { setError('Nom et date requis.'); return; }

    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('expeditions').insert({
      spot_id:          spotId ?? null,
      organizer_id:     session.user.id,
      name:             sanitizeInput(name),
      date:             new Date(date).toISOString(),
      max_participants: Number(maxPax),
      description:      sanitizeInput(description),
    });

    setLoading(false);

    if (err) {
      logger.error('group_create', err);
      setError('Erreur lors de la création. Réessayez.');
      return;
    }

    setName(''); setDate(''); setMaxPax(10); setDesc('');
    onCreated?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-lg">Créer une expédition</h3>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="space-y-1">
        <label className="text-sm text-gray-400" htmlFor="group-name">Nom de l&apos;expédition</label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Ex: Descente de la Dordogne"
          maxLength={100}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-400" htmlFor="group-date">Date</label>
          <input
            id="group-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-400" htmlFor="group-pax">Max participants</label>
          <input
            id="group-pax"
            type="number"
            value={maxPax}
            onChange={e => setMaxPax(e.target.value)}
            min={2}
            max={100}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-400" htmlFor="group-desc">Description (optionnel)</label>
        <textarea
          id="group-desc"
          value={description}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Détails, niveau requis, équipement…"
          maxLength={500}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="fv-btn w-full"
      >
        {loading ? 'Création…' : 'Créer l\'expédition'}
      </button>
    </form>
  );
}
