import React, { useState } from 'react';
import { Maximize2, Camera, ShieldCheck, Heart } from 'lucide-react';
import { GalleryPhoto } from '../types';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  onOpenLightbox: (photo: GalleryPhoto, index: number) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  photos,
  onOpenLightbox,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const filteredPhotos = activeCategory === 'todos'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  return (
    <section id="galeria" className="py-20 sm:py-28 bg-[#141416] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
              <span>Experiencias y Comunidad</span>
              <span className="text-zinc-600">/</span>
              <span>Momentos Formativos</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
              CADA CLASE, <br className="hidden sm:inline" />
              <span className="text-[#D21923]">UNA NUEVA EXPERIENCIA.</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              La conexión entre el jinete y el caballo se construye en cada gesto: desde el primer saludo en el establo y el cuidado consciente, hasta la satisfacción de superar retos en la pista.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center flex-wrap gap-2 p-1.5 bg-[#1B1B1E] border border-white/10 self-start md:self-end">
            <button
              type="button"
              onClick={() => setActiveCategory('todos')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeCategory === 'todos'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('alumnos')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeCategory === 'alumnos'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Alumnos en pista
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('vinculo')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeCategory === 'vinculo'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vínculo y Cuidado
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('familiar')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeCategory === 'familiar'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Familiar
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => onOpenLightbox(photo, index)}
              className="group relative h-80 sm:h-96 bg-[#1A1A1D] border border-white/10 overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:border-[#D21923]/60"
            >
              {/* Image */}
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 contrast-105"
                loading="lazy"
              />

              {/* Overlay with subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Top Zoom Icon */}
              <div className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>

              {/* Bottom Caption & Title */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="text-[11px] uppercase tracking-wider text-[#D21923] font-semibold mb-1">
                  {photo.category === 'alumnos' && 'Alumnos en formación'}
                  {photo.category === 'vinculo' && 'Cuidado y respeto'}
                  {photo.category === 'familiar' && 'Comunidad familiar'}
                  {photo.category === 'tecnica' && 'Técnica ecuestre'}
                </div>

                <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-2 leading-snug">
                  {photo.title}
                </h3>

                <p className="text-xs text-zinc-300 line-clamp-2 opacity-90 leading-relaxed">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Ethical disclaimer & photo note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-zinc-400 border border-white/10 bg-[#1B1B1E] px-4 py-2.5">
            <Camera className="w-4 h-4 text-[#D21923]" />
            <span>
              Fotografía institucional: Espacio reservado para las imágenes oficiales del club y sus alumnos con autorización previa.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
