'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlaceholderAircraft } from './PlaceholderAircraft';

type ExperienceCanvasProps = {
  entered: boolean;
  exploreMode: boolean;
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
  return (
    <mesh position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[52, 52]} />
      <MeshReflectorMaterial
        blur={[360, 120]}
        resolution={512}
        mixBlur={1}
        mixStrength={0.5}
        roughness={0.72}
        depthScale={0.12}
        minDepthThreshold={0.35}
        maxDepthThreshold={1.4}
        color="#070708"
        metalness={0.42}
        mirror={0.28}
      />
    </mesh>
  );
}

function SceneRig({ entered, exploreMode }: ExperienceCanvasProps) {
  const group = useRef<THREE.Group>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, 0.1, 0));
  const scrollProgress = useRef(0);
  const pointer = useRef(new THREE.Vector2(0, 0));
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

  useFrame((_, delta) => {
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
        <Float speed={0.42} rotationIntensity={0.014} floatIntensity={0.045}>
          <PlaceholderAircraft />
        </Float>
      </group>

      <OrbitControls
        enabled={exploreMode}
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

export function ExperienceCanvas({ entered, exploreMode }: ExperienceCanvasProps) {
  return (
    <div className={`canvas-shell${entered ? ' entered' : ''}${exploreMode ? ' explore' : ''}`} aria-hidden="true">
      <Canvas
        camera={{ position: [8.2, 2.2, 10.8], fov: 35 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 12, 34]} />
        <ambientLight intensity={0.14} />
        <directionalLight position={[6, 9, 5]} intensity={3.2} />
        <directionalLight position={[-9, 3, -6]} intensity={1.15} />
        <spotLight position={[1, 8, -1]} intensity={2.3} angle={0.35} penumbra={0.72} distance={24} />
        <pointLight position={[0, -0.8, 5]} intensity={0.72} distance={16} />

        <Suspense fallback={null}>
          <SceneRig entered={entered} exploreMode={exploreMode} />
          <Runway />
          <Environment preset="warehouse" environmentIntensity={0.28} />
        </Suspense>
      </Canvas>
      <div className="canvas-vignette" />
      <div className="canvas-grain" />
    </div>
  );
}
