import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import emailjs from '@emailjs/browser'
import { pdf } from '@react-pdf/renderer'
import ContratoPDF from './ContratoPDF'
import ServiceSelector from './ServiceSelector'
import { EMAILJS, RESERVA, SERVICIOS_ADICIONALES } from '../config'
import { useToast } from './Toast'
import { createReserva } from '../api'
import { supabase } from '../supabase'

export default function QuotationModal({ plan, onClose, fechasConfirmadas, fechasPendientes, fechasBloqueadas, onReservaExitosa }) {
  const addToast = useToast()
  const modalRef = useRef(null)
  const [numPersonas, setNumPersonas] = useState(RESERVA.PERSONAS_BASE)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [datosCliente, setDatosCliente] = useState({ nombre: '', email: '', telefono: '', empresa: '' })
  const [precioFinal, setPrecioFinal] = useState(plan?.precio_base || 0)

  useEffect(() => {
    if (plan) {
      const extra = Math.max(0, numPersonas - RESERVA.PERSONAS_BASE) * RESERVA.COSTO_PERSONA_EXTRA
      const servicios = serviciosSeleccionados.reduce((sum, id) => {
        const s = SERVICIOS_ADICIONALES.find(sv => sv.id === id)
        return sum + (s ? s.precio : 0)
      }, 0)
      setPrecioFinal(plan.precio_base + extra + servicios)
    }
  }, [numPersonas, plan, serviciosSeleccionados])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !guardando) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, guardando])

  const toggleServicio = (id) => {
    setServiciosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const validarFormulario = () => {
    if (!fechaSeleccionada) {
      addToast('Por favor, selecciona una fecha para el evento.', 'warning')
      return false
    }
    if (!datosCliente.nombre.trim()) {
      addToast('Por favor, ingresa tu nombre completo.', 'warning')
      return false
    }
    if (!datosCliente.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) {
      addToast('Por favor, ingresa un correo electrónico válido.', 'warning')
      return false
    }
    if (!datosCliente.telefono.trim() || datosCliente.telefono.replace(/\D/g, '').length < 8) {
      addToast('Por favor, ingresa un teléfono válido (mínimo 8 dígitos).', 'warning')
      return false
    }
    return true
  }

  const manejarReserva = async (e) => {
    e.preventDefault()
    if (!validarFormulario()) return
    setGuardando(true)

    const nombresServicios = serviciosSeleccionados
      .map(id => SERVICIOS_ADICIONALES.find(s => s.id === id)?.nombre)
      .join(', ')

    const nuevaReserva = {
      nombre_cliente: datosCliente.nombre.trim(),
      email_cliente: datosCliente.email.trim(),
      telefono_cliente: datosCliente.telefono.trim(),
      empresa: datosCliente.empresa.trim(),
      fecha_evento: format(fechaSeleccionada, 'yyyy-MM-dd'),
      total_cotizado: precioFinal,
      num_personas: parseInt(numPersonas),
      estado: 'Pendiente',
    }

    const serviciosParaPDF = serviciosSeleccionados
      .map(id => SERVICIOS_ADICIONALES.find(s => s.id === id))
      .filter(Boolean)

    try {
      await createReserva(nuevaReserva)

      const blob = await pdf(<ContratoPDF datos={nuevaReserva} servicios={serviciosParaPDF} />).toBlob()

      const nombreArchivo = `contrato_${datosCliente.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(nombreArchivo, blob, { contentType: 'application/pdf', upsert: false })
      if (uploadError) {
        addToast('Error subiendo el PDF: ' + uploadError.message, 'warning')
      } else {
        const { data: urlData } = supabase.storage.from('contratos').getPublicUrl(nombreArchivo)
        const enlacePDF = urlData.publicUrl

        const msgServicios = nombresServicios ? `\n\nServicios adicionales contratados: ${nombresServicios}.` : ''

        await emailjs.send(
          EMAILJS.SERVICE_ID,
          EMAILJS.TEMPLATE_RESERVA,
          {
            to_email: datosCliente.email,
            name: datosCliente.nombre,
            nombre: datosCliente.nombre,
            tiempo: format(new Date(), "dd/MM/yyyy - HH:mm"),
            mensaje: `Tu reserva para el día ${format(fechaSeleccionada, 'dd/MM/yyyy')} ha sido generada exitosamente.${msgServicios}\n\nPuedes descargar tu contrato oficial en PDF desde el siguiente enlace:\n${enlacePDF}\n\nPor favor, imprímelo, fírmalo y reenvíanoslo a nuestro correo para confirmar definitivamente tu reserva.`,
          },
          EMAILJS.PUBLIC_KEY
        )
      }

      addToast('¡Reserva confirmada! El contrato ha sido enviado a tu correo.', 'success')
      onReservaExitosa(startOfDay(fechaSeleccionada))
      onClose()
    } catch (err) {
      console.error('Error:', err)
      addToast(err.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  if (!plan) return null

  return (
    <div
      className="fixed inset-0 bg-brand-night/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onClose() }}
    >
      <div
        ref={modalRef}
        className="glass-light rounded-[2.5rem] max-w-6xl w-full flex flex-col lg:flex-row overflow-hidden my-8 shadow-2xl relative animate-slideUp"
      >
        <button
          onClick={() => !guardando && onClose()}
          className="absolute top-6 right-6 w-12 h-12 glass hover:bg-brand-gold hover:text-brand-night rounded-full flex items-center justify-center text-brand-slate z-20 transition-all font-bold text-xl shadow-md cursor-pointer"
        >
          ✕
        </button>

        <div className="p-8 md:p-12 lg:w-3/5 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="mb-10">
            <h2 className="text-4xl font-serif font-black text-brand-dark mb-3">Arma tu Cotización</h2>
            <p className="text-brand-muted text-lg font-medium">
              Personaliza los detalles de tu evento para recibir una propuesta formal al instante.
            </p>
          </div>

          <div className="mb-10 bg-white/70 p-6 rounded-3xl border border-white">
            <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
              <span className="text-brand-gold">🌴</span> Datos del Evento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Nombre Completo</label>
                <input
                  placeholder="Ej: Juan Pérez"
                  value={datosCliente.nombre}
                  onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 rounded-xl outline-none transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input
                  placeholder="juan@correo.com"
                  type="email"
                  value={datosCliente.email}
                  onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 rounded-xl outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Teléfono (WhatsApp)</label>
                <input
                  placeholder="+56 9 8765 4321"
                  type="tel"
                  value={datosCliente.telefono}
                  onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 rounded-xl outline-none transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Empresa (Opcional)</label>
                <input
                  placeholder="Nombre de la empresa"
                  value={datosCliente.empresa}
                  onChange={e => setDatosCliente({ ...datosCliente, empresa: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 rounded-xl outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Cantidad de Invitados</label>
                <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl p-2 focus-within:border-brand-teal transition-all shadow-inner">
                  <button
                    onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))}
                    className="w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark font-black text-xl flex items-center justify-center transition cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={numPersonas}
                    readOnly
                    className="w-full bg-transparent text-center font-black text-brand-dark text-xl outline-none"
                  />
                  <button
                    onClick={() => setNumPersonas(numPersonas + 1)}
                    className="w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark font-black text-xl flex items-center justify-center transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-brand-muted mt-2 text-center">
                  *Costo extra a partir de {RESERVA.PERSONAS_BASE} personas
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2 text-center">Seleccionar Fecha</label>
                <div className="bg-white p-2 rounded-xl border-2 border-gray-100 flex justify-center shadow-sm">
                  <DatePicker
                    selected={fechaSeleccionada}
                    onChange={d => setFechaSeleccionada(d)}
                    locale={es}
                    minDate={new Date()}
                    excludeDates={fechasBloqueadas}
                    placeholderText="Elegir día en el calendario"
                    className="w-full text-center p-2 bg-transparent outline-none font-bold text-brand-teal cursor-pointer"
                    dateFormat="dd 'de' MMMM, yyyy"
                    dayClassName={date => {
                      const d = startOfDay(date)
                      if (fechasBloqueadas.some(f => +f === +d)) return 'fecha-bloqueada'
                      if (fechasConfirmadas.some(f => +f === +d)) return 'reserva-confirmada'
                      if (fechasPendientes.some(f => +f === +d)) return 'reserva-pendiente'
                      return undefined
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <ServiceSelector seleccionados={serviciosSeleccionados} onToggle={toggleServicio} />
        </div>

        <div className="lg:w-2/5 p-8 md:p-12 bg-gradient-to-br from-brand-night to-brand-void relative border-l border-white/10">
          <div className="sticky top-0">
            <div className="text-center mb-10">
              <span className="inline-block bg-brand-gold/20 text-brand-gold text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Resumen</span>
              <h3 className="text-4xl font-serif font-black text-white">Cotización</h3>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                  <p className="font-bold text-white text-lg">Arriendo Base</p>
                  <p className="text-sm text-white/50 font-medium">{plan.nombre}</p>
                </div>
                <p className="font-black text-brand-gold text-xl">${plan.precio_base.toLocaleString('es-CL')}</p>
              </div>

              {numPersonas > RESERVA.PERSONAS_BASE && (
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <p className="font-bold text-white text-lg">Invitados Extra</p>
                    <p className="text-sm text-white/50 font-medium">{numPersonas - RESERVA.PERSONAS_BASE} personas adicionales</p>
                  </div>
                  <p className="font-black text-brand-gold text-xl">${((numPersonas - RESERVA.PERSONAS_BASE) * RESERVA.COSTO_PERSONA_EXTRA).toLocaleString('es-CL')}</p>
                </div>
              )}

              {serviciosSeleccionados.map(id => {
                const s = SERVICIOS_ADICIONALES.find(sv => sv.id === id)
                return s ? (
                  <div key={id} className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-gold text-sm">✓</span>
                      <p className="font-bold text-white text-md leading-tight max-w-[200px]">{s.nombre}</p>
                    </div>
                    <p className="font-black text-brand-gold text-xl">${s.precio.toLocaleString('es-CL')}</p>
                  </div>
                ) : null
              })}
            </div>

            <div className="glass-gold rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl">
              <div className="absolute -right-6 -top-6 text-brand-gold/10 text-9xl">🌴</div>
              <div className="relative z-10">
                <p className="font-bold text-brand-gold-light uppercase tracking-widest text-sm mb-1">Total Estimado</p>
                <h2 className="text-4xl sm:text-5xl font-serif font-black text-white">${precioFinal.toLocaleString('es-CL')}</h2>
                <p className="text-xs text-white/40 font-medium mt-2">*Valores sujetos a confirmación de disponibilidad.</p>
              </div>
            </div>

            <button
              onClick={manejarReserva}
              disabled={guardando || !fechaSeleccionada}
              className={`w-full py-5 rounded-2xl font-black text-brand-night text-xl flex justify-center items-center gap-3 transition-all duration-300 cursor-pointer ${
                guardando
                  ? 'bg-brand-muted cursor-not-allowed'
                  : 'bg-brand-gold hover:bg-brand-gold-light shadow-2xl hover:-translate-y-1'
              }`}
            >
              {guardando ? (
                <>Procesando... <div className="w-6 h-6 border-4 border-brand-night/30 border-t-brand-night rounded-full animate-spin"></div></>
              ) : (
                <>Solicitar Reserva Formal <span className="text-2xl">→</span></>
              )}
            </button>

            <p className="text-center text-sm text-white/40 mt-6 font-medium">
              Sin compromiso de pago. Te contactaremos por WhatsApp y correo para confirmar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
