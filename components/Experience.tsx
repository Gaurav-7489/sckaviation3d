'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExperienceCanvas } from './three/ExperienceCanvas';
import { Preloader } from './ui/Preloader';

const chapters = [
  { id: 'hero', index: '00', label: 'ATTITUDE' },
  { id: 'material', index: '01', label: 'MATERIAL' },
  { id: 'aircraft', index: '02', label: 'BLACK STAR' },
  { id: 'atelier', index: '03', label: 'ATELIER' },
  { id: 'access', index: '04', label: 'ACCESS' },
] as const;

const hotspots = [
  {
    id: 'paint',
    index: '01',
    label: 'MATTE / GLOSS',
    title: 'BLACK AS SURFACE',
    body: 'The production model will separate matte bodywork, gloss signature treatment and reflective trim so lighting can reveal each finish independently.',
    x: 54,
    y: 43,
  },
  {
    id: 'identity',
    index: '02',
    label: 'IDENTITY',
    title: 'OE-LSC',
    body: 'Registration and custom graphic details become inspectable design elements rather than decoration baked into a generic aircraft texture.',
    x: 67,
    y: 48,
  },
  {
    id: 'engine',
    index: '03',
    label: 'ENGINE',
    title: 'POWER, CONTROLLED',
    body: 'The final asset will preserve the G450 engine silhouette while using restrained reflections and edge light instead of exaggerated product-render effects.',
    x: 73,
    y: 39,
  },
] as const;

export function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [activeChapter, setActiveChapter] = useState('hero');
  const [exploreMode, setExploreMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<(typeof hotspots)[number]>(hotspots[0]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 84%' },
          },
        );
      });

      chapters.forEach((chapter) => {
        ScrollTrigger.create({
          trigger: `#${chapter.id}`,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveChapter(chapter.id),
          onEnterBack: () => setActiveChapter(chapter.id),
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.experienceEntered = entered ? 'true' : 'false';
    document.body.style.overflow = exploreMode ? 'hidden' : '';

    return () => {
      delete document.documentElement.dataset.experienceEntered;
      document.body.style.overflow = '';
    };
  }, [entered, exploreMode]);

  useEffect(() => {
    if (!exploreMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExploreMode(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exploreMode]);

  const active = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0];

  return (
    <main className="experience" ref={root}>
      <Preloader onEnter={() => setEntered(true)} />

      <nav className={`nav${entered ? ' visible' : ''}${exploreMode ? ' muted' : ''}`} aria-label="Primary">
        <a className="brand" href="#hero">SCK AVIATION</a>
        <div className="nav-links">
          <a href="#aircraft">Aircraft</a>
          <a href="#atelier">Atelier</a>
          <a href="#access">Access</a>
        </div>
      </nav>

      <div className={`chapter-rail${entered ? ' visible' : ''}${exploreMode ? ' muted' : ''}`} aria-hidden="true">
        <span>{active.index}</span>
        <span className="chapter-rail-line" />
        <span>{active.label}</span>
      </div>

      <ExperienceCanvas entered={entered} exploreMode={exploreMode} />

      <div className={`scroll-layer${exploreMode ? ' frozen' : ''}`}>
        <section className="chapter chapter-hero" id="hero" data-camera="hero">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">SCK Aviation / Vienna</p>
            <h1>Attitude<br /><span>With Altitude.</span></h1>
            <p className="copy">Not a fleet page. A digital introduction to OE-LSC — Black Star, treated as a one-of-one design object.</p>
            <a className="cta" href="#material">Explore Black Star <span>↘</span></a>
          </div>
          <div className="scroll-cue" aria-hidden="true">SCROLL TO REVEAL</div>
        </section>

        <section className="chapter chapter-right" id="material" data-camera="material">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">01 / Material</p>
            <h2>Black Is<br />A Material.</h2>
            <p className="copy">Matte, gloss and reflection are treated as separate surfaces. Light reveals the aircraft instead of decorating it.</p>
          </div>
        </section>

        <section className="chapter" id="aircraft" data-camera="aircraft">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">02 / OE-LSC</p>
            <h2>Black Star.</h2>
            <p className="copy">A controlled inspection chapter for exterior treatment, registration, signature details and future hotspots.</p>
            <button className="ghost-button" type="button" onClick={() => setExploreMode(true)}>
              Explore Aircraft <span>↗</span>
            </button>
          </div>
        </section>

        <section className="chapter chapter-right" id="atelier" data-camera="atelier">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">03 / Atelier</p>
            <h2>Impossible<br />Made Physical.</h2>
            <p className="copy">The polished object gives way to process: transformation, fabrication, material decisions and proof of execution.</p>
          </div>
        </section>

        <section className="chapter chapter-access" id="access" data-camera="access">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">04 / Access</p>
            <h2>Experience Our<br />Attitude, Selectively.</h2>
            <a className="cta" href="mailto:hello@sckaviation.com">Request Access <span>↗</span></a>
          </div>
        </section>
      </div>

      <section className={`explore-overlay${exploreMode ? ' open' : ''}`} aria-hidden={!exploreMode} aria-label="Explore OE-LSC">
        <div className="explore-topbar">
          <div>
            <span className="explore-meta">OE-LSC / BLACK STAR</span>
            <strong>INTERACTIVE OBJECT</strong>
          </div>
          <button type="button" className="explore-close" onClick={() => setExploreMode(false)}>
            EXIT <span>×</span>
          </button>
        </div>

        <div className="explore-instruction" aria-hidden="true">
          <span>DRAG TO ORBIT</span>
          <span>SCROLL TO ZOOM</span>
        </div>

        <div className="hotspot-layer" aria-label="Aircraft detail hotspots">
          {hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              className={`hotspot${activeHotspot.id === hotspot.id ? ' active' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={() => setActiveHotspot(hotspot)}
              aria-label={`${hotspot.index} ${hotspot.label}`}
            >
              <span>{hotspot.index}</span>
            </button>
          ))}
        </div>

        <aside className="detail-panel" aria-live="polite">
          <p className="eyebrow">{activeHotspot.index} / {activeHotspot.label}</p>
          <h3>{activeHotspot.title}</h3>
          <p>{activeHotspot.body}</p>
          <div className="detail-index">
            {hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                className={activeHotspot.id === hotspot.id ? 'active' : ''}
                onClick={() => setActiveHotspot(hotspot)}
              >
                {hotspot.index}
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
