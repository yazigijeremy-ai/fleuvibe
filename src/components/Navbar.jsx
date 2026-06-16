import React, { useState } from 'react'
import { Sparkles, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar({ onLoginClick }) {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const avatar = user?.user_metadata?.avatar_url
  const initials = user?.email?.slice(0, 2).toUpperCase() || '?'

  return (
    <nav className="border-b border-white/5 bg-surface-1/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center glow-accent-sm"><Sparkles size={16} className="text-white" /></div>
          <span className="font-semibold text-white tracking-tight">VideoGen <span className="text-accent">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30 font-mono hidden sm:block">Powered by Replicate</span>
          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                {avatar ? <img src={avatar} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-accent/30 text-accent text-xs font-bold flex items-center justify-center">{initials}</div>}
                <span className="text-xs text-white/60 max-w-[120px] truncate">{user.email}</span>
                <ChevronDown size={12} className="text-white/30" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-2 border border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-white/5"><p className="text-xs text-white/40 truncate">{user.email}</p></div>
                  <button onClick={() => { signOut(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} />Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLoginClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all glow-accent-sm">
              <User size={12} />Connexion
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
