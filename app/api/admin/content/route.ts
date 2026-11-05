import { handle, HttpError, requireEditor } from '@/lib/auth';
import { clearContentCache, getContent } from '@/lib/content';
import { store } from '@/lib/store';
import type { Content } from '@/lib/types';

export const GET = handle(async (req: Request) => {
  await requireEditor(req);
  clearContentCache();
  return Response.json(await getContent());
});

export const PUT = handle(async (req: Request) => {
  const { email, role } = await requireEditor(req);
  const body = (await req.json().catch(() => null)) as { content?: Content } | null;
  let c = body?.content;
  if (!c || typeof c !== 'object' || !c.event) throw new HttpError(400, 'Missing content');
  if (JSON.stringify(c).length > 900_000) throw new HttpError(413, 'Content is too large.');
  if (role !== 'admin') {
    // Editors can't open/close registration or change the emails sent to participants.
    clearContentCache();
    const current = await getContent();
    c = { ...c, emails: current.emails, event: { ...c.event, regOpen: current.event.regOpen } };
  }
  await store.saveContent(c, email);
  clearContentCache();
  return Response.json({ ok: true });
});
