import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { mediaUrl, safeUrl } from '@/lib/util';

export const metadata: Metadata = { title: 'Sponsors & partners' };

export default async function Sponsors() {
  const c = await getContent();
  const tiers = [...new Set(c.sponsors.map((s) => s.tier || 'Partner'))];
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Sponsors &amp; partners</div>
        <h1>With thanks to our partners</h1>
        <p className="lede">LIFE+ is made possible by organisations who believe everyone deserves to age with dignity. Interested in supporting? Get in touch with the team.</p>
      </div>
      <section style={{ paddingTop: 20 }}><div className="wrap">
        {tiers.length ? tiers.map((t) => (
          <div className="tier" key={t}>
            <h2 style={{ fontSize: '1.6rem' }}>{t}{/s$/i.test(t) ? '' : 's'}</h2>
            <div className="grid g3">
              {c.sponsors.filter((s) => (s.tier || 'Partner') === t).map((s, i) => {
                const u = safeUrl(s.url);
                return (
                  <div className="card logo-card" key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {s.logo && <div className="sp-logo"><img src={mediaUrl(s.logo)} alt={`${s.name} logo`} /></div>}
                    <div className="logo-word">{s.name}</div>
                    <p className="muted" style={{ margin: '0 0 8px', fontSize: '.98rem' }}>{s.text}</p>
                    {u && <a href={u} target="_blank" rel="noopener noreferrer">Visit website →</a>}
                  </div>
                );
              })}
            </div>
          </div>
        )) : <div className="empty">Partner details coming soon.</div>}
        <div className="note">Want to sponsor refreshments, prizes or materials? Contact us: {c.event.contact.split('\n')[0]}</div>
      </div></section>
    </>
  );
}
