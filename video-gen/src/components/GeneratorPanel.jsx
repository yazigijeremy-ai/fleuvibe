import React, { useState } from 'react'
import { Wand2, ChevronDown, ChevronUp, Loader2, Shuffle, Clock, Gauge, Zap, AlertCircle } from 'lucide-react'
import AdvancedSettings from './AdvancedSettings'

const EXAMPLE_PROMPTS = [
  'A majestic eagle soaring over snow-capped mountains at golden hour, cinematic 4K',
  'A cyberpunk city at night with neon reflections on wet streets, rain falling slowly',
  'Slow motion ocean waves crashing on a volcanic black sand beach, aerial drone shot',
  'A lone astronaut walking on Mars surface, red dust storm in the distance, epic scale',
  'Cherry blossom petals falling in a Japanese garden at sunset, peaceful and serene',
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

const MAX_PROMPT = 1000

export default function GeneratorPanel({ onGenerate, isGenerating, progress }) {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const set = (key) => (val) => setParams(p => ({ ...p, [key]: val }))
  const remaining = MAX_PROMPT - params.prompt.length
  const overLimit = remaining < 0

  const randomPrompt = () => {
    const p = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]
    setParams(prev => ({ ...prev, prompt: p }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!params.prompt.trim() || isGenerating || overLimit) return
    onGenerate({ ...params, seed: params.seed ? parseInt(params.seed) : undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="text-center space-y-1.5 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/40 bg-clip-text text-transparent leading-tight">
          Génère tes vidéos avec l'IA
        </h1>
        <p className="text-white/40 text-sm">Décris ta vidéo et laisse l'IA faire le reste</p>
      </div>

      {/* Prompt */}
      <div className={`bg-surface-1 border rounded-2xl p-4 space-y-3 transition-colors ${
        overLimit ? 'border-red-500/50' : 'border-white/8 focus-within:border-accent/50'
      }`}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Prompt</label>
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
          placeholder="Ex: A cinematic drone shot flying over a misty forest at sunrise, golden light rays piercing through the fog..."
          rows={4}
          className="w-full bg-transparent text-white placeholder-white/20 text-sm resize-none outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className={`text-xs font-mono ${overLimit ? 'text-red-400' : remaining < 100 ? 'text-yellow-400/70' : 'text-white/20'}`}>
            {remaining < 0 ? `+${Math.abs(remaining)} dépassé` : `${remaining} restants`}
          </span>
          <div className="flex items-center gap-3 text-xs text-white/25">
            <span className="flex items-center gap-1"><Clock size={11} />{params.duration}s</span>
            <span className="flex items-center gap-1"><Gauge size={11} />{params.fps} fps</span>
            <span className="text-white/30">{params.aspect_ratio}</span>
          </div>
        </div>
      </div>

      {overLimit && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
          <AlertCircle size={13} />
          Prompt trop long — réduis-le à {MAX_PROMPT} caractères maximum
        </div>
      )}

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center justify-between w-full px-4 py-3 bg-surface-1 border border-white/8 rounded-xl hover:border-white/15 transition-colors text-sm"
      >
        <span className="text-white/50 font-medium flex items-center gap-2">
          <Zap size={14} className="text-accent" />
          Paramètres avancés
        </span>
        {showAdvanced ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {showAdvanced && (
        <AdvancedSettings params={params} set={set} />
      )}

      {/* Generate button */}
      <button
        type="submit"
        disabled={!params.prompt.trim() || isGenerating || overLimit}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all
          bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
          glow-accent hover:glow-accent active:scale-[0.99]"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {progress?.label || 'Génération en cours…'}
          </>
        ) : (
          <>
            <Wand2 size={16} />
            Générer la vidéo
          </>
        )}
      </button>

      {isGenerating && (
        <div className="space-y-2">
          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-1000"
              style={{ width: `${progress?.percent || 5}%` }}
            />
          </div>
          <p className="text-center text-xs text-white/25 animate-pulse-slow">
            La génération prend généralement 30 à 90 secondes
          </p>
        </div>
      )}
    </form>
  )
}
