import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Preload } from '@react-three/drei';
// Fallback if maath is not installed, though it's usually standard with drei or we can just use Math.random
// Instead of adding maath dependency, I'll generate the sphere array manually to keep it simple.

function generatePoints(count: number, radius: number) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.cbrt(Math.random());

    points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    points[i * 3 + 2] = r * Math.cos(phi);
  }
  return points;
}

function StarAnimation(props: any) {
  const ref = useRef<any>();
  const [sphere] = useState(() => generatePoints(5000, 1.2));

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function StarBackground() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <StarAnimation />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
}
