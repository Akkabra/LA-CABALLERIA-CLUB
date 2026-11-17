import React, { useState, useEffect } from 'react';
import { BellRing, BellOff, Check, CalendarClock, Sparkles, AlarmClock, AlertCircle, Loader2 } from 'lucide-react';
import { usePushNotifications, type PushTopic } from '../hooks/usePushNotifications';

export const PushNotificationWidget: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    topics,
    error,
    feedback,
    subscribe,
    updateTopics,
    unsubscribe,
  } = usePushNotifications();

  const [selectedTopics, setSelectedTopics] = useState<PushTopic[]>(topics);

  useEffect(() => {
    setSelectedTopics(topics);
  }, [topics]);

  const toggleTopic = (topic: PushTopic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        // Require at least one selected topic
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

  const handleSubscribeOrUpdate = async () => {
    if (isSubscribed) {
      await updateTopics(selectedTopics);
    } else {
      await subscribe(selectedTopics);
    }
  };

  return (
    <div className="mt-8 bg-[#1A1A1D] border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#D21923]" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Copy & Topic checkboxes */}
        <div className="space-y-4 flex-1">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#D21923]/15 border border-[#D21923]/50 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 text-[#D21923]" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block">
                Alertas Directas Web Push
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-0.5">
                Recibe avisos de cupos liberados y eventos del club
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Activa notificaciones instantáneas en tu dispositivo para enterarte cuando se libere un horario en pista o cuando abramos jornadas especiales, exhibiciones y campamentos ecuestres.
              </p>
            </div>
          </div>

          {/* Topic Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <label
              className={`p-3.5 border cursor-pointer transition-colors flex items-start gap-3 ${
                selectedTopics.includes('disponibilidad')
                  ? 'bg-[#141416] border-[#D21923]/80'
                  : 'bg-[#141416]/50 border-white/10 hover:border-white/25'
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
                <span className="text-zinc-400 block mt-0.5 text-[11px]">
                  Avisos inmediatos si se abre o cancela un espacio en pista.
                </span>
              </div>
            </label>

            <label
              className={`p-3.5 border cursor-pointer transition-colors flex items-start gap-3 ${
                selectedTopics.includes('eventos')
                  ? 'bg-[#141416] border-[#D21923]/80'
                  : 'bg-[#141416]/50 border-white/10 hover:border-white/25'
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
                <span className="text-zinc-400 block mt-0.5 text-[11px]">
                  Convivencias familiares, clínicas técnicas y vacaciones ecuestres.
                </span>
              </div>
            </label>

            <label
              className={`p-3.5 border cursor-pointer transition-colors flex items-start gap-3 ${
                selectedTopics.includes('recordatorios')
                  ? 'bg-[#141416] border-[#D21923]/80'
                  : 'bg-[#141416]/50 border-white/10 hover:border-white/25'
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
                <span className="text-zinc-400 block mt-0.5 text-[11px]">
                  Avisos previos sobre tus clases reservadas y recomendaciones.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-2.5 shrink-0">
          {!isSupported ? (
            <div className="px-4 py-3 bg-[#141416] border border-white/10 text-xs text-zinc-400 max-w-xs">
              Este navegador no admite Web Push. Prueba desde Chrome, Edge, Firefox o Safari actualizado.
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={isLoading || (isSubscribed && !hasPendingTopicChanges)}
                onClick={handleSubscribeOrUpdate}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors w-full sm:w-auto ${
                  isSubscribed && !hasPendingTopicChanges
                    ? 'bg-[#141416] border border-white/20 text-white cursor-default'
                    : 'bg-[#D21923] hover:bg-[#b8141d] text-white shadow-lg shadow-[#D21923]/25'
                } disabled:opacity-70`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSubscribed && !hasPendingTopicChanges ? (
                  <Check className="w-4 h-4 text-[#D21923]" />
                ) : (
                  <BellRing className="w-4 h-4" />
                )}
                <span>
                  {isLoading
                    ? 'Procesando...'
                    : isSubscribed && hasPendingTopicChanges
                    ? 'Guardar Preferencias'
                    : isSubscribed
                    ? 'Alertas Activadas'
                    : 'Activar Notificaciones Push'}
                </span>
              </button>

              {isSubscribed && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={unsubscribe}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-white bg-[#141416] border border-white/10 hover:border-white/30 transition-colors"
                >
                  <BellOff className="w-3.5 h-3.5 text-[#D21923]" />
                  <span>Desactivar alertas</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Feedback & Permission messages */}
      {(error || feedback || permission === 'denied') && (
        <div
          className={`mt-4 p-3 border text-xs flex items-center gap-2 ${
            error || permission === 'denied'
              ? 'bg-[#D21923]/15 border-[#D21923] text-white'
              : 'bg-[#141416] border-white/15 text-zinc-200'
          }`}
        >
          {error || permission === 'denied' ? (
            <AlertCircle className="w-4 h-4 text-[#D21923] shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-[#D21923] shrink-0" />
          )}
          <span>
            {error ||
              feedback ||
              'Los permisos de notificación están bloqueados en este navegador.'}
          </span>
        </div>
      )}
    </div>
  );
};
