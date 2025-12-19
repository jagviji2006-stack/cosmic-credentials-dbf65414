import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SolarSystemScene } from '@/components/SolarSystem/SolarSystemScene';
import { motion, AnimatePresence } from 'framer-motion';

const quotations = [
  "Code is poetry written in logic.",
  "Innovation distinguishes between a leader and a follower.",
  "The best way to predict the future is to create it.",
  "Dream big, code bigger!",
  "Every expert was once a beginner.",
  "Where innovation meets education.",
];

const Index = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
        className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6"
      >
        <div className="container mx-auto flex flex-col items-center gap-2">
          {/* Institute Name */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-sm md:text-lg lg:text-xl text-center tracking-wider"
          >
            <span className="vibrant-text">VIGNAN'S INSTITUTE OF INFORMATION TECHNOLOGY</span>
          </motion.h1>
          
          {/* Event Name */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold">
              <span className="gradient-text-animated">CODEATHON</span>
              <span className="text-accent glow-text-sun ml-2">2K25</span>
            </h2>
          </motion.div>
          
          {/* Quotations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-2 h-8"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="font-body text-sm md:text-base text-muted-foreground italic text-center"
              >
                "{quotations[currentQuote]}"
              </motion.p>
            </AnimatePresence>
          </motion.div>
          
          <button
            onClick={() => navigate('/admin')}
            className="font-display text-xs text-muted-foreground hover:text-primary transition-colors mt-2"
          >
            Admin Portal
          </button>
        </div>
      </motion.header>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
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
              <p className="font-display text-xl gradient-text-animated">
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
