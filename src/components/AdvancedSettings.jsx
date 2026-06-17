import React, { useState } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'

const RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9']
const DURATIONS = [3, 5, 8, 10, 15, 20, 30]
const FPS_OPTIONS = [16, 24, 30]
const T2V_MODELS = [
  { value: 'ltx-video', label: 'LTX-Video', desc: 'Rapide, bonne qualité', badge: 'Rapide' },
  { value: 'cogvideox-5b', label: 'CogVideoX-5B', desc: 'Haute qualité, plus lent', badge: 'Qualité' },
  { value: 'wan-t2v', label: 'Wan 2.1', desc: 'Excellent mouvement', badge: 'Mouvement' },
]

const I2V_MODELS = [
  { value: 'wan-i2v', label: 'Wan 2.1 I2V', desc: 'Anime ton image en vidéo', badge: 'I2V' },
]

function Section({ title, children }) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</label>
      {children}
    </div>
  )
}

function ToggleGroup({ options, value, onChange, renderLabel }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-all ${
            value === opt ? 'border-accent bg-accent/10 text-accent' : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/60'
          }`}>
          {renderLabel ? renderLabel(opt) : opt}
        </button>
      ))}
    </div>
  )
}

export default function AdvancedSettings({ params, set, mode = 'text' }) {
  const [showNegative, setShowNegative] = useState(!!params.negative_prompt)
  const randomSeed = () => set('seed')(Math.floor(Math.random() * 9_999_999).toString())
  const models = mode === 'image' ? I2V_MODELS : T2V_MODELS

  return (
    <div className="bg-surface-1 border border-white/8 rounded-2xl p-5 space-y-5 animate-fade-in">
      <Section title="Modèle IA">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {models.map(m => (
            <button key={m.value} type="button" onClick={() => set('model')(m.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                params.model === m.value ? 'border-accent bg-accent/10' : 'border-white/8 hover:border-white/20'
              }`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-sm font-medium ${params.model === m.value ? 'text-white' : 'text-white/50'}`}>{m.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">{m.badge}</span>
              </div>
              <div className="text-xs text-white/30">{m.desc}</div>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Format">
        <ToggleGroup options={RATIOS} value={params.aspect_ratio} onChange={set('aspect_ratio')} />
      </Section>
      <div className="grid grid-cols-2 gap-4">
        <Section title="Durée">
          <ToggleGroup options={DURATIONS} value={params.duration} onChange={set('duration')} renderLabel={d => `${d}s`} />
        </Section>
        <Section title="FPS">
          <ToggleGroup options={FPS_OPTIONS} value={params.fps} onChange={set('fps')} />
        </Section>
      </div>
      <Section title="Qualité">
        <ToggleGroup options={['standard', 'high']} value={params.quality} onChange={set('quality')} renderLabel={q => q === 'standard' ? 'Standard' : 'Haute'} />
      </Section>
      <Section title="Seed">
        <div className="flex gap-2">
          <input type="number" value={params.seed} onChange={e => set('seed')(e.target.value)} placeholder="Aléatoire" min={0}
            className="flex-1 bg-surface-2 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-white/20 transition-colors font-mono" />
          <button type="button" onClick={randomSeed} title="Générer un seed aléatoire"
            className="px-3 py-2 bg-surface-2 border border-white/8 rounded-xl hover:border-white/20 transition-colors text-white/30 hover:text-white/60">
            <RefreshCw size={14} />
          </button>
        </div>
        <p className="text-xs text-white/20">Même seed + même prompt = même vidéo</p>
      </Section>
      <button type="button" onClick={() => setShowNegative(v => !v)} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
        <ChevronDown size={12} className={showNegative ? 'rotate-180 transition-transform' : 'transition-transform'} />
        {showNegative ? 'Masquer le prompt négatif' : 'Ajouter un prompt négatif'}
      </button>
      {showNegative && (
        <Section title="Prompt négatif">
          <textarea value={params.negative_prompt} onChange={e => set('negative_prompt')(e.target.value)}
            placeholder="Éléments à éviter: flou, mauvaise qualité, distorsion…" rows={2}
            className="w-full bg-surface-2 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/60 placeholder-white/20 outline-none focus:border-white/20 resize-none transition-colors" />
        </Section>
      )}
    </div>
  )
}
