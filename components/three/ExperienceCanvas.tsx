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
type Vec3 = [number, number, number];
type SoftwareFace = { points: Vec3[]; tone: number };

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

class WebGLErrorBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function SceneRig({ exploreMode, keyboardStep, reducedMotion }: SceneRigProps) {
  const { camera: rawCamera } = useThree();
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

function createSoftwareAircraftFaces(): SoftwareFace[] {
  const faces: SoftwareFace[] = [];
  const stations: Array<[number, number]> = [
    [-5.9, 0.08], [-5.45, 0.34], [-4.75, 0.58], [-3.6, 0.72],
    [1.9, 0.72], [3.45, 0.6], [4.7, 0.38], [5.85, 0.07],
  ];
  const segments = 14;
  const rings = stations.map(([x, radius]) => Array.from({ length: segments }, (_, index) => {
    const angle = index / segments * Math.PI * 2;
    return [x, Math.cos(angle) * radius * 0.86, Math.sin(angle) * radius] as Vec3;
  }));

  for (let ring = 0; ring < rings.length - 1; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      faces.push({
        points: [rings[ring][segment], rings[ring][next], rings[ring + 1][next], rings[ring + 1][segment]],
        tone: 40,
      });
    }
  }

  for (const side of [-1, 1]) {
    const s = side as -1 | 1;
    faces.push({
      points: [
        [-1.6, -0.26, 0.28 * s], [-0.3, -0.22, 1.7 * s],
        [3.2, 0.03, 5.9 * s], [3.52, 0.2, 6.08 * s],
        [1.45, 0.02, 4.0 * s],
      ],
      tone: 34,
    });
    faces.push({
      points: [
        [3.85, 1.15, 0.2 * s], [4.55, 1.22, 1.0 * s],
        [5.82, 1.36, 2.15 * s], [5.35, 1.38, 2.3 * s],
        [4.1, 1.26, 1.05 * s],
      ],
      tone: 38,
    });

    const engineX = [1.5, 3.5];
    const engineSegments = 10;
    const engineRings = engineX.map((x) => Array.from({ length: engineSegments }, (_, index) => {
      const angle = index / engineSegments * Math.PI * 2;
      return [x, 0.3 + Math.cos(angle) * 0.37, 1.04 * s + Math.sin(angle) * 0.37] as Vec3;
    }));
    for (let segment = 0; segment < engineSegments; segment += 1) {
      const next = (segment + 1) % engineSegments;
      faces.push({
        points: [engineRings[0][segment], engineRings[0][next], engineRings[1][next], engineRings[1][segment]],
        tone: 48,
      });
    }
  }

  faces.push({
    points: [[3.35, 0.38, -0.05], [4.15, 2.0, -0.05], [5.55, 2.05, -0.05], [5.55, 0.35, -0.05]],
    tone: 43,
  });
  faces.push({
    points: [[3.35, 0.38, 0.05], [5.55, 0.35, 0.05], [5.55, 2.05, 0.05], [4.15, 2.0, 0.05]],
    tone: 43,
  });

  return faces;
}

const SOFTWARE_FACES = createSoftwareAircraftFaces();

function rotateSoftwarePoint(point: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const x1 = point[0] * cy + point[2] * sy;
  const z1 = -point[0] * sy + point[2] * cy;
  const y2 = point[1] * cp - z1 * sp;
  const z2 = point[1] * sp + z1 * cp;
  return [x1, y2, z2];
}

function projectSoftwarePoint(point: Vec3, width: number, height: number) {
  const cameraDistance = 18;
  const focal = Math.min(width, height) * 1.58;
  const depth = Math.max(7, cameraDistance - point[2]);
  const scale = focal / depth;
  return {
    x: width * 0.5 + point[0] * scale,
    y: height * 0.5 - point[1] * scale + height * 0.01,
    scale,
  };
}

function SoftwareAircraftCanvas({ onReady, reducedMotion }: { onReady?: () => void; reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readySent = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 1;
    let height = 1;
    let frame = 0;
    let targetProgress = 0;
    let smoothProgress = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updateScroll = () => {
      const story = document.getElementById('flight-story');
      if (!story) return;
      const bounds = story.getBoundingClientRect();
      const stickyTop = window.innerWidth <= 720 ? 64 : 72;
      const travel = Math.max(1, bounds.height - window.innerHeight + stickyTop);
      targetProgress = Math.min(1, Math.max(0, (stickyTop - bounds.top) / travel));
    };

    const draw = () => {
      smoothProgress += (targetProgress - smoothProgress) * (reducedMotion ? 1 : 0.075);
      const progress = reducedMotion ? 0.5 : smoothProgress;
      const yaw = -0.52 + progress * 1.04;
      const pitch = 0.12 + Math.sin(progress * Math.PI) * 0.055;

      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(width * 0.54, height * 0.52, 0, width * 0.54, height * 0.52, Math.min(width, height) * 0.52);
      glow.addColorStop(0, 'rgba(63, 74, 84, 0.16)');
      glow.addColorStop(0.55, 'rgba(16, 20, 24, 0.07)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const transformed = SOFTWARE_FACES.map((face) => {
        const points = face.points.map((point) => rotateSoftwarePoint(point, yaw, pitch));
        const averageZ = points.reduce((sum, point) => sum + point[2], 0) / points.length;
        return { face, points, averageZ };
      }).sort((a, b) => a.averageZ - b.averageZ);

      for (const item of transformed) {
        const points2d = item.points.map((point) => projectSoftwarePoint(point, width, height));
        const a = item.points[0];
        const b = item.points[1];
        const c = item.points[2];
        const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const nx = ab[1] * ac[2] - ab[2] * ac[1];
        const ny = ab[2] * ac[0] - ab[0] * ac[2];
        const nz = ab[0] * ac[1] - ab[1] * ac[0];
        const length = Math.max(0.0001, Math.hypot(nx, ny, nz));
        const light = Math.abs((nx * -0.25 + ny * 0.72 + nz * 0.64) / length);
        const value = Math.round(Math.min(118, item.face.tone + light * 66));

        context.beginPath();
        context.moveTo(points2d[0].x, points2d[0].y);
        for (let index = 1; index < points2d.length; index += 1) {
          context.lineTo(points2d[index].x, points2d[index].y);
        }
        context.closePath();
        context.fillStyle = `rgb(${value}, ${Math.min(128, value + 5)}, ${Math.min(136, value + 10)})`;
        context.fill();
        context.strokeStyle = 'rgba(205, 215, 224, 0.08)';
        context.lineWidth = 0.7;
        context.stroke();
      }

      const visibleSide = yaw >= 0 ? -0.68 : 0.68;
      context.fillStyle = 'rgba(190, 153, 102, 0.82)';
      for (let index = 0; index < 9; index += 1) {
        const point = rotateSoftwarePoint([-3.45 + index * 0.57, 0.2, visibleSide], yaw, pitch);
        const projected = projectSoftwarePoint(point, width, height);
        const radius = Math.max(1.4, Math.min(3.2, projected.scale * 0.055));
        context.beginPath();
        context.ellipse(projected.x, projected.y, radius * 1.35, radius, 0, 0, Math.PI * 2);
        context.fill();
      }

      context.strokeStyle = 'rgba(238, 242, 246, 0.24)';
      context.lineWidth = 1;
      const nose = projectSoftwarePoint(rotateSoftwarePoint([-5.65, 0.35, 0], yaw, pitch), width, height);
      const tail = projectSoftwarePoint(rotateSoftwarePoint([5.45, 1.1, 0], yaw, pitch), width, height);
      context.beginPath();
      context.moveTo(nose.x, nose.y);
      context.lineTo(tail.x, tail.y);
      context.stroke();

      frame = window.requestAnimationFrame(draw);
    };

    const onScroll = () => updateScroll();
    const onResize = () => {
      resize();
      updateScroll();
    };

    resize();
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    if (!readySent.current) {
      readySent.current = true;
      onReady?.();
    }
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [onReady, reducedMotion]);

  return <canvas ref={canvasRef} className={styles.softwareCanvas} aria-hidden="true" />;
}

function canCreateWebGLContext() {
  try {
    const canvas = document.createElement('canvas');
    const attributes: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: true,
      stencil: false,
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    };
    const context = canvas.getContext('webgl', attributes) as WebGLRenderingContext | null;
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function ExperienceCanvas({ exploreMode, onReady }: ExperienceCanvasProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const [keyboardStep, setKeyboardStep] = useState<KeyboardStep>({ horizontal: 0, vertical: 0, sequence: 0 });
  const notifyReady = useCallback(() => onReady?.(), [onReady]);
  const handleWebGLFailure = useCallback(() => setWebglAvailable(false), []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(motion.matches);
    updatePreference();
    motion.addEventListener('change', updatePreference);
    return () => motion.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    setWebglAvailable(canCreateWebGLContext());
  }, []);

  const useSoftwareRenderer = webglAvailable !== true;

  return (
    <div
      className={styles.shell}
      role="img"
      tabIndex={exploreMode && webglAvailable === true ? 0 : undefined}
      aria-label={webglAvailable === false
        ? 'Black Star aircraft showcase using a software-rendered 3D fallback because WebGL is unavailable.'
        : exploreMode
          ? 'Private jet interactive viewer. Drag or use the arrow keys to turn the aircraft.'
          : 'Black Star 3D showcase. Scroll down to inspect angles.'}
      onKeyDown={(event) => {
        if (!exploreMode || webglAvailable !== true || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const horizontal = event.key === 'ArrowLeft' ? -0.12 : event.key === 'ArrowRight' ? 0.12 : 0;
        const vertical = event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0;
        setKeyboardStep((previous) => ({ horizontal, vertical, sequence: previous.sequence + 1 }));
      }}
    >
      {useSoftwareRenderer ? (
        <SoftwareAircraftCanvas onReady={notifyReady} reducedMotion={reducedMotion} />
      ) : (
        <WebGLErrorBoundary onFailure={handleWebGLFailure}>
          <Canvas
            className={`${styles.canvas} ${exploreMode ? styles.exploring : ''}`}
            frameloop="always"
            camera={{ fov: 31, near: 0.1, far: 150, position: [-18, 9, 22] }}
            dpr={[1, 1.35]}
            gl={{ antialias: true, alpha: true, stencil: false, powerPreference: 'default' }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.38;
              gl.domElement.addEventListener('webglcontextlost', handleWebGLFailure, { once: true });
              notifyReady();
            }}
          >
            <SceneRig
              exploreMode={exploreMode}
              keyboardStep={keyboardStep}
              reducedMotion={reducedMotion}
            />
          </Canvas>
        </WebGLErrorBoundary>
      )}
    </div>
  );
}
