'use client';
import { useRef, useState } from 'react';
import type { SponsorAsk } from '@/lib/types';

const CREDIT = ['Logo and name', 'Name only', 'Please keep us anonymous'];

export default function SponsorForm({ asks, thankYou }: { asks: SponsorAsk[]; thankYou: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(form.current!);
    const t = (k: string) => String(fd.get(k) || '').trim();
    const data = {
      name: t('name'), organisation: t('organisation'), email: t('email').toLowerCase(), phone: t('phone'),
      offers: fd.getAll('offers').map(String), details: t('details'), credit: t('credit'), website: t('website'),
      consent: fd.get('consent') === 'on', company: t('company'),
    };
    const problems: string[] = []; let first = '';
    const need = (ok: boolean, label: string, id: string) => { if (!ok) { problems.push(label); first ||= id; } };
    need(!!data.name, 'your name', 's_name');
    need(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(data.email), 'a valid email address', 's_email');
    need(!data.phone || /^[+\d][\d\s\-()]{6,}$/.test(data.phone), 'a valid phone number (or leave it blank)', 's_phone');
    need(data.offers.length > 0, 'at least one way you would like to help', 's_offer0');
    need(!!data.details, 'a few words about what you can offer', 's_details');
    if (data.website && !/^https?:\/\//i.test(data.website)) data.website = 'https://' + data.website;
    need(data.consent, 'your agreement to be contacted', 's_consent');
    if (problems.length) {
      setErr(`Please add ${problems.join(', ')}.`);
      const el = document.getElementById(first); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); el?.focus({ preventScroll: true });
      return;
    }
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/sponsor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Something went wrong sending your offer.');
      setDone(data.name);
      document.getElementById('become-a-sponsor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again, or contact us on WhatsApp.');
    } finally { setBusy(false); }
  }

  if (done) return (
    <div className="card form-card success" role="status">
      <div className="big-emoji" aria-hidden="true">💝</div>
      <h2>Thank you, {done}!</h2>
      <p className="lede" style={{ margin: '0 auto' }}>{thankYou} We&apos;ve also sent a copy to your email.</p>
    </div>
  );

  return (
    <form className="card form-card" ref={form} noValidate onSubmit={submit}>
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="s_name">Your name</label><input type="text" id="s_name" name="name" maxLength={120} autoComplete="name" required /></div>
        <div className="field"><label htmlFor="s_org">Organisation <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label><input type="text" id="s_org" name="organisation" maxLength={160} autoComplete="organization" /></div>
      </div>
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="s_email">Email</label><input type="email" id="s_email" name="email" maxLength={200} autoComplete="email" inputMode="email" required placeholder="name@example.com" /></div>
        <div className="field"><label htmlFor="s_phone">Phone / WhatsApp <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label><input type="tel" id="s_phone" name="phone" maxLength={40} autoComplete="tel" inputMode="tel" /></div>
      </div>
      <fieldset className="field"><legend>I&apos;d like to help with</legend>
        <div className="offer-grid">{asks.map((a, i) => (
          <label className="check" key={a.title}><input type="checkbox" id={`s_offer${i}`} name="offers" value={a.title} /> <span><span aria-hidden="true">{a.emoji}</span> {a.title}</span></label>
        ))}
          <label className="check"><input type="checkbox" name="offers" value="Something else" /> <span><span aria-hidden="true">✨</span> Something else</span></label>
        </div>
      </fieldset>
      <div className="field"><label htmlFor="s_details">What can you offer?</label><span className="hint">For example: &ldquo;Lunch for 60 people&rdquo;, &ldquo;20 goodie bags&rdquo;, &ldquo;a health screening booth&rdquo;, or an amount.</span>
        <textarea id="s_details" name="details" maxLength={2000} required /></div>
      <div className="grid g2" style={{ gap: '0 22px' }}>
        <div className="field"><label htmlFor="s_credit">How should we thank you publicly?</label>
          <select id="s_credit" name="credit" defaultValue={CREDIT[0]}>{CREDIT.map((o) => <option key={o}>{o}</option>)}</select></div>
        <div className="field"><label htmlFor="s_web">Website <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label><input type="url" id="s_web" name="website" maxLength={300} placeholder="https://" /></div>
      </div>
      <div className="field"><label className="check"><input type="checkbox" name="consent" id="s_consent" required /> <span>The LIFE+ team may contact me about this offer. My details won&apos;t be shared with anyone else (PDPA).</span></label></div>
      <div className="err" role="alert">{err}</div>
      <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send my offer 💝'}</button>
      <div style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>
    </form>
  );
}
