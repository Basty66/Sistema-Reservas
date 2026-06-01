import { useState, useEffect, useRef } from 'react'
import { GALLERY_IMAGES } from '../config'
import Reveal from './Reveal'

const STATS = [
  { label: 'Espacios', value: 6 },
  { label: 'Capacidad Máx', value: '150', suffix: 'pers' },
  { label: 'Año Fundación', value: 2024 },
]

function AnimatedCounter({ target, suffix, active }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = typeof target === 'number' ? target : parseInt(target)
    const start = performance.now()
    const dur = 2000
    const frame = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 1.5)
      setCount(Math.floor(t * ease))
      if (p < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [active, target])
  return <>{count}{suffix ? <span className="text-base ml-0.5 text-brand-gold/70">{suffix}</span> : ''}</>
}

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [statsActive, setStatsActive] = useState(false)
  const statsRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  const navigate = (dir) => {
    setLightboxIndex(prev => ((prev + dir + GALLERY_IMAGES.length) % GALLERY_IMAGES.length))
  }

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsActive(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="galeria" className="relative py-28 lg:py-36 overflow-hidden bg-brand-night">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-void via-brand-night to-brand-void" />
      <div className="absolute top-[-10%] left-[-5%] w-[50rem] h-[50rem] rounded-full bg-brand-gold/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50rem] h-[50rem] rounded-full bg-brand-teal/[0.02] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <Reveal animation="fade-up">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-brand-gold/40" />
              <span className="text-brand-gold uppercase tracking-[0.3em] text-xs font-black">Instalaciones</span>
              <span className="w-8 h-px bg-brand-gold/40" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-5 leading-[1.05] tracking-tight">
              Explora Nuestro{' '}
              <span className="bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold bg-clip-text text-transparent">Espacio</span>
            </h2>
            <p className="text-white/30 max-w-xl mx-auto text-base md:text-lg font-light leading-relaxed">
              Seis espacios diseñados para que tu evento sea inolvidable.
            </p>
          </div>
        </Reveal>

        <div ref={statsRef} className="flex flex-wrap justify-center gap-8 md:gap-16 py-6 mb-14 lg:mb-16 border-y border-white/5">
          {STATS.map((s, i) => (
            <Reveal key={i} animation="fade-up" delay={i * 120}>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-heading text-brand-gold tabular-nums">
                  <AnimatedCounter target={s.value} suffix={s.suffix} active={statsActive} />
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold mt-1">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {GALLERY_IMAGES.map((img, i) => {
            const isHero = i === 0
            const isWide = i === 4
            const sp = isHero ? 'md:col-span-3' : isWide ? 'md:col-span-2' : ''
            const h = isHero ? 'h-[340px] md:h-[480px] lg:h-[560px]' : 'h-[300px] md:h-[340px]'

            return (
              <Reveal key={i} animation="fade-up" delay={i * 100} className={sp}>
                <div
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl bg-brand-void shadow-lg hover:shadow-2xl transition-all duration-500 ${h}`}
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-brand-night/5 via-50% to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-px bg-brand-gold/60" />
                      <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold/80 font-bold">
                        Espacio {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-white drop-shadow-lg">{img.label}</h3>
                    <div className="overflow-hidden max-h-0 group-hover:max-h-16 transition-all duration-[400ms] ease-out">
                      <p className="text-white/50 text-sm font-light leading-relaxed mt-1.5 line-clamp-2">{img.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>

      {lightboxIndex !== null && (() => {
        const img = GALLERY_IMAGES[lightboxIndex]
        return (
          <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-lg select-none animate-[fadeIn_0.25s_ease-out_both]" onClick={() => setLightboxIndex(null)}>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                <span className="text-white/50 text-xs font-mono tracking-wider">
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
                </span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border border-white/5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={(e) => { e.stopPropagation(); navigate(-1) }}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/8 hover:bg-white/18 text-white/40 hover:text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/8 cursor-pointer z-10">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>

              <div key={lightboxIndex} className="w-full h-full flex items-center justify-center p-4 sm:p-16" onClick={(e) => e.stopPropagation()}>
                <img src={img.src} alt={img.label} className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl animate-[lb-enter_0.3s_ease-out_both]" style={{ maxHeight: 'calc(100vh - 140px)' }} />
              </div>

              <button onClick={(e) => { e.stopPropagation(); navigate(1) }}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/8 hover:bg-white/18 text-white/40 hover:text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/8 cursor-pointer z-10">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-16 pb-5 sm:pb-7 px-4 sm:px-8">
              <div className="max-w-3xl mx-auto text-center" onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="w-5 h-px bg-brand-gold/50" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold/70 font-bold">{img.label}</span>
                  <span className="w-5 h-px bg-brand-gold/50" />
                </div>
                <p className="text-white/35 text-sm sm:text-base font-light leading-relaxed max-w-lg mx-auto">{img.desc}</p>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
