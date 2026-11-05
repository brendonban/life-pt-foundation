'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

interface UI { toast: (m: string) => void; confirm: (m: string) => Promise<boolean> }
const Ctx = createContext<UI>({ toast: () => {}, confirm: async () => false });
export const useUI = () => useContext(Ctx);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toastMsg, setToast] = useState('');
  const [ask, setAsk] = useState<{ msg: string; resolve: (v: boolean) => void } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((m: string) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 3200); }, []);
  const confirm = useCallback((msg: string) => new Promise<boolean>((resolve) => setAsk({ msg, resolve })), []);
  const answer = (v: boolean) => { ask?.resolve(v); setAsk(null); };
  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
      {ask && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) answer(false); }}>
          <div className="modal" role="dialog" aria-modal="true">
            <p>{ask.msg}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => answer(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" autoFocus onClick={() => answer(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Resizes an image in the browser before upload. Logos keep transparency (PNG/WebP). */
export async function resizeImage(file: File, max = 900, keepAlpha = false): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i);
      i.onerror = () => rej(new Error('This image type could not be read. Please use a JPG or PNG.')); i.src = url;
    });
    const sc = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
    const ctx = c.getContext('2d')!;
    if (keepAlpha) {
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const png = c.toDataURL('image/png'); if (png.length < 900_000) return png;
      const webp = c.toDataURL('image/webp', 0.9); if (webp.startsWith('data:image/webp') && webp.length < 900_000) return webp;
    }
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
    let q = 0.85, out = c.toDataURL('image/jpeg', q);
    while (out.length > 850_000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
    return out;
  } finally { URL.revokeObjectURL(url); }
}

export const fmtDate = (iso?: string) => {
  if (!iso) return ''; const d = new Date(iso);
  return isNaN(+d) ? iso : d.toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
