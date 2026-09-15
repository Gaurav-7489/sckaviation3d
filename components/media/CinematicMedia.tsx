'use client';

import { useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/lib/media';
import '@/app/editorial-polish.css';

type Props = {
  asset?: MediaAsset;
  className?: string;
  label?: string;
  eyebrow?: string;
  eager?: boolean;
  objectPosition?: string;
  controls?: boolean;
  poster?: string;
};

const films: Record<string, { src: string; poster: string; aspect: number }> = {
  'vid-charter-feature-v1.mp4': { src: '/videos/charter.mp4', poster: '/images/charter-poster.webp', aspect: 9 / 16 },
  'vid-mi-opt-v1.mp4': { src: '/videos/atelier.mp4', poster: '/images/atelier-poster.webp', aspect: 1920 / 1012 },
  'charter.mp4': { src: '/videos/charter.mp4', poster: '/images/charter-poster.webp', aspect: 9 / 16 },
  'atelier.mp4': { src: '/videos/atelier.mp4', poster: '/images/atelier-poster.webp', aspect: 1920 / 1012 },
};

export function CinematicMedia({ asset, className = '', label, eyebrow, eager = false, objectPosition = 'center', controls = false, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [aspect, setAspect] = useState<number>();
  const [playbackError, setPlaybackError] = useState(false);
  const film = asset ? films[asset.filename] : undefined;
  const videoLabel = label || asset?.label || 'Aircraft film';

  useEffect(() => {
    const video = videoRef.current;
    if (asset?.kind !== 'video' || !video) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let disposed = false;
    const syncPlayback = () => {
      if (!inView || document.hidden || motion.matches) {
        video.pause();
      } else if (!controls && !userPaused.current) {
        void video.play().then(() => {
          if (disposed || document.hidden || !inView) video.pause();
        }).catch(() => undefined);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      syncPlayback();
    }, { threshold: [0, 0.35, 0.7] });
    observer.observe(video);
    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      motion.removeEventListener('change', syncPlayback);
      video.pause();
    };
  }, [asset?.kind, asset?.src, controls]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      void video.play().catch(() => setPlaybackError(true));
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  if (!asset) return null;
  const mediaStyle = { objectPosition, objectFit: 'contain' as const, transform: 'none', filter: 'none' };

  return (
    <figure className={`cinematic-media ${asset.kind === 'video' ? 'cinematic-film' : 'cinematic-still'} ${className}`.trim()}>
      <div className="cinematic-media-frame" style={{ aspectRatio: aspect || film?.aspect || undefined }}>
        {asset.kind === 'video' ? (
          <video
            ref={videoRef}
            src={film?.src || asset.src}
            muted={!controls}
            loop={!controls}
            playsInline
            controls={controls}
            poster={poster || film?.poster}
            preload={eager ? 'metadata' : 'none'}
            aria-label={videoLabel}
            style={mediaStyle}
            onLoadedMetadata={(event) => setAspect(event.currentTarget.videoWidth / event.currentTarget.videoHeight)}
            onPlay={() => { setPlaying(true); setPlaybackError(false); }}
            onPause={() => setPlaying(false)}
            onError={() => setPlaybackError(true)}
          />
        ) : (
          <img
            src={asset.src}
            alt={label || asset.label}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
            style={mediaStyle}
            onLoad={(event) => setAspect(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)}
          />
        )}
        {asset.kind === 'video' && !controls ? (
          <button type="button" className="media-playback" onClick={togglePlayback} aria-label={`${playing ? 'Pause' : 'Play'} ${videoLabel}`}>
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span> {playing ? 'Pause film' : 'Play film'}
          </button>
        ) : null}
        {playbackError ? <p className="media-error" role="status">The film could not play. <a href={film?.src || asset.src}>Open the film</a></p> : null}
      </div>
      {(label || eyebrow) ? (
        <figcaption>
          {eyebrow ? <span>{eyebrow}</span> : null}
          <strong>{label || asset.label}</strong>
        </figcaption>
      ) : null}
    </figure>
  );
}
