import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { id: 'galeria', label: 'Instalaciones' },
  { id: 'planes', label: 'Planes' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Navbar({ onCotizar }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [prevScroll, setPrevScroll] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      setScrolled(current > 50)
      setVisible(prevScroll > current || current < 50)
      setPrevScroll(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [prevScroll])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 px-4 sm:px-8 py-3 transition-all duration-700 ease-out ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl transition-all duration-700 ${
          scrolled
            ? 'glass-dark border border-white/5 shadow-lg shadow-black/10 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
          <svg viewBox="0 0 200 60" className="w-28 sm:w-32 h-auto drop-shadow-[0_0_8px_rgba(212,168,83,0.3)]" style={{ animation: 'fade-slide-in 0.6s ease-out' }}>
            <defs>
              <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0d78c"/><stop offset="50%" stopColor="#d4a853"/><stop offset="100%" stopColor="#b8892f"/>
              </linearGradient>
              <linearGradient id="nt" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#0d9488"/>
              </linearGradient>
            </defs>
            <g transform="translate(2, 8)">
              <path d="M18 40 C18 30, 16 20, 22 10" stroke="url(#ng)" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M22 10 C30 5, 38 9, 42 5" stroke="url(#nt)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M22 10 C16 3, 10 7, 6 3" stroke="url(#nt)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M22 10 C26 1, 32 -1, 34 -3" stroke="url(#ng)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M22 10 C18 1, 12 -1, 10 -3" stroke="url(#ng)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </g>
            <text x="48" y="30" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="white">Piscina</text>
            <text x="48" y="48" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="800" fill="url(#ng)">OASIS</text>
          </svg>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="group relative px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-all duration-300"
              style={{ animation: `fade-slide-in 0.5s ease-out ${0.2 + i * 0.08}s both` }}
            >
              <span className="relative z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(212,168,83,0.5)]">{item.label}</span>
              <span className="absolute inset-x-2 bottom-0.5 h-[2px] bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCotizar}
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-night px-6 py-2.5 rounded-full text-sm font-bold hover:from-brand-gold-light hover:to-brand-gold transition-all duration-300 shadow-lg hover:shadow-brand-gold/25 uppercase tracking-wider animate-neon hover:animate-none cursor-pointer"
          >
            Cotizar
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl glass text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-500 ease-out overflow-hidden ${menuOpen ? 'max-h-80 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
        <div className="glass-dark rounded-2xl overflow-hidden shadow-2xl border border-white/5">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="group relative w-full text-left px-6 py-4 text-white/70 hover:text-white hover:bg-white/5 font-semibold transition border-b border-white/5 last:border-0"
              style={{ animation: `fade-slide-in 0.4s ease-out ${0.1 + i * 0.06}s both` }}
            >
              <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-brand-gold via-brand-gold-light to-brand-gold rounded-full translate-x-0 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out origin-top" />
              <span className="relative z-10 transition-all duration-300 group-hover:translate-x-2">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => { scrollTo('planes'); onCotizar() }}
            className="w-full text-left px-6 py-4 text-brand-night font-bold bg-gradient-to-r from-brand-gold to-brand-gold-dark hover:from-brand-gold-light hover:to-brand-gold transition-all duration-300"
          >
            Cotizar Ahora
          </button>
        </div>
      </div>
    </nav>
  )
}
