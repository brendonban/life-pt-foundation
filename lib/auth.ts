// Checks who is calling the admin API.
//  - "admin":  named people (ADMIN_EMAILS + the list managed in the console). Full access,
//              including sign-ups (personal data), email and the admin list.
//  - "editor": anyone signed in with a Google account on an allowed domain (EDITOR_DOMAINS,
//              by default siswa.um.edu.my and um.edu.my). Can edit page content and upload images only.
import { adminAuth, firebaseProjectId } from './firebaseAdmin';
import { DEMO, demoWritesAllowed, store } from './store';

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export type Role = 'admin' | 'editor';
export interface Caller { email: string; role: Role }

const list = (v?: string) => (v || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

/** Emails that are always admins (comma separated env var), plus the list managed in the console. */
export const bootstrapAdmins = () => list(process.env.ADMIN_EMAILS);

/** Email domains whose accounts may edit page content. Set EDITOR_DOMAINS=none to switch this off. */
export const editorDomains = () => {
  const v = process.env.EDITOR_DOMAINS;
  if (v === undefined || v.trim() === '') return ['siswa.um.edu.my', 'um.edu.my'];
  return list(v).filter((d) => d !== 'none');
};

async function identify(req: Request): Promise<Caller> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Please sign in.');
  if (DEMO) {
    if (!demoWritesAllowed) throw new HttpError(503, 'Firebase is not configured on this server. See the README.');
    if (token === 'demo') return { email: 'demo.admin@example.com', role: 'admin' };
    if (token === 'demo-editor') return { email: 'demo.editor@siswa.um.edu.my', role: 'editor' };
    throw new HttpError(401, 'Please sign in.');
  }
  let decoded;
  try { decoded = await (await adminAuth()).verifyIdToken(token); }
  catch (e) { throw explainTokenError(e); }
  const email = (decoded.email || '').toLowerCase();
  if (!email || !decoded.email_verified) throw new HttpError(403, 'This Google account has no verified email.');

  const admins = [...bootstrapAdmins(), ...(await store.getAdmins()).map((e) => e.toLowerCase())];
  if (admins.includes(email)) return { email, role: 'admin' };

  const domain = email.slice(email.lastIndexOf('@') + 1); // exact match: "x@evilum.edu.my" does not count
  if (editorDomains().includes(domain)) return { email, role: 'editor' };

  throw new HttpError(403, `${email} doesn't have access. Sign in with a UM account, or ask an admin to add you.`);
}

/** Turns Firebase's error into a clear message, and records the details in the server logs. */
export function explainTokenError(e: unknown): HttpError {
  const err = e as { code?: string; message?: string };
  const code = err?.code || '', msg = err?.message || String(e);
  console.error('[admin sign-in] token check failed:', code, msg);
  if (code === 'auth/id-token-expired') return new HttpError(401, 'Your sign-in has expired. Please sign in again.');
  if (code === 'app/invalid-credential' || /private key|PEM|DECODER|invalid_grant|credential/i.test(msg))
    return new HttpError(500, 'The server can\'t use its Firebase key. In Vercel, re-enter FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL exactly as in the downloaded JSON file, then redeploy.');
  if (/aud|audience|project/i.test(msg))
    return new HttpError(500, `The server's FIREBASE_PROJECT_ID ("${firebaseProjectId}") doesn't match the Firebase project used for sign-in. Set it to the same value as NEXT_PUBLIC_FIREBASE_PROJECT_ID, then redeploy.`);
  return new HttpError(401, `Sign-in couldn't be checked (${code || 'unknown error'}). Please sign in again; if it keeps happening, check the Vercel logs.`);
}

/** Any signed-in admin or editor. */
export const requireEditor = (req: Request) => identify(req);

/** Named admins only (sign-ups, email, admin list). */
export async function requireAdmin(req: Request): Promise<Caller> {
  const c = await identify(req);
  if (c.role !== 'admin') throw new HttpError(403, 'Only named admins can do this.');
  return c;
}

/** Wraps a route handler so thrown HttpErrors become JSON responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try { return await fn(...args); }
    catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      console.error(e);
      return Response.json({ error: e instanceof Error ? e.message : 'Something went wrong' }, { status: 500 });
    }
  };
}
