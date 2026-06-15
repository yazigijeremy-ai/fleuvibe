import React, { useState } from 'react'
import {
  Wand2, ChevronDown, ChevronUp, Loader2, Shuffle,
  Clock, RatioIcon, Gauge, Hash, Zap
} from 'lucide-react'
import AdvancedSettings from './AdvancedSettings'

const EXAMPLE_PROMPTS = [
  'A majestic eagle soaring over snow-capped mountains at golden hour, cinematic 4K',
  'A cyberpunk city at night with neon reflections on wet streets, rain falling',
  'Slow motion ocean waves crashing on a volcanic black sand beach, aerial view',
  'A lone astronaut walking on Mars surface, dust storm in the distance',
]

const DEFAULT_PARAMS = {
  prompt: '',
  negative_prompt: '',
  duration: 5,
  aspect_ratio: '16:9',
  fps: 24,
  quality: 'standard',
  seed: '',
  model: 'ltx-video',
}

export default function GeneratorPanel({ onGenerate, isGenerating }) {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const set = (key) => (val) => setParams(p => ({ ...p, [key]: val }))

  const randomPrompt = () => {
    const p = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]
    setParams(prev => ({ ...prev, prompt: p }))
  }

  const randomSeed = () => {
    setParams(prev => ({ ...prev, seed: Math.floor(Math.random() * 9999999).toString() }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!params.prompt.trim() || isGenerating) return
    onGenerate({ ...params, seed: params.seed ? parseInt(params.seed) : undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
          Génère tes vidéos avec l'IA
        </h1>
        <p className="text-white/40 text-sm">Décris ta vidéo en quelques mots et laisse l'IA faire le reste</p>
      </div>

      {/* Main prompt */}
      <div className="bg-surface-1 border border-white/8 rounded-2xl p-4 space-y-3 focus-within:border-accent/50 transition-colors">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Prompt</label>
          <button
            type="button"
            onClick={randomPrompt}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-accent transition-colors"
          >
            <Shuffle size={12} />
            Exemple
          </button>
        </div>
        <textarea
          value={params.prompt}
          onChange={e => set('prompt')(e.target.value)}
          placeholder="Ex: A cinematic drone shot flying over a misty forest at sunrise..."
          rows={4}
          className="w-full bg-transparent text-white placeholder-white/20 text-sm resize-none outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-xs text-white/20">{params.prompt.length} caractères</span>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span className="flex items-center gap-1"><Clock size={11} />{params.duration}s</span>
            <span className="flex items-center gap-1"><RatioIcon size={11} />{params.aspect_ratio}</span>
            <span className="flex items-center gap-1"><Gauge size={11} />{params.fps} fps</span>
          </div>
        </div>
      </div>

      {/* Advanced settings toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center justify-between w-full px-4 py-3 bg-surface-1 border border-white/8 rounded-xl hover:border-white/15 transition-colors text-sm"
      >
        <span className="text-white/60 font-medium flex items-center gap-2">
          <Zap size={14} className="text-accent" />
          Paramètres avancés
        </span>
        {showAdvanced ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {showAdvanced && (
        <AdvancedSettings params={params} set={set} randomSeed={randomSeed} />
      )}

      {/* Generate button */}
      <button
        type="submit"
        disabled={!params.prompt.trim() || isGenerating}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all
          bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
          glow-accent hover:glow-accent active:scale-[0.99]"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Wand2 size={16} />
            Générer la vidéo
          </>
        )}
      </button>

      {isGenerating && (
        <div className="text-center text-xs text-white/30 animate-pulse-slow">
          La génération peut prendre 30 à 90 secondes selon le modèle
        </div>
      )}
    </form>
  )
}
