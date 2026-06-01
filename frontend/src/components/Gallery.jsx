import { useState, useEffect } from 'react'
import { GALLERY_IMAGES } from '../config'
import Reveal from './Reveal'

const ASPECTS = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-[16/9]', 'aspect-[1/1]', 'aspect-[4/3]']

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
      if (e.key === 'ArrowLeft') setLightboxIndex(p => ((p - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length))
      if (e.key === 'ArrowRight') setLightboxIndex(p => ((p + 1) % GALLERY_IMAGES.length))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex])

  const open = (i) => setLightboxIndex(i)
  const close = () => setLightboxIndex(null)

  return (
    <section id="galeria" className="relative py-28 lg:py-36 bg-brand-void overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a14] via-brand-void to-[#060a14]" />
      <div className="absolute left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-brand-gold/[0.015] blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <Reveal animation="fade-up">
          <div className="mb-14">
            <span className="text-brand-gold/40 text-[10px] uppercase tracking-[0.3em] font-black">Instalaciones</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.05] mt-1.5">
              Galería
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {GALLERY_IMAGES.map((img, i) => {
            const aspect = i === 0 ? 'aspect-[16/9] md:aspect-[21/9]' : ASPECTS[i - 1] || 'aspect-[4/3]'
            const span = i === 0 ? 'md:col-span-3' : ''

            return (
              <Reveal key={i} animation="fade-up" delay={i * 80} className={span}>
                <div className="group cursor-pointer" onClick={() => open(i)}>
                  <div className="bg-[#faf8f5] rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-500">
                    <div className={`${aspect} rounded-xl overflow-hidden bg-brand-void`}>
                      <img
                        src={img.src}
                        alt={img.label}
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
                        className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="pt-3.5 pb-1.5 px-1">
                      <span className="text-[8px] uppercase tracking-[0.2em] text-brand-gold font-medium block text-center leading-none">
                        Espacio {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-base md:text-lg font-serif font-bold text-brand-void text-center mt-1 leading-tight">
                        {img.label}
                      </h3>
                      <p className="text-brand-void/35 text-xs text-center mt-1.5 max-h-0 overflow-hidden transition-all duration-[400ms] group-hover:max-h-[60px] leading-relaxed">
                        {img.desc}
                      </p>
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
          <div className="fixed inset-0 z-[999] bg-black select-none" onClick={close}>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5 sm:p-7">
              <span className="text-white/20 text-xs font-mono tracking-wider">
                {String(lightboxIndex + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
              </span>
              <button onClick={(e) => { e.stopPropagation(); close() }}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(p => (p - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length) }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer z-10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg>
              </button>

              <div key={lightboxIndex} className="w-full h-full flex items-center justify-center p-6 sm:p-16" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-5 max-w-5xl">
                  <img src={img.src} alt={img.label}
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg animate-[lb-enter_0.3s_ease-out_both]" />
                  <div className="text-center max-w-lg">
                    <h3 className="text-white/70 font-serif text-lg font-bold">{img.label}</h3>
                    {img.desc && <p className="text-white/30 text-sm mt-1 leading-relaxed">{img.desc}</p>}
                  </div>
                </div>
              </div>

              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(p => (p + 1) % GALLERY_IMAGES.length) }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white flex items-center justify-center transition-all backdrop-blur-sm cursor-pointer z-10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
