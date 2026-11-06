// Data storage. Uses Firestore (via the Admin SDK) when Firebase is configured,
// otherwise a local JSON file in .data/ so the site can be tried out without any setup.
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb, firebaseConfigured } from './firebaseAdmin';
import type { Content, MailRecord, Signup, SponsorEnquiry } from './types';

export const DEMO = !firebaseConfigured;
/** In production, the local-file demo mode is refused unless explicitly allowed. */
export const demoWritesAllowed = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO === '1';

export interface Media { data: Buffer; type: string }

interface Store {
  getContent(): Promise<Partial<Content> | null>;
  saveContent(c: Content, by: string): Promise<void>;
  addSignup(s: Omit<Signup, 'id' | 'createdAt'>): Promise<string>;
  listSignups(): Promise<Signup[]>;
  updateSignup(id: string, patch: Partial<Signup>): Promise<void>;
  deleteSignup(id: string): Promise<void>;
  getAdmins(): Promise<string[]>;
  setAdmins(list: string[]): Promise<void>;
  putMedia(type: string, data: Buffer): Promise<string>;
  getMedia(id: string): Promise<Media | null>;
  addSponsorship(e: Omit<SponsorEnquiry, 'id' | 'createdAt'>): Promise<string>;
  listSponsorships(): Promise<SponsorEnquiry[]>;
  updateSponsorship(id: string, patch: Partial<SponsorEnquiry>): Promise<void>;
  deleteSponsorship(id: string): Promise<void>;
  addMail(m: Omit<MailRecord, 'id' | 'createdAt'>): Promise<void>;
  listMail(): Promise<MailRecord[]>;
}

const iso = (t: unknown) => (t instanceof Timestamp ? t.toDate().toISOString() : typeof t === 'string' ? t : '');

/* ---------------- Firestore ---------------- */
const firestoreStore: Store = {
  async getContent() {
    const snap = await adminDb().doc('site/content').get();
    return snap.exists ? (snap.data()!.content as Partial<Content>) : null;
  },
  async saveContent(c, by) {
    await adminDb().doc('site/content').set({ content: c, updatedAt: FieldValue.serverTimestamp(), updatedBy: by });
  },
  async addSignup(s) {
    const ref = await adminDb().collection('signups').add({ ...s, createdAt: FieldValue.serverTimestamp() });
    return ref.id;
  },
  async listSignups() {
    const q = await adminDb().collection('signups').orderBy('createdAt', 'desc').get();
    return q.docs.map((d) => ({ ...(d.data() as Signup), id: d.id, createdAt: iso(d.get('createdAt')) }));
  },
  async updateSignup(id, patch) { await adminDb().collection('signups').doc(id).update(patch); },
  async deleteSignup(id) { await adminDb().collection('signups').doc(id).delete(); },
  async getAdmins() {
    const snap = await adminDb().doc('config/admins').get();
    return snap.exists ? ((snap.data()!.emails as string[]) || []) : [];
  },
  async setAdmins(list) { await adminDb().doc('config/admins').set({ emails: list }); },
  async putMedia(type, data) {
    const ref = adminDb().collection('media').doc();
    await ref.set({ type, data: data.toString('base64'), createdAt: FieldValue.serverTimestamp() });
    return ref.id;
  },
  async getMedia(id) {
    const snap = await adminDb().collection('media').doc(id).get();
    if (!snap.exists) return null;
    return { type: snap.get('type'), data: Buffer.from(snap.get('data'), 'base64') };
  },
  async addSponsorship(e) {
    const ref = await adminDb().collection('sponsorships').add({ ...e, createdAt: FieldValue.serverTimestamp() });
    return ref.id;
  },
  async listSponsorships() {
    const q = await adminDb().collection('sponsorships').orderBy('createdAt', 'desc').get();
    return q.docs.map((d) => ({ ...(d.data() as SponsorEnquiry), id: d.id, createdAt: iso(d.get('createdAt')) }));
  },
  async updateSponsorship(id, patch) { await adminDb().collection('sponsorships').doc(id).update(patch); },
  async deleteSponsorship(id) { await adminDb().collection('sponsorships').doc(id).delete(); },
  async addMail(m) { await adminDb().collection('mail').add({ ...m, createdAt: FieldValue.serverTimestamp() }); },
  async listMail() {
    const q = await adminDb().collection('mail').orderBy('createdAt', 'desc').limit(300).get();
    return q.docs.map((d) => ({ ...(d.data() as MailRecord), id: d.id, createdAt: iso(d.get('createdAt')) }));
  },
};

/* ---------------- Local file (demo / development) ---------------- */
interface FileDb {
  content: Partial<Content> | null; signups: Signup[]; admins: string[];
  media: Record<string, { type: string; data: string }>; mail: MailRecord[]; sponsorships?: SponsorEnquiry[];
}
const DB_FILE = path.join(process.cwd(), '.data', 'db.json');
let queue: Promise<unknown> = Promise.resolve();
async function readDb(): Promise<FileDb> {
  try { return JSON.parse(await fs.readFile(DB_FILE, 'utf8')); }
  catch { return { content: null, signups: [], admins: [], media: {}, mail: [] }; }
}
function writeDb(mutate: (db: FileDb) => void | Promise<void>) {
  const run = queue.then(async () => {
    if (!demoWritesAllowed) throw new Error('Firebase is not configured. See README.');
    const db = await readDb(); await mutate(db);
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(db));
  });
  queue = run.catch(() => undefined);
  return run;
}
const now = () => new Date().toISOString();
const fileStore: Store = {
  async getContent() { return (await readDb()).content; },
  async saveContent(c) { await writeDb((db) => { db.content = c; }); },
  async addSignup(s) { const id = randomUUID(); await writeDb((db) => { db.signups.push({ ...s, id, createdAt: now() } as Signup); }); return id; },
  async listSignups() { return (await readDb()).signups.slice().reverse(); },
  async updateSignup(id, patch) { await writeDb((db) => { const r = db.signups.find((x) => x.id === id); if (r) Object.assign(r, patch); }); },
  async deleteSignup(id) { await writeDb((db) => { db.signups = db.signups.filter((x) => x.id !== id); }); },
  async getAdmins() { return (await readDb()).admins; },
  async setAdmins(list) { await writeDb((db) => { db.admins = list; }); },
  async putMedia(type, data) { const id = randomUUID().slice(0, 12); await writeDb((db) => { db.media[id] = { type, data: data.toString('base64') }; }); return id; },
  async getMedia(id) { const m = (await readDb()).media[id]; return m ? { type: m.type, data: Buffer.from(m.data, 'base64') } : null; },
  async addSponsorship(e) { const id = randomUUID(); await writeDb((db) => { (db.sponsorships ??= []).push({ ...e, id, createdAt: now() } as SponsorEnquiry); }); return id; },
  async listSponsorships() { return ((await readDb()).sponsorships || []).slice().reverse(); },
  async updateSponsorship(id, patch) { await writeDb((db) => { const r = (db.sponsorships || []).find((x) => x.id === id); if (r) Object.assign(r, patch); }); },
  async deleteSponsorship(id) { await writeDb((db) => { db.sponsorships = (db.sponsorships || []).filter((x) => x.id !== id); }); },
  async addMail(m) { await writeDb((db) => { db.mail.push({ ...m, id: randomUUID(), createdAt: now() }); }); },
  async listMail() { return (await readDb()).mail.slice().reverse().slice(0, 300); },
};

export const store: Store = DEMO ? fileStore : firestoreStore;
