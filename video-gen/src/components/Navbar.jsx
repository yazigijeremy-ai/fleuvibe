import React from 'react'
import { Sparkles } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-surface-1/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center glow-accent-sm">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">VideoGen <span className="text-accent">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 font-mono">Powered by Replicate</span>
        </div>
      </div>
    </nav>
  )
}
