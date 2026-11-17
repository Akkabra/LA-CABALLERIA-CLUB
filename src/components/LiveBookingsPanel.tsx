import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageCircle,
  Radio,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { AppointmentBooking } from '../types';
import { INSTRUCTORS } from '../data/clubData';

interface LiveBookingsPanelProps {
  bookings: AppointmentBooking[];
  isLoading: boolean;
  isConnected: boolean;
  onUpdateStatus: (id: string, status: AppointmentBooking['status']) => Promise<AppointmentBooking>;
  onDeleteBooking: (id: string) => Promise<void>;
  onJumpToWizard?: () => void;
  embeddedInAdmin?: boolean;
  externalSearchTerm?: string;
  externalDateFilter?: string;
}

export const LiveBookingsPanel: React.FC<LiveBookingsPanelProps> = ({
  bookings,
  isLoading,
  isConnected,
  onUpdateStatus,
  onDeleteBooking,
  onJumpToWizard,
  embeddedInAdmin = false,
  externalSearchTerm,
  externalDateFilter = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [statusFilter, setStatusFilter] = useState<'todas' | AppointmentBooking['status']>('todas');
  const [instructorFilter, setInstructorFilter] = useState<string>('todos');
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isExternallyControlledSearch = externalSearchTerm !== undefined;
  const searchTerm = isExternallyControlledSearch ? externalSearchTerm : internalSearchTerm;

  const counts = useMemo(() => {
    return {
      total: bookings.length,
      confirmadas: bookings.filter((b) => b.status === 'confirmada').length,
      solicitadas: bookings.filter((b) => b.status === 'solicitada').length,
      canceladas: bookings.filter((b) => b.status === 'cancelada').length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return bookings
      .filter((b) => (statusFilter === 'todas' ? true : b.status === statusFilter))
      .filter((b) => (instructorFilter === 'todos' ? true : b.instructorId === instructorFilter))
      .filter((b) => (externalDateFilter ? b.date === externalDateFilter : true))
      .filter((b) => {
        if (!q) return true;
        return (
          b.studentName.toLowerCase().includes(q) ||
          b.bookingCode.toLowerCase().includes(q) ||
          b.classTypeName.toLowerCase().includes(q) ||
          b.instructorName.toLowerCase().includes(q) ||
          b.guardianName.toLowerCase().includes(q) ||
          b.date.toLowerCase().includes(q) ||
          b.formattedDate.toLowerCase().includes(q)
        );
      });
  }, [bookings, statusFilter, instructorFilter, externalDateFilter, searchTerm]);

  const handleStatusChange = async (id: string, status: AppointmentBooking['status']) => {
    setBusyId(id);
    setActionError(null);
    try {
      await onUpdateStatus(id, status);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al actualizar estado.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await onDeleteBooking(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al eliminar la cita.');
    } finally {
      setBusyId(null);
    }
  };

  const buildWhatsappHref = (booking: AppointmentBooking) => {
    const message = encodeURIComponent(
      `*SEGUIMIENTO DE CITA - LA CABALLERÍA*\n` +
        `Código: ${booking.bookingCode}\n` +
        `Clase: ${booking.classTypeName}\n` +
        `Profesor: ${booking.instructorName}\n` +
        `Fecha: ${booking.formattedDate}\n` +
        `Horario: ${booking.timeSlot}\n` +
        `Alumno: ${booking.studentName} (${booking.studentAge})\n` +
        `Estado actual: ${booking.status.toUpperCase()}`
    );
    return `https://wa.me/?text=${message}`;
  };

  const formatCreatedTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div id="citas-en-vivo" className={embeddedInAdmin ? '' : 'mt-14 pt-12 border-t border-white/10'}>
      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-[#D21923] font-bold mb-2">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && !prefersReducedMotion && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D21923] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isConnected ? 'bg-[#D21923]' : 'bg-zinc-600'
                }`}
              />
            </span>
            <Radio className="w-3.5 h-3.5 text-[#D21923]" />
            <span>Agenda en Tiempo Real</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-normal">
              {isConnected ? 'Sincronizado en vivo' : 'Reconectando...'}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            CITAS AGENDADAS <span className="italic font-normal text-[#D21923]">EN PISTA</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Consulta al instante las reservas registradas, verifica horarios ocupados y gestiona confirmaciones o cancelaciones con actualización simultánea.
          </p>
        </div>

        {/* Clean metric counters (no pill clutter) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6 bg-[#1A1A1D] border border-white/10 px-4 sm:px-5 py-3.5">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Total</span>
            <span className="text-lg font-mono font-bold text-white">{counts.total}</span>
          </div>
          <div className="hidden sm:block h-7 w-[1px] bg-white/10" />
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Confirmadas</span>
            <span className="text-lg font-mono font-bold text-[#D21923]">{counts.confirmadas}</span>
          </div>
          <div className="hidden sm:block h-7 w-[1px] bg-white/10" />
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Solicitadas</span>
            <span className="text-lg font-mono font-bold text-zinc-200">{counts.solicitadas}</span>
          </div>
          {counts.canceladas > 0 && (
            <>
              <div className="hidden sm:block h-7 w-[1px] bg-white/10" />
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-zinc-500">Canceladas</span>
                <span className="text-lg font-mono font-bold text-zinc-500">{counts.canceladas}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#1A1A1D] border border-white/10 p-4 mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'todas', label: 'Todas' },
              { id: 'confirmada', label: 'Confirmadas' },
              { id: 'solicitada', label: 'Solicitadas' },
              { id: 'cancelada', label: 'Canceladas' },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider transition-colors border ${
                  active
                    ? 'bg-[#D21923] border-[#D21923] text-white'
                    : 'bg-[#141416] border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Instructor + optional internal Search */}
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 md:max-w-lg justify-end">
          <select
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
            aria-label="Filtrar por profesor"
            className="px-3 py-2 min-h-[42px] bg-[#141416] border border-white/10 text-base sm:text-xs text-zinc-200 focus:outline-none focus:border-[#D21923]"
          >
            <option value="todos">Todos los profesores</option>
            {INSTRUCTORS.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>

          {!isExternallyControlledSearch && (
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={internalSearchTerm}
                onChange={(e) => setInternalSearchTerm(e.target.value)}
                placeholder="Buscar alumno, fecha o código..."
                className="w-full pl-9 pr-3 py-2 min-h-[42px] bg-[#141416] border border-white/10 text-base sm:text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#D21923]"
              />
            </div>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-[#D21923]/15 border border-[#D21923] text-xs text-white">
          {actionError}
        </div>
      )}

      {/* Bookings Grid / Empty State */}
      {isLoading ? (
        <div className="bg-[#1A1A1D] border border-white/10 p-12 text-center text-xs text-zinc-400">
          Sincronizando agenda en pista...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-[#1A1A1D] border border-white/10 p-10 sm:p-14 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border border-[#D21923]/40 bg-[#D21923]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D21923]" />
          </div>
          <h4 className="text-lg font-serif font-bold text-white mb-2">
            {bookings.length === 0
              ? 'Aún no hay citas registradas en pista'
              : 'No hay citas que coincidan con los filtros'}
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6">
            {bookings.length === 0
              ? 'Completa el formulario superior para agendar una clase. Aparecerá al instante aquí y en cualquier pantalla conectada.'
              : 'Prueba ajustando el filtro de estado, profesor o término de búsqueda.'}
          </p>
          {bookings.length === 0 && onJumpToWizard && (
            <button
              type="button"
              onClick={onJumpToWizard}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors"
            >
              Agendar Primera Cita
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {filteredBookings.map((booking) => {
              const isBusy = busyId === booking.id;
              const isCancelled = booking.status === 'cancelada';

              return (
                <motion.article
                  key={booking.id}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className={`bg-[#1A1A1D] border transition-colors p-5 flex flex-col justify-between ${
                    isCancelled
                      ? 'border-white/5 opacity-65'
                      : booking.status === 'confirmada'
                      ? 'border-white/15 hover:border-[#D21923]/60'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div>
                    {/* Top bar: Code + Status + Created Time */}
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#D21923]">
                          {booking.bookingCode}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-[11px] text-zinc-400">
                          Reg. {formatCreatedTime(booking.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 border ${
                          booking.status === 'confirmada'
                            ? 'bg-[#D21923]/15 border-[#D21923]/60 text-white'
                            : booking.status === 'solicitada'
                            ? 'bg-white/5 border-white/25 text-zinc-200'
                            : 'bg-black/40 border-white/10 text-zinc-500'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Class & Instructor */}
                    <div className="mb-4">
                      <h4
                        className={`text-base sm:text-lg font-serif font-bold text-white ${
                          isCancelled ? 'line-through text-zinc-400' : ''
                        }`}
                      >
                        {booking.classTypeName}
                      </h4>
                      <p className="text-xs text-[#D21923] font-medium mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{booking.instructorName}</span>
                      </p>
                    </div>

                    {/* Schedule & Student grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#141416] border border-white/5 text-xs mb-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          Fecha
                        </span>
                        <span className="text-zinc-100 font-medium capitalize flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                          <span className="truncate">{booking.formattedDate}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          Horario
                        </span>
                        <span className="text-white font-mono font-semibold flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                          <span>{booking.timeSlot}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          Alumno
                        </span>
                        <span className="text-white font-medium block mt-0.5 truncate">
                          {booking.studentName} ({booking.studentAge})
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
                          Nivel / Acudiente
                        </span>
                        <span className="text-zinc-300 block mt-0.5 truncate">
                          {booking.experienceLevel}
                        </span>
                      </div>
                    </div>

                    {booking.notes && booking.notes !== 'Sin observaciones previas' && (
                      <p className="text-[11px] text-zinc-400 italic mb-4 line-clamp-2">
                        Nota: "{booking.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {booking.status !== 'confirmada' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusChange(booking.id, 'confirmada')}
                          className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors disabled:opacity-50"
                        >
                          {booking.status === 'cancelada' ? (
                            <RotateCcw className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span>{booking.status === 'cancelada' ? 'Reactivar' : 'Confirmar'}</span>
                        </button>
                      )}

                      {booking.status !== 'cancelada' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusChange(booking.id, 'cancelada')}
                          className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancelar</span>
                        </button>
                      )}

                      <a
                        href={buildWhatsappHref(booking)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-emerald-900/40 border border-white/10 hover:border-emerald-700/60 text-zinc-200 transition-colors"
                        title="Enviar resumen por WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(booking.id)}
                      className="inline-flex items-center justify-center p-2 min-w-[38px] min-h-[38px] text-[11px] text-zinc-500 hover:text-[#D21923] transition-colors disabled:opacity-50"
                      title="Eliminar registro"
                      aria-label={`Eliminar cita ${booking.bookingCode}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
