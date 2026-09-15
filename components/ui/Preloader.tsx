'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import type { MediaAsset } from '@/lib/media';

type PreloaderProps = {
  onReady?: () => void;
  assets?: MediaAsset[];
};

export function Preloader({ onReady, assets = [] }: PreloaderProps) {
  const { progress, active } = useProgress();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [departed, setDeparted] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(100);

  const priorityAssets = useMemo(
    () => assets.filter((asset) => asset.priority).slice(0, 10),
    [assets],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setMinimumElapsed(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (priorityAssets.length === 0) {
      setMediaProgress(100);
      return;
    }

    let cancelled = false;
    let completed = 0;
    const cleanups: Array<() => void> = [];
    setMediaProgress(0);

    const markComplete = () => {
      if (cancelled) return;
      completed += 1;
      setMediaProgress(Math.round((completed / priorityAssets.length) * 100));
    };

    priorityAssets.forEach((asset) => {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        markComplete();
      };
      const timeout = window.setTimeout(settle, 8500);

      if (asset.kind === 'image') {
        const image = new Image();
        image.decoding = 'async';
        image.onload = settle;
        image.onerror = settle;
        image.src = asset.src;
        cleanups.push(() => {
          window.clearTimeout(timeout);
          image.onload = null;
          image.onerror = null;
        });
        return;
      }

      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.onloadeddata = settle;
      video.onerror = settle;
      video.src = asset.src;
      video.load();
      cleanups.push(() => {
        window.clearTimeout(timeout);
        video.onloadeddata = null;
        video.onerror = null;
        video.removeAttribute('src');
        video.load();
      });
    });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [priorityAssets]);

  const display = useMemo(() => {
    const graphicsProgress = active ? Math.min(99, Math.max(0, progress)) : 100;
    return Math.min(100, Math.round(graphicsProgress * 0.72 + mediaProgress * 0.28));
  }, [active, mediaProgress, progress]);

  const ready = minimumElapsed && !active && mediaProgress >= 100;

  useEffect(() => {
    if (!ready || departed) return;

    const id = window.setTimeout(() => {
      setDeparted(true);
      onReady?.();
    }, 720);

    return () => window.clearTimeout(id);
  }, [departed, onReady, ready]);

  return (
    <div className={`preloader${ready ? ' ready' : ''}${departed ? ' done' : ''}`} aria-hidden={departed}>
      <div className="preloader-atmosphere" />
      <div className="preloader-corners" aria-hidden="true">
        <span>OE-LSC / DIGITAL OBJECT</span>
        <span>VIENNA / 48.2082° N</span>
      </div>

      <div className="preloader-inner">
        <p className="preloader-kicker">SCK AVIATION</p>
        <div className="preloader-count" aria-live="polite">{display.toString().padStart(3, '0')}</div>
        <p className="preloader-status">{ready ? 'APPROACH CLEARED' : 'ALIGNING DETAILS...'}</p>
        <div className="preloader-line" aria-hidden="true">
          <span style={{ transform: `scaleX(${display / 100})` }} />
        </div>
        <p className="preloader-auto">{ready ? 'ENTERING AUTOMATICALLY' : 'PREPARING BLACK STAR'}</p>
      </div>

      <p className="preloader-footnote">A CINEMATIC INTRODUCTION TO BLACK STAR</p>
    </div>
  );
}
