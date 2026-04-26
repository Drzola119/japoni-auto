'use client';

import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useSceneProgress, useReducedMotion } from './useSceneProgress';
import RevealHeading from './RevealHeading';
import ParallaxImage, { AmbientGlow, WatermarkText, ProgressIndicator } from './ParallaxImage';
import { ArrowRight } from 'lucide-react';

export interface ShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  imageUrl: string;
  accentText?: string;
  ctaHref: string;
  badge?: string;
}

interface CarShowcase3DProps {
  items: ShowcaseItem[];
  className?: string;
}

function MobileCardView({ items }: { items: ShowcaseItem[] }) {
  return (
    <div className="lg:hidden">
      <div className="px-4 py-8 space-y-8">
        {items.map((item) => (
          <Link 
            key={item.id} 
            href={item.ctaHref}
            className="block group"
          >
            <div className="relative rounded-2xl overflow-hidden bg-[#111116] border border-white/5">
              <div className="relative aspect-[16/10]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {item.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#C9A84C]/90 text-[#07070C] text-xs font-bold uppercase tracking-wider rounded">
                    {item.badge}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-light text-white mb-2" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                  {item.title}
                </h3>
                <p className="text-[#9A9480] text-sm mb-3 line-clamp-2">{item.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#C9A84C] font-semibold text-lg">{item.price}</span>
                  <span className="flex items-center gap-1 text-[#C9A84C] text-sm font-medium">
                    Discover <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function CarShowcase3D({ items, className = '' }: CarShowcase3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  
  const { scrollYProgress, springProgress, currentIndex } = useSceneProgress({
    targetRef: containerRef,
    itemCount: items.length,
  });

  // Always call useTransform at the top level
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  if (reducedMotion || items.length === 0) {
    return <MobileCardView items={items} />;
  }

  return (
    <>
      {/* Desktop sticky scroll experience */}
      <div 
        ref={containerRef}
        className={`hidden lg:block relative ${className}`}
        style={{ height: '300vh' }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Background gradient layer */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(180deg, #0A0A0F 0%, #0F0F15 50%, #0A0A0F 100%)',
            }}
          />
          
          {/* Subtle grid pattern overlay */}
          <div 
            className="absolute inset-0 z-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Items rendered as layers */}
          {items.map((item, index) => (
            <div key={item.id} className="absolute inset-0">
              {/* Ambient glow */}
              <AmbientGlow
                progress={springProgress}
                itemIndex={index}
                totalItems={items.length}
                color="#C9A84C"
              />
              
              {/* Background watermark text */}
              <WatermarkText
                text={item.accentText || item.title.split(' ')[0]}
                progress={springProgress}
                itemIndex={index}
                totalItems={items.length}
              />
              
              {/* Car image layer */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-7xl mx-auto px-8">
                  <ParallaxImage
                    src={item.imageUrl}
                    alt={item.title}
                    progress={springProgress}
                    itemIndex={index}
                    totalItems={items.length}
                    className="w-full h-full"
                    priority={index === 0}
                  />
                </div>
              </div>
              
              {/* Gradient overlay for text readability */}
              <div 
                className="absolute inset-0 z-15 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(7,7,12,0.9) 0%, rgba(7,7,12,0.6) 30%, transparent 50%, transparent 100%)',
                }}
              />
              
              {/* Content layer - positioned left */}
              <div className="absolute left-0 top-0 bottom-0 w-full max-w-xl z-30 flex items-center px-8 md:px-16 lg:px-24">
                <RevealHeading
                  title={item.title}
                  subtitle={item.subtitle}
                  eyebrow={item.badge}
                  price={item.price}
                  ctaText="Discover"
                  ctaHref={item.ctaHref}
                  progress={springProgress}
                  itemIndex={index}
                  totalItems={items.length}
                />
              </div>
            </div>
          ))}

          {/* Progress indicator */}
          <ProgressIndicator current={currentIndex} total={items.length} />
          
          {/* Scroll indicator at bottom */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
            style={{
              opacity: scrollIndicatorOpacity,
            }}
          >
            <span 
              className="text-white/40 text-xs uppercase tracking-widest"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-px h-8 bg-gradient-to-b from-[#C9A84C] to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile simplified cards */}
      <MobileCardView items={items} />
    </>
  );
}