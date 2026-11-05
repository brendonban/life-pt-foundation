import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/content';
import { initials } from '@/lib/util';

export const metadata: Metadata = { title: 'Speakers' };

export default async function Speakers() {
  const c = await getContent();
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Speakers</div>
        <h1>Voices of LIFE<span className="plus">+</span></h1>
        <p className="lede">Our panel brings together clinical, caregiving and lived experience. Participants&apos; questions shape the conversation.</p>
      </div>
      <section style={{ paddingTop: 20 }}><div className="wrap">
        {c.speakers.length ? (
          <div className="grid g3">
            {c.speakers.map((s, i) => (
              <div className="card person" style={{ flexDirection: 'column' }} key={i}>
                <div className="avatar" aria-hidden="true">{initials(s.name)}</div>
                <div>
                  {s.session && <span className="tag coral">{s.session}</span>}
                  <h3 style={{ marginTop: 10 }}>{s.name}</h3>
                  <div className="role">{s.title}{s.org ? ` · ${s.org}` : ''}</div>
                  <p className="muted" style={{ margin: '8px 0 0', fontSize: '.98rem' }}>{s.bio}</p>
                </div>
              </div>
            ))}
          </div>
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
