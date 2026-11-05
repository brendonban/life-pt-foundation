import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { Lines } from '@/components/Text';

export const metadata: Metadata = { title: 'Getting here' };

export default async function GettingHere() {
  const c = await getContent();
  const g = c.gettingHere;
  const q = encodeURIComponent(g.mapQuery || g.address);
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Getting here</div>
        <h1>Finding your way</h1>
        <p className="lede">{c.event.date} · {c.event.time}</p>
      </div>
      <section style={{ paddingTop: 12 }}><div className="wrap grid g2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: 22 }}>
            <span className="tag">Venue</span>
            <h3 style={{ marginTop: 12 }}><Lines text={g.address} /></h3>
            <a className="btn btn-teal btn-sm" style={{ marginTop: 10 }} href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">Open in Google Maps →</a>
          </div>
          <div className="ways">
            {g.ways.map((w, i) => (
              <div className="way" key={i}>
                <div className="ico" aria-hidden="true">{w.icon || '•'}</div>
                <div><h3 style={{ fontFamily: 'var(--body)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 2px' }}>{w.mode}</h3><p className="muted" style={{ margin: 0 }}>{w.text}</p></div>
              </div>
            ))}
          </div>
          {g.notes && <div className="note" style={{ marginTop: 24 }}><Lines text={g.notes} /></div>}
        </div>
        <div>
          <iframe className="map" title="Map to venue" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${q}&output=embed`} />
        </div>
      </div></section>
    </>
  );
}
