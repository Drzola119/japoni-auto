'use client';

import { motion, useTransform, MotionValue } from 'framer-motion';
import Image from 'next/image';

interface ParallaxImageProps {
  src: string;
  alt: string;
  progress: MotionValue<number>;
  itemIndex: number;
  totalItems: number;
  className?: string;
  priority?: boolean;
}

export default function ParallaxImage({
  src,
  alt,
  progress,
  itemIndex,
  totalItems,
  className = '',
  priority = false,
}: ParallaxImageProps) {
  const segmentLength = 1 / totalItems;
  const startPoint = itemIndex * segmentLength;
  
  const imageOpacity = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.12, startPoint + segmentLength * 0.88, startPoint + segmentLength],
    [0, 1, 1, 0]
  );
  
  const imageScale = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.15, startPoint + segmentLength * 0.5, startPoint + segmentLength * 0.85, startPoint + segmentLength],
    [1.15, 1.08, 1, 0.92, 0.88]
  );
  
  const imageY = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.15, startPoint + segmentLength * 0.85, startPoint + segmentLength],
    [80, 20, 0, -60]
  );
  
  const imageX = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.5, startPoint + segmentLength],
    [15, 0, -10]
  );

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        opacity: imageOpacity,
        scale: imageScale,
        y: imageY,
        x: imageX,
        willChange: 'transform, opacity',
        zIndex: 10,
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain md:object-cover"
          priority={priority}
          sizes="100vw"
        />
      </div>
    </motion.div>
  );
}

interface AmbientGlowProps {
  progress: MotionValue<number>;
  itemIndex: number;
  totalItems: number;
  color?: string;
}

export function AmbientGlow({
  progress,
  itemIndex,
  totalItems,
  color = '#C9A84C',
}: AmbientGlowProps) {
  const segmentLength = 1 / totalItems;
  const startPoint = itemIndex * segmentLength;
  
  const glowOpacity = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.1, startPoint + segmentLength * 0.9, startPoint + segmentLength],
    [0, 0.4, 0.4, 0]
  );
  
  const glowScale = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.5, startPoint + segmentLength],
    [0.8, 1.1, 0.9]
  );

  return (
    <motion.div
      className="absolute rounded-full blur-[100px] md:blur-[150px]"
      style={{
        width: '60vw',
        height: '60vw',
        maxWidth: '800px',
        maxHeight: '800px',
        background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        opacity: glowOpacity,
        scale: glowScale,
        left: '50%',
        top: '50%',
        x: '-50%',
        y: '-50%',
        willChange: 'transform, opacity',
        zIndex: 1,
      }}
    />
  );
}

interface WatermarkTextProps {
  text: string;
  progress: MotionValue<number>;
  itemIndex: number;
  totalItems: number;
}

export function WatermarkText({
  text,
  progress,
  itemIndex,
  totalItems,
}: WatermarkTextProps) {
  const segmentLength = 1 / totalItems;
  const startPoint = itemIndex * segmentLength;
  
  const watermarkOpacity = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.1, startPoint + segmentLength * 0.9, startPoint + segmentLength],
    [0, 0.06, 0.06, 0]
  );
  
  const watermarkX = useTransform(
    progress,
    [startPoint, startPoint + segmentLength * 0.5, startPoint + segmentLength],
    ['-10%', '0%', '5%']
  );

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        opacity: watermarkOpacity,
        x: watermarkX,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity',
        zIndex: 2,
      }}
    >
      <span
        className="block text-white uppercase whitespace-nowrap"
        style={{
          fontFamily: '"Inter", sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(4rem, 20vw, 16rem)',
          letterSpacing: '0.2em',
          opacity: 0.05,
          lineHeight: 1,
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <span 
            className={`text-xs font-medium transition-colors duration-300 ${
              i === current ? 'text-[#C9A84C]' : 'text-white/30'
            }`}
            style={{ 
              fontFamily: '"Inter", sans-serif',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              letterSpacing: '0.15em',
            }}
          >
            {(i + 1).toString().padStart(2, '0')}
          </span>
          <div 
            className={`w-px h-8 transition-all duration-300 ${
              i === current ? 'bg-[#C9A84C]' : 'bg-white/10'
            }`}
          />
        </div>
      ))}
    </div>
  );
}