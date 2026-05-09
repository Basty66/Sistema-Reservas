import { useState, useEffect } from 'react'
import { SITE_NAME } from '../config'

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
      className={`fixed top-0 w-full z-50 px-4 sm:px-8 py-3 transition-all duration-500 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl transition-all duration-500 ${
          scrolled
            ? 'glass-dark border border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
          <span className="text-2xl drop-shadow-lg animate-float-slow inline-block">🌴</span>
          <span className="hidden xs:inline drop-shadow-md">{SITE_NAME}</span>
          <span className="xs:hidden">{SITE_NAME}</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="relative px-4 py-2 text-white/70 hover:text-white text-sm font-semibold uppercase tracking-wider transition-colors duration-300 group cursor-pointer"
            >
              {item.label}
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCotizar}
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-night px-6 py-2.5 rounded-full text-sm font-bold hover:from-brand-gold-light hover:to-brand-gold transition-all duration-300 shadow-lg hover:shadow-brand-gold/25 uppercase tracking-wider cursor-pointer"
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

      {menuOpen && (
        <div className="md:hidden mt-2 glass-dark rounded-2xl overflow-hidden shadow-2xl border border-white/5 animate-slideDown">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="w-full text-left px-6 py-4 text-white/70 hover:text-white hover:bg-white/5 font-semibold transition border-b border-white/5 last:border-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { scrollTo('planes'); onCotizar() }}
            className="w-full text-left px-6 py-4 text-brand-night font-bold bg-gradient-to-r from-brand-gold to-brand-gold-dark cursor-pointer"
          >
            Cotizar Ahora
          </button>
        </div>
      )}
    </nav>
  )
}
