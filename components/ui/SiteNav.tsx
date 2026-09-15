'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '/aircraft', label: 'Aircraft' },
  { href: '/atelier', label: 'Atelier' },
  { href: '/projects', label: 'Projects' },
  { href: '/journal', label: 'Journal' },
  { href: '/access', label: 'Enquire' },
];

export function SiteNav({ visible = true, muted = false }: { visible?: boolean; muted?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = requestAnimationFrame(() => menu.current?.querySelector<HTMLAnchorElement>('a')?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
      if (event.key === 'Tab') {
        const items = [trigger.current, ...Array.from(menu.current?.querySelectorAll<HTMLAnchorElement>('a') || [])].filter(Boolean) as HTMLElement[];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth > 900) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <nav className={`site-nav${visible ? ' visible' : ''}${muted ? ' muted' : ''}`} aria-label="Primary">
        <Link className="site-brand" href="/" aria-label="SCK Aviation home">SCK AVIATION</Link>
        <div className="site-nav-links">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}
        </div>
        <button
          ref={trigger}
          className="site-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? 'Close' : 'Menu'}</span><i aria-hidden="true" />
        </button>
      </nav>

      <div ref={menu} id="mobile-navigation" className={`mobile-nav${open ? ' open' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="mobile-nav-index" aria-hidden="true">SCK / SELECTIVELY</div>
        <div className="mobile-nav-links">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setOpen(false)}>
              <span>{String(index + 1).padStart(2, '0')}</span>{link.label}
            </Link>
          ))}
        </div>
        <div className="mobile-nav-foot">VIENNA / ATTITUDE WITH ALTITUDE</div>
      </div>
    </>
  );
}
