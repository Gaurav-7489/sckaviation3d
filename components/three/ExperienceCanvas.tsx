'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlaceholderAircraft } from './PlaceholderAircraft';

function SceneRig() {
  const group = useRef<THREE.Group>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const chapters = [
      { selector: '#hero', position: [8, 2.4, 10], target: [0, 0, 0], rotationY: -0.22 },
      { selector: '#material', position: [4.5, 1.1, 5.6], target: [0.8, 0, 0], rotationY: 0.08 },
      { selector: '#aircraft', position: [-7.5, 2.2, 8.5], target: [0, 0, 0], rotationY: 0.34 },
      { selector: '#access', position: [10, 3.5, 14], target: [0, 0, 0], rotationY: -0.1 },
    ];

    const triggers = chapters.map((chapter) => ScrollTrigger.create({
      trigger: chapter.selector,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => animate(chapter),
      onEnterBack: () => animate(chapter),
    }));

    function animate(chapter: (typeof chapters)[number]) {
      const camera = (window as unknown as { __sckCamera?: THREE.PerspectiveCamera }).__sckCamera;
      if (!camera) return;
      gsap.to(camera.position, { x: chapter.position[0], y: chapter.position[1], z: chapter.position[2], duration: 1.5, ease: 'power3.inOut' });
      gsap.to(cameraTarget.current, { x: chapter.target[0], y: chapter.target[1], z: chapter.target[2], duration: 1.5, ease: 'power3.inOut' });
      if (group.current) gsap.to(group.current.rotation, { y: chapter.rotationY, duration: 1.7, ease: 'power3.inOut' });
    }

    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  useFrame(({ camera }) => {
    (window as unknown as { __sckCamera?: THREE.Camera }).__sckCamera = camera;
    camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={group}>
      <Float speed={0.6} rotationIntensity={0.025} floatIntensity={0.08}>
        <PlaceholderAircraft />
      </Float>
    </group>
  );
}

export function ExperienceCanvas() {
  return (
    <div className="canvas-shell" aria-hidden="true">
      <Canvas camera={{ position: [8, 2.4, 10], fov: 35 }} dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 12, 34]} />
        <ambientLight intensity={0.22} />
        <directionalLight position={[6, 8, 5]} intensity={2.8} />
        <directionalLight position={[-8, 2, -5]} intensity={1.2} />
        <Suspense fallback={null}>
          <SceneRig />
          <Environment preset="warehouse" environmentIntensity={0.35} />
        </Suspense>
      </Canvas>
    </div>
  );
}
