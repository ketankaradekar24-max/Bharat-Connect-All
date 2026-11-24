import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const BC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const MOTION_DURATIONS = {
  fast: 0.16,
  base: 0.28,
  reveal: 0.4,
} as const;

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
      transition={{ duration: prefersReduced ? 0 : MOTION_DURATIONS.base, ease: BC_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface EditorialRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function EditorialReveal({
  children,
  className = '',
  delay = 0,
}: EditorialRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: MOTION_DURATIONS.reveal, delay, ease: BC_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HeroStaggerProps {
  children: ReactNode;
  className?: string;
}

export function HeroStagger({ children, className = '' }: HeroStaggerProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.36, ease: BC_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedProgressMeterProps {
  percent: number;
  tone?: 'lapis' | 'teal' | 'saffron' | 'navy';
  heightClass?: string;
  label?: string;
}

const TONE_MAP = {
  lapis: 'bg-[#134E7A]',
  teal: 'bg-[#0E6B6E]',
  saffron: 'bg-[#C46316]',
  navy: 'bg-[#0B192C]',
};

export function AnimatedProgressMeter({
  percent,
  tone = 'lapis',
  heightClass = 'h-1.5',
  label,
}: AnimatedProgressMeterProps) {
  const prefersReduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-[#EAE4D7] ${heightClass}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Completion progress'}
    >
      <motion.div
        initial={prefersReduced ? false : { scaleX: 0 }}
        animate={{ scaleX: clamped / 100 }}
        transition={{ duration: prefersReduced ? 0 : 0.45, ease: BC_EASE }}
        style={{ transformOrigin: 'left center' }}
        className={`h-full w-full ${TONE_MAP[tone]}`}
      />
    </div>
  );
}
