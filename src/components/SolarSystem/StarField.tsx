import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
}

export const StarField = ({ count = 5000 }: StarFieldProps) => {
  const points = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  
  const { positions, sizes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    // Star color palette for realism
    const starColors = [
      new THREE.Color('#FFFFFF'), // White
      new THREE.Color('#FFE4C4'), // Warm white
      new THREE.Color('#B0C4DE'), // Cool blue-white
      new THREE.Color('#FFD700'), // Yellow
      new THREE.Color('#FF6347'), // Red giant
      new THREE.Color('#87CEEB'), // Blue
    ];
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 80 + Math.random() * 150;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = Math.random() * 2.5 + 0.3;
      phases[i] = Math.random() * Math.PI * 2;
      
      // Random star color
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, sizes, phases, colors };
  }, [count]);

  // Nebula/galaxy dust clouds
  const nebulaData = useMemo(() => {
    const nebulaCount = 800;
    const positions = new Float32Array(nebulaCount * 3);
    const colors = new Float32Array(nebulaCount * 3);
    const sizes = new Float32Array(nebulaCount);
    
    const nebulaColors = [
      new THREE.Color('#1a0533'), // Deep purple
      new THREE.Color('#0d1b2a'), // Deep blue
      new THREE.Color('#2d1b4e'), // Purple
      new THREE.Color('#0a192f'), // Navy
      new THREE.Color('#1f0318'), // Dark magenta
    ];
    
    for (let i = 0; i < nebulaCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 60 + Math.random() * 80;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 15 + 8;
    }
    
    return { positions, colors, sizes, count: nebulaCount };
  }, []);

  useFrame(({ clock }) => {
    if (points.current) {
      const time = clock.getElapsedTime();
      const geometry = points.current.geometry;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;
      
      for (let i = 0; i < count; i++) {
        const phase = phases[i];
        const baseSize = sizes[i];
        // More realistic twinkling
        const twinkle = 0.7 + 0.3 * Math.sin(time * (1.5 + Math.random() * 0.5) + phase);
        sizeAttr.array[i] = baseSize * twinkle;
      }
      sizeAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Nebula/galaxy background */}
      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nebulaData.count}
            array={nebulaData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={nebulaData.count}
            array={nebulaData.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={12}
          sizeAttenuation
          transparent
          opacity={0.15}
          vertexColors
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Stars */}
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
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.6}
          sizeAttenuation
          transparent
          opacity={0.9}
          vertexColors
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
