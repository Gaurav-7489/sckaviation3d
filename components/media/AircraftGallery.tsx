'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/lib/media';
import { CinematicMedia } from './CinematicMedia';

export function AircraftGallery({ assets }: { assets: Array<{ asset?: MediaAsset; label: string }> }) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const move = useCallback((direction: -1 | 1) => {
    const element = track.current;
    if (!element) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const firstCard = element.querySelector<HTMLElement>('.cinematic-media');
    const styles = window.getComputedStyle(element);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0');
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : element.clientWidth * 0.85;

    element.scrollBy({
      left: direction * distance,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element || paused || !visible) return;
    if (window.innerWidth <= 720) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 32;
      if (atEnd) {
        element.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        move(1);
      }
    }, 3400);

    return () => window.clearInterval(timer);
  }, [move, paused, visible]);

  return (
    <div
      className="aircraft-gallery"
      aria-label="OE-LSC media gallery"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
    >
      <div className="aircraft-gallery-toolbar">
        <span>Explore the aircraft</span>
        <div>
          <button type="button" onClick={() => move(-1)} aria-label="Previous aircraft image">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Next aircraft image">→</button>
        </div>
      </div>
      <div
        className="aircraft-gallery-track"
        ref={track}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
      >
        {assets.filter((item) => item.asset).map((item, index) => (
          <CinematicMedia
            key={`${item.label}-${index}`}
            asset={item.asset}
            label={item.label}
            eyebrow={`${String(index + 1).padStart(2, '0')} / BLACK STAR`}
          />
        ))}
      </div>
    </div>
  );
}
