import { SITE_TAGLINE, SITE_DESC } from '../config'

export default function Hero({ onVerPlanes, onVerGaleria }) {
  return (
    <header className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_oasis_1777577991129.png"
          alt="Piscina Oasis Villa Alegre"
          className="w-full h-full object-cover object-center scale-105 animate-float-slow"
          onError={(e) => e.target.src = "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-night/70 via-brand-night/20 to-brand-night/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-brand-teal/5" />
      </div>

      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-brand-gold/5 blur-3xl animate-orb" />
        <div className="absolute bottom-1/4 right-[15%] w-80 h-80 rounded-full bg-brand-teal/5 blur-3xl animate-orb-delayed" />
        <div className="absolute top-1/3 right-[25%] w-40 h-40 rounded-full bg-white/5 blur-2xl animate-float" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mt-16">
        <div className="glass-light p-8 sm:p-12 md:p-16 rounded-[2.5rem] text-center animate-fadeIn shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl" />

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 text-brand-gold text-xs font-bold px-5 py-2 rounded-full uppercase tracking-widest mb-6 border border-brand-gold/20 relative">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            Abierto para reservas
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-black text-brand-night mb-6 leading-[0.95] tracking-tight">
            <span className="block animate-slideUp stagger-1">{SITE_TAGLINE.split(',')[0]},</span>
            <span className="block animate-slideUp stagger-2 text-brand-gold">{SITE_TAGLINE.split(',')[1]?.trim()}</span>
          </h1>

          <p className="text-brand-slate/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed animate-slideUp stagger-3">
            {SITE_DESC} Celebra tu próximo evento en espacios diseñados para inspirar, refrescar y crear momentos inolvidables bajo el sol.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp stagger-4">
            <button
              onClick={onVerPlanes}
              className="btn-primary text-lg px-10 py-4 shadow-2xl hover:shadow-brand-gold/30"
            >
              Ver Planes
            </button>
            <button
              onClick={onVerGaleria}
              className="btn-secondary text-lg px-10 py-4"
            >
              Ver Galería
            </button>
          </div>

          <div className="mt-12 flex justify-center gap-8 sm:gap-16 text-brand-slate/60 animate-fadeIn stagger-5">
            {[
              { value: '50+', label: 'Eventos Realizados' },
              { value: '100%', label: 'Satisfacción' },
              { value: '5', label: 'Años de Experiencia' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-brand-dark">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </header>
  )
}
