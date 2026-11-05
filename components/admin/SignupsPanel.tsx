'use client';
import type { Content, Signup } from '@/lib/types';
import { fmtDate, useUI } from './ui';
import type { Api } from './Editors';

export const SIGNUP_COLS: [keyof Signup | string, string][] = [
  ['createdAt', 'Signed up'], ['name', 'Full name'], ['preferredName', 'Call them'], ['email', 'Email'], ['phone', 'Phone'],
  ['ageGroup', 'Age'], ['attendAs', 'Joining as'], ['organisation', 'Organisation'], ['companions', '+ People'],
  ['companion', 'Companion names'], ['language', 'Language'], ['access', 'Access needs'], ['diet', 'Diet'],
  ['emergencyName', 'Emergency contact'], ['emergencyPhone', 'Emergency phone'], ['photoConsent', 'Photos'],
  ['heardFrom', 'Heard from'], ['notes', 'Notes'], ['status', 'Status'],
];
const cell = (s: Signup, k: string) => {
  const v = (s as unknown as Record<string, unknown>)[k];
  if (k === 'createdAt') return fmtDate(String(v || ''));
  return Array.isArray(v) ? v.join(', ') : String(v ?? '');
};
function toCSV(list: Signup[], sep = ',') {
  const q = (v: string) => (sep === ',' ? `"${v.replace(/"/g, '""')}"` : v.replace(/[\t\n]/g, ' '));
  return [SIGNUP_COLS.map((c) => q(c[1])).join(sep), ...list.map((s) => SIGNUP_COLS.map(([k]) => q(cell(s, k))).join(sep))].join('\n');
}
const extra = (s: Signup) => (typeof s.companions === 'number' ? s.companions : s.companion ? 1 : 0);

export default function SignupsPanel({ list, reload, setList, api, content, onToggleReg }: {
  list: Signup[] | null; reload: () => void; setList: (l: Signup[]) => void; api: Api; content: Content; onToggleReg: (open: boolean) => Promise<void>;
}) {
  const { toast, confirm } = useUI();
  if (!list) return <div className="card">Loading sign-ups…</div>;
  const active = list.filter((s) => s.status !== 'cancelled');
  const by = (...k: string[]) => active.filter((s) => k.includes(s.attendAs)).length;
  const cap = parseInt(content.event.places) || 0;
  const people = active.reduce((n, s) => n + 1 + extra(s), 0);

  return (
    <>
      <div className="stat-row">
        <div className="stat-box"><b>{active.length}</b><span className="muted">sign-ups</span></div>
        <div className="stat-box"><b>{people}{cap ? <span style={{ fontSize: '1rem', color: 'var(--muted)' }}> / {cap}</span> : null}</b><span className="muted">people incl. companions</span></div>
        <div className="stat-box"><b>{by('Older adult (50+)')}</b><span className="muted">older adults</span></div>
        <div className="stat-box"><b>{by('Younger adult (under 50)')}</b><span className="muted">younger adults</span></div>
        <div className="stat-box"><b>{by('Caregiver, family or friend', 'Caregiver or family member')}</b><span className="muted">caregivers</span></div>
        <div className="stat-box"><b>{active.filter((s) => /don/.test(s.photoConsent || '')).length}</b><span className="muted">no photos</span></div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <button className="btn btn-teal btn-sm" onClick={() => {
          const blob = new Blob(['﻿' + toCSV(list)], { type: 'text/csv' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = `lifeplus-signups-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
        }}>Download CSV</button>
        <button className="btn btn-ghost btn-sm" onClick={async () => {
          try { await navigator.clipboard.writeText(toCSV(list, '\t')); toast('Copied. Paste into Google Sheets or Excel.'); } catch { toast('Copy was blocked by the browser'); }
        }}>Copy as table</button>
        <button className="btn btn-ghost btn-sm" onClick={reload}>Refresh</button>
        <label className="check" style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '.92rem' }}>
          <input type="checkbox" checked={content.event.regOpen !== false} onChange={(e) => onToggleReg(e.target.checked)} /> Sign-up form open
        </label>
      </div>
      {list.length ? (
        <div className="table-wrap"><table>
          <thead><tr>{SIGNUP_COLS.map((c) => <th key={c[0]}>{c[1]}</th>)}<th /></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s.id} style={s.status === 'cancelled' ? { opacity: 0.5 } : undefined}>
              {SIGNUP_COLS.map(([k]) => k === 'status' ? (
                <td key={k}><select value={s.status || 'registered'} style={{ padding: '4px 8px', fontSize: '.85rem', minWidth: 120 }}
                  onChange={async (e) => {
                    const status = e.target.value;
                    try { await api(`/api/admin/signups/${s.id}`, { method: 'PATCH', body: { status } }); setList(list.map((x) => (x.id === s.id ? { ...x, status } : x))); }
                    catch (err) { toast(err instanceof Error ? err.message : 'Could not update'); }
                  }}>{['registered', 'confirmed', 'attended', 'cancelled'].map((o) => <option key={o}>{o}</option>)}</select></td>
              ) : <td key={k}>{cell(s, k)}</td>)}
              <td><button className="icon-btn danger" aria-label="Delete sign-up" onClick={async () => {
                if (!(await confirm('Permanently delete this sign-up?'))) return;
                try { await api(`/api/admin/signups/${s.id}`, { method: 'DELETE' }); setList(list.filter((x) => x.id !== s.id)); toast('Deleted'); }
                catch (err) { toast(err instanceof Error ? err.message : 'Could not delete'); }
              }}>✕</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty">No sign-ups yet. Share the <a href="/register">sign-up page</a> to get started.</div>}
      <p className="muted" style={{ fontSize: '.85rem', marginTop: 14 }}>Sign-up data is personal data. Download it only to devices you trust and delete it after the event.</p>
    </>
  );
}
