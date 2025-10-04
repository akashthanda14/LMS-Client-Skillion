'use client';

import { motion } from 'framer-motion';
import { Award, CheckCircle, Star } from 'lucide-react';

interface CompletionBadgeProps {
  type?: 'award' | 'check' | 'star';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function CompletionBadge({ type = 'award', size = 'md', animate = true }: CompletionBadgeProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', container: 'w-16 h-16' },
    md: { icon: 'w-12 h-12', container: 'w-24 h-24' },
    lg: { icon: 'w-16 h-16', container: 'w-32 h-32' },
  };

  const { icon: iconSize, container: containerSize } = sizes[size];

  const Icon = type === 'award' ? Award : type === 'check' ? CheckCircle : Star;

  const variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background Glow */}
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      )}

      {/* Badge Container */}
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        className={`relative ${containerSize} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg`}
      >
        {/* Icon */}
        <motion.div
          variants={animate ? pulseVariants : undefined}
          animate={animate ? 'pulse' : undefined}
        >
          <Icon className={`${iconSize} text-white`} />
        </motion.div>
      </motion.div>

      {/* Sparkles */}
      {animate && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: [0, Math.cos((i * Math.PI) / 3) * 40],
                y: [0, Math.sin((i * Math.PI) / 3) * 40],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
