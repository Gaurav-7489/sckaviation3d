'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MediaAsset } from '@/lib/media';
import { CinematicMedia } from './media/CinematicMedia';
import { ExperienceCanvas } from './three/ExperienceCanvas';
import { AccessForm } from './ui/AccessForm';
import { Preloader } from './ui/Preloader';
import { SiteFooter } from './ui/SiteFooter';
import { SiteNav } from './ui/SiteNav';

const chapters = [
  { id: 'hero', index: '00', label: 'ATTITUDE' },
  { id: 'statement', index: '01', label: 'POSITION' },
  { id: 'aircraft', index: '02', label: 'BLACK STAR' },
  { id: 'materials', index: '03', label: 'MATERIAL' },
  { id: 'atelier', index: '04', label: 'ATELIER' },
  { id: 'projects', index: '05', label: 'PROJECTS' },
  { id: 'proof', index: '06', label: 'PROOF' },
  { id: 'access', index: '07', label: 'ACCESS' },
] as const;

type IntroPhase = 'loading' | 'clouds' | 'approach' | 'touchdown' | 'complete';

const hotspots = [
  {
    id: 'paint', index: '01', label: 'MATTE / GLOSS', title: 'BLACK AS SURFACE',
    body: 'Matte bodywork and gloss signature details are treated as separate surfaces so light—not decoration—does the revealing.',
    x: 54, y: 43,
  },
  {
    id: 'identity', index: '02', label: 'IDENTITY', title: 'OE-LSC',
    body: 'Registration, typography and graphic alignment belong to the same total design system as the aircraft itself.',
    x: 67, y: 48,
  },
  {
    id: 'engine', index: '03', label: 'FORM', title: 'G450 / BLACK STAR',
    body: 'The aircraft remains the object: silhouette, finish and restrained reflection carry the visual weight.',
    x: 73, y: 39,
  },
] as const;

const introCopy: Record<IntroPhase, { title: string; meta: string }> = {
  loading: { title: 'ALIGNING DETAILS', meta: 'PREPARING BLACK STAR' },
  clouds: { title: 'BREAKING CLOUD', meta: 'OE-LSC / BLACK STAR INBOUND' },
  approach: { title: 'FINAL APPROACH', meta: 'RUNWAY / DESCENDING' },
  touchdown: { title: 'TOUCHDOWN', meta: 'ATTITUDE HAS ARRIVED' },
  complete: { title: 'BLACK STAR', meta: 'SCK AVIATION / VIENNA' },
};

export function Experience({ media }: { media: MediaAsset[] }) {
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [introStarted, setIntroStarted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>('loading');
  const [activeChapter, setActiveChapter] = useState('hero');
  const [exploreMode, setExploreMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<(typeof hotspots)[number]>(hotspots[0]);

  const priorityMedia = useMemo(() => media.filter((asset) => asset.priority), [media]);
  const byName = useCallback((name: string) => media.find((asset) => asset.filename === name), [media]);

  const plane = byName('plane_img.webp');
  const cabinWide = byName('inplane_seats.webp');
  const seatClose = byName('colse_view_seat.webp');
  const seatSingle = byName('one_seat_view.webp');
  const seatFull = byName('seat_full view.webp');
  const processVideo = byName('vid-mi-opt-v1.mp4');
  const charterVideo = byName('vid-charter-feature-v1.mp4');
  const award = byName('SCK-img-award.webp');

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      lerp: 0.065,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1,
      syncTouch: false,
      anchors: true,
      autoRaf: false,
      stopInertiaOnNavigate: true,
    });
    lenisRef.current = lenis;
    lenis.stop();
    const onLenisScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', onLenisScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        if (reduced) return;
        gsap.fromTo(el, { opacity: 0, y: 26 }, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%' },
        });
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
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (!introComplete || exploreMode) lenis.stop();
    else {
      lenis.start();
      lenis.resize();
    }
  }, [exploreMode, introComplete]);

  useEffect(() => {
    document.documentElement.dataset.experienceEntered = introComplete ? 'true' : 'false';
    document.body.style.overflow = exploreMode || !introComplete ? 'hidden' : '';
    return () => {
      delete document.documentElement.dataset.experienceEntered;
      document.body.style.overflow = '';
    };
  }, [exploreMode, introComplete]);

  useEffect(() => {
    if (!exploreMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExploreMode(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exploreMode]);

  useEffect(() => {
    const track = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-analytics]');
      if (!target) return;
      window.dispatchEvent(new CustomEvent('sck:analytics', { detail: { event: target.dataset.analytics } }));
    };
    document.addEventListener('click', track);
    return () => document.removeEventListener('click', track);
  }, []);

  const handleIntroReady = useCallback(() => {
    setIntroPhase('clouds');
    setIntroStarted(true);
  }, []);

  const handleIntroPhase = useCallback((phase: Exclude<IntroPhase, 'loading' | 'complete'>) => setIntroPhase(phase), []);

  const handleIntroComplete = useCallback(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    setIntroPhase('complete');
    setIntroComplete(true);
    window.requestAnimationFrame(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    });
  }, []);

  const active = chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0];
  const introPlaying = introStarted && !introComplete;
  const phaseCopy = introCopy[introPhase];

  return (
    <main className="experience pdr-home" ref={root}>
      <Preloader onReady={handleIntroReady} assets={priorityMedia} />
      <div className={`cloud-wash ${introPlaying ? introPhase : 'complete'}`} aria-hidden="true" />
      <SiteNav visible={introComplete} muted={exploreMode} />

      <div className={`chapter-rail${introComplete ? ' visible' : ''}${exploreMode ? ' muted' : ''}`} aria-hidden="true">
        <span>{active.index}</span><span className="chapter-rail-line" /><span>{active.label}</span>
      </div>

      <div className={`intro-hud${introPlaying ? ' visible' : ''}`} aria-hidden={!introPlaying}>
        <div className="intro-hud-top"><span>OE-LSC / BLACK STAR</span><span>ARRIVAL SEQUENCE / AUTO</span></div>
        <div className="intro-hud-crosshair"><span /></div>
        <div className="intro-hud-status"><strong>{phaseCopy.title}</strong><span>{phaseCopy.meta}</span></div>
        <div className="intro-hud-bottom"><span>CONTINUOUS APPROACH</span><span className="intro-hud-line" /><span>RUNWAY</span></div>
      </div>

      <ExperienceCanvas
        introStarted={introStarted}
        exploreMode={exploreMode}
        onIntroPhase={handleIntroPhase}
        onIntroComplete={handleIntroComplete}
      />

      <div className={`scroll-layer pdr-story${!introComplete ? ' waiting' : ''}${exploreMode ? ' frozen' : ''}`}>
        <section className="pdr-scene pdr-hero" id="hero" data-camera="hero">
          <div className="scene-grid scene-grid-bottom" data-reveal>
            <div className="scene-kicker"><span>00</span><span>SCK AVIATION / VIENNA</span></div>
            <div className="hero-copy-block">
              <h1>Attitude<br /><span>With Altitude.</span></h1>
              <p>Aircraft transformation, selective access and special projects—built around a very specific point of view.</p>
              <div className="hero-actions">
                <Link href="/access" className="primary-link" data-analytics="hero_request_access">Request Access <span>↗</span></Link>
                <a href="#aircraft" className="text-link" data-analytics="hero_explore_black_star">Explore Black Star <span>↓</span></a>
              </div>
            </div>
            <div className="hero-side-note"><span>OE-LSC</span><span>BLACK STAR</span><span>SCROLL / DESCEND</span></div>
          </div>
        </section>

        <section className="pdr-scene statement-scene" id="statement" data-camera="statement">
          <div className="statement-index">01 / POSITION</div>
          <div className="statement-copy" data-reveal>
            <p>Standard was never the brief.</p>
            <h2>Not another<br />aviation website.</h2>
            <div className="statement-foot">
              <span>EDITORIAL / MATERIAL / SELECTIVE</span>
              <p>Luxury is made visible through surface, process and proof—not generic claims.</p>
            </div>
          </div>
          <CinematicMedia asset={seatSingle} className="statement-media" label="Interior detail" eyebrow="MATERIAL / CABIN" />
        </section>

        <section className="pdr-scene aircraft-scene" id="aircraft" data-camera="aircraft">
          <div className="aircraft-title" data-reveal>
            <p className="eyebrow">02 / OE-LSC — BLACK STAR</p>
            <h2>The Aircraft<br />Is The Product.</h2>
          </div>
          <div className="aircraft-editorial">
            <CinematicMedia asset={plane} className="aircraft-exterior" label="OE-LSC / exterior" eyebrow="EXTERIOR" eager />
            <div className="aircraft-copy" data-reveal>
              <p>OE-LSC is presented as a holistic design object: exterior finish, cabin, materials, custom details and proof belong to one narrative.</p>
              <button className="outline-action" type="button" onClick={() => setExploreMode(true)} data-analytics="explore_aircraft_3d">Explore object <span>↗</span></button>
              <Link href="/aircraft" className="text-link">Full Black Star story <span>→</span></Link>
            </div>
            <CinematicMedia asset={cabinWide} className="aircraft-interior" label="Cabin composition" eyebrow="INTERIOR" />
          </div>
        </section>

        <section className="pdr-scene materials-scene" id="materials" data-camera="materials">
          <div className="materials-head" data-reveal>
            <p className="eyebrow">03 / MATERIAL IS PROOF</p>
            <h2>Black Is<br />A Material.</h2>
            <p>Matte. Gloss. Textile. Chrome. Detail is not decoration—it is the argument.</p>
          </div>
          <div className="materials-collage">
            <CinematicMedia asset={seatClose} className="material-a" label="Close seat detail" eyebrow="TEXTURE / 01" />
            <CinematicMedia asset={seatFull} className="material-b" label="Full seat view" eyebrow="FORM / 02" />
            <CinematicMedia asset={cabinWide} className="material-c" label="Cabin rhythm" eyebrow="SYSTEM / 03" />
          </div>
          <Link href="/design-philosophy" className="section-next">View materials <span>→</span></Link>
        </section>

        <section className="pdr-scene atelier-scene" id="atelier" data-camera="atelier">
          <div className="atelier-copy" data-reveal>
            <p className="eyebrow">04 / ATELIER</p>
            <h2>Impossible<br />Made Physical.</h2>
            <p>The finished object is only half the story. Process turns aesthetic intent into capability proof.</p>
            <div className="atelier-steps" aria-label="Transformation chapters">
              {['Arrival', 'Strip', 'Structure', 'Paint', 'Manufacture', 'Completion'].map((step, index) => (
                <span key={step}><i>{String(index + 1).padStart(2, '0')}</i>{step}</span>
              ))}
            </div>
            <Link href="/atelier" className="primary-link">Enter the atelier <span>→</span></Link>
          </div>
          <CinematicMedia asset={processVideo} className="atelier-film" label="Transformation / production film" eyebrow="PROCESS / MOTION" />
        </section>

        <section className="pdr-scene projects-scene" id="projects" data-camera="projects">
          <div className="projects-top" data-reveal>
            <p className="eyebrow">05 / PROJECTS / SELECTIVE</p>
            <h2>Beyond<br />The Aircraft.</h2>
            <p>Productions, selective charter and special-project thinking extend the same attitude into a wider world.</p>
          </div>
          <CinematicMedia asset={charterVideo} className="projects-film" label="Selective charter / project film" eyebrow="MOTION / SELECTIVE" />
          <div className="project-categories" data-reveal>
            <span>PRODUCTIONS</span><span>SELECTIVE CHARTER</span><span>AUTOMOTIVE / CROSSOVER</span><span>SPECIAL PROJECTS</span>
          </div>
          <Link href="/projects" className="section-next">Discuss project <span>→</span></Link>
        </section>

        <section className="pdr-scene proof-scene" id="proof" data-camera="proof">
          <div className="proof-copy" data-reveal>
            <p className="eyebrow">06 / QUIET PROOF</p>
            <h2>Validation,<br />Without The Wall.</h2>
            <div className="proof-fact">
              <span>2024</span>
              <p>International Yacht &amp; Aviation Awards<br /><strong>Private Jet Design</strong></p>
            </div>
            <p className="proof-note">Proof stays inside the narrative. Partner, production and quote references remain approval-sensitive before publication.</p>
          </div>
          <CinematicMedia asset={award} className="proof-media" label="SCK award proof" eyebrow="AWARD / PROOF" />
        </section>

        <section className="pdr-scene access-scene" id="access" data-camera="access">
          <div className="access-intro" data-reveal>
            <p className="eyebrow">07 / ACCESS</p>
            <h2>Experience Our<br />Attitude, Selectively.</h2>
            <p>Tell us what is being transformed, produced or considered. Nothing more than the project needs.</p>
          </div>
          <AccessForm />
        </section>

        <SiteFooter />
      </div>

      <section className={`explore-overlay${exploreMode ? ' open' : ''}`} aria-hidden={!exploreMode} aria-label="Explore OE-LSC">
        <div className="explore-topbar">
          <div><span className="explore-meta">OE-LSC / BLACK STAR</span><strong>INTERACTIVE OBJECT / PROTOTYPE</strong></div>
          <button type="button" className="explore-close" onClick={() => setExploreMode(false)}>EXIT <span>×</span></button>
        </div>
        <div className="explore-instruction" aria-hidden="true"><span>DRAG TO ORBIT</span><span>SCROLL TO ZOOM</span></div>
        <div className="hotspot-layer" aria-label="Aircraft detail hotspots">
          {hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              className={`hotspot${activeHotspot.id === hotspot.id ? ' active' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={() => setActiveHotspot(hotspot)}
              aria-label={`${hotspot.index} ${hotspot.label}`}
            ><span>{hotspot.index}</span></button>
          ))}
        </div>
        <aside className="detail-panel" aria-live="polite">
          <p className="eyebrow">{activeHotspot.index} / {activeHotspot.label}</p>
          <h3>{activeHotspot.title}</h3>
          <p>{activeHotspot.body}</p>
          <div className="detail-index">
            {hotspots.map((hotspot) => (
              <button key={hotspot.id} type="button" className={activeHotspot.id === hotspot.id ? 'active' : ''} onClick={() => setActiveHotspot(hotspot)}>{hotspot.index}</button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
