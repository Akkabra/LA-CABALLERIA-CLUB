import 'dotenv/config';
import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import type { AppointmentBooking, BlogPost, OccupiedSlot } from './src/types';
import {
  createApiApp,
  getBookingsSnapshot,
  getOccupiedSlots,
  isRequestAdmin,
} from './server/createApp';
import { getAllBlogPosts, getPublishedBlogPosts } from './server/blogService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

type AdminWsMessage =
  | { type: 'bookings:init'; bookings: AppointmentBooking[] }
  | { type: 'booking:created'; booking: AppointmentBooking }
  | { type: 'booking:updated'; booking: AppointmentBooking }
  | { type: 'booking:deleted'; id: string }
  | { type: 'blog:init'; posts: BlogPost[] }
  | { type: 'blog:updated'; posts: BlogPost[] };

type PublicWsMessage =
  | { type: 'availability:init'; occupiedSlots: OccupiedSlot[] }
  | { type: 'availability:updated'; occupiedSlots: OccupiedSlot[] }
  | { type: 'blog:init'; posts: BlogPost[] }
  | { type: 'blog:updated'; posts: BlogPost[] };

async function startServer() {
  let wssRef: WebSocketServer | null = null;
  const wsAdminFlags = new WeakMap<WebSocket, boolean>();

  const broadcastPublicAvailability = () => {
    if (!wssRef) return;
    const msg: PublicWsMessage = {
      type: 'availability:updated',
      occupiedSlots: getOccupiedSlots(),
    };
    const serialized = JSON.stringify(msg);
    wssRef.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    });
  };

  const broadcastToAdmins = (payload: AdminWsMessage) => {
    if (!wssRef) return;
    const serialized = JSON.stringify(payload);
    wssRef.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && wsAdminFlags.get(client) === true) {
        client.send(serialized);
      }
    });
  };

  const broadcastBlogUpdates = () => {
    if (!wssRef) return;
    const adminPayload = JSON.stringify({
      type: 'blog:updated',
      posts: getAllBlogPosts(),
    } satisfies AdminWsMessage);
    const publicPayload = JSON.stringify({
      type: 'blog:updated',
      posts: getPublishedBlogPosts(),
    } satisfies PublicWsMessage);

    wssRef.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(wsAdminFlags.get(client) === true ? adminPayload : publicPayload);
      }
    });
  };

  const app = createApiApp({
    onAvailabilityChanged: broadcastPublicAvailability,
    onBookingCreated: (booking) => broadcastToAdmins({ type: 'booking:created', booking }),
    onBookingUpdated: (booking) => broadcastToAdmins({ type: 'booking:updated', booking }),
    onBookingDeleted: (id) => broadcastToAdmins({ type: 'booking:deleted', id }),
    onBlogUpdated: broadcastBlogUpdates,
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws/bookings' });
  wssRef = wss;

  wss.on('connection', (ws, req) => {
    const isAdmin = isRequestAdmin(req);
    wsAdminFlags.set(ws, isAdmin);

    const availabilityInit: PublicWsMessage = {
      type: 'availability:init',
      occupiedSlots: getOccupiedSlots(),
    };
    ws.send(JSON.stringify(availabilityInit));

    ws.send(
      JSON.stringify({
        type: 'blog:init',
        posts: isAdmin ? getAllBlogPosts() : getPublishedBlogPosts(),
      })
    );

    if (isAdmin) {
      const adminInit: AdminWsMessage = {
        type: 'bookings:init',
        bookings: getBookingsSnapshot(),
      };
      ws.send(JSON.stringify(adminInit));
    }

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on('close', () => {
      clearInterval(pingInterval);
    });
  });

  const isProd = process.env.NODE_ENV === 'production';

  // Ensure /sw.js is always served with correct headers in both dev and prod
  app.get('/sw.js', (_req, res) => {
    const prodSwPath = path.join(__dirname, 'dist', 'sw.js');
    const publicSwPath = path.join(__dirname, 'public', 'sw.js');
    const targetPath = isProd && fs.existsSync(prodSwPath) ? prodSwPath : publicSwPath;
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(targetPath);
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`La Caballería server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
