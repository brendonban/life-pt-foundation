'use client';
import { useEffect, useRef, useState } from 'react';
import type { TeamMember } from '@/lib/types';
import { firstName, initials, mediaUrl, safeUrl, splitList } from '@/lib/util';
import { Lines, Paras } from './Text';

function Photo({ t, className }: { t: TeamMember; className: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={className}>
      <div className="tm-initials" aria-hidden="true">{initials(t.name)}</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {t.photo && !failed && <img src={mediaUrl(t.photo)} alt={`Photo of ${t.name}`} loading="lazy" onError={() => setFailed(true)} />}
    </div>
  );
}

export default function TeamGrid({ team }: { team: TeamMember[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const lastCard = useRef<HTMLButtonElement | null>(null);
  const n = team.length;

  useEffect(() => {
    const d = dlg.current; if (!d) return;
    if (idx !== null && !d.open) { try { d.showModal(); } catch { d.setAttribute('open', ''); } }
    if (idx === null && d.open) d.close();
  }, [idx]);

  const groups = new Map<string, { t: TeamMember; i: number }[]>();
  team.forEach((t, i) => { const g = (t.group || '').trim(); if (!groups.has(g)) groups.set(g, []); groups.get(g)!.push({ t, i }); });

  if (!n) return <div className="empty">Team details coming soon.</div>;
  const t = idx !== null ? team[idx] : null;
  const prev = idx !== null ? team[(idx - 1 + n) % n] : null, next = idx !== null ? team[(idx + 1) % n] : null;
  const wa = String(t?.whatsapp || '').trim(), waDigits = wa.replace(/[^\d]/g, '');
  const li = safeUrl(t?.linkedin);

  return (
    <>
      {[...groups.entries()].map(([g, members]) => (
        <div className="team-group" key={g}>
          <h3 className="team-label">{g ? `Our ${g}` : 'Team'} ({members.length})</h3>
          <div className="team-grid">
            {members.map(({ t, i }) => (
              <button type="button" className="tm-card" key={i} aria-haspopup="dialog" aria-label={`View profile: ${t.name}`}
                onClick={(e) => { lastCard.current = e.currentTarget; setIdx(i); }}>
                <Photo t={t} className="tm-photo" />
                <span className="tm-body">
                  <span className="tm-name">{t.name}</span>
                  <span className="tm-role">{t.role}</span>
                  {t.interests && <><span className="tm-label">Interests</span><span className="tm-int">{splitList(t.interests).join(', ')}</span></>}
                  <span className="tm-link">View profile <span className="arr" aria-hidden="true">→</span></span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <dialog ref={dlg} className="tm-dialog" aria-labelledby="tmName"
        onClose={() => { setIdx(null); lastCard.current?.focus({ preventScroll: true }); }}
        onClick={(e) => { if (e.target === dlg.current) setIdx(null); }}
        onKeyDown={(e) => {
          if (idx === null || n < 2) return;
          if (e.key === 'ArrowRight') setIdx((idx + 1) % n);
          if (e.key === 'ArrowLeft') setIdx((idx - 1 + n) % n);
        }}>
        {t && (
          <div className="tmd" key={idx}>
            <button type="button" className="tmd-close" aria-label="Close profile" autoFocus onClick={() => setIdx(null)}>✕</button>
            <Photo t={t} className="tmd-photo" />
            <div className="tmd-info">
              {t.group && <span className="tag">{t.group}</span>}
              <h2 id="tmName">{t.name}</h2>
              <div className="tmd-role">{t.role}</div>
              {t.affiliation && <div className="tmd-aff"><Lines text={t.affiliation} /></div>}
              {t.interests && <><div className="tm-label">Interests</div><div className="chips">{splitList(t.interests).map((x) => <span key={x}>{x}</span>)}</div></>}
              {t.bio && <><div className="tm-label">About</div><div className="tmd-bio"><Paras text={t.bio} /></div></>}
              {(t.email || wa || li) && <>
                <div className="tm-label">Get in touch</div>
                <div className="tmd-contact">
                  {t.email && <div><span className="muted">Email</span> <a href={`mailto:${t.email}`}>{t.email}</a></div>}
                  {wa && <div><span className="muted">WhatsApp</span> {waDigits.length >= 9 && !wa.startsWith('@') ? <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer">{wa}</a> : wa}</div>}
                  {li && <div><span className="muted">LinkedIn</span> <a href={li} target="_blank" rel="noopener noreferrer">View profile</a></div>}
                </div>
              </>}
              {n > 1 && prev && next && (
                <div className="tmd-nav">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIdx((idx! - 1 + n) % n)}>← {firstName(prev.name)}</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIdx((idx! + 1) % n)}>{firstName(next.name)} →</button>
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
