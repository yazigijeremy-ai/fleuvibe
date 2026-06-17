import React, { useCallback, useState } from 'react'
import { ImageIcon, X } from 'lucide-react'

export default function ImageUpload({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target.result)
    reader.readAsDataURL(file)
  }, [onChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }, [processFile])

  if (value) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/8">
        <img src={value} alt="Source" className="w-full max-h-52 object-contain bg-surface-2" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors"
        >
          <X size={14} className="text-white" />
        </button>
        <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white/60 px-2 py-0.5 rounded-md">
          Image source
        </div>
      </div>
    )
  }

  return (
    <label
      className={`flex flex-col items-center justify-center gap-3 h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
        isDragging ? 'border-accent bg-accent/10' : 'border-white/10 hover:border-white/25 bg-surface-1'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => processFile(e.target.files[0])}
      />
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <ImageIcon size={20} className="text-white/30" />
      </div>
      <div className="text-center">
        <p className="text-sm text-white/40">
          Glisse une image ou <span className="text-accent">clique pour choisir</span>
        </p>
        <p className="text-xs text-white/20 mt-0.5">JPG, PNG, WebP</p>
      </div>
    </label>
  )
}
