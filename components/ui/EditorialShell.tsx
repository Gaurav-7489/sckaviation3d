import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteNav } from './SiteNav';

export function EditorialShell({
  eyebrow,
  title,
  intro,
  children,
  nextHref,
  nextLabel,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  children: ReactNode;
  nextHref: string;
  nextLabel: string;
}) {
  return (
    <main className="editorial-page">
      <SiteNav visible />
      <header className="page-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-hero-copy">{intro}</p>
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
