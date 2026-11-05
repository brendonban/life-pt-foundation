import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import SignupForm from '@/components/SignupForm';

export const metadata: Metadata = { title: 'Sign up' };

export default async function Register() {
  const c = await getContent();
  const e = c.event;
  if (e.regOpen === false) return (
    <div className="wrap page-head">
      <div className="eyebrow">Sign up</div>
      <h1>Registration closed</h1>
      <p className="lede">{e.regClosedMessage}</p>
      <p style={{ whiteSpace: 'pre-line' }}>{e.contact}</p>
    </div>
  );
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">Sign up · {e.date}</div>
        <h1>Save your place at LIFE<span className="plus">+</span></h1>
        <p className="lede">It takes about 2 minutes. {e.rsvpNote}</p>
      </div>
      <section style={{ paddingTop: 8 }}><div className="wrap">
        <div className="note" style={{ maxWidth: 780, marginBottom: 22 }}>🔒 {e.privacyNote}</div>
        <SignupForm date={e.date} />
      </div></section>
    </>
  );
}
