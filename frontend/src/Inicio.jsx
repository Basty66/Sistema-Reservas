import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { parseISO, format, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import emailjs from '@emailjs/browser'
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// --- SERVICIOS ADICIONALES DISPONIBLES ---
const SERVICIOS_ADICIONALES = [
    { id: 'bebestibles', nombre: '🥤 Bebestibles', precio: 45000 },
    { id: 'limpieza', nombre: '🧹 Limpieza Post-Evento', precio: 35000 },
    { id: 'vajilla', nombre: '🍽️ Servicio Platos, Vasos y Cubiertos', precio: 30000 },
    { id: 'candybar', nombre: '🍬 Candy Bar', precio: 60000 },
    { id: 'decoracion', nombre: '🎨 Decoración Temática', precio: 50000 }
]

// --- ESTILOS DEL PDF ---
const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', color: '#1e293b' },
    header: { borderBottom: 2, borderColor: '#2563eb', paddingBottom: 15, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 10, color: '#64748b', marginTop: 4 },
    companyInfo: { textAlign: 'right', fontSize: 9, color: '#475569', lineHeight: 1.4 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: 6, marginBottom: 10, marginTop: 15, color: '#0f172a' },
    row: { flexDirection: 'row', marginBottom: 6 },
    label: { fontSize: 10, color: '#64748b', width: 120, fontWeight: 'bold' },
    value: { fontSize: 10, color: '#0f172a', flex: 1 },
    table: { marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 8 },
    tableHeader: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
    tableCell: { fontSize: 10, color: '#0f172a' },
    totalRow: { backgroundColor: '#eff6ff', padding: 10, flexDirection: 'row', justifyContent: 'flex-end' },
    totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e3a8a', marginRight: 15 },
    totalValue: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
    clauses: { marginTop: 20, fontSize: 8, color: '#475569', lineHeight: 1.5, textAlign: 'justify' },
    signatures: { marginTop: 50, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    signatureBlock: { alignItems: 'center', width: '40%' },
    signatureLine: { borderTopWidth: 1, borderColor: '#0f172a', width: '100%', marginBottom: 5 },
    signatureText: { fontSize: 10, fontWeight: 'bold' },
    signatureSub: { fontSize: 8, color: '#64748b' }
});

// --- COMPONENTE DEL PDF (CON SERVICIOS ADICIONALES) ---
const ContratoPDF = ({ datos, servicios }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* ENCABEZADO */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>CONTRATO DE ARRIENDO</Text>
                    <Text style={styles.subtitle}>DOCUMENTO OFICIAL DE RESERVA</Text>
                </View>
                <View style={styles.companyInfo}>
                    <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>PARCELA EVENTOS</Text>
                    <Text>Las Camelias 123, Villa Alegre</Text>
                    <Text>contacto@parcelaeventos.cl</Text>
                    <Text>+56 9 2812 2947</Text>
                </View>
            </View>

            {/* DATOS DEL ARRENDATARIO */}
            <Text style={styles.sectionTitle}>1. DATOS DEL ARRENDATARIO</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Nombre / Representante:</Text>
                <Text style={styles.value}>{datos.nombre_cliente}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Correo Electrónico:</Text>
                <Text style={styles.value}>{datos.email_cliente}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Teléfono de Contacto:</Text>
                <Text style={styles.value}>{datos.telefono_cliente}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Empresa / Institución:</Text>
                <Text style={styles.value}>{datos.empresa || 'Persona Natural'}</Text>
            </View>

            {/* DETALLES DEL EVENTO */}
            <Text style={styles.sectionTitle}>2. DETALLES DE LA RESERVA</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Fecha del Evento:</Text>
                <Text style={styles.value}>{datos.fecha_evento}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Horario de Arriendo:</Text>
                <Text style={styles.value}>09:00 hrs a 20:00 hrs</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Cantidad de Asistentes:</Text>
                <Text style={styles.value}>Máximo {datos.num_personas} personas permitidas</Text>
            </View>

            {/* COTIZACIÓN CON DESGLOSE */}
            <Text style={styles.sectionTitle}>3. COTIZACIÓN Y PAGOS</Text>
            <View style={styles.table}>
                {/* Cabecera */}
                <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
                    <Text style={[styles.tableHeader, { flex: 3 }]}>Descripción</Text>
                    <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Cantidad</Text>
                    <Text style={[styles.tableHeader, { flex: 1, textAlign: 'right' }]}>Subtotal</Text>
                </View>
                {/* Arriendo base */}
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 3 }]}>Arriendo de Parcela e Instalaciones</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>1</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>${(datos.total_cotizado - servicios.reduce((s, sv) => s + sv.precio, 0)).toLocaleString('es-CL')}</Text>
                </View>
                {/* Servicios adicionales */}
                {servicios.map((srv, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 3 }]}>{srv.nombre}</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>1</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>${srv.precio.toLocaleString('es-CL')}</Text>
                    </View>
                ))}
                {/* Total */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
                    <Text style={styles.totalValue}>${datos.total_cotizado.toLocaleString('es-CL')} CLP</Text>
                </View>
            </View>

            {/* CLÁUSULAS */}
            <Text style={styles.sectionTitle}>4. TÉRMINOS Y CONDICIONES</Text>
            <View style={styles.clauses}>
                <Text style={{ marginBottom: 4 }}>• Para confirmar definitivamente esta reserva y bloquear la fecha, el arrendatario debe transferir el 50% del Total a Pagar en un plazo máximo de 24 horas tras la emisión de este documento.</Text>
                <Text style={{ marginBottom: 4 }}>• El saldo restante (50%) deberá ser cancelado a más tardar 3 días antes de la fecha del evento.</Text>
                <Text style={{ marginBottom: 4 }}>• En caso de cancelación por parte del arrendatario, la reserva del 50% no será reembolsable, quedando como indemnización por perjuicios de fecha perdida.</Text>
                <Text style={{ marginBottom: 4 }}>• El arrendatario se hace responsable por cualquier daño o avería a la infraestructura, piscina, áreas verdes o mobiliario durante su estadía.</Text>
                <Text>• Al firmar este documento, el arrendatario acepta todas las condiciones estipuladas y el reglamento interno de Parcela Eventos.</Text>
            </View>

            {/* FIRMAS */}
            <View style={styles.signatures}>
                <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine}></View>
                    <Text style={styles.signatureText}>FIRMA ARRENDATARIO</Text>
                    <Text style={styles.signatureSub}>{datos.nombre_cliente}</Text>
                    <Text style={styles.signatureSub}>RUT: ___________________</Text>
                </View>
                <View style={styles.signatureBlock}>
                    <View style={styles.signatureLine}></View>
                    <Text style={styles.signatureText}>FIRMA ARRENDADOR</Text>
                    <Text style={styles.signatureSub}>Administración</Text>
                    <Text style={styles.signatureSub}>Parcela Eventos</Text>
                </View>
            </View>
        </Page>
    </Document>
);

function Inicio() {
    const [planes, setPlanes] = useState([])
    const [planSeleccionado, setPlanSeleccionado] = useState(null)
    const [guardando, setGuardando] = useState(false)
    const [numPersonas, setNumPersonas] = useState(50)
    const [datosCliente, setDatosCliente] = useState({ nombre: '', empresa: '', email: '', telefono: '' })
    const [precioFinal, setPrecioFinal] = useState(0)
    const [fechasConfirmadas, setFechasConfirmadas] = useState([])
    const [fechasPendientes, setFechasPendientes] = useState([])
    const [fechasBloqueadas, setFechasBloqueadas] = useState([])
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
    const [datosContacto, setDatosContacto] = useState({ nombre: '', email: '', mensaje: '' })

    // Cargar datos al iniciar
    useEffect(() => {
        async function cargarDatos() {
            const { data: p } = await supabase.from('planes').select('*')
            if (p) setPlanes(p)

            const { data: r } = await supabase.from('reservas').select('fecha_evento, estado')
            if (r) {
                setFechasConfirmadas(r.filter(x => x.estado === 'Confirmado').map(x => startOfDay(parseISO(x.fecha_evento))))
                setFechasPendientes(r.filter(x => x.estado === 'Pendiente').map(x => startOfDay(parseISO(x.fecha_evento))))
            }

            // Cargar fechas bloqueadas por el admin
            const { data: fb } = await supabase.from('fechas_bloqueadas').select('fecha')
            if (fb) setFechasBloqueadas(fb.map(x => startOfDay(parseISO(x.fecha))))
        }
        cargarDatos()
    }, [])

    // Calcular precios extras + servicios
    useEffect(() => {
        if (planSeleccionado) {
            const extraPersonas = Math.max(0, numPersonas - 50) * 5000
            const extraServicios = serviciosSeleccionados.reduce((sum, id) => {
                const srv = SERVICIOS_ADICIONALES.find(s => s.id === id)
                return sum + (srv ? srv.precio : 0)
            }, 0)
            setPrecioFinal(planSeleccionado.precio_base + extraPersonas + extraServicios)
        }
    }, [numPersonas, planSeleccionado, serviciosSeleccionados])

    // Toggle de servicio
    const toggleServicio = (id) => {
        setServiciosSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        )
    }

    // Enviar mensaje de contacto por WhatsApp
    const manejarContacto = (e) => {
        e.preventDefault();
        if (!datosContacto.nombre || !datosContacto.mensaje) {
            return alert("Por favor, ingresa tu nombre y un mensaje.");
        }
        const numeroWhatsApp = "56928122947"; // Número real del administrador
        const texto = `Hola Piscina Oasis! 🌴\nMi nombre es ${datosContacto.nombre}${datosContacto.email ? ` (${datosContacto.email})` : ''}.\n\nTengo la siguiente consulta:\n${datosContacto.mensaje}`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
        setDatosContacto({ nombre: '', email: '', mensaje: '' });
    }

    // --- FUNCIÓN PRINCIPAL DE RESERVA ---
    const manejarReserva = async (e) => {
        e.preventDefault();
        if (!fechaSeleccionada) return alert("Por favor, selecciona una fecha para el evento.");
        if (!datosCliente.nombre || !datosCliente.email || !datosCliente.telefono) return alert("Por favor, ingresa tu nombre, correo y teléfono.");
        setGuardando(true);

        // Obtener nombres de servicios seleccionados
        const nombresServicios = serviciosSeleccionados
            .map(id => SERVICIOS_ADICIONALES.find(s => s.id === id)?.nombre.replace(/^..\s/, ''))
            .join(', ')

        const nuevaReserva = {
            nombre_cliente: datosCliente.nombre,
            email_cliente: datosCliente.email,
            telefono_cliente: datosCliente.telefono,
            empresa: datosCliente.empresa,
            fecha_evento: format(fechaSeleccionada, 'yyyy-MM-dd'),
            total_cotizado: precioFinal,
            num_personas: parseInt(numPersonas),
            estado: 'Pendiente'
        };

        // Servicios seleccionados como objetos completos (para el PDF)
        const serviciosParaPDF = serviciosSeleccionados.map(id =>
            SERVICIOS_ADICIONALES.find(s => s.id === id)
        ).filter(Boolean)

        try {
            // 1. Guardar en Supabase
            const { error: dbError } = await supabase.from('reservas').insert([nuevaReserva]);
            if (dbError) throw new Error("Error guardando en la base de datos: " + dbError.message);

            // 2. Generar el PDF (ahora con servicios)
            const blob = await pdf(<ContratoPDF datos={nuevaReserva} servicios={serviciosParaPDF} />).toBlob();

            // 3. Subir el PDF a Supabase Storage
            const nombreArchivo = `contrato_${datosCliente.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from('contratos')
                .upload(nombreArchivo, blob, {
                    contentType: 'application/pdf',
                    upsert: false
                });
            if (uploadError) throw new Error("Error subiendo el PDF: " + uploadError.message);

            // 4. Obtener la URL pública del PDF
            const { data: urlData } = supabase.storage
                .from('contratos')
                .getPublicUrl(nombreArchivo);
            const enlacePDF = urlData.publicUrl;

            // 5. Enviar correo con el enlace al PDF
            let mensajeServicios = ''
            if (nombresServicios) {
                mensajeServicios = `\n\nServicios adicionales contratados: ${nombresServicios}.`
            }

            const templateParams = {
                to_email: datosCliente.email,
                name: datosCliente.nombre,
                nombre: datosCliente.nombre,
                tiempo: format(new Date(), "dd/MM/yyyy - HH:mm"),
                mensaje: `Tu reserva para el día ${format(fechaSeleccionada, 'dd/MM/yyyy')} ha sido generada exitosamente.${mensajeServicios}\n\nPuedes descargar tu contrato oficial en PDF desde el siguiente enlace:\n${enlacePDF}\n\nPor favor, imprímelo, fírmalo y reenvíanoslo a nuestro correo para confirmar definitivamente tu reserva.`
            };

            await emailjs.send('service_tjd2r29', 'template_5an9t4r', templateParams, 'MdyzbhdKI-h1W0Wtb');

            alert("¡Reserva confirmada! El contrato ha sido enviado al correo.");
            setFechasPendientes(prev => [...prev, startOfDay(fechaSeleccionada)]);

        } catch (err) {
            console.error("Error:", err);
            alert(err.message);
        } finally {
            setPlanSeleccionado(null);
            setGuardando(false);
            setServiciosSeleccionados([]);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light font-sans text-brand-text">
            <style>{`
                .reserva-confirmada { background: #ef4444 !important; color: white !important; }
                .reserva-pendiente { background: #f59e0b !important; color: white !important; }
                .fecha-bloqueada { background: #164e63 !important; color: #94a3b8 !important; text-decoration: line-through !important; cursor: not-allowed !important; }
                .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .glass-modal { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                .react-datepicker { font-family: 'Inter', sans-serif !important; border: none !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; border-radius: 1rem !important; overflow: hidden; }
                .react-datepicker__header { background-color: #f0f9ff !important; border-bottom: 1px solid #bae6fd !important; }
                .react-datepicker__day--selected { background-color: #06b6d4 !important; color: white !important; font-weight: bold !important; }
                .react-datepicker__day:hover { background-color: #f59e0b !important; color: white !important; }
            `}</style>

            {/* NAV BAR */}
            <nav className="absolute top-0 w-full z-10 px-8 py-6 flex justify-between items-center">
                <div className="text-2xl font-serif font-bold text-white tracking-wide drop-shadow-md flex items-center gap-2">
                    <span className="text-3xl">🌴</span> Piscina Oasis
                </div>
                <div className="hidden md:flex gap-8 text-white/90 text-sm font-bold drop-shadow-md uppercase tracking-wider">
                    <span className="cursor-pointer border-b-2 border-brand-accent pb-1" onClick={() => document.getElementById('galeria').scrollIntoView({ behavior: 'smooth' })}>Instalaciones</span>
                    <span className="cursor-pointer hover:text-white transition" onClick={() => document.getElementById('planes').scrollIntoView({ behavior: 'smooth' })}>Planes</span>
                    <span className="cursor-pointer hover:text-white transition" onClick={() => document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' })}>Contacto</span>
                </div>
                <button 
                    className="bg-brand-accent text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-orange-600 transition shadow-lg uppercase tracking-wider animate-pulse"
                    onClick={() => document.getElementById('planes').scrollIntoView({ behavior: 'smooth' })}
                >
                    Cotizar Ahora
                </button>
            </nav>

            {/* HERO SECTION */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero_oasis_1777577991129.png" 
                        alt="Piscina Oasis Villa Alegre" 
                        className="w-full h-full object-cover object-center"
                        onError={(e) => e.target.src = "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
                    />
                    <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 glass-card p-12 md:p-16 rounded-3xl max-w-4xl w-[90%] text-center mt-16 transition-all duration-1000 transform translate-y-0">
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-brand-dark mb-6 leading-tight drop-shadow-sm">
                        Tu Verano Inolvidable,<br/>Nuestro Oasis
                    </h1>
                    <p className="text-brand-text/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                        Descubre un rincón en Villa Alegre donde la frescura del agua se encuentra con la máxima diversión. Celebra tu próximo evento en espacios diseñados para inspirar, refrescar y crear momentos inolvidables bajo el sol.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            className="bg-brand-primary text-white px-10 py-4 rounded-full font-bold hover:bg-cyan-600 transition shadow-xl text-lg hover:-translate-y-1 transform duration-300"
                            onClick={() => document.getElementById('planes').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Ver Planes
                        </button>
                        <button 
                            className="bg-white/90 text-brand-dark border-2 border-brand-primary/30 px-10 py-4 rounded-full font-bold hover:bg-white transition shadow-sm text-lg backdrop-blur-md hover:-translate-y-1 transform duration-300"
                            onClick={() => document.getElementById('galeria').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Ver Galería
                        </button>
                    </div>
                </div>
            </header>

            {/* GALERÍA DE FOTOS SECTION */}
            <section id="galeria" className="py-24 px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-brand-accent uppercase tracking-[0.3em] text-sm font-black mb-3 block">Descubre</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">Nuestras Instalaciones</h2>
                    <p className="text-brand-muted max-w-2xl mx-auto text-lg font-medium">
                        Todo lo que necesitas para el día perfecto: agua cristalina, áreas verdes, zonas de juego y espacios de relajación.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px]">
                    <div className="group relative rounded-3xl overflow-hidden shadow-lg lg:col-span-2 lg:row-span-2">
                        <img src="/gal_piscina_1777578003893.png" alt="Piscina" onError={(e) => e.target.src="https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-6 left-6"><h3 className="text-3xl font-serif font-bold text-white drop-shadow-md">🏊‍♂️ Gran Piscina</h3></div>
                    </div>
                    <div className="group relative rounded-3xl overflow-hidden shadow-lg">
                        <img src="/gal_quincho_1777578033924.png" alt="Quincho" onError={(e) => e.target.src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-4"><h3 className="text-xl font-serif font-bold text-white drop-shadow-md">🍖 Quincho Equipado</h3></div>
                    </div>
                    <div className="group relative rounded-3xl overflow-hidden shadow-lg">
                        <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Cancha" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-4"><h3 className="text-xl font-serif font-bold text-white drop-shadow-md">⚽ Multicancha</h3></div>
                    </div>
                    <div className="group relative rounded-3xl overflow-hidden shadow-lg lg:col-span-2">
                        <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Terraza" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-6 left-6"><h3 className="text-2xl font-serif font-bold text-white drop-shadow-md">🍹 Terrazas Lounge</h3></div>
                    </div>
                </div>
            </section>

            {/* VENUES SECTION */}
            <section id="planes" className="py-24 px-8 max-w-7xl mx-auto bg-white/50 rounded-[3rem] shadow-xl border border-white mb-24 backdrop-blur-sm">
                <div className="text-center mb-16">
                    <span className="text-brand-accent uppercase tracking-[0.2em] text-sm font-bold mb-3 block">Reserva tu Día</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">Planes de Arriendo</h2>
                    <p className="text-brand-muted max-w-2xl mx-auto text-lg font-light">
                        Elige el plan que mejor se adapte a tu celebración y asegura tu fecha en el oasis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8">
                    {planes.map(p => (
                        <div key={p.id} className="group relative rounded-3xl overflow-hidden h-[480px] shadow-2xl cursor-pointer hover:-translate-y-2 transition-all duration-500" onClick={() => setPlanSeleccionado(p)}>
                            <img 
                                src="/gal_piscina_1777578003893.png" 
                                alt={p.nombre}
                                onError={(e) => e.target.src="https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="glass-card p-6 rounded-2xl border-white/40">
                                    <h3 className="text-2xl font-serif font-bold text-brand-dark mb-1">{p.nombre}</h3>
                                    <p className="text-brand-primary font-black text-2xl mb-3">${p.precio_base.toLocaleString()}</p>
                                    <p className="text-sm text-brand-muted font-medium mb-4">
                                        Acceso completo a piscinas, quinchos y áreas verdes para disfrutar al máximo.
                                    </p>
                                    <button className="w-full bg-brand-dark text-white font-bold py-3 rounded-xl group-hover:bg-brand-primary transition-colors">
                                        Cotizar Este Plan →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECCIÓN DE CONTACTO */}
            <section id="contacto" className="bg-brand-dark text-white py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-tr-full"></div>
                
                <div className="max-w-7xl mx-auto px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-brand-accent uppercase tracking-[0.2em] text-sm font-bold mb-3 block">Hablemos</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">¿Tienes dudas sobre tu reserva?</h2>
                        <p className="text-white/70 text-lg font-light mb-10 max-w-lg">
                            Estamos aquí para ayudarte a planificar el evento perfecto. Contáctanos directamente por WhatsApp, correo, o visítanos en nuestro recinto.
                        </p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">📍</div>
                                <div>
                                    <p className="font-bold">Ubicación</p>
                                    <p className="text-sm text-white/70">Las Camelias 123, Villa Alegre</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">📱</div>
                                <div>
                                    <p className="font-bold">WhatsApp</p>
                                    <p className="text-sm text-white/70">+56 9 2812 2947</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">✉️</div>
                                <div>
                                    <p className="font-bold">Correo Electrónico</p>
                                    <p className="text-sm text-white/70">contacto@piscinaoasis.cl</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-3xl">
                        <h3 className="text-2xl font-serif font-bold mb-6">Envíanos un mensaje</h3>
                        <form onSubmit={manejarContacto} className="flex flex-col gap-4">
                            <input 
                                type="text" 
                                placeholder="Tu Nombre" 
                                value={datosContacto.nombre}
                                onChange={e => setDatosContacto({...datosContacto, nombre: e.target.value})}
                                required
                                className="w-full p-4 bg-white/10 border border-white/20 focus:border-brand-accent rounded-xl outline-none transition text-white placeholder-white/50" 
                            />
                            <input 
                                type="email" 
                                placeholder="Tu Correo (Opcional)" 
                                value={datosContacto.email}
                                onChange={e => setDatosContacto({...datosContacto, email: e.target.value})}
                                className="w-full p-4 bg-white/10 border border-white/20 focus:border-brand-accent rounded-xl outline-none transition text-white placeholder-white/50" 
                            />
                            <textarea 
                                placeholder="¿En qué podemos ayudarte?" 
                                rows="4" 
                                value={datosContacto.mensaje}
                                onChange={e => setDatosContacto({...datosContacto, mensaje: e.target.value})}
                                required
                                className="w-full p-4 bg-white/10 border border-white/20 focus:border-brand-accent rounded-xl outline-none transition text-white placeholder-white/50 resize-none"
                            ></textarea>
                            <button type="submit" className="bg-brand-accent text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg mt-2">
                                Enviar por WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* QUOTATION MODAL */}
            {planSeleccionado && (
                <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
                    <div className="glass-modal rounded-[2.5rem] max-w-6xl w-full flex flex-col lg:flex-row overflow-hidden my-8 shadow-2xl relative transform transition-all animate-slideUp">
                        
                        {/* BOTÓN CERRAR */}
                        <button 
                            onClick={() => !guardando && setPlanSeleccionado(null)}
                            className="absolute top-6 right-6 w-12 h-12 bg-gray-100 hover:bg-brand-accent hover:text-white rounded-full flex items-center justify-center text-brand-dark z-20 transition-all font-bold text-xl shadow-md"
                        >
                            ✕
                        </button>

                        {/* COLUMNA IZQUIERDA: FORMULARIO */}
                        <div className="p-8 md:p-12 lg:w-3/5 overflow-y-auto max-h-[85vh] custom-scrollbar">
                            <div className="mb-10">
                                <h2 className="text-4xl font-serif font-black text-brand-dark mb-3">Arma tu Cotización</h2>
                                <p className="text-brand-muted text-lg font-medium">
                                    Personaliza los detalles de tu evento para recibir una propuesta formal al instante.
                                </p>
                            </div>

                            {/* Detalle del Evento */}
                            <div className="mb-10 bg-white/50 p-6 rounded-3xl border border-white">
                                <h3 className="text-2xl font-serif font-bold text-brand-primary mb-6 flex items-center gap-2">
                                    <span className="text-brand-accent">🌴</span> Datos del Evento
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Nombre Completo</label>
                                        <input placeholder="Ej: Juan Pérez" className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl outline-none transition-all font-medium" onChange={e => setDatosCliente({ ...datosCliente, nombre: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Correo Electrónico</label>
                                        <input placeholder="juan@correo.com" type="email" className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl outline-none transition-all font-medium" onChange={e => setDatosCliente({ ...datosCliente, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Teléfono (WhatsApp)</label>
                                        <input placeholder="+56 9 8765 4321" type="tel" className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl outline-none transition-all font-medium" onChange={e => setDatosCliente({ ...datosCliente, telefono: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Empresa (Opcional)</label>
                                        <input placeholder="Nombre de la empresa" className="w-full p-4 bg-white border-2 border-gray-100 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl outline-none transition-all font-medium" onChange={e => setDatosCliente({ ...datosCliente, empresa: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                                    <div>
                                        <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Cantidad de Invitados</label>
                                        <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl p-2 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/20 transition-all shadow-inner">
                                            <button onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))} className="w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark font-black text-xl flex items-center justify-center transition">-</button>
                                            <input type="number" value={numPersonas} readOnly className="w-full bg-transparent text-center font-black text-brand-dark text-xl outline-none" />
                                            <button onClick={() => setNumPersonas(numPersonas + 1)} className="w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-200 text-brand-dark font-black text-xl flex items-center justify-center transition">+</button>
                                        </div>
                                        <p className="text-xs text-brand-muted mt-2 text-center">*Costo extra a partir de 50 personas</p>
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
                                                className="w-full text-center p-2 bg-transparent outline-none font-bold text-brand-primary cursor-pointer"
                                                dateFormat="dd 'de' MMMM, yyyy"
                                                dayClassName={date => {
                                                    const d = startOfDay(date);
                                                    if (fechasBloqueadas.some(f => isSameDay(f, d))) return 'fecha-bloqueada';
                                                    if (fechasConfirmadas.some(f => isSameDay(f, d))) return 'reserva-confirmada';
                                                    if (fechasPendientes.some(f => isSameDay(f, d))) return 'reserva-pendiente';
                                                    return undefined;
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SERVICIOS ADICIONALES */}
                            <div className="mb-4">
                                <h3 className="text-2xl font-serif font-bold text-brand-primary mb-6 flex items-center gap-2">
                                    <span className="text-brand-accent">✨</span> Servicios Adicionales
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {SERVICIOS_ADICIONALES.map(srv => (
                                        <label
                                            key={srv.id}
                                            className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                                                serviciosSeleccionados.includes(srv.id)
                                                    ? 'bg-brand-primary/10 border-brand-primary shadow-lg'
                                                    : 'bg-white border-gray-100 hover:border-brand-primary/50 shadow-sm'
                                            }`}
                                        >
                                            <div className="absolute top-4 right-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${serviciosSeleccionados.includes(srv.id) ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'}`}>
                                                    {serviciosSeleccionados.includes(srv.id) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={serviciosSeleccionados.includes(srv.id)}
                                                onChange={() => toggleServicio(srv.id)}
                                                className="hidden"
                                            />
                                            <span className="text-2xl mb-2">{srv.nombre.split(' ')[0]}</span>
                                            <span className="font-bold text-brand-dark mb-1 leading-tight">{srv.nombre.substring(srv.nombre.indexOf(' ') + 1)}</span>
                                            <span className="text-sm font-black text-brand-primary mt-auto">+ ${srv.precio.toLocaleString('es-CL')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: RESUMEN STICKY */}
                        <div className="lg:w-2/5 p-8 md:p-12 bg-gradient-to-br from-white to-brand-light relative border-l-2 border-brand-primary/10 shadow-[-10px_0_20px_rgba(0,0,0,0.03)]">
                            <div className="sticky top-0">
                                <div className="text-center mb-10">
                                    <span className="inline-block bg-brand-accent/20 text-brand-accent text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Resumen</span>
                                    <h3 className="text-4xl font-serif font-black text-brand-dark">Cotización</h3>
                                </div>

                                <div className="space-y-5 mb-10">
                                    <div className="flex justify-between items-end border-b-2 border-dashed border-gray-200 pb-4">
                                        <div>
                                            <p className="font-bold text-brand-dark text-lg">Arriendo Base</p>
                                            <p className="text-sm text-brand-muted font-medium">{planSeleccionado.nombre}</p>
                                        </div>
                                        <p className="font-black text-brand-primary text-xl">${planSeleccionado.precio_base.toLocaleString('es-CL')}</p>
                                    </div>

                                    {numPersonas > 50 && (
                                        <div className="flex justify-between items-end border-b-2 border-dashed border-gray-200 pb-4">
                                            <div>
                                                <p className="font-bold text-brand-dark text-lg">Invitados Extra</p>
                                                <p className="text-sm text-brand-muted font-medium">{numPersonas - 50} personas adicionales</p>
                                            </div>
                                            <p className="font-black text-brand-primary text-xl">${((numPersonas - 50) * 5000).toLocaleString('es-CL')}</p>
                                        </div>
                                    )}

                                    {serviciosSeleccionados.map(id => {
                                        const srv = SERVICIOS_ADICIONALES.find(s => s.id === id)
                                        return srv ? (
                                            <div key={id} className="flex justify-between items-end border-b-2 border-dashed border-gray-200 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-brand-accent text-sm">✓</span>
                                                    <p className="font-bold text-brand-dark text-md leading-tight max-w-[200px]">{srv.nombre.substring(srv.nombre.indexOf(' ') + 1)}</p>
                                                </div>
                                                <p className="font-black text-brand-primary text-xl">${srv.precio.toLocaleString('es-CL')}</p>
                                            </div>
                                        ) : null
                                    })}
                                </div>

                                <div className="bg-white border-2 border-brand-primary/20 p-8 rounded-3xl mb-8 shadow-xl relative overflow-hidden">
                                    <div className="absolute -right-6 -top-6 text-brand-primary/5 text-9xl">🌴</div>
                                    <div className="relative z-10">
                                        <div className="flex flex-col mb-2">
                                            <p className="font-bold text-brand-muted uppercase tracking-widest text-sm mb-1">Total Estimado</p>
                                            <h2 className="text-5xl font-serif font-black text-brand-primary">${precioFinal.toLocaleString('es-CL')}</h2>
                                        </div>
                                        <p className="text-xs text-brand-muted font-medium mt-2">*Valores sujetos a confirmación de disponibilidad.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={manejarReserva}
                                    disabled={guardando || !fechaSeleccionada}
                                    className={`w-full py-5 rounded-2xl font-black text-white text-xl flex justify-center items-center gap-3 transition-all duration-300 ${guardando ? 'bg-brand-muted cursor-not-allowed' : 'bg-brand-dark hover:bg-brand-primary shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-1'}`}
                                >
                                    {guardando ? (
                                        <>Procesando... <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></>
                                    ) : (
                                        <>Solicitar Reserva Formal <span className="text-2xl">→</span></>
                                    )}
                                </button>
                                
                                <p className="text-center text-sm text-brand-muted mt-6 font-medium">
                                    Sin compromiso de pago. Te contactaremos por WhatsApp y correo para confirmar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inicio;