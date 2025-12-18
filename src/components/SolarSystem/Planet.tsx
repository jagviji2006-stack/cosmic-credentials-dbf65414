import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Planet configuration for realistic appearance
const PLANET_CONFIGS: Record<string, {
  baseColor: string;
  secondaryColor: string;
  atmosphereColor: string;
  hasRings?: boolean;
  ringColor?: string;
  hasStripes?: boolean;
  hasClouds?: boolean;
  surfaceRoughness?: number;
}> = {
  'Mercury': {
    baseColor: '#8C7853',
    secondaryColor: '#6B5B45',
    atmosphereColor: '#A09080',
    surfaceRoughness: 0.9,
  },
  'Venus': {
    baseColor: '#E6C47A',
    secondaryColor: '#D4A84B',
    atmosphereColor: '#FFD89B',
    hasClouds: true,
    surfaceRoughness: 0.3,
  },
  'Earth': {
    baseColor: '#4A90D9',
    secondaryColor: '#2D6B3F',
    atmosphereColor: '#87CEEB',
    hasClouds: true,
    surfaceRoughness: 0.5,
  },
  'Mars': {
    baseColor: '#CD5C5C',
    secondaryColor: '#8B4513',
    atmosphereColor: '#DEB887',
    surfaceRoughness: 0.8,
  },
  'Jupiter': {
    baseColor: '#D4A574',
    secondaryColor: '#8B6914',
    atmosphereColor: '#F4A460',
    hasStripes: true,
    surfaceRoughness: 0.2,
  },
  'Saturn': {
    baseColor: '#F4D03F',
    secondaryColor: '#D4A84B',
    atmosphereColor: '#FAD02C',
    hasRings: true,
    ringColor: '#C9B896',
    hasStripes: true,
    surfaceRoughness: 0.2,
  },
  'Uranus': {
    baseColor: '#72CFF8',
    secondaryColor: '#4AB8E8',
    atmosphereColor: '#AFEEEE',
    hasRings: true,
    ringColor: '#B0C4DE',
    surfaceRoughness: 0.3,
  },
  'Neptune': {
    baseColor: '#4169E1',
    secondaryColor: '#1E3A8A',
    atmosphereColor: '#6495ED',
    surfaceRoughness: 0.3,
  },
};

// Map branch labels to planet types
const BRANCH_TO_PLANET: Record<string, string> = {
  'CSE': 'Earth',
  'CSE AI': 'Mars',
  'CSE AI-DS': 'Jupiter',
  'CSE CS': 'Saturn',
  'IT': 'Venus',
  'ECM': 'Neptune',
};

interface PlanetProps {
  position: [number, number, number];
  size: number;
  color: string;
  glowColor: string;
  label?: string;
  onClick?: () => void;
  isSelectable?: boolean;
  planetType?: string;
}

export const Planet = ({ 
  position, 
  size, 
  color, 
  glowColor, 
  label, 
  onClick,
  isSelectable = true,
  planetType
}: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Determine planet configuration
  const resolvedPlanetType = planetType || (label ? BRANCH_TO_PLANET[label] : undefined) || 'Earth';
  const config = PLANET_CONFIGS[resolvedPlanetType] || PLANET_CONFIGS['Earth'];

  // Create procedural planet material
  const planetMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(config.baseColor) },
        secondaryColor: { value: new THREE.Color(config.secondaryColor) },
        hasStripes: { value: config.hasStripes || false },
        roughness: { value: config.surfaceRoughness || 0.5 },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 secondaryColor;
        uniform bool hasStripes;
        uniform float roughness;
        uniform float time;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Noise functions
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec3 color = baseColor;
          
          // Add surface detail
          float detail = fbm(vUv * 8.0);
          color = mix(color, secondaryColor, detail * 0.5);
          
          // Add stripes for gas giants
          if (hasStripes) {
            float stripe = sin(vUv.y * 30.0 + fbm(vUv * 4.0) * 3.0) * 0.5 + 0.5;
            color = mix(color, secondaryColor, stripe * 0.4);
          }
          
          // Add surface texture/craters
          float crater = fbm(vUv * 20.0);
          color = mix(color, color * 0.8, crater * roughness * 0.3);
          
          // Basic lighting
          vec3 lightDir = normalize(vec3(-1.0, 0.5, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.0);
          color *= 0.4 + diff * 0.6;
          
          // Rim lighting
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          color += rim * rim * 0.15;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, [config]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    planetMaterial.uniforms.time.value = time;
    
    if (glowRef.current && hovered) {
      const scale = 1.3 + Math.sin(time * 3) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.02;
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
      {/* Planet core with procedural texture */}
      <mesh
        ref={meshRef}
        onClick={isSelectable ? onClick : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        material={planetMaterial}
      >
        <sphereGeometry args={[size, 64, 64]} />
      </mesh>

      {/* Cloud layer for planets with atmosphere */}
      {config.hasClouds && (
        <mesh ref={cloudsRef} scale={1.02}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.15}
            blending={THREE.NormalBlending}
          />
        </mesh>
      )}

      {/* Atmosphere */}
      <mesh scale={1.08}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={config.atmosphereColor}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Rings for Saturn and Uranus */}
      {config.hasRings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
          <meshBasicMaterial
            color={config.ringColor}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Glow effect */}
      <mesh ref={glowRef} scale={hovered ? 1.3 : 1.15}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={config.atmosphereColor}
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
            color={config.atmosphereColor}
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
