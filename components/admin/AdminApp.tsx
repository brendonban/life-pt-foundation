'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from 'firebase/auth';
import { clientAuth, clientConfigured } from '@/lib/firebaseClient';
import type { Content, Signup } from '@/lib/types';
import { SECTIONS } from './schema';
import { SectionEditor, type Api } from './Editors';
import SignupsPanel from './SignupsPanel';
import EmailPanel from './EmailPanel';
import AdminsPanel from './AdminsPanel';
import { UIProvider, useUI } from './ui';

const TABS: [string, string][] = [['signups', '📋 Sign-ups'], ['email', '✉️ Email'], ...Object.entries(SECTIONS).map(([k, v]) => [k, v.label] as [string, string]), ['admins', '🔑 Admins']];
type Me = { email: string; role: 'admin' | 'editor'; demo: boolean; mailConfigured: boolean };
const ADMIN_ONLY = ['signups', 'email', 'admins'];

const GoogleG = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" /><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" /><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" /></svg>
);

function Console({ serverDemo }: { serverDemo: boolean }) {
  const { toast, confirm } = useUI();
  const demo = serverDemo;
  const [user, setUser] = useState<User | 'demo' | 'demo-editor' | null | undefined>(undefined);
  const [me, setMe] = useState<Me | null>(null);
  const [denied, setDenied] = useState('');
  const [signErr, setSignErr] = useState('');
  const [content, setContent] = useState<Content | null>(null);
  const [draft, setDraftState] = useState<Content | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('signups');
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const userRef = useRef(user); userRef.current = user;

  // auth state
  useEffect(() => {
    if (demo) { const d = sessionStorage.getItem('lifeplus_demo'); setUser(d === 'editor' ? 'demo-editor' : d ? 'demo' : null); return; }
    if (!clientConfigured) { setUser(null); return; }
    return onAuthStateChanged(clientAuth(), (u) => setUser(u));
  }, [demo]);

  const api: Api = useCallback(async (path, opts = {}) => {
    const u = userRef.current;
    const token = u === 'demo' || u === 'demo-editor' ? u : u ? await u.getIdToken() : '';
    const res = await fetch(path, {
      method: opts.method || 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(json.error || `Request failed (${res.status})`) as Error & { status?: number }; e.status = res.status; throw e; }
    return json;
  }, []);

  const loadSignups = useCallback(() => { setSignups(null); api<Signup[]>('/api/admin/signups').then(setSignups).catch((e) => { toast(e.message); setSignups([]); }); }, [api, toast]);

  // after sign-in: check access, load data
  useEffect(() => {
    if (!user) { setMe(null); return; }
    setDenied('');
    api<Me>('/api/admin/me').then(async (m) => {
      setMe(m);
      const c = await api<Content>('/api/admin/content');
      setContent(c); setDraftState(structuredClone(c)); setDirty(false);
      if (m.role === 'admin') loadSignups(); else setTab('event');
    }).catch((e) => setDenied(e.message));
  }, [user, api, loadSignups]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const setDraft = (key: string, v: unknown) => { setDraftState((d) => (d ? { ...d, [key]: v } as Content : d)); setDirty(true); };
  const saveContent = async (next: Content) => { await api('/api/admin/content', { method: 'PUT', body: { content: next } }); setContent(next); };

  async function signIn(asEditor = false) {
    setSignErr('');
    if (demo) { sessionStorage.setItem('lifeplus_demo', asEditor ? 'editor' : '1'); setUser(asEditor ? 'demo-editor' : 'demo'); return; }
    try {
      const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
      try { await signInWithPopup(clientAuth(), provider); }
      catch (e) { const code = (e as { code?: string }).code; if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') await signInWithRedirect(clientAuth(), provider); else throw e; }
    } catch (e) { setSignErr('Sign-in failed: ' + (e instanceof Error ? e.message : String(e))); }
  }
  async function doSignOut() {
    if (dirty && !(await confirm('Discard unsaved changes and sign out?'))) return;
    if (demo) { sessionStorage.removeItem('lifeplus_demo'); setUser(null); } else await signOut(clientAuth());
    setContent(null); setDraftState(null); setSignups(null); setDirty(false);
  }

  /* ---------- screens ---------- */
  if (user === undefined) return <div className="wrap"><div className="card signin-card"><p>Loading…</p></div></div>;
  if (!user) return (
    <div className="wrap"><div className="card signin-card">
      <div className="eyebrow">Admin console</div>
      <h2>Sign in to manage LIFE<span className="plus">+</span></h2>
      <p className="muted">Use the Google account that has been added as an admin.</p>
      {!demo && !clientConfigured
        ? <p className="err">Google sign-in isn&apos;t set up yet: add the NEXT_PUBLIC_FIREBASE_* settings (see README).</p>
        : <button className="gbtn" onClick={() => signIn()}><GoogleG />Sign in with Google</button>}
      <p className="muted" style={{ fontSize: '.85rem', marginTop: 14 }}>Any @siswa.um.edu.my or @um.edu.my account can sign in to edit the site&apos;s pages.</p>
      {demo && <p className="muted" style={{ fontSize: '.85rem', marginTop: 8 }}>Preview mode: this signs you in as a demo admin. <button type="button" className="pc-pause" onClick={() => signIn(true)}>Preview as a UM editor instead</button></p>}
      {signErr && <p className="err">{signErr}</p>}
    </div></div>
  );
  if (denied) return (
    <div className="wrap"><div className="card signin-card">
      <h2>No admin access</h2><p className="muted">{denied}</p>
      <p className="muted" style={{ fontSize: '.9rem' }}>Ask an existing admin to add you, then sign in again.</p>
      <button className="btn btn-ghost" onClick={doSignOut}>Sign out</button>
    </div></div>
  );
  if (!me || !content || !draft) return <div className="wrap"><div className="card signin-card"><p>Checking access…</p></div></div>;

  const isAdmin = me.role === 'admin';
  const tabs = TABS.filter(([k]) => isAdmin || !ADMIN_ONLY.includes(k));
  const baseSection = SECTIONS[tab];
  // editors can't open/close registration (the server enforces this too)
  const section = baseSection && !isAdmin && baseSection.path === 'event'
    ? { ...baseSection, fields: baseSection.fields.filter((f) => f.key !== 'regOpen') } : baseSection;
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <div className="admin-top">
        <div><div className="eyebrow" style={{ margin: 0 }}>Admin console</div><h2 style={{ margin: 0 }}>Manage LIFE<span className="plus">+</span></h2></div>
        <div className="who"><span>{me.email}{!isAdmin && <> · <b>Editor</b></>}</span><a className="btn btn-ghost btn-sm" href="/" target="_blank" rel="noopener">View site ↗</a><button className="btn btn-ghost btn-sm" onClick={doSignOut}>Sign out</button></div>
      </div>
      <div className="admin-shell">
        <nav className="admin-nav" aria-label="Admin sections">
          {tabs.map(([k, l]) => <button key={k} aria-current={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        </nav>
        <div>
          {!isAdmin && <div className="note" style={{ marginBottom: 18 }}>You&apos;re signed in as an <b>editor</b>: you can update the site&apos;s pages. Sign-ups and emails are only available to named admins.</div>}
          {isAdmin && tab === 'signups' && <SignupsPanel list={signups} reload={loadSignups} setList={setSignups} api={api} content={content}
            onToggleReg={async (open) => {
              const next = { ...content, event: { ...content.event, regOpen: open } };
              try { await saveContent(next); setDraftState((d) => d && { ...d, event: { ...d.event, regOpen: open } }); toast(open ? 'Sign-up form is open' : 'Sign-up form is closed'); }
              catch (e) { toast(e instanceof Error ? e.message : 'Could not save'); }
            }} />}
          {isAdmin && tab === 'email' && <EmailPanel signups={signups} content={content} api={api} mailConfigured={me.mailConfigured} demo={me.demo}
            onSaveConfirm={async (emails) => { await saveContent({ ...content, emails }); setDraftState((d) => d && { ...d, emails }); }} />}
          {isAdmin && tab === 'admins' && <AdminsPanel api={api} me={me.email} />}
          {section && (
            <>
              <h3 style={{ fontSize: '1.5rem' }}>{section.label}</h3>
              <SectionEditor s={section} draft={draft as unknown as Record<string, unknown>} setDraft={setDraft} api={api} />
              <div className="savebar">
                <span className="msg">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
                <button className="btn btn-ghost btn-sm" style={{ borderColor: '#fff', color: '#fff' }} disabled={!dirty || saving}
                  onClick={async () => { if (await confirm('Discard your unsaved changes?')) { setDraftState(structuredClone(content)); setDirty(false); } }}>Discard</button>
                <button className="btn btn-primary btn-sm" disabled={!dirty || saving} onClick={async () => {
                  setSaving(true);
                  try { const next = { ...draft, emails: content.emails }; await saveContent(next); setDraftState(structuredClone(next)); setDirty(false); toast('Published. The site is updated.'); }
                  catch (e) { toast('Could not publish: ' + (e instanceof Error ? e.message : 'error')); }
                  finally { setSaving(false); }
                }}>{saving ? 'Publishing…' : 'Publish changes'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminApp({ serverDemo }: { serverDemo: boolean }) {
  return <UIProvider><Console serverDemo={serverDemo} /></UIProvider>;
}
