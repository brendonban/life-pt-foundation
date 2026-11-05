import { store } from '@/lib/store';

// Serves uploaded team photos and partner logos.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{1,64}$/.test(id)) return new Response('Not found', { status: 404 });
  const m = await store.getMedia(id).catch(() => null);
  if (!m) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(m.data), {
    headers: {
      'Content-Type': m.type,
      // Each upload gets a new id, so a file never changes: cache it for a long time.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
