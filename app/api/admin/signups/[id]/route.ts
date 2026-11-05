import { handle, HttpError, requireAdmin } from '@/lib/auth';
import { store } from '@/lib/store';

const STATUSES = ['registered', 'confirmed', 'attended', 'cancelled'];
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  const { status } = (await req.json().catch(() => ({}))) as { status?: string };
  if (!status || !STATUSES.includes(status)) throw new HttpError(400, 'Unknown status');
  await store.updateSignup(id, { status });
  return Response.json({ ok: true });
});

export const DELETE = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  await store.deleteSignup(id);
  return Response.json({ ok: true });
});
