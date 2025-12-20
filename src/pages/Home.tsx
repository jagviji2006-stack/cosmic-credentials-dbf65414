import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Animated nebula clouds
const NebulaCloud = ({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.0005;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Floating particles/dust
const SpaceDust = ({ count = 500 }) => {
  const points = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y += 0.0002;
      points.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#88ccff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

// Milky Way Galaxy - Interactive portal
const MilkyWayGalaxy = ({ onClick }: { onClick: () => void }) => {
  const galaxyRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const spiralArms = useMemo(() => {
    const arms: { positions: Float32Array; colors: Float32Array }[] = [];
    const armCount = 4;
    const particlesPerArm = 2000;
    
    for (let arm = 0; arm < armCount; arm++) {
      const positions = new Float32Array(particlesPerArm * 3);
      const colors = new Float32Array(particlesPerArm * 3);
      const armAngle = (arm / armCount) * Math.PI * 2;
      
      for (let i = 0; i < particlesPerArm; i++) {
        const distance = Math.random() * 8 + 0.5;
        const angle = armAngle + (distance * 0.5) + (Math.random() - 0.5) * 0.5;
        const height = (Math.random() - 0.5) * 0.3 * (1 - distance / 10);
        
        positions[i * 3] = Math.cos(angle) * distance;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * distance;
        
        // Color gradient from center (bright) to edge (dim)
        const intensity = 1 - (distance / 10);
        if (arm % 2 === 0) {
          colors[i * 3] = 0.6 + intensity * 0.4;
          colors[i * 3 + 1] = 0.4 + intensity * 0.4;
          colors[i * 3 + 2] = 0.9 + intensity * 0.1;
        } else {
          colors[i * 3] = 0.9 + intensity * 0.1;
          colors[i * 3 + 1] = 0.6 + intensity * 0.4;
          colors[i * 3 + 2] = 0.4 + intensity * 0.3;
        }
      }
      arms.push({ positions, colors });
    }
    return arms;
  }, []);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.002;
      const scale = hovered ? 1.1 : 1;
      galaxyRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group 
      ref={galaxyRef} 
      onClick={onClick}
      onPointerEnter={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Central core glow */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#ffffee" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#ffcc88" transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.2} />
      </mesh>
      
      {/* Spiral arms */}
      {spiralArms.map((arm, index) => (
        <points key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={arm.positions.length / 3}
              array={arm.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={arm.colors.length / 3}
              array={arm.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={hovered ? 0.08 : 0.05} 
            vertexColors 
            transparent 
            opacity={0.9} 
            sizeAttenuation 
          />
        </points>
      ))}
      
      {/* Hover glow effect */}
      {hovered && (
        <mesh>
          <ringGeometry args={[9, 11, 64]} />
          <meshBasicMaterial color="#66ccff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

// Distant galaxies
const DistantGalaxy = ({ position, size }: { position: [number, number, number]; size: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.001;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[size * 0.3, size, 32]} />
      <meshBasicMaterial color="#8866aa" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Comet animation
const Comet = ({ delay = 0 }) => {
  const ref = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(false);
  
  useFrame((state) => {
    const time = (state.clock.elapsedTime + delay) % 15;
    if (time < 3) {
      setVisible(true);
      if (ref.current) {
        const progress = time / 3;
        ref.current.position.x = 30 - progress * 60;
        ref.current.position.y = 20 - progress * 40;
        ref.current.position.z = -10 + progress * 5;
      }
    } else {
      setVisible(false);
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#aaddff" />
      </mesh>
      {/* Tail */}
      <mesh position={[2, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.3, 4, 8]} />
        <meshBasicMaterial color="#6699ff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

const SpaceScene = ({ onGalaxyClick }: { onGalaxyClick: () => void }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={60} />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.1}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
      
      <ambientLight intensity={0.1} />
      
      {/* Background stars */}
      <Stars radius={100} depth={50} count={8000} factor={4} saturation={0.5} fade speed={0.5} />
      
      {/* Space dust particles */}
      <SpaceDust count={800} />
      
      {/* Nebula clouds */}
      <NebulaCloud position={[-30, 10, -40]} color="#6633aa" scale={15} />
      <NebulaCloud position={[35, -5, -50]} color="#aa3366" scale={12} />
      <NebulaCloud position={[0, 25, -60]} color="#3366aa" scale={20} />
      <NebulaCloud position={[-20, -15, -45]} color="#33aa66" scale={10} />
      
      {/* Main Milky Way Galaxy - Interactive */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
        <MilkyWayGalaxy onClick={onGalaxyClick} />
      </Float>
      
      {/* Distant galaxies */}
      <DistantGalaxy position={[-40, 15, -70]} size={3} />
      <DistantGalaxy position={[45, -10, -80]} size={2} />
      <DistantGalaxy position={[20, 30, -90]} size={4} />
      
      {/* Comets */}
      <Comet delay={0} />
      <Comet delay={5} />
      <Comet delay={10} />
    </>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGalaxyClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/codeathon');
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Space Scene */}
      <Canvas className="absolute inset-0">
        <SpaceScene onGalaxyClick={handleGalaxyClick} />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Title at top */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-8 left-0 right-0 text-center"
        >
          <h1 className="font-display text-lg md:text-xl lg:text-2xl tracking-[0.3em] mb-2">
            <span className="cosmic-shimmer">WELCOME TO THE COSMOS</span>
          </h1>
        </motion.div>

        {/* Central title over galaxy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-auto"
        >
          <div 
            className="text-center cursor-pointer group"
            onClick={handleGalaxyClick}
          >
            <motion.div
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(102, 204, 255, 0.5)',
                  '0 0 40px rgba(102, 204, 255, 0.8)',
                  '0 0 20px rgba(102, 204, 255, 0.5)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h2 className="font-display text-xl md:text-2xl tracking-[0.2em] text-cyan-300 mb-2">
                VIGNAN'S INSTITUTE OF INFORMATION TECHNOLOGY
              </h2>
            </motion.div>
            <motion.h1 
              className="font-display text-4xl md:text-6xl lg:text-8xl font-bold galactic-text"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              VIIT CODEATHON
            </motion.h1>
            <motion.span 
              className="font-display text-5xl md:text-7xl lg:text-9xl font-bold block mt-2 supernova-text"
              animate={{ 
                filter: [
                  'hue-rotate(0deg) brightness(1)',
                  'hue-rotate(30deg) brightness(1.2)',
                  'hue-rotate(0deg) brightness(1)',
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              2K25
            </motion.span>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 2 }}
              className="mt-8 font-body text-lg text-cyan-200 tracking-wider"
            >
              ✦ CLICK THE GALAXY TO ENTER ✦
            </motion.p>
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="font-body text-sm md:text-base text-muted-foreground tracking-wider">
            Where Innovation Meets the Universe
          </p>
        </motion.div>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 3, 100] }}
              transition={{ duration: 1.5, times: [0, 0.5, 1] }}
              className="w-4 h-4 rounded-full bg-gradient-radial from-white via-cyan-400 to-transparent"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute font-display text-2xl text-cyan-300 glow-text"
            >
              Entering the Codeathon...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;