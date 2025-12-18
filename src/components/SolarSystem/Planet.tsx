import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  color: string;
  glowColor: string;
  label?: string;
  onClick?: () => void;
  isSelectable?: boolean;
}

export const Planet = ({ 
  position, 
  size, 
  color, 
  glowColor, 
  label, 
  onClick,
  isSelectable = true 
}: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (glowRef.current && hovered) {
      const scale = 1.3 + Math.sin(time * 3) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const handlePointerEnter = () => {
    if (isSelectable) {
      setHovered(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerLeave = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={position}>
      {/* Planet core */}
      <mesh
        ref={meshRef}
        onClick={isSelectable ? onClick : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={hovered ? glowColor : color}
          emissiveIntensity={hovered ? 0.5 : 0.1}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} scale={hovered ? 1.3 : 1.15}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={hovered ? 0.4 : 0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Hover ring */}
      {hovered && isSelectable && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 1.7, 64]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Label */}
      {label && (
        <Html
          position={[0, size + 0.8, 0]}
          center
          distanceFactor={15}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div 
            className={`planet-label transition-all duration-300 whitespace-nowrap ${
              hovered ? 'scale-110 shadow-[0_0_20px_hsl(var(--primary))]' : ''
            }`}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};
