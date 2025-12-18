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
};

const Register = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const branchName = (location.state as { branchName?: string })?.branchName || 
    branchNames[branchId || ''] || 
    'Unknown Branch';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/10" />
        {/* Nebula effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Solar System
          </button>
          <h1 className="font-display text-xl text-primary glow-text">
            STELLAR<span className="text-accent">REG</span>
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
                Join the cosmic journey
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
