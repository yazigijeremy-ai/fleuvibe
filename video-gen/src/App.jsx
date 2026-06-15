import React, { useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import GeneratorPanel from './components/GeneratorPanel'
import Gallery from './components/Gallery'
import { generateVideo } from './api/replicate'

export default function App() {
  const [videos, setVideos] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentJob, setCurrentJob] = useState(null)

  const handleGenerate = useCallback(async (params) => {
    setIsGenerating(true)
    const jobId = Date.now()
    const newEntry = {
      id: jobId,
      status: 'pending',
      params,
      createdAt: new Date(),
    }
    setVideos(prev => [newEntry, ...prev])
    setCurrentJob(jobId)

    try {
      const videoUrl = await generateVideo(params)
      setVideos(prev =>
        prev.map(v => v.id === jobId ? { ...v, status: 'done', url: videoUrl } : v)
      )
    } catch (err) {
      setVideos(prev =>
        prev.map(v => v.id === jobId ? { ...v, status: 'error', error: err.message } : v)
      )
    } finally {
      setIsGenerating(false)
      setCurrentJob(null)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col gap-10">
        <GeneratorPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
        {videos.length > 0 && <Gallery videos={videos} />}
      </main>
    </div>
  )
}
