import React from 'react';
import { ArrowRight, Compass, Shield, Heart, Sparkles } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';
import { ScrollReveal } from './FadeInSection';

interface EditorialManifestoProps {
  onGoToBooking: () => void;
}

export const EditorialManifesto: React.FC<EditorialManifestoProps> = ({ onGoToBooking }) => {
  return (
    <section id="manifiesto" className="py-16 sm:py-24 lg:py-32 bg-[#161619] relative overflow-hidden border-b border-white/10">
      {/* Background Graphic Lines */}
      <div className="absolute inset-0 equestrian-diagonal-lines opacity-40 pointer-events-none" />

      {/* Giant watermark */}
      <div 
        className="absolute bottom-0 right-0 select-none pointer-events-none opacity-[0.03] text-[20vw] font-serif font-black text-white leading-none -mb-10"
        aria-hidden="true"
      >
        ESENCIA
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Section Header */}
        <ScrollReveal variant="up" className="mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
            <span>El Manifiesto</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight max-w-4xl leading-[1.08]">
            "EL CABALLO ENSEÑA LO QUE <br className="hidden sm:inline" />
            <span className="text-[#D21923] italic font-normal">LAS PALABRAS NO PUEDEN."</span>
          </h2>
        </ScrollReveal>

        {/* Asymmetrical Magazine Spread (Overlapping photo + 3 tight punchy cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Overlapping Photo with Negative Space & Bleed */}
          <ScrollReveal variant="scale" delay={80} className="lg:col-span-6 relative">
            <div className="relative group">
              <div className="h-[320px] sm:h-[440px] lg:h-[520px] bg-[#141416] border border-white/10 overflow-hidden shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80"
                  alt="Vínculo y cuidado consciente en La Caballería"
                  className="w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/20 to-transparent" />
                
                {/* Floating Quote Stamp */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#141416]/95 backdrop-blur-md border border-white/10">
                  <span className="text-[11px] font-mono uppercase text-[#D21923] block mb-1">
                    LA REGLA DE ORO
                  </span>
                  <p className="text-sm font-serif italic text-white">
                    "{CLUB_INFO.slogan}"
                  </p>
                </div>
              </div>

              {/* Offset Accent Block */}
              <div className="hidden sm:block absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#D21923] pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* Right Column: 3 Sharp Editorial Statements (Low word count, high impact) */}
          <div className="lg:col-span-6 space-y-6 lg:pl-4">
            
            {/* Statement 01 */}
            <ScrollReveal variant="left" delay={80}>
              <div className="group relative p-6 bg-[#141416] border-l-2 border-[#D21923] border-y border-r border-white/5 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-[#D21923] font-bold tracking-wider">
                    01 // EL VÍNCULO PIE A TIERRA
                  </span>
                  <Heart className="w-4 h-4 text-zinc-500 group-hover:text-[#D21923] transition-colors" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-2">
                  Aprender a escuchar antes de montar
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                  El respeto y la confianza mutua nacen en el establo: cepillar, acariciar y comunicarse con serenidad.
                </p>
              </div>
            </ScrollReveal>

            {/* Statement 02 */}
            <ScrollReveal variant="left" delay={180}>
              <div className="group relative p-6 bg-[#141416] border-l-2 border-white/40 group-hover:border-[#D21923] border-y border-r border-white/5 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-400 font-bold tracking-wider">
                    02 // LA CALMA & LA POSTURA
                  </span>
                  <Sparkles className="w-4 h-4 text-zinc-500 group-hover:text-[#D21923] transition-colors" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-2">
                  En pista no existe la prisa
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                  Cada alumno progresa a su propio ritmo motriz, conquistando el equilibrio, el asiento y la templanza interior.
                </p>
              </div>
            </ScrollReveal>

            {/* Statement 03 */}
            <ScrollReveal variant="left" delay={280}>
              <div className="group relative p-6 bg-[#141416] border-l-2 border-white/40 group-hover:border-[#D21923] border-y border-r border-white/5 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-400 font-bold tracking-wider">
                    03 // LA FAMILIA EN NATURALEZA
                  </span>
                  <Shield className="w-4 h-4 text-zinc-500 group-hover:text-[#D21923] transition-colors" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-2">
                  Desconexión digital y orgullo compartido
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                  Un entorno natural donde los padres observan y celebran la autonomía de sus hijos con total tranquilidad.
                </p>
              </div>
            </ScrollReveal>

            {/* Direct Booking Trigger */}
            <ScrollReveal variant="up" delay={360} className="pt-2">
              <button
                type="button"
                onClick={onGoToBooking}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D21923] hover:text-white transition-colors group"
              >
                <span>Descubre tu primera clase</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </ScrollReveal>

          </div>

        </div>

      </div>
    </section>
  );
};
