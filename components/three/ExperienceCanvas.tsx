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

type CloudState = {
  opacity: number;
  drift: number;
};

const desktopShots: readonly Shot[] = [
  { position: [8.2, 2.2, 10.8], target: [0, 0.1, 0], rotationY: -0.2 },
  { position: [4.6, 0.9, 5.8], target: [0.9, 0.05, 0], rotationY: 0.08 },
  { position: [-7.4, 2.0, 8.7], target: [0, 0, 0], rotationY: 0.34 },
  { position: [2.4, 1.2, 6.1], target: [-0.5, 0, 0], rotationY: -0.48 },
  { position: [-3.8, 1.65, 7.8], target: [0.35, 0.05, 0], rotationY: 0.2 },
  { position: [10.2, 3.2, 14.5], target: [0, 0, 0], rotationY: -0.08 },
];

const mobileShots: readonly Shot[] = [
  { position: [9.8, 3.0, 14.5], target: [0, 0.15, 0], rotationY: -0.18 },
  { position: [7.0, 1.6, 9.8], target: [0.4, 0, 0], rotationY: 0.02 },
  { position: [-9.2, 2.8, 12.5], target: [0, 0, 0], rotationY: 0.24 },
  { position: [5.5, 2.0, 10.0], target: [-0.4, 0, 0], rotationY: -0.34 },
  { position: [-6.6, 2.1, 10.8], target: [0.2, 0, 0], rotationY: 0.15 },
  { position: [10.8, 3.8, 16.5], target: [0, 0, 0], rotationY: -0.06 },
];

function Runway() {
  const centerMarkers = useMemo(() => Array.from({ length: 17 }, (_, index) => -32 + index * 4), []);
  const edgeLights = useMemo(() => Array.from({ length: 21 }, (_, index) => -35 + index * 3.5), []);

  return (
    <group>
      <mesh position={[0, -1.28, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 78]} />
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
          <meshBasicMaterial color="#6f7072" transparent opacity={0.55} />
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
              <meshBasicMaterial color="#9b9b99" transparent opacity={0.5} />
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

    return Array.from({ length: 52 }, () => {
      const scale = 3.2 + random() * 6.2;
      return {
        x: -10 + random() * 20,
        y: -4.5 + random() * 10.5,
        z: -19 + random() * 27,
        sx: scale,
        sy: scale * (0.55 + random() * 0.3),
      };
    });
  }, []);

  useFrame((_, delta) => {
    material.opacity = state.current.opacity;
    if (!group.current) return;
    group.current.position.z = state.current.drift;
    group.current.rotation.z += delta * 0.0015;
  });

  useEffect(() => () => {
    material.dispose();
    texture.dispose();
  }, [material, texture]);

  return (
    <group ref={group}>
      {sprites.map((sprite, index) => (
        <sprite
          key={index}
          material={material}
          position={[sprite.x, sprite.y, sprite.z]}
          scale={[sprite.sx, sprite.sy, 1]}
        />
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
      scrub: reducedMotion ? false : 0.7,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
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

    aircraftGroup.current.position.set(-0.2, 1.6, -16);
    aircraftGroup.current.rotation.set(-0.025, -0.02, -0.012);
    aircraftGroup.current.scale.setScalar(0.58);
    camera.position.set(0, 1.75, 9.4);
    cameraTarget.current.set(0, 1.35, -8);

    if (scene.background instanceof THREE.Color) scene.background.set('#f4f7f8');
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.set('#f4f7f8');
      scene.fog.near = 7;
      scene.fog.far = 34;
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

    const tl = gsap.timeline({ onComplete: finish });

    tl.addLabel('cloud-flight', 0)
      .to(aircraft.position, {
        x: 0.08,
        y: 1.05,
        z: -5.2,
        duration: 2.85,
        ease: 'power2.inOut',
      }, 'cloud-flight')
      .to(aircraft.rotation, {
        x: -0.015,
        y: -0.035,
        z: 0,
        duration: 2.85,
        ease: 'power2.inOut',
      }, 'cloud-flight')
      .to(aircraft.scale, {
        x: 0.88,
        y: 0.88,
        z: 0.88,
        duration: 2.85,
        ease: 'power2.out',
      }, 'cloud-flight')
      .to(camera.position, {
        x: 0.9,
        y: 2.15,
        z: 10.8,
        duration: 2.85,
        ease: 'power2.inOut',
      }, 'cloud-flight')
      .to(cameraTarget.current, {
        x: 0,
        y: 1.1,
        z: -4.4,
        duration: 2.85,
        ease: 'power2.inOut',
      }, 'cloud-flight')
      .to(cloudState.current, {
        drift: 7.5,
        duration: 3.05,
        ease: 'none',
      }, 'cloud-flight')
      .to(cloudState.current, {
        opacity: 0.2,
        duration: 1.45,
        ease: 'power2.out',
      }, 1.4)
      .to(background, {
        r: 0.82,
        g: 0.86,
        b: 0.9,
        duration: 1.2,
        ease: 'power1.inOut',
      }, 1.55)
      .call(() => {
        onIntroPhase('approach');
        setRunwayVisible(true);
        aircraft.position.set(-1.8, 5.3, -22);
        aircraft.rotation.set(-0.055, -0.06, -0.018);
        aircraft.scale.setScalar(0.84);
        camera.position.set(4.5, 4.35, 15.5);
        cameraTarget.current.set(0, 2.1, -10);
      }, undefined, 2.85)
      .to(cloudState.current, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
      }, 2.85)
      .to(background, {
        r: 0.0196,
        g: 0.0196,
        b: 0.0275,
        duration: 1.2,
        ease: 'power2.inOut',
      }, 2.85);

    if (fog) {
      tl.to(fog.color, {
        r: 0.0196,
        g: 0.0196,
        b: 0.0275,
        duration: 1.2,
        ease: 'power2.inOut',
      }, 2.85)
        .to(fog, { near: 12, far: 34, duration: 1.2, ease: 'power2.inOut' }, 2.85);
    }

    tl.addLabel('approach-one', 3.05)
      .to(aircraft.position, {
        x: -0.9,
        y: 3.55,
        z: -10.5,
        duration: 2.25,
        ease: 'power1.inOut',
      }, 'approach-one')
      .to(aircraft.rotation, {
        x: -0.075,
        y: -0.1,
        z: -0.008,
        duration: 2.25,
        ease: 'power1.inOut',
      }, 'approach-one')
      .to(aircraft.scale, {
        x: 0.92,
        y: 0.92,
        z: 0.92,
        duration: 2.25,
        ease: 'power1.inOut',
      }, 'approach-one')
      .to(camera.position, {
        x: 3.7,
        y: 3.55,
        z: 13.2,
        duration: 2.25,
        ease: 'power1.inOut',
      }, 'approach-one')
      .to(cameraTarget.current, {
        x: -0.2,
        y: 1.9,
        z: -6.8,
        duration: 2.25,
        ease: 'power1.inOut',
      }, 'approach-one')
      .addLabel('approach-two', 5.3)
      .to(aircraft.position, {
        x: -0.18,
        y: 1.12,
        z: -2.7,
        duration: 1.95,
        ease: 'power2.in',
      }, 'approach-two')
      .to(aircraft.rotation, {
        x: -0.035,
        y: -0.145,
        z: 0,
        duration: 1.95,
        ease: 'power2.inOut',
      }, 'approach-two')
      .to(aircraft.scale, {
        x: 0.98,
        y: 0.98,
        z: 0.98,
        duration: 1.95,
        ease: 'power2.out',
      }, 'approach-two')
      .to(camera.position, {
        x: 5.6,
        y: 2.65,
        z: 11.9,
        duration: 1.95,
        ease: 'power2.inOut',
      }, 'approach-two')
      .to(cameraTarget.current, {
        x: 0,
        y: 0.75,
        z: -2.1,
        duration: 1.95,
        ease: 'power2.inOut',
      }, 'approach-two')
      .call(() => onIntroPhase('touchdown'), undefined, 7.25)
      .addLabel('touchdown', 7.25)
      .to(aircraft.position, {
        x: 0,
        y: 0.06,
        z: -0.6,
        duration: 1.05,
        ease: 'power3.out',
      }, 'touchdown')
      .to(aircraft.rotation, {
        x: 0.012,
        y: -0.18,
        z: 0,
        duration: 1.05,
        ease: 'power3.out',
      }, 'touchdown')
      .to(cameraTarget.current, {
        x: 0,
        y: 0.18,
        z: -0.4,
        duration: 1.05,
        ease: 'power3.out',
      }, 'touchdown')
      .addLabel('rollout', 8.3)
      .to(aircraft.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.55,
        ease: 'power2.out',
      }, 'rollout')
      .to(aircraft.rotation, {
        x: 0,
        y: heroShot.rotationY,
        z: 0,
        duration: 1.55,
        ease: 'power2.out',
      }, 'rollout')
      .to(aircraft.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.55,
        ease: 'power2.out',
      }, 'rollout')
      .to(camera.position, {
        x: heroShot.position[0],
        y: heroShot.position[1],
        z: heroShot.position[2],
        duration: 1.55,
        ease: 'power2.inOut',
      }, 'rollout')
      .to(cameraTarget.current, {
        x: heroShot.target[0],
        y: heroShot.target[1],
        z: heroShot.target[2],
        duration: 1.55,
        ease: 'power2.inOut',
      }, 'rollout');

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

    const parallaxX = size.width > 720 ? pointer.current.x * 0.28 : 0;
    const parallaxY = size.width > 720 ? pointer.current.y * 0.12 : 0;

    const desiredX = THREE.MathUtils.lerp(from.position[0], to.position[0], t) + parallaxX;
    const desiredY = THREE.MathUtils.lerp(from.position[1], to.position[1], t) + parallaxY;
    const desiredZ = THREE.MathUtils.lerp(from.position[2], to.position[2], t);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredX, 4.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredY, 4.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredZ, 4.8, delta);

    cameraTarget.current.x = THREE.MathUtils.damp(
      cameraTarget.current.x,
      THREE.MathUtils.lerp(from.target[0], to.target[0], t),
      5.2,
      delta,
    );
    cameraTarget.current.y = THREE.MathUtils.damp(
      cameraTarget.current.y,
      THREE.MathUtils.lerp(from.target[1], to.target[1], t),
      5.2,
      delta,
    );
    cameraTarget.current.z = THREE.MathUtils.damp(
      cameraTarget.current.z,
      THREE.MathUtils.lerp(from.target[2], to.target[2], t),
      5.2,
      delta,
    );

    if (aircraftGroup.current) {
      const rotation = THREE.MathUtils.lerp(from.rotationY, to.rotationY, t);
      aircraftGroup.current.rotation.y = THREE.MathUtils.damp(aircraftGroup.current.rotation.y, rotation, 4.2, delta);
    }

    camera.lookAt(cameraTarget.current);
  });

  return (
    <>
      <CloudField state={cloudState} />

      <group visible={runwayVisible}>
        <Runway />
      </group>

      <group ref={aircraftGroup}>
        <Float
          speed={landed ? 0.42 : 0}
          rotationIntensity={landed ? 0.014 : 0}
          floatIntensity={landed ? 0.045 : 0}
        >
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
        minDistance={5.2}
        maxDistance={13.5}
        minPolarAngle={Math.PI * 0.31}
        maxPolarAngle={Math.PI * 0.61}
        minAzimuthAngle={-Math.PI * 0.72}
        maxAzimuthAngle={Math.PI * 0.72}
        target={[0, -0.05, 0]}
      />
    </>
  );
}

export function ExperienceCanvas({ introStarted, exploreMode, onIntroPhase, onIntroComplete }: ExperienceCanvasProps) {
  return (
    <div className={`canvas-shell${introStarted ? ' entered' : ''}${exploreMode ? ' explore' : ''}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.75, 9.4], fov: 35 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        <color attach="background" args={['#f4f7f8']} />
        <fog attach="fog" args={['#f4f7f8', 7, 34]} />
        <ambientLight intensity={0.14} />
        <directionalLight position={[6, 9, 5]} intensity={3.2} />
        <directionalLight position={[-9, 3, -6]} intensity={1.15} />
        <spotLight position={[1, 8, -1]} intensity={2.3} angle={0.35} penumbra={0.72} distance={24} />
        <pointLight position={[0, -0.8, 5]} intensity={0.72} distance={16} />

        <Suspense fallback={null}>
          <SceneRig
            introStarted={introStarted}
            exploreMode={exploreMode}
            onIntroPhase={onIntroPhase}
            onIntroComplete={onIntroComplete}
          />
          <Environment preset="warehouse" environmentIntensity={0.28} />
        </Suspense>
      </Canvas>
      <div className="canvas-vignette" />
      <div className="canvas-grain" />
    </div>
  );
}
