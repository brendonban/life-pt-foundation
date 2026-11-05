import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap page-head">
      <div className="eyebrow">Page not found</div>
      <h1>We couldn&apos;t find that page</h1>
      <p className="lede">It may have moved. Try the home page or the schedule.</p>
      <div className="hero-actions"><Link className="btn btn-primary" href="/">Go home</Link><Link className="btn btn-ghost" href="/schedule">See the schedule</Link></div>
    </div>
  );
}
