import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-mark">SCK AVIATION</div>
      <div className="site-footer-links">
        <Link href="/aircraft">Black Star</Link>
        <Link href="/atelier">Atelier</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/design-philosophy">Design</Link>
        <Link href="/about">About</Link>
        <Link href="/access">Make an enquiry</Link>
      </div>
      <div className="site-footer-meta">
        <span>VIENNA</span>
        <span>ATTITUDE WITH ALTITUDE.</span>
      </div>
    </footer>
  );
}
