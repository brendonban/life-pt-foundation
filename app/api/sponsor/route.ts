import { z } from 'zod';
import { getContent } from '@/lib/content';
import { store } from '@/lib/store';
import { handle, HttpError } from '@/lib/auth';
import { sendAndLog, siteUrlFrom } from '@/lib/mailer';
import { emailHTML } from '@/lib/emailTemplate';

const opt = (n: number) => z.string().trim().max(n).optional().default('');

const SponsorSchema = z.object({
  name: z.string({ error: 'Please add your name' }).trim().min(1, 'Please add your name').max(120),
  organisation: opt(160),
  email: z.string({ error: 'Please enter a valid email address' }).trim().toLowerCase().max(200).email('Please enter a valid email address'),
  phone: z.union([z.literal(''), z.string().trim().max(40).regex(/^[+\d][\d\s\-()]{6,}$/, 'Please enter a valid phone number')]).optional().default(''),
  offers: z.array(z.string().max(80)).min(1, 'Please choose at least one way you would like to help').max(12),
  details: z.string({ error: 'Please tell us a little about what you can offer' }).trim().min(1, 'Please tell us a little about what you can offer').max(2000),
  credit: opt(60),
  website: z.union([z.literal(''), z.string().trim().max(300).url('Please enter a full website address, starting with https://')]).optional().default(''),
  consent: z.literal(true, { error: 'Please agree to be contacted about your offer' }),
  company: z.string().max(0).optional(), // honeypot
});

const recent = new Map<string, number[]>();
function rateLimit(ip: string) {
  const t = Date.now(), list = (recent.get(ip) || []).filter((x) => t - x < 10 * 60_000);
  if (list.length >= 5) throw new HttpError(429, 'Too many submissions from this connection. Please try again later.');
  list.push(t); recent.set(ip, list);
}

export const POST = handle(async (req: Request) => {
  const c = await getContent();
  if (c.sponsorship?.formOpen === false) throw new HttpError(403, 'Sponsorship offers are closed at the moment.');
  rateLimit(req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local');

  const parsed = SponsorSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) throw new HttpError(400, parsed.error.issues.map((i) => i.message).join(' '));
  const { company, consent, ...data } = parsed.data; void company; void consent;

  await store.addSponsorship({ ...data, status: 'new' });

  const site = siteUrlFrom(req);
  const org = data.organisation ? ` (${data.organisation})` : '';
  // Thank-you to the sponsor
  const thanks = `Hi ${data.name},\n\nThank you for offering to support LIFE+ : Healthy Ageing with HIV on ${c.event.date}.\n\nYou offered: ${data.offers.join(', ')}.\n\n${c.sponsorship?.thankYou || 'We will be in touch soon.'}\n\nWith thanks,\nThe LIFE+ team`;
  await sendAndLog({ to: data.email, subject: 'Thank you for supporting LIFE+', text: thanks, html: emailHTML(thanks, c.event.organisers, site), kind: 'sponsor-thanks', sentBy: 'automatic' });
  // Alert to the team
  const team = (process.env.SPONSOR_NOTIFY_EMAIL || process.env.MAIL_REPLY_TO || '').trim().replace(/^(['"])(.*)\1$/, '$2');
  if (team) {
    const note = `New sponsorship offer from ${data.name}${org}.\n\nOffering: ${data.offers.join(', ')}\n\nDetails:\n${data.details}\n\nEmail: ${data.email}\nPhone: ${data.phone || '-'}\nCredit as: ${data.credit || '-'}\nWebsite: ${data.website || '-'}\n\nSee all offers in the admin console: ${site}/admin`;
    await sendAndLog({ to: team, subject: `New LIFE+ sponsorship offer: ${data.organisation || data.name}`, text: note, html: emailHTML(note, c.event.organisers, site), kind: 'sponsor-alert', sentBy: 'automatic' });
  }
  return Response.json({ ok: true });
});
