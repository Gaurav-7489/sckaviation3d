import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteNav } from './SiteNav';
import '@/app/editorial-polish.css';

export function EditorialShell({
  eyebrow,
  title,
  intro,
  children,
  nextHref,
  nextLabel,
  image,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  children: ReactNode;
  nextHref: string;
  nextLabel: string;
  image?: { src: string; alt: string };
}) {
  return (
    <main id="main-content" className="editorial-page">
      <SiteNav visible />
      <header className={`page-hero ${image ? 'page-hero-with-image' : ''}`}>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-hero-copy">{intro}</p>
        {image ? <div className="page-hero-image"><img src={image.src} alt={image.alt} fetchPriority="high" decoding="async" /></div> : null}
      </header>
      {children}
      <div className="page-next">
        <p>Continue the story</p>
        <Link href={nextHref}>{nextLabel} <span aria-hidden="true">→</span></Link>
      </div>
      <SiteFooter />
    </main>
  );
}

export function PageSection({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="page-section">
      <div className="page-section-title"><span>{index}</span><h2>{title}</h2></div>
      <div className="page-section-content">{children}</div>
    </section>
  );
}
