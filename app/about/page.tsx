import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { Plus } from '@/components/Text';
import TeamGrid from '@/components/TeamGrid';

export const metadata: Metadata = { title: 'About & team' };

export default async function About() {
  const c = await getContent();
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">About LIFE+</div>
        <h1><Plus text={c.event.fullTitle} /></h1>
        <p className="lede">{c.event.intro}</p>
      </div>
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <h2>What LIFE<span className="plus">+</span> sets out to do</h2>
          <div className="grid g3" style={{ marginTop: 24 }}>
            {c.objectives.map((o, i) => (
              <div className="card" key={i}><div className="eyebrow" style={{ color: 'var(--teal)' }}>{String(i + 1).padStart(2, '0')}</div><h3>{o.title}</h3><p className="muted" style={{ margin: 0 }}>{o.text}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <h2>Who takes part</h2>
          <p className="lede">{c.event.places} places, by RSVP. Health professionals and students in medicine, nursing, psychology and counselling join as speakers, screeners and facilitators.</p>
          <div className="grid g3" style={{ marginTop: 24 }}>
            {c.audiences.map((a, i) => (
              <div className="card" key={i}><b style={{ fontFamily: 'var(--display)', fontSize: '2.8rem', color: 'var(--coral)', lineHeight: 1 }}>{a.number}</b><h3 style={{ marginTop: 10 }}>{a.title}</h3><p className="muted" style={{ margin: 0 }}>{a.text}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section id="team">
        <div className="wrap">
          <div className="eyebrow">Our team</div>
          <h2>The people behind LIFE<span className="plus">+</span></h2>
          <TeamGrid team={c.team} />
        </div>
      </section>
    </>
  );
}
