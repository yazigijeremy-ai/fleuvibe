import React, { useState } from 'react'
import { Download, AlertCircle, Loader2, Clock, ChevronDown, Trash2 } from 'lucide-react'

function VideoCard({ video, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-surface-1 border border-white/8 rounded-2xl overflow-hidden group hover:border-white/15 transition-all animate-fade-in">
      <div className="aspect-video bg-surface-2 flex items-center justify-center relative">
        {video.status === 'done' && video.url ? (
          <>
            <video src={video.url} controls className="w-full h-full object-cover" preload="metadata" />
            <a
              href={video.url}
              download
              className="absolute top-2 right-2 p-2 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <Download size={14} className="text-white" />
            </a>
          </>
        ) : video.status === 'pending' ? (
          <div className="flex flex-col items-center gap-3 text-white/30">
            <Loader2 size={28} className="animate-spin-slow text-accent" />
            <span className="text-xs">Génération en cours…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-red-400/70 p-4 text-center">
            <AlertCircle size={24} />
            <span className="text-xs">{video.error || 'Erreur de génération'}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{video.params?.prompt}</p>

        <div className="flex items-center gap-2 text-xs text-white/30 font-mono flex-wrap">
          <span>{video.params?.aspect_ratio}</span>
          <span>·</span>
          <span>{video.params?.duration}s</span>
          <span>·</span>
          <span>{video.params?.fps} fps</span>
          <span>·</span>
          <span>{video.params?.model}</span>
        </div>

        {video.params?.negative_prompt && (
          <>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              <ChevronDown size={12} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
              Prompt négatif
            </button>
            {expanded && <p className="text-xs text-white/30 italic">{video.params.negative_prompt}</p>}
          </>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-white/20">
            <Clock size={11} />
            {new Date(video.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(video.id)}
                className="p-1 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              video.status === 'done' ? 'bg-green-500/10 text-green-400' :
              video.status === 'error' ? 'bg-red-500/10 text-red-400' :
              'bg-accent/10 text-accent'
            }`}>
              {video.status === 'done' ? 'Terminé' : video.status === 'error' ? 'Erreur' : 'En cours'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Gallery({ videos, onDelete }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white/80">
          Mes vidéos <span className="text-white/30 font-normal text-sm">({videos.length})</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} onDelete={onDelete} />
        ))}
      </div>
    </section>
  )
}
