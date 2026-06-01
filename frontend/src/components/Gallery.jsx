import { useState, useCallback } from 'react'
import { GALLERY_IMAGES } from '../config'
import Reveal from './Reveal'

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const handleError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }

  const prev = useCallback(() => {
    setLightboxIndex(prev => (prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1))
  }, [])

  const next = useCallback(() => {
    setLightboxIndex(prev => (prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1))
  }, [])

  return (
    <section id="galeria" className="relative py-28 px-8 max-w-7xl mx-auto overflow-hidden">
      <Reveal animation="fade-up">
        <div className="text-center mb-16">
          <span className="text-brand-gold uppercase tracking-[0.25em] text-sm font-black mb-4 block">Descubre</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-dark mb-6 leading-tight">
            Nuestras <span className="text-brand-gold">Instalaciones</span>
          </h2>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Todo lo que necesitas para el día perfecto: agua cristalina, áreas verdes, zonas de juego y espacios de relajación.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[250px]">
        {GALLERY_IMAGES.map((img, i) => (
          <Reveal key={i} animation="fade-up" delay={i * 100} className={img.span}>
            <div
              className={`group relative rounded-[2rem] overflow-hidden shadow-xl cursor-pointer hover-lift card-shine h-full`}
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={img.src}
                alt={img.label}
                loading="lazy"
                onError={handleError}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-night/90 via-brand-night/10 to-transparent opacity-90 transition-opacity duration-500" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                <div className="w-16 h-16 rounded-full glass-dark flex items-center justify-center backdrop-blur-xl border border-white/10">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-2xl font-serif font-bold text-white drop-shadow-lg transform transition-all duration-500 group-hover:translate-y-[-4px]">{img.label}</h3>
                <div className="h-0.5 w-0 bg-brand-gold rounded-full transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {lightboxIndex !== null && (() => {
        const img = GALLERY_IMAGES[lightboxIndex]
        return (
          <div
            className="fixed inset-0 z-[999] bg-brand-night/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-modal-overlay"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 glass-dark text-white rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-xl shadow-2xl z-10 border border-white/10"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 glass-dark text-white/70 rounded-full flex items-center justify-center hover:bg-white/20 hover:text-white transition cursor-pointer text-lg shadow-2xl z-10 border border-white/5"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 glass-dark text-white/70 rounded-full flex items-center justify-center hover:bg-white/20 hover:text-white transition cursor-pointer text-lg shadow-2xl z-10 border border-white/5"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="flex flex-col items-center gap-4 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={img.src}
                alt={img.label}
                className="max-w-full max-h-[60vh] rounded-2xl sm:rounded-3xl shadow-2xl object-contain animate-modal-content"
              />
              <div className="w-full max-w-lg text-center animate-modal-content-right">
                <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.15em] mb-1">
                  {lightboxIndex + 1} / {GALLERY_IMAGES.length}
                </p>
                <h3 className="text-white text-xl sm:text-2xl font-serif font-bold mb-2">{img.label}</h3>
                <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed">{img.desc}</p>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
