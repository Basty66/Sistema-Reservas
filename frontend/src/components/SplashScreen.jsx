import { useEffect, useState } from 'react'

const QUOTES = [
  'Donde el sol brilla más fuerte…',
  'Preparando tu oasis perfecto…',
  'Cargando la frescura del agua…',
  'Disponiendo las mejores terrazas…',
  'Afinando cada detalle para ti…',
  'Bienvenido a tu paraíso…',
]

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: 1.5 + (i % 5) * 1.2,
  left: ((i * 3.7 + 1.3) % 100),
  delay: (i * 0.43) % 10,
  duration: 8 + (i % 4) * 2,
  opacity: 0.06 + (i % 6) * 0.04,
}))

const STAGGER_FAST = 0.35; const STAGGER_MED = 0.55; const STAGGER_SLOW = 0.75

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteFade, setQuoteFade] = useState(true)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const qi = setInterval(() => {
      setQuoteFade(false)
      setTimeout(() => { setQuoteIndex(p => (p + 1) % QUOTES.length); setQuoteFade(true) }, 350)
    }, 2200)
    return () => clearInterval(qi)
  }, [])

  useEffect(() => {
    const STEP_MS = 30
    const FILL_MS = 2600
    const step = 100 / (FILL_MS / STEP_MS)
    let cur = 0
    const t = setInterval(() => {
      cur += step
      if (cur >= 100) {
        cur = 100; clearInterval(t)
        setTimeout(() => { setExiting(true); setTimeout(onFinish, 650) }, 500)
      }
      setProgress(Math.min(cur, 100))
    }, STEP_MS)
    return () => clearInterval(t)
  }, [onFinish])

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-in-out ${
      exiting ? 'opacity-0 scale-110 blur-xl pointer-events-none' : 'opacity-100 scale-100 blur-0'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-night via-[#0a1628] to-brand-void" />

      <div className={`absolute inset-0 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] rounded-full bg-brand-gold/3 blur-[150px] animate-orb" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] rounded-full bg-brand-teal/3 blur-[150px] animate-orb-delayed" />
        <div className="absolute top-[40%] left-[55%] w-[55%] h-[55%] rounded-full bg-brand-rose/2 blur-[120px] animate-orb" style={{ animationDelay: '3s' }} />
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

      <div className={`relative z-10 flex flex-col items-center gap-6 transition-all duration-800 ease-out ${
        visible && !exiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        {/* ── Logo ── */}
        <div className="relative animate-[splash-bounce-in_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-brand-gold/8 animate-[splash-ripple_2.5s_ease-out_infinite]" />
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-brand-teal/8 animate-[splash-ripple_2.5s_ease-out_infinite]" style={{ animationDelay: '1.25s' }} />
          </div>
          <div className="absolute inset-0 bg-brand-gold/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-br from-brand-gold/15 via-brand-teal/5 to-brand-night/50 backdrop-blur-2xl border border-brand-gold/20 flex items-center justify-center shadow-2xl shadow-brand-gold/20">
            <svg viewBox="0 0 100 60" className="w-[7.5rem] sm:w-[8.5rem]">
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
                <path className="splash-sway-r" d="M27 10 C35 5, 44 10, 49 6" stroke="url(#st)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path className="splash-sway-l" d="M27 10 C19 5, 10 10, 5 6" stroke="url(#st)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C32 2, 38 -1, 40 -4" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C22 2, 16 -1, 14 -4" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C30 16, 36 19, 33 23" stroke="url(#st)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M27 10 C24 16, 18 19, 21 23" stroke="url(#st)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
        </div>

        {/* ── Title ── */}
        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-wide">
            <span className="inline-block animate-[splash-slide-left_0.5s_ease-out_0.25s_both]">Piscina</span>{' '}
            <span className="inline-block text-brand-gold animate-[splash-slide-right_0.5s_ease-out_0.4s_both]">Oasis</span>
          </h1>
          <div className="flex justify-center mt-3 mb-2">
            <div className="h-[1.5px] w-32 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent animate-[splash-grow-center_0.5s_ease-out_0.55s_both] origin-center" />
          </div>
          <p className="text-brand-gold-light/60 text-sm sm:text-base font-light uppercase tracking-[0.25em] animate-[splash-title-up_0.5s_ease-out_0.65s_both]">
            Villa Alegre
          </p>
        </div>

        {/* ── Progress ── */}
        <div className="animate-[splash-title-up_0.5s_ease-out_0.9s_both]">
          <div className="w-52 sm:w-60">
            <div className="h-[3px] rounded-full bg-white/5 overflow-hidden shadow-[0_0_14px_rgba(212,168,83,0.15)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-gold via-brand-teal to-brand-gold bg-[length:200%_100%] animate-gradient"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className={`text-white/25 text-xs font-light tracking-wide text-center mt-4 transition-all duration-400 ${quoteFade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {QUOTES[quoteIndex]}
          </p>
        </div>
      </div>

      <div className={`absolute bottom-8 text-center transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-white/10 text-[10px] font-mono tracking-[0.3em] uppercase">Sistema de Reservas</p>
      </div>
    </div>
  )
}
