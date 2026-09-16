'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MediaAsset } from '@/lib/media';
import { SiteFooter } from './ui/SiteFooter';
import { SiteNav } from './ui/SiteNav';
const ExperienceCanvas = dynamic(() => import('./three/ExperienceCanvas').then((m) => m.ExperienceCanvas), { ssr: false, loading: () => <div className="cinematic-loader">SCK / BLACK STAR</div> });
gsap.registerPlugin(ScrollTrigger);
const scenes = [
  { tag: 'SCK AVIATION / VIENNA', title: <>ATTITUDE<br />WITH ALTITUDE.</>, body: <>Some aircraft take you places.<br />This one makes a statement.</>, align: 'left' },
  { tag: '01 / PRESENCE', title: <>PRESENCE<br />BEFORE<br />TAKEOFF.</>, body: <>A silhouette engineered to arrive long before it lands.</>, align: 'left' },
  { tag: '02 / PRECISION', title: <>PRECISION<br />AT EVERY<br />ANGLE.</>, body: <>Nothing incidental. Every surface has a reason.</>, align: 'right' },
  { tag: '03 / MOTION', title: <>DESIGNED<br />FOR THE<br />DISTANCE.</>, body: <>The feeling of movement, before the wheels leave the ground.</>, align: 'left' },
  { tag: '04 / IDENTITY', title: <>PRIVATE AVIATION.<br /><i>PERSONAL ATTITUDE.</i></>, body: <>European clarity. A singular point of view.</>, align: 'right' },
  { tag: '05 / RELEASE', title: <>THE SKY,<br />ON YOUR TERMS.</>, body: <>Black Star is only the beginning.</>, align: 'left' },
];
export function Experience({ media: _media }: { media: MediaAsset[] }) {
  const story = useRef<HTMLElement>(null); const [progress, setProgress] = useState(0); const [active, setActive] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({ lerp: reduced ? 1 : .085, smoothWheel: !reduced, syncTouch: false, wheelMultiplier: .92 });
    lenis.on('scroll', ScrollTrigger.update); const ticker = (time: number) => lenis.raf(time * 1000); gsap.ticker.add(ticker); gsap.ticker.lagSmoothing(0);
    const trigger = ScrollTrigger.create({ trigger: story.current, start: 'top top', end: 'bottom bottom', scrub: .25, onUpdate: (self) => { setProgress(self.progress); setActive(Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length))); } });
    return () => { trigger.kill(); gsap.ticker.remove(ticker); lenis.destroy(); };
  }, []);
  return <main className="sck-home cinematic-home" id="main-content"><SiteNav />
    <section className="cinematic-story" ref={story} aria-label="SCK Aviation cinematic aircraft experience"><div className="cinematic-stage"><ExperienceCanvas progress={progress} /><div className="cinematic-vignette" aria-hidden="true" /><div className="cinematic-top"><span>SCK AVIATION</span><span>VIENNA / PRIVATE AVIATION</span></div><div className={`scene-copy scene-${scenes[active].align}`}><p>{scenes[active].tag}</p><h1>{scenes[active].title}</h1><div className="scene-bottom"><span>{scenes[active].body}</span>{active === 5 && <Link href="/aircraft">EXPLORE THE AIRCRAFT <b>↗</b></Link>}</div></div><div className="scene-progress" aria-label={`Scene ${active + 1} of ${scenes.length}`}>{scenes.map((_, index) => <span key={index} className={index <= active ? 'active' : ''} />)}</div><a className="cinematic-scroll" href="#release">SCROLL TO DIRECT <span>↓</span></a></div></section>
    <section className="cinematic-release" id="release"><p>VIENNA / SELECTIVELY</p><h2>BEYOND<br /><span>THE EXPECTED.</span></h2><Link href="/access">BEGIN A PRIVATE CONVERSATION <b>↗</b></Link></section><SiteFooter />
  </main>;
}
