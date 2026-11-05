// Branded HTML email, used for the admin preview (client) and real sends (server).
import { fillVars } from './util';
import type { Content, Signup } from './types';

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export function emailInner(bodyText: string, organisers: string, siteUrl: string) {
  const paras = esc(bodyText).split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, '<br>')}</p>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF9;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#3C0A1E"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #E9E3E0;border-radius:16px;overflow:hidden;margin:0 auto"><tr><td style="background:#3C0A1E;padding:22px 28px;color:#ffffff;font-size:22px;font-weight:bold">LIFE<span style="color:#F2A9C1">+</span> <span style="font-weight:normal;font-size:15px;color:#E9DCE1">Healthy Ageing with HIV</span></td></tr><tr><td style="padding:28px;font-size:16px;line-height:1.6;color:#3C0A1E">${paras}</td></tr><tr><td style="padding:16px 28px;background:#F6F3F1;font-size:12px;line-height:1.5;color:#6B6164">${esc(organisers)}<br>You're receiving this because you signed up for LIFE+.${siteUrl ? ` <a href="${esc(siteUrl)}" style="color:#AF2153">Visit the website</a>` : ''}</td></tr></table></td></tr></table>`;
}

export const emailHTML = (body: string, organisers: string, siteUrl: string) =>
  `<!DOCTYPE html><html><body style="margin:0;padding:0">${emailInner(body, organisers, siteUrl)}</body></html>`;

export const varsFor = (s: Partial<Signup>, c: Content) => ({
  name: s.preferredName || s.name || 'there',
  date: c.event.date, time: c.event.time, venue: c.event.venue,
});

export function renderEmail(subject: string, body: string, s: Partial<Signup>, c: Content, siteUrl: string) {
  const v = varsFor(s, c);
  const text = fillVars(body, v);
  return { subject: fillVars(subject, v), text, html: emailHTML(text, c.event.organisers, siteUrl) };
}
