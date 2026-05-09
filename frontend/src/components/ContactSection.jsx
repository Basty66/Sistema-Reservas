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
    { icon: '✉️', label: 'Correo', value: EMAIL_CONTACTO },
  ]

  return (
    <section id="contacto" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-night via-brand-void to-brand-night" />
      <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand-gold/3 blur-[120px] animate-orb" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-brand-teal/3 blur-[120px] animate-orb-delayed" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-brand-gold uppercase tracking-[0.25em] text-sm font-black mb-4 block">Contacto</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            ¿Tienes dudas sobre <span className="text-brand-gold">tu reserva?</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Estamos aquí para ayudarte a planificar el evento perfecto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-5">
            {contactItems.map((item, i) => (
              <div
                key={i}
                className="glass-dark rounded-2xl p-5 flex items-center gap-4 hover:bg-white/5 transition-all duration-300 group hover-lift"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{item.label}</p>
                  <p className="font-semibold text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="glass-dark rounded-[2rem] p-8 md:p-10 border border-white/5">
              <h3 className="text-2xl font-serif font-bold text-white mb-8">Envíanos un mensaje</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tu Nombre"
                    value={datos.nombre}
                    onChange={e => setDatos({ ...datos, nombre: e.target.value })}
                    required
                    className="input-premium peer"
                  />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Tu Correo (Opcional)"
                    value={datos.email}
                    onChange={e => setDatos({ ...datos, email: e.target.value })}
                    className="input-premium"
                  />
                </div>
                <div className="relative">
                  <textarea
                    placeholder="¿En qué podemos ayudarte?"
                    rows="4"
                    value={datos.mensaje}
                    onChange={e => setDatos({ ...datos, mensaje: e.target.value })}
                    required
                    className="input-premium resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary text-lg py-4 w-full flex items-center justify-center gap-2 group"
                >
                  <span>Enviar por WhatsApp</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
