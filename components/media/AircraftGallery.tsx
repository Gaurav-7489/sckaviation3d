'use client';

import { useRef } from 'react';
import type { MediaAsset } from '@/lib/media';
import { CinematicMedia } from './CinematicMedia';

export function AircraftGallery({ assets }: { assets: Array<{ asset?: MediaAsset; label: string }> }) {
  const track = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: reduced ? 'auto' : 'smooth' });
  }

  return (
    <div className="aircraft-gallery" aria-label="OE-LSC media gallery">
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
          <CinematicMedia key={`${item.label}-${index}`} asset={item.asset} label={item.label} eyebrow={`${String(index + 1).padStart(2, '0')} / BLACK STAR`} />
        ))}
      </div>
    </div>
  );
}
