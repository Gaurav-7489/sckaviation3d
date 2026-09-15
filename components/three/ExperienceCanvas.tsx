'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlaceholderAircraft } from './PlaceholderAircraft';

type ExperienceCanvasProps = {
  entered: boolean;
};

const cameraChapters = [
  { selector: '#hero', position: [8.2, 2.2, 10.8], target: [0, 0.1, 0], rotationY: -0.2 },
  { selector: '#material', position: [4.6, 0.9, 5.8], target: [0.9, 0.05, 0], rotationY: 0.08 },
  { selector: '#aircraft', position: [-7.4, 2.0, 8.7], target: [0, 0, 0], rotationY: 0.34 },
  { selector: '#atelier', position: [2.4, 1.2, 6.1], target: [-0.5, 0, 0], rotationY: -0.48 },
  { selector: '#access', position: [10.2, 3.2, 14.5], target: [0, 0, 0], rotationY: -0.08 },
] as const;

function SceneRig({ entered }: ExperienceCanvasProps) {
  const group = useRef<THREE.Group>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, 0.1, 0));
  const { camera } = useThree();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggers = cameraChapters.map((chapter) => ScrollTrigger.create({
      trigger: chapter.selector,
      start: 'top 58%',
      end: 'bottom 42%',
      onEnter: () => animateTo(chapter),
      onEnterBack: () => animateTo(chapter),
    }));

    function animateTo(chapter: (typeof cameraChapters)[number]) {
      gsap.to(camera.position, {
        x: chapter.position[0],
        y: chapter.position[1],
        z: chapter.position[2],
        duration: 1.65,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
      gsap.to(cameraTarget.current, {
        x: chapter.target[0],
        y: chapter.target[1],
        z: chapter.target[2],
        duration: 1.65,
        ease: 'power3.inOut',
        overwrite: 'auto',
      });
      if (group.current) {
        gsap.to(group.current.rotation, {
          y: chapter.rotationY,
          duration: 1.8,
          ease: 'power3.inOut',
          overwrite: 'auto',
        });
      }
    }

    return () => triggers.forEach((trigger) => trigger.kill());
  }, [camera]);

  useEffect(() => {
    if (!group.current) return;

    if (!entered) {
      group.current.position.set(0, -0.22, 1.4);
      group.current.rotation.y = -0.3;
      group.current.scale.setScalar(0.94);
      return;
    }

    const tl = gsap.timeline();
    tl.to(group.current.position, { y: 0, z: 0, duration: 2.2, ease: 'power3.out' }, 0)
      .to(group.current.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'power3.out' }, 0)
      .to(group.current.rotation, { y: -0.2, duration: 2.4, ease: 'power3.out' }, 0);

    return () => { tl.kill(); };
  }, [entered]);

  useFrame(() => {
    camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={group}>
      <Float speed={0.45} rotationIntensity={0.018} floatIntensity={0.055}>
        <PlaceholderAircraft />
      </Float>
    </group>
  );
}

export function ExperienceCanvas({ entered }: ExperienceCanvasProps) {
  return (
    <div className={`canvas-shell${entered ? ' entered' : ''}`} aria-hidden="true">
      <Canvas
        camera={{ position: [8.2, 2.2, 10.8], fov: 35 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 12, 34]} />
        <ambientLight intensity={0.18} />
        <directionalLight position={[6, 8, 5]} intensity={2.6} />
        <directionalLight position={[-8, 2, -5]} intensity={1.05} />
        <pointLight position={[0, -2, 4]} intensity={0.85} distance={14} />

        <Suspense fallback={null}>
          <SceneRig entered={entered} />
          <Environment preset="warehouse" environmentIntensity={0.3} />
        </Suspense>
      </Canvas>
      <div className="canvas-vignette" />
      <div className="canvas-grain" />
    </div>
  );
}
