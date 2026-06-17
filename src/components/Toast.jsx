import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 4000)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-sm animate-fade-in max-w-sm w-full ${
      toast.type === 'success'
        ? 'bg-green-500/10 border-green-500/20 text-green-300'
        : 'bg-red-500/10 border-red-500/20 text-red-300'
    }`}>
      {toast.type === 'success'
        ? <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-400" />
        : <XCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && <p className="text-xs mt-0.5 opacity-70">{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((type, title, message, duration) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message, duration }])
  }, [])

  const success = useCallback((title, message) => toast('success', title, message), [toast])
  const error = useCallback((title, message) => toast('error', title, message), [toast])

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
