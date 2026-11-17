import React from 'react';
import { ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface CtaSectionProps {
  onCtaClick: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onCtaClick }) => {
  return (
    <section className="relative py-20 sm:py-28 bg-[#18181B] overflow-hidden border-b border-white/5">
      {/* Background Graphic Lines */}
      <div className="absolute inset-0 equestrian-diagonal-lines opacity-60 pointer-events-none" />

      {/* Red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D21923]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Emblem / Kicker */}
        <div className="inline-flex items-center gap-2 mb-4 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
          <span className="w-6 h-[1px] bg-[#D21923]" />
          <span>La Caballería · Club de Equitación</span>
          <span className="w-6 h-[1px] bg-[#D21923]" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight mb-6">
          TU PRÓXIMA AVENTURA <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-[#D21923]">
            COMIENZA AQUÍ.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Conoce La Caballería y descubre todo lo que el mundo ecuestre tiene para ofrecerte. Ven a aprender, compartir y crecer en familia junto a los caballos.
        </p>

        {/* Slogan statement */}
        <div className="mb-10">
          <span className="text-lg sm:text-xl text-zinc-300 font-serif italic border-b border-[#D21923]/40 pb-1">
            "{CLUB_INFO.slogan}"
          </span>
        </div>

        {/* Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-[#D21923]/30 border border-[#D21923] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
          >
            <span>QUIERO CONOCER MÁS</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};
