import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import { initials, mediaUrl, SPEAKER_CATEGORIES } from '@/lib/util';
import type { Speaker } from '@/lib/types';

export const metadata: Metadata = { title: 'Speakers' };

export default async function Speakers() {
  const c = await getContent();
  // Group by role at the event, most senior first; unknown roles go after the known ones.
  const groups = new Map<string, Speaker[]>();
  c.speakers.forEach((s) => { const k = (s.category || 'Speaker').trim(); if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(s); });
  const rank = (k: string) => { const i = SPEAKER_CATEGORIES.indexOf(k); return i === -1 ? 99 : i; };
  const ordered = [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0]));
  const plural = (k: string, n: number) => {
    if (n < 2 || /s$/i.test(k)) return k;
    const m = /^(\w+)( of .+)$/i.exec(k); // "Guest of Honour" -> "Guests of Honour"
    return m ? `${m[1]}s${m[2]}` : `${k}s`;
  };
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Speakers</div>
        <h1>Voices of LIFE<span className="plus">+</span></h1>
        <p className="lede">Our panel brings together clinical, caregiving and lived experience. Participants&apos; questions shape the conversation.</p>
      </div>
      <section style={{ paddingTop: 20 }}><div className="wrap">
        {c.speakers.length ? (
          <>{ordered.map(([cat, list]) => (
            <div className="speaker-group" key={cat}>
              <h2 className="team-label">{plural(cat, list.length)}</h2>
          <div className="speaker-grid">
            {list.map((s, i) => (
              <div className="card speaker-card" key={i}>
                <div className="speaker-photo">
                  <div className="tm-initials" aria-hidden="true">{initials(s.name)}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {s.photo && <img src={mediaUrl(s.photo)} alt={`Photo of ${s.name}`} loading="lazy" />}
                </div>
                <div className="speaker-body">
                  {s.session && <span className="tag coral">{s.session}</span>}
                  <h3 style={{ marginTop: 10 }}>{s.name}</h3>
                  <div className="role">{s.title}{s.org ? ` · ${s.org}` : ''}</div>
                  <p className="muted" style={{ margin: '8px 0 0', fontSize: '.98rem' }}>{s.bio}</p>
                </div>
              </div>
            ))}
          </div>
            </div>
          ))}</>
        ) : (
          <div className="empty soon">
            <div className="soon-dot" aria-hidden="true" />
            <h3>Speakers coming soon</h3>
            <p className="muted" style={{ margin: '0 auto 18px', maxWidth: 520 }}>Our Beyond the Diagnosis panel will bring together a clinician, a caregiver and a person living with HIV. We&apos;ll share who&apos;s speaking here soon.</p>
            <Link className="btn btn-ghost btn-sm" href="/register">Save your place</Link>
          </div>
        )}
      </div></section>
    </>
  );
}
