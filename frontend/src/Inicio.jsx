import { useEffect, useState } from 'react'
import { startOfDay, parseISO } from 'date-fns'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import PlansSection from './components/PlansSection'
import ContactSection from './components/ContactSection'
import QuotationModal from './components/QuotationModal'
import { getPlanes, getReservasFechas, getFechasBloqueadas } from './api'

function Inicio() {
  const [planes, setPlanes] = useState([])
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [fechasConfirmadas, setFechasConfirmadas] = useState([])
  const [fechasPendientes, setFechasPendientes] = useState([])
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])

  useEffect(() => {
    async function cargarDatos() {
      try {
        const p = await getPlanes()
        if (p) setPlanes(p)

        const r = await getReservasFechas()
        if (r) {
          setFechasConfirmadas(
            r.filter(x => x.estado === 'Confirmado').map(x => startOfDay(parseISO(x.fecha_evento)))
          )
          setFechasPendientes(
            r.filter(x => x.estado === 'Pendiente').map(x => startOfDay(parseISO(x.fecha_evento)))
          )
        }

        const fb = await getFechasBloqueadas()
        if (fb) {
          setFechasBloqueadas(fb.map(x => startOfDay(parseISO(x.fecha))))
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
      }
    }
    cargarDatos()
  }, [])

  const scrollToPlanes = () => {
    document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-dark">
      <Navbar onCotizar={scrollToPlanes} />
      <Hero onVerPlanes={scrollToPlanes} onVerGaleria={() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })} />
      <Gallery />
      <PlansSection planes={planes} onSelectPlan={setPlanSeleccionado} />
      <ContactSection />

      {planSeleccionado && (
        <QuotationModal
          plan={planSeleccionado}
          onClose={() => setPlanSeleccionado(null)}
          fechasConfirmadas={fechasConfirmadas}
          fechasPendientes={fechasPendientes}
          fechasBloqueadas={fechasBloqueadas}
          onReservaExitosa={(fecha) => setFechasPendientes(prev => [...prev, fecha])}
        />
      )}
    </div>
  )
}

export default Inicio
