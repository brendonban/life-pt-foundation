'use client';
import { useState } from 'react';
import { blankItem, type Field, type Section } from './schema';
import { resizeImage, useUI } from './ui';
import { mediaUrl } from '@/lib/util';

type Obj = Record<string, unknown>;
export type Api = <T = unknown>(path: string, opts?: { method?: string; body?: unknown }) => Promise<T>;

function ImageField({ f, value, id, onChange, api }: { f: Field; value: string; id: string; onChange: (v: string) => void; api: Api }) {
  const { toast } = useUI();
  const [busy, setBusy] = useState(false);
  const w = f.logo ? 'logo' : 'photo';
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const data = await resizeImage(file, f.logo ? 600 : 900, !!f.logo);
      const { ref } = await api<{ ref: string }>('/api/admin/media', { method: 'POST', body: { data } });
      onChange(ref);
      toast(`${f.logo ? 'Logo' : 'Photo'} added. Click Publish changes to show it on the site.`);
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not upload that image'); }
    finally { setBusy(false); }
  }
  return (
    <div className="wide">
      <label htmlFor={id}>{f.label}</label>
      <div className="img-field">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className={`img-thumb${f.logo ? ' is-logo' : ''}`}>{value ? <img src={mediaUrl(value)} alt="" /> : <span>No {w}</span>}</div>
        <div>
          <label className={`btn btn-ghost btn-sm file-btn${busy ? ' busy' : ''}`}>
            {busy ? 'Uploading…' : value ? `Change ${w}` : `Upload ${w}`}
            <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>Remove</button>}
          <p className="muted" style={{ fontSize: '.82rem', margin: '8px 0 0' }}>
            {f.logo ? 'PNG with a transparent background looks best. Resized automatically.' : 'JPG or PNG. Portrait photos look best; resized automatically.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FieldInput({ f, value, path, onChange, api }: { f: Field; value: unknown; path: string; onChange: (v: unknown) => void; api: Api }) {
  const id = 'fld_' + path.replace(/\W/g, '_');
  if (f.type === 'image') return <ImageField f={f} value={String(value || '')} id={id} onChange={onChange} api={api} />;
  if (f.type === 'checkbox') return (
    <div className={f.wide ? 'wide' : ''}>
      <label className="check" style={{ fontSize: '.95rem' }}>
        <input type="checkbox" id={id} checked={Boolean(value ?? f.default)} onChange={(e) => onChange(e.target.checked)} /> {f.label}
      </label>
    </div>
  );
  const v = String(value ?? '');
  let input;
  if (f.type === 'textarea') input = <textarea id={id} value={v} onChange={(e) => onChange(e.target.value)} />;
  else if (f.type === 'select') {
    const opts = [...new Set([...(f.options || []), v].filter(Boolean))];
    input = <select id={id} value={v} onChange={(e) => onChange(e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
  } else input = <input id={id} type={f.type === 'url' ? 'url' : 'text'} value={v} onChange={(e) => onChange(e.target.value)} />;
  return <div className={f.wide ? 'wide' : ''}><label htmlFor={id}>{f.label}</label>{input}</div>;
}

export function ListEditor({ items, fields, path, titleKey, addLabel, onChange, api }: {
  items: Obj[]; fields: Field[]; path: string; titleKey: string; addLabel?: string; onChange: (v: Obj[]) => void; api: Api;
}) {
  const { confirm } = useUI();
  const set = (i: number, k: string, v: unknown) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i: number, d: number) => { const a = items.slice(); [a[i], a[i + d]] = [a[i + d], a[i]]; onChange(a); };
  return (
    <>
      {items.map((it, i) => (
        <div className="item-row" key={i}>
          <div className="item-head">
            <strong>{String(it[titleKey] || '(untitled)')}</strong>
            <button className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button className="icon-btn" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button className="icon-btn danger" aria-label="Delete" onClick={async () => { if (await confirm('Remove this item?')) onChange(items.filter((_, j) => j !== i)); }}>✕</button>
          </div>
          <div className="item-fields">
            {fields.map((f) => <FieldInput key={f.key} f={f} value={it[f.key]} path={`${path}.${i}.${f.key}`} onChange={(v) => set(i, f.key, v)} api={api} />)}
          </div>
        </div>
      ))}
      {!items.length && <div className="empty" style={{ padding: 24, marginBottom: 14 }}>Nothing here yet. The public page shows a “coming soon” message until you add something.</div>}
      <button className="btn btn-ghost btn-sm" onClick={() => onChange([...items, blankItem(fields)])}>+ Add {addLabel || 'item'}</button>
    </>
  );
}

export function SectionEditor({ s, draft, setDraft, api }: { s: Section; draft: Obj; setDraft: (key: string, v: unknown) => void; api: Api }) {
  const val = draft[s.path];
  if (s.kind === 'list') return (
    <ListEditor items={(val as Obj[]) || []} fields={s.fields} path={s.path} titleKey={s.title || 'name'} addLabel={s.addLabel} api={api}
      onChange={(v) => setDraft(s.path, v)} />
  );
  const o = (val as Obj) || {};
  return (
    <>
      <div className="card"><div className="item-fields">
        {s.fields.map((f) => <FieldInput key={f.key} f={f} value={o[f.key]} path={`${s.path}.${f.key}`} api={api} onChange={(v) => setDraft(s.path, { ...o, [f.key]: v })} />)}
      </div></div>
      {s.sub && <>
        <h3 style={{ marginTop: 28 }}>{s.sub.label}</h3>
        <ListEditor items={(o[s.sub.key] as Obj[]) || []} fields={s.sub.fields} path={`${s.path}.${s.sub.key}`} titleKey={s.sub.title} api={api}
          onChange={(v) => setDraft(s.path, { ...o, [s.sub!.key]: v })} />
      </>}
    </>
  );
}
