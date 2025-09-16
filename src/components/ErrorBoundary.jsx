import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-100 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-red-900 mb-4">エラーが発生しました</h1>
            <p className="text-red-700 mb-4">
              アプリケーションでエラーが発生しました。ページを再読み込みしてください。
            </p>
            {this.state.error && (
              <details className="text-left bg-white p-4 rounded mb-4">
                <summary className="cursor-pointer font-bold">エラー詳細</summary>
                <pre className="text-sm text-gray-600 mt-2">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
