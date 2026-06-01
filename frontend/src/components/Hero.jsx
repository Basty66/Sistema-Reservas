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
            <div className="glass-dark rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl border border-white/5 animate-float group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-teal/5 rounded-full blur-3xl -z-10" />

              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 animate-pulse" style={{ animationDelay: '0.6s' }} />
                </div>
                <span className="text-[10px] text-white/30 font-mono">piscinaoasis.cl</span>
              </div>

              <div className="relative h-[340px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-400/8 via-cyan-400/5 to-brand-night/30" />

                <div className="absolute top-5 right-7">
                  <div className="w-16 h-16 rounded-full bg-amber-300/8 blur-xl absolute -inset-3 animate-sun-pulse" />
                  <svg className="w-7 h-7 text-amber-300/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                </div>

                <svg className="absolute top-4 left-6 w-20 h-8 text-white/6" viewBox="0 0 80 20" fill="currentColor">
                  <ellipse cx="20" cy="12" rx="16" ry="7" />
                  <ellipse cx="45" cy="10" rx="18" ry="8" />
                  <ellipse cx="33" cy="8" rx="14" ry="6" />
                </svg>
                <svg className="absolute top-10 left-[30%] w-14 h-6 text-white/4" viewBox="0 0 60 16" fill="currentColor">
                  <ellipse cx="15" cy="10" rx="12" ry="5" />
                  <ellipse cx="35" cy="8" rx="14" ry="6" />
                </svg>

                <div className="absolute top-[27%] left-1/2 -translate-x-1/2">
                  <svg className="text-white/20" width="140" height="16" viewBox="0 0 140 16" fill="currentColor">
                    <rect x="8" y="0" width="132" height="3" rx="1.5" />
                    <rect x="20" y="3" width="4" height="13" />
                    <rect x="24" y="6" width="10" height="1.5" opacity="0.4" />
                    <rect x="24" y="10" width="10" height="1.5" opacity="0.4" />
                  </svg>
                </div>

                <div className="absolute top-[31%] left-[43%] w-10 h-16 animate-dive-loop pointer-events-none">
                  <svg viewBox="0 0 24 36" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                    <circle cx="12" cy="4" r="2.5" />
                    <path d="M12 6.5 v9" />
                    <path d="M10 8.5 l-5 -4" />
                    <path d="M14 8.5 l5 -4" />
                    <path d="M11 15 l-3 8" />
                    <path d="M13 15 l3 8" />
                  </svg>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[48%]">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/40 via-blue-400/20 to-transparent" />

                  <div className="absolute -top-2 left-0 w-full h-10 overflow-hidden">
                    <svg className="w-[200%] h-full text-cyan-300/25 animate-wave-slow" viewBox="0 0 1200 40" preserveAspectRatio="none" fill="currentColor">
                      <path d="M0 20 C40 0 80 40 120 20 C160 0 200 40 240 20 C280 0 320 40 360 20 C400 0 440 40 480 20 C520 0 560 40 600 20 C640 0 680 40 720 20 C760 0 800 40 840 20 C880 0 920 40 960 20 C1000 0 1040 40 1080 20 C1120 0 1160 40 1200 20 L1200 40 L0 40 Z" />
                    </svg>
                  </div>

                  <div className="absolute top-0 left-0 w-full h-6 overflow-hidden">
                    <svg className="w-[200%] h-full text-white/20 animate-wave-move" viewBox="0 0 1200 24" preserveAspectRatio="none" fill="currentColor">
                      <path d="M0 12 C25 0 50 24 75 12 C100 0 125 24 150 12 C175 0 200 24 225 12 C250 0 275 24 300 12 C325 0 350 24 375 12 C400 0 425 24 450 12 C475 0 500 24 525 12 C550 0 575 24 600 12 C625 0 650 24 675 12 C700 0 725 24 750 12 C775 0 800 24 825 12 C850 0 875 24 900 12 C925 0 950 24 975 12 C1000 0 1025 24 1050 12 C1075 0 1100 24 1125 12 C1150 0 1175 24 1200 12 L1200 24 L0 24 Z" />
                    </svg>
                  </div>

                  <div className="absolute bottom-[48%] left-1/2 -translate-x-1/2">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <span
                        key={i}
                        className="absolute w-[5px] h-[5px] rounded-full bg-white/40 animate-splash-particle"
                        style={{
                          left: `${(i - 3) * 7}px`,
                          animationDelay: `${3.2 + i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-[22%] right-[12%] w-14 h-14 animate-float-bob">
                    <svg viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="20" stroke="#f472b6" strokeWidth="3.5" opacity="0.6" />
                      <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="1.5" opacity="0.15" />
                      <circle cx="24" cy="24" r="20" stroke="#f472b6" strokeWidth="3" strokeDasharray="10 7" opacity="0.35" />
                    </svg>
                  </div>

                  <div className="absolute bottom-[8%] left-[12%] w-10 h-10 animate-float-bob" style={{ animationDelay: '1s' }}>
                    <svg viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="16" stroke="#fb923c" strokeWidth="3" opacity="0.5" />
                      <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="1.5" opacity="0.12" />
                      <circle cx="20" cy="20" r="16" stroke="#fb923c" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.3" />
                    </svg>
                  </div>

                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-white/15 animate-bubble"
                      style={{
                        left: `${28 + i * 18}%`,
                        bottom: '5%',
                        animationDelay: `${i * 1.8}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-night/95 via-brand-night/60 to-transparent pt-14 pb-4 px-5">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="text-left">
                      <div className="text-[10px] text-white/35 uppercase tracking-widest mb-0.5 font-medium">Desde</div>
                      <div className="text-xl font-bold font-heading text-brand-gold drop-shadow-[0_0_12px_rgba(212,168,83,0.25)]">$200K</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-white/35 uppercase tracking-widest mb-0.5 font-medium">Capacidad</div>
                      <div className="text-xl font-bold font-heading text-white">50+</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/35 uppercase tracking-widest mb-0.5 font-medium">Clima</div>
                      <div className="text-xl font-bold font-heading text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.2)]">28°</div>
                    </div>
                  </div>
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
