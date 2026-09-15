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
  loading: () => <img className="flight-loading-photo" src="/images/black-star-alps.webp" alt="Black Star flying above the Alps" />,
});

const flightChapters = [
  { label: 'The aircraft', title: <>Meet<br />Black Star.</>, body: 'A Gulfstream G450 with a character all its own. Matte black outside. Entirely individual within.', detail: 'OE-LSC · GULFSTREAM G450' },
  { label: 'The details', title: <>Every angle.<br />Considered.</>, body: 'Matte surfaces meet gloss details. Clean lines and a distinctive silhouette make an impression from every perspective.', detail: 'A DISTINCTIVE POINT OF VIEW' },
  { label: 'Your perspective', title: <>Look a<br />little closer.</>, body: 'Turn the aircraft to discover its shape, then step inside to see the real finishes and cabin details.', detail: 'EXPLORE BLACK STAR' },
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
    <main className="sck-home" id="main-content">
      <SiteNav />
      <section className="welcome-scene" aria-labelledby="welcome-title">
        <div className="welcome-topline"><span>WELCOME TO SCK AVIATION</span><span>VIENNA, AUSTRIA</span></div>
        <div className="welcome-body">
          <div className="welcome-copy">
            <p className="welcome-kicker">A different point of view.</p>
            <h1 id="welcome-title">A world<br />above<br /><em>ordinary.</em></h1>
            <p>Aircraft. Design. Possibility.<br />Welcome to our world.</p>
            <a className="welcome-enter" href="#flight-story" onClick={() => setLoadAircraft(true)}>Enter the experience <span aria-hidden="true">↘</span></a>
          </div>
          <div className="welcome-landscape">
            <img src="/images/black-star-alps.webp" alt="The complete matte-black Black Star aircraft flying over a snowy Alpine valley" fetchPriority="high" decoding="async" width="1536" height="1097" />
            <div className="welcome-mist" aria-hidden="true" />
            <span className="welcome-photo-caption">BLACK STAR · OE-LSC</span>
          </div>
        </div>
        <div className="welcome-bottom"><span>ATTITUDE WITH ALTITUDE.</span><a href="#flight-story">Scroll to discover <span aria-hidden="true">↓</span></a><span>01 — THE ARRIVAL</span></div>
      </section>

      <section className="flight-story" id="flight-story" ref={flight} aria-label="Discover Black Star from every angle">
        <div className={`flight-stage${exploreMode ? ' is-exploring' : ''}`}>
          <div className="flight-heading"><span>SCK AVIATION / BLACK STAR</span><span>0{chapter + 1} / 03</span></div>
          {loadAircraft ? <ExperienceCanvas exploreMode={exploreMode} onReady={onSceneReady} /> : <img className="flight-loading-photo" src="/images/black-star-alps.webp" alt="Black Star aircraft" loading="lazy" />}
          <div className="flight-copy">
            {flightChapters.map((item, index) => (
              <div className={`flight-chapter${chapter === index ? ' is-active' : ''}`} key={item.label} aria-hidden={chapter !== index} inert={chapter !== index}>
                <p className="section-kicker">0{index + 1} / {item.label}</p>
                <h2>{item.title}</h2>
                <p className="flight-description">{item.body}</p>
                {index === 2 && sceneReady ? <button ref={exploreButton} className="sck-button light" type="button" aria-pressed={exploreMode} onClick={() => setExploreMode((value) => !value)}>{exploreMode ? 'Finish exploring' : 'Turn the aircraft'} <span aria-hidden="true">{exploreMode ? '×' : '↗'}</span></button> : <Link className="sck-text-link" href="/aircraft">Discover the aircraft <span aria-hidden="true">↗</span></Link>}
                {exploreMode && index === 2 ? <p className="flight-help">Drag to turn. Use the arrow keys when the aircraft is selected. Press Escape to finish.</p> : null}
              </div>
            ))}
          </div>
          <div className="flight-bottom">
            <span className="flight-detail">{flightChapters[chapter].detail}</span>
            <nav className="flight-pagination" aria-label="Aircraft views">{flightChapters.map((item, index) => <button key={item.label} type="button" aria-label={`View ${index + 1}: ${item.label}`} aria-current={chapter === index ? 'step' : undefined} onClick={() => goToChapter(index)}><span /></button>)}</nav>
            <a href="#aircraft">Step inside <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section className="home-section cabin-section" id="aircraft">
        <div className="section-heading"><p className="section-kicker">01 / THE CABIN</p><h2>A world of<br /><span>your own.</span></h2><div><p>Soft textiles. Deep black finishes. Details made to be discovered. A cabin with the same unmistakable character as the aircraft around it.</p><Link className="sck-text-link" href="/aircraft">Step inside Black Star <span>↗</span></Link></div></div>
        <div className="cabin-pair"><CinematicMedia asset={asset('inplane_seats.webp')} label="The Black Star cabin" eyebrow="SPACE TO MAKE YOUR OWN" /><CinematicMedia asset={asset('one_seat_view.webp')} label="Comfort, considered" eyebrow="A CLOSER LOOK" /></div>
      </section>

      <section className="home-section material-section" id="materials">
        <div className="section-heading"><p className="section-kicker">02 / THE DETAILS</p><h2>Nothing<br /><span>by chance.</span></h2><div><p>Portoro marble, soft nubuck, wool and polished metal. Each material brings its own depth, texture and character.</p><Link className="sck-text-link" href="/design-philosophy">Explore the details <span>↗</span></Link></div></div>
        <div className="material-triptych"><CinematicMedia asset={asset('colse_view_seat.webp')} label="Soft textures" eyebrow="01 / TOUCH" /><CinematicMedia asset={asset('seat_full view.webp')} label="Considered proportions" eyebrow="02 / FORM" /><CinematicMedia asset={asset('sck-galley.webp') || asset('inplane_seats.webp')} label="A distinctive finish" eyebrow="03 / DETAIL" /></div>
      </section>

      <section className="home-section film-section" id="atelier">
        <div className="section-heading"><p className="section-kicker">03 / THE ATELIER</p><h2>From vision<br /><span>to reality.</span></h2><div><p>A complete transformation, from the first idea to the finishing touch. Discover the work behind Black Star.</p><Link className="sck-text-link" href="/atelier">Inside the atelier <span>↗</span></Link></div></div>
        <CinematicMedia asset={asset('vid-mi-opt-v1.mp4')} label="The Black Star story" eyebrow="WATCH THE FILM" poster="/images/atelier-poster.webp" controls />
      </section>

      <section className="home-section film-section" id="projects">
        <div className="section-heading"><p className="section-kicker">04 / BEYOND THE EVERYDAY</p><h2>Extraordinary<br /><span>possibilities.</span></h2><div><p>A private journey. A striking setting for a film. A project that starts with an unexpected idea. Discover what comes next.</p><Link className="sck-text-link" href="/projects">Explore our world <span>↗</span></Link></div></div>
        <CinematicMedia asset={asset('vid-charter-feature-v1.mp4')} label="Experience Black Star" eyebrow="SELECTIVE CHARTER" poster="/images/charter-poster.webp" controls />
        <div className="project-links"><Link href="/access?interest=Selective%20Charter">Private journeys <span>↗</span></Link><Link href="/access?interest=Production">Film &amp; productions <span>↗</span></Link><Link href="/access?interest=Collaboration">Special projects <span>↗</span></Link></div>
      </section>

      <section className="home-section recognition-section" id="recognition">
        <div><p className="section-kicker">05 / RECOGNITION</p><h2>Distinctive design.<br /><span>Recognised.</span></h2><p>Winner, Private Jet Design<br />International Yacht &amp; Aviation Awards 2024</p><a className="sck-text-link" href="https://thedesignawards.co.uk/sck-aviation-gulfstream-g450/" target="_blank" rel="noreferrer">Discover the award <span>↗</span></a></div>
        <CinematicMedia asset={asset('SCK-img-award.webp')} label="Private Jet Design, 2024" eyebrow="BLACK STAR" />
      </section>

      <section className="home-section home-enquiry" id="access">
        <div className="enquiry-introduction"><p className="section-kicker">06 / GET IN TOUCH</p><h2>Something<br /><span>in mind?</span></h2><p>Tell us about your journey, aircraft or next idea. We’ll take it from there.</p><img src="/images/black-star-alps.webp" alt="Black Star above the Alps" loading="lazy" width="1536" height="1097" /></div>
        <AccessForm />
      </section>
      <SiteFooter />
    </main>
  );
}
