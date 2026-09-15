'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlaceholderAircraft } from './PlaceholderAircraft';

type IntroPhase = 'clouds' | 'approach' | 'touchdown';

type ExperienceCanvasProps = {
  introStarted: boolean;
  exploreMode: boolean;
  onIntroPhase: (phase: IntroPhase) => void;
  onIntroComplete: () => void;
};

type Shot = {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  rotationY: number;
};

type CloudState = { opacity: number; drift: number };

const desktopShots: readonly Shot[] = [
  { position: [8.2, 2.2, 10.8], target: [0, 0.1, 0], rotationY: -0.2 },
  { position: [5.7, 1.2, 7.4], target: [0.7, 0.08, 0], rotationY: 0.02 },
  { position: [-7.4, 2.0, 8.7], target: [0, 0, 0], rotationY: 0.34 },
  { position: [3.1, 0.85, 5.9], target: [-0.4, 0.1, 0], rotationY: -0.28 },
  { position: [-4.6, 1.6, 7.4], target: [0.35, 0, 0], rotationY: 0.19 },
  { position: [6.8, 2.4, 9.8], target: [-0.15, 0, 0], rotationY: -0.14 },
  { position: [-7.8, 2.7, 10.4], target: [0, 0, 0], rotationY: 0.28 },
  { position: [10.2, 3.2, 14.5], target: [0, 0, 0], rotationY: -0.08 },
];

const mobileShots: readonly Shot[] = [
  { position: [9.8, 3.0, 14.5], target: [0, 0.15, 0], rotationY: -0.18 },
  { position: [7.5, 2.0, 11.2], target: [0.35, 0.1, 0], rotationY: 0 },
  { position: [-9.2, 2.8, 12.5], target: [0, 0, 0], rotationY: 0.24 },
  { position: [6.2, 2.0, 10.8], target: [-0.3, 0, 0], rotationY: -0.28 },
  { position: [-6.6, 2.1, 10.8], target: [0.2, 0, 0], rotationY: 0.15 },
  { position: [7.8, 2.8, 12.4], target: [0, 0, 0], rotationY: -0.12 },
  { position: [-8.4, 3.1, 13.5], target: [0, 0, 0], rotationY: 0.2 },
  { position: [10.8, 3.8, 16.5], target: [0, 0, 0], rotationY: -0.06 },
];

function Runway({ visible }: { visible: boolean }) {
  const centerMarkers = useMemo(() => Array.from({ length: 19 }, (_, index) => -36 + index * 4), []);
  const edgeLights = useMemo(() => Array.from({ length: 23 }, (_, index) => -38.5 + index * 3.5), []);
  if (!visible) return null;

  return (
    <group>
      <mesh position={[0, -1.28, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 82]} />
        <MeshReflectorMaterial
          blur={[420, 140]}
          resolution={512}
          mixBlur={1}
          mixStrength={0.58}
          roughness={0.7}
          depthScale={0.16}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color="#070708"
          metalness={0.44}
          mirror={0.3}
        />
      </mesh>
      {centerMarkers.map((z) => (
        <mesh key={`center-${z}`} position={[0, -1.266, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.13, 1.6]} />
          <meshBasicMaterial color="#77787a" transparent opacity={0.48} />
        </mesh>
      ))}
      {[-4.45, 4.45].flatMap((x) => edgeLights.map((z) => (
        <mesh key={`${x}-${z}`} position={[x, -1.12, z]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#d8d8d6" emissive="#f4f4ee" emissiveIntensity={4.5} toneMapped={false} />
        </mesh>
      )))}
      {[-9.5, -5.2].map((z) => (
        <group key={`touchdown-${z}`}>
          {[-2.7, -2.0, 2.0, 2.7].map((x) => (
            <mesh key={`${z}-${x}`} position={[x, -1.264, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.22, 2.2]} />
              <meshBasicMaterial color="#a0a0a0" transparent opacity={0.45} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function createCloudTexture() {
  const size = 96;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x / (size - 1)) * 2 - 1;
      const ny = (y / (size - 1)) * 2 - 1;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const edge = THREE.MathUtils.clamp(1 - radius, 0, 1);
      const wave = Math.sin(x * 0.34 + y * 0.17) * 0.08 + Math.sin(x * 0.11 - y * 0.23) * 0.07;
      const alpha = THREE.MathUtils.clamp(Math.pow(edge, 1.35) + wave * edge, 0, 1);
      const offset = (y * size + x) * 4;
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = Math.round(alpha * 255);
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function CloudField({ state }: { state: MutableRefObject<CloudState> }) {
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => createCloudTexture(), []);
  const material = useMemo(() => new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    color: new THREE.Color('#ffffff'),
  }), [texture]);

  const sprites = useMemo(() => {
    let seed = 7183;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    return Array.from({ length: 58 }, () => {
      const scale = 3.2 + random() * 6.8;
      return {
        x: -10.5 + random() * 21,
        y: -4.6 + random() * 10.8,
        z: -19 + random() * 28,
        sx: scale,
        sy: scale * (0.55 + random() * 0.3),
      };
    });
  }, []);

  useFrame((_, delta) => {
    material.opacity = state.current.opacity;
    if (!group.current) return;
    group.current.position.z = state.current.drift;
    group.current.rotation.z += delta * 0.0012;
  });

  useEffect(() => () => {
    material.dispose();
    texture.dispose();
  }, [material, texture]);

  return (
    <group ref={group}>
      {sprites.map((sprite, index) => (
        <sprite key={index} material={material} position={[sprite.x, sprite.y, sprite.z]} scale={[sprite.sx, sprite.sy, 1]} />
      ))}
    </group>
  );
}

function SceneRig({ introStarted, exploreMode, onIntroPhase, onIntroComplete }: ExperienceCanvasProps) {
  const aircraftGroup = useRef<THREE.Group>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, 1.4, -8));
  const scrollProgress = useRef(0);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const cloudState = useRef<CloudState>({ opacity: 1, drift: -2.5 });
  const introFinished = useRef(false);
  const completionSent = useRef(false);
  const [landed, setLanded] = useState(false);
  const [runwayVisible, setRunwayVisible] = useState(false);
  const { camera, size, scene } = useThree();
  const shots = useMemo(() => (size.width <= 720 ? mobileShots : desktopShots), [size.width]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const trigger = ScrollTrigger.create({
      trigger: '.scroll-layer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: reducedMotion ? false : 0.75,
      onUpdate: (self) => { scrollProgress.current = self.progress; },
    });
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      trigger.kill();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  useEffect(() => {
    if (!aircraftGroup.current || introStarted) return;
    introFinished.current = false;
    completionSent.current = false;
    setLanded(false);
    setRunwayVisible(false);
    cloudState.current.opacity = 1;
    cloudState.current.drift = -2.5;
    aircraftGroup.current.position.set(-0.35, 2.45, -18);
    aircraftGroup.current.rotation.set(-0.035, -0.025, -0.014);
    aircraftGroup.current.scale.setScalar(0.5);
    camera.position.set(0, 1.8, 8.8);
    cameraTarget.current.set(0, 1.5, -8);
    if (scene.background instanceof THREE.Color) scene.background.set('#f4f7f8');
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.set('#f4f7f8');
      scene.fog.near = 6;
      scene.fog.far = 32;
    }
  }, [camera, introStarted, scene]);

  useEffect(() => {
    if (!introStarted || !aircraftGroup.current || completionSent.current) return;
    const aircraft = aircraftGroup.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const background = scene.background instanceof THREE.Color ? scene.background : new THREE.Color('#f4f7f8');
    scene.background = background;
    const fog = scene.fog instanceof THREE.Fog ? scene.fog : null;
    const heroShot = shots[0];

    const finish = () => {
      if (completionSent.current) return;
      completionSent.current = true;
      introFinished.current = true;
      setLanded(true);
      onIntroComplete();
    };

    if (reducedMotion) {
      cloudState.current.opacity = 0;
      setRunwayVisible(true);
      background.set('#050507');
      if (fog) {
        fog.color.set('#050507');
        fog.near = 12;
        fog.far = 34;
      }
      aircraft.position.set(0, 0, 0);
      aircraft.rotation.set(0, heroShot.rotationY, 0);
      aircraft.scale.setScalar(1);
      camera.position.set(...heroShot.position);
      cameraTarget.current.set(...heroShot.target);
      const id = window.setTimeout(finish, 120);
      return () => window.clearTimeout(id);
    }

    onIntroPhase('clouds');
    const tl = gsap.timeline({ onComplete: finish, defaults: { overwrite: false } });

    // One uninterrupted physical path: cloud flight -> runway reveal -> flare -> touchdown -> hero.
    tl.to(aircraft.position, { x: -0.08, y: 1.65, z: -7.3, duration: 2.6, ease: 'power1.inOut' }, 0)
      .to(aircraft.rotation, { x: -0.02, y: -0.04, z: -0.004, duration: 2.6, ease: 'power1.inOut' }, 0)
      .to(aircraft.scale, { x: 0.78, y: 0.78, z: 0.78, duration: 2.6, ease: 'power2.out' }, 0)
      .to(camera.position, { x: 0.8, y: 2.15, z: 10.0, duration: 2.6, ease: 'power1.inOut' }, 0)
      .to(cameraTarget.current, { x: 0, y: 1.3, z: -5.4, duration: 2.6, ease: 'power1.inOut' }, 0)
      .to(cloudState.current, { drift: 7.8, duration: 3.2, ease: 'none' }, 0)
      .call(() => setRunwayVisible(true), undefined, 1.75)
      .call(() => onIntroPhase('approach'), undefined, 2.15)
      .to(cloudState.current, { opacity: 0, duration: 1.9, ease: 'power2.inOut' }, 1.75)
      .to(background, { r: 0.0196, g: 0.0196, b: 0.0275, duration: 2.2, ease: 'power2.inOut' }, 1.85)
      .to(fog ? fog.color : background, { r: 0.0196, g: 0.0196, b: 0.0275, duration: 2.2, ease: 'power2.inOut' }, 1.85)
      .to(fog || {}, { near: 11, far: 36, duration: 2.2, ease: 'power1.inOut' }, 1.85)
      .to(aircraft.position, { x: -0.02, y: 0.72, z: -2.7, duration: 2.3, ease: 'power2.in' }, 2.35)
      .to(aircraft.rotation, { x: -0.035, y: -0.11, z: 0, duration: 2.3, ease: 'power2.inOut' }, 2.35)
      .to(aircraft.scale, { x: 0.94, y: 0.94, z: 0.94, duration: 2.3, ease: 'power2.out' }, 2.35)
      .to(camera.position, { x: 4.9, y: 2.75, z: 11.9, duration: 2.3, ease: 'power2.inOut' }, 2.35)
      .to(cameraTarget.current, { x: 0, y: 0.55, z: -2.1, duration: 2.3, ease: 'power2.inOut' }, 2.35)
      .call(() => onIntroPhase('touchdown'), undefined, 4.7)
      .to(aircraft.position, { x: 0, y: 0.04, z: -0.55, duration: 1.0, ease: 'power3.out' }, 4.65)
      .to(aircraft.rotation, { x: 0.012, y: -0.17, z: 0, duration: 1.0, ease: 'power3.out' }, 4.65)
      .to(cameraTarget.current, { x: 0, y: 0.15, z: -0.45, duration: 1.0, ease: 'power3.out' }, 4.65)
      .to(aircraft.position, { x: 0, y: 0, z: 0, duration: 1.65, ease: 'power2.out' }, 5.65)
      .to(aircraft.rotation, { x: 0, y: heroShot.rotationY, z: 0, duration: 1.65, ease: 'power2.out' }, 5.65)
      .to(aircraft.scale, { x: 1, y: 1, z: 1, duration: 1.65, ease: 'power2.out' }, 5.65)
      .to(camera.position, { x: heroShot.position[0], y: heroShot.position[1], z: heroShot.position[2], duration: 1.65, ease: 'power2.inOut' }, 5.65)
      .to(cameraTarget.current, { x: heroShot.target[0], y: heroShot.target[1], z: heroShot.target[2], duration: 1.65, ease: 'power2.inOut' }, 5.65);

    return () => tl.kill();
  }, [camera, introStarted, onIntroComplete, onIntroPhase, scene, shots]);

  useFrame((_, delta) => {
    if (!introFinished.current) {
      camera.lookAt(cameraTarget.current);
      return;
    }
    if (exploreMode) return;

    const scaled = THREE.MathUtils.clamp(scrollProgress.current, 0, 0.9999) * (shots.length - 1);
    const fromIndex = Math.floor(scaled);
    const toIndex = Math.min(fromIndex + 1, shots.length - 1);
    const rawT = scaled - fromIndex;
    const t = rawT * rawT * (3 - 2 * rawT);
    const from = shots[fromIndex];
    const to = shots[toIndex];
    const parallaxX = size.width > 720 ? pointer.current.x * 0.22 : 0;
    const parallaxY = size.width > 720 ? pointer.current.y * 0.1 : 0;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, THREE.MathUtils.lerp(from.position[0], to.position[0], t) + parallaxX, 4.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, THREE.MathUtils.lerp(from.position[1], to.position[1], t) + parallaxY, 4.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, THREE.MathUtils.lerp(from.position[2], to.position[2], t), 4.8, delta);
    cameraTarget.current.x = THREE.MathUtils.damp(cameraTarget.current.x, THREE.MathUtils.lerp(from.target[0], to.target[0], t), 5.2, delta);
    cameraTarget.current.y = THREE.MathUtils.damp(cameraTarget.current.y, THREE.MathUtils.lerp(from.target[1], to.target[1], t), 5.2, delta);
    cameraTarget.current.z = THREE.MathUtils.damp(cameraTarget.current.z, THREE.MathUtils.lerp(from.target[2], to.target[2], t), 5.2, delta);

    if (aircraftGroup.current) {
      aircraftGroup.current.rotation.y = THREE.MathUtils.damp(
        aircraftGroup.current.rotation.y,
        THREE.MathUtils.lerp(from.rotationY, to.rotationY, t),
        4.2,
        delta,
      );
    }
    camera.lookAt(cameraTarget.current);
  });

  return (
    <>
      <CloudField state={cloudState} />
      <Runway visible={runwayVisible} />
      <group ref={aircraftGroup}>
        <Float speed={landed ? 0.35 : 0} rotationIntensity={landed ? 0.01 : 0} floatIntensity={landed ? 0.025 : 0}>
          <PlaceholderAircraft />
        </Float>
      </group>
      <OrbitControls
        enabled={exploreMode && landed}
        enablePan={false}
        enableDamping
        dampingFactor={0.055}
        rotateSpeed={0.42}
        zoomSpeed={0.55}
        minDistance={4.6}
        maxDistance={17}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.61}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function ExperienceCanvas(props: ExperienceCanvasProps) {
  return (
    <div className={`canvas-shell${props.introStarted ? ' entered' : ''}${props.exploreMode ? ' explore' : ''}`} aria-hidden="true">
      <Canvas
        camera={{ fov: 32, near: 0.1, far: 140, position: [0, 1.8, 8.8] }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#f4f7f8']} />
        <fog attach="fog" args={['#f4f7f8', 6, 32]} />
        <ambientLight intensity={0.36} />
        <directionalLight position={[7, 8, 8]} intensity={2.4} />
        <directionalLight position={[-9, 2, 2]} intensity={1.05} />
        <pointLight position={[2, 1, -4]} intensity={5} distance={18} />
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.5} />
          <SceneRig {...props} />
        </Suspense>
      </Canvas>
      <div className="canvas-vignette" />
      <div className="canvas-grain" />
    </div>
  );
}
