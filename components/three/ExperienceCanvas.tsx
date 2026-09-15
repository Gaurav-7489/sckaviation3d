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
  })) * 1.12;
}

type KeyboardStep = { horizontal: number; vertical: number; sequence: number };

function SceneRig({ exploreMode, onReady, keyboardStep }: ExperienceCanvasProps & { keyboardStep: KeyboardStep }) {
  const { camera: rawCamera, invalidate, size } = useThree();
  const camera = rawCamera as THREE.PerspectiveCamera;
  const progress = useRef(0);
  const direction = useRef(directions[0].clone());
  const readySent = useRef(false);
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
      progress.current = THREE.MathUtils.clamp((stickyTop - bounds.top) / travel, 0, 1);
      if (bounds.top < window.innerHeight && bounds.bottom > 0) invalidate();
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
  }, [invalidate]);

  useEffect(() => { invalidate(); }, [exploreMode, invalidate, size.width, size.height]);

  useEffect(() => {
    if (!exploreMode || handledKey.current === keyboardStep.sequence) return;
    handledKey.current = keyboardStep.sequence;
    const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(lookAt));
    spherical.theta += keyboardStep.horizontal;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + keyboardStep.vertical, Math.PI * 0.19, Math.PI * 0.53);
    camera.position.setFromSpherical(spherical).add(lookAt);
    invalidate();
  }, [camera, exploreMode, invalidate, keyboardStep]);

  useFrame(() => {
    if (exploreMode) {
      direction.current.copy(camera.position).sub(lookAt).normalize();
    } else {
      const scaled = progress.current * (directions.length - 1);
      const index = Math.min(Math.floor(scaled), directions.length - 2);
      const amount = THREE.MathUtils.smoothstep(scaled - index, 0, 1);
      direction.current.lerpVectors(directions[index], directions[index + 1], amount).normalize();
    }
    camera.position.copy(direction.current).multiplyScalar(fittedDistance(direction.current, camera)).add(lookAt);
    camera.lookAt(lookAt);
    if (!readySent.current) {
      readySent.current = true;
      onReady?.();
    }
  });

  return (
    <>
      {/* Editorial Luxury Studio Lighting: Rich shadows, high specular rims */}
      <hemisphereLight args={['#20262e', '#030405', 1.8]} />
      <directionalLight position={[-8, 12, 8]} intensity={4.5} color="#ffffff" />
      <directionalLight position={[7, 5, -8]} intensity={3.5} color="#e5c898" />
      <directionalLight position={[-10, 2, -6]} intensity={2.0} color="#7ba6c0" />
      <directionalLight position={[0, -6, 4]} intensity={0.9} color="#1b2126" />
      <AircraftModel />
      <OrbitControls
        enabled={exploreMode}
        enableZoom={false}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.06}
        rotateSpeed={0.65}
        minPolarAngle={Math.PI * 0.20}
        maxPolarAngle={Math.PI * 0.52}
        target={lookAt}
        onChange={() => invalidate()}
      />
    </>
  );
}

class SceneErrorBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ExperienceCanvas({ exploreMode, onReady }: ExperienceCanvasProps) {
  const [canRender, setCanRender] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [keyboardStep, setKeyboardStep] = useState<KeyboardStep>({ horizontal: 0, vertical: 0, sequence: 0 });
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const notifyReady = useCallback(() => { setReady(true); onReady?.(); }, [onReady]);
  const fail = useCallback(() => { setFailed(true); }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setCanRender(!motion.matches);
    };
    updatePreference();
    motion.addEventListener('change', updatePreference);
    return () => motion.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => () => {
    canvasElement.current?.removeEventListener('webglcontextlost', fail);
  }, [fail]);

  const showScene = canRender && !failed;
  return (
    <div
      className={styles.shell}
      role="img"
      tabIndex={exploreMode && showScene ? 0 : undefined}
      aria-label={exploreMode && showScene ? 'Private jet interactive viewer. Drag or use the arrow keys to turn the aircraft.' : 'Black Star 3D showcase. Scroll down to inspect angles.'}
      onKeyDown={(event) => {
        if (!exploreMode || !showScene || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const horizontal = event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0;
        const vertical = event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0;
        setKeyboardStep((previous) => ({ horizontal, vertical, sequence: previous.sequence + 1 }));
      }}
    >
      {(!showScene || !ready) && (
        <div className={styles.fallback}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/plane_img.webp" alt="Black Star private jet" width="1920" height="1080" />
        </div>
      )}
      {showScene && (
        <SceneErrorBoundary onFailure={fail}>
          <Canvas
            className={`${styles.canvas} ${exploreMode ? styles.exploring : ''}`}
            frameloop="demand"
            camera={{ fov: 30, near: 0.1, far: 150, position: [-18, 9, 22] }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
            fallback={<div className={styles.fallback}><img src="/plane_img.webp" alt="Black Star jet" /></div>}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.25;
              canvasElement.current = gl.domElement;
              gl.domElement.addEventListener('webglcontextlost', fail);
            }}
          >
            <SceneRig exploreMode={exploreMode} onReady={notifyReady} keyboardStep={keyboardStep} />
          </Canvas>
        </SceneErrorBoundary>
      )}
    </div>
  );
}