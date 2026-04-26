'use client';

import { useRef, useMemo } from 'react';
import { useScroll, useSpring, MotionValue } from 'framer-motion';

interface UseSceneProgressOptions {
  targetRef: React.RefObject<HTMLElement | null>;
  itemCount: number;
}

interface SceneProgress {
  scrollYProgress: MotionValue<number>;
  springProgress: MotionValue<number>;
  currentIndex: number;
  segmentProgress: number;
  getItemProgress: (index: number) => { start: number; end: number; progress: number };
  isInView: boolean;
}

export function useSceneProgress({ targetRef, itemCount }: UseSceneProgressOptions): SceneProgress {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  const segmentLength = 1 / itemCount;

  const getItemProgress = useMemo(() => {
    return (index: number): { start: number; end: number; progress: number } => {
      const start = index * segmentLength;
      const end = start + segmentLength;
      const progress = Math.max(0, Math.min(1, (springProgress.get() - start) / segmentLength));
      return { start, end, progress };
    };
  }, [segmentLength, springProgress]);

  const currentIndex = Math.floor(springProgress.get() * itemCount);
  const currentSegmentProgress = (springProgress.get() * itemCount) % 1;

  return {
    scrollYProgress,
    springProgress,
    currentIndex,
    segmentProgress: currentSegmentProgress,
    getItemProgress,
    isInView: true,
  };
}

export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}