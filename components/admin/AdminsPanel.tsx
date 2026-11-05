'use client';
import { useEffect, useState } from 'react';
import { useUI } from './ui';
import type { Api } from './Editors';

export default function AdminsPanel({ api, me }: { api: Api; me: string }) {
  const { toast, confirm } = useUI();
  const [data, setData] = useState<{ bootstrap: string[]; editorDomains: string[]; emails: string[] } | null>(null);
  const [add, setAdd] = useState('');
  useEffect(() => { api<{ bootstrap: string[]; editorDomains: string[]; emails: string[] }>('/api/admin/admins').then(setData).catch((e) => toast(e.message)); }, [api, toast]);
  const save = async (emails: string[]) => {
    try { const r = await api<{ emails: string[] }>('/api/admin/admins', { method: 'PUT', body: { emails } }); setData((d) => d && { ...d, emails: r.emails }); toast('Admin list updated'); }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not update admins'); }
  };
  if (!data) return <div className="card">Loading…</div>;
  return (
    <div className="card">
      <h3>Admins</h3>
      <p className="muted">Admins have full access: sign-ups, email, and this list. Use their exact Google account email.</p>
      {data.editorDomains.length > 0 && <div className="note" style={{ margin: '0 0 14px' }}>Anyone signed in with an <b>{data.editorDomains.map((d) => '@' + d).join(' or ')}</b> Google account can also sign in as an <b>editor</b>. Editors can change page content and upload images, but can&apos;t see sign-ups, send emails, or manage admins.</div>}
      {data.bootstrap.length > 0 && <p className="muted" style={{ fontSize: '.9rem' }}>Always admins (set in the server settings): {data.bootstrap.join(', ')}</p>}
      <div style={{ display: 'grid', gap: 8, margin: '12px 0 16px' }}>
        {data.emails.map((e, i) => (
          <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 12 }}>
            <span style={{ flex: 1 }}>{e}</span>
            <button className="icon-btn danger" aria-label={`Remove ${e}`} onClick={async () => {
              if (e === me && !(await confirm('Remove yourself? You may lose access.'))) return;
              save(data.emails.filter((_, j) => j !== i));
            }}>✕</button>
          </div>
        ))}
        {!data.emails.length && <p className="muted">No extra admins yet.</p>}
      </div>
      <form style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} onSubmit={(ev) => {
        ev.preventDefault(); const v = add.trim().toLowerCase(); if (!v || data.emails.includes(v)) return; setAdd(''); save([...data.emails, v]);
      }}>
        <input type="email" placeholder="name@gmail.com" style={{ flex: '1 1 240px' }} value={add} onChange={(e) => setAdd(e.target.value)} required />
        <button className="btn btn-teal btn-sm">Add admin</button>
      </form>
    </div>
  );
}
