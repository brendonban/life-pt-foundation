import type { Metadata } from 'next';
import { getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Schedule' };

export default async function Schedule() {
  const c = await getContent();
  const periods = [...new Set(c.schedule.map((s) => s.period || ''))];
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Schedule · {c.event.date}</div>
        <h1>A day at LIFE<span className="plus">+</span></h1>
        <p className="lede">Highlighted sessions are hands-on or interactive. Every activity is optional, and there are rest breaks throughout.</p>
      </div>
      <section style={{ paddingTop: 0 }}><div className="wrap">
        {periods.map((p) => (
          <div key={p}>
            {p && <h2 className="period">{p}</h2>}
            <div className="sched">
              {c.schedule.filter((s) => (s.period || '') === p).map((s, i) => (
                <div className={`slot${s.highlight ? ' hl' : ''}`} key={i}>
                  <div className="time">{s.time}</div>
                  <div><h3>{s.title}</h3>{s.detail && <p>{s.detail}</p>}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div></section>
    </>
  );
}
