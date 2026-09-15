'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlaceholderAircraft } from './PlaceholderAircraft';

type ExperienceCanvasProps = {
  introStarted: boolean;
  exploreMode: boolean;
  onIntroComplete: () => void;
};

type Shot = {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  rotationY: number;
};

const desktopShots: readonly Shot[] = [
  { position: [8.2, 2.2, 10.8], target: [0, 0.1, 0], rotationY: -0.2 },
  { position: [4.6, 0.9, 5.8], target: [0.9, 0.05, 0], rotationY: 0.08 },
  { position: [-7.4, 2.0, 8.7], target: [0, 0, 0], rotationY: 0.34 },
  { position: [2.4, 1.2, 6.1], target: [-0.5, 0, 0], rotationY: -0.48 },
  { position: [10.2, 3.2, 14.5], target: [0, 0, 0], rotationY: -0.08 },
];

const mobileShots: readonly Shot[] = [
  { position: [9.8, 3.0, 14.5], target: [0, 0.15, 0], rotationY: -0.18 },
  { position: [7.0, 1.6, 9.8], target: [0.4, 0, 0], rotationY: 0.02 },
  { position: [-9.2, 2.8, 12.5], target: [0, 0, 0], rotationY: 0.24 },
  { position: [5.5, 2.0, 10.0], target: [-0.4, 0, 0], rotationY: -0.34 },
  { position: [10.8, 3.8, 16.5], target: [0, 0, 0], rotationY: -0.06 },
];

function Runway() {
  const centerMarkers = useMemo(() => Array.from({ length: 13 }, (_, index) => -24 + index * 4), []);
  const edgeLights = useMemo(() => Array.from({ length: 17 }, (_, index) => -28 + index * 3.5), []);

  return (
    <group>
      <mesh position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 64]} />
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

      {[-7.5, -3.2].map((z) => (
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

function SceneRig({ introStarted, exploreMode, onIntroComplete }: ExperienceCanvasProps) {
  const group = useRef<THREE.Group>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, 2, -10));
  const scrollProgress = useRef(0);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const introFinished = useRef(false);
  const completionSent = useRef(false);
  const [landed, setLanded] = useState(false);
  const { camera, size } = useThree();

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
    if (!group.current || introStarted) return;

    introFinished.current = false;
    completionSent.current = false;
    setLanded(false);
    group.current.position.set(-1.8, 5.35, -22);
    group.current.rotation.set(-0.055, -0.06, -0.018);
    group.current.scale.setScalar(0.84);
    camera.position.set(4.5, 4.35, 15.5);
    cameraTarget.current.set(0, 2.1, -10);
  }, [camera, introStarted]);

  useEffect(() => {
    if (!introStarted || !group.current || completionSent.current) return;

    const aircraft = group.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      if (completionSent.current) return;
      completionSent.current = true;
      introFinished.current = true;
      setLanded(true);
      onIntroComplete();
    };

    if (reducedMotion) {
      aircraft.position.set(0, 0, 0);
      aircraft.rotation.set(0, desktopShots[0].rotationY, 0);
      aircraft.scale.setScalar(1);
      camera.position.set(...desktopShots[0].position);
      cameraTarget.current.set(...desktopShots[0].target);
      const id = window.setTimeout(finish, 120);
      return () => window.clearTimeout(id);
    }

    const tl = gsap.timeline({ onComplete: finish });

    tl.addLabel('inbound')
      .to(aircraft.position, {
        x: -0.9,
        y: 3.6,
        z: -10.5,
        duration: 2.55,
        ease: 'power1.inOut',
      }, 'inbound')
      .to(aircraft.rotation, {
        x: -0.075,
        y: -0.1,
        z: -0.008,
        duration: 2.55,
        ease: 'power1.inOut',
      }, 'inbound')
      .to(aircraft.scale, {
        x: 0.92,
        y: 0.92,
        z: 0.92,
        duration: 2.55,
        ease: 'power1.inOut',
      }, 'inbound')
      .to(camera.position, {
        x: 3.7,
        y: 3.55,
        z: 13.2,
        duration: 2.55,
        ease: 'power1.inOut',
      }, 'inbound')
      .to(cameraTarget.current, {
        x: -0.2,
        y: 1.9,
        z: -6.8,
        duration: 2.55,
        ease: 'power1.inOut',
      }, 'inbound')
      .addLabel('approach')
      .to(aircraft.position, {
        x: -0.18,
        y: 1.12,
        z: -2.7,
        duration: 2.2,
        ease: 'power2.in',
      }, 'approach')
      .to(aircraft.rotation, {
        x: -0.035,
        y: -0.145,
        z: 0,
        duration: 2.2,
        ease: 'power2.inOut',
      }, 'approach')
      .to(aircraft.scale, {
        x: 0.98,
        y: 0.98,
        z: 0.98,
        duration: 2.2,
        ease: 'power2.out',
      }, 'approach')
      .to(camera.position, {
        x: 5.6,
        y: 2.65,
        z: 11.9,
        duration: 2.2,
        ease: 'power2.inOut',
      }, 'approach')
      .to(cameraTarget.current, {
        x: 0,
        y: 0.75,
        z: -2.1,
        duration: 2.2,
        ease: 'power2.inOut',
      }, 'approach')
      .addLabel('touchdown')
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
      .addLabel('rollout')
      .to(aircraft.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.55,
        ease: 'power2.out',
      }, 'rollout')
      .to(aircraft.rotation, {
        x: 0,
        y: desktopShots[0].rotationY,
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
        x: desktopShots[0].position[0],
        y: desktopShots[0].position[1],
        z: desktopShots[0].position[2],
        duration: 1.55,
        ease: 'power2.inOut',
      }, 'rollout')
      .to(cameraTarget.current, {
        x: desktopShots[0].target[0],
        y: desktopShots[0].target[1],
        z: desktopShots[0].target[2],
        duration: 1.55,
        ease: 'power2.inOut',
      }, 'rollout');

    return () => tl.kill();
  }, [camera, introStarted, onIntroComplete]);

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

    if (group.current) {
      const rotation = THREE.MathUtils.lerp(from.rotationY, to.rotationY, t);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, rotation, 4.2, delta);
    }

    camera.lookAt(cameraTarget.current);
  });

  return (
    <>
      <group ref={group}>
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

export function ExperienceCanvas({ introStarted, exploreMode, onIntroComplete }: ExperienceCanvasProps) {
  return (
    <div className={`canvas-shell${introStarted ? ' entered' : ''}${exploreMode ? ' explore' : ''}`} aria-hidden="true">
      <Canvas
        camera={{ position: [4.5, 4.35, 15.5], fov: 35 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 10, 42]} />
        <ambientLight intensity={0.11} />
        <directionalLight position={[6, 9, 5]} intensity={3.2} />
        <directionalLight position={[-9, 3, -6]} intensity={1.15} />
        <spotLight position={[1, 8, -1]} intensity={2.3} angle={0.35} penumbra={0.72} distance={28} />
        <pointLight position={[0, -0.8, 5]} intensity={0.72} distance={16} />
        <pointLight position={[0, 3.5, -13]} intensity={0.62} distance={22} color="#cfd8df" />

        <Suspense fallback={null}>
          <SceneRig introStarted={introStarted} exploreMode={exploreMode} onIntroComplete={onIntroComplete} />
          <Runway />
          <Environment preset="warehouse" environmentIntensity={0.24} />
        </Suspense>
      </Canvas>
      <div className="canvas-vignette" />
      <div className="canvas-grain" />
    </div>
  );
}
