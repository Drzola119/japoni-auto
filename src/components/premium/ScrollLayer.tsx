'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollLayerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  pointerEvents?: 'auto' | 'none';
}

export default function ScrollLayer({
  children,
  className = '',
  style,
  zIndex = 0,
  pointerEvents = 'auto',
}: ScrollLayerProps) {
  return (
    <motion.div
      className={className}
      style={{
        ...style,
        zIndex,
        pointerEvents,
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden' as const,
      }}
    >
      {children}
    </motion.div>
  );
}

interface FadeLayerProps {
  children: ReactNode;
  visible: boolean;
  duration?: number;
  zIndex?: number;
}

export function FadeLayer({ children, visible, duration = 0.5, zIndex = 0 }: FadeLayerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration, ease: 'easeInOut' }}
      style={{ zIndex, position: 'absolute', inset: 0 }}
    >
      {children}
    </motion.div>
  );
}