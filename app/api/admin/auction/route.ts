import { handle, HttpError, requireAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import { ARTWORKS } from '@/lib/artworks';

export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  const [auction, bids] = await Promise.all([store.getAuction(), store.listBids()]);
  return Response.json({ auction, bids });
});

export const PUT = handle(async (req: Request) => {
  await requireAdmin(req);
  const body = (await req.json().catch(() => ({}))) as { open?: unknown; sold?: unknown; endsAt?: unknown };
  const ids = new Set(ARTWORKS.map((a) => a.id));
  if (typeof body.open !== 'boolean' || !Array.isArray(body.sold)) throw new HttpError(400, 'Invalid settings');
  const sold = body.sold.filter((x): x is string => typeof x === 'string' && ids.has(x));
  const endsAt = typeof body.endsAt === 'string' && (!body.endsAt || !Number.isNaN(Date.parse(body.endsAt))) ? body.endsAt : '';
  await store.setAuction({ open: body.open, sold, endsAt });
  return Response.json({ ok: true });
});
