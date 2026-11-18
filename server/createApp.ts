import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';
import type { AppointmentBooking, BlogCategory, OccupiedSlot } from '../src/types';
import {
  sendNewBookingAdminNotification,
  sendTestAdminNotification,
} from './emailService';
import {
  getVapidPublicKey,
  upsertPushSubscription,
  removePushSubscription,
  getPushStats,
  broadcastPushNotification,
  type PushTopic,
} from './pushService';
import {
  getAllBlogPosts,
  getPublishedBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from './blogService';
import { getWritableDataDir } from './storageDir';

if (!getApps().length && firebaseConfig?.projectId) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const ADMIN_BOOTSTRAP_EMAIL = 'bryanalvarez119@gmail.com';
const DATA_DIR = getWritableDataDir();
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'caballeria2026').trim();
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET?.trim() ||
  crypto.createHash('sha256').update(`${ADMIN_PASSWORD}:lc-session-key`).digest('hex');
const ADMIN_COOKIE_NAME = 'lc_admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch {
    // Fallback to in-memory store if filesystem is read-only
  }
}

function loadBookings(): AppointmentBooking[] {
  try {
    ensureDataFile();
    if (!fs.existsSync(BOOKINGS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AppointmentBooking[]) : [];
  } catch (err) {
    console.error('Error reading bookings store:', err);
    return [];
  }
}

function saveBookings(bookings: AppointmentBooking[]): void {
  try {
    ensureDataFile();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing bookings store:', err);
  }
}

let bookingsStore: AppointmentBooking[] = loadBookings();

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

function signAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + SESSION_TTL_MS })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

async function verifyFirebaseAdminBearer(req: express.Request): Promise<boolean> {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7).trim();
  if (!token || token.split('.').length !== 3) {
    return false;
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return Boolean(
      decoded.email_verified &&
        decoded.email &&
        decoded.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL
    );
  } catch {
    return false;
  }
}

export function isRequestAdmin(req: express.Request | http.IncomingMessage): boolean {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (verifyAdminToken(bearerToken)) return true;
  }

  if (req.url && req.url.includes('token=')) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const queryToken = url.searchParams.get('token') || undefined;
      if (verifyAdminToken(queryToken)) return true;
    } catch {
      // Ignore invalid URL
    }
  }

  const cookies = parseCookies(req.headers.cookie);
  return verifyAdminToken(cookies[ADMIN_COOKIE_NAME]);
}

function safeComparePassword(submitted: string, expected: string): boolean {
  const a = crypto.createHash('sha256').update(submitted).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function getOccupiedSlots(): OccupiedSlot[] {
  return bookingsStore
    .filter((b) => b.status !== 'cancelada' && b.instructorId !== 'inst-cualquiera')
    .map((b) => ({
      date: b.date,
      timeSlot: b.timeSlot,
      instructorId: b.instructorId,
    }));
}

export function getBookingsSnapshot(): AppointmentBooking[] {
  return bookingsStore;
}

export interface ApiAppCallbacks {
  onAvailabilityChanged?: () => void;
  onBookingCreated?: (booking: AppointmentBooking) => void;
  onBookingUpdated?: (booking: AppointmentBooking) => void;
  onBookingDeleted?: (id: string) => void;
  onBlogUpdated?: () => void;
}

export function createApiApp(callbacks: ApiAppCallbacks = {}) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());

  // Health endpoint (no PII)
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Public booking notification relay (sends admin email asynchronously when SMTP/Resend is configured)
  app.post('/api/bookings/notify-email', (req, res) => {
    const booking = req.body as Partial<AppointmentBooking>;
    if (!booking?.bookingCode || !booking?.studentName || !booking?.email) {
      res.status(400).json({ error: 'Datos de notificación incompletos.' });
      return;
    }
    void sendNewBookingAdminNotification(booking as AppointmentBooking).catch((err) => {
      console.error('[Email Notification] Failed:', err);
    });
    res.json({ ok: true });
  });

  // Admin auth endpoints
  app.get('/api/admin/session', async (req, res) => {
    const authed = isRequestAdmin(req) || (await verifyFirebaseAdminBearer(req));
    res.json({ authenticated: authed });
  });

  app.post('/api/admin/login', (req, res) => {
    const body = (req.body || {}) as { password?: string };
    const password = typeof body.password === 'string' ? body.password : '';
    if (!password) {
      res.status(400).json({ error: 'Ingresa la contraseña de administrador.' });
      return;
    }

    if (
      !safeComparePassword(password, ADMIN_PASSWORD) &&
      !safeComparePassword(password.trim(), ADMIN_PASSWORD)
    ) {
      res.status(401).json({ error: 'Contraseña de administrador incorrecta.' });
      return;
    }

    const token = signAdminToken();
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieParts = [
      `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
      isHttps ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax',
    ];
    res.setHeader('Set-Cookie', cookieParts.join('; '));
    res.json({ authenticated: true, token });
  });

  app.post('/api/admin/logout', (req, res) => {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieParts = [
      `${ADMIN_COOKIE_NAME}=`,
      'HttpOnly',
      'Path=/',
      'Max-Age=0',
      isHttps ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax',
    ];
    res.setHeader('Set-Cookie', cookieParts.join('; '));
    res.json({ ok: true });
  });

  // Admin middleware (supports Firebase Admin ID Token OR HMAC session cookie/token)
  const requireAdmin: express.RequestHandler = async (req, res, next) => {
    if (isRequestAdmin(req) || (await verifyFirebaseAdminBearer(req))) {
      next();
      return;
    }
    res.status(401).json({ error: 'Acceso restringido. Inicia sesión como administrador.' });
  };

  // Admin-only: verify and send test email notification
  app.post('/api/admin/test-email', requireAdmin, async (_req, res) => {
    try {
      const result = await sendTestAdminNotification();
      if (!result.sent) {
        res.status(400).json({
          error:
            result.reason ||
            'Configura ADMIN_NOTIFICATION_EMAIL junto con SMTP_* o RESEND_API_KEY en los Secrets del servidor.',
        });
        return;
      }
      res.json({
        ok: true,
        provider: result.provider,
        recipient: result.recipient,
      });
    } catch (err) {
      res.status(502).json({
        error:
          err instanceof Error
            ? `Error enviando el correo: ${err.message}`
            : 'No se pudo enviar el correo de prueba.',
      });
    }
  });

  // Web Push public endpoints
  app.get('/api/push/vapid-public-key', (_req, res) => {
    res.json({ publicKey: getVapidPublicKey() });
  });

  app.post('/api/push/subscribe', (req, res) => {
    const body = (req.body || {}) as {
      subscription?: {
        endpoint?: string;
        expirationTime?: number | null;
        keys?: { p256dh?: string; auth?: string };
      };
      topics?: PushTopic[];
    };

    const sub = body?.subscription;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      res.status(400).json({ error: 'Suscripción Web Push inválida o incompleta.' });
      return;
    }

    const saved = upsertPushSubscription({
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? null,
      keys: {
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      topics: body.topics,
    });

    res.status(201).json({ ok: true, topics: saved.topics });
  });

  app.post('/api/push/unsubscribe', (req, res) => {
    const { endpoint } = (req.body || {}) as { endpoint?: string };
    if (!endpoint || typeof endpoint !== 'string') {
      res.status(400).json({ error: 'Endpoint de suscripción requerido.' });
      return;
    }

    removePushSubscription(endpoint);
    res.json({ ok: true });
  });

  // Admin-only Web Push management endpoints
  app.get('/api/admin/push/stats', requireAdmin, (_req, res) => {
    res.json(getPushStats());
  });

  app.post('/api/admin/push/broadcast', requireAdmin, async (req, res) => {
    const { title, body, topic, url, subscriptions } = (req.body || {}) as {
      title?: string;
      body?: string;
      topic?: PushTopic | 'todos';
      url?: string;
      subscriptions?: Array<{
        endpoint: string;
        keys: { p256dh: string; auth: string };
        topics: PushTopic[];
      }>;
    };

    if (!title?.trim() || !body?.trim()) {
      res.status(400).json({ error: 'El título y el mensaje de la notificación son obligatorios.' });
      return;
    }

    const validTopic: PushTopic | 'todos' =
      topic === 'disponibilidad' ||
      topic === 'eventos' ||
      topic === 'recordatorios' ||
      topic === 'todos'
        ? topic
        : 'todos';

    try {
      const result = await broadcastPushNotification({
        title: title.trim(),
        body: body.trim(),
        topic: validTopic,
        url: url?.trim() || '/#agendar-cita',
        extraSubscriptions: subscriptions,
      });
      res.json({ ok: true, ...result });
    } catch (err) {
      res.status(502).json({
        error:
          err instanceof Error
            ? `Error enviando notificaciones push: ${err.message}`
            : 'No se pudieron enviar las notificaciones push.',
      });
    }
  });

  // Public anonymized slot availability (no PII)
  app.get('/api/availability', (_req, res) => {
    res.json({ occupiedSlots: getOccupiedSlots() });
  });

  // Blog endpoints (public sees published only; admin sees all including drafts)
  app.get('/api/blog', (req, res) => {
    const posts = isRequestAdmin(req) ? getAllBlogPosts() : getPublishedBlogPosts();
    res.json({ posts });
  });

  app.post('/api/blog', requireAdmin, (req, res) => {
    const body = (req.body || {}) as Partial<{
      title: string;
      category: BlogCategory;
      excerpt: string;
      content: string;
      authorName: string;
      coverImageUrl: string;
      readTime: string;
      published: boolean;
    }>;

    if (!body.title?.trim() || !body.excerpt?.trim() || !body.content?.trim()) {
      res.status(400).json({
        error: 'El título, resumen y contenido del artículo son obligatorios.',
      });
      return;
    }

    const created = createBlogPost({
      title: body.title,
      category: body.category || 'noticias-club',
      excerpt: body.excerpt,
      content: body.content,
      authorName: body.authorName,
      coverImageUrl: body.coverImageUrl,
      readTime: body.readTime,
      published: body.published,
    });

    callbacks.onBlogUpdated?.();
    res.status(201).json({ post: created });
  });

  app.patch('/api/blog/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const body = (req.body || {}) as Partial<{
      title: string;
      category: BlogCategory;
      excerpt: string;
      content: string;
      authorName: string;
      coverImageUrl: string;
      readTime: string;
      published: boolean;
    }>;

    const updated = updateBlogPost(id, body);
    if (!updated) {
      res.status(404).json({ error: 'Artículo no encontrado.' });
      return;
    }

    callbacks.onBlogUpdated?.();
    res.json({ post: updated });
  });

  app.delete('/api/blog/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = deleteBlogPost(id);
    if (!deleted) {
      res.status(404).json({ error: 'Artículo no encontrado.' });
      return;
    }

    callbacks.onBlogUpdated?.();
    res.json({ ok: true, id });
  });

  // Admin-only: get all scheduled bookings
  app.get('/api/bookings', requireAdmin, (_req, res) => {
    res.json({ bookings: bookingsStore });
  });

  // Public: create a new booking
  app.post('/api/bookings', (req, res) => {
    const body = (req.body || {}) as Partial<AppointmentBooking>;

    if (
      !body.classTypeId ||
      !body.classTypeName ||
      !body.instructorId ||
      !body.instructorName ||
      !body.date ||
      !body.formattedDate ||
      !body.timeSlot ||
      !body.studentName?.trim() ||
      !body.studentAge?.trim() ||
      !body.phone?.trim() ||
      !body.email?.trim()
    ) {
      res.status(400).json({
        error: 'Faltan datos obligatorios para registrar la cita.',
      });
      return;
    }

    if (body.instructorId !== 'inst-cualquiera') {
      const conflict = bookingsStore.find(
        (b) =>
          b.status !== 'cancelada' &&
          b.date === body.date &&
          b.timeSlot === body.timeSlot &&
          b.instructorId === body.instructorId
      );
      if (conflict) {
        res.status(409).json({
          error:
            'Este horario acaba de ser reservado con el profesor seleccionado. Por favor elige otro horario o profesor.',
        });
        return;
      }
    }

    const newBooking: AppointmentBooking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      bookingCode: `LC-${Math.floor(100000 + Math.random() * 900000)}`,
      classTypeId: body.classTypeId,
      classTypeName: body.classTypeName,
      instructorId: body.instructorId,
      instructorName: body.instructorName,
      date: body.date,
      formattedDate: body.formattedDate,
      timeSlot: body.timeSlot,
      studentName: body.studentName.trim(),
      studentAge: body.studentAge.trim(),
      guardianName: body.guardianName?.trim() || 'No aplica (Adulto)',
      phone: body.phone.trim(),
      email: body.email.trim(),
      experienceLevel: body.experienceLevel || 'Sin experiencia (Primera vez)',
      notes: body.notes?.trim() || 'Sin observaciones previas',
      createdAt: new Date().toISOString(),
      status: body.instructorId === 'inst-cualquiera' ? 'solicitada' : 'confirmada',
    };

    bookingsStore = [newBooking, ...bookingsStore];
    saveBookings(bookingsStore);

    callbacks.onAvailabilityChanged?.();
    callbacks.onBookingCreated?.(newBooking);

    void sendNewBookingAdminNotification(newBooking)
      .then((result) => {
        if (!result.sent && result.reason) {
          console.info(`[Email Notification] Skipped for ${newBooking.bookingCode}: ${result.reason}`);
        } else if (result.sent) {
          console.info(
            `[Email Notification] Sent for ${newBooking.bookingCode} via ${result.provider} to ${result.recipient}`
          );
        }
      })
      .catch((err) => {
        console.error(`[Email Notification] Failed for ${newBooking.bookingCode}:`, err);
      });

    res.status(201).json({ booking: newBooking });
  });

  // Admin-only: update booking status
  app.patch('/api/bookings/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = (req.body || {}) as { status?: AppointmentBooking['status'] };

    if (!status || !['confirmada', 'solicitada', 'cancelada'].includes(status)) {
      res.status(400).json({ error: 'Estado de cita no válido.' });
      return;
    }

    const existingIndex = bookingsStore.findIndex((b) => b.id === id);
    if (existingIndex === -1) {
      res.status(404).json({ error: 'Cita no encontrada.' });
      return;
    }

    const existingBooking = bookingsStore[existingIndex];
    const updated: AppointmentBooking = {
      ...existingBooking,
      status,
    };

    bookingsStore = [
      ...bookingsStore.slice(0, existingIndex),
      updated,
      ...bookingsStore.slice(existingIndex + 1),
    ];
    saveBookings(bookingsStore);

    callbacks.onAvailabilityChanged?.();
    callbacks.onBookingUpdated?.(updated);

    if (
      existingBooking.status !== 'cancelada' &&
      status === 'cancelada' &&
      updated.instructorId !== 'inst-cualquiera'
    ) {
      void broadcastPushNotification({
        topic: 'disponibilidad',
        title: '¡Cupo disponible en pista!',
        body: `Se liberó el horario ${updated.timeSlot} (${updated.formattedDate}) con ${updated.instructorName}.`,
        url: '/#agendar-cita',
        tag: `slot-free-${updated.id}`,
      }).catch((err) => {
        console.error('[Web Push] Error notifying freed slot:', err);
      });
    }

    res.json({ booking: updated });
  });

  // Admin-only: delete booking
  app.delete('/api/bookings/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const exists = bookingsStore.some((b) => b.id === id);
    if (!exists) {
      res.status(404).json({ error: 'Cita no encontrada.' });
      return;
    }

    bookingsStore = bookingsStore.filter((b) => b.id !== id);
    saveBookings(bookingsStore);

    callbacks.onAvailabilityChanged?.();
    callbacks.onBookingDeleted?.(id);
    res.json({ ok: true, id });
  });

  return app;
}
