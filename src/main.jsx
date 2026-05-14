import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[FleuVibe] Render error:', error, info)
  }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: {
          position: 'fixed', inset: 0,
          background: '#0a1628',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', color: '#ef4444',
          padding: '24px', gap: '16px',
        }
      },
        React.createElement('div', { style: { fontSize: '2rem' } }, '🌊'),
        React.createElement('h1', { style: { fontSize: '1.1rem', color: '#daf0e8' } }, 'FleuVibe — Erreur de chargement'),
        React.createElement('pre', {
          style: {
            background: 'rgba(255,255,255,0.05)',
            padding: '16px', borderRadius: '8px',
            maxWidth: '600px', width: '100%',
            overflow: 'auto', fontSize: '0.75rem', color: '#f87171',
          }
        }, String(this.state.error)),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          style: {
            padding: '10px 24px', background: '#1a9e6e',
            border: 'none', borderRadius: '20px',
            color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
          }
        }, 'Recharger la page')
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
