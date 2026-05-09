import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import emailjs from '@emailjs/browser'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format, parseISO, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { EMAILJS, WHATSAPP } from './config'
import { useToast } from './components/Toast'
import {
  getReservas, getGastos, getFechasBloqueadas,
  updateReservaEstado, deleteReserva,
  createGasto, deleteGasto,
  createFechaBloqueada, deleteFechaBloqueada,
} from './api'

const NAV_ITEMS = [
  { id: 'finanzas', label: 'Resumen', icon: '📊' },
  { id: 'reservas', label: 'Reservas', icon: '📋' },
  { id: 'calendario', label: 'Disponibilidad', icon: '📅' },
]

function Admin() {
  const addToast = useToast()
  const [reservas, setReservas] = useState([])
  const [gastos, setGastos] = useState([])
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [procesandoId, setProcesandoId] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('finanzas')

  // Auth con Supabase
  const [sesion, setSesion] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authCargando, setAuthCargando] = useState(false)

  // Estados para gastos
  const [nuevoGasto, setNuevoGasto] = useState({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd') })
  const [guardandoGasto, setGuardandoGasto] = useState(false)

  // Estados para bloqueo de fechas
  const [fechaBloquear, setFechaBloquear] = useState(null)
  const [motivoBloqueo, setMotivoBloqueo] = useState('')
  const [bloqueando, setBloqueando] = useState(false)

  // =============================================
  // SUPABASE AUTH
  // =============================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
    })
    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (sesion) {
      cargarDatos()
    }
  }, [sesion])

  async function cargarDatos() {
    try {
      const [r, g, fb] = await Promise.all([
        getReservas(),
        getGastos(),
        getFechasBloqueadas(),
      ])
      setReservas(r || [])
      setGastos(g || [])
      setFechasBloqueadas(fb || [])
    } catch (err) {
      addToast('Error cargando datos: ' + err.message, 'error')
    }
    setCargando(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      addToast('Ingresa email y contraseña.', 'warning')
      return
    }
    setAuthCargando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setAuthCargando(false)
    if (error) {
      addToast('Credenciales incorrectas: ' + error.message, 'error')
    } else {
      addToast('Inicio de sesión exitoso.', 'success')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    addToast('Sesión cerrada.', 'info')
  }

  const handleRegistro = async () => {
    if (!email || !password) {
      addToast('Ingresa email y contraseña para registrarte.', 'warning')
      return
    }
    setAuthCargando(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setAuthCargando(false)
    if (error) {
      addToast('Error: ' + error.message, 'error')
    } else {
      addToast('Usuario creado. Revisa tu correo para confirmar.', 'success')
    }
  }

  // =============================================
  // BLOQUEO DE FECHAS
  // =============================================
  async function bloquearFecha(e) {
    e.preventDefault()
    if (!fechaBloquear || !motivoBloqueo) {
      addToast('Selecciona una fecha y escribe un motivo.', 'warning')
      return
    }
    setBloqueando(true)
    try {
      const fechaFormateada = format(fechaBloquear, 'yyyy-MM-dd')
      await createFechaBloqueada(fechaFormateada, motivoBloqueo)
      addToast('Fecha bloqueada exitosamente.', 'success')
      setFechaBloquear(null)
      setMotivoBloqueo('')
      const fb = await getFechasBloqueadas()
      setFechasBloqueadas(fb || [])
    } catch (err) {
      addToast('Error al bloquear fecha: ' + err.message, 'error')
    }
    setBloqueando(false)
  }

  async function desbloquearFecha(id) {
    try {
      await deleteFechaBloqueada(id)
      addToast('Fecha desbloqueada.', 'success')
      const fb = await getFechasBloqueadas()
      setFechasBloqueadas(fb || [])
    } catch (err) {
      addToast('Error al desbloquear', 'error')
    }
  }

  // =============================================
  // RESERVAS
  // =============================================
  async function confirmarReserva(id) {
    setProcesandoId(id)
    try {
      await updateReservaEstado(id, 'Confirmado')

      const reserva = reservas.find(r => r.id === id)

      try {
        await emailjs.send(
          EMAILJS.SERVICE_ID,
          EMAILJS.TEMPLATE_APROBACION,
          {
            to_email: reserva.email_cliente,
            name: reserva.nombre_cliente,
            nombre: reserva.nombre_cliente,
            tiempo: format(new Date(), "dd/MM/yyyy - HH:mm"),
            mensaje: `¡Excelentes noticias! Tu reserva para el día ${reserva.fecha_evento} en Piscina Oasis ha sido APROBADA oficialmente por la administración. Nos pondremos en contacto contigo pronto para coordinar los últimos detalles. ¡Te esperamos!`,
          },
          EMAILJS.PUBLIC_KEY
        )
      } catch (mailError) {
        console.error('Error al enviar correo de aprobación:', mailError)
      }

      if (reserva.telefono_cliente) {
        const telefono = reserva.telefono_cliente.replace(/\D/g, '')
        const mensajeWsp = encodeURIComponent(
          `🎉 *¡RESERVA APROBADA!* 🎉\n\n` +
          `Hola *${reserva.nombre_cliente}*, te informamos que tu reserva en *Piscina Oasis* ha sido confirmada exitosamente.\n\n` +
          `📅 *Fecha:* ${reserva.fecha_evento}\n` +
          `💰 *Total:* $${reserva.total_cotizado?.toLocaleString('es-CL')} CLP\n\n` +
          `Recuerda revisar el contrato que enviamos a tu correo, firmarlo y reenviárnoslo para dejar todo en orden.\n\n` +
          `¡Nos vemos pronto! 🏡✨`
        )
        window.open(`https://wa.me/${telefono}?text=${mensajeWsp}`, '_blank')
      }

      addToast('Reserva confirmada. Correo enviado y WhatsApp listo.', 'success')
      const r = await getReservas()
      setReservas(r || [])
    } catch (err) {
      addToast('Error al confirmar: ' + err.message, 'error')
    }
    setProcesandoId(null)
  }

  async function eliminarReserva(id) {
    try {
      await deleteReserva(id)
      addToast('Reserva eliminada.', 'info')
      const r = await getReservas()
      setReservas(r || [])
    } catch (err) {
      addToast('Error al eliminar', 'error')
    }
  }

  // =============================================
  // GASTOS
  // =============================================
  async function agregarGasto(e) {
    e.preventDefault()
    if (!nuevoGasto.descripcion || !nuevoGasto.monto) {
      addToast('Completa todos los campos del gasto.', 'warning')
      return
    }
    setGuardandoGasto(true)
    try {
      await createGasto({
        descripcion: nuevoGasto.descripcion,
        monto: parseInt(nuevoGasto.monto),
        fecha: nuevoGasto.fecha,
      })
      setNuevoGasto({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd') })
      const g = await getGastos()
      setGastos(g || [])
      addToast('Gasto registrado.', 'success')
    } catch (err) {
      addToast('Error al guardar gasto: ' + err.message, 'error')
    }
    setGuardandoGasto(false)
  }

  async function eliminarGasto(id) {
    try {
      await deleteGasto(id)
      addToast('Gasto eliminado.', 'info')
      const g = await getGastos()
      setGastos(g || [])
    } catch (err) {
      addToast('Error al eliminar gasto', 'error')
    }
  }

  // =============================================
  // CÁLCULOS FINANCIEROS
  // =============================================
  const reservasConfirmadas = reservas.filter(r => r.estado === 'Confirmado')
  const totalIngresos = reservasConfirmadas.reduce((sum, r) => sum + (r.total_cotizado || 0), 0)
  const totalGastos = gastos.reduce((sum, g) => sum + (g.monto || 0), 0)
  const balance = totalIngresos - totalGastos
  const maxGasto = Math.max(...gastos.map(g => g.monto || 0), 1)

  // =============================================
  // EXPORTAR CSV
  // =============================================
  function exportarCSV() {
    let csv = 'TIPO,FECHA,DESCRIPCIÓN,MONTO\n'
    reservasConfirmadas.forEach(r => {
      csv += `Ingreso,${r.fecha_evento},"${r.nombre_cliente} - Reserva",${r.total_cotizado}\n`
    })
    gastos.forEach(g => {
      csv += `Gasto,${g.fecha},"${g.descripcion}",-${g.monto}\n`
    })
    csv += `\n,,TOTAL INGRESOS,${totalIngresos}\n`
    csv += `,,TOTAL GASTOS,-${totalGastos}\n`
    csv += `,,BALANCE FINAL,${balance}\n`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finanzas_oasis_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    addToast('Reporte CSV descargado.', 'success')
  }

  // =============================================
  // DATOS PARA CALENDARIO
  // =============================================
  const fechasConfirmadasCal = reservas
    .filter(r => r.estado === 'Confirmado')
    .map(r => ({ fecha: startOfDay(parseISO(r.fecha_evento)), cliente: r.nombre_cliente }))

  const fechasPendientesCal = reservas
    .filter(r => r.estado === 'Pendiente')
    .map(r => ({ fecha: startOfDay(parseISO(r.fecha_evento)), cliente: r.nombre_cliente }))

  const fechasBloqueadasCal = fechasBloqueadas.map(f => ({
    fecha: startOfDay(parseISO(f.fecha)),
    motivo: f.motivo,
  }))

  // =============================================
  // VISTA DE LOGIN
  // =============================================
  if (!sesion) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-brand-night">
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src="/hero_oasis_1777577991129.png"
            alt="Oasis Background"
            className="w-full h-full object-cover object-center"
            onError={(e) => e.target.src = "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
          />
        </div>

        <form onSubmit={handleLogin} className="relative z-10 glass-light p-10 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fadeIn">
          <div className="text-center mb-8">
            <div className="mb-4 text-5xl">🌴</div>
            <h2 className="text-3xl font-serif font-black mb-1 text-brand-night">Piscina Oasis</h2>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Portal Administrativo</p>
          </div>
          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full p-4 bg-white/70 border-2 border-brand-primary/10 rounded-2xl outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 text-center font-bold text-brand-dark transition-all placeholder:font-normal placeholder:text-gray-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full p-4 bg-white/70 border-2 border-brand-primary/10 rounded-2xl outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 text-center font-bold text-brand-dark transition-all placeholder:font-normal placeholder:text-gray-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <button type="submit" disabled={authCargando} className="w-full bg-brand-night text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-slate transition-all duration-300 shadow-xl flex justify-center items-center gap-3 cursor-pointer">
              {authCargando ? 'Ingresando...' : 'Ingresar al Panel'}
            </button>
            <button type="button" onClick={handleRegistro} disabled={authCargando} className="w-full glass text-white/80 py-3 rounded-2xl font-semibold text-sm hover:bg-white/10 transition cursor-pointer">
              Crear cuenta nueva
            </button>
          </div>
        </form>
      </div>
    )
  }

  // =============================================
  // VISTA PRINCIPAL
  // =============================================
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col md:flex-row font-sans text-brand-dark">
      <aside className="hidden md:flex w-64 glass flex-col sticky top-0 h-screen z-10">
        <div className="p-8 border-b border-white/10">
          <h1 className="text-xl font-serif font-bold text-white tracking-wide">Piscina Oasis</h1>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mt-1">Gestión de Eventos</p>
        </div>
        <div className="px-6 py-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-night font-bold text-sm">
            {sesion.user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-white truncate">{sesion.user?.email}</p>
            <button onClick={handleLogout} className="text-xs text-white/40 hover:text-brand-rose transition cursor-pointer">Cerrar Sesión</button>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setVistaActiva(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                vistaActiva === tab.id ? 'bg-brand-gold/20 text-brand-gold' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
        {sesion && (
          <div className="px-4 py-4 border-t border-white/10">
            <button onClick={exportarCSV} className="w-full glass text-white/70 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer">
              📥 Exportar CSV
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 h-screen overflow-y-auto">
        <div className="flex md:hidden items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-serif font-bold text-brand-dark">Piscina Oasis</h1>
            <p className="text-xs text-brand-muted">{sesion.user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-xs text-brand-muted hover:text-brand-rose transition cursor-pointer">Salir</button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark mb-2">
              {vistaActiva === 'finanzas' && 'Resumen Financiero'}
              {vistaActiva === 'reservas' && 'Gestión de Reservas'}
              {vistaActiva === 'calendario' && 'Disponibilidad y Calendario'}
            </h2>
            <p className="text-brand-muted text-sm">
              {vistaActiva === 'finanzas' && 'Estado actual del Oasis.'}
              {vistaActiva === 'reservas' && 'Administra las solicitudes de eventos.'}
              {vistaActiva === 'calendario' && 'Gestiona fechas y bloqueos.'}
            </p>
          </div>
        </div>

        {vistaActiva === 'finanzas' && (
          <div className="space-y-8 max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass rounded-3xl p-6 relative overflow-hidden">
                <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Total Ingresos</p>
                <p className="text-3xl font-serif font-bold text-brand-dark">${totalIngresos.toLocaleString('es-CL')}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{reservasConfirmadas.length} confirmadas</span>
                </div>
              </div>
              <div className="glass rounded-3xl p-6 relative overflow-hidden">
                <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Total Gastos</p>
                <p className="text-3xl font-serif font-bold text-brand-dark">${totalGastos.toLocaleString('es-CL')}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{gastos.length} registros</span>
                </div>
              </div>
              <div className="glass-gold rounded-3xl p-6 relative overflow-hidden">
                <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-2">Balance Estimado</p>
                <p className="text-3xl font-serif font-bold text-brand-night">${balance.toLocaleString('es-CL')}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                  <span className={`px-2 py-1 rounded-full ${balance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {balance >= 0 ? '+ Positivo' : '- Negativo'}
                  </span>
                </div>
              </div>
            </div>

            {gastos.length > 0 && (
              <div className="glass rounded-3xl p-6">
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Distribución de Gastos</h3>
                <div className="space-y-3">
                  {gastos.slice(0, 8).map(g => {
                    const pct = Math.round(((g.monto || 0) / maxGasto) * 100)
                    return (
                      <div key={g.id} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-brand-muted w-20 truncate shrink-0">{g.fecha}</span>
                        <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-dark rounded-full transition-all duration-700 ease-out flex items-center justify-end px-3" style={{ width: `${Math.max(pct, 5)}%` }}>
                            <span className="text-xs font-bold text-brand-night">{g.descripcion}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-muted w-24 text-right shrink-0">${g.monto?.toLocaleString('es-CL')}</span>
                        <button onClick={() => eliminarGasto(g.id)} className="text-red-300 hover:text-red-500 text-xs shrink-0 cursor-pointer">✕</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Gastos de Mantención</h3>
              <form onSubmit={agregarGasto} className="flex flex-col sm:flex-row gap-3 mb-6">
                <input type="date" value={nuevoGasto.fecha} onChange={e => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-gold flex-1" required />
                <input type="text" placeholder="Descripción" value={nuevoGasto.descripcion} onChange={e => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-gold flex-1" required />
                <input type="number" placeholder="Monto $" value={nuevoGasto.monto} onChange={e => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })} className="w-full sm:w-24 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-gold" required min="1" />
                <button type="submit" disabled={guardandoGasto} className="bg-brand-night text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-slate transition disabled:opacity-50 cursor-pointer">{guardandoGasto ? '...' : 'Agregar'}</button>
              </form>
            </div>
          </div>
        )}

        {vistaActiva === 'reservas' && (
          <div className="glass rounded-3xl p-4 md:p-8 max-w-6xl">
            {cargando ? (
              <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-brand-light">
                      <th className="pb-4 font-semibold text-brand-muted text-xs uppercase tracking-wider">Cliente</th>
                      <th className="pb-4 font-semibold text-brand-muted text-xs uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                      <th className="pb-4 font-semibold text-brand-muted text-xs uppercase tracking-wider whitespace-nowrap">Fecha</th>
                      <th className="pb-4 font-semibold text-brand-muted text-xs uppercase tracking-wider text-right">Total</th>
                      <th className="pb-4 font-semibold text-brand-muted text-xs uppercase tracking-wider text-center">Estado</th>
                      <th className="pb-4 font-semibold text-brand-muted text-xs uppercase tracking-wider text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-light/50">
                    {reservas.length === 0 ? (
                      <tr><td colSpan="6" className="py-10 text-center text-brand-muted italic">No hay reservas.</td></tr>
                    ) : (
                      reservas.map(reserva => (
                        <tr key={reserva.id} className="hover:bg-brand-gold/5 transition-colors group">
                          <td className="py-4 pr-4">
                            <div className="font-semibold text-brand-dark text-sm">{reserva.nombre_cliente}</div>
                            <div className="text-xs text-brand-muted md:hidden">{reserva.email_cliente}</div>
                          </td>
                          <td className="py-4 pr-4 hidden sm:table-cell">
                            <div className="text-xs text-brand-muted">{reserva.email_cliente}</div>
                            <div className="text-xs text-brand-muted">{reserva.telefono_cliente}</div>
                          </td>
                          <td className="py-4 text-sm text-brand-dark font-medium whitespace-nowrap">{reserva.fecha_evento}</td>
                          <td className="py-4 text-sm font-bold text-brand-teal text-right whitespace-nowrap">${reserva.total_cotizado?.toLocaleString('es-CL')}</td>
                          <td className="py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${reserva.estado === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${reserva.estado === 'Confirmado' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                              {reserva.estado}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              {reserva.estado !== 'Confirmado' && (
                                <button onClick={() => confirmarReserva(reserva.id)} disabled={procesandoId === reserva.id} className={`text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${procesandoId === reserva.id ? 'bg-emerald-300' : 'bg-brand-teal hover:bg-brand-teal-dark'}`}>
                                  Aprobar
                                </button>
                              )}
                              <button onClick={() => eliminarReserva(reserva.id)} disabled={procesandoId === reserva.id} className="bg-white border border-gray-200 text-brand-rose hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {vistaActiva === 'calendario' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-serif font-bold text-brand-dark mb-6">Vista del Calendario</h3>
              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { color: 'bg-emerald-500', label: 'Confirmada' },
                  { color: 'bg-orange-500', label: 'Pendiente' },
                  { color: 'bg-brand-night', label: 'Bloqueada' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-xs font-semibold text-brand-muted">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-center shadow-sm">
                <DatePicker
                  inline
                  locale={es}
                  readOnly
                  dayClassName={date => {
                    const d = startOfDay(date)
                    if (fechasBloqueadasCal.some(f => isSameDay(f.fecha, d))) return 'cal-bloqueada'
                    if (fechasConfirmadasCal.some(f => isSameDay(f.fecha, d))) return 'cal-confirmada'
                    if (fechasPendientesCal.some(f => isSameDay(f.fecha, d))) return 'cal-pendiente'
                    if (d >= startOfDay(new Date())) return 'cal-libre'
                    return undefined
                  }}
                />
              </div>
            </div>
            <div className="space-y-8">
              <div className="glass rounded-3xl p-6">
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Bloquear Fechas</h3>
                <p className="text-xs text-brand-muted mb-6">Evita reservas en días específicos por uso privado o mantención.</p>
                <form onSubmit={bloquearFecha} className="flex flex-col gap-4">
                  <DatePicker selected={fechaBloquear} onChange={d => setFechaBloquear(d)} minDate={new Date()} locale={es} placeholderText="Seleccionar Fecha" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-gold" dateFormat="dd/MM/yyyy" />
                  <input type="text" placeholder="Razón (ej. Mantención de Piscina)" value={motivoBloqueo} onChange={e => setMotivoBloqueo(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-gold" required />
                  <button type="submit" disabled={bloqueando} className="w-full bg-brand-night text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-slate transition cursor-pointer">{bloqueando ? 'Procesando...' : 'Bloquear Fecha'}</button>
                </form>
              </div>
              <div className="glass rounded-3xl p-6">
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Bloqueos Activos</h3>
                <div className="space-y-3">
                  {fechasBloqueadas.map(fb => (
                    <div key={fb.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-brand-dark">{fb.fecha}</p>
                        <p className="text-xs text-brand-muted">{fb.motivo}</p>
                      </div>
                      <button onClick={() => desbloquearFecha(fb.id)} className="text-xs font-bold text-brand-teal hover:text-brand-teal-dark cursor-pointer">Desbloquear</button>
                    </div>
                  ))}
                  {fechasBloqueadas.length === 0 && <p className="text-sm text-brand-muted">No hay fechas bloqueadas actualmente.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass z-50 safe-area-bottom">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map(tab => (
            <button key={tab.id} onClick={() => setVistaActiva(tab.id)} className={`flex flex-col items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${vistaActiva === tab.id ? 'text-brand-gold' : 'text-white/50 hover:text-white'}`}>
              <span className="text-lg mb-0.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Admin
