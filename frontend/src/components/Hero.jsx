import { SITE_TAGLINE, SITE_DESC } from '../config'

export default function Hero({ onVerPlanes, onVerGaleria }) {
  return (
    <header className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_oasis_1777577991129.png"
          alt="Piscina Oasis Villa Alegre"
          className="w-full h-full object-cover object-center"
          onError={(e) => e.target.src = "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-night/60 via-brand-night/30 to-brand-night/80"></div>
      </div>

      <div className="relative z-10 glass-light p-10 md:p-16 rounded-3xl max-w-4xl w-[90%] text-center mt-16 animate-fadeIn">
        <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
          Abierto para reservas
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-brand-night mb-6 leading-tight">
          {SITE_TAGLINE.split(',')[0]},<br />{SITE_TAGLINE.split(',')[1]?.trim()}
        </h1>
        <p className="text-brand-slate/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          {SITE_DESC} Celebra tu próximo evento en espacios diseñados para inspirar, refrescar y crear momentos inolvidables bajo el sol.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onVerPlanes}
            className="bg-brand-night text-white px-10 py-4 rounded-full font-bold hover:bg-brand-slate transition-all shadow-xl text-lg hover:-translate-y-1 transform duration-300 cursor-pointer"
          >
            Ver Planes
          </button>
          <button
            onClick={onVerGaleria}
            className="glass-dark text-white px-10 py-4 rounded-full font-bold hover:bg-white/20 transition-all shadow-sm text-lg hover:-translate-y-1 transform duration-300 cursor-pointer"
          >
            Ver Galería
          </button>
        </div>
      </div>
    </header>
  )
}
