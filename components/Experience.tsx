'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/lib/media';
import { CinematicMedia } from './media/CinematicMedia';
import { AccessForm } from './ui/AccessForm';
import { SiteFooter } from './ui/SiteFooter';
import { SiteNav } from './ui/SiteNav';

const ExperienceCanvas = dynamic(() => import('./three/ExperienceCanvas').then((module) => module.ExperienceCanvas), {
  ssr: false,
  loading: () => <img className="flight-loading-photo" src="/images/black-star-alps.webp" alt="Black Star Gulfstream G450" />,
});

const flightChapters = [
  {
    label: 'PRESENCE',
    code: '01 / 03',
    title: <>Quiet power.<br />Discreet by design.</>,
    body: 'SCK Aviation treats the aircraft as more than transport. It becomes a point of view in motion — confident, precise and deliberately understated.',
    detail: 'SILHOUETTE · PROPORTION · PRESENCE',
  },
  {
    label: 'PRECISION',
    code: '02 / 03',
    title: <>Nothing here<br />is incidental.</>,
    body: 'Every line, transition and surface is considered until the whole feels effortless. Luxury is expressed through control, not excess.',
    detail: 'CONTROL · RESTRAINT · INTENT',
  },
  {
    label: 'FREEDOM',
    code: '03 / 03',
    title: <>A private world.<br />On your terms.</>,
    body: 'A different idea of aviation: personal, cinematic and shaped around the freedom to move without compromise.',
    detail: 'PRIVATE · PERSONAL · UNMISTAKABLE',
  },
];

export function Experience({ media }: { media: MediaAsset[] }) {
  const flight = useRef<HTMLElement>(null);
  const exploreButton = useRef<HTMLButtonElement>(null);
  const [chapter, setChapter] = useState(0);
  const [loadAircraft, setLoadAircraft] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const asset = (name: string) => media.find((item) => item.filename === name);
  const onSceneReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    const target = flight.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadAircraft(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });
    observer.observe(target);

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / distance));
      setChapter(Math.min(2, Math.floor(progress * 3)));
      if (rect.bottom < 100 || rect.top > window.innerHeight) setExploreMode(false);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    if (!exploreMode) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExploreMode(false);
        exploreButton.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [exploreMode]);

  function goToChapter(index: number) {
    const target = flight.current;
    if (!target) return;
    setExploreMode(false);
    const distance = target.offsetHeight - window.innerHeight;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: target.offsetTop + distance * ((index + 0.15) / 3),
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  return (
    <main className="sck-home dark-luxury-root" id="main-content">
      <SiteNav />

      <section className="welcome-scene" aria-labelledby="welcome-title">
        <div className="welcome-topline">
          <span className="home-accent-text">SCK AVIATION</span>
          <span>VIENNA · PRIVATE AVIATION</span>
        </div>

        <div className="welcome-body">
          <div className="welcome-copy">
            <p className="welcome-kicker">PRIVATE AVIATION / A POINT OF VIEW</p>
            <h1 id="welcome-title">
              Attitude<br />
              With<br />
              <em>Altitude.</em>
            </h1>
            <p className="welcome-lead">
              Private aviation with a point of view. Built around presence, precision and the freedom to move on your own terms.
            </p>
            <div className="hero-cta-group">
              <a className="welcome-enter" href="#flight-story" onClick={() => setLoadAircraft(true)}>
                <span>Explore the vision</span>
                <span className="arrow-icon" aria-hidden="true">↘</span>
              </a>
              <Link className="welcome-secondary-link" href="/access">
                Enquire <span>↗</span>
              </Link>
            </div>
          </div>

          <div className="welcome-landscape">
            <img
              src="/images/black-star-alps.webp"
              alt="Black Star private jet soaring above the snow-capped Alps"
              fetchPriority="high"
              decoding="async"
              width="1536"
              height="1097"
            />
            <div className="welcome-mist" aria-hidden="true" />
            <div className="welcome-specs-pill">
              <span className="dot-live" />
              <span>BLACK STAR · OE-LSC</span>
            </div>
          </div>
        </div>

        <div className="welcome-bottom">
          <span className="specs-tag">VISION · PRESENCE · PRECISION</span>
          <a href="#flight-story" className="scroll-hint">
            <span>Scroll to inspect</span>
            <span aria-hidden="true">↓</span>
          </a>
          <span>01 — THE VISION</span>
        </div>
      </section>

      <section className="flight-story" id="flight-story" ref={flight} aria-label="3D Interactive Aircraft Showcase">
        <div className={`flight-stage${exploreMode ? ' is-exploring' : ''}`}>
          <div className="flight-heading">
            <span className="brand-tracker">SCK / 3D EXPERIENCE</span>
            <span className="counter-pill">{flightChapters[chapter].code}</span>
          </div>

          {loadAircraft ? (
            <ExperienceCanvas exploreMode={exploreMode} onReady={onSceneReady} />
          ) : (
            <img className="flight-loading-photo" src="/images/black-star-alps.webp" alt="Black Star private jet" loading="lazy" />
          )}

          <div className="flight-copy">
            {flightChapters.map((item, index) => (
              <div
                className={`flight-chapter${chapter === index ? ' is-active' : ''}`}
                key={item.label}
                aria-hidden={chapter !== index}
                inert={chapter !== index}
              >
                <p className="section-kicker">{item.label}</p>
                <h2>{item.title}</h2>
                <p className="flight-description">{item.body}</p>

                {index === 2 && sceneReady ? (
                  <div className="chapter-action-bar">
                    <button
                      ref={exploreButton}
                      className="sck-button monochrome"
                      type="button"
                      aria-pressed={exploreMode}
                      onClick={() => setExploreMode((value) => !value)}
                    >
                      <span>{exploreMode ? 'Lock camera' : 'Free 360° inspection'}</span>
                      <span aria-hidden="true">{exploreMode ? '×' : '↺'}</span>
                    </button>
                  </div>
                ) : null}

                {exploreMode && index === 2 ? (
                  <p className="flight-help">Drag to rotate. Use arrow keys to tilt. Press ESC to return.</p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flight-bottom">
            <span className="flight-detail">{flightChapters[chapter].detail}</span>
            <nav className="flight-pagination" aria-label="Aircraft views">
              {flightChapters.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={`View ${index + 1}: ${item.label}`}
                  aria-current={chapter === index ? 'step' : undefined}
                  onClick={() => goToChapter(index)}
                >
                  <span />
                </button>
              ))}
            </nav>
            <a href="#vision" className="next-section-link">
              <span>Enter the world</span> <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section className="home-section vision-section" id="vision">
        <div className="vision-manifesto">
          <p className="section-kicker">01 / SCK VISION</p>
          <h2>
            Presence without excess.<br />
            <span>Movement with intention.</span>
          </h2>
          <div className="vision-copy">
            <p>
              SCK Aviation creates private worlds in motion — individual, restrained and unmistakably personal. The ambition is simple: make every journey feel considered before it even begins.
            </p>
            <Link className="sck-text-link" href="/about">
              Discover SCK Aviation <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="project-quick-grid" aria-label="Explore SCK Aviation">
          <Link href="/aircraft" className="project-card">
            <span className="project-number">01</span>
            <div className="project-info">
              <h3>Black Star</h3>
              <p>The aircraft. The presence. The signature.</p>
            </div>
            <span className="project-arrow" aria-hidden="true">↗</span>
          </Link>

          <Link href="/design-philosophy" className="project-card">
            <span className="project-number">02</span>
            <div className="project-info">
              <h3>Material language</h3>
              <p>The visual and tactile world behind the SCK point of view.</p>
            </div>
            <span className="project-arrow" aria-hidden="true">↗</span>
          </Link>

          <Link href="/projects" className="project-card">
            <span className="project-number">03</span>
            <div className="project-info">
              <h3>Private access</h3>
              <p>Selected journeys, productions and private conversations.</p>
            </div>
            <span className="project-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="home-section material-section" id="craft">
        <div className="material-mood-layout">
          <div className="material-mood-copy">
            <p className="section-kicker">02 / DESIGN LANGUAGE</p>
            <h2>
              A language<br />
              <span>of restraint.</span>
            </h2>
            <p className="material-words">MATTE / SCULPTED / TACTILE / RESTRAINED</p>
            <Link className="sck-text-link" href="/atelier">
              Enter the atelier <span>↗</span>
            </Link>
          </div>
          <div className="material-mood-media">
            <CinematicMedia asset={asset('inplane_seats.webp')} label="SCK material language" eyebrow="QUIET DETAIL" />
          </div>
        </div>
      </section>

      <section className="recognition-strip" id="recognition" aria-label="Recognition">
        <p className="section-kicker">03 / RECOGNITION</p>
        <p className="recognition-line">International Yacht &amp; Aviation Awards — Winner / 2024</p>
        <Link className="sck-text-link" href="/aircraft">
          Discover Black Star <span>↗</span>
        </Link>
      </section>

      <section className="home-section home-enquiry" id="access">
        <div className="enquiry-introduction">
          <p className="section-kicker">04 / PRIVATE CONVERSATION</p>
          <h2>
            Begin a<br />
            <span>private conversation.</span>
          </h2>
          <p className="enquiry-text">Tell us where you want to go, what you want to create, or simply where the conversation should begin.</p>
          <p className="enquiry-direct">VIENNA · DISCREET BY DEFAULT</p>
        </div>
        <div className="enquiry-form-container">
          <AccessForm />
        </div>
      </section>

      <div className="back-to-top-wrap">
        <a href="#main-content" className="back-to-top">
          <span aria-hidden="true">↑</span>
          <span>Back to top</span>
        </a>
      </div>

      <SiteFooter />
    </main>
  );
}
