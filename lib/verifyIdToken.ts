// Checks a Firebase (Google sign-in) ID token the way Google documents:
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
// This avoids loading firebase-admin/auth, which fails on some hosting set-ups.
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const JWKS_URL = process.env.FIREBASE_AUTH_JWKS_URL
  || 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export interface FirebaseToken extends JWTPayload { sub: string; email?: string; email_verified?: boolean }

export async function verifyFirebaseIdToken(token: string, projectId: string): Promise<FirebaseToken> {
  if (!projectId) throw Object.assign(new Error('Firebase project ID is not set'), { code: 'LIFEPLUS_NO_PROJECT' });
  jwks ??= createRemoteJWKSet(new URL(JWKS_URL), { cooldownDuration: 30_000, cacheMaxAge: 6 * 60 * 60 * 1000 });
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ['RS256'],
    clockTolerance: 60,
  });
  if (!payload.sub) throw Object.assign(new Error('Token has no user'), { code: 'ERR_JWT_CLAIM_VALIDATION_FAILED', claim: 'sub' });
  const authTime = (payload as { auth_time?: number }).auth_time;
  if (typeof authTime === 'number' && authTime > Date.now() / 1000 + 300) {
    throw Object.assign(new Error('Token was issued in the future'), { code: 'ERR_JWT_CLAIM_VALIDATION_FAILED', claim: 'auth_time' });
  }
  return payload as FirebaseToken;
}
