import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Package } from 'lucide-react';

export const PageTransition: React.FC<{
  viewKey: string;
  children: React.ReactNode;
}> = ({ viewKey, children }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const StaggerSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ModalShell: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
}> = ({ isOpen, onClose, children, maxWidthClass = 'max-w-lg' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-xs p-4 overflow-y-auto perspective-1000"
        >
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.96, y: 12, rotateX: 3 }
            }
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.97, y: 8 }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-xl shadow-2xl border border-zinc-200 w-full overflow-hidden my-6 ${maxWidthClass}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-red-950 text-zinc-200 p-3 text-center ${className}`}
      >
        <Package className="w-6 h-6 text-red-500 mb-1" />
        {fallbackTitle && (
          <span className="text-[11px] font-semibold line-clamp-2 text-zinc-200">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};

interface ModuleHeaderProps {
  title: string;
  subtitle: string;
  kicker?: string;
  actions?: React.ReactNode;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  subtitle,
  kicker,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-zinc-200">
      <div className="space-y-1">
        {kicker && (
          <div className="text-[11px] font-semibold tracking-wider uppercase text-red-600">
            {kicker}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
          {title}
        </h1>
        <p className="text-xs text-zinc-500 max-w-2xl">{subtitle}</p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
};
