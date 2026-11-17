import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const EditorialPillars: React.FC = () => {
  const pillars = [
    {
      index: '01',
      title: 'EQUILIBRIO',
      tag: 'Tono Muscular & Postura',
      description: 'El movimiento tridimensional del caballo sincroniza el cuerpo de forma orgánica.',
    },
    {
      index: '02',
      title: 'CONCENTRACIÓN',
      tag: 'Atención Plena en Pista',
      description: 'Exige estar 100% presente: respirar, observar y conectar en cada tranco.',
    },
    {
      index: '03',
      title: 'CONFIANZA',
      tag: 'Autonomía & Superación',
      description: 'Guiar con calma a un ser de 400 kilos transforma el temor en seguridad.',
    },
    {
      index: '04',
      title: 'RESPETO',
      tag: 'Ética & Convivencia Animal',
      description: 'El caballo no es un instrumento: es un maestro noble que siente y enseña.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-[#141416] relative border-b border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#D21923] font-bold block mb-2">
              Dimensiones Formativas
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
              EL MÉTODO EN <span className="italic font-normal">CUATRO PALABRAS</span>
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-serif italic">
            Formación física, emocional y ética.
          </span>
        </div>

        {/* Typographic Wall Spread */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {pillars.map((pillar) => (
            <div
              key={pillar.index}
              className="group p-6 sm:p-8 lg:p-10 bg-[#141416] hover:bg-[#1a1a1d] transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle top hover red border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#D21923] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div>
                <span className="text-xs font-mono text-zinc-500 group-hover:text-[#D21923] transition-colors block mb-6">
                  {pillar.index} // DIMENSIÓN
                </span>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mb-2 group-hover:text-[#D21923] transition-colors">
                  {pillar.title}
                </h3>

                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-4">
                  {pillar.tag}
                </span>

                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-8 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 group-hover:text-white transition-colors">
                <span className="font-mono text-[10px] uppercase tracking-widest">La Caballería</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#D21923] transition-opacity" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
