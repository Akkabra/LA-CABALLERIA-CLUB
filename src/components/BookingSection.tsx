import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Loader2,
  UserCheck,
  Sparkles,
  Copy,
  Check,
  CalendarPlus,
  Lock,
  Sun,
  Sunset,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ClassType, Instructor, AppointmentBooking, OccupiedSlot } from '../types';
import { CLASS_TYPES, INSTRUCTORS, TIME_SLOTS, CLUB_INFO } from '../data/clubData';
import type { CreateBookingPayload } from '../hooks/useRealtimeBookings';
import { PushNotificationWidget } from './PushNotificationWidget';

interface BookingSectionProps {
  occupiedSlots: OccupiedSlot[];
  onCreateBooking: (payload: CreateBookingPayload) => Promise<AppointmentBooking>;
  preselectedClassTypeId?: string;
  preselectedInstructorId?: string;
}

type AudienceFilter = 'all' | 'kids' | 'adults' | 'family';

interface CalendarDayOption {
  iso: string;
  dateObj: Date;
  dayOfWeekFull: string;
  dayOfWeekShort: string;
  dayNum: number;
  monthName: string;
  monthShort: string;
  year: number;
  formattedPretty: string;
  jsDay: number; // 0 = Sun ... 6 = Sat
  mondayIndex: number; // 0 = Mon ... 6 = Sun
}

const WEEKDAY_NAMES_FULL = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const WEEKDAY_HEADERS_MON = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const EXPERIENCE_OPTIONS: Array<{
  value: AppointmentBooking['experienceLevel'];
  shortLabel: string;
  hint: string;
}> = [
  {
    value: 'Sin experiencia (Primera vez)',
    shortLabel: 'Primera vez',
    hint: 'Nunca ha montado o es su primer contacto',
  },
  {
    value: 'Poco conocimiento',
    shortLabel: 'Básico',
    hint: 'Ha montado algunas veces de forma recreativa',
  },
  {
    value: 'Nivel intermedio',
    shortLabel: 'Intermedio',
    hint: 'Domina paso y trote con estabilidad',
  },
  {
    value: 'Avanzado',
    shortLabel: 'Avanzado',
    hint: 'Práctica frecuente y control en pista',
  },
];

const QUICK_NOTE_SUGGESTIONS = [
  'Primera experiencia, buscamos ritmo tranquilo',
  'Le encantan los caballos pero es algo tímido/a',
  'Interés en mejorar postura y equilibrio',
];

function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateUpcomingDays(count = 21): CalendarDayOption[] {
  const result: CalendarDayOption[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const jsDay = d.getDay();
    const mondayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const monthLong = d.toLocaleDateString('es-ES', { month: 'long' });
    const monthShort = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const dayShort = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');

    result.push({
      iso: toLocalIsoDate(d),
      dateObj: d,
      dayOfWeekFull: WEEKDAY_NAMES_FULL[jsDay],
      dayOfWeekShort: capitalize(dayShort),
      dayNum: d.getDate(),
      monthName: capitalize(monthLong),
      monthShort: capitalize(monthShort),
      year: d.getFullYear(),
      formattedPretty: d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      jsDay,
      mondayIndex,
    });
  }

  return result;
}

function matchesAudienceFilter(cls: ClassType, filter: AudienceFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'kids') {
    return cls.id === 'iniciacion-infantil' || cls.id === 'manejo-y-vinculo';
  }
  if (filter === 'adults') {
    return cls.id === 'clase-formativa' || cls.id === 'evaluacion-diagnostico' || cls.id === 'manejo-y-vinculo';
  }
  if (filter === 'family') {
    return cls.id === 'experiencia-familiar' || cls.id === 'manejo-y-vinculo';
  }
  return true;
}

function formatInstructorDaysSummary(days: string[]): string {
  if (days.length === 7) return 'Todos los días';
  return days.map((d) => d.slice(0, 3)).join(' · ');
}

function getInitials(name: string): string {
  const clean = name.replace(/^Prof\.\s*/i, '').trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  occupiedSlots,
  onCreateBooking,
  preselectedClassTypeId,
  preselectedInstructorId,
}) => {
  // 3 clear intuitive stages + step 4 as confirmed boarding pass
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');

  const [selectedClassType, setSelectedClassType] = useState<ClassType>(
    CLASS_TYPES.find((c) => c.id === preselectedClassTypeId) || CLASS_TYPES[0]
  );
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor>(
    INSTRUCTORS.find((i) => i.id === preselectedInstructorId) || INSTRUCTORS[0]
  );

  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (preselectedClassTypeId) {
      const found = CLASS_TYPES.find((c) => c.id === preselectedClassTypeId);
      if (found) setSelectedClassType(found);
    }
  }, [preselectedClassTypeId]);

  useEffect(() => {
    if (preselectedInstructorId) {
      const found = INSTRUCTORS.find((i) => i.id === preselectedInstructorId);
      if (found) setSelectedInstructor(found);
    }
  }, [preselectedInstructorId]);

  const upcomingDays = useMemo(() => generateUpcomingDays(21), []);

  const isSlotOccupied = (dateIso: string, timeSlot: string, instructorId: string): boolean => {
    if (instructorId === 'inst-cualquiera') return false;
    return occupiedSlots.some(
      (s) => s.date === dateIso && s.timeSlot === timeSlot && s.instructorId === instructorId
    );
  };

  const isInstructorAvailableOnDay = (day: CalendarDayOption, instructor: Instructor): boolean => {
    return instructor.availableDays.includes(day.dayOfWeekFull);
  };

  const getAvailableSlotsCountForDay = (day: CalendarDayOption, instructor: Instructor): number => {
    if (!isInstructorAvailableOnDay(day, instructor)) return 0;
    return TIME_SLOTS.filter((slot) => !isSlotOccupied(day.iso, slot.time, instructor.id)).length;
  };

  const [selectedDateIso, setSelectedDateIso] = useState<string>(() => {
    const firstValid = upcomingDays.find(
      (d) => isInstructorAvailableOnDay(d, selectedInstructor) && getAvailableSlotsCountForDay(d, selectedInstructor) > 0
    );
    return firstValid?.iso || upcomingDays[0].iso;
  });

  const selectedDate = useMemo(
    () => upcomingDays.find((d) => d.iso === selectedDateIso) || upcomingDays[0],
    [upcomingDays, selectedDateIso]
  );

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(TIME_SLOTS[1].time);

  // When instructor changes, ensure selectedDate is a valid working day with free slots
  useEffect(() => {
    const currentDay = upcomingDays.find((d) => d.iso === selectedDateIso);
    const currentDayValid =
      currentDay &&
      isInstructorAvailableOnDay(currentDay, selectedInstructor) &&
      getAvailableSlotsCountForDay(currentDay, selectedInstructor) > 0;

    if (!currentDayValid) {
      const nextValid = upcomingDays.find(
        (d) =>
          isInstructorAvailableOnDay(d, selectedInstructor) &&
          getAvailableSlotsCountForDay(d, selectedInstructor) > 0
      );
      if (nextValid) {
        setSelectedDateIso(nextValid.iso);
      }
    }
  }, [selectedInstructor]);

  // Ensure selectedTimeSlot switches to an open slot if the chosen slot is occupied on the chosen date
  useEffect(() => {
    if (isSlotOccupied(selectedDate.iso, selectedTimeSlot, selectedInstructor.id)) {
      const firstFree = TIME_SLOTS.find(
        (slot) => !isSlotOccupied(selectedDate.iso, slot.time, selectedInstructor.id)
      );
      if (firstFree) {
        setSelectedTimeSlot(firstFree.time);
      }
    }
  }, [selectedDate.iso, selectedInstructor.id, occupiedSlots]);

  // Student & Contact form state
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<AppointmentBooking['experienceLevel']>(
    'Sin experiencia (Primera vez)'
  );
  const [notes, setNotes] = useState('');
  const [consentData, setConsentData] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentBooking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const parsedAgeNumber = parseInt(studentAge.replace(/\D/g, ''), 10);
  const isLikelyMinor = !Number.isNaN(parsedAgeNumber) && parsedAgeNumber > 0 && parsedAgeNumber < 18;

  const selectedSlotOccupied = isSlotOccupied(
    selectedDate.iso,
    selectedTimeSlot,
    selectedInstructor.id
  );
  const selectedDayUnavailableForInstructor = !isInstructorAvailableOnDay(
    selectedDate,
    selectedInstructor
  );

  const filteredClasses = useMemo(
    () => CLASS_TYPES.filter((c) => matchesAudienceFilter(c, audienceFilter)),
    [audienceFilter]
  );

  const calendarMonthHeading = useMemo(() => {
    const first = upcomingDays[0];
    const last = upcomingDays[upcomingDays.length - 1];
    if (!first || !last) return '';
    if (first.monthName === last.monthName) {
      return `${first.monthName} ${first.year}`;
    }
    return `${first.monthName} — ${last.monthName} ${last.year}`;
  }, [upcomingDays]);

  const morningSlots = TIME_SLOTS.filter((s) => s.period === 'Mañana');
  const afternoonSlots = TIME_SLOTS.filter((s) => s.period === 'Tarde');

  const validateStudentData = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!studentName.trim()) newErrors.studentName = 'Escribe el nombre del alumno.';
    if (!studentAge.trim()) newErrors.studentAge = 'Indica la edad aproximada.';
    if (!phone.trim() || phone.trim().length < 7) {
      newErrors.phone = 'Ingresa un teléfono o WhatsApp válido.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!consentData) {
      newErrors.consentData = 'Acepta el tratamiento de datos para continuar.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmBooking = async () => {
    setSubmitError(null);
    if (!validateStudentData()) return;

    setIsSubmitting(true);
    try {
      const created = await onCreateBooking({
        classTypeId: selectedClassType.id,
        classTypeName: selectedClassType.name,
        instructorId: selectedInstructor.id,
        instructorName: selectedInstructor.name,
        date: selectedDate.iso,
        formattedDate: selectedDate.formattedPretty,
        timeSlot: selectedTimeSlot,
        studentName: studentName.trim(),
        studentAge: studentAge.trim(),
        guardianName: guardianName.trim() || 'No aplica (Adulto)',
        phone: phone.trim(),
        email: email.trim(),
        experienceLevel,
        notes: notes.trim() || 'Sin observaciones previas',
      });
      setConfirmedBooking(created);
      setCurrentStep(4);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'No se pudo registrar la reserva. Intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildWhatsappHref = (booking: AppointmentBooking) => {
    const message = encodeURIComponent(
      `*RESERVA DE CLASE - LA CABALLERÍA*\n` +
        `Código: ${booking.bookingCode}\n` +
        `Actividad: ${booking.classTypeName}\n` +
        `Instructor: ${booking.instructorName}\n` +
        `Fecha: ${booking.formattedDate}\n` +
        `Horario: ${booking.timeSlot}\n` +
        `Alumno: ${booking.studentName} (${booking.studentAge})\n` +
        `Acudiente: ${booking.guardianName}\n` +
        `Teléfono: ${booking.phone}\n` +
        `Nivel: ${booking.experienceLevel}\n` +
        (booking.notes ? `Notas: ${booking.notes}\n` : '') +
        `Quedo atento para confirmar mi llegada a pista.`
    );
    return `https://wa.me/?text=${message}`;
  };

  const handleDownloadIcs = (booking: AppointmentBooking) => {
    const [startRaw, endRaw] = booking.timeSlot.split('-').map((s) => s.trim());
    const dateClean = booking.date.replace(/-/g, '');
    const formatTime = (t: string) => t.replace(':', '') + '00';
    const dtStart = `${dateClean}T${formatTime(startRaw || '09:45')}`;
    const dtEnd = `${dateClean}T${formatTime(endRaw || '10:45')}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//La Caballeria//Club de Equitacion//ES',
      'BEGIN:VEVENT',
      `UID:${booking.bookingCode}@caballeriaclub.com`,
      `DTSTAMP:${dateClean}T080000`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${booking.classTypeName} · La Caballería`,
      `DESCRIPTION:Código de reserva: ${booking.bookingCode}\\nInstructor: ${booking.instructorName}\\nAlumno: ${booking.studentName}\\nRecuerda llegar 10 minutos antes con pantalón largo cómodo y calzado cerrado.`,
      'LOCATION:La Caballería Club de Equitación',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cita-${booking.bookingCode}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyBookingCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleResetBooking = () => {
    setConfirmedBooking(null);
    setCurrentStep(1);
    setStudentName('');
    setStudentAge('');
    setGuardianName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setConsentData(false);
    setErrors({});
    setSubmitError(null);
    setCopiedCode(false);
  };

  const anyInstructor = INSTRUCTORS.find((i) => i.id === 'inst-cualquiera') || INSTRUCTORS[0];

  const stepsMeta = [
    { num: 1 as const, title: 'Clase y Profesor', subtitle: 'Actividad y guía' },
    { num: 2 as const, title: 'Día y Horario', subtitle: 'Disponibilidad en vivo' },
    { num: 3 as const, title: 'Datos del Jinete', subtitle: 'Registro y pase' },
  ];

  const leadingEmptyDays = upcomingDays[0]?.mondayIndex || 0;

  return (
    <section
      id="agendar-cita"
      className="py-20 sm:py-28 bg-[#141416] relative border-b border-white/10"
    >
      {/* Subtle architectural backdrop */}
      <div className="absolute inset-0 equestrian-grid-pattern opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#D21923] font-semibold mb-3">
              Concierge de Reservas
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight text-balance leading-[1.12]">
              Agenda tu próxima experiencia{' '}
              <span className="italic font-normal text-[#D21923]">en pista</span>
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            Elige tu programa ecuestre, visualiza los horarios reales disponibles y obtén tu pase digital de inmediato. Sin pagos previos.
          </p>
        </div>

        {/* CONFIRMED VIEW: Digital Boarding Pass */}
        {currentStep === 4 && confirmedBooking ? (
          <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-[#D21923]/15 border border-[#D21923]/60 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#D21923]" />
                </div>
                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight text-balance">
                  Tu espacio en pista ha sido reservado
                </h3>
                <p className="text-sm text-zinc-300 mt-2 max-w-xl">
                  Preparamos todo para recibir a{' '}
                  <strong className="text-white font-semibold">{confirmedBooking.studentName}</strong>.
                  Guarda o comparte tu pase digital a continuación.
                </p>
              </div>

              {/* Digital Boarding Pass Card */}
              <div className="bg-[#141416] border border-white/15 rounded-xl overflow-hidden shadow-xl mb-8">
                {/* Pass Header */}
                <div className="px-6 py-5 bg-[#1F1F23] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={CLUB_INFO.logoUrl}
                      alt="La Caballería"
                      className="h-9 w-auto object-contain"
                    />
                    <div>
                      <span className="text-sm font-serif font-bold text-white block">
                        LA CABALLERÍA
                      </span>
                      <span className="text-xs text-zinc-400">
                        {CLUB_INFO.descriptor} · Pase de Acceso a Pista
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                        Código de Reserva
                      </span>
                      <span className="text-base font-mono font-bold text-[#D21923] tabular-nums">
                        {confirmedBooking.bookingCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyBookingCode(confirmedBooking.bookingCode)}
                      aria-label="Copiar código de reserva"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 transition-colors shrink-0"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Pass Details */}
                <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-white/10">
                  <div>
                    <span className="text-xs text-zinc-500 block mb-1">Actividad</span>
                    <span className="text-sm font-semibold text-white block">
                      {confirmedBooking.classTypeName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block mb-1">Instructor asignado</span>
                    <span className="text-sm font-semibold text-white block">
                      {confirmedBooking.instructorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block mb-1">Fecha y horario</span>
                    <span className="text-sm font-semibold text-white capitalize block">
                      {confirmedBooking.formattedDate}
                    </span>
                    <span className="text-sm font-mono font-semibold text-[#D21923] tabular-nums">
                      {confirmedBooking.timeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block mb-1">Alumno</span>
                    <span className="text-sm font-medium text-zinc-200">
                      {confirmedBooking.studentName} · {confirmedBooking.studentAge}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block mb-1">Acudiente / Contacto</span>
                    <span className="text-sm font-medium text-zinc-200 block">
                      {confirmedBooking.guardianName}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono tabular-nums">
                      {confirmedBooking.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block mb-1">Nivel registrado</span>
                    <span className="text-sm font-medium text-zinc-200">
                      {confirmedBooking.experienceLevel}
                    </span>
                  </div>
                </div>

                {/* Practical arrival checklist */}
                <div className="px-6 py-4 bg-[#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D21923] shrink-0" />
                    <span>
                      Casco y chaleco incluidos · Asiste 10 min antes con pantalón cómodo y zapato cerrado.
                    </span>
                  </div>
                  <span className="text-zinc-500 font-serif italic shrink-0">
                    &ldquo;{CLUB_INFO.slogan}&rdquo;
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={buildWhatsappHref(confirmedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-white bg-emerald-700 hover:bg-emerald-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Confirmar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleDownloadIcs(confirmedBooking)}
                  className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Guardar en Calendario</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetBooking}
                  className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <span>Agendar otra sesión</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE BOOKING STUDIO: 2-Column Interactive Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT 8 COLS: Guided 3-Stage Configurator */}
            <div className="lg:col-span-8 bg-[#1A1A1D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Top Interactive Step Navigation */}
              <div className="border-b border-white/10 bg-[#17171A] px-3 sm:px-8 py-3.5 sm:py-4">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-4" role="tablist" aria-label="Pasos de reserva">
                  {stepsMeta.map((step) => {
                    const isActive = currentStep === step.num;
                    const isCompleted = currentStep > step.num;
                    const canJump = step.num <= currentStep;

                    return (
                      <button
                        key={step.num}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        disabled={!canJump}
                        onClick={() => canJump && setCurrentStep(step.num)}
                        className={`group text-center sm:text-left px-1.5 sm:px-3 py-2 min-h-[48px] rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 border ${
                          isActive
                            ? 'bg-[#221A1C] border-[#D21923]/60 text-white'
                            : isCompleted
                            ? 'bg-white/[0.03] border-white/10 text-zinc-200 hover:border-white/25 cursor-pointer'
                            : 'bg-transparent border-transparent text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-mono font-bold shrink-0 transition-colors tabular-nums ${
                            isActive
                              ? 'bg-[#D21923] text-white'
                              : isCompleted
                              ? 'bg-white/15 text-white'
                              : 'bg-white/5 text-zinc-500'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                        </span>
                        <div className="min-w-0 max-w-full">
                          <span className="text-[11px] sm:text-sm font-semibold block truncate">
                            {step.title}
                          </span>
                          <span className="text-[11px] text-zinc-400 hidden sm:block truncate">
                            {step.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Content Area */}
              <div className="p-4 sm:p-8">
                {/* ====================================================== */}
                {/* STAGE 1: CLASE Y PROFESOR                              */}
                {/* ====================================================== */}
                {currentStep === 1 && (
                  <div className="space-y-10 animate-in fade-in duration-200">
                    {/* 1A: Activity / Class Type */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                            ¿Qué clase te gustaría reservar?
                          </h3>
                          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                            Filtra por perfil o elige la modalidad que mejor se adapte a tu momento.
                          </p>
                        </div>

                        {/* Interactive Audience Filter Segmented Bar */}
                        <div className="inline-flex items-center p-1 rounded-lg bg-[#121214] border border-white/10 self-start sm:self-auto shrink-0 overflow-x-auto max-w-full">
                          {(
                            [
                              { id: 'all', label: 'Todas' },
                              { id: 'kids', label: 'Niños' },
                              { id: 'adults', label: 'Adultos' },
                              { id: 'family', label: 'Familia' },
                            ] as const
                          ).map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setAudienceFilter(tab.id)}
                              className={`px-3 py-2 min-h-[38px] rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                                audienceFilter === tab.id
                                  ? 'bg-[#D21923] text-white'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {filteredClasses.map((cls) => {
                          const isSelected = selectedClassType.id === cls.id;
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => setSelectedClassType(cls)}
                              className={`group text-left p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                                isSelected
                                  ? 'bg-[#21181B] border-[#D21923] shadow-lg shadow-[#D21923]/10'
                                  : 'bg-[#141416] border-white/10 hover:border-white/25 hover:bg-[#18181B]'
                              }`}
                            >
                              <div>
                                {/* Clean unboxed typographic metadata */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <p className="text-xs text-zinc-400 truncate">
                                    <span className="text-[#D21923] font-semibold">{cls.badge}</span>
                                    <span aria-hidden="true"> · </span>
                                    <span className="tabular-nums">{cls.duration}</span>
                                  </p>
                                  <span
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'border-[#D21923] bg-[#D21923] text-white'
                                        : 'border-white/25 group-hover:border-white/50'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3" />}
                                  </span>
                                </div>

                                <h4 className="text-base sm:text-lg font-serif font-bold text-white mb-1.5">
                                  {cls.name}
                                </h4>
                                <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                                  {cls.description}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                                <span>
                                  Edad: <strong className="text-zinc-200 font-medium">{cls.recommendedAge}</strong>
                                </span>
                                <span className={isSelected ? 'text-white font-semibold' : 'text-zinc-500'}>
                                  {isSelected ? 'Seleccionada' : 'Elegir'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 1B: Instructor Selection */}
                    <div className="pt-8 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                            ¿Con qué profesor prefieres asistir?
                          </h3>
                          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                            Elige un especialista o selecciona &ldquo;Cualquier Profesor&rdquo; para ver los 7 días de la semana.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {INSTRUCTORS.map((inst) => {
                          const isSelected = selectedInstructor.id === inst.id;
                          const imgFailed = brokenImages[inst.id];
                          return (
                            <button
                              key={inst.id}
                              type="button"
                              onClick={() => setSelectedInstructor(inst)}
                              className={`group text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                                isSelected
                                  ? 'bg-[#21181B] border-[#D21923] shadow-lg shadow-[#D21923]/10'
                                  : 'bg-[#141416] border-white/10 hover:border-white/25 hover:bg-[#18181B]'
                              }`}
                            >
                              {/* Portrait with resilient fallback */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#222226] border border-white/10 shrink-0 flex items-center justify-center">
                                {!imgFailed ? (
                                  <img
                                    src={inst.photoUrl}
                                    alt={inst.name}
                                    referrerPolicy="no-referrer"
                                    onError={() =>
                                      setBrokenImages((prev) => ({ ...prev, [inst.id]: true }))
                                    }
                                    className={`w-full h-full object-cover transition-transform duration-300 ${
                                      isSelected ? 'scale-105' : 'group-hover:scale-105'
                                    }`}
                                  />
                                ) : (
                                  <span className="text-sm font-serif font-bold text-zinc-300">
                                    {getInitials(inst.name)}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-sm sm:text-base font-serif font-bold text-white truncate">
                                      {inst.name}
                                    </h4>
                                    <p className="text-xs text-[#D21923] font-medium truncate">
                                      {inst.title}
                                    </p>
                                  </div>
                                  <span
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                      isSelected
                                        ? 'border-[#D21923] bg-[#D21923] text-white'
                                        : 'border-white/25 group-hover:border-white/50'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3" />}
                                  </span>
                                </div>

                                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                                  {inst.specialty}
                                </p>

                                <p className="text-[11px] text-zinc-300 mt-2.5 flex items-center gap-1.5">
                                  <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span className="truncate">
                                    {formatInstructorDaysSummary(inst.availableDays)}
                                  </span>
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 1 Footer CTA */}
                    <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <span className="text-xs text-zinc-400 hidden sm:inline">
                        Paso 1 de 3 · Podrás cambiar tu elección en cualquier momento
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto sm:ml-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors shadow-lg shadow-[#D21923]/20"
                      >
                        <span>Ver fechas disponibles</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ====================================================== */}
                {/* STAGE 2: CALENDARIO VISUAL Y HORARIOS EN VIVO          */}
                {/* ====================================================== */}
                {currentStep === 2 && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                          Elige el día y la hora ideal
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                          Disponibilidad en tiempo real para{' '}
                          <strong className="text-white font-medium">{selectedInstructor.name}</strong>.
                        </p>
                      </div>
                      <span className="text-xs font-medium text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 self-start sm:self-auto">
                        {calendarMonthHeading}
                      </span>
                    </div>

                    {/* Mobile compact selection strip */}
                    <div className="lg:hidden flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs">
                      <span className="text-zinc-300 truncate">
                        <strong className="text-white">{selectedClassType.name}</strong> · {selectedInstructor.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[#D21923] font-semibold shrink-0"
                      >
                        Editar
                      </button>
                    </div>

                    {/* Helper notice if instructor doesn't work all 7 days */}
                    {selectedInstructor.id !== 'inst-cualquiera' && (
                      <div className="p-3.5 rounded-xl bg-[#141416] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 text-zinc-300">
                          <Info className="w-4 h-4 text-[#D21923] shrink-0" />
                          <span>
                            Este profesor atiende: <strong className="text-white">{formatInstructorDaysSummary(selectedInstructor.availableDays)}</strong>.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedInstructor(anyInstructor)}
                          className="text-xs font-semibold text-[#D21923] hover:text-white transition-colors self-start sm:self-auto whitespace-nowrap shrink-0 underline underline-offset-4"
                        >
                          Ver los 7 días con cualquier profesor
                        </button>
                      </div>
                    )}

                    {/* Proper Weekday-Aligned Calendar Grid */}
                    <div>
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
                        {WEEKDAY_HEADERS_MON.map((wd) => (
                          <div
                            key={wd}
                            className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-500 py-1"
                          >
                            {wd}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {/* Empty alignment cells so columns match actual weekdays */}
                        {Array.from({ length: leadingEmptyDays }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="min-h-[62px] sm:min-h-[76px] rounded-lg bg-white/[0.015]" />
                        ))}

                        {upcomingDays.map((day) => {
                          const worksThisDay = isInstructorAvailableOnDay(day, selectedInstructor);
                          const openCount = getAvailableSlotsCountForDay(day, selectedInstructor);
                          const isSelected = selectedDate.iso === day.iso;
                          const isDisabled = !worksThisDay || openCount === 0;
                          const showMonthTag = day.dayNum === 1 || day.iso === upcomingDays[0].iso;

                          return (
                            <button
                              key={day.iso}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setSelectedDateIso(day.iso)}
                              aria-label={`${day.formattedPretty}, ${
                                !worksThisDay
                                  ? 'profesor no atiende este día'
                                  : openCount === 0
                                  ? 'sin cupos'
                                  : `${openCount} horarios disponibles`
                              }`}
                              className={`min-h-[62px] sm:min-h-[76px] px-1 py-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all flex flex-col items-center justify-between relative ${
                                isDisabled
                                  ? 'bg-[#121214] border-white/5 text-zinc-600 cursor-not-allowed opacity-55'
                                  : isSelected
                                  ? 'bg-[#D21923] border-[#D21923] text-white shadow-lg shadow-[#D21923]/25'
                                  : 'bg-[#141416] border-white/10 text-zinc-200 hover:border-white/35 hover:bg-[#1E1E22]'
                              }`}
                            >
                              <span
                                className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-medium ${
                                  isSelected
                                    ? 'text-white/90'
                                    : showMonthTag
                                    ? 'text-[#D21923]'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {showMonthTag ? day.monthShort : day.dayOfWeekShort}
                              </span>

                              <span className="text-sm sm:text-lg font-bold tabular-nums leading-none">
                                {day.dayNum}
                              </span>

                              <span
                                className={`text-[9px] sm:text-[10px] font-medium truncate max-w-full ${
                                  isSelected
                                    ? 'text-white'
                                    : !worksThisDay
                                    ? 'text-zinc-600'
                                    : openCount === 0
                                    ? 'text-zinc-500'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {!worksThisDay ? '—' : openCount === 0 ? 'Lleno' : `${openCount} lib.`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots grouped cleanly by Mañana / Tarde */}
                    <div className="pt-6 border-t border-white/10 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white capitalize flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-[#D21923]" />
                            <span>Horarios para el {selectedDate.formattedPretty}</span>
                          </h4>
                        </div>
                        <span className="text-xs text-zinc-400">
                          Sesión de {selectedClassType.duration}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Morning */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            <Sun className="w-3.5 h-3.5 text-[#D21923]" />
                            <span>Mañana</span>
                          </div>
                          <div className="space-y-2">
                            {morningSlots.map((slot) => {
                              const occupied = isSlotOccupied(
                                selectedDate.iso,
                                slot.time,
                                selectedInstructor.id
                              );
                              const isSelected = selectedTimeSlot === slot.time && !occupied;

                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={occupied}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={`w-full min-h-[52px] px-4 py-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                                    occupied
                                      ? 'bg-[#121214] border-white/5 text-zinc-600 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-[#21181B] border-[#D21923] text-white shadow-md'
                                      : 'bg-[#141416] border-white/10 text-zinc-200 hover:border-white/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Clock
                                      className={`w-4 h-4 shrink-0 ${
                                        occupied
                                          ? 'text-zinc-600'
                                          : isSelected
                                          ? 'text-[#D21923]'
                                          : 'text-zinc-400'
                                      }`}
                                    />
                                    <span
                                      className={`text-sm font-mono font-semibold tabular-nums ${
                                        occupied ? 'line-through' : ''
                                      }`}
                                    >
                                      {slot.time}
                                    </span>
                                  </div>

                                  {occupied ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                      <Lock className="w-3 h-3" />
                                      <span>Ocupado</span>
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-xs font-medium ${
                                        isSelected
                                          ? 'text-[#D21923]'
                                          : slot.popular
                                          ? 'text-zinc-300'
                                          : 'text-zinc-400'
                                      }`}
                                    >
                                      {isSelected
                                        ? 'Elegido'
                                        : slot.popular
                                        ? 'Recomendado'
                                        : 'Disponible'}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Afternoon */}
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            <Sunset className="w-3.5 h-3.5 text-[#D21923]" />
                            <span>Tarde</span>
                          </div>
                          <div className="space-y-2">
                            {afternoonSlots.map((slot) => {
                              const occupied = isSlotOccupied(
                                selectedDate.iso,
                                slot.time,
                                selectedInstructor.id
                              );
                              const isSelected = selectedTimeSlot === slot.time && !occupied;

                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={occupied}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={`w-full min-h-[52px] px-4 py-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                                    occupied
                                      ? 'bg-[#121214] border-white/5 text-zinc-600 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-[#21181B] border-[#D21923] text-white shadow-md'
                                      : 'bg-[#141416] border-white/10 text-zinc-200 hover:border-white/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Clock
                                      className={`w-4 h-4 shrink-0 ${
                                        occupied
                                          ? 'text-zinc-600'
                                          : isSelected
                                          ? 'text-[#D21923]'
                                          : 'text-zinc-400'
                                      }`}
                                    />
                                    <span
                                      className={`text-sm font-mono font-semibold tabular-nums ${
                                        occupied ? 'line-through' : ''
                                      }`}
                                    >
                                      {slot.time}
                                    </span>
                                  </div>

                                  {occupied ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                      <Lock className="w-3 h-3" />
                                      <span>Ocupado</span>
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-xs font-medium ${
                                        isSelected
                                          ? 'text-[#D21923]'
                                          : slot.popular
                                          ? 'text-zinc-300'
                                          : 'text-zinc-400'
                                      }`}
                                    >
                                      {isSelected
                                        ? 'Elegido'
                                        : slot.popular
                                        ? 'Recomendado'
                                        : 'Disponible'}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {(selectedSlotOccupied || selectedDayUnavailableForInstructor) && (
                        <div className="p-4 rounded-xl bg-[#D21923]/15 border border-[#D21923] text-xs text-white flex items-center gap-2.5">
                          <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0" />
                          <span>
                            {selectedDayUnavailableForInstructor
                              ? `${selectedInstructor.name} no atiende este día. Selecciona otro día en el calendario o cambia a "Cualquier Profesor".`
                              : `Este horario acaba de ser ocupado con ${selectedInstructor.name}. Elige otra franja disponible.`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Step 2 Actions */}
                    <div className="pt-6 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Cambiar clase</span>
                      </button>

                      <button
                        type="button"
                        disabled={selectedSlotOccupied || selectedDayUnavailableForInstructor}
                        onClick={() => setCurrentStep(3)}
                        className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors shadow-lg shadow-[#D21923]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>Completar datos del jinete</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ====================================================== */}
                {/* STAGE 3: DATOS DEL JINETE Y CONFIRMACIÓN               */}
                {/* ====================================================== */}
                {currentStep === 3 && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                        Datos del alumno y contacto
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                        Con esta información asignamos el caballo idóneo y alistamos casco y chaleco a tu medida.
                      </p>
                    </div>

                    {/* Mobile compact selection strip */}
                    <div className="lg:hidden flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/10 text-xs">
                      <span className="text-zinc-300 truncate capitalize">
                        <strong className="text-white">{selectedDate.formattedPretty}</strong> ·{' '}
                        <span className="text-[#D21923] font-mono">{selectedTimeSlot}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[#D21923] font-semibold shrink-0"
                      >
                        Editar
                      </button>
                    </div>

                    {/* Group 1: Rider details */}
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="booking-student-name"
                            className="block text-xs font-semibold text-zinc-200 mb-1.5"
                          >
                            Nombre del alumno <span className="text-[#D21923]">*</span>
                          </label>
                          <input
                            id="booking-student-name"
                            type="text"
                            value={studentName}
                            onChange={(e) => {
                              setStudentName(e.target.value);
                              if (errors.studentName) setErrors({ ...errors, studentName: '' });
                            }}
                            placeholder="Ej. Mateo Gómez"
                            className={`w-full px-4 py-3 min-h-[46px] rounded-lg bg-[#141416] border text-white text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D21923]/60 ${
                              errors.studentName ? 'border-[#D21923]' : 'border-white/15'
                            }`}
                          />
                          {errors.studentName && (
                            <p className="text-xs text-[#D21923] mt-1.5">{errors.studentName}</p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="booking-student-age"
                            className="block text-xs font-semibold text-zinc-200 mb-1.5"
                          >
                            Edad <span className="text-[#D21923]">*</span>
                          </label>
                          <input
                            id="booking-student-age"
                            type="text"
                            value={studentAge}
                            onChange={(e) => {
                              setStudentAge(e.target.value);
                              if (errors.studentAge) setErrors({ ...errors, studentAge: '' });
                            }}
                            placeholder="Ej. 8 años"
                            className={`w-full px-4 py-3 min-h-[46px] rounded-lg bg-[#141416] border text-white text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D21923]/60 ${
                              errors.studentAge ? 'border-[#D21923]' : 'border-white/15'
                            }`}
                          />
                          {errors.studentAge && (
                            <p className="text-xs text-[#D21923] mt-1.5">{errors.studentAge}</p>
                          )}
                        </div>
                      </div>

                      {/* Interactive Experience Level Selector */}
                      <div>
                        <span className="block text-xs font-semibold text-zinc-200 mb-2">
                          Experiencia previa con caballos
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {EXPERIENCE_OPTIONS.map((opt) => {
                            const active = experienceLevel === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setExperienceLevel(opt.value)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  active
                                    ? 'bg-[#21181B] border-[#D21923] text-white'
                                    : 'bg-[#141416] border-white/10 text-zinc-300 hover:border-white/30'
                                }`}
                              >
                                <span className="text-xs font-semibold block">{opt.shortLabel}</span>
                                <span className="text-[11px] text-zinc-400 block mt-0.5 leading-snug">
                                  {opt.hint}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Group 2: Contact & Guardian */}
                    <div className="pt-6 border-t border-white/10 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="booking-phone"
                            className="block text-xs font-semibold text-zinc-200 mb-1.5"
                          >
                            Teléfono / WhatsApp <span className="text-[#D21923]">*</span>
                          </label>
                          <input
                            id="booking-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) setErrors({ ...errors, phone: '' });
                            }}
                            placeholder="+34 600 000 000"
                            className={`w-full px-4 py-3 min-h-[46px] rounded-lg bg-[#141416] border text-white text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D21923]/60 ${
                              errors.phone ? 'border-[#D21923]' : 'border-white/15'
                            }`}
                          />
                          {errors.phone && (
                            <p className="text-xs text-[#D21923] mt-1.5">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="booking-email"
                            className="block text-xs font-semibold text-zinc-200 mb-1.5"
                          >
                            Correo electrónico <span className="text-[#D21923]">*</span>
                          </label>
                          <input
                            id="booking-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            placeholder="familia@ejemplo.com"
                            className={`w-full px-4 py-3 min-h-[46px] rounded-lg bg-[#141416] border text-white text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D21923]/60 ${
                              errors.email ? 'border-[#D21923]' : 'border-white/15'
                            }`}
                          />
                          {errors.email && (
                            <p className="text-xs text-[#D21923] mt-1.5">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="booking-guardian"
                          className="block text-xs font-semibold text-zinc-200 mb-1.5"
                        >
                          Nombre del acudiente o acompañante{' '}
                          <span className="text-zinc-400 font-normal">
                            ({isLikelyMinor ? 'Recomendado para menor de edad' : 'Opcional si el alumno es adulto'})
                          </span>
                        </label>
                        <input
                          id="booking-guardian"
                          type="text"
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          placeholder="Ej. Laura Salazar"
                          className="w-full px-4 py-3 min-h-[46px] rounded-lg bg-[#141416] border border-white/15 text-white text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D21923]/60"
                        />
                      </div>

                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <label
                            htmlFor="booking-notes"
                            className="block text-xs font-semibold text-zinc-200"
                          >
                            Notas para tu instructor{' '}
                            <span className="text-zinc-400 font-normal">(opcional)</span>
                          </label>
                        </div>
                        <textarea
                          id="booking-notes"
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="¿Algo que debamos tener en cuenta? (nervios iniciales, objetivos, talla aproximada...)"
                          className="w-full px-4 py-2.5 rounded-lg bg-[#141416] border border-white/15 text-white text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D21923]/60"
                        />
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {QUICK_NOTE_SUGGESTIONS.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() =>
                                setNotes((prev) =>
                                  prev.trim() ? `${prev.trim()}. ${suggestion}` : suggestion
                                )
                              }
                              className="text-[11px] text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md px-3 py-1.5 min-h-[36px] transition-colors"
                            >
                              + {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl bg-[#141416] border border-white/10 hover:border-white/25 transition-colors">
                          <input
                            type="checkbox"
                            checked={consentData}
                            onChange={(e) => {
                              setConsentData(e.target.checked);
                              if (errors.consentData) setErrors({ ...errors, consentData: '' });
                            }}
                            className="mt-0.5 w-4 h-4 rounded bg-[#141416] border-white/25 text-[#D21923] focus:ring-[#D21923]"
                          />
                          <span className="text-xs text-zinc-300 leading-relaxed">
                            Acepto el tratamiento de mis datos personales para coordinar esta clase en La Caballería Club de Equitación.
                          </span>
                        </label>
                        {errors.consentData && (
                          <p className="text-xs text-[#D21923] mt-1.5">{errors.consentData}</p>
                        )}
                      </div>
                    </div>

                    {(submitError || selectedSlotOccupied) && (
                      <div className="p-4 rounded-xl bg-[#D21923]/15 border border-[#D21923] text-xs text-white flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0" />
                        <span>
                          {submitError ||
                            'Este horario acaba de ser reservado. Vuelve al paso anterior para elegir otro horario libre.'}
                        </span>
                      </div>
                    )}

                    {/* Step 3 Actions */}
                    <div className="pt-6 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Cambiar horario</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting || selectedSlotOccupied}
                        onClick={handleConfirmBooking}
                        className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors shadow-xl shadow-[#D21923]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>{isSubmitting ? 'Registrando cita...' : 'Confirmar reserva'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT 4 COLS: Sticky Live Reservation Summary */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-[#1A1A1D] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
              <div className="pb-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#D21923] font-semibold block">
                    Tu Pase en Vivo
                  </span>
                  <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                    Resumen de reserva
                  </h3>
                </div>
                <span className="text-xs font-mono text-zinc-400 tabular-nums">
                  Paso {currentStep}/3
                </span>
              </div>

              {/* Selected Items List */}
              <div className="space-y-4 text-sm">
                {/* 1. Class */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">
                      Actividad elegida
                    </span>
                    <p className="font-semibold text-white mt-0.5 leading-snug">
                      {selectedClassType.name}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 tabular-nums">
                      {selectedClassType.duration} · {selectedClassType.recommendedAge}
                    </p>
                  </div>
                  {currentStep !== 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#D21923] hover:text-white font-medium shrink-0 transition-colors"
                    >
                      Cambiar
                    </button>
                  )}
                </div>

                {/* 2. Instructor */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#222226] border border-white/10 shrink-0 flex items-center justify-center">
                      {!brokenImages[selectedInstructor.id] ? (
                        <img
                          src={selectedInstructor.photoUrl}
                          alt={selectedInstructor.name}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenImages((prev) => ({ ...prev, [selectedInstructor.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">
                        Instructor
                      </span>
                      <p className="font-semibold text-white truncate">
                        {selectedInstructor.name}
                      </p>
                    </div>
                  </div>
                  {currentStep !== 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#D21923] hover:text-white font-medium shrink-0 transition-colors"
                    >
                      Cambiar
                    </button>
                  )}
                </div>

                {/* 3. Date & Time */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">
                      Fecha y horario
                    </span>
                    <p className="font-semibold text-white capitalize mt-0.5 leading-snug">
                      {selectedDate.formattedPretty}
                    </p>
                    <p className="text-xs font-mono font-semibold text-[#D21923] mt-1 tabular-nums">
                      {selectedSlotOccupied || selectedDayUnavailableForInstructor
                        ? 'Por confirmar en paso 2'
                        : selectedTimeSlot}
                    </p>
                  </div>
                  {currentStep !== 2 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-[#D21923] hover:text-white font-medium shrink-0 transition-colors"
                    >
                      {currentStep === 1 ? 'Elegir' : 'Cambiar'}
                    </button>
                  )}
                </div>

                {/* 4. Rider preview if typed */}
                {studentName.trim() && (
                  <div className="pb-4 border-b border-white/10">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">
                      Jinete registrado
                    </span>
                    <p className="font-semibold text-white mt-0.5">
                      {studentName}
                      {studentAge.trim() ? ` · ${studentAge}` : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Included highlights */}
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                  <span>Casco homologado y chaleco de seguridad incluidos sin costo adicional.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                  <span>Caballo asignado según la edad, talla y experiencia del alumno.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ChevronRight className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                  <span>Confirmación directa y comprobante descargable para tu calendario.</span>
                </li>
              </ul>
            </aside>
          </div>
        )}

        {/* Web Push Subscription Widget for class availability & special events */}
        <PushNotificationWidget />
      </div>
    </section>
  );
};
