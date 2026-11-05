import { z } from 'zod';
import { getContent } from '@/lib/content';
import { store } from '@/lib/store';
import { handle, HttpError } from '@/lib/auth';
import { sendAndLog, siteUrlFrom } from '@/lib/mailer';
import { renderEmail } from '@/lib/emailTemplate';
import { ATTEND_OPTIONS } from '@/lib/util';

const phone = z.string({ error: 'Please enter a valid phone number' }).trim().max(40).regex(/^[+\d][\d\s\-()]{6,}$/, 'Please enter a valid phone number');
const opt = (n: number) => z.string().trim().max(n).optional().default('');

const SignupSchema = z.object({
  name: z.string({ error: 'Please add your full name' }).trim().min(1, 'Please add your full name').max(120),
  preferredName: opt(60),
  email: z.string({ error: 'Please enter a valid email address' }).trim().toLowerCase().max(200).email('Please enter a valid email address'),
  phone,
  ageGroup: opt(40),
  attendAs: z.enum(ATTEND_OPTIONS as [string, ...string[]], { error: 'Please choose how you are joining' }),
  organisation: opt(160),
  companions: z.coerce.number().int().min(0).max(2).default(0),
  companion: opt(160),
  language: opt(60),
  access: z.array(z.string().max(80)).max(10).default([]),
  diet: opt(60),
  emergencyName: opt(120),
  emergencyPhone: z.union([z.literal(''), phone]).optional().default(''),
  photoConsent: z.string({ error: 'Please choose your photo preference' }).trim().min(1, 'Please choose your photo preference').max(60),
  heardFrom: opt(60),
  notes: opt(1000),
  consent: z.literal(true, { error: 'Please agree to the privacy note' }),
  website: z.string().max(0).optional(), // honeypot: real people never fill this in
});

// Best-effort flood protection per server instance.
const recent = new Map<string, number[]>();
function rateLimit(ip: string) {
  const t = Date.now(), list = (recent.get(ip) || []).filter((x) => t - x < 10 * 60_000);
  if (list.length >= 8) throw new HttpError(429, 'Too many sign-ups from this connection. Please try again later.');
  list.push(t); recent.set(ip, list);
}

export const POST = handle(async (req: Request) => {
  const c = await getContent();
  if (c.event.regOpen === false) throw new HttpError(403, 'Registration is closed.');
  rateLimit(req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local');

  const parsed = SignupSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(' ');
    throw new HttpError(400, msg);
  }
  const { website, ...data } = parsed.data; void website;
  if (!data.companions) data.companion = '';
  if (!/organisation|professional/i.test(data.attendAs)) data.organisation = '';

  await store.addSignup({ ...data, status: 'registered' });

  let emailed = false;
  if (c.emails.autoConfirm) {
    const m = renderEmail(c.emails.confirmSubject, c.emails.confirmBody, data, c, siteUrlFrom(req));
    const r = await sendAndLog({ ...m, to: data.email, kind: 'confirmation', sentBy: 'automatic' });
    emailed = r.state !== 'FAILED';
  }
  return Response.json({ ok: true, emailed, email: data.email });
});
