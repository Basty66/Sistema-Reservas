import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration, exiting: false }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300)
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const lastToast = toasts[toasts.length - 1]
    if (!lastToast.exiting) {
      const timer = setTimeout(() => removeToast(lastToast.id), lastToast.duration)
      return () => clearTimeout(timer)
    }
  }, [toasts, removeToast])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-sm px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all ${
              t.exiting ? 'animate-toastOut' : 'animate-toastIn'
            } ${
              t.type === 'success'
                ? 'bg-brand-teal text-white'
                : t.type === 'error'
                ? 'bg-brand-rose text-white'
                : t.type === 'warning'
                ? 'bg-brand-gold text-brand-night'
                : 'glass-dark text-white'
            }`}
          >
            <span className="text-lg shrink-0">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100 text-sm font-bold">&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
