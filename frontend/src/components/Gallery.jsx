import { useState, useCallback, useEffect, useRef } from 'react'
import { GALLERY_IMAGES } from '../config'
import Reveal from './Reveal'

const STATUS_BAR = [
  { label: 'Espacios', value: '4' },
  { label: 'Capacidad Máx', value: '150 pers' },
  { label: 'Año Fundación', value: '2024' },
]

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1)
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  const handleError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }

  return (
    <section id="galeria" className="relative py-32 overflow-hidden bg-brand-night" ref={containerRef}>
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
              Cuatro ambientes diseñados para que tu evento sea inolvidable.
            </p>
          </div>
        </Reveal>

        <Reveal animation="fade-up" delay={150} className="mb-16">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 py-6 border-y border-white/5">
            {STATUS_BAR.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold font-heading text-brand-gold">{s.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {GALLERY_IMAGES.map((img, i) => {
            const isFirst = i === 0
            return (
              <Reveal
                key={i}
                animation="fade-up"
                delay={i * 120}
                className={img.span || (isFirst ? 'md:col-span-2 md:row-span-2' : '')}
              >
                <div
                  className={`group relative overflow-hidden cursor-pointer rounded-3xl md:rounded-[2.5rem] shadow-2xl bg-brand-void ${isFirst ? 'h-[300px] md:h-[500px]' : 'h-[300px] md:h-[380px]'}`}
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    loading="lazy"
                    onError={handleError}
                    className="w-full h-full object-cover transition-all duration-[800ms] ease-out group-hover:scale-[1.08] group-hover:brightness-[1.05]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-brand-night/90 via-brand-night/10 to-transparent opacity-80 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/0 via-brand-gold/0 to-brand-gold/0 group-hover:from-brand-gold/[0.03] group-hover:via-transparent group-hover:to-brand-teal/[0.03] transition-all duration-700" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 translate-y-4 md:translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-px bg-brand-gold/60" />
                      <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold/80 font-bold">
                        Espacio {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-2 drop-shadow-lg">
                      {img.label}
                    </h3>
                    <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 ease-out">
                      <p className="text-white/50 text-sm md:text-base font-light leading-relaxed line-clamp-2">
                        {img.desc}
                      </p>
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
              </Reveal>
            )
          })}
        </div>
      </div>

      {lightboxIndex !== null && (() => {
        const img = GALLERY_IMAGES[lightboxIndex]
        return (
          <div
            className="fixed inset-0 z-[999] bg-black select-none"
            onClick={() => setLightboxIndex(null)}
          >
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                <span className="text-white/60 text-xs font-mono tracking-wider">
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-white/20 font-semibold">Presiona ESC</span>
                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm border border-white/5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1) }}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 hover:bg-white/15 text-white/40 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>

              <div className="w-full h-full flex items-center justify-center p-4 sm:p-12 md:p-20" onClick={(e) => e.stopPropagation()}>
                <img
                  src={img.src}
                  alt={img.label}
                  className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl animate-modal-content"
                  style={{ maxHeight: 'calc(100vh - 160px)' }}
                />
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1) }}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 hover:bg-white/15 text-white/40 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
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