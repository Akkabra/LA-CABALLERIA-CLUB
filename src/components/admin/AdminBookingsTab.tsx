import React, { useState } from 'react';
import {
  Check,
  Loader2,
  Download,
  Search,
  Calendar,
  Mail,
  LayoutList,
  CalendarDays,
  FileText,
  Award,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { AppointmentBooking } from '../../types';
import { LiveBookingsPanel } from '../LiveBookingsPanel';
import { AdminMonthlyCalendar } from '../AdminMonthlyCalendar';
import {
  generateMonthlyBookingsPdfReport,
  computeMonthlyInstructorStats,
} from '../../utils/monthlyPdfReport';

interface AdminBookingsTabProps {
  bookings: AppointmentBooking[];
  isLoadingBookings: boolean;
  isRealtimeConnected: boolean;
  onUpdateBookingStatus: (
    id: string,
    status: AppointmentBooking['status']
  ) => Promise<AppointmentBooking>;
  onDeleteBooking: (id: string) => Promise<void>;
  onSendTestEmail: () => Promise<{ provider?: string; recipient?: string }>;
}

export const AdminBookingsTab: React.FC<AdminBookingsTabProps> = ({
  bookings,
  isLoadingBookings,
  isRealtimeConnected,
  onUpdateBookingStatus,
  onDeleteBooking,
  onSendTestEmail,
}) => {
  const nowDate = new Date();
  const [reportYear, setReportYear] = useState<number>(nowDate.getFullYear());
  const [reportMonth, setReportMonth] = useState<number>(nowDate.getMonth());
  const [bookingsViewMode, setBookingsViewMode] = useState<'calendario' | 'lista'>('calendario');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingDateFilter, setBookingDateFilter] = useState('');
  const [showCitasTools, setShowCitasTools] = useState(false);

  const [csvExported, setCsvExported] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const reportMonthValue = `${reportYear}-${String(reportMonth + 1).padStart(2, '0')}`;
  const monthlyStatsPreview = computeMonthlyInstructorStats(
    bookings,
    reportYear,
    reportMonth
  );

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailFeedback(null);
    try {
      const res = await onSendTestEmail();
      setTestEmailFeedback({
        type: 'success',
        message: `Aviso de prueba enviado correctamente a ${res.recipient || 'administración'}.`,
      });
    } catch (err) {
      setTestEmailFeedback({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'No se pudo enviar el correo de prueba.',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const escapeCsvCell = (value: string | number | undefined | null): string => {
    const str = String(value ?? '');
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportBookingsCsv = () => {
    if (bookings.length === 0) return;

    const headers = [
      'Código de Reserva',
      'Estado',
      'Tipo de Clase',
      'Profesor',
      'Fecha',
      'Fecha Formateada',
      'Horario',
      'Alumno',
      'Edad',
      'Acudiente',
      'Teléfono',
      'Correo Electrónico',
      'Nivel de Experiencia',
      'Observaciones',
      'Fecha de Registro',
    ];

    const rows = bookings.map((b) =>
      [
        b.bookingCode,
        b.status,
        b.classTypeName,
        b.instructorName,
        b.date,
        b.formattedDate,
        b.timeSlot,
        b.studentName,
        b.studentAge,
        b.guardianName,
        b.phone,
        b.email,
        b.experienceLevel,
        b.notes,
        b.createdAt,
      ]
        .map(escapeCsvCell)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const todayStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `citas-la-caballeria-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvExported(true);
    setTimeout(() => setCsvExported(false), 2500);
  };

  const handleReportMonthInput = (value: string) => {
    const [yStr, mStr] = value.split('-');
    const y = Number(yStr);
    const m = Number(mStr);
    if (y && m >= 1 && m <= 12) {
      setReportYear(y);
      setReportMonth(m - 1);
      setPdfFeedback(null);
    }
  };

  const handleGenerateMonthlyPdf = () => {
    try {
      const summary = generateMonthlyBookingsPdfReport(
        bookings,
        reportYear,
        reportMonth
      );
      const topNote = summary.preferredInstructor
        ? ` · Instructor preferido: ${summary.preferredInstructor.instructorName} (${summary.preferredInstructor.total})`
        : '';
      setPdfFeedback({
        type: 'success',
        message: `PDF generado (${summary.fileName}): ${summary.totalBookings} cita(s) en ${summary.monthLabel}${topNote}.`,
      });
    } catch (err) {
      setPdfFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? `No se pudo generar el reporte PDF: ${err.message}`
            : 'Error al generar el reporte PDF mensual.',
      });
    }
  };

  return (
    <section
      role="tabpanel"
      id="admin-tabpanel-citas"
      aria-labelledby="admin-tab-citas"
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 py-4 sm:py-5"
    >
      <div className="space-y-4 pb-2">
        {/* Compact Controls Bar: View Switcher + Tools Toggle + Search */}
        <div className="bg-[#1A1A1D] border border-white/10 p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/10">
            <div className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto bg-[#141416] border border-white/10 p-1 gap-1">
              <button
                type="button"
                onClick={() => setBookingsViewMode('calendario')}
                className={`justify-center inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  bookingsViewMode === 'calendario'
                    ? 'bg-[#D21923] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                <span>Calendario</span>
              </button>
              <button
                type="button"
                onClick={() => setBookingsViewMode('lista')}
                className={`justify-center inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  bookingsViewMode === 'lista'
                    ? 'bg-[#D21923] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5 shrink-0" />
                <span>Lista</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCitasTools((prev) => !prev)}
              aria-expanded={showCitasTools}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[42px] text-[11px] font-semibold uppercase tracking-wider border transition-colors whitespace-nowrap ${
                showCitasTools
                  ? 'bg-white/10 border-[#D21923]/60 text-white'
                  : 'bg-[#141416] border-white/15 text-zinc-200 hover:text-white hover:border-white/30'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
              <span>Reportes, CSV y Email</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  showCitasTools ? 'rotate-180 text-[#D21923]' : 'text-zinc-400'
                }`}
              />
            </button>
          </div>

          {showCitasTools && (
            <div className="p-3.5 bg-[#141416] border border-white/10 space-y-4">
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                      <span>Reporte Mensual en PDF</span>
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>
                        Citas en el mes:{' '}
                        <strong className="font-mono tabular-nums text-white">
                          {monthlyStatsPreview.monthBookings.length}
                        </strong>
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                        <span>
                          Preferido:{' '}
                          <strong className="text-white">
                            {monthlyStatsPreview.preferredInstructor
                              ? `${monthlyStatsPreview.preferredInstructor.instructorName} (${monthlyStatsPreview.preferredInstructor.total})`
                              : 'Sin datos'}
                          </strong>
                        </span>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="month"
                    value={reportMonthValue}
                    onChange={(e) => handleReportMonthInput(e.target.value)}
                    aria-label="Seleccionar mes para reporte PDF"
                    className="w-full px-3 py-2 min-h-[44px] bg-[#1A1A1D] border border-white/15 text-base sm:text-xs text-white focus:outline-none focus:border-[#D21923] [color-scheme:dark]"
                  />

                  <button
                    type="button"
                    onClick={handleGenerateMonthlyPdf}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors whitespace-nowrap"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Generar PDF Mensual</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportBookingsCsv}
                  disabled={bookings.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider border border-white/15 bg-[#1A1A1D] hover:bg-white hover:text-[#141416] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {csvExported ? (
                    <>
                      <Check className="w-4 h-4 text-[#D21923] shrink-0" />
                      <span>CSV Descargado</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#D21923] shrink-0" />
                      <span>Descargar Historial CSV</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTestEmail}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider border border-white/15 bg-[#1A1A1D] hover:bg-white hover:text-[#141416] text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isSendingTestEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D21923] shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 text-[#D21923] shrink-0" />
                  )}
                  <span>{isSendingTestEmail ? 'Enviando...' : 'Probar Aviso Email'}</span>
                </button>
              </div>

              {pdfFeedback && (
                <div
                  className={`p-3 border text-xs flex items-center justify-between gap-3 ${
                    pdfFeedback.type === 'success'
                      ? 'bg-[#1A1A1D] border-white/20 text-white'
                      : 'bg-[#D21923]/15 border-[#D21923] text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Check className="w-4 h-4 text-[#D21923] shrink-0" />
                    <span>{pdfFeedback.message}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPdfFeedback(null)}
                    className="text-zinc-400 hover:text-white p-1 shrink-0"
                    aria-label="Cerrar aviso de PDF"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {testEmailFeedback && (
                <div
                  className={`p-3.5 border text-xs flex items-start justify-between gap-3 ${
                    testEmailFeedback.type === 'success'
                      ? 'bg-[#1A1A1D] border-white/20 text-white'
                      : 'bg-[#D21923]/15 border-[#D21923] text-white'
                  }`}
                >
                  <div className="space-y-2 leading-relaxed">
                    <p>{testEmailFeedback.message}</p>
                    {testEmailFeedback.type === 'error' &&
                      (testEmailFeedback.message.includes('SMTP_USER') ||
                        testEmailFeedback.message.includes('RESEND_API_KEY')) && (
                        <ul className="text-[11px] text-zinc-300 space-y-1 list-disc pl-4">
                          <li>
                            <strong className="text-white">Gmail (SMTP):</strong> agrega{' '}
                            <code className="font-mono text-white">SMTP_HOST=smtp.gmail.com</code>,{' '}
                            <code className="font-mono text-white">SMTP_USER</code> y{' '}
                            <code className="font-mono text-white">SMTP_PASS</code> (Contraseña de aplicación de Google).
                          </li>
                          <li>
                            <strong className="text-white">Resend:</strong> agrega{' '}
                            <code className="font-mono text-white">RESEND_API_KEY</code> en los Secrets del proyecto o en Vercel.
                          </li>
                        </ul>
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestEmailFeedback(null)}
                    className="text-zinc-400 hover:text-white p-1 shrink-0"
                    aria-label="Cerrar aviso"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-[#D21923] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                placeholder="Buscar por nombre del alumno, código o fecha..."
                aria-label="Buscar citas por nombre del alumno o fecha"
                className="w-full pl-10 pr-9 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-base sm:text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#D21923]"
              />
              {bookingSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBookingSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {bookingsViewMode === 'lista' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 sm:flex-initial min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-[#D21923] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={bookingDateFilter}
                    onChange={(e) => setBookingDateFilter(e.target.value)}
                    aria-label="Filtrar por fecha específica"
                    className="w-full sm:w-auto pl-9 pr-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-base sm:text-xs text-white focus:outline-none focus:border-[#D21923] [color-scheme:dark]"
                  />
                </div>

                {(bookingSearchQuery || bookingDateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSearchQuery('');
                      setBookingDateFilter('');
                    }}
                    className="px-3.5 py-2.5 min-h-[44px] text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141416] border border-white/15 hover:border-[#D21923] transition-colors shrink-0 whitespace-nowrap"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {bookingsViewMode === 'calendario' ? (
          <AdminMonthlyCalendar
            bookings={bookings}
            searchQuery={bookingSearchQuery}
            viewYear={reportYear}
            viewMonth={reportMonth}
            onMonthChange={(y, m) => {
              setReportYear(y);
              setReportMonth(m);
              setPdfFeedback(null);
            }}
            onUpdateStatus={onUpdateBookingStatus}
            onDeleteBooking={onDeleteBooking}
            onFilterListByDate={(iso) => {
              setBookingDateFilter(iso);
              setBookingsViewMode('lista');
            }}
          />
        ) : (
          <LiveBookingsPanel
            bookings={bookings}
            isLoading={isLoadingBookings}
            isConnected={isRealtimeConnected}
            onUpdateStatus={onUpdateBookingStatus}
            onDeleteBooking={onDeleteBooking}
            embeddedInAdmin
            externalSearchTerm={bookingSearchQuery}
            externalDateFilter={bookingDateFilter}
          />
        )}
      </div>
    </section>
  );
};
