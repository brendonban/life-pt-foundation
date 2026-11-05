import { handle, HttpError, requireEditor } from '@/lib/auth';
import { store } from '@/lib/store';

// Accepts an image already resized in the browser, as a data URL.
export const POST = handle(async (req: Request) => {
  await requireEditor(req);
  const { data } = (await req.json().catch(() => ({}))) as { data?: string };
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(data || '');
  if (!m) throw new HttpError(400, 'Please upload a JPG, PNG or WebP image.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 700_000) throw new HttpError(413, 'That image is too large.');
  const id = await store.putMedia(m[1], buf);
  return Response.json({ ref: `media:${id}` });
});
