'use client';
import { useState } from 'react';
import type { Sponsor } from '@/lib/types';
import { mediaUrl, safeUrl } from '@/lib/util';

function Tile({ s, hidden }: { s: Sponsor; hidden: boolean }) {
  const u = safeUrl(s.url);
  const inner = s.logo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={mediaUrl(s.logo)} alt={hidden ? '' : s.name} loading="lazy" />
    : <span className="pc-word">{s.name}</span>;
  const common = { className: 'pc-tile', title: s.name, ...(hidden ? { 'aria-hidden': true, tabIndex: -1 } : {}) };
  return u ? <a {...common} href={u} target="_blank" rel="noopener noreferrer">{inner}</a> : <div {...common}>{inner}</div>;
}

export default function PartnerCarousel({ sponsors }: { sponsors: Sponsor[] }) {
  const [paused, setPaused] = useState(false);
  const list = sponsors.filter((s) => s.name && s.showOnHome !== false);
  if (!list.length) return null;
  let set = list.slice(); while (set.length < 8) set = set.concat(list);
  const dur = Math.max(24, set.length * 4);
  return (
    <section className={`partners${paused ? ' paused' : ''}`} aria-labelledby="pcTitle">
      <div className="wrap pc-head">
        <div><div className="eyebrow">Our partners</div><h2 id="pcTitle">Made possible together</h2></div>
        <a className="btn btn-ghost btn-sm" href="/sponsors">All partners →</a>
      </div>
      <div className="pc-viewport">
        <div className="pc-track" style={{ ['--pc-dur' as string]: `${dur}s` }}>
          <div className="pc-set">{set.map((s, i) => <Tile key={i} s={s} hidden={i >= list.length} />)}</div>
          <div className="pc-set" aria-hidden="true">{set.map((s, i) => <Tile key={i} s={s} hidden />)}</div>
        </div>
      </div>
      <div className="wrap pc-ctrl">
        <button type="button" className="pc-pause" aria-pressed={paused} onClick={() => setPaused((x) => !x)}>{paused ? 'Play' : 'Pause'}</button>
      </div>
    </section>
  );
}
