import { handle, HttpError, requireAdmin } from '@/lib/auth';
import { getContent } from '@/lib/content';
import { store } from '@/lib/store';
import { sendAndLog, siteUrlFrom } from '@/lib/mailer';
import { renderEmail } from '@/lib/emailTemplate';

export const maxDuration = 60;

// Sends a personalised copy to each chosen sign-up. The console sends in batches of up to 25.
export const POST = handle(async (req: Request) => {
  const { email } = await requireAdmin(req);
  const body = (await req.json().catch(() => ({}))) as { ids?: string[]; subject?: string; body?: string };
  const ids = Array.isArray(body.ids) ? body.ids.slice(0, 25) : [];
  const subject = String(body.subject || '').slice(0, 200), text = String(body.body || '').slice(0, 20_000);
  if (!ids.length) throw new HttpError(400, 'Choose at least one person.');
  if (!subject.trim() || !text.trim()) throw new HttpError(400, 'Add a subject and a message.');

  const [c, all] = await Promise.all([getContent(), store.listSignups()]);
  const site = siteUrlFrom(req);
  const results: { id: string; state: string; error?: string }[] = [];
  for (const id of ids) {
    const s = all.find((x) => x.id === id);
    if (!s?.email) { results.push({ id, state: 'FAILED', error: 'No email address' }); continue; }
    const m = renderEmail(subject, text, s, c, site);
    const r = await sendAndLog({ ...m, to: s.email, kind: 'broadcast', sentBy: email });
    results.push({ id, ...r });
  }
  return Response.json({ results });
});
