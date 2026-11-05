import { bootstrapAdmins, editorDomains, handle, HttpError, requireAdmin } from '@/lib/auth';
import { store } from '@/lib/store';

export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return Response.json({ bootstrap: bootstrapAdmins(), editorDomains: editorDomains(), emails: await store.getAdmins() });
});

export const PUT = handle(async (req: Request) => {
  await requireAdmin(req);
  const { emails } = (await req.json().catch(() => ({}))) as { emails?: string[] };
  if (!Array.isArray(emails)) throw new HttpError(400, 'Missing list');
  const clean = [...new Set(emails.map((e) => String(e).trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)))].slice(0, 50);
  await store.setAdmins(clean);
  return Response.json({ emails: clean });
});
