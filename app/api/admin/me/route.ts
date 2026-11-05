import { handle, requireEditor } from '@/lib/auth';
import { DEMO } from '@/lib/store';
import { mailConfigured } from '@/lib/mailer';

export const GET = handle(async (req: Request) => {
  const { email, role } = await requireEditor(req);
  return Response.json({ email, role, demo: DEMO, mailConfigured });
});
