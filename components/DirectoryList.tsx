'use client';
import { useState } from 'react';
import type { DirectoryItem } from '@/lib/types';
import { safeUrl } from '@/lib/util';

export default function DirectoryList({ items }: { items: DirectoryItem[] }) {
  const [cat, setCat] = useState(''), [q, setQ] = useState('');
  const cats = [...new Set(items.map((d) => d.category).filter(Boolean))];
  const shown = items.filter((d) => (!cat || d.category === cat) && (!q || JSON.stringify(d).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <div className="dir-tools">
        <input type="search" placeholder="Search by name, service or area" aria-label="Search directory" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="dir-tools" role="group" aria-label="Filter by category">
        <button className="chip" aria-pressed={cat === ''} onClick={() => setCat('')}>All</button>
        {cats.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="grid g2">
        {shown.length ? shown.map((d, i) => {
          const u = safeUrl(d.url);
          return (
            <div className="card dir-item" key={i}>
              <span className="tag">{d.category}</span>
              <h3 style={{ marginTop: 10 }}>{d.name}</h3>
              <p className="muted" style={{ margin: 0 }}>{d.text}</p>
              <dl>
                {d.phone && <><dt>Phone</dt><dd><a href={`tel:${d.phone.replace(/[^\d+]/g, '')}`}>{d.phone}</a></dd></>}
                {d.email && <><dt>Email</dt><dd>{d.email}</dd></>}
                {u && <><dt>Web</dt><dd><a href={u} target="_blank" rel="noopener noreferrer">{u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a></dd></>}
                {d.address && <><dt>Area</dt><dd>{d.address}</dd></>}
              </dl>
            </div>
          );
        }) : <div className="empty" style={{ gridColumn: '1/-1' }}>No matches. Try another search.</div>}
      </div>
    </>
  );
}
