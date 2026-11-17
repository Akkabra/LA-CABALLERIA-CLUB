import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface HeroProps {
  onBookNow: () => void;
  onExplore?: () => void;
}

const ROTATING_WORDS = [
  'experiencias.',
  'confianza.',
  'vínculos.',
  'momentos.',
  'disciplina.',
  'recuerdos.',
];

// Subtle ambient floating sparks strictly in white and crimson (#D21923)
const AMBIENT_EMBERS = [
  { left: '16%', top: '34%', size: 3, color: 'bg-white', duration: '5.4s', delay: '0s' },
  { left: '24%', top: '52%', size: 4, color: 'bg-[#D21923]', duration: '6.2s', delay: '0.8s' },
  { left: '36%', top: '28%', size: 2.5, color: 'bg-white', duration: '4.8s', delay: '1.4s' },
  { left: '48%', top: '22%', size: 3.5, color: 'bg-[#D21923]', duration: '5.9s', delay: '0.3s' },
  { left: '62%', top: '30%', size: 3, color: 'bg-white', duration: '6.5s', delay: '1.9s' },
  { left: '74%', top: '44%', size: 4, color: 'bg-[#D21923]', duration: '5.1s', delay: '1.1s' },
  { left: '83%', top: '36%', size: 2.5, color: 'bg-white', duration: '6.0s', delay: '2.4s' },
  { left: '31%', top: '62%', size: 3, color: 'bg-white', duration: '5.6s', delay: '2.1s' },
  { left: '68%', top: '58%', size: 3, color: 'bg-[#D21923]', duration: '6.4s', delay: '0.5s' },
];

export const Hero: React.FC<HeroProps> = ({ onBookNow }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const interval = setInterval(() => {
      if (!prefersReducedMotion) {
        setIsFading(true);
        setTimeout(() => {
          setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
          setIsFading(false);
        }, 300);
      } else {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-[100dvh] pt-24 pb-16 sm:py-28 w-full flex items-center justify-center text-center overflow-hidden bg-[#0F0F11]"
      aria-label="Portada cinematográfica de La Caballería Club de Equitación"
    >
      {/* 1. Fotografía de fondo nítida y visible con iluminación cinematográfica */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=2600&q=95"
          alt="Majestuoso caballo y jinete en pista de equitación"
          className="w-full h-full object-cover object-center filter contrast-[1.14] brightness-[0.52] saturate-[0.82] scale-100 transition-transform duration-1000 ease-out"
          loading="eager"
        />

        {/* Gradientes cinematográficos suaves */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-black/30 to-[#141416]/70" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#141416]/45 to-[#141416]/85" />

        {/* Resplandor vivo en rojo institucional detrás del título */}
        <div
          className="hero-aura-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[580px] lg:w-[780px] h-[220px] sm:h-[320px] lg:h-[360px] bg-[#D21923]/22 rounded-full blur-[110px] sm:blur-[145px] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Partículas sutiles en blanco y rojo institucional */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden" aria-hidden="true">
        {AMBIENT_EMBERS.map((ember, idx) => (
          <span
            key={idx}
            className={`hero-ember absolute rounded-full ${ember.color} shadow-[0_0_10px_rgba(210,25,35,0.65)]`}
            style={
              {
                left: ember.left,
                top: ember.top,
                width: `${ember.size}px`,
                height: `${ember.size}px`,
                '--ember-duration': ember.duration,
                '--ember-delay': ember.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* 2. Contenido Central */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        {/* Ornamento superior arquitectónico con emblema sutil */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-4 sm:mb-5 w-full max-w-md opacity-90" aria-hidden="true">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/35 to-[#D21923]" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rotate-45 bg-[#D21923] shadow-[0_0_10px_#D21923]" />
            <img
              src={CLUB_INFO.logoUrl}
              alt=""
              className="h-7 sm:h-9 w-auto object-contain opacity-95 drop-shadow-[0_0_16px_rgba(210,25,35,0.45)]"
            />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#D21923] shadow-[0_0_10px_#D21923]" />
          </div>
          <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/35 to-[#D21923]" />
        </div>

        {/* Titular Principal Cinematográfico con Profundidad Escultórica y Destello Rojo/Blanco */}
        <div className="relative inline-block max-w-full">
          {/* Capa de aura trasera sutil para dar relieve y volumen */}
          <span
            aria-hidden="true"
            className="font-sans font-black uppercase tracking-tight sm:tracking-tighter text-[clamp(2.35rem,9.8vw,10.5rem)] leading-[0.9] text-transparent [-webkit-text-stroke:1px_rgba(210,25,35,0.4)] blur-[3px] select-none pointer-events-none absolute inset-0 translate-y-[2px]"
          >
            LA CABALLERÍA
          </span>

          {/* Titular visible con barrido de luz seda-blanco y destello carmesí */}
          <h1 className="hero-title-magic relative font-sans font-black uppercase tracking-tight sm:tracking-tighter text-[clamp(2.35rem,9.8vw,10.5rem)] leading-[0.9] select-none">
            LA CABALLERÍA
          </h1>
        </div>

        {/* Descriptor en Rojo y Letra Cursiva con líneas editoriales */}
        <div className="mt-3 sm:mt-4 mb-5 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4">
          <span className="hidden sm:block w-10 h-[1px] bg-gradient-to-r from-transparent to-[#D21923]/80" aria-hidden="true" />
          <span className="font-serif italic font-normal text-[#D21923] text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide drop-shadow-[0_4px_20px_rgba(210,25,35,0.45)]">
            Club de equitación
          </span>
          <span className="hidden sm:block w-10 h-[1px] bg-gradient-to-l from-transparent to-[#D21923]/80" aria-hidden="true" />
        </div>

        {/* Eslogan dinámico con cambio de palabra en tiempo real */}
        <div className="mb-8 sm:mb-12 min-h-[3rem] flex items-center justify-center px-2">
          <p className="text-base sm:text-xl md:text-2xl font-serif text-zinc-100 font-light drop-shadow-lg flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="italic">Formando jinetes, creando</span>
            <span
              className={`font-semibold text-white border-b-2 border-[#D21923] pb-0.5 inline-block transition-all duration-300 ${
                isFading ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
              }`}
            >
              {ROTATING_WORDS[wordIndex]}
            </span>
          </p>
        </div>

        {/* 3. BOTÓN DE AGENDAR CITA ULTRA-ESTILIZADO */}
        <div>
          <button
            type="button"
            onClick={onBookNow}
            className="group relative inline-flex items-center gap-3.5 sm:gap-6 pl-6 sm:pl-9 pr-2.5 sm:pr-3.5 py-2.5 sm:py-3.5 min-h-[52px] rounded-full bg-gradient-to-r from-[#D21923] via-[#B8141D] to-[#960E15] text-white border border-white/25 hover:border-white/60 shadow-[0_12px_40px_rgba(210,25,35,0.45)] hover:shadow-[0_16px_50px_rgba(210,25,35,0.7)] transition-all duration-300 active:scale-[0.98] cursor-pointer overflow-hidden"
          >
            {/* Shimmer reflection sweep on hover */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"
              aria-hidden="true"
            />

            {/* Left Micro-indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="font-sans font-bold text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.28em] uppercase text-white drop-shadow whitespace-nowrap">
                AGENDAR CITA
              </span>
            </div>

            {/* Right Frosted Circular Icon Container */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#D21923] transition-all duration-300 shadow-inner">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Sutil línea de acento inferior en rojo */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D21923] to-transparent opacity-60" />
    </section>
  );
};
