'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export function Preloader() {
  const { progress, active } = useProgress();
  const [minimumElapsed, setMinimumElapsed] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMinimumElapsed(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  const done = minimumElapsed && !active;
  const display = active ? Math.round(progress) : 100;

  return (
    <div className={`preloader${done ? ' done' : ''}`} aria-hidden={done}>
      <div className="preloader-inner">
        <div className="preloader-mark">SCK AVIATION</div>
        <div className="preloader-status">ALIGNING DETAILS... {display.toString().padStart(3, '0')}</div>
        <div className="preloader-line"><span style={{ transform: `scaleX(${display / 100})` }} /></div>
      </div>
    </div>
  );
}
