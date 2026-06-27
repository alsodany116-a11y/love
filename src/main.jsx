import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Custom Error Boundary Component to display crashes on screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F5EDD6] text-[#2C1810] p-6 font-sans text-right dir-rtl">
          <div className="bg-white border-2 border-[#8B3A52] rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-[#8B3A52]">حدث خطأ غير متوقع في الموقع ⚠️</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              عذراً، حدث خطأ برمجائي أثناء تشغيل الصفحة. يرجى إرسال لقطة شاشة لهذا الخطأ للمساعد الذكي لإصلاحه فوراً.
            </p>
            
            <div className="bg-red-50 text-red-950 p-3 rounded border border-red-200 text-xs font-mono overflow-auto max-h-48 text-left dir-ltr">
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-[#B8960C] text-white rounded font-semibold text-sm hover:brightness-105 transition-all cursor-pointer"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
