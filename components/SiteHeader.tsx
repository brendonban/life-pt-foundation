'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavSettings } from '@/lib/types';

const NAV: [keyof NavSettings, string, string][] = [
  ['about', '/about', 'About'], ['speakers', '/speakers', 'Speakers'], ['sponsors', '/sponsors', 'Sponsors'],
  ['schedule', '/schedule', 'Schedule'], ['directory', '/directory', 'Directory'], ['gettingHere', '/getting-here', 'Getting Here'],
];

export default function SiteHeader({ nav }: { nav: NavSettings }) {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    document.body.classList.toggle('admin-mode', path.startsWith('/admin'));
    document.body.classList.toggle('on-register', path.startsWith('/register'));
  }, [path]);

  return (
    <header className="site">
      <div className="wrap bar">
        <Link className="brand" href="/">
          <span className="brand-dot" aria-hidden="true" />
          <span>LIFE<span className="plus">+</span> <span className="brand-sub" style={{ fontWeight: 500 }}>Healthy Ageing with HIV</span></span>
        </Link>
        <button className="menu-btn" aria-expanded={open} aria-controls="mainNav" onClick={() => setOpen((o) => !o)}>Menu</button>
        <nav className={`main${open ? ' open' : ''}`} id="mainNav" aria-label="Main">
          {NAV.filter(([k]) => nav[k] !== false).map(([k, href, label]) => (
            <Link key={k} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>
          ))}
          {nav.signup !== false && <Link href="/register" className="cta" aria-current={path === '/register' ? 'page' : undefined}>Sign Up</Link>}
        </nav>
      </div>
    </header>
  );
}
