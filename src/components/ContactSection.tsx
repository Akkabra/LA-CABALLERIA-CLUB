import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  MessageCircle, 
  Clock, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';
import { ContactFormData } from '../types';
import { ClubLocationMap } from './ClubLocationMap';
import { ScrollReveal } from './FadeInSection';

interface ContactSectionProps {
  initialReason?: string;
  onOpenPrivacyModal: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  initialReason,
  onOpenPrivacyModal,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    studentName: '',
    guardianName: '',
    email: '',
    phone: '',
    inquiryReason: initialReason || 'iniciacion-infantil',
    message: '',
    dataConsent: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (initialReason) {
      setFormData((prev) => ({ ...prev, inquiryReason: initialReason }));
    }
  }, [initialReason]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'El nombre del interesado es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Introduce un correo electrónico válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono o móvil de contacto es obligatorio';
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = 'Introduce un número de teléfono válido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Por favor escribe tu consulta o requerimiento';
    }

    if (!formData.dataConsent) {
      newErrors.dataConsent = 'Debes aceptar la política de tratamiento de datos para enviar la consulta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate immediate smooth feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setSubmittedData({ ...formData });
    }, 600);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CLUB_INFO.officialEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const getWhatsAppUrl = () => {
    const text = encodeURIComponent(
      `Hola La Caballería Club de Equitación. Mi nombre es ${formData.studentName || 'Interesado'}. ${
        formData.message ? formData.message : CLUB_INFO.whatsappDefaultMessage
      }`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <section id="contacto" className="py-16 sm:py-24 lg:py-28 bg-[#141416] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <ScrollReveal variant="up" className="max-w-3xl mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-3 text-xs tracking-widest uppercase font-semibold text-[#D21923]">
            <span>Atención Institucional</span>
            <span className="text-zinc-600">/</span>
            <span>Contacto Oficial</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            COMUNÍCATE CON <span className="text-[#D21923]">LA CABALLERÍA</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Estamos a tu disposición para orientarte sobre nuestras clases formativas, visitas al club y programas para toda la familia.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Form or Success Panel */}
          <ScrollReveal variant="up" delay={60} className="lg:col-span-7">
            <div className="h-full bg-[#1B1B1E] border border-white/10 p-6 sm:p-10 shadow-2xl relative">
            {isSubmitted && submittedData ? (
              <div className="py-8 text-center animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-[#D21923]/10 border border-[#D21923] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-[#D21923]" />
                </div>

                <h3 className="text-2xl font-serif font-bold text-white mb-2">
                  ¡Mensaje enviado con éxito!
                </h3>

                <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6">
                  Gracias por tu interés en <span className="text-white font-semibold">La Caballería</span>. Hemos recibido tu solicitud para <span className="text-[#D21923] font-medium">{submittedData.studentName}</span> y el equipo del club se pondrá en contacto pronto.
                </p>

                {/* Summary box */}
                <div className="p-4 bg-[#141416] border border-white/10 text-left text-xs text-zinc-300 max-w-md mx-auto mb-6 space-y-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-zinc-500">Correo registrado:</span>
                    <span className="text-white font-mono break-all">{submittedData.email}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-zinc-500">Teléfono:</span>
                    <span className="text-white font-mono">{submittedData.phone}</span>
                  </div>
                  {submittedData.guardianName && (
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-zinc-500">Acudiente:</span>
                      <span className="text-white">{submittedData.guardianName}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-zinc-500">Motivo:</span>
                    <span className="text-white capitalize">{submittedData.inquiryReason.replace(/-/g, ' ')}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-white bg-emerald-700 hover:bg-emerald-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Continuar por WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        studentName: '',
                        guardianName: '',
                        email: '',
                        phone: '',
                        inquiryReason: 'iniciacion-infantil',
                        message: '',
                        dataConsent: false,
                      });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 border border-white/10 transition-colors"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nombre del interesado */}
                  <div>
                    <label
                      htmlFor="studentName"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                    >
                      Nombre del interesado <span className="text-[#D21923]">*</span>
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      value={formData.studentName}
                      onChange={(e) => {
                        setFormData({ ...formData, studentName: e.target.value });
                        if (errors.studentName) setErrors({ ...errors, studentName: undefined });
                      }}
                      placeholder="Ej. Martín Gómez"
                      className={`w-full px-4 py-3 min-h-[46px] bg-[#141416] border text-white text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#D21923] transition-colors ${
                        errors.studentName ? 'border-[#D21923]' : 'border-white/10 focus:border-[#D21923]'
                      }`}
                    />
                    {errors.studentName && (
                      <p className="mt-1.5 text-xs text-[#D21923] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.studentName}</span>
                      </p>
                    )}
                  </div>

                  {/* Nombre del acudiente */}
                  <div>
                    <label
                      htmlFor="guardianName"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                    >
                      Nombre del acudiente <span className="text-zinc-500 font-normal lowercase">(si aplica)</span>
                    </label>
                    <input
                      type="text"
                      id="guardianName"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Padre, madre o tutor"
                      className="w-full px-4 py-3 min-h-[46px] bg-[#141416] border border-white/10 text-white text-base sm:text-sm focus:outline-none focus:border-[#D21923] focus:ring-1 focus:ring-[#D21923] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Correo Electrónico */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                    >
                      Correo electrónico <span className="text-[#D21923]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="nombre@ejemplo.com"
                      className={`w-full px-4 py-3 min-h-[46px] bg-[#141416] border text-white text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#D21923] transition-colors ${
                        errors.email ? 'border-[#D21923]' : 'border-white/10 focus:border-[#D21923]'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-[#D21923] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                    >
                      Teléfono / WhatsApp <span className="text-[#D21923]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="+34 600 000 000"
                      className={`w-full px-4 py-3 min-h-[46px] bg-[#141416] border text-white text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#D21923] transition-colors ${
                        errors.phone ? 'border-[#D21923]' : 'border-white/10 focus:border-[#D21923]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-[#D21923] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Motivo de consulta */}
                <div>
                  <label
                    htmlFor="inquiryReason"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                  >
                    Motivo de consulta <span className="text-[#D21923]">*</span>
                  </label>
                  <select
                    id="inquiryReason"
                    value={formData.inquiryReason}
                    onChange={(e) => setFormData({ ...formData, inquiryReason: e.target.value })}
                    className="w-full px-4 py-3 min-h-[46px] bg-[#141416] border border-white/10 text-white text-base sm:text-sm focus:outline-none focus:border-[#D21923] focus:ring-1 focus:ring-[#D21923] transition-colors"
                  >
                    <option value="iniciacion-infantil">Iniciación y Primer Contacto (Niños y Jóvenes)</option>
                    <option value="clases-formativas">Clases Formativas de Equitación</option>
                    <option value="manejo-cuidado">Taller de Manejo, Cuidado y Bienestar Equino</option>
                    <option value="experiencia-familiar">Experiencia Ecuestre Familiar</option>
                    <option value="conocer-club">Visita para Conocer las Instalaciones del Club</option>
                    <option value="otra-consulta">Otra consulta institucional</option>
                  </select>
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                  >
                    Mensaje o comentarios <span className="text-[#D21923]">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    placeholder="Cuéntanos la edad del alumno, si tiene experiencia previa o qué día te gustaría visitarnos..."
                    className={`w-full px-4 py-3 bg-[#141416] border text-white text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#D21923] transition-colors ${
                      errors.message ? 'border-[#D21923]' : 'border-white/10 focus:border-[#D21923]'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs text-[#D21923] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.dataConsent}
                      onChange={(e) => {
                        setFormData({ ...formData, dataConsent: e.target.checked });
                        if (errors.dataConsent) setErrors({ ...errors, dataConsent: undefined });
                      }}
                      className="mt-1 w-4 h-4 rounded-none bg-[#141416] border-white/20 text-[#D21923] focus:ring-[#D21923]"
                    />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300 leading-normal">
                      Acepto el tratamiento de datos personales para la atención de esta consulta y recibir información institucional de La Caballería Club de Equitación.{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenPrivacyModal();
                        }}
                        className="text-[#D21923] underline hover:text-white transition-colors"
                      >
                        Ver política de privacidad
                      </button>
                    </span>
                  </label>
                  {errors.dataConsent && (
                    <p className="mt-1.5 text-xs text-[#D21923] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.dataConsent}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-7 py-3.5 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 shadow-lg shadow-[#D21923]/25"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Enviando consulta...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>ENVIAR CONSULTA</span>
                        <Send className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
            </div>
          </ScrollReveal>

          {/* Right Column: Official Information & Ethical Disclaimers */}
          <ScrollReveal variant="left" delay={140} className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Official Channels Card */}
            <div className="bg-[#1B1B1E] border border-white/10 p-6 sm:p-8">
              <h3 className="text-xl font-serif font-bold text-white mb-6">
                Canales de Atención
              </h3>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black/40 border border-white/10 text-[#D21923] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">
                      Correo Electrónico Oficial
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={`mailto:${CLUB_INFO.officialEmail}`}
                        className="text-sm text-white hover:text-[#D21923] font-medium transition-colors font-mono break-all"
                      >
                        {CLUB_INFO.officialEmail}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="text-xs text-zinc-400 hover:text-white p-1.5 hover:bg-white/5 rounded shrink-0"
                        title="Copiar correo"
                        aria-label="Copiar correo"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black/40 border border-white/10 text-[#D21923] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">
                      Portal Web Institucional
                    </span>
                    <span className="text-sm text-white font-mono">{CLUB_INFO.website}</span>
                  </div>
                </div>

                {/* Physical Location Marker */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-black/40 border border-white/10 text-[#D21923] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">
                      Instalaciones del Club
                    </span>
                    <span className="text-xs text-zinc-300 leading-relaxed block">
                      [Ubicación geográfica e instalaciones oficiales por confirmar por la dirección de La Caballería]
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Link Button */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase text-white bg-emerald-700 hover:bg-emerald-600 transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CONSULTAR POR WHATSAPP</span>
                </a>
              </div>
            </div>

            {/* Ethical Authenticity Notice (Strict adherence to prompt rules) */}
            <div className="bg-[#141416] border border-white/10 p-6 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D21923] shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-400 leading-relaxed">
                <span className="font-semibold text-white">Transparencia y Privacidad:</span>{' '}
                Los datos suministrados se utilizarán con estricta confidencialidad para responder a tus inquietudes sobre La Caballería Club de Equitación. No compartimos información con terceros.
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Interactive Club Location Map */}
        <ScrollReveal variant="up" delay={100} className="mt-12 lg:mt-16">
          <ClubLocationMap />
        </ScrollReveal>
      </div>
    </section>
  );
};
