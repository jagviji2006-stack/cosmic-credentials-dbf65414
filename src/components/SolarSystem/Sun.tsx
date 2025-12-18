import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.05;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      
      {/* Inner glow */}
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial 
          color="#FF8C00" 
          transparent 
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh scale={1.5}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial 
          color="#FF6B00" 
          transparent 
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Corona */}
      <mesh scale={2}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial 
          color="#FF4500" 
          transparent 
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Point light */}
      <pointLight color="#FDB813" intensity={2} distance={100} decay={2} />
    </group>
  );
};
