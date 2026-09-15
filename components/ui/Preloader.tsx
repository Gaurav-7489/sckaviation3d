'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';

type PreloaderProps = {
  onReady?: () => void;
};

export function Preloader({ onReady }: PreloaderProps) {
  const { progress, active } = useProgress();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [departed, setDeparted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMinimumElapsed(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  const display = useMemo(() => {
    if (!active && minimumElapsed) return 100;
    return Math.min(99, Math.max(0, Math.round(progress)));
  }, [active, minimumElapsed, progress]);

  const ready = minimumElapsed && !active;

  useEffect(() => {
    if (!ready || departed) return;

    const id = window.setTimeout(() => {
      setDeparted(true);
      onReady?.();
    }, 650);

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
