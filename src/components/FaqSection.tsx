import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { FAQS, CLUB_INFO } from '../data/clubData';
import { ScrollReveal } from './FadeInSection';

interface FaqSectionProps {
  onGoToContact: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onGoToContact }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="preguntas" className="py-16 sm:py-24 lg:py-28 bg-[#18181B] relative border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <ScrollReveal variant="up" className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
            <HelpCircle className="w-4 h-4 text-[#D21923]" />
            <span>Resolución de Dudas</span>
            <span className="text-zinc-600">/</span>
            <span>Preguntas Frecuentes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            TODO LO QUE DEBES SABER <br />
            <span className="text-[#D21923]">ANTES DE TU PRIMERA CLASE</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl mx-auto">
            Queremos que padres y alumnos se sientan seguros y tranquilos desde el primer contacto. Aquí resolvemos las consultas más habituales.
          </p>
        </ScrollReveal>

        {/* Accordion list */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal key={index} variant="up" delay={index * 55}>
                <div className="bg-[#141416] border border-white/10 overflow-hidden transition-colors duration-200 hover:border-white/20">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D21923]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-serif font-bold text-white pr-2">
                      {faq.q}
                    </span>
                    <div className={`p-1.5 rounded bg-white/5 text-zinc-400 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'rotate-180 text-[#D21923]' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-3">
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom prompt for further inquiries */}
        <ScrollReveal variant="up" delay={120}>
          <div className="mt-10 p-5 bg-[#141416] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D21923] shrink-0" />
              <span className="text-zinc-300">
                ¿Tienes alguna duda médica, de transporte o de horarios específicos?
              </span>
            </div>
            <button
              type="button"
              onClick={onGoToContact}
              className="w-full sm:w-auto shrink-0 px-5 py-3 min-h-[44px] text-xs font-semibold tracking-wider uppercase text-white bg-white/5 hover:bg-[#D21923] border border-white/10 hover:border-[#D21923] transition-colors"
            >
              Hacer consulta personalizada
            </button>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
