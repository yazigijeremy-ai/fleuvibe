import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Une erreur s'est produite</h2>
          <p className="text-sm text-white/40">{this.state.error?.message || 'Erreur inconnue'}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent rounded-xl text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            <RefreshCw size={14} />
            Recharger
          </button>
        </div>
      </div>
    )
  }
}
