import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  animateEntrance?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  animateEntrance = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  };

  return (
    <motion.div
      initial={animateEntrance && !shouldReduceMotion ? { opacity: 0, scale: 0.9, y: -6 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-3 select-none group"
    >
      {/* 3D Sculpted NS Monogram Container */}
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { rotateY: 12, rotateX: -6, scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.45)] overflow-hidden preserve-3d shrink-0`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-zinc-900 pointer-events-none"
        />
        <svg
          viewBox="0 0 48 48"
          className="w-4/5 h-4/5 relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dynamic Crimson Orbital Arc */}
          <path
            d="M8 31C11 38 24 41 37 33C41 30.5 43 26.5 41 24"
            stroke="#DC2626"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* N Glyph */}
          <path
            d="M10 32V15L21 31V15"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          {/* S Glyph */}
          <path
            d="M36 17.5C36 15.5 33.5 14.5 30.5 14.5C27.5 14.5 25.5 16 25.5 18.2C25.5 22.8 36.5 21.8 36.5 27.5C36.5 30 34 31.5 30.5 31.5C27.5 31.5 25 30.2 24.5 28.5"
            stroke="#E4E4E7"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <div className="min-w-0">
        <div
          className={`${titleSizes[size]} font-extrabold tracking-tight leading-none whitespace-nowrap ${
            variant === 'light' ? 'text-white' : 'text-zinc-950'
          }`}
        >
          NOVA<span className="text-red-600">Style</span>
        </div>
        {showSubtitle && (
          <div
            className={`text-[10px] font-semibold uppercase tracking-[0.18em] mt-1 whitespace-nowrap ${
              variant === 'light' ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            NS-Management
          </div>
        )}
      </div>
    </motion.div>
  );
};
