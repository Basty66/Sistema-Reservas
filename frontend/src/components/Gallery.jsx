import { useState, useEffect } from 'react'
import { GALLERY_IMAGES } from '../config'
import Reveal from './Reveal'

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => ((prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length))
      if (e.key === 'ArrowRight') setLightboxIndex(prev => ((prev + 1) % GALLERY_IMAGES.length))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  const navigate = (dir) => {
    setLightboxIndex(prev => ((prev + dir + GALLERY_IMAGES.length) % GALLERY_IMAGES.length))
  }

  return (
    <section id="galeria" className="relative py-28 lg:py-36 overflow-hidden bg-brand-night">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-void via-brand-night to-brand-void" />
      <div className="absolute top-[-10%] left-[-5%] w-[50rem] h-[50rem] rounded-full bg-brand-gold/[0.02] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50rem] h-[50rem] rounded-full bg-brand-teal/[0.02] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <Reveal animation="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-brand-gold/40" />
              <span className="text-brand-gold uppercase tracking-[0.3em] text-xs font-black">Instalaciones</span>
              <span className="w-8 h-px bg-brand-gold/40" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.05] tracking-tight">
              Explora Nuestro{' '}
              <span className="bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold bg-clip-text text-transparent">Espacio</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {GALLERY_IMAGES.map((img, i) => {
            const isHero = i === 0
            const isWide = i === 5
            const sp = isHero ? 'md:col-span-2' : isWide ? 'md:col-span-2' : ''
            return (
              <Reveal key={i} animation="fade-up" delay={i * 100} className={sp}>
                <div className="group">
                  <div
                    className="relative overflow-hidden cursor-pointer rounded-xl bg-brand-void ring-1 ring-white/[0.04] hover:ring-brand-gold/20 transition-all duration-500 aspect-[4/3]"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      loading="lazy"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-[800ms] ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="mt-4 md:mt-5">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-brand-gold/50 font-medium">
                      Espacio {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg md:text-xl font-serif font-bold text-white mt-1">{img.label}</h3>
                    <div className="overflow-hidden max-h-0 group-hover:max-h-[60px] transition-all duration-[400ms] ease-out">
                      <p className="text-white/30 text-sm md:text-base font-light leading-relaxed mt-1.5">{img.desc}</p>
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
          <div className="fixed inset-0 z-[999] bg-black select-none" onClick={() => setLightboxIndex(null)}>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5 sm:p-7">
              <span className="text-white/25 text-xs font-mono tracking-wider">
                {String(lightboxIndex + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
              </span>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={(e) => { e.stopPropagation(); navigate(-1) }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer z-10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>

              <div key={lightboxIndex} className="w-full h-full flex items-center justify-center p-6 sm:p-16" onClick={(e) => e.stopPropagation()}>
                <img src={img.src} alt={img.label} className="max-w-full max-h-full w-auto h-auto object-contain animate-[lb-enter_0.3s_ease-out_both]" style={{ maxHeight: 'calc(100vh - 100px)' }} />
              </div>

              <button onClick={(e) => { e.stopPropagation(); navigate(1) }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer z-10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-7 text-center pointer-events-none">
              <p className="text-xs uppercase tracking-[0.25em] text-white/30 font-medium">{img.label}</p>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
