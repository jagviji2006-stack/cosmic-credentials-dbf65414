import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  roll_number: z.string().min(3, 'Roll number must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
});

type RegistrationData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  branch: string;
  branchName: string;
}

export const RegistrationForm = ({ branch, branchName }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('registrations').insert({
        name: data.name,
        roll_number: data.roll_number,
        email: data.email,
        phone: data.phone,
        branch: branchName,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('You are already registered with this roll number!');
        } else {
          toast.error('Registration failed. Please try again.');
        }
        return;
      }

      setIsRegistered(true);
      toast.success('Registration successful! Welcome aboard, space traveler!');
      reset();
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 text-center"
      >
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="font-display text-2xl text-primary glow-text mb-4">
          Registration Complete!
        </h2>
        <p className="text-muted-foreground mb-6">
          You've successfully registered for {branchName}. See you among the stars!
        </p>
        <button
          onClick={() => setIsRegistered(false)}
          className="btn-cosmic"
        >
          Register Another
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <label className="block font-display text-sm text-primary mb-2">
          Full Name
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Enter your full name"
          className="input-cosmic"
        />
        {errors.name && (
          <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block font-display text-sm text-primary mb-2">
          Roll Number
        </label>
        <input
          {...register('roll_number')}
          type="text"
          placeholder="Enter your roll number"
          className="input-cosmic"
        />
        {errors.roll_number && (
          <p className="text-destructive text-sm mt-1">{errors.roll_number.message}</p>
        )}
      </div>

      <div>
        <label className="block font-display text-sm text-primary mb-2">
          Email Address
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="Enter your email"
          className="input-cosmic"
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block font-display text-sm text-primary mb-2">
          Phone Number
        </label>
        <input
          {...register('phone')}
          type="tel"
          placeholder="Enter your phone number"
          className="input-cosmic"
        />
        {errors.phone && (
          <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block font-display text-sm text-primary mb-2">
          Branch
        </label>
        <input
          type="text"
          value={branchName}
          disabled
          className="input-cosmic bg-primary/10 border-primary/30 cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-cosmic w-full"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚡</span>
            Launching Registration...
          </span>
        ) : (
          'Launch Registration 🚀'
        )}
      </button>
    </motion.form>
  );
};
