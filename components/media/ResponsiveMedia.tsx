'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { MediaAsset, MediaCategory } from '@/lib/media';

function MediaTile({ asset, className = '' }: { asset: MediaAsset; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (asset.kind !== 'video' || !videoRef.current) return;
    const element = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          void element.play().catch(() => undefined);
        } else {
          element.pause();
        }
      },
      { threshold: [0, 0.35, 0.7] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [asset.kind]);

  return (
    <figure className={`media-tile ${className}`.trim()}>
      <div className="media-frame">
        {asset.kind === 'video' ? (
          <video
            ref={videoRef}
            src={asset.src}
            muted
            loop
            playsInline
            preload={asset.priority ? 'auto' : 'metadata'}
          />
        ) : (
          <img
            src={asset.src}
            alt={asset.label}
            loading={asset.priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}
        <span className="media-kind">{asset.kind === 'video' ? 'MOTION' : 'STILL'}</span>
      </div>
      <figcaption>
        <span>{asset.label}</span>
        <span>{asset.category}</span>
      </figcaption>
    </figure>
  );
}

export function ContextMedia({
  assets,
  categories,
  limit = 2,
}: {
  assets: MediaAsset[];
  categories: MediaCategory[];
  limit?: number;
}) {
  const selected = useMemo(
    () => assets.filter((asset) => categories.includes(asset.category)).slice(0, limit),
    [assets, categories, limit],
  );

  if (selected.length === 0) return null;

  return (
    <div className={`context-media-grid count-${selected.length}`}>
      {selected.map((asset, index) => (
        <MediaTile key={asset.src} asset={asset} className={index === 0 ? 'primary' : ''} />
      ))}
    </div>
  );
}

export function MediaArchive({ assets }: { assets: MediaAsset[] }) {
  const selected = useMemo(() => assets.slice(0, 12), [assets]);
  if (selected.length === 0) return null;

  return (
    <div className="media-archive-grid">
      {selected.map((asset, index) => (
        <MediaTile
          key={asset.src}
          asset={asset}
          className={index === 0 || index === 5 ? 'feature' : ''}
        />
      ))}
    </div>
  );
}
