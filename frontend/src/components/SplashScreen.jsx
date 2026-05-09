import { useEffect, useState } from 'react'

const QUOTES = [
  'Preparando el oasis para ti...',
  'Cargando las palmeras... 🌴',
  'Calentando la piscina... 🏊',
  'Disponiendo las terrazas... 🍹',
  'Afinando los detalles... ✨',
]

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setQuoteIndex(prev => (prev + 1) % QUOTES.length)
        setFade(true)
      }, 300)
    }, 1200)
    return () => clearInterval(quoteInterval)
  }, [])

  useEffect(() => {
    const duration = 2000
    const interval = 30
    const step = 100 / (duration / interval)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= 100) {
        current = 100
        clearInterval(timer)
        setTimeout(onFinish, 400)
      }
      setProgress(Math.min(current, 100))
    }, interval)
    return () => clearInterval(timer)
  }, [onFinish])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-brand-night via-[#0a1628] to-brand-void overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-gold/3 blur-[120px] animate-orb" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-teal/3 blur-[120px] animate-orb-delayed" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated logo */}
        <div className="relative animate-float-slow">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-gradient-to-br from-brand-gold/20 to-brand-teal/10 backdrop-blur-xl border border-brand-gold/20 flex items-center justify-center shadow-2xl shadow-brand-gold/10">
            <svg viewBox="0 0 200 60" className="w-32 sm:w-36">
              <defs>
                <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f0d78c"/><stop offset="50%" stop-color="#d4a853"/><stop offset="100%" stop-color="#b8892f"/>
                </linearGradient>
                <linearGradient id="st" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#0d9488"/>
                </linearGradient>
              </defs>
              <path d="M23 50 C23 40, 21 30, 27 20" stroke="url(#sg)" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M27 20 C35 15, 43 19, 47 15" stroke="url(#st)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M27 20 C21 13, 15 17, 11 13" stroke="url(#st)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M27 20 C31 11, 37 9, 39 7" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M27 20 C23 11, 17 9, 15 7" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <text x="55" y="30" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="white">Piscina</text>
              <text x="55" y="48" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="url(#sg)">OASIS</text>
            </svg>
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-48 sm:w-56">
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-teal transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quote */}
        <p className={`text-white/40 text-sm font-light tracking-wide transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          {QUOTES[quoteIndex]}
        </p>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-white/10 text-[10px] font-mono tracking-[0.3em] uppercase">Sistema de Reservas</p>
      </div>
    </div>
  )
}
