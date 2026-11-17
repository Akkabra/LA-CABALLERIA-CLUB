import { useState, useEffect, useCallback } from 'react';

export type PushTopic = 'disponibilidad' | 'eventos' | 'recordatorios';

const PUSH_TOPICS_STORAGE_KEY = 'lc_push_topics';
const PUSH_SYNC_EVENT = 'lc:push-sync';
const DEFAULT_TOPICS: PushTopic[] = ['disponibilidad', 'eventos', 'recordatorios'];

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getStoredTopics(): PushTopic[] {
  try {
    const raw = window.localStorage.getItem(PUSH_TOPICS_STORAGE_KEY);
    if (!raw) return DEFAULT_TOPICS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(
        (t): t is PushTopic =>
          t === 'disponibilidad' || t === 'eventos' || t === 'recordatorios'
      );
      if (valid.length > 0) return valid;
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_TOPICS;
}

function saveStoredTopics(topics: PushTopic[]): void {
  try {
    window.localStorage.setItem(PUSH_TOPICS_STORAGE_KEY, JSON.stringify(topics));
  } catch {
    // Ignore storage errors
  }
}

function broadcastPushSync(isSubscribed: boolean, topics: PushTopic[]): void {
  try {
    window.dispatchEvent(
      new CustomEvent(PUSH_SYNC_EVENT, { detail: { isSubscribed, topics } })
    );
  } catch {
    // Ignore event errors
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [topics, setTopics] = useState<PushTopic[]>(() => getStoredTopics());
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
      return;
    }

    setPermission(Notification.permission);

    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        if (reg) {
          const existingSub = await reg.pushManager.getSubscription();
          if (!cancelled && existingSub) {
            setIsSubscribed(true);
          }
        }
      } catch {
        // Ignore initialization errors inside restricted frames
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    const handleSync = (event: Event) => {
      const custom = event as CustomEvent<{
        isSubscribed?: boolean;
        topics?: PushTopic[];
      }>;
      if (typeof custom.detail?.isSubscribed === 'boolean') {
        setIsSubscribed(custom.detail.isSubscribed);
      }
      if (Array.isArray(custom.detail?.topics)) {
        setTopics(custom.detail.topics);
      }
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    window.addEventListener(PUSH_SYNC_EVENT, handleSync);

    return () => {
      cancelled = true;
      window.removeEventListener(PUSH_SYNC_EVENT, handleSync);
    };
  }, []);

  const registerSubscription = useCallback(async (selectedTopics: PushTopic[]) => {
    setError(null);
    setFeedback(null);

    if (!isSupported) {
      setError('Tu navegador actual no soporta notificaciones Web Push.');
      return false;
    }

    const sanitizedTopics: PushTopic[] =
      selectedTopics.length > 0 ? selectedTopics : DEFAULT_TOPICS;

    setIsLoading(true);
    try {
      const currentPerm = Notification.permission;
      if (currentPerm === 'denied') {
        setPermission('denied');
        setError(
          'Los permisos de notificación están bloqueados. Habilítalos en la configuración de tu navegador para recibir alertas.'
        );
        return false;
      }

      const permResult =
        currentPerm === 'granted' ? 'granted' : await Notification.requestPermission();
      setPermission(permResult);

      if (permResult !== 'granted') {
        setError(
          'No se concedió permiso para notificaciones. Si estás viendo la web dentro de una vista previa embebida, ábrela en una pestaña independiente para activar alertas.'
        );
        return false;
      }

      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const keyRes = await fetch('/api/push/vapid-public-key');
        const keyData = (await keyRes.json().catch(() => ({}))) as { publicKey?: string };
        if (!keyRes.ok || !keyData.publicKey) {
          throw new Error('No se pudo obtener la clave pública del servidor de notificaciones.');
        }

        const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      const subRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          topics: sanitizedTopics,
        }),
      });

      if (!subRes.ok) {
        const errData = (await subRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || 'No se pudo guardar la suscripción en el servidor.');
      }

      saveStoredTopics(sanitizedTopics);
      setTopics(sanitizedTopics);
      setIsSubscribed(true);
      broadcastPushSync(true, sanitizedTopics);
      setFeedback('Suscripción y preferencias guardadas en este dispositivo.');
      return true;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo activar el servicio de notificaciones push en este entorno.';
      if (
        msg.toLowerCase().includes('frame') ||
        msg.toLowerCase().includes('denied') ||
        msg.toLowerCase().includes('permission')
      ) {
        setError(
          'El navegador bloqueó el permiso dentro del marco actual. Abre el sitio en su propia pestaña para activar las notificaciones push.'
        );
      } else {
        setError(msg);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const updateTopics = useCallback(
    async (nextTopics: PushTopic[]) => {
      if (nextTopics.length === 0) {
        setError('Selecciona al menos un tema de interés para mantener tu suscripción.');
        return false;
      }
      setTopics(nextTopics);
      saveStoredTopics(nextTopics);

      if (isSubscribed) {
        return registerSubscription(nextTopics);
      }
      return true;
    },
    [isSubscribed, registerSubscription]
  );

  const unsubscribe = useCallback(async () => {
    setError(null);
    setFeedback(null);
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const subscription = reg ? await reg.pushManager.getSubscription() : null;

      if (subscription) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => {});

        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      broadcastPushSync(false, topics);
      setFeedback('Notificaciones push desactivadas en este dispositivo.');
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo desactivar la suscripción.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    topics,
    setTopics,
    error,
    feedback,
    subscribe: registerSubscription,
    updateTopics,
    unsubscribe,
  };
}
