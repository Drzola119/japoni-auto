'use client';

import { motion, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { ReactNode, useMemo } from 'react';

interface RevealHeadingProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  price?: string;
  ctaText?: string;
  ctaHref?: string;
  progress: MotionValue<number>;
  itemIndex: number;
  totalItems: number;
}

export default function RevealHeading({
  title,
  subtitle,
  eyebrow,
  price,
  ctaText = 'Discover',
  ctaHref,
  progress,
  itemIndex,
  totalItems,
}: RevealHeadingProps) {
  const segmentLength = 1 / totalItems;
  const startPoint = itemIndex * segmentLength;
  
  const titleOpacity = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.15, startPoint + segmentLength * 0.85, startPoint + segmentLength],
    [0, 1, 1, 0]
  );
  
  const titleY = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.15, startPoint + segmentLength * 0.85, startPoint + segmentLength],
    [60, 0, 0, -40]
  );
  
  const subtitleOpacity = useTransform(
    progress,
    [startPoint + segmentLength * 0.05, startPoint + segmentLength * 0.2, startPoint + segmentLength * 0.8, startPoint + segmentLength],
    [0, 1, 1, 0]
  );
  
  const subtitleY = useTransform(
    progress,
    [startPoint + segmentLength * 0.05, startPoint + segmentLength * 0.2, startPoint + segmentLength * 0.8, startPoint + segmentLength],
    [80, 0, 0, -20]
  );
  
  const ctaOpacity = useTransform(
    progress,
    [startPoint + segmentLength * 0.25, startPoint + segmentLength * 0.35, startPoint + segmentLength * 0.75, startPoint + segmentLength * 0.85],
    [0, 1, 1, 0]
  );
  
  const ctaY = useTransform(
    progress,
    [startPoint + segmentLength * 0.25, startPoint + segmentLength * 0.35, startPoint + segmentLength * 0.75, startPoint + segmentLength * 0.85],
    [20, 0, 0, 10]
  );

  return (
    <div className="relative z-20 pointer-events-none">
      {/* Eyebrow */}
      {eyebrow && (
        <motion.p
          className="uppercase mb-4 text-[#C9A84C]"
          style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
            letterSpacing: '0.35em',
            opacity: titleOpacity,
          }}
        >
          {eyebrow}
        </motion.p>
      )}
      
      {/* Main Title */}
      <motion.h2
        className="text-white mb-4 leading-[0.95]"
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: 300,
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          letterSpacing: '-0.02em',
          opacity: titleOpacity,
          y: titleY,
        }}
      >
        {title}
      </motion.h2>
      
      {/* Subtitle */}
      {subtitle && (
        <motion.p
          className="text-[#9A9480] mb-6 max-w-md"
          style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            lineHeight: 1.7,
            opacity: subtitleOpacity,
            y: subtitleY,
          }}
        >
          {subtitle}
        </motion.p>
      )}
      
      {/* Price Badge */}
      {price && (
        <motion.div
          className="inline-flex items-center mb-8"
          style={{ opacity: subtitleOpacity, y: subtitleY }}
        >
          <span 
            className="text-[#C9A84C]"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 600,
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            }}
          >
            {price}
          </span>
        </motion.div>
      )}
      
      {/* CTA Button */}
      {ctaHref && (
        <motion.a
          href={ctaHref}
          className="inline-flex items-center gap-2 pointer-events-auto cursor-pointer"
          style={{
            opacity: ctaOpacity,
            y: ctaY,
            background: '#C9A84C',
            color: '#07070C',
            padding: '0.875rem 2.5rem',
            borderRadius: '2px',
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            boxShadow: '0 0 0 0 rgba(201,168,76,0.4)',
          }}
        >
          {ctaText}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.a>
      )}
    </div>
  );
}

interface SimpleHeadingProps {
  children: ReactNode;
  className?: string;
}

export function SimpleHeading({ children, className = '' }: SimpleHeadingProps) {
  return (
    <div className={className} style={{
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 300,
      color: '#F5F0E8',
    }}>
      {children}
    </div>
  );
}