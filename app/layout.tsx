import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getContent } from '@/lib/content';
import { DEMO } from '@/lib/store';
import SiteHeader from '@/components/SiteHeader';
import TalkPanel from '@/components/TalkPanel';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: { default: c.event.fullTitle, template: `%s · LIFE+` },
    description: 'LIFE+ : Healthy Ageing with HIV. A free one-day community event for adults of all ages living with HIV, and the people who support them. By Universiti Malaya, co-organised with PT Foundation and Ruang Malaysia.',
    openGraph: { title: c.event.fullTitle, description: c.event.tagline, type: 'website' },
  };
}

export const viewport: Viewport = { themeColor: '#FDFBF9', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await getContent();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {DEMO && <div className="demo-banner">Preview mode: data is saved on this computer only. Add your Firebase settings to go live (see README).</div>}
        <SiteHeader nav={c.nav} />
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="site">
          <div className="wrap">
            <div className="foot-grid">
              <div>
                <div className="foot-brand"><span className="brand-dot" aria-hidden="true" style={{ borderColor: '#fff' }} />LIFE<span className="plus">+</span></div>
                <p style={{ color: '#fff' }}>{c.event.fullTitle}. {c.event.tagline}</p>
                <p style={{ color: '#fff' }}>{c.event.organisers}</p>
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Explore</strong>
                <div style={{ display: 'grid', gap: 4, marginTop: 8 }}>
                  <a href="/about">About &amp; team</a><a href="/schedule">Schedule</a><a href="/directory">Support directory</a><a href="/getting-here">Getting here</a>
                </div>
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Contact</strong>
                <div style={{ marginTop: 8, whiteSpace: 'pre-line', color: '#fff' }}>{c.event.contact}</div>
              </div>
            </div>
            <div className="foot-bottom">
              <span>© {new Date().getFullYear()} LIFE+ · {c.event.organisers}</span>
              <a href="/admin">Admin</a>
            </div>
          </div>
        </footer>
        <TalkPanel helplines={c.helplines} />
      </body>
    </html>
  );
}
