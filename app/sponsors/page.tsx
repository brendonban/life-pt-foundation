import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { mediaUrl, safeUrl } from '@/lib/util';
import SponsorForm from '@/components/SponsorForm';

export const metadata: Metadata = { title: 'Sponsors & partners' };

const TIER_EMOJI: Record<string, string> = {
  Organiser: '🎓', 'Co-organiser': '🤝', Sponsor: '💝', 'Supporting partner': '🌱', 'Community partner': '🏘️',
};

export default async function Sponsors() {
  const c = await getContent();
  const tiers = [...new Set(c.sponsors.map((s) => s.tier || 'Partner'))];
  const sp = c.sponsorship;
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Sponsors &amp; partners</div>
        <h1>With thanks to our partners</h1>
        <p className="lede">LIFE+ is made possible by organisations who believe everyone deserves to age with dignity.</p>
        <div className="hero-actions"><a className="btn btn-primary" href="#become-a-sponsor">Become a sponsor 💝</a><a className="btn btn-ghost" href="#what-we-need">See what we need</a></div>
      </div>

      <section style={{ paddingTop: 20 }}><div className="wrap">
        {tiers.length ? tiers.map((t) => (
          <div className="tier" key={t}>
            <h2 style={{ fontSize: '1.6rem' }}><span aria-hidden="true">{TIER_EMOJI[t] || '✨'} </span>{t}{/s$/i.test(t) ? '' : 's'}</h2>
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
      </div></section>

      <section className="band" id="what-we-need">
        <div className="wrap">
          <div className="eyebrow">Support LIFE+</div>
          <h2>What we&apos;re looking for</h2>
          <p className="lede">{sp.intro}</p>
          <div className="ask-grid">
            {c.sponsorAsks.map((a, i) => (
              <div className="ask-card" key={i}>
                <div className="ask-emoji" aria-hidden="true">{a.emoji}</div>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
            ))}
          </div>

          {c.sponsorPerks.length > 0 && (
            <div className="perks">
              <h3>What sponsors receive</h3>
              <ul>{c.sponsorPerks.map((p, i) => <li key={i}><span className="perk-emoji" aria-hidden="true">{p.emoji}</span><span>{p.text}</span></li>)}</ul>
            </div>
          )}
        </div>
      </section>

      <section id="become-a-sponsor">
        <div className="wrap">
          <div className="eyebrow">Sponsorship form</div>
          <h2>Offer your support</h2>
          {sp.formOpen === false ? (
            <div className="note" style={{ maxWidth: 780 }}>Sponsorship offers are closed for now. Thank you for your interest! You can still reach us: {c.event.contact.split('\n')[0]}</div>
          ) : (
            <>
              <p className="lede" style={{ marginBottom: 24 }}>Tell us how you&apos;d like to help. It takes about 2 minutes, and we&apos;ll reply within 3 working days.</p>
              <SponsorForm asks={c.sponsorAsks} thankYou={sp.thankYou} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
