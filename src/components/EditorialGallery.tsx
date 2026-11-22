import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Camera } from 'lucide-react';
import { GalleryPhoto } from '../types';
import { ScrollReveal } from './FadeInSection';

interface EditorialGalleryProps {
  photos: GalleryPhoto[];
  onOpenLightbox: (photo: GalleryPhoto, index: number) => void;
}

function getBlurPlaceholderUrl(src: string): string | null {
  try {
    const url = new URL(src);
    if (url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('w', '48');
      url.searchParams.set('q', '20');
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}

interface BlurUpGalleryImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
  priority?: boolean;
}

const BlurUpGalleryImage: React.FC<BlurUpGalleryImageProps> = ({
  src,
  alt,
  title,
  className = '',
  priority = false,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLowResLoaded, setIsLowResLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const lowResUrl = getBlurPlaceholderUrl(src);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  if (hasError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-[#1e1e24] via-[#161619] to-[#231618] p-6 text-center">
        <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Camera className="w-5 h-5 text-[#D21923]" />
        </div>
        <span className="text-xs font-serif text-zinc-300 max-w-[200px]">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#19191d]">
      {/* Ambient base gradient while network request starts */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-br from-[#232329] via-[#161619] to-[#26171a] transition-opacity duration-700 motion-reduce:transition-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Ultra-lightweight blurred LQIP thumbnail for slow mobile connections */}
      {lowResUrl && (
        <img
          src={lowResUrl}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLowResLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center scale-110 blur-xl transition-opacity duration-500 motion-reduce:transition-none pointer-events-none ${
            isLoaded
              ? 'opacity-0'
              : isLowResLoaded
              ? 'opacity-85'
              : 'opacity-0'
          }`}
        />
      )}

      {/* Subtle loading indicator while high-res photo streams in */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
        />
      )}

      {/* Full-resolution image with smooth blur-up + zoom reveal */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover object-center transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none ${
          isLoaded
            ? 'opacity-100 blur-0 scale-100 group-hover:scale-105'
            : 'opacity-0 blur-md scale-[1.04]'
        } ${className}`}
      />
    </div>
  );
};

export const EditorialGallery: React.FC<EditorialGalleryProps> = ({
  photos,
  onOpenLightbox,
}) => {
  return (
    <section
      id="galeria"
      className="py-16 sm:py-24 lg:py-32 bg-[#161619] relative border-b border-white/10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal
          variant="up"
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4"
        >
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
        </ScrollReveal>

        {/* Asymmetric Magazine Masonry Spread */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Main Hero Tall Vertical Photo (Takes 7 columns on desktop) */}
          {photos[0] && (
            <ScrollReveal variant="scale" delay={60} className="md:col-span-7">
              <button
                type="button"
                onClick={() => onOpenLightbox(photos[0], 0)}
                aria-label={`Ampliar fotografía: ${photos[0].title}`}
                className="block w-full h-full text-left group relative min-h-[300px] sm:min-h-[440px] lg:min-h-[560px] bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
              >
                <BlurUpGalleryImage
                  src={photos[0].imageUrl}
                  alt={photos[0].title}
                  title={photos[0].title}
                  priority
                  className="brightness-90 contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80 pointer-events-none" />

                <div className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm border border-white/10 text-white opacity-85 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Maximize2 className="w-4 h-4" />
                </div>

                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block mb-1">
                    01 · En Pista
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    {photos[0].title}
                  </h3>
                </div>
              </button>
            </ScrollReveal>
          )}

          {/* Right Column Stack (Takes 5 columns) */}
          <div className="md:col-span-5 flex flex-col gap-6 justify-between">
            {photos[1] && (
              <ScrollReveal variant="left" delay={140}>
                <button
                  type="button"
                  onClick={() => onOpenLightbox(photos[1], 1)}
                  aria-label={`Ampliar fotografía: ${photos[1].title}`}
                  className="block w-full text-left group relative h-[240px] sm:h-[265px] bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
                >
                  <BlurUpGalleryImage
                    src={photos[1].imageUrl}
                    alt={photos[1].title}
                    title={photos[1].title}
                    className="brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block mb-0.5">
                      02 · Cuidado y Vínculo
                    </span>
                    <h4 className="text-base font-serif font-bold text-white">
                      {photos[1].title}
                    </h4>
                  </div>
                </button>
              </ScrollReveal>
            )}

            {photos[2] && (
              <ScrollReveal variant="left" delay={230}>
                <button
                  type="button"
                  onClick={() => onOpenLightbox(photos[2], 2)}
                  aria-label={`Ampliar fotografía: ${photos[2].title}`}
                  className="block w-full text-left group relative h-[240px] sm:h-[265px] bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
                >
                  <BlurUpGalleryImage
                    src={photos[2].imageUrl}
                    alt={photos[2].title}
                    title={photos[2].title}
                    className="brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block mb-0.5">
                      03 · Entorno Familiar
                    </span>
                    <h4 className="text-base font-serif font-bold text-white">
                      {photos[2].title}
                    </h4>
                  </div>
                </button>
              </ScrollReveal>
            )}
          </div>
        </div>

        {/* Secondary Strip for more photos if available */}
        {photos.length > 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {photos.slice(3, 6).map((photo, index) => (
              <ScrollReveal key={photo.id} variant="up" delay={index * 90}>
                <button
                  type="button"
                  onClick={() => onOpenLightbox(photo, index + 3)}
                  aria-label={`Ampliar fotografía: ${photo.title}`}
                  className="block w-full text-left group relative h-60 bg-[#141416] border border-white/10 overflow-hidden cursor-pointer shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
                >
                  <BlurUpGalleryImage
                    src={photo.imageUrl}
                    alt={photo.title}
                    title={photo.title}
                    className="brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <h4 className="text-sm font-serif font-bold text-white">
                      {photo.title}
                    </h4>
                  </div>
                </button>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
