import React, { useState } from 'react';
import { Sparkles, Heart, ChevronRight, Info, PlusCircle } from 'lucide-react';
import { HorseProfile } from '../types';

interface HorsesSectionProps {
  horses: HorseProfile[];
  onSelectHorse: (horse: HorseProfile) => void;
  onOpenManagePrompt: () => void;
}

export const HorsesSection: React.FC<HorsesSectionProps> = ({
  horses,
  onSelectHorse,
  onOpenManagePrompt,
}) => {
  const [filter, setFilter] = useState<string>('todos');

  const filteredHorses = filter === 'todos' 
    ? horses 
    : horses.filter((h) => h.levelSuitability.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section id="caballos" className="py-20 sm:py-28 bg-[#18181B] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
              <span>Nuestros Caballos</span>
              <span className="text-zinc-600">/</span>
              <span>Compañeros de Aprendizaje</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
              CONOCE A NUESTROS <span className="text-[#D21923]">COMPAÑEROS</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Cada uno de nuestros caballos posee una personalidad única, un temperamento noble y un rol fundamental en el desarrollo y la confianza de cada alumno.
            </p>
          </div>

          {/* Interactive filter controls (Buttons, styled cleanly without candy badges) */}
          <div className="flex items-center flex-wrap gap-2 p-1.5 bg-[#141416] border border-white/10 self-start md:self-end">
            <button
              type="button"
              onClick={() => setFilter('todos')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'todos'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilter('niños')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'niños'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Jóvenes y Niños
            </button>
            <button
              type="button"
              onClick={() => setFilter('iniciación')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === 'iniciación'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Iniciación
            </button>
          </div>
        </div>

        {/* Horse Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredHorses.map((horse) => (
            <div
              key={horse.id}
              className="group bg-[#141416] border border-white/10 hover:border-[#D21923]/50 flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Photo Container */}
              <div className="relative h-64 overflow-hidden bg-black/40">
                <img
                  src={horse.imageUrl}
                  alt={horse.imageAlt}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-95"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />

                {/* Level Tag (quiet overlay) */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-zinc-300 border border-white/10 uppercase tracking-wider">
                  {horse.levelSuitability}
                </div>
              </div>

              {/* Horse Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#D21923] transition-colors">
                      {horse.name}
                    </h3>
                    {horse.breed && (
                      <span className="text-[11px] text-zinc-400 italic">
                        {horse.breed}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#D21923] font-medium mb-3">
                    {horse.temperament}
                  </p>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-4">
                    {horse.description}
                  </p>

                  {/* Top curiosity bullet */}
                  {horse.curiosities.length > 0 && (
                    <div className="pt-3 border-t border-white/5 text-[11px] text-zinc-400 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D21923] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{horse.curiosities[0]}</span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-4 mt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onSelectHorse(horse)}
                    className="w-full inline-flex items-center justify-center py-2 text-xs font-semibold uppercase tracking-wider text-white bg-white/5 hover:bg-[#D21923] transition-colors border border-white/10 hover:border-[#D21923]"
                  >
                    <span>Ver ficha completa</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section ready for future additions (Rule F & 5 compliance) */}
        <div className="mt-12 p-6 bg-[#141416] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-[#D21923] shrink-0" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white">Plantel equino en constante atención y rotación:</span>{' '}
              Esta sección está preparada para integrar los perfiles oficiales de nuevos ejemplares que forman parte de la escuela de equitación.
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenManagePrompt}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#D21923]" />
            <span>Incorporar nuevo perfil</span>
          </button>
        </div>
      </div>
    </section>
  );
};
