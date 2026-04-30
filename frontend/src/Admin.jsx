import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import emailjs from '@emailjs/browser'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format, parseISO, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

function Admin() {
    // --- ESTADOS GENERALES ---
    const [reservas, setReservas] = useState([])
    const [gastos, setGastos] = useState([])
    const [fechasBloqueadas, setFechasBloqueadas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [procesandoId, setProcesandoId] = useState(null)
    const [vistaActiva, setVistaActiva] = useState('reservas')

    // Estados para seguridad
    const [autorizado, setAutorizado] = useState(false)
    const [password, setPassword] = useState('')

    // Estados para el formulario de gastos
    const [nuevoGasto, setNuevoGasto] = useState({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd') })
    const [guardandoGasto, setGuardandoGasto] = useState(false)

    // Estados para bloqueo de fechas
    const [fechaBloquear, setFechaBloquear] = useState(null)
    const [motivoBloqueo, setMotivoBloqueo] = useState('')
    const [bloqueando, setBloqueando] = useState(false)

    // =============================================
    // LÓGICA DE AUTENTICACIÓN Y CARGA DE DATOS
    // =============================================
    const verificarAcceso = (e) => {
        e.preventDefault()
        if (password === 'MiClaveSegura2026') {
            setAutorizado(true)
        } else {
            alert('Clave incorrecta ❌')
        }
    }

    useEffect(() => {
        if (autorizado) {
            obtenerReservas()
            obtenerGastos()
            obtenerFechasBloqueadas()
        }
    }, [autorizado])

    async function obtenerReservas() {
        setCargando(true)
        const { data, error } = await supabase
            .from('reservas')
            .select('*')
            .order('fecha_evento', { ascending: true })
        if (!error) setReservas(data)
        setCargando(false)
    }

    async function obtenerGastos() {
        const { data, error } = await supabase
            .from('gastos')
            .select('*')
            .order('fecha', { ascending: false })
        if (!error) setGastos(data)
    }

    async function obtenerFechasBloqueadas() {
        const { data, error } = await supabase
            .from('fechas_bloqueadas')
            .select('*')
            .order('fecha', { ascending: true })
        if (!error) setFechasBloqueadas(data)
    }

    // =============================================
    // FUNCIONES DE BLOQUEO DE FECHAS
    // =============================================
    async function bloquearFecha(e) {
        e.preventDefault()
        if (!fechaBloquear || !motivoBloqueo) return alert('Selecciona una fecha y escribe un motivo.')
        setBloqueando(true)

        const fechaFormateada = format(fechaBloquear, 'yyyy-MM-dd')
        const { error } = await supabase.from('fechas_bloqueadas').insert([{
            fecha: fechaFormateada,
            motivo: motivoBloqueo
        }])

        if (error) {
            alert('Error al bloquear fecha: ' + error.message)
        } else {
            setFechaBloquear(null)
            setMotivoBloqueo('')
            obtenerFechasBloqueadas()
        }
        setBloqueando(false)
    }

    async function desbloquearFecha(id) {
        if (window.confirm('¿Desbloquear esta fecha?')) {
            const { error } = await supabase.from('fechas_bloqueadas').delete().eq('id', id)
            if (error) alert('Error al desbloquear')
            else obtenerFechasBloqueadas()
        }
    }
    // =============================================
    // FUNCIONES DE RESERVAS
    // =============================================
    async function confirmarReserva(id) {
        setProcesandoId(id)
        const { error } = await supabase
            .from('reservas')
            .update({ estado: 'Confirmado' })
            .eq('id', id)

        if (error) {
            alert("Error al confirmar en base de datos")
            setProcesandoId(null)
            return
        }

        const reserva = reservas.find(r => r.id === id)

        // 1. Enviar correo de aprobación
        try {
            const templateParams = {
                to_email: reserva.email_cliente,
                name: reserva.nombre_cliente,
                nombre: reserva.nombre_cliente,
                tiempo: format(new Date(), "dd/MM/yyyy - HH:mm"),
                mensaje: `¡Excelentes noticias! Tu reserva para el día ${reserva.fecha_evento} en Parcela Eventos ha sido APROBADA oficialmente por la administración. Nos pondremos en contacto contigo pronto para coordinar los últimos detalles. ¡Te esperamos!`
            }
            await emailjs.send('service_tjd2r29', 'template_ltw5nof', templateParams, 'MdyzbhdKI-h1W0Wtb')
        } catch (mailError) {
            console.error("Error al enviar correo de aprobación:", mailError)
        }

        // 2. Abrir WhatsApp con mensaje de confirmación
        if (reserva.telefono_cliente) {
            const telefono = reserva.telefono_cliente.replace(/\D/g, '') // Limpiar a solo números
            const mensajeWsp = encodeURIComponent(
                `🎉 *¡RESERVA APROBADA!* 🎉\n\n` +
                `Hola *${reserva.nombre_cliente}*, te informamos que tu reserva en *Parcela Eventos* ha sido confirmada exitosamente.\n\n` +
                `📅 *Fecha:* ${reserva.fecha_evento}\n` +
                `💰 *Total:* $${reserva.total_cotizado?.toLocaleString('es-CL')} CLP\n\n` +
                `Recuerda revisar el contrato que enviamos a tu correo, firmarlo y reenviárnoslo para dejar todo en orden.\n\n` +
                `¡Nos vemos pronto! 🏡✨`
            )
            window.open(`https://wa.me/${telefono}?text=${mensajeWsp}`, '_blank')
        }

        alert("Reserva confirmada. Correo enviado y WhatsApp listo para enviar.")
        setProcesandoId(null)
        obtenerReservas()
    }

    async function eliminarReserva(id) {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
            const { error } = await supabase.from('reservas').delete().eq('id', id)
            if (error) alert("Error al eliminar")
            else obtenerReservas()
        }
    }

    // =============================================
    // FUNCIONES DE GASTOS
    // =============================================
    async function agregarGasto(e) {
        e.preventDefault()
        if (!nuevoGasto.descripcion || !nuevoGasto.monto) return alert("Completa todos los campos del gasto.")
        setGuardandoGasto(true)

        const { error } = await supabase.from('gastos').insert([{
            descripcion: nuevoGasto.descripcion,
            monto: parseInt(nuevoGasto.monto),
            fecha: nuevoGasto.fecha
        }])

        if (error) {
            alert("Error al guardar gasto: " + error.message)
        } else {
            setNuevoGasto({ descripcion: '', monto: '', fecha: format(new Date(), 'yyyy-MM-dd') })
            obtenerGastos()
        }
        setGuardandoGasto(false)
    }

    async function eliminarGasto(id) {
        if (window.confirm("¿Eliminar este gasto?")) {
            const { error } = await supabase.from('gastos').delete().eq('id', id)
            if (error) alert("Error al eliminar gasto")
            else obtenerGastos()
        }
    }

    // =============================================
    // CÁLCULOS FINANCIEROS
    // =============================================
    const reservasConfirmadas = reservas.filter(r => r.estado === 'Confirmado')
    const totalIngresos = reservasConfirmadas.reduce((sum, r) => sum + (r.total_cotizado || 0), 0)
    const totalGastos = gastos.reduce((sum, g) => sum + (g.monto || 0), 0)
    const balance = totalIngresos - totalGastos

    // =============================================
    // EXPORTAR CSV
    // =============================================
    function exportarCSV() {
        let csv = 'TIPO,FECHA,DESCRIPCIÓN,MONTO\n'

        // Ingresos
        reservasConfirmadas.forEach(r => {
            csv += `Ingreso,${r.fecha_evento},"${r.nombre_cliente} - Reserva",${r.total_cotizado}\n`
        })

        // Gastos
        gastos.forEach(g => {
            csv += `Gasto,${g.fecha},"${g.descripcion}",-${g.monto}\n`
        })

        // Resumen
        csv += `\n,,TOTAL INGRESOS,${totalIngresos}\n`
        csv += `,,TOTAL GASTOS,-${totalGastos}\n`
        csv += `,,BALANCE FINAL,${balance}\n`

        // Descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `finanzas_parcela_${format(new Date(), 'yyyy-MM-dd')}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    // =============================================
    // DATOS PARA EL CALENDARIO
    // =============================================
    const fechasConfirmadas = reservas
        .filter(r => r.estado === 'Confirmado')
        .map(r => ({ fecha: startOfDay(parseISO(r.fecha_evento)), cliente: r.nombre_cliente }))

    const fechasPendientes = reservas
        .filter(r => r.estado === 'Pendiente')
        .map(r => ({ fecha: startOfDay(parseISO(r.fecha_evento)), cliente: r.nombre_cliente }))

    const fechasBloqueadasCal = fechasBloqueadas.map(f => ({
        fecha: startOfDay(parseISO(f.fecha)),
        motivo: f.motivo
    }))

    // =============================================
    // VISTA DE LOGIN
    // =============================================
    if (!autorizado) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero_oasis_1777577991129.png" 
                        alt="Oasis Background" 
                        className="w-full h-full object-cover object-center filter blur-[6px] scale-105"
                        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
                    />
                    <div className="absolute inset-0 bg-brand-dark/50 mix-blend-multiply"></div>
                </div>

                <form onSubmit={verificarAcceso} className="relative z-10 bg-white/85 backdrop-blur-xl border border-white/50 p-10 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center transform transition-all duration-700 animate-slideUp">
                    <div className="mb-6 text-6xl drop-shadow-md">🌴</div>
                    <h2 className="text-3xl font-serif font-black mb-2 text-brand-dark tracking-tight">Piscina Oasis</h2>
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-10">Portal Administrativo</p>
                    
                    <div className="relative mb-8">
                        <input
                            type="password"
                            placeholder="Introduce tu clave"
                            className="w-full p-4 bg-white/70 border-2 border-brand-primary/10 rounded-2xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 text-center font-bold text-lg text-brand-dark transition-all placeholder:font-normal placeholder:text-gray-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <button className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-primary transition-all duration-300 shadow-xl hover:shadow-cyan-500/30 flex justify-center items-center gap-3 group">
                        Ingresar al Panel <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
                    </button>
                    
                    <p className="text-xs font-medium text-brand-muted mt-8">
                        Acceso restringido a personal autorizado.
                    </p>
                </form>
            </div>
        )
    }

    // =============================================
    // VISTA PRINCIPAL DEL PANEL
    // =============================================
    // =============================================
    // VISTA PRINCIPAL DEL PANEL
    // =============================================
    return (
        <div className="min-h-screen bg-brand-light flex font-sans text-brand-text">
            <style>{`
                .react-datepicker { border: none !important; font-size: 0.9rem !important; font-family: 'Inter', sans-serif !important; }
                .react-datepicker__header { background: white !important; border-bottom: 1px solid #f1f5f9 !important; }
                .react-datepicker__day { width: 2rem !important; line-height: 2rem !important; border-radius: 6px !important; margin: 2px !important; }
                .cal-confirmada { background-color: #10b981 !important; color: white !important; }
                .cal-pendiente { background-color: #f59e0b !important; color: white !important; }
                .cal-libre { background-color: #fdfbf7 !important; color: #64748b !important; }
                .cal-bloqueada { background-color: #0f3d3e !important; color: white !important; text-decoration: line-through !important; }
                .glass-sidebar { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-right: 1px solid rgba(255, 255, 255, 0.5); }
                .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            `}</style>

            {/* SIDEBAR */}
            <aside className="w-64 glass-sidebar hidden md:flex flex-col sticky top-0 h-screen z-10">
                <div className="p-8">
                    <h1 className="text-2xl font-serif font-bold text-brand-dark tracking-wide">Piscina Oasis</h1>
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest mt-1">Gestión de Eventos</p>
                </div>

                <div className="px-6 flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold">A</div>
                    <div>
                        <p className="text-sm font-bold text-brand-dark">Panel Admin</p>
                        <button onClick={() => setAutorizado(false)} className="text-xs text-brand-muted hover:text-red-500 transition">Cerrar Sesión</button>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'finanzas', label: 'Resumen', icon: '📊' },
                        { id: 'reservas', label: 'Reservas', icon: '📋' },
                        { id: 'calendario', label: 'Disponibilidad', icon: '📅' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setVistaActiva(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                vistaActiva === tab.id
                                    ? 'bg-brand-primary/10 text-brand-primary'
                                    : 'text-brand-muted hover:bg-white hover:text-brand-dark'
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8 md:p-12 h-screen overflow-y-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-brand-dark mb-2">
                            {vistaActiva === 'finanzas' && 'Resumen Financiero'}
                            {vistaActiva === 'reservas' && 'Gestión de Reservas'}
                            {vistaActiva === 'calendario' && 'Disponibilidad y Calendario'}
                        </h2>
                        <p className="text-brand-muted text-sm font-light">
                            {vistaActiva === 'finanzas' && "Aquí tienes el estado actual del Oasis el día de hoy."}
                            {vistaActiva === 'reservas' && "Revisa y administra las solicitudes de eventos."}
                            {vistaActiva === 'calendario' && "Gestiona fechas libres y bloquea días por mantención."}
                        </p>
                    </div>
                    
                    {vistaActiva === 'finanzas' && (
                        <button onClick={exportarCSV} className="bg-white border border-brand-primary/20 text-brand-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-primary/5 transition shadow-sm flex items-center gap-2">
                            <span>📥</span> Exportar Reporte
                        </button>
                    )}
                </div>

                {/* ============================== */}
                {/* TAB 1: FINANZAS / DASHBOARD    */}
                {/* ============================== */}
                {vistaActiva === 'finanzas' && (
                    <div className="space-y-8 max-w-6xl">
                        {/* RESUMEN FINANCIERO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-full -mr-4 -mt-4"></div>
                                <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Total Ingresos</p>
                                <p className="text-4xl font-serif font-bold text-brand-dark">${totalIngresos.toLocaleString('es-CL')}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{reservasConfirmadas.length} confirmadas</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                                <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">Total Gastos</p>
                                <p className="text-4xl font-serif font-bold text-brand-dark">${totalGastos.toLocaleString('es-CL')}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{gastos.length} registros</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-3xl p-8 relative overflow-hidden bg-brand-primary text-white">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -mr-4 -mt-4"></div>
                                <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-2">Balance Est.</p>
                                <p className="text-4xl font-serif font-bold text-white">${balance.toLocaleString('es-CL')}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                                    <span className="bg-white/20 text-white px-2 py-1 rounded-full">+ Saldo Neto</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* TABLA DE INGRESOS (RECENT ACTIONS) */}
                            <div className="glass-card rounded-3xl p-8">
                                <h3 className="text-lg font-serif font-bold text-brand-dark mb-6">Últimas Reservas</h3>
                                <div className="space-y-4">
                                    {reservasConfirmadas.slice(0, 5).map(r => (
                                        <div key={r.id} className="flex items-center justify-between border-b border-brand-primary/10 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                                    {r.nombre_cliente.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-brand-dark">{r.nombre_cliente}</p>
                                                    <p className="text-xs text-brand-muted">{r.fecha_evento}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-brand-primary">${r.total_cotizado?.toLocaleString('es-CL')}</p>
                                        </div>
                                    ))}
                                    {reservasConfirmadas.length === 0 && <p className="text-sm text-brand-muted">No hay reservas recientes.</p>}
                                </div>
                            </div>

                            {/* FORMULARIO + TABLA DE GASTOS */}
                            <div className="glass-card rounded-3xl p-8">
                                <h3 className="text-lg font-serif font-bold text-brand-dark mb-6">Gastos de Mantención</h3>

                                <form onSubmit={agregarGasto} className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <input type="date" value={nuevoGasto.fecha} onChange={e => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-accent flex-1" required />
                                    <input type="text" placeholder="Descripción" value={nuevoGasto.descripcion} onChange={e => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-accent flex-1" required />
                                    <input type="number" placeholder="Monto $" value={nuevoGasto.monto} onChange={e => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })} className="w-24 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-accent" required min="1" />
                                    <button type="submit" disabled={guardandoGasto} className="bg-brand-dark text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-brand-primary transition disabled:opacity-50">+</button>
                                </form>

                                <div className="space-y-4">
                                    {gastos.slice(0, 5).map(g => (
                                        <div key={g.id} className="flex items-center justify-between border-b border-brand-primary/10 pb-4">
                                            <div>
                                                <p className="text-sm font-semibold text-brand-dark">{g.descripcion}</p>
                                                <p className="text-xs text-brand-muted">{g.fecha}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm font-bold text-orange-500">-${g.monto?.toLocaleString('es-CL')}</p>
                                                <button onClick={() => eliminarGasto(g.id)} className="text-red-400 hover:text-red-600">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                    {gastos.length === 0 && <p className="text-sm text-brand-muted">Sin gastos registrados.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================== */}
                {/* TAB 2: RESERVAS                */}
                {/* ============================== */}
                {vistaActiva === 'reservas' && (
                    <div className="glass-card rounded-3xl p-8 max-w-6xl">
                        {cargando ? (
                            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-brand-light">
                                            <th className="pb-4 font-semibold text-brand-muted text-sm uppercase tracking-wider">Detalles del Cliente</th>
                                            <th className="pb-4 font-semibold text-brand-muted text-sm uppercase tracking-wider">Fecha de Evento</th>
                                            <th className="pb-4 font-semibold text-brand-muted text-sm uppercase tracking-wider">Total Est.</th>
                                            <th className="pb-4 font-semibold text-brand-muted text-sm uppercase tracking-wider">Estado</th>
                                            <th className="pb-4 font-semibold text-brand-muted text-sm uppercase tracking-wider text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-light/50">
                                        {reservas.length === 0 ? (
                                            <tr><td colSpan="5" className="py-10 text-center text-brand-muted italic">No hay reservas encontradas.</td></tr>
                                        ) : (
                                            reservas.map((reserva) => (
                                                <tr key={reserva.id} className="hover:bg-brand-primary/5 transition-colors group">
                                                    <td className="py-4 pr-4">
                                                        <div className="font-semibold text-brand-dark">{reserva.nombre_cliente}</div>
                                                        <div className="text-xs text-brand-muted">{reserva.email_cliente} • {reserva.telefono_cliente}</div>
                                                    </td>
                                                    <td className="py-4 text-sm text-brand-dark font-medium">{reserva.fecha_evento}</td>
                                                    <td className="py-4 text-sm font-bold text-brand-primary">
                                                        ${reserva.total_cotizado?.toLocaleString('es-CL')}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                                            reserva.estado === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${reserva.estado === 'Confirmado' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                                                            {reserva.estado}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {reserva.estado !== 'Confirmado' && (
                                                                <button
                                                                    onClick={() => confirmarReserva(reserva.id)}
                                                                    disabled={procesandoId === reserva.id}
                                                                    className={`text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                        procesandoId === reserva.id ? 'bg-emerald-300' : 'bg-brand-primary hover:bg-brand-dark'
                                                                    }`}
                                                                >
                                                                    Confirmar
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => eliminarReserva(reserva.id)}
                                                                disabled={procesandoId === reserva.id}
                                                                className="bg-white border border-gray-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                Rechazar
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

                {/* ============================== */}
                {/* TAB 3: CALENDARIO              */}
                {/* ============================== */}
                {vistaActiva === 'calendario' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
                        
                        <div className="glass-card rounded-3xl p-8">
                            <h3 className="text-lg font-serif font-bold text-brand-dark mb-6">Vista del Calendario</h3>
                            
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-xs font-semibold text-brand-muted">Confirmada</span></div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-xs font-semibold text-brand-muted">Pendiente</span></div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-dark"></span><span className="text-xs font-semibold text-brand-muted">Bloqueada</span></div>
                            </div>

                            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-center shadow-sm">
                                <DatePicker
                                    inline
                                    locale={es}
                                    readOnly
                                    dayClassName={date => {
                                        const d = startOfDay(date)
                                        if (fechasBloqueadasCal.some(f => isSameDay(f.fecha, d))) return 'cal-bloqueada'
                                        if (fechasConfirmadas.some(f => isSameDay(f.fecha, d))) return 'cal-confirmada'
                                        if (fechasPendientes.some(f => isSameDay(f.fecha, d))) return 'cal-pendiente'
                                        if (d >= startOfDay(new Date())) return 'cal-libre'
                                        return undefined
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="glass-card rounded-3xl p-8">
                                <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Bloquear Fechas</h3>
                                <p className="text-xs text-brand-muted mb-6 line-clamp-2">Evita reservas en días específicos por uso privado o mantención.</p>
                                
                                <form onSubmit={bloquearFecha} className="flex flex-col gap-4">
                                    <DatePicker
                                        selected={fechaBloquear}
                                        onChange={d => setFechaBloquear(d)}
                                        minDate={new Date()}
                                        locale={es}
                                        placeholderText="Seleccionar Fecha"
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-accent"
                                        dateFormat="dd/MM/yyyy"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Razón (ej. Mantención de Piscina)"
                                        value={motivoBloqueo}
                                        onChange={e => setMotivoBloqueo(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-accent"
                                        required
                                    />
                                    <button type="submit" disabled={bloqueando} className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-primary transition">
                                        {bloqueando ? 'Procesando...' : 'Bloquear Fecha'}
                                    </button>
                                </form>
                            </div>

                            <div className="glass-card rounded-3xl p-8">
                                <h3 className="text-lg font-serif font-bold text-brand-dark mb-4">Bloqueos Activos</h3>
                                <div className="space-y-3">
                                    {fechasBloqueadas.map(fb => (
                                        <div key={fb.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                                            <div>
                                                <p className="text-sm font-bold text-brand-dark">{fb.fecha}</p>
                                                <p className="text-xs text-brand-muted">{fb.motivo}</p>
                                            </div>
                                            <button onClick={() => desbloquearFecha(fb.id)} className="text-xs font-bold text-brand-accent hover:text-orange-600">Desbloquear</button>
                                        </div>
                                    ))}
                                    {fechasBloqueadas.length === 0 && <p className="text-sm text-brand-muted">No hay fechas bloqueadas actualmente.</p>}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}

export default Admin