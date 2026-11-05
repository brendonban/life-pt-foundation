import { handle, requireAdmin } from '@/lib/auth';
import { store } from '@/lib/store';

export const GET = handle(async (req: Request) => {
  await requireAdmin(req);
  return Response.json(await store.listMail());
});
