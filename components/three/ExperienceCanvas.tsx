'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AircraftModel } from './AircraftModel';
import styles from './ExperienceCanvas.module.css';

export type ExperienceCanvasProps = {
  exploreMode: boolean;
  onReady?: () => void;
};

type KeyboardStep = { horizontal: number; vertical: number; sequence: number };

type SceneRigProps = ExperienceCanvasProps & {
  keyboardStep: KeyboardStep;
  reducedMotion: boolean;
};

const lookAt = new THREE.Vector3(0.15, 0.35, 0);
const modelBounds = new THREE.Box3(new THREE.Vector3(-5.95, -1.48, -6.1), new THREE.Vector3(6.15, 2.08, 6.1));
const corners = Array.from({ length: 8 }, (_, index) => new THREE.Vector3(
  index & 1 ? modelBounds.max.x : modelBounds.min.x,
  index & 2 ? modelBounds.max.y : modelBounds.min.y,
  index & 4 ? modelBounds.max.z : modelBounds.min.z,
).sub(lookAt));
const directions = [
  new THREE.Vector3(-1.2, 0.64, 1.5).normalize(),
  new THREE.Vector3(-0.08, 0.51, 1.7).normalize(),
  new THREE.Vector3(1.25, 0.77, 1.35).normalize(),
];
const worldUp = new THREE.Vector3(0, 1, 0);
const CAMERA_SCROLL_DAMPING = 4.2;

function fittedDistance(direction: THREE.Vector3, camera: THREE.PerspectiveCamera) {
  const right = new THREE.Vector3().crossVectors(worldUp, direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const tanVertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const tanHorizontal = tanVertical * camera.aspect;
  return Math.max(...corners.flatMap((corner) => {
    const depth = corner.dot(direction);
    return [
      depth + Math.abs(corner.dot(right)) / tanHorizontal,
      depth + Math.abs(corner.dot(up)) / tanVertical,
    ];
  })) * 1.1;
}

function BackupAircraft3D() {
  const matte = { color: '#171b20', roughness: 0.52, metalness: 0.32 };
  const gloss = { color: '#252b32', roughness: 0.2, metalness: 0.55 };

  return (
    <group rotation={[0, -Math.PI / 2, 0]} scale={1.18}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.52, 7.4, 12, 32]} />
        <meshStandardMaterial {...matte} />
      </mesh>
      <mesh position={[4.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1.25, 1, 1]}>
        <coneGeometry args={[0.52, 1.7, 32]} />
        <meshStandardMaterial {...gloss} />
      </mesh>
      <mesh position={[-0.5, -0.02, 0]} scale={[3.8, 0.08, 1.05]} rotation={[0, 0.04, 0]}>
        <boxGeometry />
        <meshStandardMaterial {...matte} />
      </mesh>
      <mesh position={[-3.1, 0.05, 0]} scale={[1.55, 0.06, 0.58]}>
        <boxGeometry />
        <meshStandardMaterial {...matte} />
      </mesh>
      <mesh position={[-3.55, 0.82, 0]} rotation={[0, 0, -0.35]} scale={[0.9, 1.55, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial {...matte} />
      </mesh>
      {[-0.72, 0.72].map((z) => (
        <mesh key={z} position={[-2.45, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.36, 0.42, 1.35, 24]} />
          <meshStandardMaterial {...gloss} />
        </mesh>
      ))}
    </group>
  );
}

class AircraftErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <BackupAircraft3D /> : this.props.children; }
}

function SceneRig({ exploreMode, keyboardStep, reducedMotion }: SceneRigProps) {
  const { camera: rawCamera, size } = useThree();
  const camera = rawCamera as THREE.PerspectiveCamera;
  const targetProgress = useRef(0);
  const smoothedProgress = useRef(0);
  const direction = useRef(directions[0].clone());
  const handledKey = useRef(0);

  useEffect(() => {
    const story = document.getElementById('flight-story');
    if (!story) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = story.getBoundingClientRect();
      const stickyTop = window.innerWidth <= 720 ? 64 : 72;
      const travel = Math.max(1, bounds.height - window.innerHeight + stickyTop);
      targetProgress.current = THREE.MathUtils.clamp((stickyTop - bounds.top) / travel, 0, 1);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(story);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    if (!exploreMode || handledKey.current === keyboardStep.sequence) return;
    handledKey.current = keyboardStep.sequence;
    const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(lookAt));
    spherical.theta += keyboardStep.horizontal;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + keyboardStep.vertical, Math.PI * 0.19, Math.PI * 0.53);
    camera.position.setFromSpherical(spherical).add(lookAt);
  }, [camera, exploreMode, keyboardStep]);

  useFrame((_, delta) => {
    if (exploreMode) {
      direction.current.copy(camera.position).sub(lookAt).normalize();
      smoothedProgress.current = targetProgress.current;
    } else if (reducedMotion) {
      direction.current.copy(directions[1]);
      smoothedProgress.current = targetProgress.current;
    } else {
      const safeDelta = Math.max(1 / 120, Math.min(delta, 1 / 30));
      smoothedProgress.current = THREE.MathUtils.damp(
        smoothedProgress.current,
        targetProgress.current,
        CAMERA_SCROLL_DAMPING,
        safeDelta,
      );

      const scaled = smoothedProgress.current * (directions.length - 1);
      const index = Math.min(Math.floor(scaled), directions.length - 2);
      const amount = THREE.MathUtils.smoothstep(scaled - index, 0, 1);
      direction.current.lerpVectors(directions[index], directions[index + 1], amount).normalize();
    }

    camera.position.copy(direction.current).multiplyScalar(fittedDistance(direction.current, camera)).add(lookAt);
    camera.lookAt(lookAt);
  });

  return (
    <>
      <hemisphereLight args={['#343e48', '#050607', 2.35]} />
      <directionalLight position={[-8, 12, 8]} intensity={5.8} color="#ffffff" />
      <directionalLight position={[7, 5, -8]} intensity={4.4} color="#edf0f3" />
      <directionalLight position={[-10, 2, -6]} intensity={2.6} color="#9bb2c5" />
      <directionalLight position={[0, -6, 4]} intensity={1.2} color="#2c3238" />
      <AircraftErrorBoundary>
        <AircraftModel />
      </AircraftErrorBoundary>
      <OrbitControls
        enabled={exploreMode}
        enableZoom={false}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.06}
        rotateSpeed={0.58}
        minPolarAngle={Math.PI * 0.20}
        maxPolarAngle={Math.PI * 0.52}
        target={lookAt}
      />
    </>
  );
}

export function ExperienceCanvas({ exploreMode, onReady }: ExperienceCanvasProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [keyboardStep, setKeyboardStep] = useState<KeyboardStep>({ horizontal: 0, vertical: 0, sequence: 0 });
  const notifyReady = useCallback(() => onReady?.(), [onReady]);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(motion.matches);
    updatePreference();
    motion.addEventListener('change', updatePreference);
    return () => motion.removeEventListener('change', updatePreference);
  }, []);

  return (
    <div
      className={styles.shell}
      role="img"
      tabIndex={exploreMode ? 0 : undefined}
      aria-label={exploreMode ? 'Private jet interactive viewer. Drag or use the arrow keys to turn the aircraft.' : 'Black Star 3D showcase. Scroll down to inspect angles.'}
      onKeyDown={(event) => {
        if (!exploreMode || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const horizontal = event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0;
        const vertical = event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0;
        setKeyboardStep((previous) => ({ horizontal, vertical, sequence: previous.sequence + 1 }));
      }}
    >
      <Canvas
        className={`${styles.canvas} ${exploreMode ? styles.exploring : ''}`}
        frameloop="always"
        camera={{ fov: 31, near: 0.1, far: 150, position: [-18, 9, 22] }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: true, stencil: false }}
        fallback={
          <div className={styles.fallback}>
            <img src="/plane_img.webp" alt="Black Star jet" />
          </div>
        }
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.38;
          notifyReady();
        }}
      >
        <SceneRig
          exploreMode={exploreMode}
          keyboardStep={keyboardStep}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
