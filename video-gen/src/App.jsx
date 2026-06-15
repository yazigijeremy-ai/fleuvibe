import React, { useState, useCallback, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import GeneratorPanel from './components/GeneratorPanel'
import Gallery from './components/Gallery'
import AuthModal from './components/AuthModal'
import { generateVideo } from './api/replicate'
import { supabase } from './lib/supabase'

function VideoApp() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  // Load videos from Supabase when user logs in
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

  // Clear local videos when user logs out
  useEffect(() => {
    if (!user) setVideos([])
  }, [user])

  const updateVideo = useCallback((id, patch) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v))
  }, [])

  const handleGenerate = useCallback(async (params) => {
    setIsGenerating(true)

    // Insert pending row in Supabase (if logged in) or use local temp ID
    let videoId
    if (user) {
      const { data, error } = await supabase.from('videos').insert({
        user_id: user.id,
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || null,
        model: params.model,
        params: {
          aspect_ratio: params.aspect_ratio,
          duration: params.duration,
          fps: params.fps,
          quality: params.quality,
          seed: params.seed,
        },
        status: 'pending',
      }).select().single()

      if (error) { console.error(error); setIsGenerating(false); return }
      videoId = data.id
    } else {
      videoId = `local-${Date.now()}`
    }

    const newEntry = {
      id: videoId,
      status: 'pending',
      params,
      createdAt: new Date(),
    }
    setVideos(prev => [newEntry, ...prev])

    try {
      const url = await generateVideo(params, (status) => {
        updateVideo(videoId, { status: status === 'processing' ? 'pending' : status })
      })

      updateVideo(videoId, { status: 'done', url })

      if (user) {
        await supabase.from('videos').update({ status: 'done', url }).eq('id', videoId)
      }
    } catch (err) {
      updateVideo(videoId, { status: 'error', error: err.message })
      if (user) {
        await supabase.from('videos').update({ status: 'error', error: err.message }).eq('id', videoId)
      }
    } finally {
      setIsGenerating(false)
    }
  }, [user, updateVideo])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLoginClick={() => setShowAuth(true)} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 flex flex-col gap-10">
        {!user && (
          <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent/80">
            <span>💡</span>
            <span>Connecte-toi pour sauvegarder tes vidéos et retrouver ton historique.</span>
            <button onClick={() => setShowAuth(true)} className="ml-auto text-accent font-semibold hover:underline whitespace-nowrap">
              Se connecter →
            </button>
          </div>
        )}
        <GeneratorPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
        {videos.length > 0 && <Gallery videos={videos} onDelete={user ? async (id) => {
          await supabase.from('videos').delete().eq('id', id)
          setVideos(prev => prev.filter(v => v.id !== id))
        } : null} />}
      </main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <VideoApp />
    </AuthProvider>
  )
}
