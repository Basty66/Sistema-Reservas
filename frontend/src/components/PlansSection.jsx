export default function PlansSection({ planes, onSelectPlan }) {
  if (!planes || planes.length === 0) {
    return (
      <section id="planes" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <span className="text-brand-gold uppercase tracking-[0.2em] text-sm font-bold mb-3 block">Reserva tu Día</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">Planes de Arriendo</h2>
          <div className="skeleton h-64 w-full max-w-lg mx-auto" />
        </div>
      </section>
    )
  }

  return (
    <section id="planes" className="py-24 px-8 max-w-7xl mx-auto bg-white/50 rounded-[3rem] shadow-xl border border-white mb-24 backdrop-blur-sm">
      <div className="text-center mb-16">
        <span className="text-brand-gold uppercase tracking-[0.2em] text-sm font-bold mb-3 block">Reserva tu Día</span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">Planes de Arriendo</h2>
        <p className="text-brand-muted max-w-2xl mx-auto text-lg font-light">
          Elige el plan que mejor se adapte a tu celebración y asegura tu fecha en el oasis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8">
        {planes.map(p => (
          <div
            key={p.id}
            className="group relative rounded-3xl overflow-hidden h-[480px] shadow-2xl cursor-pointer hover:-translate-y-2 transition-all duration-500"
            onClick={() => onSelectPlan(p)}
          >
            <img
              src="/gal_piscina_1777578003893.png"
              alt={p.nombre}
              onError={(e) => e.target.src = "https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-night/95 via-brand-night/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="glass-light p-6 rounded-2xl border-white/40">
                <h3 className="text-2xl font-serif font-bold text-brand-dark mb-1">{p.nombre}</h3>
                <p className="text-brand-teal font-black text-2xl mb-3">
                  ${p.precio_base.toLocaleString('es-CL')}
                </p>
                <p className="text-sm text-brand-muted font-medium mb-4">
                  {p.descripcion || 'Acceso completo a piscinas, quinchos y áreas verdes para disfrutar al máximo.'}
                </p>
                <button
                  className="w-full bg-brand-night text-white font-bold py-3 rounded-xl group-hover:bg-brand-teal transition-colors cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onSelectPlan(p) }}
                >
                  Cotizar Este Plan →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
