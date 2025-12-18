import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
import { Sun } from './Sun';
import { Planet } from './Planet';

interface Branch {
  id: string;
  name: string;
  position: [number, number, number];
  size: number;
  color: string;
  glowColor: string;
}

const branches: (Branch & { planetType: string })[] = [
  { id: 'cse', name: 'CSE', position: [6, 0, 0], size: 0.6, color: '#4A90D9', glowColor: '#87CEEB', planetType: 'Earth' },
  { id: 'cse-ai', name: 'CSE AI', position: [4, 0, 5], size: 0.5, color: '#CD5C5C', glowColor: '#DEB887', planetType: 'Mars' },
  { id: 'cse-ai-ds', name: 'CSE AI-DS', position: [-2, 0, 7], size: 0.8, color: '#D4A574', glowColor: '#F4A460', planetType: 'Jupiter' },
  { id: 'cse-cs', name: 'CSE CS', position: [-6, 0, 2], size: 0.7, color: '#F4D03F', glowColor: '#FAD02C', planetType: 'Saturn' },
  { id: 'it', name: 'IT', position: [-5, 0, -4], size: 0.55, color: '#E6C47A', glowColor: '#FFD89B', planetType: 'Venus' },
  { id: 'ecm', name: 'ECM', position: [0, 0, -7], size: 0.6, color: '#4169E1', glowColor: '#6495ED', planetType: 'Neptune' },
];

const decorativePlanets = [
  { position: [7, 0, -5] as [number, number, number], size: 0.35, color: '#72CFF8', glowColor: '#AFEEEE', planetType: 'Uranus' },
  { position: [-8, 0, -2] as [number, number, number], size: 0.3, color: '#8C7853', glowColor: '#A09080', planetType: 'Mercury' },
];

interface SolarSystemSceneProps {
  onPlanetClick: (branchId: string, branchName: string) => void;
  isTransitioning: boolean;
}

export const SolarSystemScene = ({ onPlanetClick, isTransitioning }: SolarSystemSceneProps) => {
  return (
    <div className={`w-full h-screen ${isTransitioning ? 'animate-warp' : ''}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={60} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={30}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.3}
        />
        
        <ambientLight intensity={0.2} />
        
        <Suspense fallback={null}>
          <StarField count={4000} />
          <Sun />
          
          {/* Orbital paths */}
          {branches.map((branch) => {
            const distance = Math.sqrt(branch.position[0] ** 2 + branch.position[2] ** 2);
            return (
              <mesh key={`orbit-${branch.id}`} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[distance - 0.02, distance + 0.02, 128]} />
                <meshBasicMaterial 
                  color="#4FC3F7" 
                  transparent 
                  opacity={0.15}
                  side={2}
                />
              </mesh>
            );
          })}
          
          {/* Decorative orbital paths */}
          {decorativePlanets.map((planet, index) => {
            const distance = Math.sqrt(planet.position[0] ** 2 + planet.position[2] ** 2);
            return (
              <mesh key={`orbit-decorative-${index}`} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[distance - 0.015, distance + 0.015, 128]} />
                <meshBasicMaterial 
                  color="#4FC3F7" 
                  transparent 
                  opacity={0.08}
                  side={2}
                />
              </mesh>
            );
          })}
          
          {/* Branch planets */}
          {branches.map((branch) => (
            <Planet
              key={branch.id}
              position={branch.position}
              size={branch.size}
              color={branch.color}
              glowColor={branch.glowColor}
              label={branch.name}
              onClick={() => onPlanetClick(branch.id, branch.name)}
              isSelectable={true}
              planetType={branch.planetType}
            />
          ))}
          
          {/* Decorative planets */}
          {decorativePlanets.map((planet, index) => (
            <Planet
              key={`decorative-${index}`}
              position={planet.position}
              size={planet.size}
              color={planet.color}
              glowColor={planet.glowColor}
              isSelectable={false}
              planetType={planet.planetType}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};
