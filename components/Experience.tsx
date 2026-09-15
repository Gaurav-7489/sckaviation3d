'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExperienceCanvas } from './three/ExperienceCanvas';
import { Preloader } from './ui/Preloader';

export function Experience() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 28 }, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <main className="experience" ref={root}>
      <Preloader />
      <nav className="nav" aria-label="Primary">
        <a href="#hero">SCK Aviation</a>
        <div className="nav-links">
          <a href="#aircraft">Aircraft</a>
          <a href="#material">Material</a>
          <a href="#access">Access</a>
        </div>
      </nav>

      <ExperienceCanvas />

      <div className="scroll-layer">
        <section className="chapter" id="hero" data-camera="hero">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">SCK Aviation / Vienna</p>
            <h1>Attitude<br />With Altitude.</h1>
            <p className="copy">A first working prototype for the cinematic OE-LSC digital experience. The aircraft stays physically present while the interface moves around it.</p>
            <a className="cta" href="#aircraft">Explore Black Star</a>
          </div>
        </section>

        <section className="chapter" id="material" data-camera="material">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">01 / Material</p>
            <h2>Black Is<br />A Material.</h2>
            <p className="copy">Matte, gloss and reflection will become part of the storytelling once the production aircraft model replaces this proxy.</p>
          </div>
        </section>

        <section className="chapter" id="aircraft" data-camera="aircraft">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">02 / OE-LSC</p>
            <h2>Black Star.</h2>
            <p className="copy">This chapter will become the controlled inspection mode: exterior details, hotspots, registration, paint treatment and selected design stories.</p>
          </div>
        </section>

        <section className="chapter" id="access" data-camera="access">
          <div className="chapter-inner" data-reveal>
            <p className="eyebrow">03 / Access</p>
            <h2>Experience<br />Attitude.</h2>
            <a className="cta" href="mailto:hello@sckaviation.com">Request Access</a>
          </div>
        </section>
      </div>
    </main>
  );
}
