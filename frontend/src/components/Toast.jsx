import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { IcoSuccess, IcoError, IcoWarning, IcoInfo, IcoClose } from '../icons'

const ToastContext = createContext(null)
export function useToast() { return useContext(ToastContext) }

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

  const icons = { success: IcoSuccess, error: IcoError, warning: IcoWarning, info: IcoInfo }
  const styles = {
    success: 'from-emerald-600 to-emerald-700',
    error: 'from-brand-rose to-brand-rose-dark',
    warning: 'from-brand-gold to-brand-gold-dark text-brand-night',
    info: 'from-brand-slate to-brand-dark',
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto max-w-sm w-full px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 bg-gradient-to-r ${styles[t.type]} ${
                t.exiting ? 'animate-toastOut' : 'animate-toastIn'
              }`}
            >
              <span className="shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                {Icon && <Icon className="w-4 h-4 text-white" />}
              </span>
              <p className="text-sm font-medium flex-1 text-white">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 text-white cursor-pointer shrink-0">
                <IcoClose className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
