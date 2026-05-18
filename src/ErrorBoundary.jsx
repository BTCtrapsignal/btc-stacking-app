import { Component } from 'react'

/**
 * ErrorBoundary — top-level crash protection.
 * Prevents full white-screen on unexpected render errors.
 * Class component required by React Error Boundary spec.
 * No app imports. No hooks. No styling dependencies.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught render error:', error, info?.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100svh',
        fontFamily: 'system-ui, sans-serif', padding: '24px', textAlign: 'center',
        background: '#f5f4f0', color: '#1a1a1a',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
          Something went wrong
        </div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 28, maxWidth: 280 }}>
          {this.state.message}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: '#1a1a1a', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Reload App
        </button>
      </div>
    )
  }
}
