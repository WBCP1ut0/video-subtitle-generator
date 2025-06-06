'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log specific chunk loading errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.error('Chunk loading error detected. This might be due to:')
      console.error('1. Network issues')
      console.error('2. Build cache issues')
      console.error('3. Dynamic import problems')
    }

    this.setState({
      error,
      errorInfo
    })
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    // For chunk loading errors, try to reload the page
    if (this.state.error?.name === 'ChunkLoadError' || 
        this.state.error?.message.includes('Loading chunk')) {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          retry={this.retry}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  const isChunkError = error?.name === 'ChunkLoadError' || 
                      error?.message.includes('Loading chunk')

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isChunkError ? 'Loading Error' : 'Something went wrong'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {isChunkError 
            ? 'There was an issue loading part of the application. This usually resolves with a refresh.'
            : 'An unexpected error occurred. Please try again.'
          }
        </p>

        {error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
        
        <button
          onClick={retry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isChunkError ? 'Refresh Page' : 'Try Again'}
        </button>
      </div>
    </div>
  )
}

export default ErrorBoundary 