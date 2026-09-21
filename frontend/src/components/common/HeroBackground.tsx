/**
 * HeroBackground — reusable Three.js animated canvas used in every dark
 * hero section across the store (HomePage, ProductsPage, ProductDetailPage,
 * CartPage, AboutPage).  Renders floating wireframe geometries + sparkles +
 * a star field exactly like the HomePage hero.
 */
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles as ThreeSparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShapes() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[-3, 1, -2]}>
        <mesh>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="#988686" wireframe opacity={0.3} transparent />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5} position={[3, -1, -3]}>
        <mesh>
          <dodecahedronGeometry args={[0.6]} />
          <meshStandardMaterial color="#D1D0D0" wireframe opacity={0.4} transparent />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={2.5} position={[0, -2, -4]}>
        <mesh>
          <icosahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#5C4E4E" wireframe opacity={0.2} transparent />
        </mesh>
      </Float>
      <ThreeSparkles count={100} scale={12} size={2} speed={0.4} opacity={0.2} color="#D1D0D0" />
      <Stars radius={10} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-80">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#D1D0D0" />
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
