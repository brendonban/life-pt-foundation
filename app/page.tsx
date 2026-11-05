import Link from 'next/link';
import { getContent } from '@/lib/content';
import { Bold, Plus } from '@/components/Text';
import { LineOfSupportWidget, TypedQuote } from '@/components/Hero';
import PartnerCarousel from '@/components/PartnerCarousel';

export default async function Home() {
  const c = await getContent();
  const e = c.event;
  return (
    <>
      <section className="hero"><div className="wrap">
        <TypedQuote quotes={e.quotes} />
        <h1><Plus text={e.fullTitle} /></h1>
        <p className="credit"><Bold text={e.credit} /></p>
        <p className="lede">{e.intro}</p>
        <div className="meta">
          <span>{e.date}</span><span>{e.time}</span>
          <span>{e.venue}{e.venueNote ? ` (${e.venueNote.replace(/^venue\s*/i, '')})` : ''}</span>
          <span>{e.places} places · RSVP only</span>
        </div>
        <LineOfSupportWidget line={c.line} />
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/register">{e.regOpen !== false ? 'Sign up to attend' : 'Registration closed'}</Link>
          <Link className="btn btn-ghost" href="/about">Why it matters</Link>
          <Link className="btn btn-ghost" href="/schedule">See the schedule</Link>
        </div>
      </div></section>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="eyebrow">What LIFE+ stands for</div>
          <h2 style={{ marginBottom: 28 }}>Healthy ageing is more than medical care</h2>
          <div className="pillars">
            {c.pillars.map((p, i) => (
              <div className="pillar" key={i}><div className="letter"><Plus text={p.letter} /></div><div className="word">{p.word}</div><p>{p.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="eyebrow">What Malaysian research tells us</div>
          <h2>Hidden health needs behind good HIV control</h2>
          <p className="lede">Effective treatment means more people are reaching older age. Studies at Universiti Malaya Medical Centre show what that can bring.</p>
          <div className="grid g4" style={{ marginTop: 30 }}>
            {c.stats.map((s, i) => (
              <div className={`card stat${i === c.stats.length - 1 ? ' hot' : ''}`} key={i}><b>{s.figure}</b><p>{s.text}</p><cite>{s.source}</cite></div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="eyebrow">During the day</div>
          <h2>LIFE<span className="plus">+</span> Wellbeing Stations</h2>
          <p className="lede">Every activity is optional. Join in seated, with help, or simply by watching. Check-ins are voluntary, private and supervised, and they are not a diagnosis.</p>
          <div className="grid g3" style={{ marginTop: 30, gap: 28 }}>
            {c.stations.map((s, i) => {
              const fun = /fun|do/i.test(s.kind);
              return <div className={`card station${fun ? ' do' : ''}`} key={i}><span className="tag">{s.kind}</span><h3 style={{ marginTop: 8 }}><Plus text={s.name} /></h3><p className="muted" style={{ margin: 0 }}>{s.text}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section className="band-dark">
        <div className="wrap" style={{ display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 660 }}>
            <h2>Come as you are</h2>
            <p className="lede" style={{ margin: 0 }}>{e.privacyNote} Younger adults, caregivers, family and friends are all warmly welcome.</p>
          </div>
          <Link className="btn btn-rasp" href="/register">Save my place</Link>
        </div>
      </section>

      <PartnerCarousel sponsors={c.sponsors} />
    </>
  );
}
