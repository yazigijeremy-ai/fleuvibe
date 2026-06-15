import React from 'react'
import { RefreshCw } from 'lucide-react'

const RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9']
const DURATIONS = [3, 5, 8, 10]
const FPS_OPTIONS = [16, 24, 30]
const MODELS = [
  { value: 'ltx-video', label: 'LTX-Video', desc: 'Rapide, qualité équilibrée' },
  { value: 'cogvideox-5b', label: 'CogVideoX-5B', desc: 'Haute qualité, plus lent' },
  { value: 'wan-t2v', label: 'Wan 2.1 T2V', desc: 'Excellent mouvement' },
]

export default function AdvancedSettings({ params, set, randomSeed }) {
  return (
    <div className="bg-surface-1 border border-white/8 rounded-2xl p-5 space-y-6 animate-fade-in">

      {/* Model */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Modèle</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MODELS.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => set('model')(m.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                params.model === m.value
                  ? 'border-accent bg-accent/10 text-white'
                  : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
              }`}
            >
              <div className="text-sm font-medium">{m.label}</div>
              <div className="text-xs mt-0.5 opacity-60">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect ratio */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Format</label>
        <div className="flex flex-wrap gap-2">
          {RATIOS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => set('aspect_ratio')(r)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-all ${
                params.aspect_ratio === r
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Duration + FPS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Durée</label>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => set('duration')(d)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                  params.duration === d
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/8 text-white/40 hover:border-white/20'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">FPS</label>
          <div className="flex gap-2">
            {FPS_OPTIONS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => set('fps')(f)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                  params.fps === f
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/8 text-white/40 hover:border-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Negative prompt */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Prompt négatif</label>
        <textarea
          value={params.negative_prompt}
          onChange={e => set('negative_prompt')(e.target.value)}
          placeholder="Éléments à éviter dans la vidéo..."
          rows={2}
          className="w-full bg-surface-2 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-white/20 resize-none transition-colors"
        />
      </div>

      {/* Seed */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Seed</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={params.seed}
            onChange={e => set('seed')(e.target.value)}
            placeholder="Aléatoire"
            className="flex-1 bg-surface-2 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-white/20 transition-colors font-mono"
          />
          <button
            type="button"
            onClick={randomSeed}
            className="px-3 py-2 bg-surface-2 border border-white/8 rounded-xl hover:border-white/20 transition-colors text-white/40 hover:text-white/70"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <p className="text-xs text-white/20">Fixe un seed pour reproduire exactement la même vidéo</p>
      </div>

      {/* Quality */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Qualité</label>
        <div className="flex gap-2">
          {['standard', 'high'].map(q => (
            <button
              key={q}
              type="button"
              onClick={() => set('quality')(q)}
              className={`flex-1 py-2 rounded-xl border text-sm capitalize font-medium transition-all ${
                params.quality === q
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/8 text-white/40 hover:border-white/20'
              }`}
            >
              {q === 'standard' ? 'Standard' : 'Haute'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
