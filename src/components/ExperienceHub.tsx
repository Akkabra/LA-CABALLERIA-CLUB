import React, { useState } from 'react';
import { ShieldCheck, Heart, Sparkles, BookOpen, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface ExperienceHubProps {
  onGoToBooking: () => void;
}

export const ExperienceHub: React.FC<ExperienceHubProps> = ({ onGoToBooking }) => {
  const [activeTab, setActiveTab] = useState<'metodo' | 'seguridad' | 'bienestar'>('metodo');

  return (
    <section id="experiencia" className="py-20 sm:py-28 bg-[#18181B] relative border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
              <span>La Experiencia</span>
              <span className="text-zinc-600">/</span>
              <span>Filosofía Institucional</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
              BIENVENIDOS A <span className="text-[#D21923]">LA CABALLERÍA</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-serif italic">
              "En La Caballería creemos que cada encuentro con un caballo representa una oportunidad para aprender, desarrollar confianza y descubrir nuevas habilidades."
            </p>
          </div>

          {/* Interactive Tab Switcher (Segmented, anti-pill) */}
          <div className="flex items-center flex-wrap gap-2 p-1.5 bg-[#141416] border border-white/10 self-start md:self-end">
            <button
              type="button"
              onClick={() => setActiveTab('metodo')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'metodo'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nuestra Pedagogía
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seguridad')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'seguridad'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Seguridad Familiar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bienestar')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'bienestar'
                  ? 'bg-[#D21923] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Bienestar Animal
            </button>
          </div>
        </div>

        {/* Dynamic Storytelling Panel */}
        <div className="bg-[#141416] border border-white/10 p-6 sm:p-10 shadow-2xl relative">
          
          {/* TAB 1: Método y Pedagogía */}
          {activeTab === 'metodo' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold block">
                  Formando Jinetes, Creando Experiencias
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Formación Integral: Del Suelo a la Montura
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Enseñamos la equitación como una relación viva, no como un deporte mecánico. Antes de subir al caballo, los alumnos aprenden a cepillarlo, colocar la cabezada y leer las señales de calma que el animal expresa.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Respeto por el ritmo madurativo de cada niño sin exigencias competitivas prematuras.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Desarrollo del asiento clásico y la sensibilidad en las manos para no dañar al caballo.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Integración constante de la familia durante las sesiones y progresos en pista.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onGoToBooking}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
                  >
                    <span>Agendar clase introductoria</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="h-80 sm:h-96 overflow-hidden bg-black/40 border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80"
                    alt="Alumno aprendiendo la técnica de equitación con su instructor"
                    className="w-full h-full object-cover object-center filter contrast-105"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-16 h-1.5 bg-[#D21923]" />
              </div>
            </div>
          )}

          {/* TAB 2: Seguridad Familiar */}
          {activeTab === 'seguridad' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold block">
                  Tranquilidad Absoluta para Padres
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Protocolos Rigurosos y Acompañamiento Pie a Tierra
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Sabemos que la seguridad es la máxima prioridad para las familias. Por ello, todos nuestros alumnos montan bajo supervisión individual directa, con caballos especialmente seleccionados por su temple sereno y predecible.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Uso obligatorio de cascos y chalecos homologados (suministrados por el club).</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Pistas de arena con cerramiento de seguridad y sin distracciones externas.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Zonas confortables y habilitadas para que los padres observen la clase.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onGoToBooking}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
                  >
                    <span>Conoce nuestras instalaciones</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="h-80 sm:h-96 overflow-hidden bg-black/40 border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80"
                    alt="Ambiente seguro y familiar en las instalaciones de La Caballería"
                    className="w-full h-full object-cover object-center filter contrast-105"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-16 h-1.5 bg-[#D21923]" />
              </div>
            </div>
          )}

          {/* TAB 3: Bienestar Equino */}
          {activeTab === 'bienestar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold block">
                  Nuestros Maestros Sintientes
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Cuidado Ético, Amor y Respeto por los Caballos
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Nuestros caballos disfrutan de amplios periodos de pastoreo, alimentación balanceada de primera calidad y descansos reglamentarios entre clases.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <Heart className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Cero castigos o herramientas agresivas: doma basada en refuerzo positivo.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <Heart className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Revisiones veterinarias y de herraje periódicas minuciosas.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-zinc-300">
                    <Heart className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                    <span>Los alumnos aprenden a agradecer y premiar el esfuerzo del caballo tras la sesión.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onGoToBooking}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
                  >
                    <span>Conoce a nuestros caballos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="h-80 sm:h-96 overflow-hidden bg-black/40 border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80"
                    alt="Caballos cuidados en paddocks y establos con máximo bienestar"
                    className="w-full h-full object-cover object-center filter contrast-105"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-16 h-1.5 bg-[#D21923]" />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
