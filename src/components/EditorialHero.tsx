import React from 'react';
import { ArrowRight, Calendar, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface EditorialHeroProps {
  onBookNow: (classTypeId?: string) => void;
  onScrollToManifesto: () => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  onBookNow,
  onScrollToManifesto,
}) => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 overflow-hidden bg-[#141416]"
      aria-label="Portada de La Caballería Club de Equitación"
    >
      {/* Background Graphic Watermark Wordmark */}
      <div 
        className="absolute top-16 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.035] whitespace-nowrap text-[18vw] font-serif font-black tracking-tighter text-white"
        aria-hidden="true"
      >
        CABALLERÍA
      </div>

      {/* Main Magazine Layout Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        
        {/* Top Kicker Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#D21923] animate-pulse rounded-full" />
            <span className="text-xs uppercase tracking-widest font-semibold text-zinc-300">
              {CLUB_INFO.name} · {CLUB_INFO.descriptor}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-serif italic text-zinc-400">
            <span>"{CLUB_INFO.slogan}"</span>
          </div>

          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            EDICIÓN 2026
          </div>
        </div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* Left: Dramatic Typographic Headline */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#D21923] font-bold block">
                Escuela Formativa & Deportiva
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-serif font-bold text-white tracking-tight leading-[0.95]">
                MÁS QUE <br />
                <span className="italic font-normal">EQUITACIÓN,</span> <br />
                <span className="text-outline-light hover:text-white transition-colors duration-500">
                  CRECER.
                </span>
              </h1>
            </div>

            {/* Sharp, minimal narrative */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-lg font-light leading-relaxed pt-2">
              Aprender a montar es aprender a escuchar, respetar y confiar. Una experiencia viva para niños, jóvenes y familias junto a la nobleza del caballo.
            </p>

            {/* Editorial Action Dock */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={() => onBookNow()}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs font-bold tracking-widest uppercase text-white bg-[#D21923] hover:bg-[#b8141d] active:scale-[0.98] transition-all duration-200 shadow-2xl shadow-[#D21923]/40 border border-[#D21923]"
              >
                <Calendar className="w-4 h-4" />
                <span>AGENDAR CITA AHORA</span>
              </button>

              <button
                type="button"
                onClick={onScrollToManifesto}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-semibold tracking-widest uppercase text-zinc-300 hover:text-white bg-transparent hover:bg-white/5 border border-white/20 hover:border-white transition-all"
              >
                <span>Descubrir Esencia</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D21923]" />
              </button>
            </div>
          </div>

          {/* Right: Overlapping Visual Art Composition */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* Main Visual Window with Asymmetric Negative Bleed */}
            <div className="relative group">
              {/* Red hairline geometric accent */}
              <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#D21923] pointer-events-none z-20" />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#D21923] pointer-events-none z-20" />

              <div className="relative h-[380px] sm:h-[460px] overflow-hidden bg-[#18181B] border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=85"
                  alt="Jinete y caballo en pista de equitación La Caballería"
                  className="w-full h-full object-cover object-center filter brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />

                {/* Overlapping Floating Magazine Tag */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#141416]/95 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between text-xs text-zinc-300 mb-1">
                    <span className="uppercase tracking-widest text-[#D21923] font-bold">
                      Seguridad y Respeto
                    </span>
                    <span className="font-mono text-zinc-500">4 a 14+ años</span>
                  </div>
                  <p className="text-xs text-white font-serif italic">
                    "Acompañamiento cercano pie a tierra desde el primer minuto."
                  </p>
                </div>
              </div>

              {/* Offset Decorative Accent Badge */}
              <div className="absolute -top-6 right-6 bg-[#D21923] text-white px-3.5 py-1.5 text-[11px] font-mono tracking-widest uppercase font-bold shadow-xl">
                CUPOS 2026
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Scroll Indicator & Pillar Ticker */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-wider font-medium">
          <span className="text-white font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D21923]" />
            Casco y chaleco homologado
          </span>
          <span className="hidden md:inline text-zinc-600">·</span>
          <span className="hidden md:inline">Clases personalizadas</span>
          <span className="hidden md:inline text-zinc-600">·</span>
          <span className="hidden md:inline">Ambiente familiar al aire libre</span>
        </div>

        <button
          type="button"
          onClick={onScrollToManifesto}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase tracking-widest text-[11px]"
        >
          <span>Explorar</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#D21923] animate-bounce" />
        </button>
      </div>
    </section>
  );
};
