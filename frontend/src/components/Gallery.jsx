import { useState, useEffect, useCallback } from 'react'
import { GALLERY_IMAGES } from '../config'
import Reveal from './Reveal'

export default function Gallery() {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)

  const goTo = useCallback((i) => {
    setActive(i)
  }, [])

  const next = useCallback(() => goTo((active + 1) % GALLERY_IMAGES.length), [active, goTo])
  const prev = useCallback(() => goTo((active - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length), [active, goTo])

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [prev, next])

  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  useEffect(() => {
    if (!lightbox) return
    const h = (e) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') setLbIndex(i => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)
      if (e.key === 'ArrowRight') setLbIndex(i => (i + 1) % GALLERY_IMAGES.length)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [lightbox])

  const img = GALLERY_IMAGES[active]

  return (
    <section id="galeria" className="relative py-28 lg:py-36 bg-brand-void overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a14] via-brand-void to-[#060a14]" />
      <div className="absolute left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-brand-gold/[0.015] blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <Reveal animation="fade-up">
          <div className="mb-12">
            <span className="text-brand-gold/40 text-[10px] uppercase tracking-[0.3em] font-black">Instalaciones</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-[1.05] mt-1.5">Galería</h2>
          </div>
        </Reveal>

        <Reveal animation="fade-up" delay={80}>
          <div className="relative group/hero">
            <div
              className="relative aspect-[16/9] md:aspect-[21/9] max-h-[65vh] rounded-2xl overflow-hidden bg-brand-dark cursor-pointer shadow-2xl"
              onClick={() => { setLbIndex(active); setLightbox(true) }}
            >
              <img
                key={active}
                src={img.src}
                alt={img.label}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover/hero:scale-[1.03] animate-[gallery-in_0.45s_cubic-bezier(0.16,1,0.3,1)_both]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="text-brand-gold text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium">
                  Espacio {String(active + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
                </span>
                <h3 className="text-white text-xl md:text-3xl lg:text-4xl font-serif font-bold mt-1 leading-tight">{img.label}</h3>
                <p className="text-white/50 text-sm md:text-base mt-1.5 max-w-2xl leading-relaxed line-clamp-2">{img.desc}</p>
              </div>

              <button onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.07] hover:bg-white/[0.15] text-white/40 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm opacity-0 md:opacity-0 md:group-hover/hero:opacity-100 cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/[0.07] hover:bg-white/[0.15] text-white/40 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm opacity-0 md:opacity-0 md:group-hover/hero:opacity-100 cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
              <div className="flex items-center gap-1.5 md:gap-2 bg-brand-void/90 backdrop-blur-md rounded-full px-3 md:px-4 py-2 border border-white/[0.06] shadow-lg overflow-x-auto">
                {GALLERY_IMAGES.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`w-14 h-10 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-400 cursor-pointer flex-shrink-0 ${
                      i === active
                        ? 'ring-[1.5px] ring-brand-gold scale-105 shadow-[0_0_15px_rgba(212,168,83,0.2)]'
                        : 'opacity-40 hover:opacity-70 ring-1 ring-white/[0.06]'
                    }`}
                  >
                    <img src={thumb.src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {lightbox && (() => {
        const li = GALLERY_IMAGES[lbIndex]
        return (
          <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-sm select-none" onClick={() => setLightbox(false)}>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5 md:p-8">
              <span className="text-white/20 text-xs font-mono tracking-wider">
                {String(lbIndex + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
              </span>
              <button onClick={(e) => { e.stopPropagation(); setLightbox(false) }}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center px-6 md:px-20">
              <button onClick={(e) => { e.stopPropagation(); setLbIndex(i => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length) }}
                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>

              <div key={lbIndex} className="flex flex-col items-center gap-5 md:gap-6" onClick={(e) => e.stopPropagation()}>
                <img src={li.src} alt={li.label}
                  className="max-w-full max-h-[65vh] w-auto h-auto object-contain rounded-xl animate-[lb-enter_0.35s_cubic-bezier(0.16,1,0.3,1)_both]" />
                <div className="text-center max-w-xl">
                  <h3 className="text-white/80 font-serif text-xl md:text-2xl font-bold">{li.label}</h3>
                  <p className="text-white/30 text-sm md:text-base mt-1 leading-relaxed">{li.desc}</p>
                </div>
              </div>

              <button onClick={(e) => { e.stopPropagation(); setLbIndex(i => (i + 1) % GALLERY_IMAGES.length) }}
                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
