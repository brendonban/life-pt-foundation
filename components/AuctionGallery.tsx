'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Artwork } from '@/lib/artworks';
import type { AuctionSummary, LotStatus } from '@/lib/auction';

const rm = (n: number) => `RM ${n.toLocaleString('en-MY')}`;

export default function AuctionGallery({ artworks, step, initial }: { artworks: Artwork[]; step: number; initial: AuctionSummary }) {
  const [sum, setSum] = useState<AuctionSummary>(initial);
  const [pick, setPick] = useState<Artwork | null>(null);
  const [view, setView] = useState<Artwork | null>(null);
  const [sort, setSort] = useState<'featured' | 'low' | 'high'>('featured');

  const refresh = useCallback(() => {
    fetch('/api/auction', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((d) => d && setSum(d)).catch(() => {});
  }, []);
  useEffect(() => { const t = setInterval(refresh, 20_000); return () => clearInterval(t); }, [refresh]);

  const lot = (id: string): LotStatus | undefined => sum.lots.find((l) => l.id === id);
  const minFor = (a: Artwork) => { const l = lot(a.id); return l && l.highest ? l.highest + step : a.price; };
  const live = artworks.filter((a) => lot(a.id));
  const shown = sort === 'featured' ? live : [...live].sort((x, y) => (sort === 'low' ? minFor(x) - minFor(y) : minFor(y) - minFor(x)));

  return (
    <>
      <div className="auc-tools">
        <span className="muted">{live.length} artworks available</span>
        <label className="auc-sort">Sort by{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="featured">Featured</option><option value="low">Lowest bid first</option><option value="high">Highest bid first</option>
          </select>
        </label>
      </div>
      {!sum.open && <div className="note" style={{ marginBottom: 22 }}>Bidding is now closed. Thank you to everyone who took part! The team will contact the winning bidders.</div>}
      <div className="auc-grid">
        {shown.map((a) => {
          const l = lot(a.id)!;
          return (
            <article className="auc-card" key={a.id} id={a.id}>
              <button className="auc-img" onClick={() => setView(a)} aria-label={`View ${a.title} larger`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.img} alt={`${a.title} by ${a.artist}`} loading="lazy" />
              </button>
              <div className="auc-body">
                <h3>{a.title}</h3>
                <p className="auc-artist">by {a.artist}</p>
                <p className="auc-meta">{a.size} · 2026</p>
                <div className="auc-price">
                  {l.highest ? (<><span className="muted">Highest bid</span><b>{rm(l.highest)}</b><span className="muted">{l.count} bid{l.count === 1 ? '' : 's'}</span></>)
                    : (<><span className="muted">Starting bid</span><b>{rm(a.price)}</b><span className="muted">No bids yet</span></>)}
                </div>
                <button className="btn btn-primary btn-block" disabled={!sum.open} onClick={() => setPick(a)}>
                  {sum.open ? `Bid ${rm(minFor(a))} or more` : 'Bidding closed'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {view && <Viewer a={view} onClose={() => setView(null)} onBid={sum.open ? () => { setPick(view); setView(null); } : undefined} />}
      {pick && <BidDialog a={pick} min={minFor(pick)} onClose={() => setPick(null)} onDone={(s) => setSum(s)} />}
    </>
  );
}

function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); }, []);
  return { ref, onCancel: (e: React.SyntheticEvent) => { e.preventDefault(); onClose(); }, onClick: (e: React.MouseEvent) => { if (e.target === ref.current) onClose(); } };
}

function Viewer({ a, onClose, onBid }: { a: Artwork; onClose: () => void; onBid?: () => void }) {
  const d = useDialog(onClose);
  return (
    <dialog className="auc-dialog auc-view" ref={d.ref} onCancel={d.onCancel} onClick={d.onClick} aria-labelledby="v_title">
      <button className="auc-x" onClick={onClose} aria-label="Close">✕</button>
      <div className="auc-view-grid">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.img} alt={`${a.title} by ${a.artist}`} />
        <div>
          <h2 id="v_title">{a.title}</h2>
          <p className="auc-artist">by {a.artist}</p>
          <p className="auc-meta">{a.size} · 2026</p>
          <div className="eyebrow" style={{ marginTop: 18 }}>Artist statement</div>
          <p style={{ fontSize: '1rem' }}>{a.statement}</p>
          {onBid && <button className="btn btn-primary" onClick={onBid}>Place a bid</button>}
        </div>
      </div>
    </dialog>
  );
}

function BidDialog({ a, min, onClose, onDone }: { a: Artwork; min: number; onClose: () => void; onDone: (s: AuctionSummary) => void }) {
  const d = useDialog(onClose);
  const form = useRef<HTMLFormElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ name: string; amount: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(form.current!);
    const t = (k: string) => String(fd.get(k) || '').trim();
    const data = { artworkId: a.id, amount: Number(t('amount').replace(/[^\d]/g, '')), name: t('name'), email: t('email').toLowerCase(), whatsapp: t('whatsapp'), consent: fd.get('consent') === 'on', company: t('company') };
    const problems: string[] = [];
    if (!data.amount || data.amount < min) problems.push(`a bid of at least ${rm(min)}`);
    if (!data.name) problems.push('your name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email)) problems.push('a valid email address');
    if (!/^[+\d][\d\s\-()]{6,}$/.test(data.whatsapp)) problems.push('your WhatsApp number');
    if (!data.consent) problems.push('your agreement to be contacted');
    if (problems.length) { setErr(`Please add ${problems.join(', ')}.`); return; }
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/auction', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Something went wrong placing your bid.');
      onDone(json); setDone({ name: data.name, amount: data.amount });
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <dialog className="auc-dialog" ref={d.ref} onCancel={d.onCancel} onClick={d.onClick} aria-labelledby="b_title">
      <button className="auc-x" onClick={onClose} aria-label="Close">✕</button>
      {done ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }} role="status">
          <div className="big-emoji" aria-hidden="true">🎨</div>
          <h2 id="b_title">Thank you, {done.name}!</h2>
          <p>Your bid of <b>{rm(done.amount)}</b> on <b>{a.title}</b> is in. We&apos;ve emailed you a copy, and we&apos;ll let you know if someone outbids you.</p>
          <button className="btn btn-primary" onClick={onClose}>Back to the artworks</button>
        </div>
      ) : (
        <form ref={form} noValidate onSubmit={submit}>
          <div className="auc-bid-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.img} alt="" />
            <div><div className="eyebrow" style={{ margin: 0 }}>Place a bid</div><h2 id="b_title" style={{ fontSize: '1.6rem', margin: '2px 0' }}>{a.title}</h2><p className="auc-artist" style={{ margin: 0 }}>by {a.artist}</p></div>
          </div>
          <div className="field"><label htmlFor="b_amount">Your bid (RM)</label><span className="hint">Minimum {rm(min)}. Whole ringgit only.</span>
            <input id="b_amount" name="amount" type="number" inputMode="numeric" min={min} step={1} defaultValue={min} required /></div>
          <div className="field"><label htmlFor="b_name">Your name</label><input id="b_name" name="name" type="text" maxLength={120} autoComplete="name" required /></div>
          <div className="field"><label htmlFor="b_email">Email</label><input id="b_email" name="email" type="email" maxLength={200} autoComplete="email" inputMode="email" placeholder="name@example.com" required /></div>
          <div className="field"><label htmlFor="b_wa">WhatsApp number</label><input id="b_wa" name="whatsapp" type="tel" maxLength={40} autoComplete="tel" inputMode="tel" placeholder="+60 12-345 6789" required /></div>
          <div className="field"><label className="check"><input type="checkbox" name="consent" required /> <span>The LIFE+ team may contact me by WhatsApp or email about this bid. My details won&apos;t be shown on the site or shared (PDPA).</span></label></div>
          <div className="err" role="alert">{err}</div>
          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Placing your bid…' : 'Place my bid'}</button>
          <div style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true"><label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label></div>
        </form>
      )}
    </dialog>
  );
}
