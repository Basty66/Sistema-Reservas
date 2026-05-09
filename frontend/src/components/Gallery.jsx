import { useState } from 'react'
import { GALLERY_IMAGES } from '../config'

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)

  const handleError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1576013551627-11971f36e414?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }

  return (
    <section id="galeria" className="py-24 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-brand-gold uppercase tracking-[0.3em] text-sm font-black mb-3 block">Descubre</span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">Nuestras Instalaciones</h2>
        <p className="text-brand-muted max-w-2xl mx-auto text-lg font-medium">
          Todo lo que necesitas para el día perfecto: agua cristalina, áreas verdes, zonas de juego y espacios de relajación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px]">
        {GALLERY_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`group relative rounded-3xl overflow-hidden shadow-lg cursor-pointer ${img.span}`}
            onClick={() => setLightbox(img.src)}
          >
            <img
              src={img.src}
              alt={img.label}
              loading="lazy"
              onError={handleError}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-6 left-6">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-md">{img.label}</h3>
            </div>
            <div className="absolute inset-0 bg-brand-gold/0 group-hover:bg-brand-gold/10 transition-colors duration-500"></div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[999] bg-brand-night/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 w-12 h-12 glass text-white rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-xl"
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt="Galería"
            className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl object-contain animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
