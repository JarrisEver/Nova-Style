import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  elevation?: 'flat' | 'subtle' | 'high';
  onClick?: () => void;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  maxTilt = 5,
  elevation = 'subtle',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 24, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  const sheenX = useSpring(useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']), springConfig);
  const sheenY = useSpring(useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const shadowClasses = {
    flat: 'shadow-none',
    subtle: 'shadow-[0_4px_16px_-4px_rgba(9,9,11,0.08)] hover:shadow-[0_14px_30px_-8px_rgba(9,9,11,0.16)]',
    high: 'shadow-[0_16px_40px_-10px_rgba(9,9,11,0.22)] hover:shadow-[0_24px_50px_-12px_rgba(220,38,38,0.22)]',
  };

  return (
    <div className="perspective-1000 h-full">
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          shouldReduceMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
        }
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={`relative h-full transition-shadow duration-200 ${shadowClasses[elevation]} ${className}`}
      >
        {/* Subtle specular highlight overlay */}
        {!shouldReduceMotion && (
          <motion.div
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle at ${sheenX.get()} ${sheenY.get()}, rgba(255,255,255,0.12), transparent 65%)`,
            }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          />
        )}
        {children}
      </motion.div>
    </div>
  );
};
