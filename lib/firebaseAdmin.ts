// Server-only Firebase Admin setup. Credentials come from environment variables (see .env.example).
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/** Tidies a pasted setting: trims spaces and removes wrapping quote marks. */
const clean = (v?: string) => (v || '').trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim();

const projectId = clean(process.env.FIREBASE_PROJECT_ID);
const clientEmail = clean(process.env.FIREBASE_CLIENT_EMAIL);
// Accepts the key with "\n" sequences or real line breaks, with or without quote marks.
const privateKey = clean(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n');

export const firebaseConfigured = Boolean(projectId && clientEmail && privateKey);
export const firebaseProjectId = projectId;

let app: App | null = null;
function adminApp(): App {
  if (!firebaseConfigured) throw new Error('Firebase is not configured');
  if (app) return app;
  app = getApps()[0] ?? initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export const adminDb = () => getFirestore(adminApp());
