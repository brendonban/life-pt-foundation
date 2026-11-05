// Sends email from the server with Nodemailer (Gmail app password or any SMTP service).
import nodemailer, { type Transporter } from 'nodemailer';
import { store } from './store';

export const mailConfigured = Boolean(process.env.SMTP_URL || (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD));

let transport: Transporter | null = null;
function getTransport() {
  if (transport) return transport;
  transport = process.env.SMTP_URL
    ? nodemailer.createTransport(process.env.SMTP_URL)
    : nodemailer.createTransport({
        service: 'gmail', pool: true, maxConnections: 2,
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
  return transport;
}

const from = () => process.env.MAIL_FROM || (process.env.GMAIL_USER ? `LIFE+ <${process.env.GMAIL_USER}>` : 'LIFE+ <no-reply@example.com>');

/** Sends one email and records it in the sent log. Never throws; returns the result state. */
export async function sendAndLog(m: { to: string; subject: string; text: string; html: string; kind: string; sentBy: string }) {
  let state: 'SENT' | 'FAILED' | 'PREVIEW' = 'PREVIEW';
  let error: string | undefined;
  if (mailConfigured) {
    try {
      await getTransport().sendMail({ from: from(), replyTo: process.env.MAIL_REPLY_TO || undefined, to: m.to, subject: m.subject, text: m.text, html: m.html });
      state = 'SENT';
    } catch (e) { state = 'FAILED'; error = e instanceof Error ? e.message.slice(0, 300) : 'Send failed'; }
  }
  try { await store.addMail({ to: m.to, subject: m.subject, kind: m.kind, state, ...(error ? { error } : {}), sentBy: m.sentBy }); }
  catch (e) { console.error('Could not log email', e); }
  return { state, error };
}

export const siteUrlFrom = (req: Request) => process.env.SITE_URL || new URL(req.url).origin;
