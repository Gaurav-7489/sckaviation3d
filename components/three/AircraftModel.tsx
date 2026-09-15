'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

type WingStation = { span: number; leading: number; trailing: number; height: number; thickness: number };

/** A closed, tapered airfoil. Each station is a rounded cross-section, not a box. */
function airfoilGeometry(stations: WingStation[], side = 1) {
  const steps = 20;
  const ringSize = steps * 2;
  const vertices: number[] = [];
  const indices: number[] = [];
  stations.forEach((station) => {
    for (let i = 0; i < ringSize; i += 1) {
      const upper = i <= steps;
      const t = upper ? i / steps : (ringSize - i) / steps;
      const section = Math.pow(Math.sin(Math.PI * t), 0.7);
      vertices.push(
        THREE.MathUtils.lerp(station.leading, station.trailing, t),
        station.height + section * station.thickness * (upper ? 1 : -0.45),
        station.span * side,
      );
    }
  });
  for (let row = 0; row < stations.length - 1; row += 1) {
    for (let i = 0; i < ringSize; i += 1) {
      const a = row * ringSize + i;
      const b = row * ringSize + (i + 1) % ringSize;
      const c = a + ringSize;
      const d = b + ringSize;
      if (side > 0) indices.push(a, b, c, b, d, c);
      else indices.push(a, c, b, b, c, d);
    }
  }
  for (const row of [0, stations.length - 1]) {
    const start = row * ringSize;
    for (let i = 1; i < ringSize - 1; i += 1) {
      indices.push(start, start + i, start + i + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function glassGeometry(points: [number, number][], profile: THREE.Vector3[], side: number) {
  const vertices: number[] = [];
  const indices: number[] = [];
  const divisions = 8;
  for (let row = 0; row <= divisions; row += 1) {
    const v = row / divisions;
    for (let col = 0; col <= divisions; col += 1) {
      const u = col / divisions;
      const x = THREE.MathUtils.lerp(THREE.MathUtils.lerp(points[0][0], points[1][0], u), THREE.MathUtils.lerp(points[3][0], points[2][0], u), v);
      const angle = THREE.MathUtils.lerp(THREE.MathUtils.lerp(points[0][1], points[1][1], u), THREE.MathUtils.lerp(points[3][1], points[2][1], u), v);
      const segment = Math.max(0, profile.findIndex((point) => point.y >= x) - 1);
      const from = profile[segment];
      const to = profile[Math.min(segment + 1, profile.length - 1)];
      const radius = THREE.MathUtils.lerp(from.x, to.x, (x - from.y) / (to.y - from.y)) + 0.012;
      vertices.push(x, Math.cos(angle) * radius * 0.88, Math.sin(angle) * radius * side);
      if (row < divisions && col < divisions) {
        const a = row * (divisions + 1) + col;
        const b = a + divisions + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const mainWing: WingStation[] = [
  { span: 0.38, leading: -1.35, trailing: 2.15, height: -0.32, thickness: 0.17 },
  { span: 1.8, leading: -0.3, trailing: 2.55, height: -0.26, thickness: 0.14 },
  { span: 4.2, leading: 1.43, trailing: 3.08, height: -0.09, thickness: 0.085 },
  { span: 5.65, leading: 2.68, trailing: 3.47, height: 0.13, thickness: 0.042 },
  { span: 5.9, leading: 2.95, trailing: 3.52, height: 0.35, thickness: 0.03 },
  { span: 6.04, leading: 3.16, trailing: 3.56, height: 1.02, thickness: 0.02 },
];
const tailWing: WingStation[] = [
  { span: 0.05, leading: 4.0, trailing: 5.64, height: 1.87, thickness: 0.07 },
  { span: 1.3, leading: 4.78, trailing: 5.9, height: 1.92, thickness: 0.05 },
  { span: 2.15, leading: 5.48, trailing: 6.06, height: 1.97, thickness: 0.025 },
];

function Engine({ side }: { side: number }) {
  const fanGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    for (let blade = 0; blade < 18; blade += 1) {
      const angle = blade / 18 * Math.PI * 2;
      const point = (radius: number, offset: number) => [1.57, 0.29 + Math.sin(angle + offset) * radius, side * 1.03 + Math.cos(angle + offset) * radius];
      vertices.push(...point(0.075, 0), ...point(0.30, 0.04), ...point(0.30, 0.19));
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, [side]);
  return (
    <group>
      <mesh position={[2.66, 0.22, side * 0.7]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[1.48, 0.13, 0.72]} />
        <meshStandardMaterial color="#252d31" roughness={0.42} metalness={0.55} />
      </mesh>
      <mesh position={[2.55, 0.29, side * 1.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.44, 2.05, 40, 1, true]} />
        <meshStandardMaterial color="#292e32" roughness={0.37} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.53, 0.29, side * 1.03]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.405, 0.037, 8, 40]} />
        <meshStandardMaterial color="#b1b9bb" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[1.59, 0.29, side * 1.03]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.365, 40]} />
        <meshBasicMaterial color="#080c0e" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={fanGeometry}>
        <meshStandardMaterial color="#69767c" roughness={0.45} metalness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.48, 0.29, side * 1.03]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.086, 0.21, 20]} />
        <meshStandardMaterial color="#758186" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[3.58, 0.29, side * 1.03]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.315, 0.031, 8, 32]} />
        <meshStandardMaterial color="#4c5355" metalness={0.9} roughness={0.38} />
      </mesh>
      <mesh position={[3.54, 0.29, side * 1.03]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial color="#050709" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function LandingGear({ position, front = false }: { position: [number, number, number]; front?: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.27, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 0.6, 10]} />
        <meshStandardMaterial color="#819093" metalness={0.85} roughness={0.26} />
      </mesh>
      <mesh position={[0.06, -0.13, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.025, 0.025, 0.43, 8]} />
        <meshStandardMaterial color="#5d686d" metalness={0.85} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, -0.63, side * (front ? 0.095 : 0.16)]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[front ? 0.18 : 0.25, front ? 0.18 : 0.25, front ? 0.1 : 0.17, 20]} />
            <meshStandardMaterial color="#101416" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, side * (front ? 0.055 : 0.09)]}>
            <circleGeometry args={[front ? 0.085 : 0.13, 16]} />
            <meshStandardMaterial color="#899497" roughness={0.35} metalness={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** An original business-jet study with swept airfoils, rear turbofans and a T-tail. */
export function AircraftModel() {
  const geometry = useMemo(() => {
    const profile = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.012, -5.82, 0),
      new THREE.Vector3(0.24, -5.48, 0),
      new THREE.Vector3(0.49, -5.02, 0),
      new THREE.Vector3(0.67, -4.35, 0),
      new THREE.Vector3(0.70, -3.45, 0),
      new THREE.Vector3(0.70, 1.9, 0),
      new THREE.Vector3(0.62, 3.0, 0),
      new THREE.Vector3(0.39, 4.15, 0),
      new THREE.Vector3(0.16, 5.1, 0),
      new THREE.Vector3(0.008, 5.82, 0),
    ]);
    const profilePoints = profile.getPoints(100);
    const fuselage = new THREE.LatheGeometry(profilePoints.map((point) => new THREE.Vector2(Math.max(0.008, point.x), point.y)), 48);
    fuselage.rotateZ(-Math.PI / 2);
    const fin = new THREE.ExtrudeGeometry(new THREE.Shape([
      new THREE.Vector2(2.93, 0.34), new THREE.Vector2(4.05, 1.95),
      new THREE.Vector2(5.5, 1.99), new THREE.Vector2(5.52, 0.13),
    ]), { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.025 });
    fin.translate(0, 0, -0.05);
    const windscreens = [-1, 1].map((side) => glassGeometry([
      [-4.98, 0.19], [-4.4, 0.32], [-4.5, 1.0], [-5.22, 0.81],
    ], profilePoints, side));
    const cockpitSides = [-1, 1].map((side) => glassGeometry([
      [-4.3, 0.38], [-3.91, 0.44], [-3.92, 1.03], [-4.4, 1.02],
    ], profilePoints, side));
    return {
      fuselage, fin, windscreens, cockpitSides,
      wings: [-1, 1].map((side) => airfoilGeometry(mainWing, side)),
      tails: [-1, 1].map((side) => airfoilGeometry(tailWing, side)),
    };
  }, []);
  return (
    <group>
      <mesh geometry={geometry.fuselage} scale={[1, 0.88, 1]}>
        <meshStandardMaterial color="#242b2f" roughness={0.42} metalness={0.58} />
      </mesh>
      {geometry.wings.map((wing, index) => (
        <mesh key={`wing-${index}`} geometry={wing}>
          <meshStandardMaterial color="#232b30" roughness={0.43} metalness={0.55} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={geometry.fin}>
        <meshStandardMaterial color="#303b40" roughness={0.4} metalness={0.6} />
      </mesh>
      {geometry.tails.map((tail, index) => (
        <mesh key={`tail-${index}`} geometry={tail}>
          <meshStandardMaterial color="#2b353a" roughness={0.4} metalness={0.55} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[...geometry.windscreens, ...geometry.cockpitSides].map((pane, index) => (
        <mesh key={`cockpit-${index}`} geometry={pane}>
          <meshStandardMaterial color="#111f27" emissive="#0d1d25" emissiveIntensity={0.35} roughness={0.12} metalness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Engine side={side} />
          {Array.from({ length: 9 }, (_, index) => (
            <group key={index} position={[-3.37 + index * 0.58, 0.2, side * 0.669]} rotation={[side * -0.24, 0, 0]}>
              <mesh scale={[0.109, 0.165, 1]}>
                <circleGeometry args={[1, 20]} />
                <meshStandardMaterial color="#939c9e" metalness={0.9} roughness={0.28} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0, side * 0.006]} scale={[0.09, 0.14, 1]}>
                <circleGeometry args={[1, 20]} />
                <meshStandardMaterial color="#101e27" emissive="#142934" emissiveIntensity={0.55} roughness={0.16} metalness={0.7} side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
          <mesh position={[-0.61, -0.04, side * 0.703]}>
            <boxGeometry args={[6.38, 0.018, 0.01]} />
            <meshStandardMaterial color="#b5a18a" roughness={0.42} metalness={0.7} />
          </mesh>
          <mesh position={[3.45, 0.45, side * 6.04]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color={side > 0 ? '#89b7a2' : '#cf8f88'} />
          </mesh>
          <LandingGear position={[0.97, -0.32, side * 1.25]} />
        </group>
      ))}
      <LandingGear front position={[-4.0, -0.5, 0]} />
      <mesh position={[0.4, 0.644, 0]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.06, 0.21, 4, 8]} />
        <meshStandardMaterial color="#566268" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}
