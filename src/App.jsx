import React, { useState, useCallback, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import GeneratorPanel from './components/GeneratorPanel'
import Gallery from './components/Gallery'
import AuthModal from './components/AuthModal'
import { ToastProvider, useToast } from './components/Toast'
import { generateVideo } from './api/replicate'
import { supabase } from './lib/supabase'

const PROGRESS_STAGES = [
  { at: 5,  label: 'Initialisation…' },
  { at: 20, label: 'Chargement du modèle…' },
  { at: 45, label: 'Génération des frames…' },
  { at: 75, label: 'Assemblage de la vidéo…' },
  { at: 92, label: 'Finalisation…' },
]

function useProgress(isGenerating) {
  const [percent, setPercent] = useState(0)
  const [label, setLabel] = useState('Initialisation…')
  const timerRef = useRef(null)
  const stageRef = useRef(0)

  useEffect(() => {
    if (!isGenerating) {
      setPercent(0)
      setLabel('Initialisation…')
      stageRef.current = 0
      return
    }
    const advance = () => {
      const stage = PROGRESS_STAGES[stageRef.current]
      if (!stage) return
      setPercent(stage.at)
      setLabel(stage.label)
      stageRef.current += 1
      const nextStage = PROGRESS_STAGES[stageRef.current]
      if (nextStage) timerRef.current = setTimeout(advance, 12000 + Math.random() * 6000)
    }
    advance()
    return () => clearTimeout(timerRef.current)
  }, [isGenerating])

  return { percent, label }
}

function friendlyError(msg = '') {
  if (msg.includes('insufficient credit')) return 'Crédits Replicate insuffisants — ajoute des crédits sur replicate.com/account/billing'
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('Timeout')) return 'La génération a pris trop de temps. Essaie avec une durée plus courte.'
  if (msg.includes('NSFW') || msg.includes('safety')) return 'Contenu non autorisé détecté. Modifie ton prompt.'
  if (msg.includes('version')) return 'Version du modèle introuvable. Réessaie dans quelques instants.'
  if (msg.includes('503') || msg.includes('502')) return 'Replicate est momentanément indisponible. Réessaie dans 1 minute.'
  return msg || 'Erreur inconnue lors de la génération.'
}

function VideoApp() {
  const { user } = useAuth()
  const toast = useToast()
  const [videos, setVideos] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [prefill, setPrefill] = useState(null)
  const progress = useProgress(isGenerating)

  useEffect(() => {
    if (!user) return
    supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data?.length) {
          setVideos(data.map(row => ({
            id: row.id,
            status: row.status,
            url: row.url,
            error: row.error,
            params: { ...row.params, prompt: row.prompt, negative_prompt: row.negative_prompt, model: row.model },
            createdAt: new Date(row.created_at),
          })))
        }
      })
  }, [user])

  useEffect(() => { if (!user) setVideos([]) }, [user])

  const updateVideo = useCallback((id, patch) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v))
  }, [])

  const handleGenerate = useCallback(async (params) => {
    setIsGenerating(true)
    let videoId
    if (user) {
      const { data, error } = await supabase.from('videos').insert({
        user_id: user.id,
        prompt: params.prompt || null,
        negative_prompt: params.negative_prompt || null,
        model: params.model,
        params: {
          aspect_ratio: params.aspect_ratio,
          duration: params.duration,
          fps: params.fps,
          quality: params.quality,
          seed: params.seed ?? null,
          image: params.image ? '[image]' : null,
        },
        status: 'pending',
      }).select().single()
      if (error) { console.error(error); setIsGenerating(false); return }
      videoId = data.id
    } else {
      videoId = `local-${Date.now()}`
    }
    setVideos(prev => [{ id: videoId, status: 'pending', params, createdAt: new Date() }, ...prev])
    try {
      const url = await generateVideo(params)
      updateVideo(videoId, { status: 'done', url })
      if (user) await supabase.from('videos').update({ status: 'done', url }).eq('id', videoId)
      toast.success('Vidéo générée !', 'Ta vidéo est prête dans la galerie ci-dessous.')
    } catch (err) {
      const msg = friendlyError(err.message)
      updateVideo(videoId, { status: 'error', error: msg })
      if (user) await supabase.from('videos').update({ status: 'error', error: msg }).eq('id', videoId)
      toast.error('Erreur de génération', msg)
    } finally {
      setIsGenerating(false)
    }
  }, [user, updateVideo, toast])

  const handleDelete = useCallback(async (id) => {
    if (user) await supabase.from('videos').delete().eq('id', id)
    setVideos(prev => prev.filter(v => v.id !== id))
  }, [user])

  const handleRetry = useCallback((params) => {
    handleGenerate(params)
  }, [handleGenerate])

  const handleReuse = useCallback((params) => {
    setPrefill({ ...params, _ts: Date.now() })
    toast.success('Paramètres chargés', 'Le formulaire a été remis à jour.')
  }, [toast])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLoginClick={() => setShowAuth(true)} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col gap-10">
        {!user && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm">
            <span className="text-accent/80 flex-1">💡 Connecte-toi pour sauvegarder tes vidéos et retrouver ton historique.</span>
            <button onClick={() => setShowAuth(true)} className="text-accent font-semibold hover:underline whitespace-nowrap">Se connecter →</button>
          </div>
        )}
        <GeneratorPanel
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          progress={progress}
          prefill={prefill}
        />
        <Gallery
          videos={videos}
          onDelete={user ? handleDelete : null}
          onRetry={handleRetry}
          onReuse={handleReuse}
          isAnon={!user}
        />
      </main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <VideoApp />
      </ToastProvider>
    </AuthProvider>
  )
}
