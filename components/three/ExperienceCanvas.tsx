'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AircraftModel } from './AircraftModel';
import styles from './ExperienceCanvas.module.css';

type Shot = { position: [number, number, number]; target: [number, number, number]; fov: number; yaw: number; light: number };
const shots: Shot[] = [
  { position: [-17, 5.8, 18], target: [0.2, 0.3, 0], fov: 31, yaw: -0.10, light: 0.38 },
  { position: [-14, 4.7, 15], target: [0.2, 0.25, 0], fov: 29, yaw: -0.02, light: 0.66 },
  { position: [-7.4, 2.8, 9.4], target: [-0.8, 0.1, 0.2], fov: 26, yaw: 0.08, light: 0.88 },
  { position: [1.5, 3.3, 18], target: [0.7, 0.25, 0], fov: 30, yaw: 0.18, light: 1.0 },
  { position: [13.5, 5.1, 13.5], target: [0.3, 0.4, 0], fov: 29, yaw: 0.29, light: 0.72 },
  { position: [-19, 8.5, 25], target: [0.35, 0.45, 0], fov: 34, yaw: 0.05, light: 1.0 },
];

function SceneRig({ progress, reducedMotion, onReady }: { progress: number; reducedMotion: boolean; onReady?: () => void }) {
  const aircraft = useRef<THREE.Group>(null), key = useRef<THREE.DirectionalLight>(null), rim = useRef<THREE.DirectionalLight>(null);
  const target = useRef(new THREE.Vector3()), position = useRef(new THREE.Vector3()), ready = useRef(false);
  useFrame(({ camera, pointer }, delta) => {
    const scaled = THREE.MathUtils.clamp(progress, 0, .9999) * (shots.length - 1), index = Math.floor(scaled);
    const blend = THREE.MathUtils.smootherstep(scaled - index, 0, 1), from = shots[index], to = shots[Math.min(index + 1, shots.length - 1)], amount = reducedMotion ? 0 : blend;
    position.current.lerpVectors(new THREE.Vector3(...from.position), new THREE.Vector3(...to.position), amount);
    target.current.lerpVectors(new THREE.Vector3(...from.target), new THREE.Vector3(...to.target), amount);
    const damping = 1 - Math.exp(-delta * 3.6), pointerX = reducedMotion ? 0 : pointer.x * .22, pointerY = reducedMotion ? 0 : pointer.y * .12;
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    perspectiveCamera.position.lerp(position.current.clone().add(new THREE.Vector3(pointerX, pointerY, 0)), damping);
    perspectiveCamera.fov = THREE.MathUtils.damp(perspectiveCamera.fov, THREE.MathUtils.lerp(from.fov, to.fov, amount), 4.8, delta); perspectiveCamera.updateProjectionMatrix(); perspectiveCamera.lookAt(target.current);
    if (aircraft.current) { aircraft.current.rotation.y = THREE.MathUtils.damp(aircraft.current.rotation.y, THREE.MathUtils.lerp(from.yaw, to.yaw, amount), 3.4, delta); aircraft.current.rotation.x = THREE.MathUtils.damp(aircraft.current.rotation.x, reducedMotion ? 0 : pointer.y * -.018, 3.5, delta); }
    const light = THREE.MathUtils.lerp(from.light, to.light, amount); if (key.current) key.current.intensity = 5.7 * light; if (rim.current) rim.current.intensity = 3.8 * light;
    if (!ready.current) { ready.current = true; onReady?.(); }
  });
  return <><color attach="background" args={['#010203']} /><fog attach="fog" args={['#010203', 20, 48]} /><hemisphereLight args={['#3b4652', '#010102', .7]} /><directionalLight ref={key} position={[-10, 11, 9]} color="#edf4ff" intensity={2.2} /><directionalLight ref={rim} position={[8, 5, -11]} color="#9eafc2" intensity={1.5} /><directionalLight position={[-4, 1, -10]} color="#f4f7ff" intensity={1.05} /><group ref={aircraft}><AircraftModel /></group><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#05070a" roughness={.42} metalness={.48} /></mesh><ContactShadows position={[0, -1, 0]} opacity={.38} scale={26} blur={2.8} far={18} resolution={512} color="#000000" /></>;
}

class SceneErrorBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; } componentDidCatch() { this.props.onFailure(); } render() { return this.state.failed ? null : this.props.children; }
}

export function ExperienceCanvas({ progress, onReady }: { progress: number; onReady?: () => void }) {
  const [failed, setFailed] = useState(false), [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'), update = () => setReducedMotion(query.matches); update(); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  if (failed) return <div className={styles.fallback}><img src="/plane_img.webp" alt="Black Star private jet" /></div>;
  return <div className={styles.shell} aria-label="Scroll-driven Black Star aircraft presentation"><SceneErrorBoundary onFailure={() => setFailed(true)}><Canvas className={styles.canvas} dpr={[1, 1.5]} camera={{ fov: 31, near: .1, far: 120, position: shots[0].position }} gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1; gl.outputColorSpace = THREE.SRGBColorSpace; }}><SceneRig progress={progress} reducedMotion={reducedMotion} onReady={onReady} /></Canvas></SceneErrorBoundary></div>;
}
