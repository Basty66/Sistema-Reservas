import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format, parseISO, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from './components/Toast'
import { IcoChart, IcoClipboard, IcoCalendar, IcoPalm, IcoDownload, IcoTrash } from './icons'
import {
  getReservas, getGastos, getFechasBloqueadas,
  updateReservaEstado, deleteReserva,
  createGasto, deleteGasto,
  createFechaBloqueada, deleteFechaBloqueada,
} from './api'

const NAV_ITEMS = [
  { id: 'finanzas', label: 'Resumen', icon: IcoChart },
  { id: 'reservas', label: 'Reservas', icon: IcoClipboard },
  { id: 'calendario', label: 'Disponibilidad', icon: IcoCalendar },
]

function Admin() {
  const addToast = useToast()
  const [reservas, setReservas] = useState([])
  const [gastos, setGastos] = useState([])
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [procesandoId, setProcesandoId] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('finanzas')
  const [sesion, setSesion] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authCargando, setAuthCargando] = useState(false)
  const [nuevoGasto, setNuevoGasto] = useState({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd') })
  const [guardandoGasto, setGuardandoGasto] = useState(false)
  const [fechaBloquear, setFechaBloquear] = useState(null)
  const [motivoBloqueo, setMotivoBloqueo] = useState('')
  const [bloqueando, setBloqueando] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin_session')
    if (stored) {
      try {
        const s = JSON.parse(stored)
        if (s.expires > Date.now()) setSesion(s)
        else localStorage.removeItem('admin_session')
      } catch { localStorage.removeItem('admin_session') }
    }
    setCargando(false)
  }, [])

  useEffect(() => { if (sesion) cargarDatos() }, [sesion])

  async function cargarDatos() {
    try {
      const [r, g, fb] = await Promise.all([getReservas(), getGastos(), getFechasBloqueadas()])
      setReservas(r || []); setGastos(g || []); setFechasBloqueadas(fb || [])
    } catch (err) { addToast('Error cargando datos: ' + err.message, 'error') }
    setCargando(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { addToast('Ingresa email y contraseña.', 'warning'); return }
    setAuthCargando(true)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'adminLogin', data: { email, password } }),
      })
      const json = await res.json()
      if (!res.ok) { addToast(json.error || 'Credenciales incorrectas', 'error'); setAuthCargando(false); return }
      const session = { email: json.user.email, expires: Date.now() + 86400000 * 3 }
      localStorage.setItem('admin_session', JSON.stringify(session))
      setSesion(session)
      addToast('Sesión iniciada.', 'success')
    } catch { addToast('Error de conexión', 'error') }
    setAuthCargando(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    setSesion(null)
    addToast('Sesión cerrada.', 'info')
  }

  async function bloquearFecha(e) {
    e.preventDefault()
    if (!fechaBloquear || !motivoBloqueo) { addToast('Selecciona fecha y motivo.', 'warning'); return }
    setBloqueando(true)
    try {
      await createFechaBloqueada(format(fechaBloquear, 'yyyy-MM-dd'), motivoBloqueo)
      addToast('Fecha bloqueada.', 'success')
      setFechaBloquear(null); setMotivoBloqueo('')
      setFechasBloqueadas((await getFechasBloqueadas()) || [])
    } catch (err) { addToast('Error: ' + err.message, 'error') }
    setBloqueando(false)
  }

  async function desbloquearFecha(id) {
    try { await deleteFechaBloqueada(id); addToast('Fecha desbloqueada.', 'success'); setFechasBloqueadas((await getFechasBloqueadas()) || []) }
    catch (err) { addToast('Error al desbloquear', 'error') }
  }

  async function confirmarReserva(id) {
    setProcesandoId(id)
    try {
      await updateReservaEstado(id, 'Confirmado')
      const reserva = reservas.find(r => r.id === id)
      try {
        await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'sendApprovalEmail', data: { nombre_cliente: reserva.nombre_cliente, email_cliente: reserva.email_cliente, fecha_evento: reserva.fecha_evento, total_cotizado: reserva.total_cotizado } }),
        })
      } catch (_) {}
      if (reserva.telefono_cliente) { window.open(`https://wa.me/${reserva.telefono_cliente.replace(/\D/g, '')}?text=${encodeURIComponent('*RESERVA APROBADA*\n\nHola ' + reserva.nombre_cliente + ', tu reserva en Piscina Oasis ha sido confirmada.\n\nFecha: ' + reserva.fecha_evento + '\nTotal: $' + reserva.total_cotizado?.toLocaleString('es-CL') + '\n\nNos vemos pronto!')}`, '_blank') }
      addToast('Reserva confirmada. Correo + WhatsApp enviados.', 'success')
      setReservas((await getReservas()) || [])
    } catch (err) { addToast('Error: ' + err.message, 'error') }
    setProcesandoId(null)
  }

  async function eliminarReserva(id) {
    try { await deleteReserva(id); addToast('Reserva eliminada.', 'info'); setReservas((await getReservas()) || []) }
    catch (err) { addToast('Error al eliminar', 'error') }
  }

  async function agregarGasto(e) {
    e.preventDefault()
    if (!nuevoGasto.descripcion || !nuevoGasto.monto) { addToast('Completa todos los campos.', 'warning'); return }
    setGuardandoGasto(true)
    try {
      await createGasto({ descripcion: nuevoGasto.descripcion, monto: parseInt(nuevoGasto.monto), fecha: nuevoGasto.fecha })
      setNuevoGasto({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd') })
      setGastos((await getGastos()) || []); addToast('Gasto registrado.', 'success')
    } catch (err) { addToast('Error: ' + err.message, 'error') }
    setGuardandoGasto(false)
  }

  async function eliminarGasto(id) {
    try { await deleteGasto(id); addToast('Gasto eliminado.', 'info'); setGastos((await getGastos()) || []) }
    catch (err) { addToast('Error al eliminar gasto', 'error') }
  }

  const reservasConfirmadas = reservas.filter(r => r.estado === 'Confirmado')
  const totalIngresos = reservasConfirmadas.reduce((sum, r) => sum + (r.total_cotizado || 0), 0)
  const totalGastos = gastos.reduce((sum, g) => sum + (g.monto || 0), 0)
  const balance = totalIngresos - totalGastos
  const maxGasto = Math.max(...gastos.map(g => g.monto || 0), 1)

  function exportarCSV() {
    let csv = 'TIPO,FECHA,DESCRIPCIÓN,MONTO\n'
    reservasConfirmadas.forEach(r => { csv += `Ingreso,${r.fecha_evento},"${r.nombre_cliente}",${r.total_cotizado}\n` })
    gastos.forEach(g => { csv += `Gasto,${g.fecha},"${g.descripcion}",-${g.monto}\n` })
    csv += `\n,,TOTAL INGRESOS,${totalIngresos}\n,,TOTAL GASTOS,-${totalGastos}\n,,BALANCE FINAL,${balance}\n`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `finanzas_${format(new Date(), 'yyyy-MM-dd')}.csv`; link.click()
    addToast('CSV descargado.', 'success')
  }

  const fechasConfirmadasCal = reservas.filter(r => r.estado === 'Confirmado').map(r => ({ fecha: startOfDay(parseISO(r.fecha_evento)), cliente: r.nombre_cliente }))
  const fechasPendientesCal = reservas.filter(r => r.estado === 'Pendiente').map(r => ({ fecha: startOfDay(parseISO(r.fecha_evento)), cliente: r.nombre_cliente }))
  const fechasBloqueadasCal = fechasBloqueadas.map(f => ({ fecha: startOfDay(parseISO(f.fecha)), motivo: f.motivo }))

  if (!sesion) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-brand-night">
        <div className="absolute inset-0 opacity-15">
          <img src="/hero_oasis_1777577991129.png" alt="" className="w-full h-full object-cover object-center" onError={(e) => e.target.src = "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"} />
        </div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-teal/5 rounded-full blur-[100px]" />
        <form onSubmit={handleLogin} className="relative z-10 glass-light p-10 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-scaleIn">
          <div className="text-center mb-8">
            <div className="mb-4 animate-float-slow inline-flex"><IcoPalm className="w-12 h-12 text-brand-teal" /></div>
            <h2 className="text-3xl font-serif font-black mb-1 text-brand-night">Piscina Oasis</h2>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Portal Administrativo</p>
          </div>
          <div className="space-y-4 mb-6">
            <input type="email" placeholder="Correo electrónico" className="input-white text-center" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            <input type="password" placeholder="Contraseña" className="input-white text-center" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={authCargando} className="btn-primary w-full text-center justify-center py-4">{authCargando ? 'Ingresando...' : 'Ingresar al Panel'}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream flex flex-col md:flex-row font-sans text-brand-dark">
      <aside className="hidden md:flex w-64 glass-dark flex-col sticky top-0 h-screen z-10">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-xl font-serif font-bold text-white tracking-wide">Piscina Oasis</h1>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mt-1">Gestión de Eventos</p>
        </div>
        <div className="px-6 py-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-dark flex items-center justify-center text-brand-night font-bold text-sm">{sesion.email?.charAt(0).toUpperCase() || 'A'}</div>
          <div className="truncate"><p className="text-sm font-bold text-white truncate">{sesion.email}</p><button onClick={handleLogout} className="text-xs text-white/30 hover:text-brand-rose transition cursor-pointer">Cerrar Sesión</button></div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {NAV_ITEMS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setVistaActiva(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${vistaActiva === tab.id ? 'bg-brand-gold/20 text-brand-gold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/5"><button onClick={exportarCSV} className="w-full glass text-white/50 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer"><IcoDownload className="w-4 h-4" /> Exportar CSV</button></div>
      </aside>

      <main className="flex-1 p-4 md:p-10 pb-28 md:pb-10 h-screen overflow-y-auto">
        <div className="flex md:hidden items-center justify-between mb-6">
          <div><h1 className="text-xl font-serif font-bold text-brand-dark">Piscina Oasis</h1><p className="text-xs text-brand-muted">{sesion.email}</p></div>
          <button onClick={handleLogout} className="text-xs text-brand-muted hover:text-brand-rose transition cursor-pointer">Salir</button>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark mb-2">
            {vistaActiva === 'finanzas' && 'Resumen Financiero'}
            {vistaActiva === 'reservas' && 'Gestión de Reservas'}
            {vistaActiva === 'calendario' && 'Disponibilidad y Calendario'}
          </h2>
        </div>

        {vistaActiva === 'finanzas' && (
          <div className="space-y-8 max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="glass-light rounded-3xl p-7 relative overflow-hidden hover-lift"><div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" /><p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Ingresos</p><p className="text-3xl font-serif font-bold text-brand-dark">${totalIngresos.toLocaleString('es-CL')}</p><div className="mt-3"><span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{reservasConfirmadas.length} confirmadas</span></div></div>
              <div className="glass-light rounded-3xl p-7 relative overflow-hidden hover-lift"><div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full" /><p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Gastos</p><p className="text-3xl font-serif font-bold text-brand-dark">${totalGastos.toLocaleString('es-CL')}</p><div className="mt-3"><span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{gastos.length} registros</span></div></div>
              <div className="glass-gold rounded-3xl p-7 relative overflow-hidden hover-lift"><p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-2">Balance</p><p className="text-3xl font-serif font-bold text-brand-night">${balance.toLocaleString('es-CL')}</p><div className="mt-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${balance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{balance >= 0 ? '+ Positivo' : '- Negativo'}</span></div></div>
            </div>
            {gastos.length > 0 && (
              <div className="glass-light rounded-3xl p-7">
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-5">Distribución de Gastos</h3>
                <div className="space-y-3">
                  {gastos.slice(0, 8).map(g => {
                    const pct = Math.round(((g.monto || 0) / maxGasto) * 100)
                    return (
                      <div key={g.id} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-brand-muted w-16 shrink-0">{g.fecha?.slice(5)}</span>
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-dark rounded-full transition-all duration-1000 flex items-center justify-end px-3" style={{ width: `${Math.max(pct, 5)}%` }}>
                            <span className="text-xs font-bold text-brand-night truncate">{g.descripcion}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-muted w-20 text-right shrink-0">${g.monto?.toLocaleString('es-CL')}</span>
                        <button onClick={() => eliminarGasto(g.id)} className="text-red-300 hover:text-red-500 shrink-0 cursor-pointer p-1"><IcoTrash className="w-4 h-4" /></button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="glass-light rounded-3xl p-7">
              <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Registrar Gasto</h3>
              <form onSubmit={agregarGasto} className="flex flex-col sm:flex-row gap-3">
                <input type="date" value={nuevoGasto.fecha} onChange={e => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })} className="input-white text-sm flex-1" required />
                <input type="text" placeholder="Descripción" value={nuevoGasto.descripcion} onChange={e => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })} className="input-white text-sm flex-1" required />
                <input type="number" placeholder="Monto $" value={nuevoGasto.monto} onChange={e => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })} className="input-white text-sm w-full sm:w-28" required min="1" />
                <button type="submit" disabled={guardandoGasto} className="btn-primary text-sm px-6 py-3 whitespace-nowrap">{guardandoGasto ? '...' : 'Agregar'}</button>
              </form>
            </div>
          </div>
        )}

        {vistaActiva === 'reservas' && (
          <div className="glass-light rounded-3xl p-4 md:p-8 max-w-6xl">
            {cargando ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b-2 border-gray-100"><th className="pb-4 font-bold text-brand-muted text-xs uppercase tracking-wider">Cliente</th><th className="pb-4 font-bold text-brand-muted text-xs uppercase tracking-wider hidden sm:table-cell">Contacto</th><th className="pb-4 font-bold text-brand-muted text-xs uppercase tracking-wider">Fecha</th><th className="pb-4 font-bold text-brand-muted text-xs uppercase tracking-wider text-right">Total</th><th className="pb-4 font-bold text-brand-muted text-xs uppercase tracking-wider text-center">Estado</th><th className="pb-4 font-bold text-brand-muted text-xs uppercase tracking-wider text-right">Acción</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservas.length === 0 ? <tr><td colSpan="6" className="py-12 text-center text-brand-muted italic">No hay reservas.</td></tr> : (
                      reservas.map(r => (
                        <tr key={r.id} className="hover:bg-brand-gold/5 transition-colors group">
                          <td className="py-4 pr-4"><div className="font-semibold text-brand-dark text-sm">{r.nombre_cliente}</div><div className="text-xs text-brand-muted md:hidden">{r.email_cliente}</div></td>
                          <td className="py-4 pr-4 hidden sm:table-cell"><div className="text-xs text-brand-muted">{r.email_cliente}</div><div className="text-xs text-brand-muted">{r.telefono_cliente}</div></td>
                          <td className="py-4 text-sm text-brand-dark font-medium whitespace-nowrap">{r.fecha_evento}</td>
                          <td className="py-4 text-sm font-bold text-brand-teal text-right whitespace-nowrap">${r.total_cotizado?.toLocaleString('es-CL')}</td>
                          <td className="py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${r.estado === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}><span className={`w-1.5 h-1.5 rounded-full ${r.estado === 'Confirmado' ? 'bg-emerald-500' : 'bg-orange-500'}`} />{r.estado}</span></td>
                          <td className="py-4 text-right"><div className="flex gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity">{r.estado !== 'Confirmado' && <button onClick={() => confirmarReserva(r.id)} disabled={procesandoId === r.id} className="bg-gradient-to-r from-brand-teal to-brand-teal-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:shadow-lg transition-all cursor-pointer">Aprobar</button>}<button onClick={() => eliminarReserva(r.id)} disabled={procesandoId === r.id} className="glass-light text-brand-rose px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition-all cursor-pointer">Eliminar</button></div></td>
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
            <div className="glass-light rounded-3xl p-7">
              <h3 className="text-lg font-serif font-bold text-brand-dark mb-6">Calendario</h3>
              <div className="flex flex-wrap gap-4 mb-6">
                {[{ color: 'bg-emerald-500', label: 'Confirmada' }, { color: 'bg-orange-500', label: 'Pendiente' }, { color: 'bg-brand-night', label: 'Bloqueada' }].map((item, i) => (
                  <div key={i} className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${item.color}`} /><span className="text-xs font-semibold text-brand-muted">{item.label}</span></div>
                ))}
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-center shadow-sm"><DatePicker inline locale={es} readOnly dayClassName={date => { const d = startOfDay(date); if (fechasBloqueadasCal.some(f => isSameDay(f.fecha, d))) return 'cal-bloqueada'; if (fechasConfirmadasCal.some(f => isSameDay(f.fecha, d))) return 'cal-confirmada'; if (fechasPendientesCal.some(f => isSameDay(f.fecha, d))) return 'cal-pendiente'; if (d >= startOfDay(new Date())) return 'cal-libre'; return undefined }} /></div>
            </div>
            <div className="space-y-8">
              <div className="glass-light rounded-3xl p-7">
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Bloquear Fechas</h3>
                <p className="text-xs text-brand-muted mb-6">Evita reservas en días específicos.</p>
                <form onSubmit={bloquearFecha} className="flex flex-col gap-4">
                  <DatePicker selected={fechaBloquear} onChange={d => setFechaBloquear(d)} minDate={new Date()} locale={es} placeholderText="Seleccionar Fecha" className="input-white text-sm" dateFormat="dd/MM/yyyy" />
                  <input type="text" placeholder="Razón (ej. Mantención)" value={motivoBloqueo} onChange={e => setMotivoBloqueo(e.target.value)} className="input-white text-sm" required />
                  <button type="submit" disabled={bloqueando} className="btn-primary py-3.5 w-full justify-center text-sm">{bloqueando ? 'Procesando...' : 'Bloquear Fecha'}</button>
                </form>
              </div>
              <div className="glass-light rounded-3xl p-7">
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Bloqueos Activos</h3>
                <div className="space-y-3">
                  {fechasBloqueadas.length === 0 ? <p className="text-sm text-brand-muted">Sin bloqueos activos.</p> : fechasBloqueadas.map(fb => (
                    <div key={fb.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover-lift"><div><p className="text-sm font-bold text-brand-dark">{fb.fecha}</p><p className="text-xs text-brand-muted">{fb.motivo}</p></div><button onClick={() => desbloquearFecha(fb.id)} className="text-xs font-bold text-brand-teal hover:text-brand-teal-dark transition cursor-pointer">Desbloquear</button></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-dark z-50 safe-area-bottom border-t border-white/5">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setVistaActiva(tab.id)} className={`flex flex-col items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${vistaActiva === tab.id ? 'text-brand-gold' : 'text-white/40 hover:text-white'}`}>
                <Icon className="w-5 h-5 mb-1" />{tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Admin
