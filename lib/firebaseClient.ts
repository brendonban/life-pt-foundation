'use client';
// Browser-side Firebase, used only for Google sign-in on the admin console.
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const clientConfigured = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);

let auth: Auth | null = null;
export function clientAuth(): Auth {
  if (!auth) auth = getAuth(getApps()[0] ?? initializeApp(cfg));
  return auth;
}
