'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuctionSettings, Bid } from '@/lib/types';
import { ARTWORKS } from '@/lib/artworks';
import { fmtDate, useUI } from './ui';
import type { Api } from './Editors';

const rm = (n: number) => `RM ${n.toLocaleString('en-MY')}`;
const waLink = (n: string) => `https://wa.me/${n.replace(/[^\d]/g, '').replace(/^0/, '60')}`;

export default function AuctionPanel({ api }: { api: Api }) {
  const { toast, confirm } = useUI();
  const [data, setData] = useState<{ auction: AuctionSettings; bids: Bid[] } | null>(null);
  const [view, setView] = useState<'lots' | 'bids'>('lots');
  const load = useCallback(() => { setData(null); api<{ auction: AuctionSettings; bids: Bid[] }>('/api/admin/auction').then(setData).catch((e) => { toast(e.message); }); }, [api, toast]);
  useEffect(() => { load(); }, [load]);

  const lots = useMemo(() => {
    if (!data) return [];
    return ARTWORKS.map((a) => {
      const bids = data.bids.filter((b) => b.artworkId === a.id).sort((x, y) => y.amount - x.amount);
      return { a, bids, top: bids[0], sold: data.auction.sold.includes(a.id) };
    });
  }, [data]);

  if (!data) return <div className="card">Loading auction…</div>;
  const { auction, bids } = data;
  const save = async (next: AuctionSettings, msg: string) => {
    try { await api('/api/admin/auction', { method: 'PUT', body: next }); setData({ ...data, auction: next }); toast(msg); }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not save'); }
  };
  const total = lots.reduce((s, l) => s + (l.top && !l.sold ? l.top.amount : 0), 0);
  const csv = () => {
    const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Received', 'Artwork', 'Amount (RM)', 'Name', 'Email', 'WhatsApp', 'Highest for this artwork?'];
    const topIds = new Set(lots.map((l) => l.top?.id).filter(Boolean));
    const rows = [head.map(q).join(','), ...bids.map((b) => [fmtDate(b.createdAt), b.artworkTitle, b.amount, b.name, b.email, b.whatsapp, topIds.has(b.id) ? 'yes' : ''].map(q).join(','))].join('\n');
    const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob(['﻿' + rows], { type: 'text/csv' }));
    el.download = `lifeplus-auction-bids-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(el); el.click(); el.remove();
  };
  const del = async (b: Bid) => {
    if (!(await confirm(`Delete the ${rm(b.amount)} bid from ${b.name}? Use this for test or mistaken bids.`))) return;
    try { await api(`/api/admin/bids/${b.id}`, { method: 'DELETE' }); setData({ ...data, bids: bids.filter((x) => x.id !== b.id) }); toast('Bid deleted'); }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not delete'); }
  };

  return (
    <>
      <h3 style={{ fontSize: '1.5rem' }}>Art auction</h3>
      <div className="stat-row">
        <div className="stat-box"><b>{bids.length}</b><span className="muted">bids</span></div>
        <div className="stat-box"><b>{lots.filter((l) => l.top && !l.sold).length}</b><span className="muted">artworks with bids</span></div>
        <div className="stat-box"><b>{rm(total)}</b><span className="muted">total of highest bids</span></div>
        <div className="stat-box"><b>{auction.open ? 'Open' : 'Closed'}</b><span className="muted">bidding</span></div>
      </div>
      <div className="card" style={{ marginBottom: 18, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'end' }}>
        <button className={`btn btn-sm ${auction.open ? 'btn-ghost' : 'btn-teal'}`} onClick={async () => {
          if (auction.open && !(await confirm('Close bidding now? Nobody will be able to place new bids.'))) return;
          save({ ...auction, open: !auction.open }, auction.open ? 'Bidding closed' : 'Bidding open');
        }}>{auction.open ? 'Close bidding' : 'Open bidding'}</button>
        <label style={{ fontSize: '.9rem' }}>Close automatically at (optional)<br />
          <input type="datetime-local" defaultValue={auction.endsAt ? new Date(auction.endsAt).toLocaleString('sv-SE').slice(0, 16).replace(' ', 'T') : ''}
            style={{ padding: '6px 10px', fontSize: '.9rem' }}
            onBlur={(e) => { const v = e.target.value ? new Date(e.target.value).toISOString() : ''; if (v !== (auction.endsAt || '')) save({ ...auction, endsAt: v }, v ? 'Closing time saved' : 'Closing time removed'); }} /></label>
        <button className="btn btn-teal btn-sm" onClick={csv} disabled={!bids.length}>Download CSV</button>
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
        <a className="btn btn-ghost btn-sm" href="/auction" target="_blank" rel="noopener">View the auction ↗</a>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={`btn btn-sm ${view === 'lots' ? 'btn-teal' : 'btn-ghost'}`} onClick={() => setView('lots')}>By artwork</button>
        <button className={`btn btn-sm ${view === 'bids' ? 'btn-teal' : 'btn-ghost'}`} onClick={() => setView('bids')}>All bids</button>
      </div>
      {view === 'lots' ? (
        <div className="table-wrap"><table>
          <thead><tr><th>Artwork</th><th>Starting</th><th>Highest bid</th><th>Bids</th><th>Highest bidder</th><th>Sold</th></tr></thead>
          <tbody>{lots.map(({ a, bids: lb, top, sold }) => (
            <tr key={a.id} style={sold ? { opacity: 0.55 } : undefined}>
              <td><b>{a.title}</b><br /><span className="muted" style={{ fontSize: '.85rem' }}>{a.artist}</span></td>
              <td>{rm(a.price)}</td>
              <td>{top ? <b>{rm(top.amount)}</b> : <span className="muted">-</span>}</td>
              <td>{lb.length}</td>
              <td>{top ? <>{top.name}<br /><a href={`mailto:${top.email}`}>{top.email}</a><br /><a href={waLink(top.whatsapp)} target="_blank" rel="noopener noreferrer">{top.whatsapp}</a></> : <span className="muted">-</span>}</td>
              <td><label className="check" style={{ padding: '6px 10px' }}><input type="checkbox" checked={sold} onChange={(e) => {
                const s = e.target.checked ? [...auction.sold, a.id] : auction.sold.filter((x) => x !== a.id);
                save({ ...auction, sold: s }, e.target.checked ? `"${a.title}" marked sold and hidden from the auction` : `"${a.title}" is back in the auction`);
              }} /> <span style={{ fontSize: '.85rem' }}>Sold</span></label></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : bids.length ? (
        <div className="table-wrap"><table>
          <thead><tr><th>Received</th><th>Artwork</th><th>Amount</th><th>Name</th><th>Email</th><th>WhatsApp</th><th /></tr></thead>
          <tbody>{bids.map((b) => (
            <tr key={b.id}>
              <td>{fmtDate(b.createdAt)}</td><td>{b.artworkTitle}</td><td><b>{rm(b.amount)}</b></td><td>{b.name}</td>
              <td><a href={`mailto:${b.email}`}>{b.email}</a></td>
              <td><a href={waLink(b.whatsapp)} target="_blank" rel="noopener noreferrer">{b.whatsapp}</a></td>
              <td><button className="icon-btn danger" aria-label="Delete bid" onClick={() => del(b)}>✕</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty">No bids yet. Share <a href="/auction">the auction page</a> to get started.</div>}
      <p className="muted" style={{ fontSize: '.85rem', marginTop: 14 }}>Ticking &ldquo;Sold&rdquo; hides an artwork from the auction page. Each bid emails the bidder, emails the previous highest bidder that they were outbid, and sends an alert to AUCTION_NOTIFY_EMAIL (or SPONSOR_NOTIFY_EMAIL / MAIL_REPLY_TO).</p>
    </>
  );
}
