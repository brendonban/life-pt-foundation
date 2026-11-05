// Loads the site content (admin edits merged over the defaults), with a short in-memory cache.
import defaults from './default-content.json';
import { store } from './store';
import { deepMerge } from './util';
import type { Content } from './types';

export const DEFAULT_CONTENT = defaults as unknown as Content;

// Shared across every part of the server process (pages and API routes are bundled separately),
// so publishing from the admin console clears it everywhere at once.
type Cache = { at: number; data: Content } | null;
const g = globalThis as unknown as { __lifeplusContent?: { cache: Cache } };
const box = (g.__lifeplusContent ??= { cache: null });
const TTL = 15_000;

export async function getContent(): Promise<Content> {
  const cache = box.cache;
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  let saved: Partial<Content> | null = null;
  try { saved = await store.getContent(); } catch (e) { console.error('Could not load content, using defaults', e); }
  const data = deepMerge(DEFAULT_CONTENT, saved);
  box.cache = { at: Date.now(), data };
  return data;
}

export function clearContentCache() { box.cache = null; }
