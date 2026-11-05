'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { LineOfSupport } from '@/lib/types';
import { Bold, Plus } from './Text';

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function TypedQuote({ quotes }: { quotes: string }) {
  const list = String(quotes || '').split('\n').map((q) => q.trim()).filter(Boolean)
    .map((q) => `“${q.replace(/^["“]|["”]$/g, '')}”`);
  const [text, setText] = useState('');
  useEffect(() => {
    if (!list.length) return;
    if (reduceMotion()) { setText(list[0]); return; }
    let qi = 0, ci = 0, del = false, t: ReturnType<typeof setTimeout>;
    const step = () => {
      const q = list[qi];
      if (!del) {
        ci++; setText(q.slice(0, ci));
        if (ci >= q.length) { del = true; t = setTimeout(step, 2600); return; }
        t = setTimeout(step, 42 + Math.random() * 40);
      } else {
        ci--; setText(q.slice(0, ci));
        if (ci <= 0) { del = false; qi = (qi + 1) % list.length; t = setTimeout(step, 450); return; }
        t = setTimeout(step, 18);
      }
    };
    t = setTimeout(step, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes]);
  if (!list.length) return null;
  return <p className="typed" aria-hidden="true"><span>{text}</span><span className="caret" /></p>;
}

const JITTER = [{ y: 6, r: -3 }, { y: -4, r: 2 }, { y: 8, r: -2 }, { y: -2, r: 3 }, { y: 5, r: -1 }];

export function LineOfSupportWidget({ line }: { line: LineOfSupport }) {
  const words = (s: string) => String(s || '').split(',').map((w) => w.trim()).filter(Boolean);
  const up = words(line.aboveWords), down = words(line.belowWords);
  const box = useRef<HTMLDivElement>(null), lineEl = useRef<HTMLDivElement>(null);
  const upEl = useRef<HTMLDivElement>(null), downEl = useRef<HTMLDivElement>(null), knob = useRef<HTMLButtonElement>(null);
  const [p, setPState] = useState(0);
  const pRef = useRef(0);
  const setP = (v: number) => { pRef.current = v; setPState(v); };
  const [anim, setAnim] = useState(false);
  const [geo, setGeo] = useState({ ly: 150, top: 92, bot: 210, kr: 41 });
  const interacted = useRef(false);
  const drag = useRef<{ startY: number; startP: number; moved: boolean } | null>(null);

  const measure = useCallback(() => {
    if (!lineEl.current || !upEl.current || !downEl.current || !knob.current) return;
    const ly = lineEl.current.offsetTop + 1.5;
    const upR = upEl.current.offsetTop + upEl.current.offsetHeight / 2;
    const dnR = downEl.current.offsetTop + Math.min(downEl.current.offsetHeight, 40) / 2;
    setGeo({ ly, top: Math.min(ly - 50, upR), bot: Math.max(ly + 50, dnR), kr: knob.current.offsetHeight / 2 });
  }, []);
  useLayoutEffect(() => { measure(); window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }, [measure]);

  const settle = (target: number) => { setAnim(true); setP(target); setTimeout(() => setAnim(false), 480); };

  // a gentle nudge so people notice it moves
  useEffect(() => {
    if (reduceMotion()) return;
    const t1 = setTimeout(() => { if (!interacted.current) { setAnim(true); setP(0.22); } }, 1800);
    const t2 = setTimeout(() => { if (!interacted.current) setP(0); }, 2450);
    const t3 = setTimeout(() => setAnim(false), 2950);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const y = geo.bot - p * (geo.bot - geo.top);
  const above = p > 0.5;
  const a = Math.min(y, geo.ly), b = Math.max(y, geo.ly);

  return (
    <>
      <div
        className={`lineplay${anim ? ' lp-anim' : ''}`}
        ref={box}
        onPointerDown={(e) => { interacted.current = true; drag.current = { startY: e.clientY, startP: pRef.current, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setAnim(false); }}
        onPointerMove={(e) => {
          const d = drag.current; if (!d) return;
          const dy = e.clientY - d.startY; if (Math.abs(dy) > 4) d.moved = true; if (!d.moved) return;
          setP(Math.max(0, Math.min(1, d.startP - dy / (geo.bot - geo.top))));
        }}
        onPointerUp={() => { const d = drag.current; drag.current = null; if (!d) return; const cur = pRef.current; settle(d.moved ? (cur > 0.5 ? 1 : 0) : (cur > 0.5 ? 0 : 1)); knob.current?.focus({ preventScroll: true }); }}
        onPointerCancel={() => { drag.current = null; settle(pRef.current > 0.5 ? 1 : 0); }}
      >
        <div className={`lp-words lp-up${above ? ' on' : ''}`} ref={upEl}>
          {up.map((w, i) => <span className="lp-word" key={i} style={{ opacity: 0.35 + 0.65 * p }}><Plus text={w} /></span>)}
        </div>
        <div className="lp-line" ref={lineEl} />
        <div className="lp-label">{line.label}</div>
        <div className="lp-words lp-down" ref={downEl}>
          {down.map((w, i) => {
            const j = JITTER[i % JITTER.length];
            return <span className="lp-word" key={i} style={{ opacity: 1 - 0.78 * p, transform: `translateY(${j.y * (1 - p)}px) rotate(${j.r * (1 - p)}deg)` }}>{w}</span>;
          })}
        </div>
        <div className="lp-thread" style={{ top: a, height: Math.max(0, b - a) }} />
        <button
          ref={knob} className="lp-knob" role="slider" style={{ top: y }}
          aria-label={`${line.label}. Use the up and down arrow keys.`}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}
          aria-valuetext={above ? 'Above the line' : 'Below the line'}
          onClick={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            let t: number | null = null; const k = e.key;
            const cur = pRef.current;
            if (k === 'ArrowUp' || k === 'ArrowRight' || k === 'PageUp') t = Math.min(1, cur + 0.25);
            if (k === 'ArrowDown' || k === 'ArrowLeft' || k === 'PageDown') t = Math.max(0, cur - 0.25);
            if (k === 'Home') t = 0; if (k === 'End') t = 1;
            if (k === 'Enter' || k === ' ') t = cur > 0.5 ? 0 : 1;
            if (t !== null) { e.preventDefault(); interacted.current = true; settle(t); }
          }}
        />
        <div className="lp-hint" style={{ top: above ? y - geo.kr - 28 : y + geo.kr + 4, opacity: interacted.current && p > 0.02 && p < 0.98 ? 0 : 1 }}>
          {above ? 'drag me down' : 'drag me up'}
        </div>
      </div>
      <p className="lp-caption" aria-live="polite"><Bold text={above ? line.aboveText : line.belowText} /></p>
    </>
  );
}
