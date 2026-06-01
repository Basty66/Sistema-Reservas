import { useState } from 'react'
import { WHATSAPP, UBICACION, EMAIL_CONTACTO, TELEFONO, SITE_NAME } from '../config'
import { useToast } from './Toast'
import Reveal from './Reveal'

export default function ContactSection() {
  const addToast = useToast()
  const [datos, setDatos] = useState({ nombre: '', email: '', mensaje: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!datos.nombre.trim() || !datos.mensaje.trim()) {
      addToast('Por favor ingresa tu nombre y mensaje.', 'warning')
      return
    }
    const texto = `Hola ${SITE_NAME}! 🌴\nMi nombre es ${datos.nombre}${datos.email ? ` (${datos.email})` : ''}.\n\nTengo la siguiente consulta:\n${datos.mensaje}`
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
        <Reveal animation="fade-up">
          <div className="text-center mb-16">
            <span className="text-brand-gold uppercase tracking-[0.25em] text-sm font-black mb-4 block">Contacto</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              ¿Tienes dudas sobre <span className="text-brand-gold">tu reserva?</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Estamos aquí para ayudarte a planificar el evento perfecto.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-5">
            {contactItems.map((item, i) => (
              <Reveal key={i} animation="fade-left" delay={i * 100}>
                <div className="glass-dark rounded-2xl p-5 flex items-center gap-4 hover:bg-white/5 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/5 cursor-default">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand-gold/20 transition-all duration-300 border border-white/5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{item.label}</p>
                    <p className="font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal animation="fade-right" delay={200}>
            <div className="lg:col-span-3">
              <div className="glass-dark rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/3 rounded-full blur-3xl" />
                <h3 className="text-2xl font-serif font-bold text-white mb-8 relative z-10">Envíanos un mensaje</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
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
                    className="group relative overflow-hidden text-brand-night font-bold py-4 w-full rounded-xl transition-all duration-500 ease-out border border-brand-gold/30 bg-brand-gold shadow-lg shadow-brand-gold/20 animate-neon hover:animate-none hover:shadow-xl hover:shadow-brand-gold/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-brand-gold-light to-brand-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    <span className="relative z-10">Enviar por WhatsApp</span>
                    <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
