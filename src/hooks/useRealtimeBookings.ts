import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppointmentBooking, BlogCategory, BlogPost, OccupiedSlot } from '../types';

export interface CreateBookingPayload {
  classTypeId: string;
  classTypeName: string;
  instructorId: string;
  instructorName: string;
  date: string;
  formattedDate: string;
  timeSlot: string;
  studentName: string;
  studentAge: string;
  guardianName: string;
  phone: string;
  email: string;
  experienceLevel: AppointmentBooking['experienceLevel'];
  notes: string;
}

export interface PushStats {
  totalSubscribers: number;
  disponibilidadCount: number;
  eventosCount: number;
  recordatoriosCount: number;
}

export interface PushBroadcastPayload {
  title: string;
  body: string;
  topic: 'disponibilidad' | 'eventos' | 'recordatorios' | 'todos';
  url?: string;
}

export interface PushBroadcastResult {
  sent: number;
  failed: number;
  removed: number;
}

export interface BlogPostPayload {
  title: string;
  category: BlogCategory;
  excerpt: string;
  content: string;
  authorName?: string;
  coverImageUrl?: string;
  readTime?: string;
  published?: boolean;
}

type WsMessage =
  | { type: 'availability:init'; occupiedSlots: OccupiedSlot[] }
  | { type: 'availability:updated'; occupiedSlots: OccupiedSlot[] }
  | { type: 'bookings:init'; bookings: AppointmentBooking[] }
  | { type: 'booking:created'; booking: AppointmentBooking }
  | { type: 'booking:updated'; booking: AppointmentBooking }
  | { type: 'booking:deleted'; id: string }
  | { type: 'blog:init'; posts: BlogPost[] }
  | { type: 'blog:updated'; posts: BlogPost[] };

const ADMIN_TOKEN_STORAGE_KEY = 'lc_admin_token';

function getStoredAdminToken(): string | null {
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredAdminToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useRealtimeBookings() {
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [bookings, setBookings] = useState<AppointmentBooking[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [pushStats, setPushStats] = useState<PushStats>({
    totalSubscribers: 0,
    disponibilidadCount: 0,
    eventosCount: 0,
    recordatoriosCount: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);
  const isAdminRef = useRef(false);

  useEffect(() => {
    isAdminRef.current = isAdminAuthenticated;
  }, [isAdminAuthenticated]);

  const upsertBooking = useCallback((incoming: AppointmentBooking) => {
    setBookings((prev) => {
      const idx = prev.findIndex((b) => b.id === incoming.id);
      if (idx === -1) {
        return [incoming, ...prev];
      }
      const next = [...prev];
      next[idx] = incoming;
      return next;
    });
  }, []);

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch('/api/availability');
      if (!res.ok) return;
      const data = (await res.json()) as { occupiedSlots?: OccupiedSlot[] };
      if (!isUnmountedRef.current && Array.isArray(data.occupiedSlots)) {
        setOccupiedSlots(data.occupiedSlots);
      }
    } catch {
      // Silent retry via WebSocket
    }
  }, []);

  const fetchBlogPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/blog', {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { posts?: BlogPost[] };
      if (!isUnmountedRef.current && Array.isArray(data.posts)) {
        setBlogPosts(data.posts);
      }
    } catch {
      // Silent retry via WebSocket
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoadingBlog(false);
      }
    }
  }, []);

  const fetchAdminBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await fetch('/api/bookings', {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        setStoredAdminToken(null);
        if (!isUnmountedRef.current) {
          isAdminRef.current = false;
          setIsAdminAuthenticated(false);
          setBookings([]);
        }
        return false;
      }
      if (!res.ok) throw new Error('No se pudieron cargar las citas');
      const data = (await res.json()) as { bookings: AppointmentBooking[] };
      if (!isUnmountedRef.current) {
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      }
      return true;
    } catch {
      return false;
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoadingBookings(false);
      }
    }
  }, []);

  const fetchPushStats = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/admin/push/stats', {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = (await res.json()) as Partial<PushStats>;
      if (!isUnmountedRef.current) {
        setPushStats({
          totalSubscribers: Number(data.totalSubscribers) || 0,
          disponibilidadCount: Number(data.disponibilidadCount) || 0,
          eventosCount: Number(data.eventosCount) || 0,
          recordatoriosCount: Number(data.recordatoriosCount) || 0,
        });
      }
    } catch {
      // Ignore stats error
    }
  }, []);

  const checkAdminSession = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      const res = await fetch('/api/admin/session', {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        setStoredAdminToken(null);
        if (!isUnmountedRef.current) {
          isAdminRef.current = false;
          setIsAdminAuthenticated(false);
          setBookings([]);
          setPushStats({
            totalSubscribers: 0,
            disponibilidadCount: 0,
            eventosCount: 0,
            recordatoriosCount: 0,
          });
        }
        return false;
      }
      const data = (await res.json()) as { authenticated: boolean };
      const authed = Boolean(data.authenticated);
      if (!authed) {
        setStoredAdminToken(null);
      }
      if (!isUnmountedRef.current) {
        isAdminRef.current = authed;
        setIsAdminAuthenticated(authed);
        if (authed) {
          await Promise.all([fetchAdminBookings(), fetchPushStats()]);
        } else {
          setBookings([]);
          setPushStats({
            totalSubscribers: 0,
            disponibilidadCount: 0,
            eventosCount: 0,
            recordatoriosCount: 0,
          });
        }
      }
      return authed;
    } catch {
      if (!isUnmountedRef.current) {
        isAdminRef.current = false;
        setIsAdminAuthenticated(false);
        setBookings([]);
      }
      return false;
    } finally {
      if (!isUnmountedRef.current) {
        setIsCheckingAuth(false);
      }
    }
  }, [fetchAdminBookings, fetchPushStats]);

  const connectWebSocket = useCallback(() => {
    if (isUnmountedRef.current) return;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = getStoredAdminToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
    const wsUrl = `${protocol}//${window.location.host}/ws/bookings${tokenQuery}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmountedRef.current) {
          ws.close();
          return;
        }
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          if (msg.type === 'availability:init' || msg.type === 'availability:updated') {
            setOccupiedSlots(Array.isArray(msg.occupiedSlots) ? msg.occupiedSlots : []);
          } else if (msg.type === 'blog:init' || msg.type === 'blog:updated') {
            setBlogPosts(Array.isArray(msg.posts) ? msg.posts : []);
            setIsLoadingBlog(false);
          } else if (msg.type === 'bookings:init') {
            if (isAdminRef.current) {
              setBookings(Array.isArray(msg.bookings) ? msg.bookings : []);
              setIsLoadingBookings(false);
            }
          } else if (msg.type === 'booking:created' || msg.type === 'booking:updated') {
            if (isAdminRef.current) {
              upsertBooking(msg.booking);
            }
          } else if (msg.type === 'booking:deleted') {
            if (isAdminRef.current) {
              setBookings((prev) => prev.filter((b) => b.id !== msg.id));
            }
          }
        } catch {
          // Ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);
        const delay = Math.min(1000 * Math.pow(1.6, reconnectAttemptsRef.current), 10000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = window.setTimeout(() => {
          fetchAvailability();
          if (isAdminRef.current) {
            fetchAdminBookings();
          }
          connectWebSocket();
        }, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setIsConnected(false);
    }
  }, [fetchAvailability, fetchAdminBookings, upsertBooking]);

  useEffect(() => {
    isUnmountedRef.current = false;
    fetchAvailability();
    fetchBlogPosts();
    checkAdminSession().finally(() => {
      connectWebSocket();
    });

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [fetchAvailability, fetchBlogPosts, checkAdminSession, connectWebSocket]);

  const loginAdmin = useCallback(
    async (password: string): Promise<void> => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        authenticated?: boolean;
        token?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data?.error || 'Credenciales inválidas.');
      }

      if (data.token) {
        setStoredAdminToken(data.token);
      }

      isAdminRef.current = true;
      setIsAdminAuthenticated(true);
      const loaded = await fetchAdminBookings();
      if (!loaded) {
        throw new Error('No se pudo validar la sesión administrativa en el navegador.');
      }
      void fetchPushStats();
      void fetchBlogPosts();
      connectWebSocket();
    },
    [fetchAdminBookings, fetchPushStats, fetchBlogPosts, connectWebSocket]
  );

  const logoutAdmin = useCallback(async (): Promise<void> => {
    setStoredAdminToken(null);
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});

    isAdminRef.current = false;
    setIsAdminAuthenticated(false);
    setBookings([]);
    setPushStats({
      totalSubscribers: 0,
      disponibilidadCount: 0,
      eventosCount: 0,
      recordatoriosCount: 0,
    });
    void fetchBlogPosts();
    connectWebSocket();
  }, [fetchBlogPosts, connectWebSocket]);

  const createBooking = useCallback(
    async (payload: CreateBookingPayload): Promise<AppointmentBooking> => {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo registrar la cita.');
      }

      const created = data.booking as AppointmentBooking;
      if (created.instructorId !== 'inst-cualquiera') {
        setOccupiedSlots((prev) => [
          ...prev,
          {
            date: created.date,
            timeSlot: created.timeSlot,
            instructorId: created.instructorId,
          },
        ]);
      }
      if (isAdminRef.current) {
        upsertBooking(created);
      }
      return created;
    },
    [upsertBooking]
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: AppointmentBooking['status']): Promise<AppointmentBooking> => {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo actualizar la cita.');
      }

      const updated = data.booking as AppointmentBooking;
      upsertBooking(updated);
      fetchAvailability();
      return updated;
    },
    [upsertBooking, fetchAvailability]
  );

  const deleteBooking = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'No se pudo eliminar la cita.');
      }

      setBookings((prev) => prev.filter((b) => b.id !== id));
      fetchAvailability();
    },
    [fetchAvailability]
  );

  const sendTestEmail = useCallback(async (): Promise<{ provider?: string; recipient?: string }> => {
    const res = await fetch('/api/admin/test-email', {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'No se pudo enviar el correo de prueba.');
    }

    return { provider: data?.provider, recipient: data?.recipient };
  }, []);

  const broadcastPush = useCallback(
    async (payload: PushBroadcastPayload): Promise<PushBroadcastResult> => {
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo enviar la difusión Web Push.');
      }

      void fetchPushStats();
      return {
        sent: Number(data?.sent) || 0,
        failed: Number(data?.failed) || 0,
        removed: Number(data?.removed) || 0,
      };
    },
    [fetchPushStats]
  );

  const createBlogPost = useCallback(async (payload: BlogPostPayload): Promise<BlogPost> => {
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'No se pudo publicar el artículo.');
    }

    const created = data.post as BlogPost;
    setBlogPosts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    return created;
  }, []);

  const updateBlogPost = useCallback(
    async (id: string, payload: Partial<BlogPostPayload>): Promise<BlogPost> => {
      const res = await fetch(`/api/blog/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo actualizar el artículo.');
      }

      const updated = data.post as BlogPost;
      setBlogPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    },
    []
  );

  const deleteBlogPost = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/blog/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'No se pudo eliminar el artículo.');
    }

    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    occupiedSlots,
    bookings,
    blogPosts,
    isLoadingBookings,
    isLoadingBlog,
    isAdminAuthenticated,
    isCheckingAuth,
    isConnected,
    pushStats,
    loginAdmin,
    logoutAdmin,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    sendTestEmail,
    fetchPushStats,
    broadcastPush,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
  };
}
