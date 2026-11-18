import React, { useState } from 'react';
import {
  X,
  Plus,
  RotateCcw,
  Check,
  Shield,
  Lock,
  LogOut,
  CalendarCheck,
  Sliders,
  AlertCircle,
  Loader2,
  Download,
  Search,
  Calendar,
  Mail,
  LayoutList,
  CalendarDays,
  BellRing,
  Send,
  RefreshCw,
  FileText,
  Award,
  BookOpen,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { HorseProfile, AppointmentBooking, BlogCategory, BlogPost } from '../types';
import type {
  PushStats,
  PushBroadcastPayload,
  PushBroadcastResult,
  BlogPostPayload,
} from '../hooks/useRealtimeBookings';
import { LiveBookingsPanel } from './LiveBookingsPanel';
import { AdminMonthlyCalendar } from './AdminMonthlyCalendar';
import {
  generateMonthlyBookingsPdfReport,
  computeMonthlyInstructorStats,
} from '../utils/monthlyPdfReport';

interface AdminPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Auth
  isAdminAuthenticated: boolean;
  adminEmail?: string | null;
  isCheckingAuth: boolean;
  onLoginAdmin: () => Promise<void>;
  onLogoutAdmin: () => Promise<void>;
  // Real-time bookings (only populated when authenticated)
  bookings: AppointmentBooking[];
  isLoadingBookings: boolean;
  isRealtimeConnected: boolean;
  onUpdateBookingStatus: (id: string, status: AppointmentBooking['status']) => Promise<AppointmentBooking>;
  onDeleteBooking: (id: string) => Promise<void>;
  onSendTestEmail: () => Promise<{ provider?: string; recipient?: string }>;
  // Web Push management
  pushStats: PushStats;
  onRefreshPushStats: () => Promise<void>;
  onBroadcastPush: (payload: PushBroadcastPayload) => Promise<PushBroadcastResult>;
  // Blog management
  blogPosts: BlogPost[];
  onCreateBlogPost: (payload: BlogPostPayload) => Promise<BlogPost>;
  onUpdateBlogPost: (id: string, payload: Partial<BlogPostPayload>) => Promise<BlogPost>;
  onDeleteBlogPost: (id: string) => Promise<void>;
  // Club horse management
  onAddHorse: (horse: HorseProfile) => void;
  onResetData: () => void;
  totalHorses: number;
  totalActivities: number;
}

const BLOG_COVER_PRESETS = [
  {
    label: 'Cuidado y cepillado',
    url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Pista y técnica',
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Familia y club',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Caballo tordo',
    url: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const AdminPreviewDrawer: React.FC<AdminPreviewDrawerProps> = ({
  isOpen,
  onClose,
  isAdminAuthenticated,
  adminEmail,
  isCheckingAuth,
  onLoginAdmin,
  onLogoutAdmin,
  bookings,
  isLoadingBookings,
  isRealtimeConnected,
  onUpdateBookingStatus,
  onDeleteBooking,
  onSendTestEmail,
  pushStats,
  onRefreshPushStats,
  onBroadcastPush,
  blogPosts,
  onCreateBlogPost,
  onUpdateBlogPost,
  onDeleteBlogPost,
  onAddHorse,
  onResetData,
  totalHorses,
  totalActivities,
}) => {
  const [activeTab, setActiveTab] = useState<'citas' | 'blog' | 'difusion' | 'plantel'>('citas');

  // Auth state
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Horse form state
  const [newHorseName, setNewHorseName] = useState('');
  const [newHorseBreed, setNewHorseBreed] = useState('Español Cruzado');
  const [newHorseTemperament, setNewHorseTemperament] = useState('Dócil, cariñoso y de paso suave');
  const [newHorseDescription, setNewHorseDescription] = useState(
    'Nuevo ejemplar incorporado a las actividades formativas del club.'
  );
  const [newHorseCuriosity] = useState('Muy atento a los ejercicios de pista.');
  const [level, setLevel] = useState<'Iniciación' | 'Todos los niveles' | 'Jóvenes y Niños'>(
    'Jóvenes y Niños'
  );
  const [successNotice, setSuccessNotice] = useState(false);
  const [csvExported, setCsvExported] = useState(false);
  const nowDate = new Date();
  const [reportYear, setReportYear] = useState<number>(nowDate.getFullYear());
  const [reportMonth, setReportMonth] = useState<number>(nowDate.getMonth());
  const [pdfFeedback, setPdfFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingDateFilter, setBookingDateFilter] = useState('');
  const [bookingsViewMode, setBookingsViewMode] = useState<'calendario' | 'lista'>('calendario');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Web Push broadcast form state
  const [pushTopic, setPushTopic] = useState<'disponibilidad' | 'eventos' | 'recordatorios' | 'todos'>('todos');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('/#agendar-cita');
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [isRefreshingPushStats, setIsRefreshingPushStats] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Blog editor state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState<BlogCategory>('cuidado-equino');
  const [blogAuthor, setBlogAuthor] = useState('Equipo Formativo La Caballería');
  const [blogReadTime, setBlogReadTime] = useState('4 min');
  const [blogCoverUrl, setBlogCoverUrl] = useState(BLOG_COVER_PRESETS[0].url);
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogPublished, setBlogPublished] = useState(true);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [busyBlogId, setBusyBlogId] = useState<string | null>(null);
  const [blogFeedback, setBlogFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await onLoginAdmin();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await onLogoutAdmin();
  };

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
          err instanceof Error
            ? err.message
            : 'No se pudo enviar el correo de prueba.',
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

  const reportMonthValue = `${reportYear}-${String(reportMonth + 1).padStart(2, '0')}`;
  const monthlyStatsPreview = computeMonthlyInstructorStats(
    bookings,
    reportYear,
    reportMonth
  );

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

  const handleCreateHorse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHorseName.trim()) return;

    const newHorse: HorseProfile = {
      id: `caballo-${Date.now()}`,
      name: newHorseName.trim(),
      breed: newHorseBreed,
      temperament: newHorseTemperament,
      role: 'Formación y convivencia ecuestre',
      description: newHorseDescription,
      curiosities: [newHorseCuriosity],
      imageUrl:
        'https://images.unsplash.com/photo-1598974357801-cbca100e6571?auto=format&fit=crop&w=1200&q=80',
      imageAlt: `Caballo ${newHorseName} de La Caballería`,
      levelSuitability: level,
    };

    onAddHorse(newHorse);
    setNewHorseName('');
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 2500);
  };

  const handleRefreshPushStats = async () => {
    setIsRefreshingPushStats(true);
    try {
      await onRefreshPushStats();
    } finally {
      setIsRefreshingPushStats(false);
    }
  };

  const handleBroadcastPushSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPushFeedback(null);
    if (!pushTitle.trim() || !pushBody.trim()) {
      setPushFeedback({
        type: 'error',
        message: 'Completa el título y el mensaje antes de enviar la notificación.',
      });
      return;
    }

    setIsSendingPush(true);
    try {
      const result = await onBroadcastPush({
        title: pushTitle.trim(),
        body: pushBody.trim(),
        topic: pushTopic,
        url: pushUrl,
      });
      setPushFeedback({
        type: 'success',
        message: `Difusión completada: ${result.sent} enviada(s), ${result.failed} fallida(s), ${result.removed} suscripción(es) expirada(s) depuradas.`,
      });
      setPushTitle('');
      setPushBody('');
    } catch (err) {
      setPushFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo enviar la difusión Web Push.',
      });
    } finally {
      setIsSendingPush(false);
    }
  };

  const resetBlogForm = () => {
    setEditingPostId(null);
    setBlogTitle('');
    setBlogCategory('cuidado-equino');
    setBlogAuthor('Equipo Formativo La Caballería');
    setBlogReadTime('4 min');
    setBlogCoverUrl(BLOG_COVER_PRESETS[0].url);
    setBlogExcerpt('');
    setBlogContent('');
    setBlogPublished(true);
  };

  const handleStartEditBlogPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setBlogTitle(post.title);
    setBlogCategory(post.category);
    setBlogAuthor(post.authorName);
    setBlogReadTime(post.readTime);
    setBlogCoverUrl(post.coverImageUrl);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogPublished(post.published);
    setBlogFeedback(null);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogFeedback(null);
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) {
      setBlogFeedback({
        type: 'error',
        message: 'Completa el título, el resumen y el contenido del artículo.',
      });
      return;
    }

    setIsSavingBlog(true);
    try {
      const payload: BlogPostPayload = {
        title: blogTitle.trim(),
        category: blogCategory,
        authorName: blogAuthor.trim() || 'Equipo Formativo La Caballería',
        readTime: blogReadTime.trim() || '4 min',
        coverImageUrl: blogCoverUrl.trim() || BLOG_COVER_PRESETS[0].url,
        excerpt: blogExcerpt.trim(),
        content: blogContent.trim(),
        published: blogPublished,
      };

      if (editingPostId) {
        await onUpdateBlogPost(editingPostId, payload);
        setBlogFeedback({
          type: 'success',
          message: 'Artículo actualizado y sincronizado en el blog público.',
        });
      } else {
        await onCreateBlogPost(payload);
        setBlogFeedback({
          type: 'success',
          message: 'Nuevo artículo publicado en la sección de blog.',
        });
      }
      resetBlogForm();
    } catch (err) {
      setBlogFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo guardar el artículo.',
      });
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleToggleBlogPublished = async (post: BlogPost) => {
    setBusyBlogId(post.id);
    setBlogFeedback(null);
    try {
      await onUpdateBlogPost(post.id, { published: !post.published });
    } catch (err) {
      setBlogFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo cambiar la visibilidad.',
      });
    } finally {
      setBusyBlogId(null);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    setBusyBlogId(id);
    setBlogFeedback(null);
    try {
      await onDeleteBlogPost(id);
      if (editingPostId === id) {
        resetBlogForm();
      }
      setBlogFeedback({
        type: 'success',
        message: 'Artículo eliminado del blog.',
      });
    } catch (err) {
      setBlogFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo eliminar el artículo.',
      });
    } finally {
      setBusyBlogId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over panel */}
      <div
        className={`relative w-full bg-[#141416] border-l border-white/10 p-4 sm:p-6 lg:p-8 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto transition-all duration-300 ${
          isAdminAuthenticated &&
          (activeTab === 'citas' || activeTab === 'difusion' || activeTab === 'blog')
            ? 'max-w-4xl'
            : 'max-w-lg'
        }`}
      >
        <div>
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-white/10 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-[#D21923]/15 border border-[#D21923]/50 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-[#D21923]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-serif font-bold text-white truncate">
                  Portal Administrativo · La Caballería
                </h3>
                <span className="text-[11px] text-zinc-400 block truncate">
                  {isAdminAuthenticated
                    ? `Sesión activa${adminEmail ? ` (${adminEmail})` : ''} · Base de datos Firebase`
                    : 'Acceso exclusivo para dirección e instructores'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Cerrar sesión de administrador"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#D21923]" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Cerrar panel de administración"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AUTH GATE */}
          {isCheckingAuth ? (
            <div className="py-20 text-center text-xs text-zinc-400 flex flex-col items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#D21923] animate-spin" />
              <span>Verificando sesión administrativa...</span>
            </div>
          ) : !isAdminAuthenticated ? (
            <div className="py-10">
              <div className="bg-[#1A1A1D] border border-white/10 p-6 sm:p-8">
                <div className="w-12 h-12 bg-[#D21923]/10 border border-[#D21923]/40 flex items-center justify-center mb-5">
                  <Lock className="w-5 h-5 text-[#D21923]" />
                </div>

                <h4 className="text-xl font-serif font-bold text-white mb-2">
                  Acceso Restringido al Administrador
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  Por privacidad de nuestros alumnos y familias, la agenda de citas en tiempo real y la edición del blog se protegen mediante tu cuenta Google autorizada del club (<span className="text-zinc-200 font-mono">bryanalvarez119@gmail.com</span>).
                </p>

                <div className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-[#D21923]/15 border border-[#D21923] text-xs text-white flex items-start gap-2 leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="w-full min-h-[48px] inline-flex items-center justify-center gap-3 py-3 px-5 text-xs font-bold uppercase tracking-widest text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-[#D21923]/20"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    <span>
                      {isLoggingIn ? 'AUTENTICANDO...' : 'CONTINUAR CON GOOGLE (ADMIN)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED ADMIN CONTENT */
            <div className="pt-6">
              {/* Navigation Tabs + CSV Export */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('citas')}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider border whitespace-nowrap shrink-0 transition-colors ${
                      activeTab === 'citas'
                        ? 'bg-[#D21923] border-[#D21923] text-white'
                        : 'bg-[#1A1A1D] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Citas en Tiempo Real</span>
                    <span className="font-mono text-[11px] opacity-90">({bookings.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('difusion');
                      void handleRefreshPushStats();
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider border whitespace-nowrap shrink-0 transition-colors ${
                      activeTab === 'difusion'
                        ? 'bg-[#D21923] border-[#D21923] text-white'
                        : 'bg-[#1A1A1D] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <BellRing className="w-4 h-4" />
                    <span>Difusión Push</span>
                    <span className="font-mono text-[11px] opacity-90">
                      ({pushStats.totalSubscribers})
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('blog')}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider border whitespace-nowrap shrink-0 transition-colors ${
                      activeTab === 'blog'
                        ? 'bg-[#D21923] border-[#D21923] text-white'
                        : 'bg-[#1A1A1D] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Blog del Club</span>
                    <span className="font-mono text-[11px] opacity-90">({blogPosts.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('plantel')}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider border whitespace-nowrap shrink-0 transition-colors ${
                      activeTab === 'plantel'
                        ? 'bg-[#D21923] border-[#D21923] text-white'
                        : 'bg-[#1A1A1D] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Gestión del Plantel</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isSendingTestEmail}
                    title="Enviar un correo de prueba al administrador"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider border border-white/15 bg-[#1A1A1D] hover:bg-white hover:text-[#141416] text-white transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSendingTestEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D21923]" />
                    ) : (
                      <Mail className="w-4 h-4 text-[#D21923]" />
                    )}
                    <span>{isSendingTestEmail ? 'Enviando...' : 'Probar Aviso Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportBookingsCsv}
                    disabled={bookings.length === 0}
                    title={
                      bookings.length === 0
                        ? 'No hay citas registradas para exportar'
                        : 'Descargar historial completo de citas en formato CSV'
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider border border-white/15 bg-[#1A1A1D] hover:bg-white hover:text-[#141416] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1A1A1D] disabled:hover:text-white whitespace-nowrap"
                  >
                    {csvExported ? (
                      <>
                        <Check className="w-4 h-4 text-[#D21923]" />
                        <span>CSV Descargado</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-[#D21923]" />
                        <span>Descargar Historial CSV</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Monthly PDF Report Bar with Preferred Instructor Preview */}
              <div className="mb-5 bg-[#1A1A1D] border border-white/10 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                    <FileText className="w-4 h-4 text-[#D21923] shrink-0" />
                    <span>Reporte Mensual en PDF · Instructores Preferidos</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                      Citas en el mes seleccionado:{' '}
                      <strong className="font-mono text-white">
                        {monthlyStatsPreview.monthBookings.length}
                      </strong>
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#D21923]" />
                      <span>
                        Instructor preferido:{' '}
                        <strong className="text-white">
                          {monthlyStatsPreview.preferredInstructor
                            ? `${monthlyStatsPreview.preferredInstructor.instructorName} (${monthlyStatsPreview.preferredInstructor.total} · ${monthlyStatsPreview.preferredInstructor.sharePercent}%)`
                            : 'Sin datos en este mes'}
                        </strong>
                      </span>
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <input
                    type="month"
                    value={reportMonthValue}
                    onChange={(e) => handleReportMonthInput(e.target.value)}
                    aria-label="Seleccionar mes para reporte PDF"
                    className="w-full sm:w-auto px-3 py-2 min-h-[44px] bg-[#141416] border border-white/15 text-base sm:text-xs text-white focus:outline-none focus:border-[#D21923] [color-scheme:dark]"
                  />

                  <button
                    type="button"
                    onClick={handleGenerateMonthlyPdf}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#D21923] hover:bg-[#b8141d] text-white transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generar Reporte PDF</span>
                  </button>
                </div>
              </div>

              {pdfFeedback && (
                <div
                  className={`mb-5 p-3 border text-xs flex items-center justify-between gap-3 ${
                    pdfFeedback.type === 'success'
                      ? 'bg-[#1A1A1D] border-white/20 text-white'
                      : 'bg-[#D21923]/15 border-[#D21923] text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D21923] shrink-0" />
                    <span>{pdfFeedback.message}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPdfFeedback(null)}
                    className="text-zinc-400 hover:text-white p-0.5"
                    aria-label="Cerrar aviso de PDF"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {testEmailFeedback && (
                <div
                  className={`mb-5 p-3 border text-xs flex items-center justify-between gap-3 ${
                    testEmailFeedback.type === 'success'
                      ? 'bg-[#1A1A1D] border-white/20 text-white'
                      : 'bg-[#D21923]/15 border-[#D21923] text-white'
                  }`}
                >
                  <span>{testEmailFeedback.message}</span>
                  <button
                    type="button"
                    onClick={() => setTestEmailFeedback(null)}
                    className="text-zinc-400 hover:text-white p-0.5"
                    aria-label="Cerrar aviso"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: REAL-TIME APPOINTMENTS */}
              {activeTab === 'citas' && (
                <div className="space-y-4">
                  {/* View Mode Switcher + Admin Quick Search Bar */}
                  <div className="bg-[#1A1A1D] border border-white/10 p-3.5 sm:p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                        Modo de visualización
                      </span>

                      <div className="inline-flex w-full sm:w-auto bg-[#141416] border border-white/10 p-1">
                        <button
                          type="button"
                          onClick={() => setBookingsViewMode('calendario')}
                          className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                            bookingsViewMode === 'calendario'
                              ? 'bg-[#D21923] text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>Calendario Mensual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingsViewMode('lista')}
                          className={`flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                            bookingsViewMode === 'lista'
                              ? 'bg-[#D21923] text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <LayoutList className="w-3.5 h-3.5" />
                          <span>Lista en Vivo</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="relative flex-1">
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
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 sm:flex-initial">
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
                              className="px-3.5 py-2.5 min-h-[44px] text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141416] border border-white/15 hover:border-[#D21923] transition-colors shrink-0"
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
              )}

              {/* TAB 2: WEB PUSH BROADCAST & SUBSCRIBERS */}
              {activeTab === 'difusion' && (
                <div className="space-y-6">
                  <div className="bg-[#1A1A1D] border border-white/10 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block">
                          Servicio Web Push · VAPID
                        </span>
                        <h4 className="text-lg font-serif font-bold text-white mt-0.5">
                          Audiencia Suscrita a Notificaciones
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleRefreshPushStats}
                        disabled={isRefreshingPushStats}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141416] border border-white/15 hover:border-[#D21923] transition-colors disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 text-[#D21923] ${
                            isRefreshingPushStats ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Actualizar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                      <div className="p-4 bg-[#141416] border border-white/10">
                        <span className="text-zinc-400 block">Dispositivos suscritos</span>
                        <span className="text-2xl font-bold font-mono text-white mt-1 block">
                          {pushStats.totalSubscribers}
                        </span>
                      </div>
                      <div className="p-4 bg-[#141416] border border-white/10">
                        <span className="text-zinc-400 block">Disponibilidad</span>
                        <span className="text-2xl font-bold font-mono text-[#D21923] mt-1 block">
                          {pushStats.disponibilidadCount}
                        </span>
                      </div>
                      <div className="p-4 bg-[#141416] border border-white/10">
                        <span className="text-zinc-400 block">Eventos especiales</span>
                        <span className="text-2xl font-bold font-mono text-white mt-1 block">
                          {pushStats.eventosCount}
                        </span>
                      </div>
                      <div className="p-4 bg-[#141416] border border-white/10">
                        <span className="text-zinc-400 block">Recordatorios</span>
                        <span className="text-2xl font-bold font-mono text-white mt-1 block">
                          {pushStats.recordatoriosCount}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
                      Además de las difusiones manuales, el sistema envía automáticamente una alerta a los suscriptores de <strong className="text-white">Disponibilidad de clases</strong> cada vez que cancelas una reserva y se libera un horario en pista.
                    </p>
                  </div>

                  {/* Broadcast Compose Form */}
                  <form
                    onSubmit={handleBroadcastPushSubmit}
                    className="bg-[#1A1A1D] border border-white/10 p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <h4 className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
                        Enviar Aviso Push Instantáneo
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPushTopic('disponibilidad');
                            setPushTitle('¡Nuevos cupos abiertos en pista!');
                            setPushBody(
                              'Abrimos nuevos horarios de iniciación y doma para este fin de semana en La Caballería.'
                            );
                            setPushUrl('/#agendar-cita');
                          }}
                          className="px-2.5 py-1 text-[11px] bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors"
                        >
                          Plantilla Disponibilidad
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPushTopic('eventos');
                            setPushTitle('Jornada Familiar de Puertas Abiertas');
                            setPushBody(
                              'Este sábado disfruta exhibiciones ecuestres y bautizo a caballo para niños en el club.'
                            );
                            setPushUrl('/#contacto');
                          }}
                          className="px-2.5 py-1 text-[11px] bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors"
                        >
                          Plantilla Evento Especial
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPushTopic('recordatorios');
                            setPushTitle('Recordatorio de tu próxima clase en La Caballería');
                            setPushBody(
                              'Recuerda llegar 15 minutos antes con pantalón largo y calzado cerrado. El club provee casco y chaleco.'
                            );
                            setPushUrl('/#agendar-cita');
                          }}
                          className="px-2.5 py-1 text-[11px] bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors"
                        >
                          Plantilla Recordatorio
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                          Audiencia objetivo
                        </label>
                        <select
                          value={pushTopic}
                          onChange={(e) =>
                            setPushTopic(
                              e.target.value as
                                | 'disponibilidad'
                                | 'eventos'
                                | 'recordatorios'
                                | 'todos'
                            )
                          }
                          className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        >
                          <option value="todos">
                            Todos los suscriptores ({pushStats.totalSubscribers})
                          </option>
                          <option value="disponibilidad">
                            Disponibilidad de clases ({pushStats.disponibilidadCount})
                          </option>
                          <option value="eventos">
                            Eventos especiales del club ({pushStats.eventosCount})
                          </option>
                          <option value="recordatorios">
                            Recordatorios de citas ({pushStats.recordatoriosCount})
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                          Sección destino al pulsar
                        </label>
                        <select
                          value={pushUrl}
                          onChange={(e) => setPushUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        >
                          <option value="/#agendar-cita">Agendar Cita (#agendar-cita)</option>
                          <option value="/#caballos">Caballos y Profesores (#caballos)</option>
                          <option value="/#contacto">Contacto y Ubicación (#contacto)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                        Título de la notificación
                      </label>
                      <input
                        type="text"
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value)}
                        maxLength={80}
                        placeholder="Ej. Cupo disponible este sábado a las 10:00"
                        className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                        Mensaje breve
                      </label>
                      <textarea
                        rows={3}
                        value={pushBody}
                        onChange={(e) => setPushBody(e.target.value)}
                        maxLength={220}
                        placeholder="Escribe el aviso claro que aparecerá en el dispositivo del usuario..."
                        className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    {pushFeedback && (
                      <div
                        className={`p-3 border text-xs flex items-center gap-2 ${
                          pushFeedback.type === 'success'
                            ? 'bg-[#141416] border-white/20 text-white'
                            : 'bg-[#D21923]/15 border-[#D21923] text-white'
                        }`}
                      >
                        {pushFeedback.type === 'success' ? (
                          <Check className="w-4 h-4 text-[#D21923] shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0" />
                        )}
                        <span>{pushFeedback.message}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSendingPush}
                        className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors disabled:opacity-50"
                      >
                        {isSendingPush ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>
                          {isSendingPush ? 'Enviando difusión...' : 'Enviar Notificación Push'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: BLOG CMS EDITOR */}
              {activeTab === 'blog' && (
                <div className="space-y-6">
                  {/* Editor Form */}
                  <form
                    onSubmit={handleBlogSubmit}
                    className="bg-[#1A1A1D] border border-white/10 p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block">
                          Gestión Editorial · Bitácora Ecuestre
                        </span>
                        <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                          {editingPostId ? 'Editar Artículo Existente' : 'Publicar Nuevo Artículo'}
                        </h4>
                      </div>

                      {editingPostId && (
                        <button
                          type="button"
                          onClick={resetBlogForm}
                          className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141416] border border-white/15 hover:border-[#D21923] transition-colors"
                        >
                          Cancelar edición
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                          Título del artículo *
                        </label>
                        <input
                          type="text"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          placeholder="Ej. Cómo cuidar los cascos tras la lluvia"
                          className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                          Categoría
                        </label>
                        <select
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value as BlogCategory)}
                          className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        >
                          <option value="cuidado-equino">Cuidado Equino</option>
                          <option value="consejos-principiantes">
                            Consejos para Principiantes
                          </option>
                          <option value="noticias-club">Noticias del Club</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                          Autor
                        </label>
                        <input
                          type="text"
                          value={blogAuthor}
                          onChange={(e) => setBlogAuthor(e.target.value)}
                          className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                          Tiempo de lectura
                        </label>
                        <input
                          type="text"
                          value={blogReadTime}
                          onChange={(e) => setBlogReadTime(e.target.value)}
                          placeholder="4 min"
                          className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                          Estado
                        </label>
                        <label className="flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-xs text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={blogPublished}
                            onChange={(e) => setBlogPublished(e.target.checked)}
                            className="w-4 h-4 rounded-none bg-[#141416] border-white/20 text-[#D21923] focus:ring-[#D21923]"
                          />
                          <span>Publicado en el sitio</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                          Imagen de portada (URL)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {BLOG_COVER_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setBlogCoverUrl(preset.url)}
                              className="px-2.5 py-1 min-h-[32px] text-[10px] bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="url"
                        value={blogCoverUrl}
                        onChange={(e) => setBlogCoverUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                        Resumen / Extracto *
                      </label>
                      <textarea
                        rows={2}
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        placeholder="Breve introducción que aparecerá en la tarjeta del artículo..."
                        className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/15 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1.5">
                        Contenido completo * <span className="text-zinc-500 font-normal">(separa párrafos con una línea en blanco)</span>
                      </label>
                      <textarea
                        rows={5}
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        placeholder="Redacta aquí el artículo completo sobre cuidado equino, consejos para principiantes o noticias del club..."
                        className="w-full px-3.5 py-2.5 bg-[#141416] border border-white/15 text-white text-base sm:text-xs leading-relaxed focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    {blogFeedback && (
                      <div
                        className={`p-3 border text-xs flex items-center gap-2 ${
                          blogFeedback.type === 'success'
                            ? 'bg-[#141416] border-white/20 text-white'
                            : 'bg-[#D21923]/15 border-[#D21923] text-white'
                        }`}
                      >
                        {blogFeedback.type === 'success' ? (
                          <Check className="w-4 h-4 text-[#D21923] shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0" />
                        )}
                        <span>{blogFeedback.message}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isSavingBlog}
                        className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors disabled:opacity-50"
                      >
                        {isSavingBlog ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : editingPostId ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>
                          {isSavingBlog
                            ? 'Guardando...'
                            : editingPostId
                            ? 'Guardar Cambios'
                            : 'Publicar Artículo'}
                        </span>
                      </button>
                    </div>
                  </form>

                  {/* Published / Draft Articles List */}
                  <div className="bg-[#1A1A1D] border border-white/10 p-5 sm:p-6">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                      <h4 className="text-xs uppercase tracking-widest text-white font-semibold">
                        Artículos Registrados ({blogPosts.length})
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Publicados: {blogPosts.filter((p) => p.published).length}
                      </span>
                    </div>

                    {blogPosts.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-4 text-center">
                        Aún no hay artículos en el blog. Usa el formulario superior para crear el primero.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {blogPosts.map((post) => {
                          const isBusy = busyBlogId === post.id;
                          const isEditingThis = editingPostId === post.id;
                          return (
                            <div
                              key={post.id}
                              className={`p-3.5 bg-[#141416] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                isEditingThis ? 'border-[#D21923]' : 'border-white/10'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <img
                                  src={post.coverImageUrl}
                                  alt={post.title}
                                  className="w-16 h-14 object-cover border border-white/10 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider mb-1">
                                    <span className="text-[#D21923] font-semibold">
                                      {post.category === 'cuidado-equino'
                                        ? 'Cuidado Equino'
                                        : post.category === 'consejos-principiantes'
                                        ? 'Principiantes'
                                        : 'Noticias'}
                                    </span>
                                    <span className="text-zinc-600">·</span>
                                    <span
                                      className={`px-1.5 py-0.5 border ${
                                        post.published
                                          ? 'border-white/20 text-white bg-white/5'
                                          : 'border-white/10 text-zinc-500'
                                      }`}
                                    >
                                      {post.published ? 'Publicado' : 'Borrador'}
                                    </span>
                                  </div>
                                  <h5 className="text-xs sm:text-sm font-serif font-bold text-white truncate">
                                    {post.title}
                                  </h5>
                                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                    {post.authorName} · {post.readTime}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleStartEditBlogPost(post)}
                                  className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D21923] text-zinc-200 transition-colors"
                                >
                                  <Pencil className="w-3 h-3 text-[#D21923]" />
                                  <span>Editar</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleToggleBlogPublished(post)}
                                  className="px-3 py-2 min-h-[38px] text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors disabled:opacity-50"
                                >
                                  {post.published ? 'Ocultar' : 'Publicar'}
                                </button>

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDeleteBlog(post.id)}
                                  className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-zinc-500 hover:text-[#D21923] transition-colors disabled:opacity-50"
                                  aria-label={`Eliminar artículo ${post.title}`}
                                  title="Eliminar artículo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: HORSE PLANTEL MANAGEMENT */}
              {activeTab === 'plantel' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-[#1A1A1D] border border-white/10">
                      <span className="text-zinc-500 block">Caballos activos:</span>
                      <span className="text-lg font-bold text-white font-mono">{totalHorses}</span>
                    </div>
                    <div className="p-3.5 bg-[#1A1A1D] border border-white/10">
                      <span className="text-zinc-500 block">Actividades:</span>
                      <span className="text-lg font-bold text-white font-mono">{totalActivities}</span>
                    </div>
                  </div>

                  <form
                    onSubmit={handleCreateHorse}
                    className="space-y-4 bg-[#1A1A1D] border border-white/10 p-5"
                  >
                    <h4 className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
                      Incorporar Nuevo Perfil de Caballo
                    </h4>

                    <div>
                      <label className="block text-xs text-zinc-300 mb-1">Nombre del ejemplar</label>
                      <input
                        type="text"
                        value={newHorseName}
                        onChange={(e) => setNewHorseName(e.target.value)}
                        placeholder="Ej. Vendaval, Lucero, Gitana"
                        required
                        className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-300 mb-1">Raza o estirpe</label>
                        <input
                          type="text"
                          value={newHorseBreed}
                          onChange={(e) => setNewHorseBreed(e.target.value)}
                          className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-300 mb-1">Enfoque formativo</label>
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value as any)}
                          className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                        >
                          <option value="Jóvenes y Niños">Jóvenes y Niños</option>
                          <option value="Iniciación">Iniciación</option>
                          <option value="Todos los niveles">Todos los niveles</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-300 mb-1">Temperamento</label>
                      <input
                        type="text"
                        value={newHorseTemperament}
                        onChange={(e) => setNewHorseTemperament(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-300 mb-1">Descripción breve</label>
                      <textarea
                        rows={2}
                        value={newHorseDescription}
                        onChange={(e) => setNewHorseDescription(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#141416] border border-white/10 text-white text-base sm:text-xs focus:outline-none focus:border-[#D21923]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold tracking-wider uppercase text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir a la galería pública</span>
                    </button>

                    {successNotice && (
                      <p className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 pt-1">
                        <Check className="w-4 h-4" />
                        <span>¡Perfil incorporado exitosamente a la sección!</span>
                      </p>
                    )}
                  </form>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onResetData}
                      className="inline-flex items-center gap-1.5 min-h-[40px] text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restablecer datos del plantel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs uppercase tracking-wider text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
