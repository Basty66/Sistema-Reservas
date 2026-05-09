import { useState } from 'react'
import { SITE_NAME } from '../config'

const NAV_ITEMS = [
  { id: 'galeria', label: 'Instalaciones' },
  { id: 'planes', label: 'Planes' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Navbar({ onCotizar }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto glass-dark rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
          <span className="text-2xl">🌴</span>
          <span className="hidden xs:inline">{SITE_NAME}</span>
          <span className="xs:hidden">{SITE_NAME}</span>
        </div>

        <div className="hidden md:flex gap-8 text-white/80 text-sm font-semibold uppercase tracking-wider">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="hover:text-brand-gold-light transition-colors duration-300 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCotizar}
            className="hidden sm:inline-flex bg-brand-gold text-brand-night px-5 py-2 rounded-full text-sm font-bold hover:bg-brand-gold-light transition-all shadow-lg uppercase tracking-wider animate-pulse cursor-pointer"
          >
            Cotizar Ahora
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl glass text-white cursor-pointer"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-2 glass-dark rounded-2xl overflow-hidden shadow-2xl animate-slideDown">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="w-full text-left px-6 py-4 text-white/80 hover:text-white hover:bg-white/5 font-semibold transition border-b border-white/5 last:border-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { scrollTo('planes'); onCotizar() }}
            className="w-full text-left px-6 py-4 text-brand-gold font-bold bg-brand-gold/10 cursor-pointer"
          >
            Cotizar Ahora
          </button>
        </div>
      )}
    </nav>
  )
}
