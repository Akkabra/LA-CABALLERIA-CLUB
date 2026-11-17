import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AppointmentBooking } from '../types';
import { CLUB_INFO, INSTRUCTORS } from '../data/clubData';

export interface InstructorStatRow {
  instructorId: string;
  instructorName: string;
  isAutomaticAssignment: boolean;
  total: number;
  confirmed: number;
  requested: number;
  cancelled: number;
  sharePercent: number;
}

export interface MonthlyReportSummary {
  fileName: string;
  monthLabel: string;
  totalBookings: number;
  activeBookings: number;
  preferredInstructor: InstructorStatRow | null;
}

const BRAND_BLACK: [number, number, number] = [20, 20, 22];
const BRAND_CHARCOAL: [number, number, number] = [34, 34, 38];
const BRAND_RED: [number, number, number] = [210, 25, 35];
const BRAND_WHITE: [number, number, number] = [255, 255, 255];
const TEXT_DARK: [number, number, number] = [28, 28, 32];
const TEXT_MUTED: [number, number, number] = [105, 105, 115];
const BORDER_LIGHT: [number, number, number] = [225, 225, 230];
const ROW_ALT: [number, number, number] = [248, 248, 250];

export function computeMonthlyInstructorStats(
  bookings: AppointmentBooking[],
  year: number,
  monthZeroBased: number
): {
  monthBookings: AppointmentBooking[];
  instructorStats: InstructorStatRow[];
  preferredInstructor: InstructorStatRow | null;
} {
  const monthPrefix = `${year}-${String(monthZeroBased + 1).padStart(2, '0')}-`;
  const monthBookings = bookings
    .filter((b) => b.date.startsWith(monthPrefix))
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      return dateCmp !== 0 ? dateCmp : a.timeSlot.localeCompare(b.timeSlot);
    });

  const statsMap = new Map<string, InstructorStatRow>();

  // Seed known club instructors so even those with 0 bookings appear in the monthly breakdown
  for (const inst of INSTRUCTORS) {
    statsMap.set(inst.id, {
      instructorId: inst.id,
      instructorName: inst.name,
      isAutomaticAssignment: inst.id === 'inst-cualquiera',
      total: 0,
      confirmed: 0,
      requested: 0,
      cancelled: 0,
      sharePercent: 0,
    });
  }

  for (const b of monthBookings) {
    const existing = statsMap.get(b.instructorId) || {
      instructorId: b.instructorId,
      instructorName: b.instructorName,
      isAutomaticAssignment: b.instructorId === 'inst-cualquiera',
      total: 0,
      confirmed: 0,
      requested: 0,
      cancelled: 0,
      sharePercent: 0,
    };

    existing.total += 1;
    if (b.status === 'confirmada') existing.confirmed += 1;
    else if (b.status === 'solicitada') existing.requested += 1;
    else if (b.status === 'cancelada') existing.cancelled += 1;

    statsMap.set(b.instructorId, existing);
  }

  const totalCount = monthBookings.length;
  const instructorStats = Array.from(statsMap.values())
    .map((row) => ({
      ...row,
      sharePercent: totalCount > 0 ? Math.round((row.total / totalCount) * 1000) / 10 : 0,
    }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      const aActive = a.confirmed + a.requested;
      const bActive = b.confirmed + b.requested;
      if (bActive !== aActive) return bActive - aActive;
      if (a.isAutomaticAssignment !== b.isAutomaticAssignment) {
        return a.isAutomaticAssignment ? 1 : -1;
      }
      return a.instructorName.localeCompare(b.instructorName, 'es');
    });

  const preferredSpecific =
    instructorStats.find((r) => !r.isAutomaticAssignment && r.total > 0) || null;
  const preferredFallback = instructorStats.find((r) => r.total > 0) || null;

  return {
    monthBookings,
    instructorStats,
    preferredInstructor: preferredSpecific || preferredFallback,
  };
}

function getTopDimension(
  bookings: AppointmentBooking[],
  selector: (b: AppointmentBooking) => string
): { label: string; count: number } | null {
  if (bookings.length === 0) return null;
  const counts = new Map<string, number>();
  for (const b of bookings) {
    const key = selector(b);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let topLabel = '';
  let topCount = 0;
  for (const [label, count] of counts.entries()) {
    if (count > topCount) {
      topLabel = label;
      topCount = count;
    }
  }
  return topCount > 0 ? { label: topLabel, count: topCount } : null;
}

function getLastTableFinalY(doc: jsPDF, fallbackY: number): number {
  const withTable = doc as unknown as { lastAutoTable?: { finalY?: number } };
  return typeof withTable.lastAutoTable?.finalY === 'number'
    ? withTable.lastAutoTable.finalY
    : fallbackY;
}

export function generateMonthlyBookingsPdfReport(
  bookings: AppointmentBooking[],
  year: number,
  monthZeroBased: number
): MonthlyReportSummary {
  const monthStr = String(monthZeroBased + 1).padStart(2, '0');
  const rawMonthName = new Date(year, monthZeroBased, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  const monthLabel = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  const { monthBookings, instructorStats, preferredInstructor } =
    computeMonthlyInstructorStats(bookings, year, monthZeroBased);

  const confirmedCount = monthBookings.filter((b) => b.status === 'confirmada').length;
  const requestedCount = monthBookings.filter((b) => b.status === 'solicitada').length;
  const cancelledCount = monthBookings.filter((b) => b.status === 'cancelada').length;
  const activeBookings = confirmedCount + requestedCount;

  const topTimeSlot = getTopDimension(monthBookings, (b) => b.timeSlot);
  const topClassType = getTopDimension(monthBookings, (b) => b.classTypeName);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // --- 1. BRANDED EDITORIAL HEADER ---
  doc.setFillColor(...BRAND_BLACK);
  doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setFillColor(...BRAND_RED);
  doc.rect(0, 38, pageWidth, 1.5, 'F');
  doc.rect(0, 0, 4, 38, 'F');

  doc.setTextColor(...BRAND_WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LA CABALLERÍA · CLUB DE EQUITACIÓN', margin, 14);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(210, 210, 218);
  doc.text(`"${CLUB_INFO.slogan}"`, margin, 20.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...BRAND_RED);
  doc.text('REPORTE MENSUAL DE CITAS E INSTRUCTORES PREFERIDOS', margin, 30);

  // Right-side Period & Timestamp
  doc.setTextColor(...BRAND_WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(monthLabel.toUpperCase(), pageWidth - margin, 14, { align: 'right' });

  const generatedAtStr = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(185, 185, 195);
  doc.text(`Generado: ${generatedAtStr}`, pageWidth - margin, 20.5, { align: 'right' });
  doc.text(CLUB_INFO.website, pageWidth - margin, 30, { align: 'right' });

  let cursorY = 47;

  // --- 2. EXECUTIVE KPI SUMMARY CARDS ---
  const kpiGap = 3.5;
  const kpiWidth = (contentWidth - kpiGap * 3) / 4;
  const kpiHeight = 20;

  const kpis = [
    {
      label: 'TOTAL CITAS',
      value: String(monthBookings.length),
      sub: `${year}-${monthStr}`,
      accent: BRAND_BLACK,
    },
    {
      label: 'CONFIRMADAS',
      value: String(confirmedCount),
      sub:
        monthBookings.length > 0
          ? `${Math.round((confirmedCount / monthBookings.length) * 100)}% del mes`
          : '0% del mes',
      accent: BRAND_RED,
    },
    {
      label: 'SOLICITADAS',
      value: String(requestedCount),
      sub: 'Pendientes de confirmar',
      accent: BRAND_CHARCOAL,
    },
    {
      label: 'CANCELADAS',
      value: String(cancelledCount),
      sub:
        monthBookings.length > 0
          ? `${Math.round((cancelledCount / monthBookings.length) * 100)}% cancelación`
          : '0% cancelación',
      accent: TEXT_MUTED,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (kpiWidth + kpiGap);
    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.rect(x, cursorY, kpiWidth, kpiHeight, 'FD');

    doc.setFillColor(...kpi.accent);
    doc.rect(x, cursorY, kpiWidth, 1.4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(kpi.label, x + 3.5, cursorY + 6.2);

    doc.setFontSize(14);
    doc.setTextColor(...TEXT_DARK);
    doc.text(kpi.value, x + 3.5, cursorY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(kpi.sub, x + 3.5, cursorY + 17.8);
  });

  cursorY += kpiHeight + 5;

  // --- 3. HIGHLIGHTS BAR (INSTRUCTOR PREFERIDO / HORARIO / CLASE) ---
  doc.setFillColor(...BRAND_BLACK);
  doc.rect(margin, cursorY, contentWidth, 15.5, 'F');
  doc.setFillColor(...BRAND_RED);
  doc.rect(margin, cursorY, 2.2, 15.5, 'F');

  const colW = (contentWidth - 8) / 3;
  const highlights = [
    {
      title: 'INSTRUCTOR PREFERIDO DEL MES',
      val: preferredInstructor
        ? `${preferredInstructor.instructorName} (${preferredInstructor.total} · ${preferredInstructor.sharePercent}%)`
        : 'Sin citas registradas',
    },
    {
      title: 'FRANJA HORARIA MÁS DEMANDADA',
      val: topTimeSlot ? `${topTimeSlot.label} (${topTimeSlot.count})` : 'Sin datos',
    },
    {
      title: 'ACTIVIDAD MÁS SOLICITADA',
      val: topClassType ? `${topClassType.label} (${topClassType.count})` : 'Sin datos',
    },
  ];

  highlights.forEach((h, i) => {
    const hx = margin + 5.5 + i * colW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(210, 25, 35);
    doc.text(h.title, hx, cursorY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...BRAND_WHITE);
    const clipped = doc.splitTextToSize(h.val, colW - 4);
    doc.text(clipped[0] || h.val, hx, cursorY + 11.2);
  });

  cursorY += 22;

  // --- 4. ESTADÍSTICAS DE INSTRUCTORES PREFERIDOS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text('ESTADÍSTICAS DE INSTRUCTORES PREFERIDOS', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    'Ranking por volumen de solicitudes recibidas durante el mes seleccionado',
    margin,
    cursorY + 4.5
  );

  cursorY += 7.5;

  const instructorTableBody = instructorStats.map((row, idx) => [
    `#${idx + 1}`,
    row.isAutomaticAssignment
      ? `${row.instructorName} (Automática)`
      : row.instructorName,
    String(row.total),
    String(row.confirmed),
    String(row.requested),
    String(row.cancelled),
    `${row.sharePercent.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Pos.', 'Instructor / Guía', 'Total', 'Conf.', 'Solic.', 'Canc.', 'Preferencia']],
    body: instructorTableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.2,
      cellPadding: 2.6,
      textColor: TEXT_DARK,
      lineColor: BORDER_LIGHT,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND_BLACK,
      textColor: BRAND_WHITE,
      fontStyle: 'bold',
      fontSize: 7.8,
    },
    alternateRowStyles: {
      fillColor: ROW_ALT,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 13, fontStyle: 'bold' },
      1: { cellWidth: 66 },
      2: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'left', cellWidth: 39 },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const rowStat = instructorStats[data.row.index];
        if (rowStat && rowStat.sharePercent > 0) {
          const barX = data.cell.x + 15;
          const barY = data.cell.y + data.cell.height / 2 - 1.3;
          const maxBarW = data.cell.width - 18;
          const filledW = Math.max((rowStat.sharePercent / 100) * maxBarW, 1.2);
          doc.setFillColor(232, 232, 236);
          doc.rect(barX, barY, maxBarW, 2.6, 'F');
          doc.setFillColor(...BRAND_RED);
          doc.rect(barX, barY, Math.min(filledW, maxBarW), 2.6, 'F');
        }
      }
    },
  });

  cursorY = getLastTableFinalY(doc, cursorY + 40) + 9;

  // --- 5. DISTRIBUCIÓN POR TIPO DE CLASE ---
  if (monthBookings.length > 0) {
    if (cursorY > pageHeight - 55) {
      doc.addPage();
      cursorY = 18;
    }

    const classMap = new Map<
      string,
      { name: string; total: number; active: number; cancelled: number }
    >();
    for (const b of monthBookings) {
      const entry = classMap.get(b.classTypeName) || {
        name: b.classTypeName,
        total: 0,
        active: 0,
        cancelled: 0,
      };
      entry.total += 1;
      if (b.status === 'cancelada') entry.cancelled += 1;
      else entry.active += 1;
      classMap.set(b.classTypeName, entry);
    }

    const classRows = Array.from(classMap.values())
      .sort((a, b) => b.total - a.total)
      .map((c) => [
        c.name,
        String(c.total),
        String(c.active),
        String(c.cancelled),
        `${Math.round((c.total / monthBookings.length) * 1000) / 10}%`,
      ]);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...TEXT_DARK);
    doc.text('DISTRIBUCIÓN POR TIPO DE CLASE', margin, cursorY);
    cursorY += 4.5;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Actividad / Tipo de Clase', 'Total', 'Activas', 'Canceladas', '% del Mes']],
      body: classRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8.2,
        cellPadding: 2.5,
        textColor: TEXT_DARK,
        lineColor: BORDER_LIGHT,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: BRAND_CHARCOAL,
        textColor: BRAND_WHITE,
        fontStyle: 'bold',
        fontSize: 7.8,
      },
      alternateRowStyles: {
        fillColor: ROW_ALT,
      },
      columnStyles: {
        0: { cellWidth: 94 },
        1: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 24 },
        4: { halign: 'center', cellWidth: 22 },
      },
    });

    cursorY = getLastTableFinalY(doc, cursorY + 30) + 9;
  }

  // --- 6. DETALLE CRONOLÓGICO DE CITAS DEL MES ---
  if (cursorY > pageHeight - 50) {
    doc.addPage();
    cursorY = 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`DETALLE CRONOLÓGICO DE CITAS (${monthLabel.toUpperCase()})`, margin, cursorY);
  cursorY += 4.5;

  if (monthBookings.length === 0) {
    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.rect(margin, cursorY, contentWidth, 16, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `No se registraron citas agendadas durante ${monthLabel}.`,
      margin + contentWidth / 2,
      cursorY + 9.5,
      { align: 'center' }
    );
  } else {
    const detailRows = monthBookings.map((b) => [
      b.date,
      b.timeSlot,
      b.bookingCode,
      `${b.studentName} (${b.studentAge})`,
      b.classTypeName,
      b.instructorName,
      b.status.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Fecha', 'Horario', 'Código', 'Alumno', 'Actividad', 'Instructor', 'Estado']],
      body: detailRows,
      theme: 'striped',
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: TEXT_DARK,
        lineColor: BORDER_LIGHT,
        lineWidth: 0.15,
      },
      headStyles: {
        fillColor: BRAND_BLACK,
        textColor: BRAND_WHITE,
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      alternateRowStyles: {
        fillColor: ROW_ALT,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 24 },
        2: { cellWidth: 19, fontStyle: 'bold' },
        3: { cellWidth: 34 },
        4: { cellWidth: 35 },
        5: { cellWidth: 30 },
        6: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const val = String(data.cell.raw || '').toLowerCase();
          if (val === 'confirmada') {
            data.cell.styles.textColor = BRAND_RED;
          } else if (val === 'cancelada') {
            data.cell.styles.textColor = TEXT_MUTED;
          }
        }
      },
    });
  }

  // --- 7. PAGE FOOTERS ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(...BORDER_LIGHT);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `La Caballería Club de Equitación · Reporte Administrativo Mensual (${monthLabel})`,
      margin,
      pageHeight - 7.5
    );
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 7.5, {
      align: 'right',
    });
  }

  const fileName = `reporte-citas-la-caballeria-${year}-${monthStr}.pdf`;
  doc.save(fileName);

  return {
    fileName,
    monthLabel,
    totalBookings: monthBookings.length,
    activeBookings,
    preferredInstructor,
  };
}
