import { SERVICIOS_ADICIONALES } from '../config'
import { IcoDrink, IcoSparkle, IcoDishes, IcoCandy, IcoPalette } from '../icons'

const ICON_MAP = { drink: IcoDrink, sparkle: IcoSparkle, dishes: IcoDishes, candy: IcoCandy, palette: IcoPalette }

export default function ServiceSelector({ seleccionados, onToggle }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {SERVICIOS_ADICIONALES.map(srv => {
        const isSelected = seleccionados.includes(srv.id)
        const SvgIcon = ICON_MAP[srv.icono]
        return (
          <label
            key={srv.id}
            className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 card-shine ${
              isSelected
                ? 'border-brand-teal bg-gradient-to-br from-brand-teal/10 to-brand-teal/5 shadow-lg shadow-brand-teal/10'
                : 'border-gray-100 bg-white hover:border-brand-teal/40 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isSelected ? 'bg-brand-teal/20 text-brand-teal scale-110' : 'bg-gray-50 text-brand-muted'
            }`}>
              {SvgIcon && <SvgIcon className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-brand-dark' : 'text-brand-dark'}`}>{srv.nombre}</p>
              <p className="text-xs font-black text-brand-teal mt-0.5">+${srv.precio.toLocaleString('es-CL')}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
              isSelected ? 'bg-brand-teal border-brand-teal scale-110' : 'border-gray-300'
            }`}>
              {isSelected && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input type="checkbox" checked={isSelected} onChange={() => onToggle(srv.id)} className="hidden" />
          </label>
        )
      })}
    </div>
  )
}
