import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react';
import type { AppointmentBooking } from '../types';
import { TIME_SLOTS } from '../data/clubData';

interface AdminMonthlyCalendarProps {
  bookings: AppointmentBooking[];
  searchQuery?: string;
  viewYear?: number;
  viewMonth?: number;
  onMonthChange?: (year: number, monthZeroBased: number) => void;
  onUpdateStatus: (id: string, status: AppointmentBooking['status']) => Promise<AppointmentBooking>;
  onDeleteBooking: (id: string) => Promise<void>;
  onFilterListByDate?: (dateIso: string) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function toIsoDate(year: number, monthZeroBased: number, day: number): string {
  const m = String(monthZeroBased + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export const AdminMonthlyCalendar: React.FC<AdminMonthlyCalendarProps> = ({
  bookings,
  searchQuery = '',
  viewYear: controlledYear,
  viewMonth: controlledMonth,
  onMonthChange,
  onUpdateStatus,
  onDeleteBooking,
  onFilterListByDate,
}) => {
  const today = new Date();
  const todayIso = toIsoDate(today.getFullYear(), today.getMonth(), today.getDate());

  const [internalYear, setInternalYear] = useState<number>(today.getFullYear());
  const [internalMonth, setInternalMonth] = useState<number>(today.getMonth()); // 0-11
  const viewYear = controlledYear ?? internalYear;
  const viewMonth = controlledMonth ?? internalMonth;

  const setMonth = (nextYear: number, nextMonth: number) => {
    setInternalYear(nextYear);
    setInternalMonth(nextMonth);
    onMonthChange?.(nextYear, nextMonth);
  };

  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.studentName.toLowerCase().includes(q) ||
        b.bookingCode.toLowerCase().includes(q) ||
        b.classTypeName.toLowerCase().includes(q) ||
        b.instructorName.toLowerCase().includes(q) ||
        b.guardianName.toLowerCase().includes(q) ||
        b.date.toLowerCase().includes(q) ||
        b.formattedDate.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  // Group bookings by ISO date (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, AppointmentBooking[]>();
    for (const b of filteredBookings) {
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    }
    // Sort each day's list by timeSlot ascending
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
      map.set(key, list);
    }
    return map;
  }, [filteredBookings]);

  // Build calendar cells (Monday-first grid)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // JS getDay(): 0 = Sun, 1 = Mon ... 6 = Sat -> convert to Monday=0..Sunday=6
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;

    const cells: Array<{
      dateIso: string;
      dayNum: number;
      inCurrentMonth: boolean;
    }> = [];

    // Previous month trailing days
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      cells.push({
        dateIso: toIsoDate(prevYear, prevMonth, dayNum),
        dayNum,
        inCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        dateIso: toIsoDate(viewYear, viewMonth, day),
        dayNum: day,
        inCurrentMonth: true,
      });
    }

    // Next month leading days to fill complete 7-col rows
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      for (let day = 1; day <= needed; day++) {
        cells.push({
          dateIso: toIsoDate(nextYear, nextMonth, day),
          dayNum: day,
          inCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Monthly workload statistics
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`;
  const monthStats = useMemo(() => {
    let activeCount = 0;
    let occupiedDays = 0;
    let peakCount = 0;
    let peakDate = '';

    for (const [dateIso, list] of bookingsByDate.entries()) {
      if (!dateIso.startsWith(monthPrefix)) continue;
      const activeInDay = list.filter((b) => b.status !== 'cancelada').length;
      if (activeInDay > 0) {
        occupiedDays += 1;
        activeCount += activeInDay;
        if (activeInDay > peakCount) {
          peakCount = activeInDay;
          peakDate = dateIso;
        }
      }
    }

    return { activeCount, occupiedDays, peakCount, peakDate };
  }, [bookingsByDate, monthPrefix]);

  const monthTitle = useMemo(() => {
    const label = new Date(viewYear, viewMonth, 1).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setMonth(viewYear - 1, 11);
    } else {
      setMonth(viewYear, viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setMonth(viewYear + 1, 0);
    } else {
      setMonth(viewYear, viewMonth + 1);
    }
  };

  const handleGoToToday = () => {
    setMonth(today.getFullYear(), today.getMonth());
    setSelectedDateIso(todayIso);
  };

  const selectedDayBookings = bookingsByDate.get(selectedDateIso) || [];

  const prettySelectedDate = useMemo(() => {
    const [y, m, d] = selectedDateIso.split('-').map(Number);
    if (!y || !m || !d) return selectedDateIso;
    const dt = new Date(y, m - 1, d);
    const str = dt.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [selectedDateIso]);

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
      setConfirmDeleteId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al eliminar la cita.');
    } finally {
      setBusyId(null);
    }
  };

  const getWhatsAppHref = (booking: AppointmentBooking) => {
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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Month Controls & Workload Summary */}
      <div className="bg-[#1A1A1D] border border-white/10 p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-base sm:text-xl font-serif font-bold text-white tracking-tight flex-1 sm:flex-initial text-center sm:text-left truncate">
            {monthTitle}
          </h4>

          <button
            type="button"
            onClick={handleGoToToday}
            className="px-3 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            Hoy
          </button>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-5 text-xs pt-3 border-t border-white/10 lg:pt-0 lg:border-t-0">
          <div className="bg-[#141416] sm:bg-transparent p-2.5 sm:p-0 border border-white/5 sm:border-0">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">
              Citas del mes
            </span>
            <span className="font-mono font-bold text-white text-sm tabular-nums">
              {monthStats.activeCount}
            </span>
          </div>
          <div className="hidden sm:block h-6 w-[1px] bg-white/10" />
          <div className="bg-[#141416] sm:bg-transparent p-2.5 sm:p-0 border border-white/5 sm:border-0">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">
              Días ocupados
            </span>
            <span className="font-mono font-bold text-[#D21923] text-sm tabular-nums">
              {monthStats.occupiedDays}
            </span>
          </div>
          {monthStats.peakDate && (
            <>
              <div className="hidden sm:block h-6 w-[1px] bg-white/10" />
              <div className="col-span-2 sm:col-span-1 bg-[#141416] sm:bg-transparent p-2.5 sm:p-0 border border-white/5 sm:border-0 flex items-center justify-between sm:block">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">
                  Mayor carga
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDateIso(monthStats.peakDate)}
                  className="font-mono font-bold text-zinc-200 hover:text-[#D21923] text-xs underline decoration-white/20 py-0.5"
                >
                  {monthStats.peakDate} ({monthStats.peakCount})
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 7-Column Calendar Grid */}
      <div className="bg-[#1A1A1D] border border-white/10 overflow-hidden">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-[#141416]">
          {WEEKDAY_LABELS.map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-[10px] font-mono uppercase tracking-wider sm:tracking-widest text-zinc-400 font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell) => {
            const dayList = bookingsByDate.get(cell.dateIso) || [];
            const activeList = dayList.filter((b) => b.status !== 'cancelada');
            const confirmedCount = activeList.filter((b) => b.status === 'confirmada').length;
            const requestedCount = activeList.filter((b) => b.status === 'solicitada').length;
            const activeTotal = activeList.length;

            const isSelected = selectedDateIso === cell.dateIso;
            const isToday = todayIso === cell.dateIso;
            const loadRatio = Math.min(activeTotal / TIME_SLOTS.length, 1);

            return (
              <button
                key={cell.dateIso}
                type="button"
                onClick={() => setSelectedDateIso(cell.dateIso)}
                className={`relative min-h-[60px] sm:min-h-[88px] lg:min-h-[96px] p-1 sm:p-2 border-r border-b border-white/10 text-left flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#D21923]/15 ring-1 ring-inset ring-[#D21923]'
                    : cell.inCurrentMonth
                    ? 'bg-[#1A1A1D] hover:bg-[#222226]'
                    : 'bg-[#141416]/60 opacity-45 hover:opacity-75'
                }`}
              >
                {/* Day Number + Active Count (stacked cleanly on tiny mobile widths so nothing collides) */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-1 w-full">
                  <span
                    className={`text-[11px] sm:text-xs font-mono font-bold inline-flex items-center justify-center w-6 h-6 shrink-0 ${
                      isToday
                        ? 'bg-[#D21923] text-white'
                        : isSelected
                        ? 'text-white'
                        : cell.inCurrentMonth
                        ? 'text-zinc-200'
                        : 'text-zinc-500'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {activeTotal > 0 && (
                    <span
                      className={`text-[10px] leading-none font-mono font-bold px-1.5 py-0.5 shrink-0 ${
                        confirmedCount > 0
                          ? 'bg-[#D21923] text-white'
                          : 'bg-white/15 text-zinc-100'
                      }`}
                      title={`${confirmedCount} confirmada(s), ${requestedCount} solicitada(s)`}
                    >
                      {activeTotal}
                    </span>
                  )}
                </div>

                {/* Slot Previews (desktop/tablet) */}
                {activeTotal > 0 && (
                  <div className="hidden sm:flex flex-col gap-0.5 my-1 overflow-hidden">
                    {activeList.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="text-[9px] font-mono truncate px-1 py-0.5 bg-[#141416]/85 border-l-2 border-[#D21923] text-zinc-200"
                      >
                        {b.timeSlot.split(' - ')[0]} · {b.studentName.split(' ')[0]}
                      </div>
                    ))}
                    {activeTotal > 2 && (
                      <span className="text-[9px] font-mono text-zinc-400 pl-1">
                        +{activeTotal - 2} más
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Workload Heat Bar */}
                <div className="w-full h-1 bg-white/5 overflow-hidden mt-auto">
                  {activeTotal > 0 && (
                    <div
                      className="h-full bg-[#D21923] transition-all"
                      style={{ width: `${Math.max(loadRatio * 100, 22)}%` }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-[11px] text-zinc-400 px-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#D21923] inline-block shrink-0" />
            <span>Hoy / Confirmadas</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-white/20 inline-block shrink-0" />
            <span>Solicitadas</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-1 bg-[#D21923] inline-block shrink-0" />
            <span>Carga del día</span>
          </span>
        </div>
        <span className="text-zinc-500">Toca un día para gestionar sus citas</span>
      </div>

      {actionError && (
        <div className="p-3 bg-[#D21923]/15 border border-[#D21923] text-xs text-white">
          {actionError}
        </div>
      )}

      {/* Selected Day Agenda Detail Panel */}
      <div className="bg-[#1A1A1D] border border-white/10 p-3.5 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D21923] font-bold block">
              Detalle del día seleccionado
            </span>
            <h5 className="text-sm sm:text-lg font-serif font-bold text-white flex items-center gap-2 mt-0.5">
              <CalendarIcon className="w-4 h-4 text-[#D21923] shrink-0" />
              <span className="truncate">{prettySelectedDate}</span>
            </h5>
          </div>

          {selectedDayBookings.length > 0 && onFilterListByDate && (
            <button
              type="button"
              onClick={() => onFilterListByDate(selectedDateIso)}
              className="w-full sm:w-auto min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider bg-[#141416] border border-white/15 hover:border-[#D21923] text-zinc-200 hover:text-white transition-colors shrink-0"
            >
              <span>Ver día en Lista</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D21923]" />
            </button>
          )}
        </div>

        {selectedDayBookings.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            No hay citas registradas para esta fecha. Todos los horarios de pista están disponibles.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayBookings.map((booking) => {
              const isBusy = busyId === booking.id;
              const isCancelled = booking.status === 'cancelada';
              const isConfirmingDelete = confirmDeleteId === booking.id;

              return (
                <div
                  key={booking.id}
                  className={`p-3.5 sm:p-4 bg-[#141416] border flex flex-col gap-3.5 ${
                    isCancelled ? 'border-white/5 opacity-70' : 'border-white/10'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                        <span>{booking.timeSlot}</span>
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="font-mono text-[#D21923] font-semibold">
                        {booking.bookingCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
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

                    <p
                      className={`text-sm font-serif font-bold text-white break-words ${
                        isCancelled ? 'line-through text-zinc-400' : ''
                      }`}
                    >
                      {booking.studentName} ({booking.studentAge}) — {booking.classTypeName}
                    </p>

                    <p className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1 text-zinc-300">
                        <User className="w-3 h-3 text-[#D21923] shrink-0" />
                        <span>{booking.instructorName}</span>
                      </span>
                      <span>Tel: {booking.phone}</span>
                    </p>
                  </div>

                  {/* Clean, non-overlapping responsive action bar */}
                  {isConfirmingDelete ? (
                    <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#D21923]/10 p-2.5 border border-[#D21923]/40">
                      <span className="text-[11px] text-white font-medium">
                        ¿Eliminar esta cita permanentemente?
                      </span>
                      <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDelete(booking.id)}
                          className="min-h-[40px] px-3 py-2 text-[11px] font-bold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors disabled:opacity-50"
                        >
                          Sí, eliminar
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[40px] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-zinc-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                      {booking.status !== 'confirmada' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusChange(booking.id, 'confirmada')}
                          className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors disabled:opacity-50"
                        >
                          {booking.status === 'cancelada' ? (
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{booking.status === 'cancelada' ? 'Reactivar' : 'Confirmar'}</span>
                        </button>
                      )}

                      {booking.status !== 'cancelada' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleStatusChange(booking.id, 'cancelada')}
                          className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Cancelar</span>
                        </button>
                      )}

                      <a
                        href={getWhatsAppHref(booking)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-emerald-900/40 border border-white/10 hover:border-emerald-700/60 text-zinc-200 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setConfirmDeleteId(booking.id)}
                        className="min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider bg-white/[0.03] hover:bg-[#D21923]/15 border border-white/10 hover:border-[#D21923]/50 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 sm:ml-auto"
                        aria-label={`Eliminar cita ${booking.bookingCode}`}
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="sm:hidden">Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

