import { useState } from 'react'
import { WHATSAPP, UBICACION, EMAIL_CONTACTO, TELEFONO } from '../config'
import { useToast } from './Toast'

export default function ContactSection() {
  const addToast = useToast()
  const [datos, setDatos] = useState({ nombre: '', email: '', mensaje: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!datos.nombre.trim() || !datos.mensaje.trim()) {
      addToast('Por favor ingresa tu nombre y mensaje.', 'warning')
      return
    }
    const texto = `Hola Piscina Oasis! 🌴\nMi nombre es ${datos.nombre}${datos.email ? ` (${datos.email})` : ''}.\n\nTengo la siguiente consulta:\n${datos.mensaje}`
    window.open(`https://wa.me/${WHATSAPP.ADMIN_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank')
    addToast('WhatsApp abierto en una nueva ventana.', 'success')
    setDatos({ nombre: '', email: '', mensaje: '' })
  }

  const contactItems = [
    { icon: '📍', label: 'Ubicación', value: UBICACION },
    { icon: '📱', label: 'WhatsApp', value: TELEFONO },
    { icon: '✉️', label: 'Correo Electrónico', value: EMAIL_CONTACTO },
  ]

  return (
    <section id="contacto" className="bg-brand-night text-white py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-brand-teal/5 rounded-tr-full"></div>

      <div className="max-w-7xl mx-auto px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-brand-gold uppercase tracking-[0.2em] text-sm font-bold mb-3 block">Hablemos</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">¿Tienes dudas sobre tu reserva?</h2>
          <p className="text-white/60 text-lg font-light mb-10 max-w-lg">
            Estamos aquí para ayudarte a planificar el evento perfecto. Contáctanos directamente por WhatsApp, correo, o visítanos.
          </p>
          <div className="space-y-6">
            {contactItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-xl group-hover:bg-brand-gold/20 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-white/80">{item.label}</p>
                  <p className="text-sm text-white/60">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-10">
          <h3 className="text-2xl font-serif font-bold mb-6">Envíanos un mensaje</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Tu Nombre"
              value={datos.nombre}
              onChange={e => setDatos({ ...datos, nombre: e.target.value })}
              required
              className="w-full p-4 bg-white/5 border border-white/10 focus:border-brand-gold rounded-xl outline-none transition-all text-white placeholder-white/30"
            />
            <input
              type="email"
              placeholder="Tu Correo (Opcional)"
              value={datos.email}
              onChange={e => setDatos({ ...datos, email: e.target.value })}
              className="w-full p-4 bg-white/5 border border-white/10 focus:border-brand-gold rounded-xl outline-none transition-all text-white placeholder-white/30"
            />
            <textarea
              placeholder="¿En qué podemos ayudarte?"
              rows="4"
              value={datos.mensaje}
              onChange={e => setDatos({ ...datos, mensaje: e.target.value })}
              required
              className="w-full p-4 bg-white/5 border border-white/10 focus:border-brand-gold rounded-xl outline-none transition-all text-white placeholder-white/30 resize-none"
            />
            <button
              type="submit"
              className="bg-brand-gold text-brand-night py-4 rounded-xl font-bold text-lg hover:bg-brand-gold-light transition-all shadow-lg mt-2 cursor-pointer"
            >
              Enviar por WhatsApp
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
