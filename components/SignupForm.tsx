'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ATTEND_OPTIONS } from '@/lib/util';

const AGE = ['18–29', '30–39', '40–49', '50–59', '60–69', '70 and above'];
const DIET = ['Halal', 'Vegetarian', 'Vegan', 'Soft food', 'Diabetic-friendly', 'Food allergy (tell us below)'];
const LANG = ['English', 'Bahasa Malaysia', '中文 (Mandarin / Cantonese)', 'தமிழ் (Tamil)'];
const ACCESS = ['Wheelchair or walking-aid access', 'Seated activities only', 'Large print materials', 'Hearing support', 'A quiet space to rest', 'Help getting to the venue'];
const HEARD = ['PT Foundation', 'Ruang Malaysia', 'Clinic or hospital', 'Friend or family', 'Social media / WhatsApp', 'Universiti Malaya', 'Other'];
const PHOTO = ['I’m happy to appear in photos', 'Please don’t photograph me'];
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

const Opt = () => <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>;
const Step = ({ n, title }: { n: number; title: string }) => (
  <div className="form-step"><span className="step-n">{n}</span><div><h2>{title}</h2></div></div>
);

export default function SignupForm({ date }: { date: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [attendAs, setAttendAs] = useState('');
  const [companions, setCompanions] = useState('0');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [done, setDone] = useState<{ name: string; email: string; emailed: boolean } | null>(null);
  const needsOrg = /organisation|professional/i.test(attendAs);

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
      name: t('name'), preferredName: t('preferredName'), email: t('email').toLowerCase(), phone: t('phone'),
      ageGroup: t('ageGroup'), attendAs: t('attendAs'), organisation: needsOrg ? t('organisation') : '',
      companions: parseInt(t('companions') || '0', 10) || 0, companion: t('companion'),
      language: t('language'), access: fd.getAll('access').map(String), diet: t('diet'),
      emergencyName: t('emergencyName'), emergencyPhone: t('emergencyPhone'),
      photoConsent: t('photoConsent'), heardFrom: t('heardFrom'), notes: t('notes'),
      consent: fd.get('consent') === 'on', website: t('website'),
    };
    const problems: string[] = []; let first = '';
    const need = (ok: boolean, label: string, id: string) => { if (!ok) { problems.push(label); first ||= id; } };
    need(!!data.name, 'your full name', 'f_name');
    need(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email), 'a valid email address', 'f_email');
    need(PHONE_RE.test(data.phone), 'a valid phone number', 'f_phone');
    need(!!data.attendAs, 'how you are joining', 'f_attend0');
    need(!!data.photoConsent, 'your photo preference', 'f_photo0');
    if (data.emergencyPhone && !PHONE_RE.test(data.emergencyPhone)) { setMoreOpen(true); need(false, 'a valid emergency contact phone (or leave it blank)', 'f_ep'); }
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
      setDone({ name: data.preferredName || data.name, email: data.email, emailed: !!json.emailed });
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
      <Link className="btn btn-ghost" href="/getting-here">How to get there</Link>
    </div>
  );

  return (
    <form className="card form-card" id="regForm" ref={form} noValidate onSubmit={submit}>
      <Step n={1} title="About you" />
      <div className="field"><label htmlFor="f_name">Full name</label><input type="text" id="f_name" name="name" maxLength={120} required autoComplete="name" /></div>
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="f_pref">What should we call you? <Opt /></label><input type="text" id="f_pref" name="preferredName" maxLength={60} autoComplete="nickname" placeholder="For your name tag" /></div>
        <div className="field"><label htmlFor="f_age">Age group <Opt /></label>
          <select id="f_age" name="ageGroup" defaultValue=""><option value="">Prefer not to say</option>{AGE.map((o) => <option key={o}>{o}</option>)}</select></div>
      </div>
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="f_email">Email</label><span className="hint">For your confirmation and reminders.</span><input type="email" id="f_email" name="email" maxLength={200} required autoComplete="email" inputMode="email" placeholder="name@example.com" /></div>
        <div className="field"><label htmlFor="f_phone">Phone / WhatsApp</label><span className="hint">In case we need to reach you on the day.</span><input type="tel" id="f_phone" name="phone" maxLength={40} required autoComplete="tel" inputMode="tel" placeholder="012-345 6789" /></div>
      </div>

      <Step n={2} title="Joining LIFE+" />
      <fieldset className="field"><legend>I am joining as</legend>
        <div className="radios">{ATTEND_OPTIONS.map((o, i) => (
          <label className="check" key={o}><input type="radio" id={`f_attend${i}`} name="attendAs" value={o} required onChange={() => setAttendAs(o)} /> <span>{o}</span></label>
        ))}</div>
      </fieldset>
      {needsOrg && <div className="field"><label htmlFor="f_org">Organisation / university</label><input type="text" id="f_org" name="organisation" maxLength={160} /></div>}
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="f_comp">Is anyone coming with you?</label>
          <select id="f_comp" name="companions" defaultValue="0" onChange={(e) => setCompanions(e.target.value)}>
            <option value="0">Just me</option><option value="1">1 person</option><option value="2">2 people</option>
          </select></div>
        {companions !== '0' && <div className="field"><label htmlFor="f_compn">Their name(s)</label><input type="text" id="f_compn" name="companion" maxLength={160} placeholder="e.g. My daughter, Mei Ling" /></div>}
      </div>
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="f_diet">Dietary needs</label>
          <select id="f_diet" name="diet" defaultValue=""><option value="">No special needs</option>{DIET.map((o) => <option key={o}>{o}</option>)}</select></div>
        <div className="field"><label htmlFor="f_lang">Preferred language</label>
          <select id="f_lang" name="language">{LANG.map((o) => <option key={o}>{o}</option>)}</select></div>
      </div>
      <fieldset className="field"><legend>Photos on the day</legend><span className="hint">We&apos;ll give you a sticker so photographers know your choice.</span>
        <div className="radios">{PHOTO.map((o, i) => (
          <label className="check" key={o}><input type="radio" id={`f_photo${i}`} name="photoConsent" value={o} required /> <span>{o}</span></label>
        ))}</div>
      </fieldset>

      <details className="more" open={moreOpen} onToggle={(e) => setMoreOpen((e.target as HTMLDetailsElement).open)}>
        <summary>Need support on the day, or anything else? <span className="muted">(optional)</span></summary>
        <div className="more-body">
          <fieldset className="field"><legend>Anything to help you take part comfortably?</legend>
            <div className="checks">{ACCESS.map((o) => <label className="check" key={o}><input type="checkbox" name="access" value={o} /> <span>{o}</span></label>)}</div>
          </fieldset>
          <div className="grid g2" style={{ gap: '0 22px' }}>
            <div className="field"><label htmlFor="f_en">Emergency contact name</label><input type="text" id="f_en" name="emergencyName" maxLength={120} /></div>
            <div className="field"><label htmlFor="f_ep">Emergency contact phone</label><input type="tel" id="f_ep" name="emergencyPhone" maxLength={40} inputMode="tel" /></div>
          </div>
          <div className="field"><label htmlFor="f_heard">How did you hear about LIFE+?</label>
            <select id="f_heard" name="heardFrom" defaultValue=""><option value="">Select</option>{HEARD.map((o) => <option key={o}>{o}</option>)}</select></div>
          <div className="field" style={{ marginBottom: 4 }}><label htmlFor="f_notes">Anything else we should know?</label><textarea id="f_notes" name="notes" maxLength={1000} placeholder="Allergies, questions, or anything that would help" /></div>
        </div>
      </details>

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
