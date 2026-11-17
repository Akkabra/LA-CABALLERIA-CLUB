import React, { useState } from 'react';
import {
  ArrowUp,
  Instagram,
  Facebook,
  Shield,
  Lock,
  ExternalLink,
  Heart,
  X,
  CalendarCheck,
  BellRing,
  BellOff,
  Check,
  CalendarClock,
  Sparkles,
  AlarmClock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CLUB_INFO, GALLERY_PHOTOS } from '../data/clubData';
import { usePushNotifications, type PushTopic } from '../hooks/usePushNotifications';

interface FooterProps {
  onOpenPrivacyModal: () => void;
  onOpenTermsModal: () => void;
  onOpenAdminDrawer: () => void;
}

interface InstagramPostItem {
  id: string;
  imageUrl: string;
  title: string;
  caption: string;
  tag: string;
  likesLabel: string;
  instagramUrl: string;
}

const INSTAGRAM_HANDLE = '@lacaballeriaclub';
const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/';

const INSTAGRAM_POSTS: InstagramPostItem[] = GALLERY_PHOTOS.slice(0, 6).map((photo, index) => {
  const tags = ['Pista', 'Establo', 'Familia', 'Técnica', 'Vínculo', 'Iniciación'];
  const likes = ['142', '189', '214', '167', '203', '175'];
  return {
    id: `ig-${photo.id}`,
    imageUrl: photo.imageUrl,
    title: photo.title,
    caption: `${photo.caption} · #AprenderTambiénEsMontar #LaCaballería`,
    tag: tags[index % tags.length],
    likesLabel: likes[index % likes.length],
    instagramUrl: INSTAGRAM_PROFILE_URL,
  };
});

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacyModal,
  onOpenTermsModal,
  onOpenAdminDrawer,
}) => {
  const [selectedPost, setSelectedPost] = useState<InstagramPostItem | null>(null);
  const {
    isSupported,
    isSubscribed,
    isLoading: isPushLoading,
    permission,
    topics,
    error: pushError,
    feedback: pushFeedback,
    subscribe,
    updateTopics,
    unsubscribe,
  } = usePushNotifications();
  const [selectedTopics, setSelectedTopics] = useState<PushTopic[]>(topics);

  React.useEffect(() => {
    setSelectedTopics(topics);
  }, [topics]);

  const toggleTopic = (topic: PushTopic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== topic);
      }
      return [...prev, topic];
    });
  };

  const hasPendingTopicChanges =
    isSubscribed &&
    (selectedTopics.length !== topics.length ||
      selectedTopics.some((t) => !topics.includes(t)));

  const handleSavePushPreferences = async () => {
    if (isSubscribed) {
      await updateTopics(selectedTopics);
    } else {
      await subscribe(selectedTopics);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Agendar Cita', href: '#agendar-cita' },
    { label: 'Experiencia', href: '#experiencia' },
    { label: 'Caballos & Equipo', href: '#equipo' },
    { label: 'Beneficios', href: '#beneficios' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <footer className="bg-[#0E0E10] border-t border-white/10 text-zinc-400 text-xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={CLUB_INFO.logoUrl}
                alt="La Caballería - Club de Equitación"
                className="h-12 w-auto object-contain filter drop-shadow"
              />
            </div>

            <div className="pt-2">
              <h3 className="text-white font-serif font-bold text-lg tracking-wide">
                LA CABALLERÍA
              </h3>
              <p className="text-xs uppercase tracking-widest text-[#D21923] font-semibold mt-0.5">
                {CLUB_INFO.descriptor}
              </p>
            </div>

            <p className="text-sm text-zinc-300 font-serif italic max-w-sm">
              "{CLUB_INFO.slogan}"
            </p>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Escuela de equitación formativa, deportiva y familiar. Fomentamos la confianza, la disciplina y el respeto mutuo entre jinetes y caballos en un ambiente seguro.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Navegación
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-white hover:underline transition-colors block py-0.5"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Channels Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Canales Oficiales
            </h4>

            <div className="space-y-2.5">
              <p className="text-xs text-zinc-300">
                <span className="text-zinc-500 block">Correo de atención:</span>
                <span className="text-white font-mono break-all">{CLUB_INFO.officialEmail}</span>
              </p>
              <p className="text-xs text-zinc-300">
                <span className="text-zinc-500 block">Dominio oficial:</span>
                <span className="text-white font-mono break-all">{CLUB_INFO.website}</span>
              </p>
              <p className="text-xs text-zinc-300">
                <span className="text-zinc-500 block">Comunidad Instagram:</span>
                <a
                  href={INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#D21923] font-mono inline-flex items-center gap-1 transition-colors"
                >
                  <span>{INSTAGRAM_HANDLE}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="#contacto"
                className="p-2.5 bg-white/5 hover:bg-[#D21923] text-zinc-300 hover:text-white transition-colors border border-white/10"
                title="Contacto"
                aria-label="Contacto"
              >
                <Shield className="w-4 h-4" />
              </a>
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/5 hover:bg-[#D21923] text-zinc-300 hover:text-white transition-colors border border-white/10"
                title={`Instagram ${INSTAGRAM_HANDLE}`}
                aria-label="Instagram oficial"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#contacto"
                className="p-2.5 bg-white/5 hover:bg-[#D21923] text-zinc-300 hover:text-white transition-colors border border-white/10"
                title="Facebook oficial"
                aria-label="Facebook oficial"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Instagram Community Widget */}
        <div className="mt-14 pt-10 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#D21923] font-semibold mb-1.5">
                <Instagram className="w-3.5 h-3.5" />
                <span>Día a día en pista</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-300">{INSTAGRAM_HANDLE}</span>
              </div>
              <h4 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                ÚLTIMAS PUBLICACIONES EN <span className="italic font-normal text-[#D21923]">INSTAGRAM</span>
              </h4>
            </div>

            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#18181B] hover:bg-[#D21923] border border-white/15 hover:border-[#D21923] text-white text-[11px] font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Seguir a {INSTAGRAM_HANDLE}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {INSTAGRAM_POSTS.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-square bg-[#141416] border border-white/10 hover:border-[#D21923] overflow-hidden text-left transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D21923]"
                aria-label={`Ver publicación de Instagram: ${post.title}`}
              >
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center filter grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />

                {/* Top corner tag */}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#141416]/85 border border-white/15 text-[9px] font-mono uppercase tracking-wider text-zinc-200">
                  {post.tag}
                </span>

                {/* Hover overlay (subtle bottom gradient visible on touchscreens too) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/50 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 p-2.5 sm:p-3 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-[11px] text-white font-semibold mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#D21923] fill-[#D21923]" />
                      <span className="font-mono">{post.likesLabel}</span>
                    </span>
                    <Instagram className="w-3.5 h-3.5 text-zinc-300" />
                  </div>
                  <p className="text-[11px] text-zinc-200 line-clamp-2 leading-snug">
                    {post.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Web Push Notification Preferences Section */}
        <div
          id="preferencias-push"
          className="mt-12 pt-10 border-t border-white/10"
          aria-labelledby="footer-push-title"
        >
          <div className="bg-[#141416] border border-white/10 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D21923]" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-[#D21923]/15 border border-[#D21923]/50 flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing className="w-5 h-5 text-[#D21923]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D21923] font-semibold">
                      Notificaciones Web Push
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                      {!isSupported
                        ? 'No compatible'
                        : permission === 'denied'
                        ? 'Permiso bloqueado'
                        : isSubscribed
                        ? 'Suscripción activa'
                        : 'Personaliza tus alertas'}
                    </span>
                  </div>
                  <h4
                    id="footer-push-title"
                    className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight mt-0.5"
                  >
                    GESTIONA TUS <span className="italic font-normal text-[#D21923]">PREFERENCIAS DE AVISOS</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Elige exactamente qué tipo de notificaciones deseas recibir en este dispositivo y actualiza o desactiva tu suscripción en cualquier momento.
                  </p>
                </div>
              </div>

              {isSupported && (
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    disabled={isPushLoading || (isSubscribed && !hasPendingTopicChanges)}
                    onClick={handleSavePushPreferences}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-xs font-semibold uppercase tracking-wider transition-colors w-full sm:w-auto ${
                      isSubscribed && !hasPendingTopicChanges
                        ? 'bg-[#1A1A1D] border border-white/20 text-white cursor-default'
                        : 'bg-[#D21923] hover:bg-[#b8141d] text-white shadow-lg shadow-[#D21923]/25'
                    } disabled:opacity-70`}
                  >
                    {isPushLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSubscribed && !hasPendingTopicChanges ? (
                      <Check className="w-4 h-4 text-[#D21923]" />
                    ) : (
                      <BellRing className="w-4 h-4" />
                    )}
                    <span>
                      {isPushLoading
                        ? 'Procesando...'
                        : isSubscribed && hasPendingTopicChanges
                        ? 'Guardar Preferencias'
                        : isSubscribed
                        ? 'Preferencias Activas'
                        : 'Activar Notificaciones'}
                    </span>
                  </button>

                  {isSubscribed && (
                    <button
                      type="button"
                      disabled={isPushLoading}
                      onClick={unsubscribe}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#1A1A1D] border border-white/10 hover:border-[#D21923] transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                      <BellOff className="w-3.5 h-3.5 text-[#D21923]" />
                      <span>Desactivar</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3 Preference Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-6">
              <label
                className={`p-4 border cursor-pointer transition-colors flex items-start gap-3 ${
                  selectedTopics.includes('eventos')
                    ? 'bg-[#1A1A1D] border-[#D21923]/80'
                    : 'bg-[#0E0E10]/70 border-white/10 hover:border-white/25'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.includes('eventos')}
                  onChange={() => toggleTopic('eventos')}
                  className="mt-0.5 w-4 h-4 rounded-none bg-[#141416] border-white/20 text-[#D21923] focus:ring-[#D21923]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D21923]" />
                    Eventos especiales
                  </span>
                  <span className="text-zinc-400 block mt-1 text-[11px] leading-relaxed">
                    Exhibiciones ecuestres, convivencias familiares, clínicas técnicas y campamentos.
                  </span>
                </div>
              </label>

              <label
                className={`p-4 border cursor-pointer transition-colors flex items-start gap-3 ${
                  selectedTopics.includes('disponibilidad')
                    ? 'bg-[#1A1A1D] border-[#D21923]/80'
                    : 'bg-[#0E0E10]/70 border-white/10 hover:border-white/25'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.includes('disponibilidad')}
                  onChange={() => toggleTopic('disponibilidad')}
                  className="mt-0.5 w-4 h-4 rounded-none bg-[#141416] border-white/20 text-[#D21923] focus:ring-[#D21923]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-[#D21923]" />
                    Disponibilidad de clases
                  </span>
                  <span className="text-zinc-400 block mt-1 text-[11px] leading-relaxed">
                    Avisos inmediatos si se abre un nuevo horario o se libera un cupo en pista.
                  </span>
                </div>
              </label>

              <label
                className={`p-4 border cursor-pointer transition-colors flex items-start gap-3 ${
                  selectedTopics.includes('recordatorios')
                    ? 'bg-[#1A1A1D] border-[#D21923]/80'
                    : 'bg-[#0E0E10]/70 border-white/10 hover:border-white/25'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.includes('recordatorios')}
                  onChange={() => toggleTopic('recordatorios')}
                  className="mt-0.5 w-4 h-4 rounded-none bg-[#141416] border-white/20 text-[#D21923] focus:ring-[#D21923]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <AlarmClock className="w-3.5 h-3.5 text-[#D21923]" />
                    Recordatorios de citas
                  </span>
                  <span className="text-zinc-400 block mt-1 text-[11px] leading-relaxed">
                    Avisos previos sobre tus sesiones agendadas, vestimenta y recomendaciones de pista.
                  </span>
                </div>
              </label>
            </div>

            {!isSupported && (
              <div className="mt-4 p-3 bg-[#0E0E10] border border-white/10 text-xs text-zinc-400">
                Tu navegador actual no admite notificaciones Web Push. Prueba desde Chrome, Edge, Firefox o Safari actualizado.
              </div>
            )}

            {(pushError || pushFeedback || permission === 'denied') && (
              <div
                className={`mt-4 p-3 border text-xs flex items-center gap-2 ${
                  pushError || permission === 'denied'
                    ? 'bg-[#D21923]/15 border-[#D21923] text-white'
                    : 'bg-[#1A1A1D] border-white/15 text-zinc-200'
                }`}
              >
                {pushError || permission === 'denied' ? (
                  <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-[#D21923] shrink-0" />
                )}
                <span>
                  {pushError ||
                    pushFeedback ||
                    'Los permisos de notificación están bloqueados en este navegador.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 text-xs text-zinc-500 text-center sm:text-left">
            <span>© 2026 {CLUB_INFO.name} {CLUB_INFO.descriptor}. Todos los derechos reservados.</span>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="hover:text-zinc-300 underline"
            >
              Política de Privacidad
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenTermsModal}
              className="hover:text-zinc-300 underline"
            >
              Condiciones del Club
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenAdminDrawer}
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Lock className="w-3 h-3 text-[#D21923]" />
              <span>Acceso Admin</span>
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5"
            aria-label="Volver al inicio de la página"
          >
            <span>Subir</span>
            <ArrowUp className="w-4 h-4 text-[#D21923]" />
          </button>
        </div>
      </div>

      {/* Instagram Post Preview Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#141416] border border-white/15 shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-[#141416]/80 hover:bg-[#D21923] text-white border border-white/15 transition-colors"
              aria-label="Cerrar publicación"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-square bg-black">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
                  <img
                    src={CLUB_INFO.logoUrl}
                    alt="La Caballería"
                    className="h-7 w-auto object-contain"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{INSTAGRAM_HANDLE}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#D21923]">
                      {selectedPost.tag}
                    </span>
                  </div>
                </div>

                <h5 className="text-base font-serif font-bold text-white mb-2">
                  {selectedPost.title}
                </h5>
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  {selectedPost.caption}
                </p>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Heart className="w-3.5 h-3.5 text-[#D21923] fill-[#D21923]" />
                  <span>{selectedPost.likesLabel} Me gusta en comunidad</span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-white/10 flex flex-col gap-2.5">
                <a
                  href={selectedPost.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D21923] hover:bg-[#b8141d] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Abrir en Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="#agendar-cita"
                  onClick={() => setSelectedPost(null)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-[#D21923]" />
                  <span>Agendar una clase</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
