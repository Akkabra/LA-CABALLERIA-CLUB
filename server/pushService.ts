import fs from 'fs';
import path from 'path';
import * as webpush from 'web-push';
import { getWritableDataDir } from './storageDir';

const DATA_DIR = getWritableDataDir();
const VAPID_FILE = path.join(DATA_DIR, 'vapid.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push-subscriptions.json');

export type PushTopic = 'disponibilidad' | 'eventos' | 'recordatorios';

export interface StoredPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  topics: PushTopic[];
  createdAt: string;
  updatedAt: string;
}

interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Fallback gracefully in read-only filesystems
  }
}

function getOrCreateVapidConfig(): VapidConfig {
  const envPublic = process.env.VAPID_PUBLIC_KEY?.trim();
  const envPrivate = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:contacto@caballeriaclub.com';

  if (envPublic && envPrivate) {
    return { publicKey: envPublic, privateKey: envPrivate, subject };
  }

  ensureDataDir();
  try {
    if (fs.existsSync(VAPID_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8')) as Partial<VapidConfig>;
      if (parsed.publicKey && parsed.privateKey) {
        return {
          publicKey: parsed.publicKey,
          privateKey: parsed.privateKey,
          subject: parsed.subject || subject,
        };
      }
    }
  } catch {
    // Regenerate below if unavailable or corrupted
  }

  const generated = webpush.generateVAPIDKeys();
  const config: VapidConfig = {
    publicKey: generated.publicKey,
    privateKey: generated.privateKey,
    subject,
  };
  try {
    fs.writeFileSync(VAPID_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch {
    // Ignore disk write failure on serverless/read-only environments
  }
  return config;
}

const vapidConfig = getOrCreateVapidConfig();
try {
  webpush.setVapidDetails(vapidConfig.subject, vapidConfig.publicKey, vapidConfig.privateKey);
} catch (err) {
  console.error('Error initializing VAPID details:', err);
}

function loadSubscriptions(): StoredPushSubscription[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
      try {
        fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      } catch {
        // Ignore write failures
      }
      return [];
    }
    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredPushSubscription[]) : [];
  } catch {
    return [];
  }
}

function saveSubscriptions(subs: StoredPushSubscription[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing push subscriptions:', err);
  }
}

let subscriptionsStore: StoredPushSubscription[] = loadSubscriptions();

export function getVapidPublicKey(): string {
  return vapidConfig.publicKey;
}

export function upsertPushSubscription(input: {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
  topics?: PushTopic[];
}): StoredPushSubscription {
  const normalizedTopics: PushTopic[] = Array.isArray(input.topics)
    ? input.topics.filter(
        (t): t is PushTopic =>
          t === 'disponibilidad' || t === 'eventos' || t === 'recordatorios'
      )
    : ['disponibilidad', 'eventos', 'recordatorios'];

  const topics: PushTopic[] =
    normalizedTopics.length > 0
      ? normalizedTopics
      : ['disponibilidad', 'eventos', 'recordatorios'];

  const now = new Date().toISOString();
  const existingIdx = subscriptionsStore.findIndex((s) => s.endpoint === input.endpoint);

  if (existingIdx !== -1) {
    const updated: StoredPushSubscription = {
      ...subscriptionsStore[existingIdx],
      expirationTime: input.expirationTime ?? null,
      keys: { p256dh: input.keys.p256dh, auth: input.keys.auth },
      topics,
      updatedAt: now,
    };
    subscriptionsStore = [
      ...subscriptionsStore.slice(0, existingIdx),
      updated,
      ...subscriptionsStore.slice(existingIdx + 1),
    ];
    saveSubscriptions(subscriptionsStore);
    return updated;
  }

  const created: StoredPushSubscription = {
    endpoint: input.endpoint,
    expirationTime: input.expirationTime ?? null,
    keys: { p256dh: input.keys.p256dh, auth: input.keys.auth },
    topics,
    createdAt: now,
    updatedAt: now,
  };
  subscriptionsStore = [created, ...subscriptionsStore];
  saveSubscriptions(subscriptionsStore);
  return created;
}

export function removePushSubscription(endpoint: string): boolean {
  const before = subscriptionsStore.length;
  subscriptionsStore = subscriptionsStore.filter((s) => s.endpoint !== endpoint);
  if (subscriptionsStore.length !== before) {
    saveSubscriptions(subscriptionsStore);
    return true;
  }
  return false;
}

export function getPushStats(): {
  totalSubscribers: number;
  disponibilidadCount: number;
  eventosCount: number;
  recordatoriosCount: number;
} {
  return {
    totalSubscribers: subscriptionsStore.length,
    disponibilidadCount: subscriptionsStore.filter((s) => s.topics.includes('disponibilidad')).length,
    eventosCount: subscriptionsStore.filter((s) => s.topics.includes('eventos')).length,
    recordatoriosCount: subscriptionsStore.filter((s) => s.topics.includes('recordatorios')).length,
  };
}

export async function broadcastPushNotification(params: {
  title: string;
  body: string;
  topic: PushTopic | 'todos';
  url?: string;
  tag?: string;
  extraSubscriptions?: Array<{
    endpoint: string;
    keys: { p256dh: string; auth: string };
    topics: PushTopic[];
  }>;
}): Promise<{ sent: number; failed: number; removed: number }> {
  const byEndpoint = new Map<
    string,
    { endpoint: string; keys: { p256dh: string; auth: string }; topics: PushTopic[] }
  >();

  for (const sub of subscriptionsStore) {
    byEndpoint.set(sub.endpoint, sub);
  }
  if (Array.isArray(params.extraSubscriptions)) {
    for (const sub of params.extraSubscriptions) {
      if (sub?.endpoint && sub?.keys?.p256dh && sub?.keys?.auth) {
        byEndpoint.set(sub.endpoint, sub);
      }
    }
  }

  const combined = Array.from(byEndpoint.values());
  const targets =
    params.topic === 'todos'
      ? combined
      : combined.filter((s) => s.topics.includes(params.topic as PushTopic));

  if (targets.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  const payload = JSON.stringify({
    title: params.title,
    body: params.body,
    url: params.url || '/#agendar-cita',
    tag: params.tag || `la-caballeria-${params.topic}`,
  });

  let sent = 0;
  let failed = 0;
  const expiredEndpoints = new Set<string>();

  await Promise.all(
    targets.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode =
          typeof err === 'object' && err !== null && 'statusCode' in err
            ? Number((err as { statusCode?: number }).statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.add(sub.endpoint);
        } else {
          failed += 1;
        }
      }
    })
  );

  if (expiredEndpoints.size > 0) {
    subscriptionsStore = subscriptionsStore.filter((s) => !expiredEndpoints.has(s.endpoint));
    saveSubscriptions(subscriptionsStore);
  }

  return {
    sent,
    failed,
    removed: expiredEndpoints.size,
  };
}
