import { useState, useEffect, useCallback } from 'react'
import { SITE_TAGLINE, SITE_DESC } from '../config'

const BG_IMAGES = [
  { src: '/hero_oasis_1777577991129.png', fallback: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { src: '/gal_piscina_1777578003893.png', fallback: 'https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { src: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', fallback: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', fallback: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
]

export default function Hero({ onVerPlanes, onVerGaleria }) {
  const [currentImg, setCurrentImg] = useState(0)
  const [nextImg, setNextImg] = useState(1)
  const [transitioning, setTransitioning] = useState(false)

  const advanceSlide = useCallback(() => {
    setTransitioning(true)
    setTimeout(() => {
      setCurrentImg(prev => (prev + 1) % BG_IMAGES.length)
      setNextImg(prev => (prev + 1) % BG_IMAGES.length)
      setTransitioning(false)
    }, 1000)
  }, [])

  useEffect(() => {
    const timer = setInterval(advanceSlide, 5000)
    return () => clearInterval(timer)
  }, [advanceSlide])

  const handleError = (e, fallback) => {
    e.target.src = fallback
  }

  return (
    <header className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Carousel backgrounds */}
      <div className="absolute inset-0 z-0">
        {BG_IMAGES.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
              i === currentImg ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onError={(e) => handleError(e, img.fallback)}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-night/70 via-brand-night/20 to-brand-night/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-brand-teal/5" />
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-brand-gold/5 blur-3xl animate-orb" />
        <div className="absolute bottom-1/4 right-[15%] w-80 h-80 rounded-full bg-brand-teal/5 blur-3xl animate-orb-delayed" />
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-32 z-10 flex gap-2">
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentImg(i); setNextImg((i + 1) % BG_IMAGES.length) }}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
              i === currentImg ? 'w-8 bg-brand-gold' : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 mt-16">
        <div className="glass-light p-6 sm:p-10 md:p-14 rounded-[2rem] sm:rounded-[2.5rem] text-center animate-fadeIn shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl" />

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 text-brand-gold text-xs font-bold px-4 sm:px-5 py-2 rounded-full uppercase tracking-widest mb-4 sm:mb-6 border border-brand-gold/20">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            Abierto para reservas
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-black text-brand-night mb-4 sm:mb-6 leading-[1.05] sm:leading-[0.95] tracking-tight">
            <span className="block animate-slideUp stagger-1">{SITE_TAGLINE.split(',')[0]},</span>
            <span className="block animate-slideUp stagger-2 text-brand-gold">{SITE_TAGLINE.split(',')[1]?.trim()}</span>
          </h1>

          <p className="text-brand-slate/80 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-10 max-w-2xl mx-auto font-medium leading-relaxed animate-slideUp stagger-3 px-2">
            {SITE_DESC}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slideUp stagger-4 px-4 sm:px-0">
            <button onClick={onVerPlanes} className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 shadow-2xl hover:shadow-brand-gold/30 w-full sm:w-auto">
              Ver Planes
            </button>
            <button onClick={onVerGaleria} className="btn-secondary text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 w-full sm:w-auto">
              Ver Galería
            </button>
          </div>

          <div className="mt-8 sm:mt-12 flex justify-center gap-6 sm:gap-12 text-brand-slate/60 animate-fadeIn stagger-5 flex-wrap">
            {[
              { value: '50+', label: 'Eventos' },
              { value: '100%', label: 'Satisfacción' },
              { value: '5', label: 'Años' },
            ].map((stat, i) => (
              <div key={i} className="text-center min-w-[80px]">
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-brand-dark">{stat.value}</p>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1 text-brand-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </header>
  )
}
