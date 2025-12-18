import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SolarSystemScene } from '@/components/SolarSystem/SolarSystemScene';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const handlePlanetClick = useCallback((branchId: string, branchName: string) => {
    setSelectedBranch(branchName);
    setIsTransitioning(true);
    
    setTimeout(() => {
      navigate(`/register/${branchId}`, { state: { branchName } });
    }, 1000);
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-10 p-6"
      >
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-display text-2xl md:text-3xl text-primary glow-text">
            STELLAR<span className="text-accent">REG</span>
          </h1>
          <button
            onClick={() => navigate('/admin')}
            className="font-display text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Admin Portal
          </button>
        </div>
      </motion.header>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
      >
        <div className="glass-panel px-6 py-4">
          <p className="font-display text-primary text-sm md:text-base glow-text">
            SELECT YOUR BRANCH
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Click on a planet to register
          </p>
        </div>
      </motion.div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4 animate-pulse">🚀</div>
              <p className="font-display text-xl text-primary glow-text">
                Warping to {selectedBranch}...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      <SolarSystemScene 
        onPlanetClick={handlePlanetClick}
        isTransitioning={isTransitioning}
      />
    </div>
  );
};

export default Index;
