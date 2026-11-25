import { z } from 'zod';
import { getContent } from '@/lib/content';
import { store } from '@/lib/store';
import { handle, HttpError } from '@/lib/auth';
import { sendAndLog, siteUrlFrom } from '@/lib/mailer';
import { emailHTML } from '@/lib/emailTemplate';
import { artworkById, MIN_STEP } from '@/lib/artworks';
import { isClosed, publicSummary } from '@/lib/auction';

export const dynamic = 'force-dynamic';

// Public: highest bid and number of bids per artwork. Never any bidder details.
export const GET = handle(async () => Response.json(await publicSummary(), { headers: { 'Cache-Control': 'no-store' } }));

const BidSchema = z.object({
  artworkId: z.string().max(80),
  amount: z.coerce.number({ error: 'Please enter your bid amount' }).int('Please bid in whole ringgit (no sen)').positive('Please enter your bid amount').max(1_000_000),
  name: z.string({ error: 'Please add your name' }).trim().min(1, 'Please add your name').max(120),
  email: z.string({ error: 'Please enter a valid email address' }).trim().toLowerCase().max(200).email('Please enter a valid email address'),
  whatsapp: z.string({ error: 'Please enter your WhatsApp number' }).trim().max(40).regex(/^[+\d][\d\s\-()]{6,}$/, 'Please enter a valid WhatsApp number'),
  consent: z.literal(true, { error: 'Please agree to be contacted about your bid' }),
  company: z.string().max(0).optional(), // honeypot
});

const recent = new Map<string, number[]>();
function rateLimit(ip: string) {
  const t = Date.now(), list = (recent.get(ip) || []).filter((x) => t - x < 10 * 60_000);
  if (list.length >= 15) throw new HttpError(429, 'Too many bids from this connection. Please try again in a few minutes.');
  list.push(t); recent.set(ip, list);
}
const rm = (n: number) => `RM ${n.toLocaleString('en-MY')}`;

export const POST = handle(async (req: Request) => {
  rateLimit(req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local');
  const parsed = BidSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) throw new HttpError(400, parsed.error.issues.map((i) => i.message).join(' '));
  const { company, consent, ...data } = parsed.data; void company; void consent;

  const art = artworkById(data.artworkId);
  if (!art) throw new HttpError(404, 'This artwork is not in the auction.');
  const [auction, bids] = await Promise.all([store.getAuction(), store.listBids()]);
  if (isClosed(auction)) throw new HttpError(403, 'Bidding is closed. Thank you for your support!');
  if (auction.sold.includes(art.id)) throw new HttpError(409, 'Sorry, this artwork has just been sold.');

  const lot = bids.filter((b) => b.artworkId === art.id);
  const top = lot.reduce<typeof lot[number] | null>((m, b) => (!m || b.amount > m.amount ? b : m), null);
  const min = top ? top.amount + MIN_STEP : art.price;
  if (data.amount < min) throw new HttpError(409, top
    ? `Someone has already bid ${rm(top.amount)}. Please bid at least ${rm(min)}.`
    : `The starting bid for this artwork is ${rm(min)}.`);

  await store.addBid({ ...data, artworkTitle: art.title });

  const c = await getContent();
  const site = siteUrlFrom(req);
  const thanks = `Hi ${data.name},\n\nThank you for bidding ${rm(data.amount)} on "${art.title}" by ${art.artist}.\n\nYou're currently the highest bidder. If someone outbids you, we'll email you so you can bid again: ${site}/auction\n\nWhen bidding closes, the LIFE+ team will contact the winning bidders by WhatsApp or email about payment and collection.\n\nEvery purchase supports the artists and the PT Foundation community. Thank you!\n\nThe LIFE+ team`;
  await sendAndLog({ to: data.email, subject: `Your bid on "${art.title}"`, text: thanks, html: emailHTML(thanks, c.event.organisers, site), kind: 'auction-bid', sentBy: 'automatic' });

  if (top && top.email !== data.email) {
    const outbid = `Hi ${top.name},\n\nSomeone has placed a higher bid (${rm(data.amount)}) on "${art.title}".\n\nIf you'd still like it, you can bid again here: ${site}/auction#${art.id}\n\nThank you for supporting the artists!\nThe LIFE+ team`;
    await sendAndLog({ to: top.email, subject: `You've been outbid on "${art.title}"`, text: outbid, html: emailHTML(outbid, c.event.organisers, site), kind: 'auction-outbid', sentBy: 'automatic' });
  }

  const team = (process.env.AUCTION_NOTIFY_EMAIL || process.env.SPONSOR_NOTIFY_EMAIL || process.env.MAIL_REPLY_TO || '').trim().replace(/^(['"])(.*)\1$/, '$2');
  if (team) {
    const note = `New bid: ${rm(data.amount)} on "${art.title}" (${art.artist}).\n\nBidder: ${data.name}\nEmail: ${data.email}\nWhatsApp: ${data.whatsapp}\n\nSee all bids in the admin console: ${site}/admin`;
    await sendAndLog({ to: team, subject: `New bid ${rm(data.amount)}: ${art.title}`, text: note, html: emailHTML(note, c.event.organisers, site), kind: 'auction-alert', sentBy: 'automatic' });
  }
  return Response.json({ ok: true, ...(await publicSummary()) });
});
