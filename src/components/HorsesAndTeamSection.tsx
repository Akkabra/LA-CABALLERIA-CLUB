import React, { useState } from 'react';
import { Sparkles, Calendar, ChevronRight, User, PlusCircle } from 'lucide-react';
import { HorseProfile, Instructor } from '../types';
import { INSTRUCTORS } from '../data/clubData';

interface HorsesAndTeamSectionProps {
  horses: HorseProfile[];
  onSelectHorse: (horse: HorseProfile) => void;
  onBookWithInstructor: (instructorId: string) => void;
  onOpenManagePrompt: () => void;
}

export const HorsesAndTeamSection: React.FC<HorsesAndTeamSectionProps> = ({
  horses,
  onSelectHorse,
  onBookWithInstructor,
  onOpenManagePrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'caballos' | 'profesores'>('caballos');
  const [horseFilter, setHorseFilter] = useState<string>('todos');

  const filteredHorses = horseFilter === 'todos'
    ? horses
    : horses.filter((h) => h.levelSuitability.toLowerCase().includes(horseFilter.toLowerCase()));

  // Exclude the generic assignment option from the team card list
  const displayInstructors = INSTRUCTORS.filter((i) => i.id !== 'inst-cualquiera');

  return (
    <section id="equipo" className="py-20 sm:py-28 bg-[#141416] relative border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-[#D21923] font-bold">
              <span>El Plantel Noble</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              MAESTROS & <span className="italic font-normal text-[#D21923]">GUÍAS</span>
            </h2>
          </div>

          {/* Primary View Toggle (Caballos vs Profesores) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 p-1.5 bg-[#1B1B1E] border border-white/10 w-full md:w-auto self-start md:self-end">
            <button
              type="button"
              onClick={() => setActiveTab('caballos')}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === 'caballos'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nuestros Caballos ({horses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profesores')}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === 'profesores'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Equipo de Profesores ({displayInstructors.length})
            </button>
          </div>
        </div>

        {/* VIEW 1: CABALLOS */}
        {activeTab === 'caballos' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Sub-filter */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-zinc-400">
                <span className="mr-1">Filtrar por perfil:</span>
                <button
                  type="button"
                  onClick={() => setHorseFilter('todos')}
                  className={`px-3 py-1.5 min-h-[38px] transition-colors ${horseFilter === 'todos' ? 'text-white font-bold underline decoration-[#D21923] decoration-2' : 'text-zinc-400 hover:text-white'}`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setHorseFilter('niños')}
                  className={`px-3 py-1.5 min-h-[38px] transition-colors ${horseFilter === 'niños' ? 'text-white font-bold underline decoration-[#D21923] decoration-2' : 'text-zinc-400 hover:text-white'}`}
                >
                  Jóvenes y Niños
                </button>
                <button
                  type="button"
                  onClick={() => setHorseFilter('iniciación')}
                  className={`px-3 py-1.5 min-h-[38px] transition-colors ${horseFilter === 'iniciación' ? 'text-white font-bold underline decoration-[#D21923] decoration-2' : 'text-zinc-400 hover:text-white'}`}
                >
                  Iniciación
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenManagePrompt}
                className="inline-flex items-center gap-1.5 min-h-[38px] text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D21923]" />
                <span>Incorporar perfil nuevo</span>
              </button>
            </div>

            {/* Horses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredHorses.map((horse) => (
                <div
                  key={horse.id}
                  className="group bg-[#18181B] border border-white/10 hover:border-[#D21923]/60 flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Photo */}
                  <div className="relative h-64 overflow-hidden bg-black/40">
                    <img
                      src={horse.imageUrl}
                      alt={horse.imageAlt}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-95"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-85" />

                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-zinc-300 border border-white/10 uppercase tracking-wider">
                      {horse.levelSuitability}
                    </div>
                  </div>

                  {/* Info */}
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

                      {horse.curiosities.length > 0 && (
                        <div className="pt-3 border-t border-white/5 text-[11px] text-zinc-400 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#D21923] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{horse.curiosities[0]}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                      <button
                        type="button"
                        onClick={() => onSelectHorse(horse)}
                        className="w-full min-h-[44px] inline-flex items-center justify-center py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-white/5 hover:bg-[#D21923] transition-colors border border-white/10 hover:border-[#D21923]"
                      >
                        <span>Ver ficha completa</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: PROFESORES */}
        {activeTab === 'profesores' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in duration-200">
            {displayInstructors.map((inst) => (
              <div
                key={inst.id}
                className="bg-[#18181B] border border-white/10 hover:border-[#D21923]/60 p-6 flex flex-col justify-between shadow-xl transition-all duration-300 group"
              >
                <div>
                  <div className="h-64 overflow-hidden bg-black/40 border border-white/10 mb-5 relative">
                    <img
                      src={inst.photoUrl}
                      alt={inst.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 filter contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-75" />
                  </div>

                  <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold block mb-1">
                    {inst.title}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white mb-2">
                    {inst.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mb-3">
                    {inst.specialty}
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    {inst.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                    {inst.focusPillars.map((p, idx) => (
                      <span key={idx} className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 border border-white/5">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onBookWithInstructor(inst.id)}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors shadow-md"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar clase con {inst.name.split(' ')[1]}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
