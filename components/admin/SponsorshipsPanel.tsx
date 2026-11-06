'use client';
import { useCallback, useEffect, useState } from 'react';
import type { SponsorEnquiry } from '@/lib/types';
import { fmtDate, useUI } from './ui';
import type { Api } from './Editors';

const COLS: [keyof SponsorEnquiry, string][] = [
  ['createdAt', 'Received'], ['name', 'Name'], ['organisation', 'Organisation'], ['email', 'Email'], ['phone', 'Phone'],
  ['offers', 'Offering'], ['details', 'Details'], ['credit', 'Credit as'], ['website', 'Website'], ['status', 'Status'],
];
const STATUSES = ['new', 'contacted', 'confirmed', 'declined'];
const cell = (e: SponsorEnquiry, k: keyof SponsorEnquiry) => {
  const v = e[k];
  if (k === 'createdAt') return fmtDate(String(v || ''));
  return Array.isArray(v) ? v.join(', ') : String(v ?? '');
};

export default function SponsorshipsPanel({ api }: { api: Api }) {
  const { toast, confirm } = useUI();
  const [list, setList] = useState<SponsorEnquiry[] | null>(null);
  const load = useCallback(() => { setList(null); api<SponsorEnquiry[]>('/api/admin/sponsorships').then(setList).catch((e) => { toast(e.message); setList([]); }); }, [api, toast]);
  useEffect(() => { load(); }, [load]);
  if (!list) return <div className="card">Loading sponsorship offers…</div>;

  const count = (s: string) => list.filter((e) => (e.status || 'new') === s).length;
  const csv = () => {
    const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [COLS.map((c) => q(c[1])).join(','), ...list.map((e) => COLS.map(([k]) => q(cell(e, k))).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + rows], { type: 'text/csv' }));
    a.download = `lifeplus-sponsorships-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <>
      <h3 style={{ fontSize: '1.5rem' }}>Sponsorship offers</h3>
      <div className="stat-row">
        <div className="stat-box"><b>{list.length}</b><span className="muted">offers</span></div>
        <div className="stat-box"><b>{count('new')}</b><span className="muted">new</span></div>
        <div className="stat-box"><b>{count('contacted')}</b><span className="muted">contacted</span></div>
        <div className="stat-box"><b>{count('confirmed')}</b><span className="muted">confirmed</span></div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn btn-teal btn-sm" onClick={csv} disabled={!list.length}>Download CSV</button>
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
        <a className="btn btn-ghost btn-sm" href="/sponsors#become-a-sponsor" target="_blank" rel="noopener">View the form ↗</a>
      </div>
      {list.length ? (
        <div className="table-wrap"><table>
          <thead><tr>{COLS.map((c) => <th key={c[0]}>{c[1]}</th>)}<th /></tr></thead>
          <tbody>{list.map((e) => (
            <tr key={e.id} style={e.status === 'declined' ? { opacity: 0.5 } : undefined}>
              {COLS.map(([k]) => k === 'status' ? (
                <td key={k}><select value={e.status || 'new'} style={{ padding: '4px 8px', fontSize: '.85rem', minWidth: 120 }}
                  onChange={async (ev) => {
                    const status = ev.target.value;
                    try { await api(`/api/admin/sponsorships/${e.id}`, { method: 'PATCH', body: { status } }); setList(list.map((x) => (x.id === e.id ? { ...x, status } : x))); }
                    catch (err) { toast(err instanceof Error ? err.message : 'Could not update'); }
                  }}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
              ) : k === 'email' ? <td key={k}><a href={`mailto:${e.email}`}>{e.email}</a></td>
                : k === 'details' ? <td key={k} style={{ minWidth: 240, whiteSpace: 'pre-line' }}>{e.details}</td>
                : <td key={k}>{cell(e, k)}</td>)}
              <td><button className="icon-btn danger" aria-label="Delete offer" onClick={async () => {
                if (!(await confirm('Permanently delete this sponsorship offer?'))) return;
                try { await api(`/api/admin/sponsorships/${e.id}`, { method: 'DELETE' }); setList(list.filter((x) => x.id !== e.id)); toast('Deleted'); }
                catch (err) { toast(err instanceof Error ? err.message : 'Could not delete'); }
              }}>✕</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty">No sponsorship offers yet. Share the <a href="/sponsors#become-a-sponsor">sponsorship form</a> to get started.</div>}
      <p className="muted" style={{ fontSize: '.85rem', marginTop: 14 }}>Each new offer also sends an alert to the email in SPONSOR_NOTIFY_EMAIL (or MAIL_REPLY_TO), and a thank-you to the sponsor.</p>
    </>
  );
}
