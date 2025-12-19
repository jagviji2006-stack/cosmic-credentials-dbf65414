import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShootingStarProps {
  delay?: number;
}

export const ShootingStar = ({ delay = 0 }: ShootingStarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [direction, setDirection] = useState({ x: 0, y: 0, z: 0 });
  const progressRef = useRef(0);

  const resetStar = () => {
    // Start from behind/below the scene (negative Z, lower Y)
    const startX = (Math.random() - 0.5) * 40;
    const startY = Math.random() * 10 - 5;
    const startZ = -30 - Math.random() * 20;
    
    setPosition({ x: startX, y: startY, z: startZ });
    
    // Direction towards front/top (positive Z, upward Y)
    const dirX = (Math.random() - 0.5) * 0.3;
    const dirY = 0.2 + Math.random() * 0.3;
    const dirZ = 0.8 + Math.random() * 0.2;
    
    const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
    setDirection({ x: dirX / len, y: dirY / len, z: dirZ / len });
    
    progressRef.current = 0;
    setActive(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      resetStar();
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [delay]);

  useFrame((_, delta) => {
    if (!active || !groupRef.current || !trailRef.current) return;
    
    const speed = 25;
    progressRef.current += delta * speed;
    
    const newX = position.x + direction.x * progressRef.current;
    const newY = position.y + direction.y * progressRef.current;
    const newZ = position.z + direction.z * progressRef.current;
    
    groupRef.current.position.set(newX, newY, newZ);
    
    // Rotate trail to face direction of travel
    groupRef.current.lookAt(
      newX + direction.x,
      newY + direction.y,
      newZ + direction.z
    );
    
    // Fade out as it travels
    const opacity = Math.max(0, 1 - progressRef.current / 60);
    (trailRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.8;
    
    // Reset when traveled too far
    if (progressRef.current > 70) {
      setActive(false);
      setTimeout(() => resetStar(), Math.random() * 5000 + 2000);
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {/* Star head */}
      <mesh>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Glowing core */}
      <mesh scale={1.5}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Trail */}
      <mesh ref={trailRef} position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 4, 8]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outer trail glow */}
      <mesh position={[0, 0, 3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 6, 8]} />
        <meshBasicMaterial 
          color="#4169E1" 
          transparent 
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
