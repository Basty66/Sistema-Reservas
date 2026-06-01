import Reveal from './Reveal'

export default function PlansSection({ planes, onSelectPlan }) {
  if (!planes || planes.length === 0) {
    return (
      <section id="planes" className="py-28 px-8 max-w-7xl mx-auto">
        <Reveal animation="fade-up" className="text-center">
          <span className="text-brand-gold uppercase tracking-[0.2em] text-sm font-bold mb-3 block">Reserva tu Día</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">Planes de Arriendo</h2>
          <div className="skeleton h-72 w-full max-w-lg mx-auto rounded-[2rem]" />
        </Reveal>
      </section>
    )
  }

  return (
    <section id="planes" className="relative py-28 px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-brand-gold/3 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-brand-teal/3 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <Reveal animation="fade-up">
        <div className="text-center mb-16">
          <span className="text-brand-gold uppercase tracking-[0.25em] text-sm font-black mb-4 block">Reserva tu Día</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-dark mb-6 leading-tight">
            Planes de <span className="text-brand-gold">Arriendo</span>
          </h2>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Elige el plan que mejor se adapte a tu celebración y asegura tu fecha en el oasis.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {planes.map((p, i) => {
          const isPopular = i === 1
          return (
            <Reveal key={p.id} animation="fade-up" delay={i * 150}>
              <div
                className="group relative rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer hover:-translate-y-3 transition-all duration-700 card-shine h-full"
                onClick={() => onSelectPlan(p)}
              >
                {isPopular && (
                  <div className="absolute top-6 right-0 z-10">
                    <div className="bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-night text-xs font-black px-5 py-1.5 rounded-l-full shadow-lg animate-glow-pulse">
                      POPULAR
                    </div>
                  </div>
                )}

                <div className="absolute inset-0">
                  <img
                    src="/gal_piscina_1777578003893.png"
                    alt={p.nombre}
                    onError={(e) => e.target.src = "https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-night/95 via-brand-night/30 to-transparent" />
                </div>

                <div className="relative min-h-[450px] flex flex-col justify-end p-6 md:p-8">
                  <div className="glass-card p-6 md:p-7 rounded-2xl border border-white/30 backdrop-blur-xl">
                    <h3 className="text-2xl font-serif font-bold text-brand-dark mb-1">{p.nombre}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black text-brand-gold">${p.precio_base.toLocaleString('es-CL')}</span>
                    </div>

                    <div className="space-y-2.5 mb-6">
                      {(p.items_incluidos || ['Piscina', 'Quincho', 'Áreas Verdes', 'Estacionamiento']).slice(0, 4).map((item, j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-brand-muted font-medium">{item}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="group/btn relative overflow-hidden w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-500 shadow-lg cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onSelectPlan(p) }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-brand-night to-brand-slate group-hover/btn:from-brand-teal group-hover/btn:to-brand-teal-dark transition-all duration-500" />
                      <span className="relative z-10 text-white">Cotizar Este Plan →</span>
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
