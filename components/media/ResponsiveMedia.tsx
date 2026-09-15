'use client';

import { useMemo } from 'react';
import type { MediaAsset, MediaCategory } from '@/lib/media';
import { CinematicMedia } from './CinematicMedia';

function MediaTile({ asset, className = '' }: { asset: MediaAsset; className?: string }) {
  return <CinematicMedia asset={asset} className={`media-tile ${className}`} label={asset.label} controls={asset.kind === 'video'} />;
}

export function ContextMedia({ assets, categories, limit = 2 }: { assets: MediaAsset[]; categories: MediaCategory[]; limit?: number }) {
  const selected = useMemo(() => assets.filter((asset) => categories.includes(asset.category)).slice(0, limit), [assets, categories, limit]);
  if (!selected.length) return null;
  return <div className={`context-media-grid count-${selected.length}`}>{selected.map((asset, index) => <MediaTile key={asset.src} asset={asset} className={index === 0 ? 'primary' : ''} />)}</div>;
}

export function MediaArchive({ assets }: { assets: MediaAsset[] }) {
  const selected = useMemo(() => assets.slice(0, 12), [assets]);
  if (!selected.length) return null;
  return <div className="media-archive-grid">{selected.map((asset, index) => <MediaTile key={asset.src} asset={asset} className={index === 0 || index === 5 ? 'feature' : ''} />)}</div>;
}
