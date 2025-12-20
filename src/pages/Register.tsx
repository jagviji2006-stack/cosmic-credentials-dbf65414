import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RegistrationForm } from '@/components/RegistrationForm';
import { SearchRegistration } from '@/components/SearchRegistration';
import { ArrowLeft, Sparkles } from 'lucide-react';

const branchNames: Record<string, string> = {
  'cse': 'CSE',
  'cse-ai': 'CSE AI',
  'cse-ai-ds': 'CSE AI-DS',
  'cse-cs': 'CSE CS',
  'it': 'IT',
  'ecm': 'ECM',
  'cse-ds': 'CSE DS',
};

// Realistic planet backgrounds matching each branch's planet atmosphere
const planetBackgrounds: Record<string, { gradient: string; particles: string; glow: string }> = {
  'cse': {
    gradient: 'from-blue-900/80 via-cyan-800/60 to-green-900/40',
    particles: 'bg-blue-400',
    glow: 'bg-cyan-500/30',
  },
  'cse-ai': {
    gradient: 'from-red-900/80 via-orange-800/60 to-amber-900/40',
    particles: 'bg-orange-400',
    glow: 'bg-red-500/30',
  },
  'cse-ai-ds': {
    gradient: 'from-amber-900/80 via-orange-700/60 to-red-800/40',
    particles: 'bg-amber-400',
    glow: 'bg-orange-500/30',
  },
  'cse-cs': {
    gradient: 'from-yellow-900/80 via-amber-700/60 to-orange-800/40',
    particles: 'bg-yellow-400',
    glow: 'bg-yellow-500/30',
  },
  'it': {
    gradient: 'from-yellow-800/80 via-orange-600/60 to-amber-700/40',
    particles: 'bg-yellow-300',
    glow: 'bg-amber-500/30',
  },
  'ecm': {
    gradient: 'from-blue-950/80 via-indigo-800/60 to-purple-900/40',
    particles: 'bg-blue-400',
    glow: 'bg-indigo-500/30',
  },
  'cse-ds': {
    gradient: 'from-cyan-900/80 via-teal-700/60 to-blue-800/40',
    particles: 'bg-cyan-400',
    glow: 'bg-teal-500/30',
  },
};

const Register = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const branchName = (location.state as { branchName?: string })?.branchName || 
    branchNames[branchId || ''] || 
    'Unknown Branch';

  const bgStyle = planetBackgrounds[branchId || ''] || planetBackgrounds['cse'];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Realistic 3D planet atmosphere background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient matching planet */}
        <div className={`absolute inset-0 bg-gradient-to-b ${bgStyle.gradient}`} />
        
        {/* Atmospheric layers */}
        <div className="absolute inset-0">
          {/* Primary nebula glow */}
          <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] ${bgStyle.glow} rounded-full blur-[100px] animate-pulse`} />
          <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] ${bgStyle.glow} rounded-full blur-[120px] animate-pulse`} style={{ animationDelay: '1.5s' }} />
          
          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 ${bgStyle.particles} rounded-full opacity-60`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          {/* Atmospheric rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
            <div className="absolute inset-0 rounded-full border border-white/5 animate-spin" style={{ animationDuration: '60s' }} />
            <div className="absolute inset-[10%] rounded-full border border-white/3 animate-spin" style={{ animationDuration: '90s', animationDirection: 'reverse' }} />
          </div>
        </div>
        
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/codeathon')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Solar System
          </button>
          <h1 className="font-display text-xl gradient-text-animated">
            CODEATHON <span className="text-accent">2K25</span>
          </h1>
        </motion.header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Branch badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 border border-primary/50 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-display text-xl text-primary glow-text">
                  {branchName}
                </span>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl text-foreground">
                Registration Portal
              </h2>
              <p className="text-muted-foreground mt-2">
                Join the coding revolution
              </p>
            </motion.div>

            {/* Registration form */}
            <div className="glass-panel p-6 md:p-8">
              <RegistrationForm branch={branchId || ''} branchName={branchName} />
            </div>

            {/* Search registration */}
            <SearchRegistration />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
