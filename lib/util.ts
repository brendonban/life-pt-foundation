// Small helpers shared by server and client code (no Node-only imports here).

export const safeUrl = (u?: string) => (/^https?:\/\//i.test(u || '') ? (u as string) : '');

export const splitList = (v?: string) =>
  String(v || '').split(',').map((x) => x.trim()).filter(Boolean);

export const initials = (n?: string) =>
  String(n || '?')
    .replace(/^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, '')
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '+';

export const firstName = (n?: string) =>
  String(n || '').replace(/^(Dr|Prof|Assoc\.? Prof|Mr|Ms|Mrs|Datuk|Dato'?)\.?\s+/i, '').split(/\s+/)[0];

/** "media:abc" -> served by /api/media/abc ; plain URLs and /paths pass through */
export const mediaUrl = (ref?: string) => {
  if (!ref) return '';
  if (ref.startsWith('media:')) return `/api/media/${encodeURIComponent(ref.slice(6))}`;
  return ref;
};

export const fillVars = (t: string, v: Record<string, string>) =>
  String(t || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in v ? v[k] ?? '' : m));

/** Splits text on ** markers into plain/bold parts for safe React rendering. */
export const boldParts = (s: string) =>
  String(s || '').split(/(\*\*.+?\*\*)/g).filter(Boolean).map((p) =>
    p.startsWith('**') && p.endsWith('**') ? { b: true, t: p.slice(2, -2) } : { b: false, t: p });

export function deepMerge<T>(base: T, over: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(over) ? over : base) as T;
  if (base && typeof base === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    if (over && typeof over === 'object' && !Array.isArray(over)) {
      for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
        out[k] = k in out ? deepMerge(out[k], v) : v;
      }
    }
    return out as T;
  }
  return (over === undefined || over === null ? base : over) as T;
}

export const ATTEND_OPTIONS = [
  'Older adult (50+)', 'Younger adult (under 50)', 'Caregiver, family or friend',
  'Community organisation', 'Health professional or student', 'Prefer not to say',
];
