'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Content, MailRecord, Signup } from '@/lib/types';
import { ATTEND_OPTIONS, fillVars } from '@/lib/util';
import { emailInner, varsFor } from '@/lib/emailTemplate';
import { fmtDate, useUI } from './ui';
import type { Api } from './Editors';

const STATUS_OPTS: [string, string][] = [['active', 'Everyone except cancelled'], ['all', 'Everyone'], ['registered', 'Registered'], ['confirmed', 'Confirmed'], ['attended', 'Attended'], ['cancelled', 'Cancelled']];
const BADGE: Record<string, [string, string]> = { SENT: ['Sent', 'ok'], FAILED: ['Failed', 'bad'], PREVIEW: ['Not sent (email not set up)', ''] };

export default function EmailPanel({ signups, content, api, mailConfigured, demo, onSaveConfirm }: {
  signups: Signup[] | null; content: Content; api: Api; mailConfigured: boolean; demo: boolean;
  onSaveConfirm: (e: Content['emails']) => Promise<void>;
}) {
  const { toast, confirm } = useUI();
  const [status, setStatus] = useState('active'), [attend, setAttend] = useState('');
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const [tpl, setTpl] = useState(''), [subject, setSubject] = useState(''), [body, setBody] = useState('');
  const [log, setLog] = useState<MailRecord[] | null>(null);
  const [sending, setSending] = useState<string>('');
  const [conf, setConf] = useState(content.emails);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const matches = useMemo(() => (signups || []).filter((s) => s.email
    && (status === 'all' || (status === 'active' ? s.status !== 'cancelled' : (s.status || 'registered') === status))
    && (!attend || s.attendAs === attend)), [signups, status, attend]);
  const sel = selected ?? new Set(matches.map((s) => s.id));
  const chosen = matches.filter((s) => sel.has(s.id));
  const sample: Partial<Signup> = chosen[0] || matches[0] || { name: 'Auntie Lim' };
  const site = typeof window !== 'undefined' ? window.location.origin : '';

  const loadLog = () => api<MailRecord[]>('/api/admin/mail').then(setLog).catch(() => setLog([]));
  useEffect(() => { loadLog(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  if (!signups) return <div className="card">Loading sign-ups…</div>;

  const pickTemplate = async (v: string) => {
    if ((subject || body) && !(await confirm('Replace your current message with this template?'))) return;
    setTpl(v);
    if (v === '') { setSubject(''); setBody(''); }
    else if (v === 'confirm') { setSubject(content.emails.confirmSubject); setBody(content.emails.confirmBody); }
    else { const t = content.emails.templates[+v]; setSubject(t.subject); setBody(t.body); }
  };
  const insertVar = (name: string) => {
    const ta = bodyRef.current; const ins = `{{${name}}}`;
    const st = ta?.selectionStart ?? body.length, en = ta?.selectionEnd ?? st;
    const next = body.slice(0, st) + ins + body.slice(en); setBody(next);
    requestAnimationFrame(() => { if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = st + ins.length; } });
  };
  const send = async () => {
    if (!subject.trim() || !body.trim()) { toast('Add a subject and a message first'); return; }
    const n = chosen.length;
    if (!(await confirm(`Send “${fillVars(subject, varsFor(chosen[0], content))}” to ${n} ${n === 1 ? 'person' : 'people'}? Each person gets their own copy.`))) return;
    const ids = chosen.map((s) => s.id); let ok = 0, failed = 0;
    try {
      for (let i = 0; i < ids.length; i += 25) {
        setSending(`Sending ${Math.min(i + 25, ids.length)} of ${ids.length}…`);
        const r = await api<{ results: { state: string }[] }>('/api/admin/email', { method: 'POST', body: { ids: ids.slice(i, i + 25), subject, body } });
        r.results.forEach((x) => (x.state === 'FAILED' ? failed++ : ok++));
      }
      toast(failed ? `${ok} sent, ${failed} failed. See the sent log.` : mailConfigured ? `Sent ${ok} email${ok === 1 ? '' : 's'}.` : `Logged ${ok} (email isn't set up yet, so nothing was delivered).`);
      setSubject(''); setBody(''); setTpl('');
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not send'); }
    finally { setSending(''); loadLog(); }
  };

  const v = varsFor(sample, content);
  return (
    <>
      <h3 style={{ fontSize: '1.5rem' }}>Email participants</h3>
      {!mailConfigured && (
        <div className="note" style={{ marginBottom: 18 }}>
          {demo ? 'Preview mode: ' : ''}Email sending isn&apos;t set up yet, so messages are listed in the sent log but not delivered. Add your Gmail settings (see README) to start sending.
        </div>
      )}
      <div className="card mail-card">
        <h4 className="mail-h"><span className="step-n sm">1</span> Who gets it</h4>
        <div className="item-fields">
          <div><label htmlFor="m_status">Status</label><select id="m_status" value={status} onChange={(e) => { setStatus(e.target.value); setSelected(null); }}>{STATUS_OPTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label htmlFor="m_attend">Joining as</label><select id="m_attend" value={attend} onChange={(e) => { setAttend(e.target.value); setSelected(null); }}><option value="">Everyone</option>{ATTEND_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select></div>
        </div>
        <div className="rcpt-tools">
          <span><b>{chosen.length}</b> of {matches.length} selected</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set(matches.map((s) => s.id)))}>Select all</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
        <div className="rcpt-list">
          {matches.length ? matches.map((s) => (
            <label className="rcpt" key={s.id}>
              <input type="checkbox" checked={sel.has(s.id)} onChange={(e) => { const n = new Set(sel); if (e.target.checked) n.add(s.id); else n.delete(s.id); setSelected(n); }} />
              <span className="rc-name">{s.preferredName || s.name}</span><span className="rc-mail">{s.email}</span><span className="rc-st">{s.status || 'registered'}</span>
            </label>
          )) : <p className="muted" style={{ margin: 12 }}>Nobody matches. Try another filter.</p>}
        </div>
      </div>

      <div className="card mail-card">
        <h4 className="mail-h"><span className="step-n sm">2</span> Write the message</h4>
        <div className="field" style={{ marginBottom: 14 }}><label htmlFor="m_tpl">Start from a template</label>
          <select id="m_tpl" value={tpl} onChange={(e) => pickTemplate(e.target.value)}>
            <option value="">Blank message</option>
            {content.emails.templates.map((t, i) => <option key={i} value={String(i)}>{t.name}</option>)}
            <option value="confirm">Registration confirmation (resend)</option>
          </select></div>
        <div className="field" style={{ marginBottom: 14 }}><label htmlFor="m_subject">Subject</label><input type="text" id="m_subject" maxLength={200} value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div className="field" style={{ marginBottom: 10 }}><label htmlFor="m_body">Message</label><textarea id="m_body" ref={bodyRef} rows={11} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div className="vars"><span className="muted">Insert:</span>{['name', 'date', 'time', 'venue'].map((n) => <button type="button" key={n} className="chip" onClick={() => insertVar(n)}>{`{{${n}}}`}</button>)}</div>
        <p className="muted" style={{ fontSize: '.85rem', margin: '8px 0 0' }}>These fill in automatically for each person. {'{{name}}'} uses the name they asked us to call them.</p>
      </div>

      <div className="card mail-card">
        <h4 className="mail-h"><span className="step-n sm">3</span> Preview <span className="muted" style={{ fontWeight: 400, fontSize: '.9rem' }}>as {v.name} will see it</span></h4>
        <div className="mail-subj"><span className="muted">Subject:</span> {fillVars(subject, v) || '(no subject)'}</div>
        <div className="mail-preview" dangerouslySetInnerHTML={{ __html: emailInner(fillVars(body, v) || ' ', content.event.organisers, site) }} />
      </div>

      <div className="savebar mail-bar">
        <span className="msg">{sending || (chosen.length ? `Ready to send to ${chosen.length} ${chosen.length === 1 ? 'person' : 'people'}.` : 'Choose at least one person.')}</span>
        <button className="btn btn-ghost btn-sm" style={{ borderColor: '#fff', color: '#fff' }} onClick={async () => {
          try { await navigator.clipboard.writeText(chosen.map((s) => s.email).join(', ')); toast('Addresses copied. Paste them into BCC.'); } catch { toast('Copy was blocked by the browser'); }
        }}>Copy addresses</button>
        <button className="btn btn-primary btn-sm" disabled={!chosen.length || !!sending} onClick={send}>{sending ? 'Sending…' : 'Send email'}</button>
      </div>

      <div className="card mail-card" style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h4 className="mail-h" style={{ margin: 0, flex: 1 }}>Sent emails</h4>
          <button className="btn btn-ghost btn-sm" onClick={() => { setLog(null); loadLog(); }}>Refresh</button>
        </div>
        <div style={{ marginTop: 14 }}>
          {!log ? <p className="muted">Loading…</p> : !log.length ? <p className="muted">No emails sent yet.</p> : (
            <div className="table-wrap"><table>
              <thead><tr><th>When</th><th>To</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>{log.map((m) => {
                const b = BADGE[m.state] || [m.state, ''];
                return <tr key={m.id}><td>{fmtDate(m.createdAt)}</td><td>{m.to}</td><td>{m.subject}{m.kind === 'confirmation' && <span className="muted"> (auto)</span>}</td>
                  <td><span className={`badge ${b[1]}`}>{b[0]}</span>{m.error && <div className="err" style={{ margin: '4px 0 0' }}>{m.error}</div>}</td></tr>;
              })}</tbody>
            </table></div>
          )}
        </div>
      </div>

      <div className="card mail-card">
        <h4 className="mail-h">Automatic confirmation email</h4>
        <p className="muted" style={{ fontSize: '.95rem' }}>Sent straight away to everyone who signs up. You can use {'{{name}}'}, {'{{date}}'}, {'{{time}}'} and {'{{venue}}'}.</p>
        <label className="check" style={{ marginBottom: 14 }}><input type="checkbox" checked={conf.autoConfirm} onChange={(e) => setConf({ ...conf, autoConfirm: e.target.checked })} /> <span>Send a confirmation email when someone signs up</span></label>
        <div className="field" style={{ marginBottom: 14 }}><label htmlFor="c_subj">Subject</label><input type="text" id="c_subj" maxLength={200} value={conf.confirmSubject} onChange={(e) => setConf({ ...conf, confirmSubject: e.target.value })} /></div>
        <div className="field" style={{ marginBottom: 14 }}><label htmlFor="c_body">Message</label><textarea id="c_body" rows={9} value={conf.confirmBody} onChange={(e) => setConf({ ...conf, confirmBody: e.target.value })} /></div>
        <button className="btn btn-teal btn-sm" onClick={async () => { try { await onSaveConfirm(conf); toast('Confirmation settings saved'); } catch (e) { toast(e instanceof Error ? e.message : 'Could not save'); } }}>Save confirmation settings</button>
      </div>
    </>
  );
}
