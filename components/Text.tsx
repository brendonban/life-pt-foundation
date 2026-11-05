import { boldParts } from '@/lib/util';

/** Renders text where **double stars** mark bold, without using raw HTML. */
export function Bold({ text }: { text: string }) {
  return <>{boldParts(text).map((p, i) => (p.b ? <b key={i}>{p.t}</b> : <span key={i}>{p.t}</span>))}</>;
}

/** Puts the "+" in brand colour. */
export function Plus({ text }: { text: string }) {
  const parts = String(text || '').split('+');
  return <>{parts.map((p, i) => <span key={i}>{p}{i < parts.length - 1 && <span className="plus">+</span>}</span>)}</>;
}

/** Text with line breaks preserved, paragraphs split on blank lines. */
export function Paras({ text, className }: { text: string; className?: string }) {
  return <>{String(text || '').split(/\n{2,}/).map((p, i) => (
    <p key={i} className={className}>{p.split('\n').map((l, j) => <span key={j}>{j > 0 && <br />}{l}</span>)}</p>
  ))}</>;
}

export function Lines({ text }: { text: string }) {
  return <>{String(text || '').split('\n').map((l, j) => <span key={j}>{j > 0 && <br />}{l}</span>)}</>;
}
