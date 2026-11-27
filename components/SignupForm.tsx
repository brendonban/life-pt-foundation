'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ATTEND_OPTIONS } from '@/lib/util';

export const AGE = ['18–29', '30–39', '40–49', '50–59', '60–69', '70 and above'];
const DIET = ['Halal', 'Vegetarian', 'Vegan', 'Soft food', 'Diabetic-friendly', 'Food allergy (tell us below)'];
const PHOTO = ['I’m happy to appear in photos', 'Please don’t photograph me'];
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

const Opt = () => <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>;
const Step = ({ n, title }: { n: number; title: string }) => (
  <div className="form-step"><span className="step-n">{n}</span><div><h2>{title}</h2></div></div>
);

export default function SignupForm({ date }: { date: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [companions, setCompanions] = useState('0');
  const [attendAs, setAttendAs] = useState('');
  const needsOrg = /organisation|professional|vendor/i.test(attendAs);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ name: string; email: string; emailed: boolean; bookclub: boolean } | null>(null);

  // Keep any choices made before the page finished loading on a slow connection.
  useEffect(() => {
    const f = form.current; if (!f) return;
    const comp = f.elements.namedItem('companions') as HTMLSelectElement | null;
    if (comp && comp.value !== '0') setCompanions(comp.value);
    const checked = f.querySelector<HTMLInputElement>('input[name=attendAs]:checked');
    if (checked) setAttendAs(checked.value);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(form.current!);
    const t = (k: string) => String(fd.get(k) || '').trim();
    const data = {
      name: t('name'), ageGroup: t('ageGroup'), email: t('email').toLowerCase(), phone: t('phone'),
      attendAs: t('attendAs'), organisation: needsOrg ? t('organisation') : '',
      bookclub: fd.get('bookclub') === 'on',
      companions: parseInt(t('companions') || '0', 10) || 0, companion: t('companion'),
      diet: t('diet'), photoConsent: t('photoConsent'), notes: t('notes'),
      consent: fd.get('consent') === 'on', website: t('website'),
    };
    const problems: string[] = []; let first = '';
    const need = (ok: boolean, label: string, id: string) => { if (!ok) { problems.push(label); first ||= id; } };
    need(!!data.name, 'your full name', 'f_name');
    need(!!data.ageGroup, 'your age group', 'f_age');
    need(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email), 'a valid email address', 'f_email');
    need(PHONE_RE.test(data.phone), 'a valid phone number', 'f_phone');
    need(!!data.attendAs, 'how you are joining', 'f_attend0');
    need(!!data.photoConsent, 'your photo preference', 'f_photo0');
    need(data.consent, 'your agreement to the privacy note', 'f_consent');
    if (problems.length) {
      setErr(`Please add ${problems.join(', ')}.`);
      const el = document.getElementById(first); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); el?.focus({ preventScroll: true });
      return;
    }
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Something went wrong sending your form.');
      setDone({ name: data.name, email: data.email, emailed: !!json.emailed, bookclub: data.bookclub });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again, or contact us on WhatsApp.');
    } finally { setBusy(false); }
  }

  if (done) return (
    <div className="card form-card success" role="status">
      <div className="big" aria-hidden="true" />
      <h2>Thank you, {done.name}!</h2>
      <p className="lede" style={{ margin: '0 auto 18px' }}>
        Your place at LIFE+ on {date} is saved.{' '}
        {done.emailed ? <>We&apos;ve sent a confirmation to <b>{done.email}</b>. If you can&apos;t find it, check your spam or promotions folder.</> : <>We&apos;ll be in touch at {done.email}.</>}
      </p>
      {done.bookclub && <p className="note" style={{ margin: '0 auto 18px', maxWidth: 560 }}>📖 You&apos;ve asked to join the Book Club (11am–2pm). Seats are limited, so we&apos;ll confirm your spot by WhatsApp or email.</p>}
      <Link className="btn btn-ghost" href="/getting-here">How to get there</Link>
    </div>
  );

  return (
    <form className="card form-card" id="regForm" ref={form} noValidate onSubmit={submit}>
      <Step n={1} title="About you" />
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="f_name">Full name</label><input type="text" id="f_name" name="name" maxLength={120} required autoComplete="name" /></div>
        <div className="field"><label htmlFor="f_age">Age group</label>
          <select id="f_age" name="ageGroup" defaultValue="" required><option value="" disabled>Select your age group</option>{AGE.map((o) => <option key={o}>{o}</option>)}</select></div>
      </div>
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="f_email">Email</label><span className="hint">For your confirmation.</span><input type="email" id="f_email" name="email" maxLength={200} required autoComplete="email" inputMode="email" placeholder="name@example.com" /></div>
        <div className="field"><label htmlFor="f_phone">Phone / WhatsApp</label><span className="hint">In case we need to reach you.</span><input type="tel" id="f_phone" name="phone" maxLength={40} required autoComplete="tel" inputMode="tel" placeholder="012-345 6789" /></div>
      </div>

      <Step n={2} title="Joining LIFE+" />
      <fieldset className="field"><legend>I am joining as</legend>
        <div className="radios">{ATTEND_OPTIONS.map((o, i) => (
          <label className="check" key={o}><input type="radio" id={`f_attend${i}`} name="attendAs" value={o} required onChange={() => setAttendAs(o)} /> <span>{o}</span></label>
        ))}</div>
      </fieldset>
      {needsOrg && <div className="field"><label htmlFor="f_org">Organisation / company</label><input type="text" id="f_org" name="organisation" maxLength={160} /></div>}
      <label className="check bc-opt" htmlFor="f_bookclub">
        <input type="checkbox" id="f_bookclub" name="bookclub" />
        <span><b>Also join the Book Club</b> <span className="muted">(optional)</span><br />
          <span lang="zh-Hans">《被讨厌的勇气》体验式读书会</span> · 11am–2pm<br />
          <span className="muted">名額有限，報名從速 · Limited seats, register now. <Link href="/bookclub" target="_blank">More about the Book Club</Link></span></span>
      </label>
      <div className="grid g2" style={{ gap: '0 22px', marginTop: 18 }}>
        <div className="field"><label htmlFor="f_comp">Is anyone coming with you?</label>
          <select id="f_comp" name="companions" defaultValue="0" onChange={(e) => setCompanions(e.target.value)}>
            <option value="0">Just me</option><option value="1">1 person</option><option value="2">2 people</option>
          </select></div>
        <div className="field"><label htmlFor="f_diet">Dietary needs</label>
          <select id="f_diet" name="diet" defaultValue=""><option value="">No special needs</option>{DIET.map((o) => <option key={o}>{o}</option>)}</select></div>
      </div>
      {companions !== '0' && <div className="field"><label htmlFor="f_compn">Their name(s)</label><input type="text" id="f_compn" name="companion" maxLength={160} placeholder="e.g. My daughter, Mei Ling" /></div>}
      <fieldset className="field"><legend>Photos on the day</legend>
        <div className="radios">{PHOTO.map((o, i) => (
          <label className="check" key={o}><input type="radio" id={`f_photo${i}`} name="photoConsent" value={o} required /> <span>{o}</span></label>
        ))}</div>
      </fieldset>
      <div className="field"><label htmlFor="f_notes">Anything we should know? <Opt /></label><textarea id="f_notes" name="notes" maxLength={1000} placeholder="Allergies, access needs, or questions" /></div>

      <div className="field" style={{ marginTop: 22 }}>
        <label className="check"><input type="checkbox" name="consent" id="f_consent" required /> <span>I agree that the LIFE+ team may use these details to organise this event and contact me. They won&apos;t be shared with anyone else (PDPA).</span></label>
      </div>
      <div className="err" role="alert">{err}</div>
      <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Confirm my place'}</button>
      {/* honeypot for bots: hidden from people and screen readers */}
      <div style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
    </form>
  );
}
