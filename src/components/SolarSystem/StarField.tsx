import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
}

export const StarField = ({ count = 3000 }: StarFieldProps) => {
  const points = useRef<THREE.Points>(null);
  
  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 50 + Math.random() * 100;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 2 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, sizes, phases };
  }, [count]);

  useFrame(({ clock }) => {
    if (points.current) {
      const time = clock.getElapsedTime();
      const geometry = points.current.geometry;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;
      
      for (let i = 0; i < count; i++) {
        const phase = phases[i];
        const baseSize = sizes[i];
        sizeAttr.array[i] = baseSize * (0.5 + 0.5 * Math.sin(time * 2 + phase));
      }
      sizeAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation
        transparent
        opacity={0.8}
        color="#ffffff"
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
