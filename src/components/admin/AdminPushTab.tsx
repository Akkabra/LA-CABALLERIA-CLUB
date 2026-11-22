import React, { useState } from 'react';
import { RefreshCw, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import type {
  PushStats,
  PushBroadcastPayload,
  PushBroadcastResult,
} from '../../hooks/useRealtimeBookings';

interface AdminPushTabProps {
  pushStats: PushStats;
  onRefreshPushStats: () => Promise<void>;
  onBroadcastPush: (payload: PushBroadcastPayload) => Promise<PushBroadcastResult>;
}

export const AdminPushTab: React.FC<AdminPushTabProps> = ({
  pushStats,
  onRefreshPushStats,
  onBroadcastPush,
}) => {
  const [pushTopic, setPushTopic] = useState<
    'disponibilidad' | 'eventos' | 'recordatorios' | 'todos'
  >('todos');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('/#agendar-cita');
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [isRefreshingPushStats, setIsRefreshingPushStats] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

  return (
    <section
      role="tabpanel"
      id="admin-tabpanel-difusion"
      aria-labelledby="admin-tab-difusion"
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 py-4 sm:py-5"
    >
      <div className="space-y-5 pb-2">
        <div className="bg-[#1A1A1D] border border-white/10 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D21923] font-semibold block">
                Servicio Web Push · VAPID
              </span>
              <h4 className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">
                Audiencia Suscrita a Notificaciones
              </h4>
            </div>

            <button
              type="button"
              onClick={handleRefreshPushStats}
              disabled={isRefreshingPushStats}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-[11px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-white bg-[#141416] border border-white/15 hover:border-[#D21923] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#D21923] shrink-0 ${
                  isRefreshingPushStats ? 'animate-spin' : ''
                }`}
              />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-3.5 sm:p-4 bg-[#141416] border border-white/10">
              <span className="text-zinc-400 block">Dispositivos suscritos</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-white mt-1 block">
                {pushStats.totalSubscribers}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#141416] border border-white/10">
              <span className="text-zinc-400 block">Disponibilidad</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#D21923] mt-1 block">
                {pushStats.disponibilidadCount}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#141416] border border-white/10">
              <span className="text-zinc-400 block">Eventos especiales</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-white mt-1 block">
                {pushStats.eventosCount}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#141416] border border-white/10">
              <span className="text-zinc-400 block">Recordatorios</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-white mt-1 block">
                {pushStats.recordatoriosCount}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
            Además de las difusiones manuales, el sistema envía automáticamente una alerta a los suscriptores de{' '}
            <strong className="text-white">Disponibilidad de clases</strong> cada vez que cancelas una reserva y se libera un horario en pista.
          </p>
        </div>

        <form
          onSubmit={handleBroadcastPushSubmit}
          className="bg-[#1A1A1D] border border-white/10 p-4 sm:p-6 space-y-4"
        >
          <div className="space-y-3 pb-3 border-b border-white/10">
            <h4 className="text-xs uppercase tracking-widest text-[#D21923] font-semibold">
              Enviar Aviso Push Instantáneo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                className="w-full px-3 py-2 min-h-[40px] text-[11px] font-medium bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors text-center"
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
                className="w-full px-3 py-2 min-h-[40px] text-[11px] font-medium bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors text-center"
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
                className="w-full px-3 py-2 min-h-[40px] text-[11px] font-medium bg-[#141416] border border-white/10 hover:border-[#D21923] text-zinc-300 hover:text-white transition-colors text-center"
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

          <div className="flex items-center justify-end pt-1">
            <button
              type="submit"
              disabled={isSendingPush}
              className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#D21923] hover:bg-[#b8141d] transition-colors disabled:opacity-50 whitespace-nowrap"
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
    </section>
  );
};
