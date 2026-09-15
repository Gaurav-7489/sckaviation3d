'use client';

export function PlaceholderAircraft() {
  const matte = { color: '#090909', roughness: 0.72, metalness: 0.08 };
  const gloss = { color: '#151515', roughness: 0.18, metalness: 0.22 };

  return (
    <group rotation={[0, -Math.PI / 2, 0]} scale={1.1}>
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
