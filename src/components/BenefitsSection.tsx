import React from 'react';
import { 
  Activity as ActivityIcon, 
  Target, 
  ShieldCheck, 
  HeartHandshake, 
  Sparkles, 
  Compass, 
  SunMedium, 
  CheckCircle 
} from 'lucide-react';
import { Benefit } from '../types';
import { BENEFITS } from '../data/clubData';

export const BenefitsSection: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Activity':
        return <ActivityIcon className="w-6 h-6 text-[#D21923]" />;
      case 'Focus':
        return <Target className="w-6 h-6 text-[#D21923]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#D21923]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-[#D21923]" />;
      case 'Smile':
        return <Sparkles className="w-6 h-6 text-[#D21923]" />;
      case 'Sun':
        return <SunMedium className="w-6 h-6 text-[#D21923]" />;
      default:
        return <Compass className="w-6 h-6 text-[#D21923]" />;
    }
  };

  return (
    <section id="beneficios" className="py-20 sm:py-28 bg-[#141416] relative overflow-hidden border-b border-white/5">
      {/* Background Graphic Lines */}
      <div className="absolute inset-0 equestrian-diagonal-lines opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
            <span>Formación Integral</span>
            <span className="text-zinc-600">·</span>
            <span>Mente, Cuerpo y Valores</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            BENEFICIOS DE LA <span className="text-[#D21923]">EQUITACIÓN</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            La práctica ecuestre va mucho más allá del ejercicio físico. Es una escuela de vida que fomenta el carácter, la serenidad y el compromiso en cada sesión.
          </p>
        </div>

        {/* Benefits Grid - 6 original graphic cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.id}
              className="group relative bg-[#1B1B1E] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-[#D21923]/50 transition-all duration-300 shadow-lg hover:-translate-y-1"
            >
              {/* Subtle top red corner indicator */}
              <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-r-[14px] border-t-transparent border-r-[#D21923]/60 group-hover:border-r-[#D21923] transition-colors" />
              </div>

              <div>
                {/* Header: Icon + Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-black/40 border border-white/10 group-hover:border-[#D21923]/30 transition-colors">
                    {getIcon(benefit.iconName)}
                  </div>
                  <span className="text-xs font-mono text-zinc-500 font-medium">
                    0{index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-3 group-hover:text-white transition-colors">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  {benefit.description}
                </p>
              </div>

              {/* Bottom tag: Highlight concept (clean text, no pill badge) */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#D21923] font-medium tracking-wide">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{benefit.highlight}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Responsible statement footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-400 max-w-xl mx-auto italic font-serif">
            "Formando jinetes, creando experiencias: Cada avance sobre la pista refleja el respeto mutuo entre el alumno y el caballo."
          </p>
        </div>
      </div>
    </section>
  );
};
