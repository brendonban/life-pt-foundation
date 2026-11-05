'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Helpline } from '@/lib/types';

/** Floating "Need to talk now?" button (desktop), bottom bar (mobile), and the helpline panel. */
export default function TalkPanel({ helplines }: { helplines: Helpline[] }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const path = usePathname();

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); fabRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button ref={fabRef} className="talk-fab" aria-expanded={open} aria-controls="talkPanel" onClick={() => setOpen((o) => !o)}>Need to talk now?</button>
      <div className="mbar">
        <Link className="btn btn-signup" href="/register">Sign up</Link>
        <button className="btn btn-talk" type="button" aria-controls="talkPanel" onClick={() => setOpen((o) => !o)}>Need to talk?</button>
      </div>
      <div className="talk-panel" id="talkPanel" role="dialog" aria-modal="false" aria-labelledby="talkTitle" hidden={!open}>
        <button ref={closeRef} className="talk-close" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
        <h3 id="talkTitle">Need to talk now?</h3>
        <p className="muted" style={{ fontSize: '.95rem' }}>You don&apos;t have to wait for the event. These free, confidential lines are open now.</p>
        {helplines.map((h, i) => (
          <div className="talk-line" key={i}>
            <div className="who"><b>{h.name}</b><small>{h.hours}</small></div>
            <a className="num" href={`tel:${String(h.number).replace(/[^\d+]/g, '')}`}>{h.number}</a>
          </div>
        ))}
        <p className="muted" style={{ fontSize: '.85rem', margin: '12px 0 0' }}>Prefer to talk to the LIFE+ team? WhatsApp <b>@imbrendonban</b> or <b>@ibentities</b>.</p>
      </div>
    </>
  );
}
