import { handle, requireAdmin } from '@/lib/auth';
import { store } from '@/lib/store';

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin(req);
  const { id } = await ctx.params;
  await store.deleteBid(id);
  return Response.json({ ok: true });
});
