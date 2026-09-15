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
    title: <>Precision in<br />Matte Black.</>,
    body: 'A customized Gulfstream G450 with singular aesthetic poise. Stealth presence outside. Meticulously curated sanctuary inside.',
    detail: 'OE-LSC · GULFSTREAM G450 · RANGE 4,350 NM',
  },
  {
    label: 'ARCHITECTURAL LINES',
    code: '02 / 03',
    title: <>Every Angle.<br />Uncompromising.</>,
    body: 'Deep obsidian absorption meets brushed metallic accents. An aggressive silhouette designed to command attention on every apron.',
    detail: 'A BESPOKE PERSPECTIVE · BESPOKE INTERIORS',
  },
  {
    label: 'INSPECTION STAGE',
    code: '03 / 03',
    title: <>Command The<br />Perspective.</>,
    body: 'Rotate the aircraft in 3D space to examine wing camber, turbine nacelles, and the signature dark finish, then explore the cabin.',
    detail: 'INTERACTIVE 3D · EXPLORE BLACK STAR',
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

      {/* Hero: High-Impact Monochromatic Visual */}
      <section className="welcome-scene" aria-labelledby="welcome-title">
        <div className="welcome-topline">
          <span className="gold-accent-text">SCK AVIATION ATELIER</span>
          <span>VIENNA · GENEVA · DUBAI</span>
        </div>

        <div className="welcome-body">
          <div className="welcome-copy">
            <p className="welcome-kicker">PRIVATE AVIATION REDEFINED</p>
            <h1 id="welcome-title">
              Attitude<br />
              With<br />
              <em>Altitude.</em>
            </h1>
            <p className="welcome-lead">
              Black Star is a bespoke Gulfstream G450 engineered for those who demand discretion, radical design, and seamless travel.
            </p>
            <div className="hero-cta-group">
              <a className="welcome-enter" href="#flight-story" onClick={() => setLoadAircraft(true)}>
                <span>Explore 3D Aircraft</span>
                <span className="arrow-icon" aria-hidden="true">↘</span>
              </a>
              <Link className="welcome-secondary-link" href="/access">
                Charter Enquiries <span>↗</span>
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
              <span>OE-LSC · MACH 0.88 · FL450</span>
            </div>
          </div>
        </div>

        <div className="welcome-bottom">
          <span className="specs-tag">GULFSTREAM G450 CUSTOM ATELIER</span>
          <a href="#flight-story" className="scroll-hint">
            <span>Scroll to inspect</span>
            <span aria-hidden="true">↓</span>
          </a>
          <span>01 — THE 3D STAGE</span>
        </div>
      </section>

      {/* 3D Aircraft Storytelling Stage */}
      <section className="flight-story" id="flight-story" ref={flight} aria-label="3D Interactive Aircraft Showcase">
        <div className={`flight-stage${exploreMode ? ' is-exploring' : ''}`}>
          <div className="flight-heading">
            <span className="brand-tracker">BLACK STAR / 3D SHOWCASE</span>
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
                      Aircraft Specifications <span>↗</span>
                    </Link>
                  )}
                </div>

                {exploreMode && index === 2 ? (
                  <p className="flight-help">
                    Drag around to rotate. Use keyboard arrows to tilt &amp; pan. Press ESC to return.
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
            <a href="#aircraft" className="next-section-link">
              <span>Step inside cabin</span> <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* The Cabin: Full-Screen Visual Architecture */}
      <section className="home-section cabin-section" id="aircraft">
        <div className="section-heading">
          <p className="section-kicker">01 / THE CABIN</p>
          <h2>
            Quiet Sanctuary.<br />
            <span>Sculpted in Darkness.</span>
          </h2>
          <div>
            <p>
              Hand-stitched Italian leather, acoustic dampening composites, and custom-milled Portoro marble fixtures. A low-glare cabin tailored for rest, conversation, and undisturbed concentration.
            </p>
            <Link className="sck-text-link gold" href="/aircraft">
              Explore cabin specifications <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="cabin-pair">
          <CinematicMedia asset={asset('inplane_seats.webp')} label="Handcrafted Club Configuration" eyebrow="CAPACITY FOR 14 PASSENGERS" />
          <CinematicMedia asset={asset('one_seat_view.webp')} label="Individual Executive Suite" eyebrow="FULL-FLAT BERTHING READY" />
        </div>
      </section>

      {/* Materials & Details: Triptych Grid */}
      <section className="home-section material-section" id="materials">
        <div className="section-heading">
          <p className="section-kicker">02 / TACTILE PRECISION</p>
          <h2>
            Nothing<br />
            <span>By Accident.</span>
          </h2>
          <div>
            <p>
              Rare black Portoro gold-veined marble, brushed gunmetal hardware, and breathable perforated nubuck. Every sensory touchpoint has been deliberately rethought.
            </p>
            <Link className="sck-text-link gold" href="/design-philosophy">
              Read design philosophy <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="material-triptych">
          <CinematicMedia asset={asset('colse_view_seat.webp')} label="Perforated Nubuck & Contrast Stitching" eyebrow="01 / TACTILITY" />
          <CinematicMedia asset={asset('seat_full view.webp')} label="Anatomic Ergonomic Shell" eyebrow="02 / GEOMETRY" />
          <CinematicMedia asset={asset('sck-galley.webp') || asset('inplane_seats.webp')} label="Portoro Marble & Black Obsidian Bar" eyebrow="03 / MONOLITH" />
        </div>
      </section>

      {/* Atelier Film: Cinematic Full-Bleed Feature */}
      <section className="home-section film-section" id="atelier">
        <div className="section-heading">
          <p className="section-kicker">03 / BESPOKE MANUFACTURE</p>
          <h2>
            From Raw Sketch<br />
            <span>To The Stratosphere.</span>
          </h2>
          <div>
            <p>
              Over 24 months of specialized aeronautical engineering, custom FAA/EASA certifications, and bespoke coachbuilding to create the world&apos;s most distinctive private jet.
            </p>
            <Link className="sck-text-link gold" href="/atelier">
              Inside the Atelier <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="cinema-container">
          <CinematicMedia
            asset={asset('vid-mi-opt-v1.mp4')}
            label="The Making of Black Star"
            eyebrow="ORIGINAL FEATURE FILM"
            poster="/images/atelier-poster.webp"
            controls
          />
        </div>
      </section>

      {/* Charter & Productions */}
      <section className="home-section film-section" id="projects">
        <div className="section-heading">
          <p className="section-kicker">04 / OPERATIONS &amp; ACCESS</p>
          <h2>
            Beyond The<br />
            <span>Ordinary Charter.</span>
          </h2>
          <div>
            <p>
              Available on a strictly selective basis for long-range transcontinental travel, high-profile cinematic shoots, and exclusive brand partnerships.
            </p>
            <Link className="sck-text-link gold" href="/projects">
              View Special Projects <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="cinema-container">
          <CinematicMedia
            asset={asset('vid-charter-feature-v1.mp4')}
            label="Black Star on Apron & In Flight"
            eyebrow="SELECTIVE CHARTER ACCESS"
            poster="/images/charter-poster.webp"
            controls
          />
        </div>

        <div className="project-quick-grid">
          <Link href="/access?interest=Selective%20Charter" className="project-card">
            <span className="project-number">01</span>
            <div className="project-info">
              <h3>Private Journeys</h3>
              <p>Non-stop intercontinental capability with bespoke catering.</p>
            </div>
            <span className="project-arrow">↗</span>
          </Link>

          <Link href="/access?interest=Production" className="project-card">
            <span className="project-number">02</span>
            <div className="project-info">
              <h3>Film &amp; Commercials</h3>
              <p>An unmistakable visual icon on tarmac or in hangar stages.</p>
            </div>
            <span className="project-arrow">↗</span>
          </Link>

          <Link href="/access?interest=Collaboration" className="project-card">
            <span className="project-number">03</span>
            <div className="project-info">
              <h3>Custom Commissions</h3>
              <p>Aviation interior consultations and special livery commissions.</p>
            </div>
            <span className="project-arrow">↗</span>
          </Link>
        </div>
      </section>

      {/* Global Recognition */}
      <section className="home-section recognition-section" id="recognition">
        <div className="recognition-content">
          <p className="section-kicker">05 / ACCOLADES</p>
          <h2>
            Distinctive Vision.<br />
            <span>Globally Celebrated.</span>
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
              Read Design Awards Citation <span>↗</span>
            </a>
          </div>
        </div>
        <div className="recognition-visual">
          <CinematicMedia asset={asset('SCK-img-award.webp')} label="International Yacht & Aviation Awards Trophy" eyebrow="DESIGN EXCELLENCE 2024" />
        </div>
      </section>

      {/* Enquiry Section */}
      <section className="home-section home-enquiry" id="access">
        <div className="enquiry-introduction">
          <p className="section-kicker">06 / PRIVATE INQUIRY</p>
          <h2>
            Initiate Your<br />
            <span>Journey.</span>
          </h2>
          <p className="enquiry-text">
            For selective charter requests, project collaborations, or confidential aircraft management consultations, reach our Vienna operations desk directly.
          </p>
          <div className="enquiry-image-wrap">
            <img src="/images/black-star-alps.webp" alt="Black Star soaring" loading="lazy" width="1536" height="1097" />
          </div>
        </div>
        <div className="enquiry-form-container">
          <AccessForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}