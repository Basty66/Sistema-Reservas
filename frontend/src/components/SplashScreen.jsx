import { useEffect, useState } from 'react'

const QUOTES = [
  'Donde el sol brilla más fuerte...',
  'Preparando tu oasis perfecto...',
  'Cargando la frescura del agua...',
  'Disponiendo las mejores terrazas...',
  'Afinando cada detalle para ti...',
  'Bienvenido a tu paraíso...',
]

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  size: 2 + (i % 4) * 1.5,
  left: (i * 4.3) % 100,
  delay: (i * 0.37) % 8,
  duration: 7 + (i % 5) * 1.5,
  opacity: 0.08 + (i % 4) * 0.05,
}))

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [exiting, setExiting] = useState(false)

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
        setTimeout(() => { setExiting(true); setTimeout(onFinish, 600) }, 500)
      }
      setProgress(Math.min(current, 100))
    }, interval)
    return () => clearInterval(timer)
  }, [onFinish])

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${
      exiting ? 'opacity-0 scale-110 blur-xl pointer-events-none' : 'opacity-100 scale-100 blur-0'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-night via-[#0a1628] to-brand-void" />

      <div className="absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] rounded-full bg-brand-gold/3 blur-[150px] animate-orb" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] rounded-full bg-brand-teal/3 blur-[150px] animate-orb-delayed" />
        <div className="absolute top-[45%] left-[55%] w-[50%] h-[50%] rounded-full bg-brand-rose/2 blur-[120px] animate-orb" style={{ animationDelay: '3s' }} />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map(p => (
          <span
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              width: p.size, height: p.size,
              left: `${p.left}%`, bottom: '-10px',
              opacity: p.opacity,
              animation: `splash-float-up ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-7 transition-all duration-700 ease-out ${
        showContent && !exiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-brand-gold/8 animate-[splash-ripple_2.5s_ease-out_infinite]" />
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-brand-teal/8 animate-[splash-ripple_2.5s_ease-out_infinite]" style={{ animationDelay: '1.25s' }} />
          </div>

          <div className="absolute inset-0 bg-brand-gold/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-br from-brand-gold/15 via-brand-teal/5 to-brand-night/50 backdrop-blur-2xl border border-brand-gold/20 flex items-center justify-center shadow-2xl shadow-brand-gold/20">
            <svg viewBox="0 0 200 60" className="w-36 sm:w-40">
              <defs>
                <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0d78c"/><stop offset="50%" stopColor="#d4a853"/><stop offset="100%" stopColor="#b8892f"/>
                </linearGradient>
                <linearGradient id="st" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#0d9488"/>
                </linearGradient>
              </defs>
              <g transform="translate(0, 8)">
                <path d="M23 40 C23 30, 21 20, 27 10" stroke="url(#sg)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path className="splash-sway-r" d="M27 10 C35 5, 43 9, 47 5" stroke="url(#st)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path className="splash-sway-l" d="M27 10 C21 3, 15 7, 11 3" stroke="url(#st)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C31 1, 37 -1, 39 -3" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C23 1, 17 -1, 15 -3" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C29 15, 35 17, 33 21" stroke="url(#st)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </g>
              <text x="55" y="30" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="white">Piscina</text>
              <text x="55" y="48" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="url(#sg)">OASIS</text>
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-wide">
            <span className="inline-block" style={{ animation: 'splash-title-up 0.6s ease-out forwards', animationDelay: '0.15s' }}>Piscina</span>{' '}
            <span className="inline-block text-brand-gold" style={{ animation: 'splash-title-up 0.6s ease-out forwards', animationDelay: '0.35s' }}>Oasis</span>
          </h1>
          <p className="text-brand-gold-light/60 text-sm sm:text-base font-light uppercase mt-1" style={{ animation: 'splash-tracking 0.8s ease-out forwards', animationDelay: '0.55s' }}>
            Villa Alegre
          </p>
        </div>

        <div className="w-52 sm:w-60">
          <div className="h-[3px] rounded-full bg-white/5 overflow-hidden shadow-[0_0_12px_rgba(212,168,83,0.15)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-gold via-brand-teal to-brand-gold bg-[length:200%_100%] animate-gradient"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className={`text-white/35 text-xs sm:text-sm font-light tracking-wide transition-all duration-400 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          {QUOTES[quoteIndex]}
        </p>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-white/10 text-[10px] font-mono tracking-[0.3em] uppercase">Sistema de Reservas</p>
      </div>
    </div>
  )
}
