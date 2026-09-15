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
    label: 'AERODYNAMIC PROFILE',
    code: '01 / 03',
    title: <>Quiet power.<br />Discreet by design.</>,
    body: 'SCK Aviation shapes aircraft around presence, precision and a more personal way of travelling. Black Star is a statement without noise.',
    detail: 'OE-LSC · GULFSTREAM G450 · BESPOKE DELIVERY',
  },
  {
    label: 'MATERIAL LANGUAGE',
    code: '02 / 03',
    title: <>Every surface<br />has a point of view.</>,
    body: 'Matte black, natural marble, deep leather and sculpted metal come together in a cabin that feels refined, calm and unmistakably private.',
    detail: 'PORTORO · NUBUCK · BRUSHED METAL',
  },
  {
    label: 'PRIVATE WORLD',
    code: '03 / 03',
    title: <>A different idea<br />of aviation.</>,
    body: 'From charter to film, commissions and private journeys, SCK builds experiences that feel tailored, cinematic and quietly extraordinary.',
    detail: 'VIENNA · GENEVA · DUBAI · SELECTIVE ACCESS',
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
      if (entry.isIntersecting) { setLoadAircraft(true); observer.disconnect(); }
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
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    if (!exploreMode) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setExploreMode(false); exploreButton.current?.focus(); }
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
    window.scrollTo({ top: target.offsetTop + distance * ((index + 0.15) / 3), behavior: reduced ? 'instant' : 'smooth' });
  }

  return (
    <main className="sck-home dark-luxury-root" id="main-content">
      <SiteNav />

      <section className="welcome-scene" aria-labelledby="welcome-title">
        <div className="welcome-topline">
          <span className="gold-accent-text">SCK AVIATION</span>
          <span>VIENNA · GENEVA · DUBAI</span>
        </div>

        <div className="welcome-body">
          <div className="welcome-copy">
            <p className="welcome-kicker">PRIVATE AVIATION REIMAGINED</p>
            <h1 id="welcome-title">
              Attitude<br />
              With<br />
              <em>Altitude.</em>
            </h1>
            <p className="welcome-lead">
              Black is not the absence of expression. It is the frame for silence, precision, and a more personal way of moving through the world.
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
              <span>OE-LSC · PRIVATE JET REDEFINED</span>
            </div>
          </div>
        </div>

        <div className="welcome-bottom">
          <span className="specs-tag">BESPOKE AIRCRAFT · TAILORED TRAVEL</span>
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
            <span className="brand-tracker">BLACK STAR / 3D STORY</span>
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

                <div className="chapter-action-bar">
                  {index === 2 && sceneReady ? (
                    <button
                      ref={exploreButton}
                      className="sck-button dark-gold"
                      type="button"
                      aria-pressed={exploreMode}
                      onClick={() => setExploreMode((value) => !value)}
                    >
                      <span>{exploreMode ? 'Lock Camera' : 'Free 360° Inspection'}</span>
                      <span aria-hidden="true">{exploreMode ? '×' : '↺'}</span>
                    </button>
                  ) : (
                    <Link className="sck-text-link gold" href="/aircraft">
                      Aircraft details <span>↗</span>
                    </Link>
                  )}
                </div>

                {exploreMode && index === 2 ? (
                  <p className="flight-help">
                    Drag to rotate. Use arrow keys to tilt. Press ESC to return.
                  </p>
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

      <section className="home-section" id="vision">
        <div className="section-heading">
          <p className="section-kicker">01 / SCK VISION</p>
          <h2>
            A quieter kind<br />
            <span>of luxury.</span>
          </h2>
          <div>
            <p>
              We design aircraft and journeys that feel deeply personal: precise, restrained, tactile and unmistakably custom. The result is movement with intention, and presence without excess.
            </p>
            <Link className="sck-text-link gold" href="/about">
              About SCK Aviation <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="project-quick-grid">
          <Link href="/aircraft" className="project-card">
            <span className="project-number">01</span>
            <div className="project-info">
              <h3>Black Star</h3>
              <p>A custom Gulfstream G450 shaped around a sharper, darker point of view.</p>
            </div>
            <span className="project-arrow">↗</span>
          </Link>

          <Link href="/design-philosophy" className="project-card">
            <span className="project-number">02</span>
            <div className="project-info">
              <h3>Material language</h3>
              <p>Texture, tone and tactility create the atmosphere of the entire cabin experience.</p>
            </div>
            <span className="project-arrow">↗</span>
          </Link>

          <Link href="/projects" className="project-card">
            <span className="project-number">03</span>
            <div className="project-info">
              <h3>Private access</h3>
              <p>Selective charter, film work and collaborations built around trust and intent.</p>
            </div>
            <span className="project-arrow">↗</span>
          </Link>
        </div>
      </section>

      <section className="home-section material-section" id="craft">
        <div className="section-heading">
          <p className="section-kicker">02 / CRAFT</p>
          <h2>
            Engineered for<br />
            <span>stillness and impact.</span>
          </h2>
          <div>
            <p>
              The visual identity is deliberate: matte surfaces, soft contrast, guided light and restraint. Nothing is overplayed, because the aircraft speaks for itself.
            </p>
            <Link className="sck-text-link gold" href="/atelier">
              Inside the atelier <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="material-triptych">
          <CinematicMedia asset={asset('inplane_seats.webp')} label="Quiet luxury in motion" eyebrow="01 / CABIN" />
          <CinematicMedia asset={asset('sck-galley.webp') || asset('inplane_seats.webp')} label="The material story" eyebrow="02 / DETAILS" />
          <CinematicMedia asset={asset('SCK-img-award.webp')} label="Award-winning character" eyebrow="03 / PROOF" />
        </div>
      </section>

      <section className="home-section recognition-section" id="recognition">
        <div className="recognition-content">
          <p className="section-kicker">03 / RECOGNITION</p>
          <h2>
            Distinctive vision.<br />
            <span>Globally celebrated.</span>
          </h2>
          <div className="award-badge-card">
            <p className="award-title">Winner — Private Jet Interior &amp; Exterior Design</p>
            <p className="award-venue">The International Yacht &amp; Aviation Awards</p>
            <a
              className="sck-text-link gold"
              href="https://thedesignawards.co.uk/sck-aviation-gulfstream-g450/"
              target="_blank"
              rel="noreferrer"
            >
              Read the citation <span>↗</span>
            </a>
          </div>
        </div>
        <div className="recognition-visual">
          <CinematicMedia asset={asset('SCK-img-award.webp')} label="International Yacht & Aviation Awards Trophy" eyebrow="DESIGN EXCELLENCE 2024" />
        </div>
      </section>

      <section className="home-section home-enquiry" id="access">
        <div className="enquiry-introduction">
          <p className="section-kicker">04 / PRIVATE INQUIRY</p>
          <h2>
            Begin a<br />
            <span>private conversation.</span>
          </h2>
          <p className="enquiry-text">
            For selective charter, long-range travel, private commissions or film collaborations, we respond with discretion and intent.
          </p>
          <div className="enquiry-image-wrap">
            <img src="/images/black-star-alps.webp" alt="Black Star private jet" loading="lazy" width="1536" height="1097" />
          </div>
        </div>
        <div className="enquiry-form-container">
          <AccessForm />
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 40px' }}>
        <a
          href="#main-content"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 22px',
            border: '1px solid rgba(197, 160, 105, 0.35)',
            background: 'rgba(197, 160, 105, 0.06)',
            color: '#c5a069',
            textDecoration: 'none',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontSize: '11px',
            borderRadius: '999px',
          }}
        >
          <span aria-hidden="true">↑</span>
          <span>Back to top</span>
        </a>
      </div>

      <SiteFooter />
    </main>
  );
}