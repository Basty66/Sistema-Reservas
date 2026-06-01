import { useState, useEffect, useCallback, useRef } from 'react'
import { SITE_TAGLINE, SITE_DESC } from '../config'
import Reveal from './Reveal'

const BG_IMAGES = [
  { src: '/hero_oasis_1777577991129.png', fallback: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { src: '/gal_piscina_1777578003893.png', fallback: 'https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { src: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', fallback: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
  { src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', fallback: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' },
]

const ICONS = {
  palm: (s) => <svg key="palm" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold drop-shadow-[0_0_6px_rgba(212,168,83,0.4)]"><path d="M12 2v12M12 14c-4-2-8-1-10 2M12 14c4-2 8-1 10 2M12 9c-2-2-2-5 0-7M12 9c2-2 2-5 0-7"/><path d="M12 14v6M8 22h8"/></svg>,
  pool: (s) => <svg key="pool" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-teal drop-shadow-[0_0_6px_rgba(20,168,150,0.4)]"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>,
  wave: (s) => <svg key="wave" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cyan-300/70 drop-shadow-[0_0_6px_rgba(103,232,249,0.3)]"><path d="M2 12c3-3 6 0 10 3s7-3 10 0"/><path d="M2 18c3-3 6 0 10 3s7-3 10 0"/></svg>,
  sun: (s) => <svg key="sun" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>,
  drink: (s) => <svg key="drink" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-brand-gold/80 drop-shadow-[0_0_6px_rgba(212,168,83,0.3)]"><path d="M6 2l8 10v8c0 1.1.9 2 2 2h2"/><path d="M18 22c1.1 0 2-.9 2-2v-8L12 2"/><path d="M6 12h12"/></svg>,
  flower: (s) => <svg key="flower" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-pink-300/80 drop-shadow-[0_0_6px_rgba(249,168,212,0.3)]"><circle cx="12" cy="12" r="3"/><path d="M12 2c0 0 2 4 0 10M12 22c0 0-2-4 0-10M2 12c0 0 4 2 10 0M22 12c0 0-4-2-10 0"/></svg>,
  bird: (s) => <svg key="bird" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-300/70 drop-shadow-[0_0_6px_rgba(110,231,183,0.3)]"><path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9"/><path d="M12 3c4 0 7 3 7 7"/><path d="M5 17c2-2 5-3 8-3s6 1 8 3"/><circle cx="9" cy="10" r="1" fill="currentColor"/></svg>,
}

const floatingIcons = [
  { id: 'palm', top: '8%', left: '5%', size: 28, delay: 0, duration: 5 },
  { id: 'pool', top: '15%', right: '8%', size: 24, delay: 0.5, duration: 6 },
  { id: 'wave', top: '68%', left: '10%', size: 22, delay: 1, duration: 4.5 },
  { id: 'sun', top: '4%', left: '44%', size: 34, delay: 0.8, duration: 7 },
  { id: 'drink', top: '75%', right: '12%', size: 24, delay: 1.5, duration: 5.5 },
  { id: 'flower', top: '38%', left: '2%', size: 20, delay: 2, duration: 4 },
  { id: 'bird', top: '24%', right: '2%', size: 22, delay: 0.3, duration: 6.5 },
]

export default function Hero({ onVerPlanes, onVerGaleria }) {
  const [currentImg, setCurrentImg] = useState(0)
  const iconRefs = useRef([])
  const heroRef = useRef(null)

  const advanceSlide = useCallback(() => {
    setCurrentImg(prev => (prev + 1) % BG_IMAGES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(advanceSlide, 5000)
    return () => clearInterval(timer)
  }, [advanceSlide])

  useEffect(() => {
    const innerEls = iconRefs.current
    let rafId
    const handleMouse = (e) => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const mx = e.clientX / window.innerWidth
        const my = e.clientY / window.innerHeight
        innerEls.forEach((el, i) => {
          if (!el) return
          const icon = floatingIcons[i]
          const nx = icon.left ? parseFloat(icon.left) / 100 : 1 - parseFloat(icon.right) / 100
          const ny = parseFloat(icon.top) / 100
          const strength = (icon.size / 30) * 100
          const dx = (mx - nx) * strength
          const dy = (my - ny) * strength
          el.style.transform = `translate(${dx}px, ${dy}px)`
        })
      })
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => { window.removeEventListener('mousemove', handleMouse); if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  const handleError = (e, fallback) => { e.target.src = fallback }

  return (
    <header ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-brand-night">
      <div className="absolute inset-0 z-0">
        {BG_IMAGES.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1500 ${
              i === currentImg ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onError={(e) => handleError(e, img.fallback)}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-night/60 via-brand-night/20 to-brand-night/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-brand-teal/5" />
      </div>

      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full bg-brand-gold/4 blur-[120px] animate-orb" />
        <div className="absolute bottom-1/4 right-[15%] w-80 h-80 rounded-full bg-brand-teal/4 blur-[120px] animate-orb-delayed" />
      </div>

      <div className="absolute inset-0 z-[2] pointer-events-none">
        {floatingIcons.map((item, i) => (
          <div
            key={i}
            className="absolute pointer-events-auto group cursor-default"
            style={{
              top: item.top, left: item.left, right: item.right,
              animation: `float-owl ${item.duration}s ease-in-out ${item.delay}s infinite`,
            }}
          >
            <div
              ref={(el) => { iconRefs.current[i] = el }}
              className="transition-transform duration-[1200ms] ease-out will-change-transform flex items-center justify-center"
              style={{ transform: 'translate(0px, 0px)' }}
            >
              <div className="transition-all duration-500 ease-out group-hover:scale-[2] group-hover:drop-shadow-[0_0_20px_rgba(212,168,83,0.6)]">
                {ICONS[item.id](item.size)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-32 z-10 flex gap-2">
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
              i === currentImg ? 'w-8 bg-brand-gold' : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 mt-16 lg:mt-0">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <Reveal animation="fade-left" className="flex-1 w-full">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 text-brand-gold text-xs font-bold px-4 sm:px-5 py-2 rounded-full uppercase tracking-widest mb-4 sm:mb-6 border border-brand-gold/20 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                Abierto para reservas
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white mb-4 sm:mb-6 leading-[1.05] sm:leading-[0.95] tracking-tight">
                <span className="block">{SITE_TAGLINE.split(',')[0]},</span>
                <span className="block bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(212,168,83,0.3)]">{SITE_TAGLINE.split(',')[1]?.trim()}</span>
              </h1>

              <p className="text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed mb-6 sm:mb-10">
                {SITE_DESC}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button onClick={onVerPlanes} className="group relative overflow-hidden text-brand-night font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl transition-all duration-500 ease-out border border-brand-gold/30 bg-brand-gold shadow-lg shadow-brand-gold/20 animate-neon hover:animate-none hover:shadow-xl hover:shadow-brand-gold/40 hover:-translate-y-0.5 text-sm sm:text-base cursor-pointer">
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-gold-light to-brand-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10">Ver Planes</span>
                </button>
                <button onClick={onVerGaleria} className="group relative overflow-hidden text-white font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl transition-all duration-500 ease-out border border-white/15 bg-white/5 hover:bg-white/10 hover:shadow-xl hover:shadow-white/5 hover:-translate-y-0.5 text-sm sm:text-base cursor-pointer">
                  <span className="relative z-10">Ver Galería</span>
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal animation="fade-right" delay={200} className="flex-1 w-full max-w-lg hidden lg:block">
            <div className="glass-dark rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl border border-white/5 animate-float">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-teal/5 rounded-full blur-3xl -z-10" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-red-500/80 rounded-full animate-pulse" />
                  <span className="w-3 h-3 bg-yellow-500/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <span className="w-3 h-3 bg-green-500/80 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                </div>
                <span className="text-xs text-white/40 font-mono">piscinaoasis.cl</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/20 hover:bg-white/[0.05]">
                  <div className="text-xs text-white/40 mb-1">Espacios Disponibles</div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold font-heading text-emerald-400">4</div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-full w-[80%] rounded-full animate-gradient" />
                    </div>
                    <span className="text-xs text-emerald-400/60">80%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/20 hover:bg-white/[0.05]">
                    <div className="text-xs text-white/40 mb-1">Precio Desde</div>
                    <div className="text-lg font-bold font-heading text-brand-gold">$200K</div>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/20 hover:bg-white/[0.05]">
                    <div className="text-xs text-white/40 mb-1">Capacidad</div>
                    <div className="text-lg font-bold font-heading text-white">50+ pers</div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] rounded-xl font-mono text-xs text-brand-gold/60 space-y-1.5 border border-white/5 backdrop-blur-sm">
                  <p>
                    <svg className="w-3.5 h-3.5 inline-block align-middle text-amber-400 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                    <span className="text-white/50">28°C ·</span> Sensación <span className="text-brand-gold font-bold">30°C</span><span className="inline-block ml-1 w-1.5 h-4 bg-brand-gold/80 align-middle animate-pulse" />
                  </p>
                  <p>
                    <svg className="w-3.5 h-3.5 inline-block align-middle text-cyan-300 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>
                    <span className="text-white/50">Agua</span><span className="text-white/70"> 26°C ·</span> Cristalina
                  </p>
                  <p className="text-white/20 text-[10px] pt-0.5">Villa Alegre — Mejor clima del valle</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </header>
  )
}
