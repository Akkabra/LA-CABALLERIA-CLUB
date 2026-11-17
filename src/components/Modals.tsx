import React, { useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Users
} from 'lucide-react';
import { Activity, HorseProfile, GalleryPhoto } from '../types';
import { CLUB_INFO } from '../data/clubData';

// --- Essence Modal ---
interface EssenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToContact: () => void;
}

export const EssenceModal: React.FC<EssenceModalProps> = ({
  isOpen,
  onClose,
  onGoToContact,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1A1A1D] border border-white/10 max-w-2xl w-full p-5 sm:p-8 shadow-2xl z-10 my-4 sm:my-8">
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
              Identidad Institucional
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              La Esencia de La Caballería
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 sm:py-6 space-y-5 text-sm text-zinc-300 leading-relaxed max-h-[65dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
          <div className="p-4 bg-[#141416] border-l-2 border-[#D21923]">
            <p className="font-serif italic text-white text-base">
              "{CLUB_INFO.slogan}"
            </p>
          </div>

          <p>
            En <strong className="text-white">La Caballería Club de Equitación</strong> concebimos la relación con el caballo como un proceso pedagógico y humano. No nos limitamos a enseñar la técnica de la monta; formamos a los jinetes desde el suelo, en el establo y en cada momento de convivencia con el animal.
          </p>

          <h4 className="font-serif font-bold text-white text-base pt-2">
            Nuestros Cuatro Compromisos Fundamentales:
          </h4>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">1. Seguridad y Confianza Progresiva</strong>
                <span>Cada sesión está diseñada con protocolos rigurosos de seguridad adaptados a la edad y experiencia del alumno, acompañándolo paso a paso para que supere sus temores.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">2. Bienestar y Respeto Animal</strong>
                <span>Nuestros caballos son respetados como seres sintientes y compañeros de vida. Los alumnos aprenden su lenguaje corporal, sus tiempos de descanso y su cuidado diario.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">3. Disciplina y Templanza</strong>
                <span>La práctica ecuestre cultiva la paciencia, la constancia y la serenidad. Los errores en pista son oportunidades para reflexionar y ajustar con suavidad.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">4. Vínculo Familiar y Comunitario</strong>
                <span>Fomentamos un espacio donde las familias pueden presenciar los avances de sus hijos, compartir jornadas al aire libre y desconectar del entorno digital.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 border border-white/10 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToContact();
            }}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
          >
            <span>Conoce el Club en persona</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Activity Detail Modal ---
interface ActivityDetailModalProps {
  activity: Activity | null;
  onClose: () => void;
  onInquire: (activityName: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  onInquire,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (activity) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activity, onClose]);

  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1A1A1D] border border-white/10 max-w-2xl w-full p-5 sm:p-8 shadow-2xl z-10 my-4 sm:my-8">
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
              Actividad Formativa
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              {activity.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 sm:py-6 space-y-4 text-sm text-zinc-300 leading-relaxed max-h-[65dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
          <div className="h-48 overflow-hidden bg-black/40 border border-white/10">
            <img
              src={activity.imageUrl}
              alt={activity.imageAlt}
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2 border-y border-white/5 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Users className="w-4 h-4 text-[#D21923]" />
              <span>{activity.targetAudience}</span>
            </div>
            {activity.duration && (
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="w-4 h-4 text-[#D21923]" />
                <span>{activity.duration}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-serif font-bold text-white text-base mb-2">Descripción del Programa</h4>
            <p className="text-zinc-300 leading-relaxed">{activity.fullDescription}</p>
          </div>

          <div className="p-3 bg-[#141416] border border-white/5 text-xs text-zinc-400">
            <span className="text-white font-medium">Horarios y cupos:</span> Las sesiones se coordinan de acuerdo con la disponibilidad de las pistas y los instructores del club.
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 border border-white/10 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onInquire(activity.name);
            }}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
          >
            <span>Consultar por esta actividad</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Horse Detail Modal ---
interface HorseDetailModalProps {
  horse: HorseProfile | null;
  onClose: () => void;
  onMeetHorse: (horseName: string) => void;
}

export const HorseDetailModal: React.FC<HorseDetailModalProps> = ({
  horse,
  onClose,
  onMeetHorse,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (horse) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [horse, onClose]);

  if (!horse) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1A1A1D] border border-white/10 max-w-2xl w-full p-5 sm:p-8 shadow-2xl z-10 my-4 sm:my-8">
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
              Ficha del Ejemplar
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              {horse.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 sm:py-6 space-y-4 text-sm text-zinc-300 leading-relaxed max-h-[65dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
          <div className="h-56 overflow-hidden bg-black/40 border border-white/10">
            <img
              src={horse.imageUrl}
              alt={horse.imageAlt}
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2 border-y border-white/5 text-xs">
            <div>
              <span className="text-zinc-500 block">Temperamento:</span>
              <span className="text-white font-medium">{horse.temperament}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Enfoque formativo:</span>
              <span className="text-white font-medium">{horse.levelSuitability}</span>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-white text-base mb-2">Sobre {horse.name}</h4>
            <p className="text-zinc-300 leading-relaxed">{horse.description}</p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-white text-base mb-2">Características y Curiosidades</h4>
            <ul className="space-y-2">
              {horse.curiosities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#D21923] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 border border-white/10 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onMeetHorse(horse.name);
            }}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
          >
            <span>Preguntar por {horse.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Lightbox Modal ---
interface LightboxModalProps {
  photo: GalleryPhoto | null;
  photos: GalleryPhoto[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photo,
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    if (photo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photo, onClose, onNext, onPrev]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-8">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-6 sm:right-6 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
        aria-label="Cerrar visor"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      <button
        type="button"
        onClick={onPrev}
        className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-300 hover:text-white bg-black/70 hover:bg-[#D21923] border border-white/15 transition-colors z-20"
        aria-label="Imagen anterior"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-300 hover:text-white bg-black/70 hover:bg-[#D21923] border border-white/15 transition-colors z-20"
        aria-label="Imagen siguiente"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Central image container */}
      <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="max-h-[70vh] w-auto max-w-full object-contain border border-white/10 shadow-2xl"
        />

        <div className="mt-4 text-center max-w-2xl px-4">
          <div className="text-xs uppercase tracking-widest text-[#D21923] font-semibold mb-1">
            {currentIndex + 1} / {photos.length}
          </div>
          <h4 className="text-lg font-serif font-bold text-white mb-1">
            {photo.title}
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400">
            {photo.caption}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Privacy Policy Modal ---
interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1A1A1D] border border-white/10 max-w-2xl w-full p-5 sm:p-8 shadow-2xl z-10 my-4 sm:my-8">
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
              Legal y Privacidad
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
              Política de Privacidad y Tratamiento de Datos
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 sm:py-6 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-[65dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
          <p>
            En cumplimiento de la legislación aplicable en materia de protección de datos personales y garantía de los derechos digitales, <strong className="text-white">La Caballería Club de Equitación</strong> informa a los usuarios del sitio web <em>www.caballeriaclub.com</em> de su política de privacidad:
          </p>

          <h5 className="font-semibold text-white">1. Responsable del tratamiento</h5>
          <p>
            La Caballería Club de Equitación. Canal de contacto oficial para asuntos de privacidad: <span className="font-mono text-zinc-200">{CLUB_INFO.officialEmail}</span>.
          </p>

          <h5 className="font-semibold text-white">2. Finalidad del tratamiento</h5>
          <p>
            Los datos personales facilitados a través de formularios de contacto (nombre, correo electrónico, teléfono y mensaje) serán tratados exclusivamente con la finalidad de gestionar su solicitud de información sobre clases, actividades y visitas al club.
          </p>

          <h5 className="font-semibold text-white">3. Protección especial a menores de edad</h5>
          <p>
            Dada nuestra naturaleza de escuela infantil y juvenil, los datos relativos a alumnos menores de edad deben ser facilitados por sus padres o tutores legales debidamente identificados. Las fotografías publicadas cuentan con consentimiento expreso.
          </p>

          <h5 className="font-semibold text-white">4. Derechos del usuario</h5>
          <p>
            Usted puede ejercer en cualquier momento sus derechos de acceso, rectificación, supresión y oposición enviando una comunicación escrita a nuestro correo oficial.
          </p>

          <h5 className="font-semibold text-white">5. Servicios de mapas interactivos</h5>
          <p>
            Este sitio integra funciones de Google Maps Platform para mostrar la ubicación referencial del club. Al utilizar el mapa interactivo, el usuario está sujeto a los{' '}
            <a
              href="https://maps.google.com/help/terms_maps/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D21923] underline hover:text-white"
            >
              Términos de Servicio Adicionales de Google Maps/Google Earth
            </a>{' '}
            y a la{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D21923] underline hover:text-white"
            >
              Política de Privacidad de Google
            </a>.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Terms Modal ---
interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1A1A1D] border border-white/10 max-w-2xl w-full p-5 sm:p-8 shadow-2xl z-10 my-4 sm:my-8">
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
              Institucional
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
              Condiciones y Normas Generales del Club
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 sm:py-6 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-[65dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
          <p>
            La práctica ecuestre en <strong className="text-white">La Caballería Club de Equitación</strong> se rige bajo principios estrictos de seguridad, convivencia y respeto a los animales:
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>El uso de casco homologado y calzado adecuado es obligatorio durante la monta y permanencia en pista.</li>
            <li>El trato hacia los caballos debe ser siempre amable y respetuoso. Queda prohibido cualquier castigo desmedido.</li>
            <li>Las visitas a las caballerizas y paddocks se realizan siempre acompañadas por personal del club.</li>
            <li>Los horarios de clases formativas están sujetos a confirmación según las condiciones meteorológicas y el bienestar físico de los ejemplares.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
