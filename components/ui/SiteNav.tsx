'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const links = [
  { href: '/aircraft', label: 'Aircraft' },
  { href: '/atelier', label: 'Atelier' },
  { href: '/projects', label: 'Projects' },
  { href: '/journal', label: 'Journal' },
  { href: '/access', label: 'Access' },
];

export function SiteNav({ visible = true, muted = false }: { visible?: boolean; muted?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <nav className={`site-nav${visible ? ' visible' : ''}${muted ? ' muted' : ''}`} aria-label="Primary">
        <Link className="site-brand" href="/" aria-label="SCK Aviation home">SCK AVIATION</Link>
        <div className="site-nav-links">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </div>
        <button
          className="site-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? 'Close' : 'Menu'}</span><i aria-hidden="true" />
        </button>
      </nav>

      <div id="mobile-navigation" className={`mobile-nav${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="mobile-nav-index" aria-hidden="true">SCK / SELECTIVELY</div>
        <div className="mobile-nav-links">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              <span>{String(index + 1).padStart(2, '0')}</span>{link.label}
            </Link>
          ))}
        </div>
        <div className="mobile-nav-foot">VIENNA / ATTITUDE WITH ALTITUDE</div>
      </div>
    </>
  );
}
