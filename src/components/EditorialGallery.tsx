import React from 'react';
import { Maximize2, Camera } from 'lucide-react';
import { GalleryPhoto } from '../types';

interface EditorialGalleryProps {
  photos: GalleryPhoto[];
  onOpenLightbox: (photo: GalleryPhoto, index: number) => void;
}

export const EditorialGallery: React.FC<EditorialGalleryProps> = ({
  photos,
  onOpenLightbox,
}) => {
  return (
    <section id="galeria" className="py-16 sm:py-24 lg:py-32 bg-[#161619] relative border-b border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-[#D21923] font-bold">
              <span>Crónica Visual</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              MOMENTOS <span className="italic font-normal">EN PISTA</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-serif italic max-w-xs">
            Sin artificios: aprendizaje real, sonrisas familiares y nobleza equina.
          </p>
        </div>

        {/* Asymmetric Magazine Masonry Spread */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Hero Tall Vertical Photo (Takes 7 columns on desktop) */}
          {photos[0] && (
            <div
              onClick={() => onOpenLightbox(photos[0], 0)}
              className="md:col-span-7 group relative min-h-[300px] sm:min-h-[440px] lg:min-h-[560px] bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-2xl"
            >
              <img
                src={photos[0].imageUrl}
                alt={photos[0].title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 contrast-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />

              <div className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm border border-white/10 text-white opacity-85 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block mb-1">
                  01 // EN PISTA
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {photos[0].title}
                </h3>
              </div>
            </div>
          )}

          {/* Right Column Stack (Takes 5 columns) */}
          <div className="md:col-span-5 flex flex-col gap-6 justify-between">
            {photos[1] && (
              <div
                onClick={() => onOpenLightbox(photos[1], 1)}
                className="group relative h-[240px] sm:h-[265px] bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-xl"
              >
                <img
                  src={photos[1].imageUrl}
                  alt={photos[1].title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block mb-0.5">
                    02 // CUIDADO & VÍNCULO
                  </span>
                  <h4 className="text-base font-serif font-bold text-white">
                    {photos[1].title}
                  </h4>
                </div>
              </div>
            )}

            {photos[2] && (
              <div
                onClick={() => onOpenLightbox(photos[2], 2)}
                className="group relative h-[240px] sm:h-[265px] bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-xl"
              >
                <img
                  src={photos[2].imageUrl}
                  alt={photos[2].title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block mb-0.5">
                    03 // ENTORNO FAMILIAR
                  </span>
                  <h4 className="text-base font-serif font-bold text-white">
                    {photos[2].title}
                  </h4>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Secondary Strip for more photos if available */}
        {photos.length > 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {photos.slice(3, 6).map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => onOpenLightbox(photo, index + 3)}
                className="group relative h-60 bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-lg"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-sm font-serif font-bold text-white">
                    {photo.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
