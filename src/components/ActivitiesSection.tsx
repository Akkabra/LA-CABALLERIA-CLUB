import React from 'react';
import { ArrowUpRight, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Activity } from '../types';

interface ActivitiesSectionProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onQuickInquire: (activityName: string) => void;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
  onSelectActivity,
  onQuickInquire,
}) => {
  return (
    <section id="actividades" className="py-20 sm:py-28 bg-[#18181B] relative border-b border-white/5">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D21923]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
            <span>Actividades y Experiencias</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">Formación Ecuestre</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            DESCUBRE EL MUNDO <span className="text-[#D21923]">ECUESTRE</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Cada una de nuestras actividades está pensada para ofrecer una experiencia cercana, progresiva y respetuosa, guiada por nuestro principio: formando jinetes, creando experiencias.
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="group bg-[#141416] border border-white/10 hover:border-[#D21923]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
            >
              {/* Card Image Container */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-black/40">
                <img
                  src={activity.imageUrl}
                  alt={activity.imageAlt}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 contrast-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-90" />
                
                {/* Index tag & Audience */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-xs font-mono text-white/80 bg-black/70 backdrop-blur-sm px-2.5 py-1 border border-white/10">
                    0{index + 1}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-white/10">
                    <Users className="w-3.5 h-3.5 text-[#D21923]" />
                    <span>{activity.targetAudience}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-[#D21923] transition-colors mb-3">
                    {activity.name}
                  </h3>
                  
                  <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                    {activity.shortDescription}
                  </p>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectActivity(activity)}
                    className="inline-flex items-center justify-center text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white py-2 transition-colors group-hover:translate-x-1"
                  >
                    <span>Ver detalles</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 text-[#D21923]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickInquire(activity.name)}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
                  >
                    <span>Consultar información</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Note on Structure & Extensibility (In compliance with rule D & 7) */}
        <div className="mt-12 p-4 sm:p-5 bg-[#141416]/80 border border-white/10 flex items-start gap-3 text-xs text-zinc-400">
          <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Nota de gestión institucional:</span>{' '}
            Las actividades, cupos y horarios están sujetos a la programación oficial establecida por la dirección de La Caballería Club de Equitación. Esta estructura modular permite agregar o actualizar programas formativos conforme a las directrices oficiales del club.
          </div>
        </div>
      </div>
    </section>
  );
};
