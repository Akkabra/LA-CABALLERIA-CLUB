import React from 'react';
import { Sparkles, Shield, Heart, Trophy, BookOpen, Compass } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface AboutSectionProps {
  onOpenEssenceModal: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenEssenceModal }) => {
  return (
    <section id="nosotros" className="py-20 sm:py-28 bg-[#141416] relative overflow-hidden border-b border-white/5">
      {/* Subtle Background Accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[#D21923]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Composition with authentic photography and logo watermark */}
          <div className="lg:col-span-5 relative">
            <div className="relative group">
              {/* Outer architectural border accent */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#D21923]/30 via-white/5 to-transparent blur-sm opacity-50 group-hover:opacity-75 transition duration-500" />
              
              <div className="relative bg-[#1A1A1D] border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80"
                  alt="Instalaciones y caballos de La Caballería Club de Equitación"
                  className="w-full h-[400px] sm:h-[480px] object-cover object-center filter contrast-[1.05] brightness-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />

                {/* Floating caption tag (Unboxed, pure typography) */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#141416]/90 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-semibold text-white tracking-wider uppercase">Club de Equitación</span>
                    <span className="text-[#D21923] font-serif italic text-sm">{CLUB_INFO.slogan}</span>
                  </div>
                </div>
              </div>

              {/* Diagonal red accent line */}
              <div className="absolute -bottom-3 -right-3 w-20 h-2 bg-[#D21923]" />
            </div>
          </div>

          {/* Right Column: Editorial Text & Values */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Kicker */}
            <div className="flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
              <span>Presentación Institucional</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">Escuela & Comunidad</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-6">
              BIENVENIDOS A <br />
              <span className="text-[#D21923]">LA CABALLERÍA</span>
            </h2>

            {/* Conceptual Statement */}
            <div className="relative pl-5 border-l-2 border-[#D21923] mb-6">
              <p className="text-base sm:text-lg text-white font-medium italic font-serif leading-relaxed">
                "En La Caballería creemos que cada encuentro con un caballo representa una oportunidad para aprender, desarrollar confianza y descubrir nuevas habilidades."
              </p>
            </div>

            {/* Institutional Description (Respecting rule of no invented foundation years/fake awards) */}
            <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed mb-8">
              <p>
                Somos un club y escuela de equitación concebido como un punto de encuentro formativo, cercano y familiar. Entendemos la equitación como una disciplina deportiva noble donde el respeto y la comprensión del caballo son el pilar de cada lección.
              </p>
              <p>
                Nuestra vocación está centrada en acompañar a niños, jóvenes y familias en su acercamiento al mundo ecuestre, ofreciendo un entorno seguro y profesional donde cada alumno progresa a su propio ritmo.
              </p>
            </div>

            {/* Four Institutional Pillars */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-3.5 bg-[#1B1B1E] border border-white/5 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Confianza y Seguridad</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Protocolos minuciosos para la tranquilidad familiar.</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#1B1B1E] border border-white/5 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Disciplina y Aprendizaje</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Metodología pedagógica paso a paso.</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#1B1B1E] border border-white/5 flex items-start gap-3">
                <Heart className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Bienestar Equino</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Cuidado, afecto y respeto por cada caballo.</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#1B1B1E] border border-white/5 flex items-start gap-3">
                <Trophy className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Espíritu Deportivo</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Crecimiento motriz, postural y mental.</p>
                </div>
              </div>
            </div>

            {/* Button */}
            <div>
              <button
                type="button"
                onClick={onOpenEssenceModal}
                className="inline-flex items-center justify-center px-6 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#D21923]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
              >
                <span>DESCUBRE NUESTRA ESENCIA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
