'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/lib/media';

type Props = {
  asset?: MediaAsset;
  className?: string;
  label?: string;
  eyebrow?: string;
  eager?: boolean;
  objectPosition?: string;
  controls?: boolean;
};

export function CinematicMedia({ asset, className = '', label, eyebrow, eager = false, objectPosition = 'center', controls = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!asset || asset.kind !== 'video' || controls || !videoRef.current) return;
    const video = videoRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
        void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      } else {
        video.pause();
        setPlaying(false);
      }
    }, { threshold: [0, 0.55, 0.8] });
    observer.observe(video);
    return () => observer.disconnect();
  }, [asset, controls]);

  if (!asset) return null;

  return (
    <figure className={`cinematic-media ${className}`.trim()}>
      <div className="cinematic-media-frame">
        {asset.kind === 'video' ? (
          <video
            ref={videoRef}
            src={asset.src}
            muted={!controls}
            loop={!controls}
            playsInline
            controls={controls}
            preload={eager ? 'auto' : 'metadata'}
            style={{ objectPosition }}
          />
        ) : (
          <img
            src={asset.src}
            alt={label || asset.label}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
            style={{ objectPosition }}
          />
        )}
        {asset.kind === 'video' && !controls ? <span className="media-state">{playing ? 'MOTION' : 'READY'}</span> : null}
      </div>
      {(label || eyebrow) ? (
        <figcaption>
          <span>{eyebrow || (asset.kind === 'video' ? 'MOTION' : 'STILL')}</span>
          <strong>{label || asset.label}</strong>
        </figcaption>
      ) : null}
    </figure>
  );
}
