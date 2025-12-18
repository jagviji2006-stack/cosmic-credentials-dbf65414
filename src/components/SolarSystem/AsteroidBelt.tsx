import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidBeltProps {
  innerRadius?: number;
  outerRadius?: number;
  count?: number;
}

export const AsteroidBelt = ({ 
  innerRadius = 9, 
  outerRadius = 11, 
  count = 300 
}: AsteroidBeltProps) => {
  const asteroidsRef = useRef<THREE.InstancedMesh>(null);
  
  const { matrices, rotationSpeeds } = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const rotationSpeeds: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const height = (Math.random() - 0.5) * 0.8;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const matrix = new THREE.Matrix4();
      const scale = 0.03 + Math.random() * 0.08;
      
      matrix.compose(
        new THREE.Vector3(x, height, z),
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          )
        ),
        new THREE.Vector3(scale, scale * (0.5 + Math.random() * 0.5), scale)
      );
      
      matrices.push(matrix);
      rotationSpeeds.push(0.01 + Math.random() * 0.02);
    }
    
    return { matrices, rotationSpeeds };
  }, [count, innerRadius, outerRadius]);

  useFrame(({ clock }) => {
    if (!asteroidsRef.current) return;
    
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const matrix = new THREE.Matrix4();
      const originalMatrix = matrices[i];
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      
      originalMatrix.decompose(position, quaternion, scale);
      
      // Orbit around the sun
      const orbitAngle = time * rotationSpeeds[i];
      const radius = Math.sqrt(position.x * position.x + position.z * position.z);
      const originalAngle = Math.atan2(position.z, position.x);
      
      const newX = Math.cos(originalAngle + orbitAngle) * radius;
      const newZ = Math.sin(originalAngle + orbitAngle) * radius;
      
      // Rotate asteroid itself
      const newQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(time * 0.5, time * 0.3, time * 0.2)
      );
      
      matrix.compose(
        new THREE.Vector3(newX, position.y, newZ),
        newQuaternion,
        scale
      );
      
      asteroidsRef.current.setMatrixAt(i, matrix);
    }
    
    asteroidsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={asteroidsRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#6B6B6B"
        roughness={0.9}
        metalness={0.1}
      />
    </instancedMesh>
  );
};
