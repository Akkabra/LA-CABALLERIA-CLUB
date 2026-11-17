import React, { useState } from 'react';
import { X, Calendar, MessageCircle, Phone, Mail, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContactWithPreload: (reason: string) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onOpenContactWithPreload,
}) => {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [preferredDay, setPreferredDay] = useState('Fin de semana');

  if (!isOpen) return null;

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hola La Caballería Club de Equitación. Mi nombre es ${visitorName || 'una familia interesada'}. Me gustaría conocer el club en persona (${preferredDay}) y recibir información sobre sus actividades formativas.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    onClose();
  };

  const handleGoToFullForm = () => {
    onClose();
    onOpenContactWithPreload('conocer-club');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1A1A1D] border border-white/10 max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 my-8">
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
              Visitas Guiadas y Orientación
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">
              Conoce La Caballería
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4 text-sm text-zinc-300">
          <p className="leading-relaxed">
            Te invitamos a visitar nuestras instalaciones, conocer a nuestros nobles caballos y conversar con los instructores sobre el mejor camino formativo para ti o tus hijos.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
                Tu nombre
              </label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Ej. Familia Martínez"
                className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D21923]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
                Preferencia de día para visitarnos
              </label>
              <select
                value={preferredDay}
                onChange={(e) => setPreferredDay(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D21923]"
              >
                <option value="Fin de semana (Sábado o Domingo)">Fin de semana (Sábado o Domingo)</option>
                <option value="Tarde entre semana (Lunes a Viernes)">Tarde entre semana (Lunes a Viernes)</option>
                <option value="Horario a convenir">Horario a convenir según disponibilidad</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#141416] border border-white/5 text-xs text-zinc-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
            <span>
              Visitas personalizadas con acompañamiento del equipo para garantizar la tranquilidad y seguridad de toda la familia.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleWhatsAppDirect}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-emerald-700 hover:bg-emerald-600 transition-colors shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Solicitar visita por WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleGoToFullForm}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
          >
            <span>Completar formulario detallado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
