import { useEffect, useState, useMemo } from 'react'

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

const C = 2 * Math.PI * 44

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteFade, setQuoteFade] = useState(true)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  const offset = useMemo(() => C - (C * progress / 100), [progress])
  const dotPos = useMemo(() => {
    const a = (progress / 100) * 2 * Math.PI
    return { x: 50 + 44 * Math.sin(a), y: 50 - 44 * Math.cos(a) }
  }, [progress])

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  useEffect(() => {
    const qi = setInterval(() => {
      setQuoteFade(false)
      setTimeout(() => { setQuoteIndex(p => (p + 1) % QUOTES.length); setQuoteFade(true) }, 350)
    }, 2200)
    return () => clearInterval(qi)
  }, [])

  useEffect(() => {
    const STEP_MS = 30; const FILL_MS = 2800; const step = 100 / (FILL_MS / STEP_MS)
    let cur = 0
    const t = setInterval(() => {
      cur += step
      if (cur >= 100) { cur = 100; clearInterval(t); setTimeout(() => { setExiting(true); setTimeout(onFinish, 650) }, 500) }
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
          <span key={p.id} className="absolute rounded-full bg-white" style={{
            width: p.size, height: p.size, left: `${p.left}%`, bottom: '-10px',
            opacity: p.opacity, animation: `splash-float-up ${p.duration}s linear ${p.delay}s infinite`,
          }} />
        ))}
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-6 transition-all duration-800 ease-out ${
        visible && !exiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        {/* ── Logo ── */}
        <div className="relative animate-[splash-bounce-in_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]">
          <div className="absolute inset-0 bg-brand-gold/15 blur-[60px] rounded-full animate-pulse" />

          <div className="relative w-32 h-32 sm:w-36 sm:h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(212,168,83,0.15)]">
              <defs>
                <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0d78c"/><stop offset="50%" stopColor="#d4a853"/><stop offset="100%" stopColor="#b8892f"/>
                </linearGradient>
                <linearGradient id="st" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#0d9488"/>
                </linearGradient>
                <filter id="rg" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="b"/>
                  <feComponentTransfer in="b" result="g">
                    <feFuncA type="linear" slope="0.6"/>
                  </feComponentTransfer>
                  <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* bg ring */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="1.2" opacity="0.12"
                className="animate-[splash-svg-fade_0.4s_ease-out_0.12s_both]" />

              {/* progress ring */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="url(#sg)" strokeWidth="2.8" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={offset}
                transform="rotate(-90 50 50)" filter="url(#rg)"
                className="animate-[splash-svg-fade_0.4s_ease-out_0.15s_both] transition-[stroke-dashoffset] duration-100 ease-linear" />

              {/* progress end dot */}
              <circle cx={dotPos.x} cy={dotPos.y} r="3.5" fill="url(#sg)" filter="url(#rg)"
                className="animate-[splash-svg-fade_0.4s_ease-out_0.15s_both]" />
              <circle cx={dotPos.x} cy={dotPos.y} r="1.5" fill="white" opacity="0.6"
                className="animate-[splash-svg-fade_0.4s_ease-out_0.15s_both]" />

              {/* inner ring */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="url(#st)" strokeWidth="0.5" opacity="0.12"
                className="animate-[splash-svg-fade_0.4s_ease-out_0.18s_both]" />

              {/* sun */}
              <circle cx="50" cy="38" r="14" fill="url(#sg)" opacity="0.07"
                className="animate-[splash-svg-scale_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.2s_both]" />
              <circle cx="50" cy="38" r="7" fill="url(#sg)" opacity="0.14"
                className="animate-[splash-svg-scale_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.25s_both]" />

              {/* trunk */}
              <path d="M50 72 Q48 52 50 28" stroke="url(#sg)" strokeWidth="2.8" fill="none" strokeLinecap="round"
                className="animate-[splash-svg-up_0.4s_ease-out_0.28s_both]" />

              {/* fronds - right */}
              <path d="M50 30 Q66 14 76 18" stroke="url(#st)" strokeWidth="2.2" fill="none" strokeLinecap="round"
                style={{ animation: 'splash-svg-up 0.4s ease-out 0.3s both' }} />
              <path d="M50 30 Q68 24 78 24" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"
                style={{ animation: 'splash-svg-up 0.4s ease-out 0.33s both' }} />
              <path d="M50 32 Q64 34 72 32" stroke="url(#st)" strokeWidth="1.6" fill="none" strokeLinecap="round"
                style={{ animation: 'splash-svg-up 0.4s ease-out 0.36s both' }} />

              {/* fronds - left */}
              <path d="M50 30 Q34 14 24 18" stroke="url(#st)" strokeWidth="2.2" fill="none" strokeLinecap="round"
                style={{ animation: 'splash-svg-up 0.4s ease-out 0.32s both' }} />
              <path d="M50 30 Q32 24 22 24" stroke="url(#sg)" strokeWidth="2" fill="none" strokeLinecap="round"
                style={{ animation: 'splash-svg-up 0.4s ease-out 0.35s both' }} />
              <path d="M50 32 Q36 34 28 32" stroke="url(#st)" strokeWidth="1.6" fill="none" strokeLinecap="round"
                style={{ animation: 'splash-svg-up 0.4s ease-out 0.38s both' }} />

              {/* coconuts */}
              <circle cx="47" cy="33" r="2.6" fill="url(#sg)"
                className="animate-[splash-svg-pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)_0.4s_both]" />
              <circle cx="53" cy="32" r="2.3" fill="url(#sg)"
                className="animate-[splash-svg-pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)_0.43s_both]" />

              {/* waves */}
              <path d="M26 74 Q38 70 50 74 Q62 78 74 74" stroke="url(#st)" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.5"
                className="animate-[splash-svg-fade_0.4s_ease-out_0.45s_both]" />
              <path d="M28 78 Q40 74 50 78 Q60 82 72 78" stroke="url(#st)" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.3"
                className="animate-[splash-svg-fade_0.4s_ease-out_0.48s_both]" />

              {/* sparkles */}
              <circle cx="16" cy="22" r="1.8" fill="url(#sg)" opacity="0.35"
                className="animate-[splash-svg-pop_0.3s_ease-out_0.5s_both]" />
              <circle cx="84" cy="28" r="1.4" fill="url(#sg)" opacity="0.25"
                className="animate-[splash-svg-pop_0.3s_ease-out_0.53s_both]" />
              <circle cx="70" cy="8" r="1" fill="url(#st)" opacity="0.25"
                className="animate-[splash-svg-pop_0.3s_ease-out_0.56s_both]" />
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

        {/* ── Quotes ── */}
        <div className="animate-[splash-title-up_0.5s_ease-out_0.9s_both]">
          <p className={`text-white/25 text-xs font-light tracking-wide text-center transition-all duration-400 ${quoteFade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
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
