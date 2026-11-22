import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Shield,
  Lock,
  LogOut,
  CalendarCheck,
  Sliders,
  AlertCircle,
  Loader2,
  BellRing,
  BookOpen,
} from 'lucide-react';
import type { HorseProfile, AppointmentBooking, BlogPost } from '../types';
import type {
  PushStats,
  PushBroadcastPayload,
  PushBroadcastResult,
  BlogPostPayload,
} from '../hooks/useRealtimeBookings';
import { AdminBookingsTab } from './admin/AdminBookingsTab';
import { AdminBlogTab } from './admin/AdminBlogTab';
import { AdminHorsesTab } from './admin/AdminHorsesTab';
import { AdminPushTab } from './admin/AdminPushTab';

export interface AdminPreviewDrawerProps {
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
  onUpdateBookingStatus: (
    id: string,
    status: AppointmentBooking['status']
  ) => Promise<AppointmentBooking>;
  onDeleteBooking: (id: string) => Promise<void>;
  onSendTestEmail: () => Promise<{ provider?: string; recipient?: string }>;
  // Web Push management
  pushStats: PushStats;
  onRefreshPushStats: () => Promise<void>;
  onBroadcastPush: (payload: PushBroadcastPayload) => Promise<PushBroadcastResult>;
  // Blog management
  blogPosts: BlogPost[];
  onCreateBlogPost: (payload: BlogPostPayload) => Promise<BlogPost>;
  onUpdateBlogPost: (
    id: string,
    payload: Partial<BlogPostPayload>
  ) => Promise<BlogPost>;
  onDeleteBlogPost: (id: string) => Promise<void>;
  // Club horse management
  onAddHorse: (horse: HorseProfile) => void;
  onResetData: () => void;
  totalHorses: number;
  totalActivities: number;
}

type AdminTabId = 'citas' | 'blog' | 'plantel' | 'difusion';

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
  const [activeTab, setActiveTab] = useState<AdminTabId>('citas');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const tabButtonRefs = useRef<Partial<Record<AdminTabId, HTMLButtonElement | null>>>({});

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: Array<{
    id: AdminTabId;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'citas', label: 'Citas', count: bookings.length, icon: CalendarCheck },
    { id: 'blog', label: 'Blog', count: blogPosts.length, icon: BookOpen },
    { id: 'plantel', label: 'Caballos', count: totalHorses, icon: Sliders },
    {
      id: 'difusion',
      label: 'Difusión',
      count: pushStats.totalSubscribers,
      icon: BellRing,
    },
  ];

  const selectTab = (tabId: AdminTabId) => {
    setActiveTab(tabId);
    if (tabId === 'difusion') {
      void onRefreshPushStats();
    }
    const btn = tabButtonRefs.current[tabId];
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const targetTab = tabs[nextIndex].id;
      selectTab(targetTab);
      tabButtonRefs.current[targetTab]?.focus();
    }
  };

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

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Portal Administrativo"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Viewport-locked slide-over drawer */}
      <div
        className={`relative w-full h-[100dvh] max-h-[100dvh] bg-[#141416] border-l border-white/10 flex flex-col overflow-hidden shadow-2xl z-10 transition-[max-width] duration-300 ${
          isAdminAuthenticated ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        {/* FIXED COMPACT TOP HEADER */}
        <header className="shrink-0 bg-[#141416] border-b border-white/10 px-4 sm:px-6 pt-3.5 pb-3">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-[#D21923]/15 border border-[#D21923]/50 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-[#D21923]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-serif font-bold text-white truncate">
                  Portal Administrativo
                </h3>
                <span className="text-[11px] text-zinc-400 block truncate">
                  {isAdminAuthenticated
                    ? `${adminEmail || 'Sesión activa'} · Firebase`
                    : 'Acceso exclusivo dirección'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[42px] text-[11px] font-semibold uppercase tracking-wider text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-colors whitespace-nowrap"
                  title="Cerrar sesión de administrador"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#D21923] shrink-0" />
                  <span>Salir</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="min-w-[42px] min-h-[42px] flex items-center justify-center text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shrink-0"
                aria-label="Cerrar panel de administración"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* HORIZONTALLY SCROLLABLE SINGLE-ROW TAB STRIP */}
        {!isCheckingAuth && isAdminAuthenticated && (
          <div
            role="tablist"
            aria-label="Secciones administrativas"
            className="shrink-0 bg-[#141416] border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar"
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabButtonRefs.current[tab.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`admin-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`admin-tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, index)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[42px] text-[11px] sm:text-xs font-semibold uppercase tracking-wider border transition-colors whitespace-nowrap shrink-0 sm:flex-1 ${
                    isActive
                      ? 'bg-[#D21923] border-[#D21923] text-white shadow-md shadow-[#D21923]/20'
                      : 'bg-[#1A1A1D] border-white/10 text-zinc-300 hover:text-white hover:border-white/25'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  <span className="font-mono tabular-nums text-[10px] opacity-90 shrink-0">
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* FLEX VIEWPORT CONTAINER FOR INDEPENDENT SCROLLABLE TAB PANELS */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {isCheckingAuth ? (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-20 text-center text-xs text-zinc-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-[#D21923] animate-spin" />
              <span>Verificando sesión administrativa...</span>
            </div>
          ) : !isAdminAuthenticated ? (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-6 sm:py-10">
              <div className="bg-[#1A1A1D] border border-white/10 p-5 sm:p-8">
                <div className="w-12 h-12 bg-[#D21923]/10 border border-[#D21923]/40 flex items-center justify-center mb-5">
                  <Lock className="w-5 h-5 text-[#D21923]" />
                </div>

                <h4 className="text-xl font-serif font-bold text-white mb-2">
                  Acceso Restringido al Administrador
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  Por privacidad de nuestros alumnos y familias, la agenda de citas en tiempo real y la edición del blog se protegen mediante tu cuenta Google autorizada del club (
                  <span className="text-zinc-200 font-mono break-all">
                    bryanalvarez119@gmail.com
                  </span>
                  ).
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
                      {isLoggingIn
                        ? 'AUTENTICANDO...'
                        : 'CONTINUAR CON GOOGLE (ADMIN)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'citas' && (
                <AdminBookingsTab
                  bookings={bookings}
                  isLoadingBookings={isLoadingBookings}
                  isRealtimeConnected={isRealtimeConnected}
                  onUpdateBookingStatus={onUpdateBookingStatus}
                  onDeleteBooking={onDeleteBooking}
                  onSendTestEmail={onSendTestEmail}
                />
              )}

              {activeTab === 'blog' && (
                <AdminBlogTab
                  blogPosts={blogPosts}
                  onCreateBlogPost={onCreateBlogPost}
                  onUpdateBlogPost={onUpdateBlogPost}
                  onDeleteBlogPost={onDeleteBlogPost}
                />
              )}

              {activeTab === 'plantel' && (
                <AdminHorsesTab
                  totalHorses={totalHorses}
                  totalActivities={totalActivities}
                  onAddHorse={onAddHorse}
                  onResetData={onResetData}
                />
              )}

              {activeTab === 'difusion' && (
                <AdminPushTab
                  pushStats={pushStats}
                  onRefreshPushStats={onRefreshPushStats}
                  onBroadcastPush={onBroadcastPush}
                />
              )}
            </>
          )}
        </div>

        {/* COMPACT STICKY FOOTER */}
        <footer className="shrink-0 px-4 sm:px-6 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#141416] flex items-center justify-between gap-3">
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            La Caballería · Gestión Interna
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[42px] px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-white/5 border border-white/15 hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Cerrar Panel
          </button>
        </footer>
      </div>
    </div>
  );
};
