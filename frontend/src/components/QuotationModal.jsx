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

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const toggleServicio = (id) => {
    setServiciosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const validarFormulario = () => {
    if (!fechaSeleccionada) { addToast('Selecciona una fecha para el evento.', 'warning'); return false }
    if (!datosCliente.nombre.trim()) { addToast('Ingresa tu nombre completo.', 'warning'); return false }
    if (!datosCliente.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) { addToast('Ingresa un correo válido.', 'warning'); return false }
    if (!datosCliente.telefono.trim() || datosCliente.telefono.replace(/\D/g, '').length < 8) { addToast('Ingresa un teléfono válido (mín. 8 dígitos).', 'warning'); return false }
    return true
  }

  const manejarReserva = async (e) => {
    e.preventDefault()
    if (!validarFormulario()) return
    setGuardando(true)

    const nombresServicios = serviciosSeleccionados.map(id => SERVICIOS_ADICIONALES.find(s => s.id === id)?.nombre).join(', ')
    const nuevaReserva = {
      nombre_cliente: datosCliente.nombre.trim(), email_cliente: datosCliente.email.trim(),
      telefono_cliente: datosCliente.telefono.trim(), empresa: datosCliente.empresa.trim(),
      fecha_evento: format(fechaSeleccionada, 'yyyy-MM-dd'), total_cotizado: precioFinal,
      num_personas: parseInt(numPersonas), estado: 'Pendiente',
    }
    const serviciosParaPDF = serviciosSeleccionados.map(id => SERVICIOS_ADICIONALES.find(s => s.id === id)).filter(Boolean)

    try {
      await createReserva(nuevaReserva)
      const blob = await pdf(<ContratoPDF datos={nuevaReserva} servicios={serviciosParaPDF} />).toBlob()
      const nombreArchivo = `contrato_${datosCliente.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      const { error: uploadError } = await supabase.storage.from('contratos').upload(nombreArchivo, blob, { contentType: 'application/pdf', upsert: false })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('contratos').getPublicUrl(nombreArchivo)
        const msgServicios = nombresServicios ? `\n\nServicios adicionales: ${nombresServicios}.` : ''
        await emailjs.send(EMAILJS.SERVICE_ID, EMAILJS.TEMPLATE_RESERVA, {
          to_email: datosCliente.email, name: datosCliente.nombre, nombre: datosCliente.nombre,
          tiempo: format(new Date(), "dd/MM/yyyy - HH:mm"),
          mensaje: `Tu reserva para el ${format(fechaSeleccionada, 'dd/MM/yyyy')} fue generada.${msgServicios}\n\nDescarga tu contrato:\n${urlData.publicUrl}\n\nFirma y reenvía para confirmar.`,
        }, EMAILJS.PUBLIC_KEY)
      }
      addToast('¡Reserva creada! Revisa tu correo.', 'success')
      onReservaExitosa(startOfDay(fechaSeleccionada))
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally { setGuardando(false) }
  }

  if (!plan) return null

  return (
    <div
      className="fixed inset-0 bg-brand-night/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onClose() }}
    >
      <div ref={modalRef} className="glass-light rounded-[2.5rem] max-w-6xl w-full flex flex-col lg:flex-row overflow-hidden shadow-2xl relative animate-scaleIn">
        <button onClick={() => !guardando && onClose()} className="absolute top-5 right-5 w-11 h-11 glass hover:bg-brand-gold hover:text-brand-night rounded-full flex items-center justify-center text-brand-slate z-20 transition-all text-lg shadow-md cursor-pointer">
          ✕
        </button>

        <div className="p-8 lg:p-12 lg:w-3/5 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="mb-8">
            <span className="text-brand-gold text-xs font-black uppercase tracking-widest">Cotización</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-black text-brand-dark mt-2">Personaliza tu Evento</h2>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/70 mb-8">
            <h3 className="text-xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-sm">1</span>
              Datos del Evento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div><label className="label-premium">Nombre Completo</label><input placeholder="Ej: Juan Pérez" value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} className="input-white" required /></div>
              <div><label className="label-premium">Correo Electrónico</label><input placeholder="juan@correo.com" type="email" value={datosCliente.email} onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} className="input-white" required /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div><label className="label-premium">Teléfono (WhatsApp)</label><input placeholder="+56 9 8765 4321" type="tel" value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} className="input-white" required /></div>
              <div><label className="label-premium">Empresa (Opcional)</label><input placeholder="Nombre de la empresa" value={datosCliente.empresa} onChange={e => setDatosCliente({ ...datosCliente, empresa: e.target.value })} className="input-white" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label-premium">Cantidad de Invitados</label>
                <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl p-1.5 focus-within:border-brand-teal transition-all">
                  <button onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))} className="w-11 h-11 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark font-black text-lg flex items-center justify-center transition cursor-pointer">−</button>
                  <input type="number" value={numPersonas} readOnly className="w-full bg-transparent text-center font-black text-brand-dark text-lg outline-none" />
                  <button onClick={() => setNumPersonas(numPersonas + 1)} className="w-11 h-11 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark font-black text-lg flex items-center justify-center transition cursor-pointer">+</button>
                </div>
                <p className="text-xs text-brand-muted mt-2 text-center">*Extra desde {RESERVA.PERSONAS_BASE} pers.</p>
              </div>
              <div>
                <label className="label-premium text-center w-full block">Seleccionar Fecha</label>
                <div className="bg-white p-2 rounded-xl border-2 border-gray-100 flex justify-center">
                  <DatePicker
                    selected={fechaSeleccionada} onChange={d => setFechaSeleccionada(d)} locale={es} minDate={new Date()}
                    excludeDates={fechasBloqueadas} placeholderText="Elegir fecha"
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

          <div className="bg-white/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/70 mb-4">
            <h3 className="text-xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-sm">2</span>
              Servicios Adicionales
            </h3>
            <ServiceSelector seleccionados={serviciosSeleccionados} onToggle={toggleServicio} />
          </div>
        </div>

        <div className="lg:w-2/5 p-8 lg:p-10 bg-gradient-to-br from-brand-night via-brand-void to-brand-night relative border-l border-white/5">
          <div className="sticky top-0">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">Resumen</div>
              <h3 className="text-3xl font-serif font-black text-white">Tu Cotización</h3>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div><p className="font-bold text-white">Arriendo Base</p><p className="text-sm text-white/40">{plan.nombre}</p></div>
                <p className="font-black text-brand-gold text-lg">${plan.precio_base.toLocaleString('es-CL')}</p>
              </div>
              {numPersonas > RESERVA.PERSONAS_BASE && (
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div><p className="font-bold text-white">Invitados Extra</p><p className="text-sm text-white/40">{numPersonas - RESERVA.PERSONAS_BASE} adicionales</p></div>
                  <p className="font-black text-brand-gold text-lg">${((numPersonas - RESERVA.PERSONAS_BASE) * RESERVA.COSTO_PERSONA_EXTRA).toLocaleString('es-CL')}</p>
                </div>
              )}
              {serviciosSeleccionados.map(id => {
                const s = SERVICIOS_ADICIONALES.find(sv => sv.id === id)
                return s ? (
                  <div key={id} className="flex justify-between items-end border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2"><span className="text-brand-gold text-sm">✓</span><p className="font-bold text-white text-sm max-w-[180px]">{s.nombre}</p></div>
                    <p className="font-black text-brand-gold text-lg">${s.precio.toLocaleString('es-CL')}</p>
                  </div>
                ) : null
              })}
            </div>

            <div className="glass-gold rounded-2xl p-7 mb-8 relative overflow-hidden animate-glow-pulse">
              <div className="absolute -right-4 -top-4 text-brand-gold/10 text-7xl">🌴</div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-brand-gold-light uppercase tracking-widest mb-1">Total</p>
                <p className="text-4xl font-serif font-black text-white">${precioFinal.toLocaleString('es-CL')}</p>
                <p className="text-xs text-white/30 mt-2">Sin compromiso de pago</p>
              </div>
            </div>

            <button
              onClick={manejarReserva}
              disabled={guardando || !fechaSeleccionada}
              className={`w-full py-4 rounded-2xl font-black text-lg flex justify-center items-center gap-3 transition-all duration-300 cursor-pointer ${
                guardando ? 'bg-brand-muted cursor-not-allowed' : 'bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-night hover:from-brand-gold-light hover:to-brand-gold shadow-2xl hover:-translate-y-1 hover:shadow-brand-gold/30'
              }`}
            >
              {guardando ? (
                <><span className="w-5 h-5 border-3 border-brand-night/30 border-t-brand-night rounded-full animate-spin" /> Procesando...</>
              ) : (
                <>Solicitar Reserva <span className="text-xl">→</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
