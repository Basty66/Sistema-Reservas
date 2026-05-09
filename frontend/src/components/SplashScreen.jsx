import { useEffect, useState } from 'react'

const QUOTES = [
  'Donde el sol brilla más fuerte...',
  'Preparando tu oasis perfecto...',
  'Cargando la frescura del agua...',
  'Disponiendo las mejores terrazas...',
  'Afinando cada detalle para ti...',
  'Bienvenido a tu paraíso...',
]

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(showTimer)
  }, [])

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % QUOTES.length)
        setFade(true)
      }, 300)
    }, 1600)
    return () => clearInterval(quoteInterval)
  }, [])

  useEffect(() => {
    const duration = 2400
    const interval = 30
    const step = 100 / (duration / interval)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= 100) {
        current = 100
        clearInterval(timer)
        setTimeout(onFinish, 500)
      }
      setProgress(Math.min(current, 100))
    }, interval)
    return () => clearInterval(timer)
  }, [onFinish])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-brand-night via-[#0a1628] to-brand-void overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] rounded-full bg-brand-gold/3 blur-[150px] animate-orb" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] rounded-full bg-brand-teal/3 blur-[150px] animate-orb-delayed" />
      </div>

      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-[20%] left-[15%] w-1 h-12 bg-white rounded-full animate-float-slow" />
        <div className="absolute top-[35%] right-[20%] w-1.5 h-8 bg-white rounded-full animate-float-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[55%] left-[25%] w-1 h-10 bg-white rounded-full animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[70%] right-[30%] w-1 h-6 bg-white rounded-full animate-float-slow" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-8 transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-brand-gold/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-br from-brand-gold/15 via-brand-teal/5 to-brand-night/50 backdrop-blur-2xl border border-brand-gold/20 flex items-center justify-center shadow-2xl shadow-brand-gold/20 animate-float-slow">
            <svg viewBox="0 0 200 60" className="w-36 sm:w-40">
              <defs>
                <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0d78c"/><stop offset="50%" stopColor="#d4a853"/><stop offset="100%" stopColor="#b8892f"/>
                </linearGradient>
                <linearGradient id="st2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#0d9488"/>
                </linearGradient>
              </defs>
              <g transform="translate(0, 8)">
                <path d="M23 40 C23 30, 21 20, 27 10" stroke="url(#sg2)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C35 5, 43 9, 47 5" stroke="url(#st2)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C21 3, 15 7, 11 3" stroke="url(#st2)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C31 1, 37 -1, 39 -3" stroke="url(#sg2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C23 1, 17 -1, 15 -3" stroke="url(#sg2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C29 15, 35 17, 33 21" stroke="url(#st2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </g>
              <text x="55" y="30" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="white">Piscina</text>
              <text x="55" y="48" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="url(#sg2)">OASIS</text>
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-wide">
            Piscina <span className="text-brand-gold">Oasis</span>
          </h1>
          <p className="text-brand-gold-light/60 text-sm sm:text-base font-light tracking-[0.25em] uppercase mt-1">
            Villa Alegre
          </p>
        </div>

        <div className="w-48 sm:w-56">
          <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-gold via-brand-teal to-brand-gold bg-[length:200%_100%] animate-gradient"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className={`text-white/35 text-xs sm:text-sm font-light tracking-wide transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          {QUOTES[quoteIndex]}
        </p>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-white/10 text-[10px] font-mono tracking-[0.3em] uppercase">Sistema de Reservas</p>
      </div>
    </div>
  )
}
