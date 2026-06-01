import { useState, useEffect, useRef } from 'react'
import { GALLERY_IMAGES } from '../config'

const STATS = [
  { label: 'Espacios', value: 6 },
  { label: 'Capacidad Máx', value: '150', suffix: 'pers' },
  { label: 'Año Fundación', value: 2024 },
]

function useCountUp(target) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return
      done.current = true
      const t = typeof target === 'number' ? target : parseInt(target)
      const dur = 2000
      const start = performance.now()
      const frame = (now) => {
        const p = Math.min((now - start) / dur, 1)
        setCount(Math.floor(p * t))
        if (p < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])
  return [count, ref]
}

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const cardRefs = useRef({})
  const revealRefs = useRef([])
  const [revealed, setRevealed] = useState({})

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

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setRevealed(prev => ({ ...prev, [entry.target.dataset.index]: true }))
        }
      })
    }, { threshold: 0.15 })
    const els = revealRefs.current.filter(Boolean)
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const navigate = (dir) => {
    setLightboxIndex(prev => ((prev + dir + GALLERY_IMAGES.length) % GALLERY_IMAGES.length))
  }

  const handleMouseMove = (e, i) => {
    const el = cardRefs.current[i]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--rx', `${-(y - 0.5) * 14}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`)
  }

  const handleMouseLeave = (i) => {
    const el = cardRefs.current[i]
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const [espacios] = useCountUp(6)
  const [capacidad] = useCountUp(150)
  const [fundacion] = useCountUp(2024)
  const statCounts = [espacios, capacidad, fundacion]

  return (
    <section id="galeria" className="relative py-28 lg:py-36 overflow-hidden bg-brand-night">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-void via-brand-night to-brand-void" />
      <div className="absolute top-[-10%] left-[-5%] w-[50rem] h-[50rem] rounded-full bg-brand-gold/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50rem] h-[50rem] rounded-full bg-brand-teal/[0.02] blur-[150px] pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-white/3 animate-float" style={{
            left: `${(i * 9.7 + 3.1) % 100}%`,
            top: `${(i * 14.3 + 6.7) % 100}%`,
            animationDelay: `${i * 2.1}s`,
            animationDuration: `${14 + (i % 4) * 4}s`,
          }} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div ref={el => revealRefs.current[0] = el} data-index={0}>
          <div className={`text-center mb-6 transition-all duration-700 ease-out ${revealed[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 py-6 mb-14 lg:mb-16 border-y border-white/5">
          {STATS.map((s, i) => (
            <div key={i} className="text-center" ref={el => { if (i === 0) { /* refs set via array */ } }}>
              <p className="text-2xl md:text-3xl font-bold font-heading text-brand-gold tabular-nums">
                {statCounts[i]}{s.suffix ? <span className="text-base ml-0.5 text-brand-gold/70">{s.suffix}</span> : ''}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {GALLERY_IMAGES.map((img, i) => {
            const isHero = i === 0
            const isRight = i === 1 || i === 2
            const heights = isHero ? 'h-[320px] lg:h-[520px]' : isRight ? 'h-[280px] lg:h-[254px]' : 'h-[280px] lg:h-[280px]'
            const span = isHero ? 'lg:col-span-2 lg:row-span-2' : ''

            return (
              <div
                key={i}
                ref={el => revealRefs.current[i + 1] = el}
                data-index={i + 1}
                className={`${span} transition-all duration-[1.1s] cubic-bezier(0.16,1,0.3,1) will-change-transform ${
                  revealed[i + 1] ? 'opacity-100' : 'opacity-0 [clip-path:polygon(50%_50%,50%_50%,50%_50%,50%_50%)]'
                }`}
                style={{
                  clipPath: revealed[i + 1] ? undefined : undefined,
                }}
              >
                <div className="[perspective:1000px]">
                  <div
                    ref={el => cardRefs.current[i] = el}
                    className={`group relative overflow-hidden cursor-pointer rounded-3xl md:rounded-[2.5rem] bg-brand-void transition-transform duration-[400ms] ease-out will-change-transform shadow-xl ${heights}`}
                    style={{ transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }}
                    onMouseMove={(e) => handleMouseMove(e, i)}
                    onMouseLeave={() => handleMouseLeave(i)}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      loading="lazy"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                      className="w-full h-full object-cover transition-all duration-[800ms] ease-out group-hover:scale-[1.12]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-night/90 via-brand-night/10 via-40% to-transparent opacity-80 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/0 via-transparent to-brand-teal/0 group-hover:from-brand-gold/[0.04] group-hover:to-brand-teal/[0.04] transition-all duration-700" />

                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out" />
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 translate-y-4 md:translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-px bg-brand-gold/60" />
                        <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold/80 font-bold">
                          Espacio {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-2 drop-shadow-lg">{img.label}</h3>
                      <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 ease-out">
                        <p className="text-white/50 text-sm md:text-base font-light leading-relaxed line-clamp-2">{img.desc}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                        <span>Ver galería</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                      </div>
                    </div>

                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-12 h-12 rounded-full glass-dark backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {lightboxIndex !== null && (() => {
        const img = GALLERY_IMAGES[lightboxIndex]
        return (
          <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl select-none animate-[fadeIn_0.3s_ease-out_both]" onClick={() => setLightboxIndex(null)}>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                <span className="text-white/60 text-xs font-mono tracking-wider">
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-white/20 font-semibold">ESC</span>
                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border border-white/5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={(e) => { e.stopPropagation(); navigate(-1) }}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/10 cursor-pointer z-10">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>

              <div key={lightboxIndex} className="w-full h-full flex items-center justify-center p-4 sm:p-12 md:p-20 animate-[lb-enter_0.35s_ease-out_both]" onClick={(e) => e.stopPropagation()}>
                <img src={img.src} alt={img.label} className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl" style={{ maxHeight: 'calc(100vh - 160px)' }} />
              </div>

              <button onClick={(e) => { e.stopPropagation(); navigate(1) }}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-white/10 cursor-pointer z-10">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-6 sm:pb-8 px-4 sm:px-8">
              <div className="max-w-3xl mx-auto text-center" onClick={(e) => e.stopPropagation()}>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-6 h-px bg-brand-gold/50" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold/70 font-bold">{img.label}</span>
                  <span className="w-6 h-px bg-brand-gold/50" />
                </div>
                <p className="text-white/40 text-sm sm:text-base font-light leading-relaxed max-w-lg mx-auto">{img.desc}</p>
                <div className="flex items-center justify-center gap-6 mt-4 text-white/15 text-[10px] uppercase tracking-[0.2em] font-semibold">
                  <span className="flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg> Anterior</span>
                  <span className="flex items-center gap-1.5">Siguiente <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg></span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
