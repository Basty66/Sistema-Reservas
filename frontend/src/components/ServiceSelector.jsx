import { SERVICIOS_ADICIONALES } from '../config'

export default function ServiceSelector({ seleccionados, onToggle }) {
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
        <span className="text-brand-gold">✨</span> Servicios Adicionales
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SERVICIOS_ADICIONALES.map(srv => (
          <label
            key={srv.id}
            className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
              seleccionados.includes(srv.id)
                ? 'bg-brand-teal/10 border-brand-teal shadow-lg'
                : 'bg-white border-gray-100 hover:border-brand-teal/50 shadow-sm'
            }`}
          >
            <div className="absolute top-4 right-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${seleccionados.includes(srv.id) ? 'bg-brand-teal border-brand-teal' : 'border-gray-300'}`}>
                {seleccionados.includes(srv.id) && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <input
              type="checkbox"
              checked={seleccionados.includes(srv.id)}
              onChange={() => onToggle(srv.id)}
              className="hidden"
            />
            <span className="text-2xl mb-2">{srv.icono}</span>
            <span className="font-bold text-brand-dark mb-1 leading-tight">{srv.nombre}</span>
            <span className="text-sm font-black text-brand-teal mt-auto">+ ${srv.precio.toLocaleString('es-CL')}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
