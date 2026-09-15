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

export function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [activeChapter, setActiveChapter] = useState('hero');

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
    return () => {
      delete document.documentElement.dataset.experienceEntered;
    };
  }, [entered]);

  const active = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0];

  return (
    <main className="experience" ref={root}>
      <Preloader onEnter={() => setEntered(true)} />

      <nav className={`nav${entered ? ' visible' : ''}`} aria-label="Primary">
        <a className="brand" href="#hero">SCK AVIATION</a>
        <div className="nav-links">
          <a href="#aircraft">Aircraft</a>
          <a href="#atelier">Atelier</a>
          <a href="#access">Access</a>
        </div>
      </nav>

      <div className={`chapter-rail${entered ? ' visible' : ''}`} aria-hidden="true">
        <span>{active.index}</span>
        <span className="chapter-rail-line" />
        <span>{active.label}</span>
      </div>

      <ExperienceCanvas entered={entered} />

      <div className="scroll-layer">
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
            <button className="ghost-button" type="button">Explore Aircraft <span>↗</span></button>
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
    </main>
  );
}
