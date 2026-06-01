import { useState, useEffect, useRef, useCallback, memo } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { pdf } from '@react-pdf/renderer'
import ContratoPDF from './ContratoPDF'
import ServiceSelector from './ServiceSelector'
import useAnimatedNumber from '../hooks/useAnimatedNumber'
import { RESERVA, SERVICIOS_ADICIONALES, SITE_NAME } from '../config'
import { useToast } from './Toast'
import { createReserva } from '../api'
import { IcoCheck, IcoPlus, IcoMinus, IcoArrowRight, IcoArrowLeft } from '../icons'

const STEPS = [
  { num: 1, label: 'Plan y Fecha', icon: 'calendar' },
  { num: 2, label: 'Servicios', icon: 'sparkle' },
  { num: 3, label: 'Tus Datos', icon: 'user' },
]

const SVG_ICONS = {
  calendar: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  sparkle: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3c0 0 2 4 6 6s-6 2-6 6c0-4-2-6-6-6s6-2 6-6"/></svg>,
  user: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  pen: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  calendarBig: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  sparkleBig: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3c0 0 2 4 6 6s-6 2-6 6c0-4-2-6-6-6s6-2 6-6"/></svg>,
  userBig: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  penBig: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
}

const SignaturePad = memo(({ canvasRef, hasDrawn, onDrawChange }) => {
  const isDrawing = useRef(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.scale(dpr, dpr)
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#d4a853'
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [canvasRef])

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [canvasRef])

  const startDrawing = useCallback((e) => {
    if (e.cancelable) e.preventDefault()
    isDrawing.current = true
    onDrawChange(false)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.arc(x, y, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x, y)
    onDrawChange(true)
  }, [canvasRef, getPos, onDrawChange])

  const draw = useCallback((e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const { x, y } = getPos(e)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#d4a853'
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [canvasRef, getPos])

  const stopDrawing = useCallback(() => {
    isDrawing.current = false
  }, [])

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative bg-brand-night/60 border border-white/10 rounded-xl overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-[140px] cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
            <span className="text-white/15 text-sm font-mono tracking-wider">─ Firma aquí ─</span>
          </div>
        )}
        {hasDrawn && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button type="button" onClick={() => {
              const canvas = canvasRef.current
              if (!canvas) return
              const ctx = canvas.getContext('2d', { willReadFrequently: true })
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              onDrawChange(false)
            }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer" title="Limpiar firma">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-white/30">Firma arrastrando el mouse o tu dedo</p>
    </div>
  )
})
SignaturePad.displayName = 'SignaturePad'

export default function QuotationModal({ plan, onClose, fechasConfirmadas, fechasPendientes, fechasBloqueadas, onReservaExitosa }) {
  const addToast = useToast()
  const modalRef = useRef(null)
  const sigCanvasRef = useRef(null)
  const [step, setStep] = useState(1)
  const [numPersonas, setNumPersonas] = useState(RESERVA.PERSONAS_BASE)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [firmado, setFirmado] = useState(false)
  const [previewPdf, setPreviewPdf] = useState(false)
  const [datosCliente, setDatosCliente] = useState({ nombre: '', email: '', telefono: '', empresa: '' })
  const [precioFinal, setPrecioFinal] = useState(plan?.precio_base || 0)
  const animatedTotal = useAnimatedNumber(precioFinal, 800)

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
      if (e.key === 'Escape' && !guardando) {
        if (previewPdf) { setPreviewPdf(false); return }
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, guardando, previewPdf])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const toggleServicio = (id) => {
    setServiciosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const validarPaso1 = () => {
    if (!fechaSeleccionada) { addToast('Selecciona una fecha para el evento.', 'warning'); return false }
    return true
  }

  const validarPaso3 = () => {
    if (!datosCliente.nombre.trim()) { addToast('Ingresa tu nombre completo.', 'warning'); return false }
    if (!datosCliente.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.email)) { addToast('Ingresa un correo válido.', 'warning'); return false }
    if (!datosCliente.telefono.trim() || datosCliente.telefono.replace(/\D/g, '').length < 8) { addToast('Ingresa un teléfono válido (mín. 8 dígitos).', 'warning'); return false }
    if (!firmado) { addToast('Debes firmar la conformidad.', 'warning'); return false }
    return true
  }

  const manejarReserva = async (e) => {
    e.preventDefault()
    if (!validarPaso3()) return
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
      const reader = new FileReader()
      reader.onloadend = async () => {
        const pdfBase64 = reader.result.split(',')[1]
        try {
          await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operation: 'sendReservationEmail',
              data: {
                ...nuevaReserva,
                servicios: nombresServicios,
                pdfBase64,
                pdfName: `contrato_${datosCliente.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
              }
            }),
          })
        } catch (_) { addToast('Reserva guardada, pero no se pudo enviar el correo. Revisa la config de Resend.', 'warning') }
      }
      reader.readAsDataURL(blob)

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onClose() }}
    >
      <div className="absolute inset-0 bg-brand-night/80 backdrop-blur-xl" />

      <div ref={modalRef} className="relative glass-light rounded-[2.5rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-modal-content custom-scrollbar">
        <button onClick={() => !guardando && onClose()} className="absolute top-5 right-5 w-11 h-11 glass hover:bg-brand-gold hover:text-brand-night rounded-full flex items-center justify-center text-brand-slate z-20 transition-all shadow-md cursor-pointer group">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="p-8 lg:p-12">
          <div className="mb-8">
            <span className="text-brand-gold text-xs font-black uppercase tracking-widest">Cotización</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-black text-brand-dark mt-2">{plan.nombre}</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 mb-10 px-2">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 sm:gap-4 flex-1">
                <div className={`flex items-center gap-2 sm:gap-3 ${step >= s.num ? 'text-brand-gold' : 'text-gray-300'}`}>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    step > s.num ? 'bg-brand-teal text-white' : step === s.num ? 'bg-brand-gold text-brand-night' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.num ? <IcoCheck className="w-4 h-4" /> : s.num}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-bold uppercase tracking-wider ${step >= s.num ? 'text-brand-dark' : 'text-gray-400'}`}>{s.label}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-[2px] rounded-full transition-all duration-500 ${step > s.num ? 'bg-brand-teal' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="animate-modal-content">
              <div className="bg-white/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/70 mb-6">
                <h3 className="text-xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">{SVG_ICONS.calendarBig}</span>
                  Fecha del Evento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label-premium">Cantidad de Invitados</label>
                    <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl p-1.5 focus-within:border-brand-teal transition-all">
                      <button onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))} className="w-11 h-11 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark flex items-center justify-center transition cursor-pointer"><IcoMinus className="w-5 h-5" /></button>
                      <input type="number" value={numPersonas} readOnly className="w-full bg-transparent text-center font-black text-brand-dark text-lg outline-none" />
                      <button onClick={() => setNumPersonas(numPersonas + 1)} className="w-11 h-11 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark flex items-center justify-center transition cursor-pointer"><IcoPlus className="w-5 h-5" /></button>
                    </div>
                    <p className="text-xs text-brand-muted mt-2">*Extra desde {RESERVA.PERSONAS_BASE} pers.</p>
                  </div>
                  <div>
                    <label className="label-premium text-center w-full block">Seleccionar Fecha</label>
                    <div className="bg-white p-2 rounded-xl border-2 border-gray-100 flex justify-center">
                      <DatePicker
                        selected={fechaSeleccionada}
                        onChange={d => setFechaSeleccionada(d)}
                        locale={es}
                        minDate={new Date()}
                        excludeDates={fechasBloqueadas}
                        placeholderText="Elegir fecha"
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

              <div className="flex justify-end">
                <button
                  onClick={() => { if (validarPaso1()) setStep(2) }}
                  className="group relative overflow-hidden text-brand-night font-bold px-8 py-3.5 rounded-xl transition-all duration-500 ease-out border border-brand-gold/30 bg-brand-gold shadow-lg shadow-brand-gold/20 hover:shadow-xl hover:shadow-brand-gold/30 cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-gold-light to-brand-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">Continuar <IcoArrowRight className="w-5 h-5" /></span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-modal-content">
              <div className="bg-white/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/70 mb-6">
                <h3 className="text-xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">{SVG_ICONS.sparkleBig}</span>
                  Servicios Adicionales
                </h3>
                <ServiceSelector seleccionados={serviciosSeleccionados} onToggle={toggleServicio} />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3.5 rounded-xl border border-gray-200 text-brand-muted font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <IcoArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="group relative overflow-hidden text-brand-night font-bold px-8 py-3.5 rounded-xl transition-all duration-500 ease-out border border-brand-gold/30 bg-brand-gold shadow-lg shadow-brand-gold/20 hover:shadow-xl hover:shadow-brand-gold/30 cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-gold-light to-brand-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">Continuar <IcoArrowRight className="w-5 h-5" /></span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-modal-content">
              <div className="bg-white/60 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/70 mb-6">
                <h3 className="text-xl font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">{SVG_ICONS.userBig}</span>
                  Tus Datos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div><label className="label-premium">Nombre Completo</label><input placeholder="Ej: Juan Pérez" value={datosCliente.nombre} onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} className="input-white" /></div>
                  <div><label className="label-premium">Correo Electrónico</label><input placeholder="juan@correo.com" type="email" value={datosCliente.email} onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} className="input-white" /></div>
                  <div><label className="label-premium">Teléfono (WhatsApp)</label><input placeholder="+56 9 8765 4321" type="tel" value={datosCliente.telefono} onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} className="input-white" /></div>
                  <div><label className="label-premium">Empresa (Opcional)</label><input placeholder="Nombre de la empresa" value={datosCliente.empresa} onChange={e => setDatosCliente({ ...datosCliente, empresa: e.target.value })} className="input-white" /></div>
                </div>
              </div>

              <div className="bg-brand-night/5 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/10 mb-6">
                <h3 className="text-xl font-serif font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">{SVG_ICONS.penBig}</span>
                  Firma de Conformidad
                </h3>
                <p className="text-sm text-brand-muted mb-4">Firma para aceptar las condiciones de la reserva</p>
                <SignaturePad canvasRef={sigCanvasRef} hasDrawn={firmado} onDrawChange={setFirmado} />
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(2)} className="px-8 py-3.5 rounded-xl border border-gray-200 text-brand-muted font-bold hover:bg-gray-50 transition-all cursor-pointer inline-flex items-center gap-1.5"><IcoArrowLeft className="w-4 h-4" /> Atrás</button>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Total</p>
                    <p className="text-3xl font-serif font-black text-brand-gold">${animatedTotal.toLocaleString('es-CL')}</p>
                  </div>
                  <button
                    onClick={manejarReserva}
                    disabled={guardando}
                    className={`py-4 px-8 rounded-2xl font-black text-lg flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                      guardando ? 'bg-brand-muted cursor-not-allowed text-white' : 'group relative overflow-hidden text-brand-night font-bold rounded-xl border border-brand-gold/30 bg-brand-gold shadow-lg shadow-brand-gold/20 animate-neon hover:shadow-xl hover:shadow-brand-gold/30'
                    }`}
                  >
                    {guardando ? (
                      <><span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</>
                    ) : (
                      <><span className="relative z-10">Confirmar Reserva</span> <IcoArrowRight className="w-5 h-5 relative z-10" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
