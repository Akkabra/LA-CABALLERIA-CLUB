import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleAuthProvider,
  ADMIN_BOOTSTRAP_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { DEFAULT_BLOG_SEED_POSTS } from '../data/blogSeed';
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

interface StoredPushDoc {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  topics: Array<'disponibilidad' | 'eventos' | 'recordatorios'>;
}

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val.trim()) {
    return val;
  }
  if (
    typeof val === 'object' &&
    val !== null &&
    'toDate' in val &&
    typeof (val as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function buildSlotId(date: string, timeSlot: string, instructorId: string): string {
  if (!instructorId || instructorId === 'inst-cualquiera') return '';
  const safeDate = date.trim().slice(0, 10).replace(/[^a-zA-Z0-9_-]/g, '-');
  const safeTime = timeSlot.trim().slice(0, 5).replace(/[^a-zA-Z0-9_-]/g, '-');
  const safeInstructor = instructorId.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
  return `${safeDate}__${safeTime}__${safeInstructor}`.slice(0, 100);
}

function slugify(input: string): string {
  const clean = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
  return clean.length >= 3 ? clean : `articulo-${Date.now()}`;
}

async function checkUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL) return true;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export function useRealtimeBookings() {
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [bookings, setBookings] = useState<AppointmentBooking[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(DEFAULT_BLOG_SEED_POSTS);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [pushStats, setPushStats] = useState<PushStats>({
    totalSubscribers: 0,
    disponibilidadCount: 0,
    eventosCount: 0,
    recordatoriosCount: 0,
  });

  const pushDocsRef = useRef<StoredPushDoc[]>([]);
  const bookingsRef = useRef<AppointmentBooking[]>([]);
  const hasSeededBlogRef = useRef(false);

  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  // 1. Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdminAuthenticated(false);
        setAdminEmail(null);
        setBookings([]);
        setPushStats({
          totalSubscribers: 0,
          disponibilidadCount: 0,
          eventosCount: 0,
          recordatoriosCount: 0,
        });
        pushDocsRef.current = [];
        setIsCheckingAuth(false);
        return;
      }

      const isAdmin = await checkUserIsAdmin(user);
      setIsAdminAuthenticated(isAdmin);
      setAdminEmail(isAdmin ? user.email || ADMIN_BOOTSTRAP_EMAIL : null);
      if (!isAdmin) {
        setBookings([]);
        pushDocsRef.current = [];
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Public real-time listener: anonymized occupiedSlots
  useEffect(() => {
    const slotsCol = collection(db, 'occupiedSlots');
    const unsubscribe = onSnapshot(
      slotsCol,
      (snapshot) => {
        const next: OccupiedSlot[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            date: String(data.date || ''),
            timeSlot: String(data.timeSlot || ''),
            instructorId: String(data.instructorId || ''),
          };
        });
        setOccupiedSlots(next);
        setIsConnected(true);
      },
      (error) => {
        setIsConnected(false);
        handleFirestoreError(error, OperationType.LIST, 'occupiedSlots');
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Real-time Blog Posts listener (Admin sees all + auto-seeds empty DB; Public sees published only)
  useEffect(() => {
    if (isCheckingAuth) return;

    setIsLoadingBlog(true);
    const blogRef = isAdminAuthenticated
      ? collection(db, 'blogPosts')
      : query(collection(db, 'blogPosts'), where('published', '==', true));

    const unsubscribe = onSnapshot(
      blogRef,
      async (snapshot) => {
        // Auto-seed default blog articles once on first admin login if collection is empty
        if (isAdminAuthenticated && snapshot.empty && !hasSeededBlogRef.current) {
          hasSeededBlogRef.current = true;
          try {
            const batch = writeBatch(db);
            for (const post of DEFAULT_BLOG_SEED_POSTS) {
              batch.set(doc(db, 'blogPosts', post.id), {
                title: post.title.slice(0, 160),
                slug: slugify(post.slug),
                category: post.category,
                excerpt: post.excerpt.slice(0, 400),
                content: post.content.slice(0, 15000),
                authorName: post.authorName.slice(0, 100),
                coverImageUrl: post.coverImageUrl.slice(0, 500),
                readTime: post.readTime.slice(0, 30),
                published: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            await batch.commit();
          } catch (seedErr) {
            console.error('Error seeding initial blog posts:', seedErr);
          }
          return;
        }

        if (snapshot.empty && !isAdminAuthenticated) {
          // Graceful fallback before the club administrator initializes/edits blog posts
          setBlogPosts(DEFAULT_BLOG_SEED_POSTS);
          setIsLoadingBlog(false);
          return;
        }

        const mapped: BlogPost[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              title: String(data.title || ''),
              slug: String(data.slug || d.id),
              category: (data.category as BlogCategory) || 'noticias-club',
              excerpt: String(data.excerpt || ''),
              content: String(data.content || ''),
              authorName: String(data.authorName || 'Equipo La Caballería'),
              coverImageUrl: String(data.coverImageUrl || ''),
              readTime: String(data.readTime || '4 min'),
              published: Boolean(data.published),
              createdAt: toIsoString(data.createdAt),
              updatedAt: toIsoString(data.updatedAt),
            };
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setBlogPosts(mapped);
        setIsLoadingBlog(false);
      },
      (error) => {
        setIsLoadingBlog(false);
        handleFirestoreError(error, OperationType.LIST, 'blogPosts');
      }
    );

    return () => unsubscribe();
  }, [isCheckingAuth, isAdminAuthenticated]);

  // 4. Admin-only real-time listener: full bookings + pushSubscriptions stats
  useEffect(() => {
    if (!isAdminAuthenticated) {
      setBookings([]);
      setIsLoadingBookings(false);
      return;
    }

    setIsLoadingBookings(true);
    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const list: AppointmentBooking[] = snapshot.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              bookingCode: String(data.bookingCode || ''),
              classTypeId: String(data.classTypeId || ''),
              classTypeName: String(data.classTypeName || ''),
              instructorId: String(data.instructorId || ''),
              instructorName: String(data.instructorName || ''),
              date: String(data.date || ''),
              formattedDate: String(data.formattedDate || ''),
              timeSlot: String(data.timeSlot || ''),
              slotId: String(data.slotId || ''),
              studentName: String(data.studentName || ''),
              studentAge: String(data.studentAge || ''),
              guardianName: String(data.guardianName || ''),
              phone: String(data.phone || ''),
              email: String(data.email || ''),
              experienceLevel:
                (data.experienceLevel as AppointmentBooking['experienceLevel']) ||
                'Sin experiencia (Primera vez)',
              notes: String(data.notes || ''),
              createdAt: toIsoString(data.createdAt),
              status: (data.status as AppointmentBooking['status']) || 'confirmada',
            };
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setBookings(list);
        setIsLoadingBookings(false);
      },
      (error) => {
        setIsLoadingBookings(false);
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    );

    const unsubPush = onSnapshot(
      collection(db, 'pushSubscriptions'),
      (snapshot) => {
        const parsed: StoredPushDoc[] = snapshot.docs.map((d) => {
          const data = d.data();
          const topics = Array.isArray(data.topics)
            ? (data.topics as Array<'disponibilidad' | 'eventos' | 'recordatorios'>)
            : [];
          return {
            endpoint: String(data.endpoint || ''),
            keys: {
              p256dh: String(data.p256dh || ''),
              auth: String(data.auth || ''),
            },
            topics,
          };
        });
        pushDocsRef.current = parsed;
        setPushStats({
          totalSubscribers: parsed.length,
          disponibilidadCount: parsed.filter((s) => s.topics.includes('disponibilidad')).length,
          eventosCount: parsed.filter((s) => s.topics.includes('eventos')).length,
          recordatoriosCount: parsed.filter((s) => s.topics.includes('recordatorios')).length,
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'pushSubscriptions');
      }
    );

    return () => {
      unsubBookings();
      unsubPush();
    };
  }, [isAdminAuthenticated]);

  const fetchPushStats = useCallback(async (): Promise<void> => {
    if (!isAdminAuthenticated) return;
    try {
      const snap = await getDocs(collection(db, 'pushSubscriptions'));
      const parsed: StoredPushDoc[] = snap.docs.map((d) => {
        const data = d.data();
        const topics = Array.isArray(data.topics)
          ? (data.topics as Array<'disponibilidad' | 'eventos' | 'recordatorios'>)
          : [];
        return {
          endpoint: String(data.endpoint || ''),
          keys: {
            p256dh: String(data.p256dh || ''),
            auth: String(data.auth || ''),
          },
          topics,
        };
      });
      pushDocsRef.current = parsed;
      setPushStats({
        totalSubscribers: parsed.length,
        disponibilidadCount: parsed.filter((s) => s.topics.includes('disponibilidad')).length,
        eventosCount: parsed.filter((s) => s.topics.includes('eventos')).length,
        recordatoriosCount: parsed.filter((s) => s.topics.includes('recordatorios')).length,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'pushSubscriptions');
    }
  }, [isAdminAuthenticated]);

  const loginAdmin = useCallback(async (): Promise<void> => {
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const isAdmin = await checkUserIsAdmin(cred.user);
      if (!isAdmin) {
        const attemptedEmail = cred.user.email || 'esta cuenta';
        await signOut(auth);
        throw new Error(
          `La cuenta ${attemptedEmail} no está autorizada como administrador del club. Inicia sesión con ${ADMIN_BOOTSTRAP_EMAIL}.`
        );
      }
      setIsAdminAuthenticated(true);
      setAdminEmail(cred.user.email || ADMIN_BOOTSTRAP_EMAIL);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      if (code === 'auth/unauthorized-domain') {
        throw new Error(
          `El dominio "${window.location.hostname}" aún no está autorizado en Firebase Auth. Agrégalo en Firebase Console → Authentication → Settings → Authorized domains.`
        );
      }
      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Se cerró la ventana de inicio de sesión antes de completar el acceso.');
      }
      if (code === 'auth/popup-blocked') {
        throw new Error(
          'El navegador bloqueó la ventana emergente de Google. Permite pop-ups para iniciar sesión.'
        );
      }
      throw err instanceof Error ? err : new Error('No se pudo iniciar sesión con Google.');
    }
  }, []);

  const logoutAdmin = useCallback(async (): Promise<void> => {
    await signOut(auth);
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    setBookings([]);
    pushDocsRef.current = [];
  }, []);

  const createBooking = useCallback(
    async (payload: CreateBookingPayload): Promise<AppointmentBooking> => {
      const studentName = payload.studentName.trim().slice(0, 120);
      const studentAge = payload.studentAge.trim().slice(0, 30);
      const phone = payload.phone.trim().slice(0, 40);
      const email = payload.email.trim().slice(0, 160);

      if (
        !payload.classTypeId ||
        !payload.instructorId ||
        !payload.date ||
        !payload.timeSlot ||
        studentName.length < 2 ||
        studentAge.length < 1 ||
        phone.length < 5 ||
        email.length < 5
      ) {
        throw new Error('Por favor completa todos los campos obligatorios correctamente.');
      }

      const normalizedDate = payload.date.trim().slice(0, 10);
      const normalizedTimeSlot = payload.timeSlot.trim().slice(0, 5);
      const normalizedInstructorId = payload.instructorId.trim().slice(0, 60);

      const bookingId = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const bookingCode = `LC-${Math.floor(100000 + Math.random() * 900000)}`;
      const slotId = buildSlotId(normalizedDate, normalizedTimeSlot, normalizedInstructorId);
      const status: AppointmentBooking['status'] =
        normalizedInstructorId === 'inst-cualquiera' ? 'solicitada' : 'confirmada';

      if (slotId) {
        try {
          const existingSlot = await getDoc(doc(db, 'occupiedSlots', slotId));
          if (existingSlot.exists()) {
            throw new Error(
              'Este horario acaba de ser reservado con el profesor seleccionado. Por favor elige otro horario o profesor.'
            );
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('acaba de ser reservado')) {
            throw err;
          }
          handleFirestoreError(err, OperationType.GET, `occupiedSlots/${slotId}`);
        }
      }

      const guardianRaw = payload.guardianName?.trim() || 'No aplica (Adulto)';
      const notesRaw = payload.notes?.trim() || 'Sin observaciones previas';

      const firestoreBookingDoc = {
        bookingCode,
        classTypeId: payload.classTypeId.trim().slice(0, 60),
        classTypeName: payload.classTypeName.trim().slice(0, 120),
        instructorId: normalizedInstructorId,
        instructorName: payload.instructorName.trim().slice(0, 120),
        date: normalizedDate,
        formattedDate: payload.formattedDate.trim().slice(0, 80),
        timeSlot: normalizedTimeSlot,
        slotId,
        studentName,
        studentAge,
        guardianName: (guardianRaw.length >= 2 ? guardianRaw : 'No aplica').slice(0, 120),
        phone,
        email,
        experienceLevel: payload.experienceLevel || 'Sin experiencia (Primera vez)',
        notes: notesRaw.slice(0, 600),
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      batch.set(doc(db, 'bookings', bookingId), firestoreBookingDoc);
      if (slotId) {
        batch.set(doc(db, 'occupiedSlots', slotId), {
          bookingId,
          date: normalizedDate,
          timeSlot: normalizedTimeSlot,
          instructorId: normalizedInstructorId,
          createdAt: serverTimestamp(),
        });
      }

      try {
        await batch.commit();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (slotId && msg.toLowerCase().includes('permission')) {
          const checkSlot = await getDoc(doc(db, 'occupiedSlots', slotId)).catch(() => null);
          if (checkSlot?.exists()) {
            throw new Error(
              'Este horario acaba de ser reservado con el profesor seleccionado. Por favor elige otro horario o profesor.'
            );
          }
        }
        handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingId}`);
      }

      const created: AppointmentBooking = {
        id: bookingId,
        bookingCode,
        classTypeId: firestoreBookingDoc.classTypeId,
        classTypeName: firestoreBookingDoc.classTypeName,
        instructorId: firestoreBookingDoc.instructorId,
        instructorName: firestoreBookingDoc.instructorName,
        date: firestoreBookingDoc.date,
        formattedDate: firestoreBookingDoc.formattedDate,
        timeSlot: firestoreBookingDoc.timeSlot,
        slotId,
        studentName: firestoreBookingDoc.studentName,
        studentAge: firestoreBookingDoc.studentAge,
        guardianName: firestoreBookingDoc.guardianName,
        phone: firestoreBookingDoc.phone,
        email: firestoreBookingDoc.email,
        experienceLevel: firestoreBookingDoc.experienceLevel,
        notes: firestoreBookingDoc.notes,
        createdAt: new Date().toISOString(),
        status,
      };

      // Trigger async admin email notification if configured on server
      void fetch('/api/bookings/notify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      }).catch(() => {});

      return created;
    },
    []
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: AppointmentBooking['status']): Promise<AppointmentBooking> => {
      const existing = bookingsRef.current.find((b) => b.id === id);
      const slotId =
        existing?.slotId ||
        (existing
          ? buildSlotId(existing.date, existing.timeSlot, existing.instructorId)
          : '');

      const batch = writeBatch(db);
      batch.update(doc(db, 'bookings', id), {
        status,
        updatedAt: serverTimestamp(),
      });

      if (slotId) {
        if (status === 'cancelada') {
          batch.delete(doc(db, 'occupiedSlots', slotId));
        } else if (existing && existing.status === 'cancelada') {
          const existingLock = await getDoc(doc(db, 'occupiedSlots', slotId)).catch(() => null);
          if (existingLock && !existingLock.exists()) {
            batch.set(doc(db, 'occupiedSlots', slotId), {
              bookingId: id,
              date: existing.date.slice(0, 10),
              timeSlot: existing.timeSlot.slice(0, 5),
              instructorId: existing.instructorId,
              createdAt: serverTimestamp(),
            });
          }
        }
      }

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
      }

      const updated: AppointmentBooking = existing
        ? { ...existing, status }
        : ({ id, status } as AppointmentBooking);
      return updated;
    },
    []
  );

  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    const existing = bookingsRef.current.find((b) => b.id === id);
    const slotId =
      existing?.slotId ||
      (existing ? buildSlotId(existing.date, existing.timeSlot, existing.instructorId) : '');

    const batch = writeBatch(db);
    batch.delete(doc(db, 'bookings', id));
    if (slotId) {
      batch.delete(doc(db, 'occupiedSlots', slotId));
    }

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
    }
  }, []);

  const getFirebaseBearerHeader = useCallback(async (): Promise<Record<string, string>> => {
    const token = await auth.currentUser?.getIdToken().catch(() => null);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const sendTestEmail = useCallback(async (): Promise<{ provider?: string; recipient?: string }> => {
    const authHeaders = await getFirebaseBearerHeader();
    const res = await fetch('/api/admin/test-email', {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'No se pudo enviar el correo de prueba.');
    }

    return { provider: data?.provider, recipient: data?.recipient };
  }, [getFirebaseBearerHeader]);

  const broadcastPush = useCallback(
    async (payload: PushBroadcastPayload): Promise<PushBroadcastResult> => {
      const authHeaders = await getFirebaseBearerHeader();
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...payload,
          subscriptions: pushDocsRef.current,
        }),
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
    [fetchPushStats, getFirebaseBearerHeader]
  );

  const createBlogPost = useCallback(async (payload: BlogPostPayload): Promise<BlogPost> => {
    const title = payload.title.trim().slice(0, 160);
    const excerpt = payload.excerpt.trim().slice(0, 400);
    const content = payload.content.trim().slice(0, 15000);

    if (title.length < 3 || excerpt.length < 10 || content.length < 20) {
      throw new Error(
        'Verifica la extensión mínima: título (3+), resumen (10+) y contenido (20+ caracteres).'
      );
    }

    const postId = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const slug = slugify(title);
    const authorName = (payload.authorName?.trim() || 'Equipo Formativo La Caballería').slice(
      0,
      100
    );
    const coverImageUrl = (
      payload.coverImageUrl?.trim() ||
      'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=1200&q=80'
    ).slice(0, 500);
    const readTime = (payload.readTime?.trim() || '4 min').slice(0, 30);
    const published = payload.published !== undefined ? Boolean(payload.published) : true;

    try {
      await setDoc(doc(db, 'blogPosts', postId), {
        title,
        slug,
        category: payload.category || 'noticias-club',
        excerpt,
        content,
        authorName,
        coverImageUrl,
        readTime,
        published,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `blogPosts/${postId}`);
    }

    const now = new Date().toISOString();
    return {
      id: postId,
      title,
      slug,
      category: payload.category || 'noticias-club',
      excerpt,
      content,
      authorName,
      coverImageUrl,
      readTime,
      published,
      createdAt: now,
      updatedAt: now,
    };
  }, []);

  const updateBlogPost = useCallback(
    async (id: string, payload: Partial<BlogPostPayload>): Promise<BlogPost> => {
      const updatePatch: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (typeof payload.title === 'string' && payload.title.trim().length >= 3) {
        updatePatch.title = payload.title.trim().slice(0, 160);
        updatePatch.slug = slugify(payload.title);
      }
      if (payload.category) {
        updatePatch.category = payload.category;
      }
      if (typeof payload.excerpt === 'string' && payload.excerpt.trim().length >= 10) {
        updatePatch.excerpt = payload.excerpt.trim().slice(0, 400);
      }
      if (typeof payload.content === 'string' && payload.content.trim().length >= 20) {
        updatePatch.content = payload.content.trim().slice(0, 15000);
      }
      if (typeof payload.authorName === 'string' && payload.authorName.trim().length >= 2) {
        updatePatch.authorName = payload.authorName.trim().slice(0, 100);
      }
      if (typeof payload.coverImageUrl === 'string' && payload.coverImageUrl.trim().length >= 8) {
        updatePatch.coverImageUrl = payload.coverImageUrl.trim().slice(0, 500);
      }
      if (typeof payload.readTime === 'string' && payload.readTime.trim().length >= 2) {
        updatePatch.readTime = payload.readTime.trim().slice(0, 30);
      }
      if (typeof payload.published === 'boolean') {
        updatePatch.published = payload.published;
      }

      try {
        await updateDoc(doc(db, 'blogPosts', id), updatePatch);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `blogPosts/${id}`);
      }

      const existing = blogPosts.find((p) => p.id === id);
      return {
        ...(existing || {
          id,
          title: '',
          slug: id,
          category: 'noticias-club',
          excerpt: '',
          content: '',
          authorName: '',
          coverImageUrl: '',
          readTime: '4 min',
          published: true,
          createdAt: new Date().toISOString(),
        }),
        ...payload,
        updatedAt: new Date().toISOString(),
      } as BlogPost;
    },
    [blogPosts]
  );

  const deleteBlogPost = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'blogPosts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blogPosts/${id}`);
    }
  }, []);

  return {
    occupiedSlots,
    bookings,
    blogPosts,
    isLoadingBookings,
    isLoadingBlog,
    isAdminAuthenticated,
    adminEmail,
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
