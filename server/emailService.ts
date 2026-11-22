import nodemailer from 'nodemailer';
import type { AppointmentBooking } from '../src/types';

export interface EmailSendResult {
  sent: boolean;
  provider?: 'smtp' | 'resend';
  recipient?: string;
  reason?: string;
}

function escapeHtml(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DEFAULT_ADMIN_RECIPIENT = 'bryanalvarez119@gmail.com';

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  return !trimmed || trimmed.startsWith('MY_');
}

function getRecipientEmail(): string {
  const explicit = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (explicit && !isPlaceholder(explicit)) return explicit;

  const smtpUser = process.env.SMTP_USER?.trim();
  if (smtpUser && !isPlaceholder(smtpUser)) return smtpUser;

  return DEFAULT_ADMIN_RECIPIENT;
}

function hasSmtpConfig(): boolean {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const host = process.env.SMTP_HOST?.trim();
  if (isPlaceholder(user) || isPlaceholder(pass)) return false;
  return Boolean(host || user!.toLowerCase().endsWith('@gmail.com'));
}

function hasResendConfig(): boolean {
  return !isPlaceholder(process.env.RESEND_API_KEY);
}

export function isEmailNotificationConfigured(): boolean {
  return Boolean(getRecipientEmail() && (hasSmtpConfig() || hasResendConfig()));
}

async function deliverEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<EmailSendResult> {
  if (hasSmtpConfig()) {
    const user = process.env.SMTP_USER!.trim();
    const rawPass = process.env.SMTP_PASS!.trim();
    const host =
      process.env.SMTP_HOST?.trim() ||
      (user.toLowerCase().endsWith('@gmail.com') ? 'smtp.gmail.com' : '');
    const pass =
      host === 'smtp.gmail.com' ? rawPass.replace(/\s+/g, '') : rawPass;
    const port = Number(process.env.SMTP_PORT || '587');
    const secure =
      process.env.SMTP_SECURE === 'true' ||
      (process.env.SMTP_SECURE !== 'false' && port === 465);
    const from = process.env.SMTP_FROM?.trim() || `La Caballería Club <${user}>`;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: params.to,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    return { sent: true, provider: 'smtp', recipient: params.to };
  }

  if (hasResendConfig()) {
    const apiKey = process.env.RESEND_API_KEY!.trim();
    const from =
      process.env.RESEND_FROM?.trim() ||
      process.env.SMTP_FROM?.trim() ||
      'La Caballería Club <onboarding@resend.dev>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Resend API error (${res.status}): ${errorText}`);
    }

    return { sent: true, provider: 'resend', recipient: params.to };
  }

  return {
    sent: false,
    reason:
      'Falta configurar el envío de correo en las variables de entorno del servidor (Secrets en AI Studio o Environment Variables en Vercel): define SMTP_USER + SMTP_PASS (Gmail App Password) o RESEND_API_KEY.',
  };
}

function buildBookingEmailHtml(booking: AppointmentBooking, isTest = false): string {
  const statusLabel = booking.status === 'confirmada' ? 'CONFIRMADA' : 'SOLICITADA';
  const bannerLabel = isTest ? 'PRUEBA DE NOTIFICACIÓN' : 'NUEVA RESERVA EN PISTA';

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(bannerLabel)} - ${escapeHtml(booking.bookingCode)}</title>
    </head>
    <body style="margin:0;padding:24px;background-color:#0e0e10;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background-color:#141416;border:1px solid #2a2a2f;">
        <tr>
          <td style="padding:24px 28px;border-bottom:2px solid #D21923;background-color:#141416;">
            <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D21923;font-weight:bold;">
              ${escapeHtml(bannerLabel)}
            </p>
            <h1 style="margin:0;font-size:22px;color:#ffffff;font-family:Georgia,serif;">
              LA CABALLERÍA · Club de Equitación
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;background-color:#1a1a1d;border:1px solid #2a2a2f;">
              <tr>
                <td style="padding:14px 18px;">
                  <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#a1a1aa;">Código de Reserva</span>
                  <strong style="font-size:18px;color:#D21923;font-family:monospace;">${escapeHtml(booking.bookingCode)}</strong>
                </td>
                <td align="right" style="padding:14px 18px;">
                  <span style="display:inline-block;padding:4px 10px;border:1px solid #D21923;color:#ffffff;font-size:11px;font-weight:bold;letter-spacing:1px;">
                    ${escapeHtml(statusLabel)}
                  </span>
                </td>
              </tr>
            </table>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;line-height:1.6;color:#e4e4e7;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;width:40%;">Tipo de clase</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;font-weight:bold;">${escapeHtml(booking.classTypeName)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Profesor asignado</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#D21923;font-weight:bold;">${escapeHtml(booking.instructorName)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Fecha</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;">${escapeHtml(booking.formattedDate)} (${escapeHtml(booking.date)})</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Horario en pista</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;font-family:monospace;font-weight:bold;">${escapeHtml(booking.timeSlot)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Alumno</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;">${escapeHtml(booking.studentName)} (${escapeHtml(booking.studentAge)})</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Acudiente</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;">${escapeHtml(booking.guardianName)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Teléfono / WhatsApp</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;">${escapeHtml(booking.phone)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Correo electrónico</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;">${escapeHtml(booking.email)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#a1a1aa;">Nivel previo</td>
                <td style="padding:8px 0;border-bottom:1px solid #27272a;color:#ffffff;">${escapeHtml(booking.experienceLevel)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#a1a1aa;vertical-align:top;">Observaciones</td>
                <td style="padding:8px 0;color:#d4d4d8;">${escapeHtml(booking.notes)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;background-color:#0e0e10;border-top:1px solid #27272a;font-size:11px;color:#71717a;">
            Aviso automático generado por el sistema de agendamiento de La Caballería Club de Equitación.
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

function buildBookingEmailText(booking: AppointmentBooking, isTest = false): string {
  return [
    isTest ? 'PRUEBA DE NOTIFICACIÓN - LA CABALLERÍA' : 'NUEVA RESERVA REGISTRADA - LA CABALLERÍA',
    `Código: ${booking.bookingCode}`,
    `Estado: ${booking.status.toUpperCase()}`,
    `Tipo de clase: ${booking.classTypeName}`,
    `Profesor: ${booking.instructorName}`,
    `Fecha: ${booking.formattedDate} (${booking.date})`,
    `Horario: ${booking.timeSlot}`,
    `Alumno: ${booking.studentName} (${booking.studentAge})`,
    `Acudiente: ${booking.guardianName}`,
    `Teléfono: ${booking.phone}`,
    `Correo: ${booking.email}`,
    `Nivel: ${booking.experienceLevel}`,
    `Observaciones: ${booking.notes}`,
  ].join('\n');
}

export async function sendNewBookingAdminNotification(
  booking: AppointmentBooking
): Promise<EmailSendResult> {
  const recipient = getRecipientEmail();
  if (!recipient) {
    return {
      sent: false,
      reason: 'Falta definir ADMIN_NOTIFICATION_EMAIL (o SMTP_USER) en el entorno.',
    };
  }

  return deliverEmail({
    to: recipient,
    replyTo: booking.email,
    subject: `Nueva reserva ${booking.bookingCode} · ${booking.studentName} (${booking.timeSlot})`,
    html: buildBookingEmailHtml(booking, false),
    text: buildBookingEmailText(booking, false),
  });
}

export async function sendTestAdminNotification(): Promise<EmailSendResult> {
  const recipient = getRecipientEmail();
  if (!recipient) {
    return {
      sent: false,
      reason: 'Falta definir ADMIN_NOTIFICATION_EMAIL (o SMTP_USER) en el entorno.',
    };
  }

  const today = new Date();
  const sampleBooking: AppointmentBooking = {
    id: 'test-notification',
    bookingCode: 'LC-PRUEBA',
    classTypeId: 'iniciacion-infantil',
    classTypeName: 'Iniciación y Primer Contacto (Prueba de Correo)',
    instructorId: 'inst-valentina',
    instructorName: 'Prof. Valentina Morales',
    date: today.toISOString().split('T')[0],
    formattedDate: today.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    timeSlot: '09:45 - 10:45',
    studentName: 'Registro de Prueba Administrativa',
    studentAge: 'N/A',
    guardianName: 'Verificación del Sistema',
    phone: '+34 600 000 000',
    email: recipient,
    experienceLevel: 'Sin experiencia (Primera vez)',
    notes: 'Este mensaje confirma que los avisos automáticos por correo al administrador están activos.',
    createdAt: today.toISOString(),
    status: 'confirmada',
  };

  return deliverEmail({
    to: recipient,
    subject: 'Prueba de notificaciones · La Caballería Club de Equitación',
    html: buildBookingEmailHtml(sampleBooking, true),
    text: buildBookingEmailText(sampleBooking, true),
  });
}
