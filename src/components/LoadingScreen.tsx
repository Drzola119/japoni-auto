'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const GOLD = '#C9A84C';
const GOLD_BRIGHT = '#E8C96A';

// Stable spark positions (memoized)
const SPARKS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 400,
  y: -(50 + Math.random() * 180),
  rotate: Math.random() * 360,
  size: 2 + Math.random() * 4,
  duration: 0.4 + Math.random() * 0.8,
  delay: Math.random() * 1.5,
  color: ['#FFD700', '#FF8C00', '#FFA500', '#ffffff', '#C9A84C'][Math.floor(Math.random() * 5)],
  streak: Math.random() > 0.5,
}));

const SMOKE_PUFFS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: -(80 + i * 40),
  y: -(30 + Math.random() * 60),
  size: 60 + Math.random() * 80,
  blur: 20 + Math.random() * 20,
  duration: 1.5 + Math.random(),
  delay: i * 0.15,
  hot: i < 3,
}));

const FLAME_TONGUES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  offsetX: (i - 2) * 22,
  offsetY: -20 + Math.random() * 10,
  duration: 0.2 + i * 0.05,
  delay: i * 0.07,
  rotate: (i - 2) * 15,
}));

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'drift' | 'logo' | 'bar' | 'exit'>('drift');
  const [progress, setProgress] = useState(0);
  const [exitFlash, setExitFlash] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [mounted, setMounted] = useState(true);

  const stableSparks = useMemo(() => SPARKS, []);
  const stableSmoke = useMemo(() => SMOKE_PUFFS, []);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase transitions
    timers.push(setTimeout(() => setPhase('logo'), 800));
    timers.push(setTimeout(() => setLogoVisible(true), 800));
    timers.push(setTimeout(() => setPhase('bar'), 1800));
    timers.push(setTimeout(() => setPhase('exit'), 3000));
    timers.push(setTimeout(() => setExitFlash(true), 3000));
    timers.push(setTimeout(() => {
      setMounted(false);
      onComplete();
    }, 3500));

    // Progress bar animation during 'bar' phase
    let prog = 0;
    const interval = setInterval(() => {
      prog += 100 / (1200 / 16);
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
      }
      setProgress(prog);
    }, 16);
    timers.push(setTimeout(() => clearInterval(interval), 2800));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [onComplete]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        className="fixed inset-0 overflow-hidden"
        style={{ zIndex: 99999, background: '#020202' }}
        animate={phase === 'exit' ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={phase === 'exit' ? { duration: 0.4, delay: 0.2 } : { duration: 0 }}
      >
        {/* ── BACKGROUND LAYERS ── */}
        {/* Ground atmosphere */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '45%', background: 'linear-gradient(180deg, transparent 0%, rgba(30,15,0,0.4) 40%, rgba(50,20,0,0.7) 70%, rgba(15,8,0,0.9) 100%)' }} />

        {/* Center fire glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ top: '35%', left: '50%', width: 900, height: 600, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(255,120,0,0.18) 0%, rgba(201,168,76,0.10) 25%, rgba(180,60,0,0.06) 50%, transparent 75%)', filter: 'blur(40px)' }}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Upper vignette */}
        <div className="absolute top-0 left-0 right-0" style={{ height: '50%', background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, transparent 100%)', pointerEvents: 'none' }} />

        {/* Edge vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.95) 100%)', pointerEvents: 'none' }} />

        {/* Chromatic aberration flash */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.05, 0] }}
          transition={{ duration: 0.15, delay: 0.05 }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(255,0,0,0.08), transparent 30%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(270deg, rgba(0,0,255,0.08), transparent 30%)' }} />
        </motion.div>

        {/* Screen edge fire glow */}
        {['top', 'bottom', 'left', 'right'].map((edge, i) => (
          <motion.div key={edge} className="absolute pointer-events-none"
            style={{
              ...(edge === 'top' ? { top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(180deg, rgba(255,80,0,0.06) 0%, transparent 100%)' } : {}),
              ...(edge === 'bottom' ? { bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(0deg, rgba(255,80,0,0.15) 0%, transparent 100%)' } : {}),
              ...(edge === 'left' ? { top: 0, bottom: 0, left: 0, width: 200, background: 'linear-gradient(90deg, rgba(255,80,0,0.1) 0%, transparent 100%)' } : {}),
              ...(edge === 'right' ? { top: 0, bottom: 0, right: 0, width: 200, background: 'linear-gradient(270deg, rgba(255,80,0,0.1) 0%, transparent 100%)' } : {}),
            }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1, repeatType: 'reverse' }}
          />
        ))}

        {/* Film grain overlay */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
          animate={{ x: [0, 2, -1, 2, 0], y: [0, -2, 1, -1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        />

        {/* ── GROUND / ROAD ── */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '42%' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(12,10,8,0) 0%, rgba(18,14,10,0.6) 30%, rgba(10,8,6,0.95) 60%, #060504 100%)' }} />

          {/* Road reflection */}
          <motion.div className="absolute" style={{ bottom: '35%', left: '30%', right: '30%', height: 120, background: 'radial-gradient(ellipse, rgba(255,100,0,0.25) 0%, rgba(201,168,76,0.12) 40%, transparent 80%)', filter: 'blur(20px)' }}
            animate={{ scaleX: [0.7, 1.4, 0.7], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Tire marks */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" style={{ height: 200 }} viewBox="0 0 800 200">
            <motion.path d="M 400 220 Q 360 150 340 80" stroke="rgba(20,12,4,0.9)" strokeWidth="18" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.6, delay: 0.2 }}
            />
            <motion.path d="M 400 220 Q 440 150 460 80" stroke="rgba(20,12,4,0.9)" strokeWidth="18" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.6, delay: 0.2 }}
            />
            {/* Hot streak */}
            <motion.path d="M 400 220 Q 360 150 340 80" stroke="rgba(255,80,0,0.3)" strokeWidth="10" fill="none" strokeLinecap="round" style={{ filter: 'blur(6px)' }}
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
            <motion.path d="M 400 220 Q 440 150 460 80" stroke="rgba(255,80,0,0.3)" strokeWidth="10" fill="none" strokeLinecap="round" style={{ filter: 'blur(6px)' }}
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
            {/* Molten trail glow */}
            <motion.path d="M 400 220 Q 380 150 370 80" stroke="rgba(255,120,0,0.7)" strokeWidth="8" fill="none" strokeLinecap="round" style={{ filter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
            />
          </svg>
        </div>

        {/* ── CAR + FIRE SYSTEM (centered) ── */}
        <div className="absolute" style={{ bottom: '30%', left: '50%', transform: 'translateX(-50%)' }}>

          {/* ── SMOKE ── */}
          {stableSmoke.map((s) => (
            <motion.div key={s.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: s.size, height: s.size,
                bottom: 20, right: phase === 'exit' ? 100 : 0,
                background: s.hot
                  ? 'radial-gradient(ellipse, rgba(120,60,0,0.5) 0%, rgba(80,40,0,0.3) 50%, transparent 100%)'
                  : 'radial-gradient(ellipse, rgba(60,50,40,0.6) 0%, rgba(30,25,20,0.3) 50%, transparent 100%)',
                filter: `blur(${s.blur}px)`,
              }}
              animate={{ x: [0, s.x], y: [0, s.y], scale: [0.3, 2.5], opacity: [0, 0.7, 0] }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}

          {/* ── FIRE LAYER 1: BASE CORE ── */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ width: 200, height: 280, bottom: 30, right: -40, background: 'radial-gradient(ellipse at bottom center, rgba(255,200,0,0.9) 0%, rgba(255,100,0,0.8) 25%, rgba(220,40,0,0.6) 50%, rgba(150,0,0,0.3) 70%, transparent 100%)', filter: 'blur(12px)', willChange: 'transform' }}
            animate={{ scaleY: [1, 1.4, 0.9, 1.3, 1], scaleX: [1, 0.8, 1.1, 0.9, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── FIRE LAYER 2: FLAME TONGUES ── */}
          {FLAME_TONGUES.map((t) => (
            <motion.div key={t.id}
              className="absolute pointer-events-none"
              style={{ width: 40, height: 120, bottom: 40 + t.offsetY, right: -20 + t.offsetX, background: 'linear-gradient(0deg, rgba(255,80,0,1) 0%, rgba(255,200,0,0.9) 50%, transparent 100%)', borderRadius: '50% 50% 30% 30%', filter: 'blur(3px)', transformOrigin: 'bottom center', willChange: 'transform' }}
              animate={{ scaleY: [1, 1.8, 0.7, 1.5, 1], rotate: [t.rotate, t.rotate + 15, t.rotate - 15, t.rotate], x: [0, 10, -10, 0] }}
              transition={{ duration: t.duration, delay: t.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {/* ── FIRE LAYER 3: OUTER HALO ── */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ width: 400, height: 300, bottom: -20, right: -180, background: 'radial-gradient(ellipse, rgba(255,150,0,0.15) 0%, rgba(201,168,76,0.08) 35%, transparent 70%)', filter: 'blur(30px)' }}
            animate={{ scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Golden fire blend */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ width: 180, height: 180, bottom: 20, right: -60, background: 'radial-gradient(ellipse, rgba(255,215,0,0.4) 0%, rgba(201,168,76,0.2) 40%, transparent 80%)', filter: 'blur(15px)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* ── SPARKS ── */}
          {stableSparks.map((s) => (
            <motion.div key={s.id}
              className="absolute pointer-events-none"
              style={{
                width: s.streak ? 2 : s.size, height: s.streak ? s.size * 3 : s.size,
                borderRadius: s.streak ? 2 : '50%',
                background: s.color, bottom: 20, right: 0,
                willChange: 'transform',
              }}
              animate={{ x: [0, s.x], y: [0, s.y], rotate: s.rotate, scale: [1, 0], opacity: [1, 0] }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}

          {/* ── CAR SVG ── */}
          <motion.div
            style={{ position: 'relative', willChange: 'transform' }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={
              phase === 'exit'
                ? { x: 800, opacity: 0, rotate: 0, scale: 1 }
                : phase === 'drift'
                ? { scale: 1, opacity: 1, rotate: -6, x: [0, 8, -8, 6, -4, 0], y: [0, -3, 3, -2, 1, 0] }
                : { scale: 1, opacity: 1, rotate: -3, x: [-3, 3, -3], y: [0, -1, 0] }
            }
            transition={
              phase === 'exit'
                ? { duration: 0.5, ease: [0.3, 0, 0.7, 1] }
                : phase === 'drift'
                ? { scale: { type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }, opacity: { duration: 0.3, delay: 0.1 }, x: { duration: 0.4, repeat: 3, repeatType: 'mirror' }, y: { duration: 0.35, repeat: 3, repeatType: 'mirror' }, rotate: { duration: 0.3 } }
                : { x: { duration: 0.15, repeat: Infinity, repeatType: 'mirror' }, y: { duration: 0.2, repeat: Infinity, repeatType: 'mirror' } }
            }
          >
            <svg
              viewBox="0 0 520 140"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 'min(520px, 80vw)', height: 'auto', display: 'block' }}
            >
              <defs>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="60%" stopColor="#0d0d0d" />
                  <stop offset="100%" stopColor="#050505" />
                </linearGradient>
                <linearGradient id="wheelGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#E8C96A" />
                  <stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
                <filter id="headlight-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="taillight-glow">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* ── BODY ── */}
              {/* Main lower body */}
              <path d="M 60 110 L 460 110 L 490 90 L 460 80 L 380 75 L 370 45 L 280 30 L 180 32 L 130 48 L 80 60 L 40 75 L 30 90 Z"
                fill="url(#bodyGrad)" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />

              {/* Roof / cabin */}
              <path d="M 140 60 L 170 28 L 290 26 L 370 42 L 370 62 Z"
                fill="url(#bodyGrad)" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />

              {/* ── WINDSHIELD ── */}
              <path d="M 165 60 L 185 32 L 285 30 L 295 60 Z"
                fill="rgba(30,25,15,0.85)" stroke="rgba(201,168,76,0.2)" strokeWidth="0.8" />
              {/* Highlight */}
              <path d="M 175 58 L 190 34 L 220 32 L 215 58 Z"
                fill="rgba(201,168,76,0.06)" />

              {/* ── REAR WINDOW ── */}
              <path d="M 300 60 L 310 30 L 365 42 L 365 60 Z"
                fill="rgba(20,18,10,0.9)" stroke="rgba(201,168,76,0.2)" strokeWidth="0.8" />

              {/* Side body panel detail */}
              <path d="M 90 80 L 400 80 L 420 72 L 80 72 Z" fill="rgba(255,255,255,0.02)" />

              {/* Spoiler */}
              <rect x="450" y="73" width="40" height="4" rx="2" fill="#111" stroke={GOLD} strokeWidth="0.8" />
              <rect x="480" y="60" width="4" height="14" rx="1" fill="#111" stroke={GOLD} strokeWidth="0.5" />

              {/* Undercar glow line */}
              <motion.rect x="80" y="110" width="340" height="5" rx="2"
                fill="rgba(255,80,0,0.25)" style={{ filter: 'blur(6px)' }}
                animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />

              {/* ── FRONT WHEEL ── */}
              <motion.g
                animate={{ rotate: phase === 'exit' ? 3600 : 720 }}
                transition={{ duration: phase === 'exit' ? 0.5 : 3, ease: 'linear', repeat: Infinity }}
                style={{ transformOrigin: '120px 108px' }}
              >
                <circle cx="120" cy="108" r="26" fill="#0a0a0a" stroke={GOLD} strokeWidth="2" />
                <circle cx="120" cy="108" r="18" fill="#111" />
                {[0, 72, 144, 216, 288].map((deg) => (
                  <line key={deg} x1="120" y1="108"
                    x2={120 + 18 * Math.cos((deg * Math.PI) / 180)}
                    y2={108 + 18 * Math.sin((deg * Math.PI) / 180)}
                    stroke={GOLD} strokeWidth="1.5"
                  />
                ))}
                <circle cx="120" cy="108" r="4" fill={GOLD_BRIGHT} />
              </motion.g>
              <circle cx="120" cy="108" r="26" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />

              {/* ── REAR WHEEL ── */}
              <motion.g
                animate={{ rotate: phase === 'exit' ? 3600 : 1440 }}
                transition={{ duration: phase === 'exit' ? 0.3 : 1.5, ease: 'linear', repeat: Infinity }}
                style={{ transformOrigin: '390px 108px' }}
              >
                <circle cx="390" cy="108" r="26" fill="#0a0a0a" stroke={GOLD} strokeWidth="2" />
                <circle cx="390" cy="108" r="18" fill="#111" />
                {[0, 72, 144, 216, 288].map((deg) => (
                  <line key={deg} x1="390" y1="108"
                    x2={390 + 18 * Math.cos((deg * Math.PI) / 180)}
                    y2={108 + 18 * Math.sin((deg * Math.PI) / 180)}
                    stroke={GOLD} strokeWidth="1.5"
                  />
                ))}
                <circle cx="390" cy="108" r="4" fill={GOLD_BRIGHT} />
              </motion.g>
              <circle cx="390" cy="108" r="26" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />

              {/* ── HEADLIGHTS ── */}
              <g filter="url(#headlight-glow)">
                <path d="M 36 82 L 28 78 L 30 68 L 42 72 Z" fill="rgba(255,240,200,0.95)" />
                <path d="M 40 86 L 32 83 L 34 78 L 44 80 Z" fill="rgba(255,220,150,0.7)" />
              </g>

              {/* ── TAILLIGHTS ── */}
              <motion.g filter="url(#taillight-glow)"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <path d="M 488 86 L 498 82 L 498 74 L 486 76 Z" fill="rgba(255,30,0,0.95)" />
                <path d="M 486 90 L 496 88 L 496 83 L 484 84 Z" fill="rgba(255,50,0,0.7)" />
              </motion.g>

            </svg>
          </motion.div>

          {/* Asphalt shimmer */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ bottom: -10, left: '10%', right: '10%', height: 20, background: 'rgba(255,80,0,0.15)', filter: 'blur(10px)' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        </div>

        {/* ── LOGO ── */}
        <AnimatePresence>
          {logoVisible && (
            <motion.div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{ top: '18%', left: '50%', x: '-50%', zIndex: 20, width: 'min(380px, 85vw)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Fire sweep line */}
              <motion.div
                style={{ height: 2, background: 'linear-gradient(90deg, transparent, #FF6000, #FFD700, #FF6000, transparent)', filter: 'blur(1px)', marginBottom: 8 }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, delay: 0 }}
              />

              {/* Car icon */}
              <motion.svg viewBox="0 0 520 140" style={{ width: 40, height: 'auto', marginBottom: 8, filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.8))' }}
                animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M 60 110 L 460 110 L 490 90 L 460 80 L 380 75 L 370 45 L 280 30 L 180 32 L 130 48 L 80 60 L 40 75 L 30 90 Z" fill={GOLD} />
              </motion.svg>

              {/* JAPONI — letter-stagger burn-in */}
              <div className="flex items-center gap-1 mb-1">
                {'JAPONI'.split('').map((letter, i) => (
                  <motion.span key={i}
                    style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(32px, 8vw, 52px)', lineHeight: 1, letterSpacing: '0.12em', color: GOLD_BRIGHT, textShadow: '0 0 30px rgba(201,168,76,0.8), 0 0 80px rgba(201,168,76,0.3), 0 2px 4px rgba(0,0,0,0.8)' }}
                    initial={{ opacity: 0, scaleY: 0.5, y: 10, color: '#FF6000', textShadow: '0 0 20px rgba(255,80,0,1)' }}
                    animate={{ opacity: 1, scaleY: 1, y: 0, color: GOLD_BRIGHT, textShadow: '0 0 30px rgba(201,168,76,0.8)' }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {/* AUTO */}
              <motion.div
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 3vw, 18px)', letterSpacing: '0.65em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.75)', borderTop: '1px solid rgba(201,168,76,0.3)', borderBottom: '1px solid rgba(201,168,76,0.3)', padding: '4px 12px', textShadow: '0 0 20px rgba(201,168,76,0.4)' }}
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 1, letterSpacing: '0.65em' }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                AUTO
              </motion.div>

              {/* Tagline */}
              <motion.p
                style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginTop: 10 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                ALGÉRIE&apos;S #1 CAR MARKETPLACE
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOADING BAR ── */}
        {phase === 'bar' || phase === 'exit' ? (
          <motion.div
            className="absolute flex flex-col items-center"
            style={{ bottom: '14%', left: '50%', x: '-50%', width: 'min(320px, 80vw)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Track */}
            <div className="w-full relative" style={{ height: 2, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 2, overflow: 'hidden' }}>
              {/* Fill */}
              <motion.div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #8B6914, #C9A84C, #E8C96A, #C9A84C)',
                  backgroundSize: '200% 100%',
                  transition: 'width 0.016s linear',
                }}
                animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
              {/* Head dot */}
              <div style={{ position: 'absolute', right: `${100 - progress}%`, top: -3, width: 4, height: 8, background: '#FFD700', borderRadius: 2, filter: 'blur(2px) drop-shadow(0 0 6px rgba(255,215,0,0.9))' }} />
            </div>

            {/* Percentage */}
            <div className="flex justify-between w-full mt-2">
              <motion.span style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.35)' }}
                animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1, repeat: Infinity }}
              >
                CHARGEMENT EN COURS...
              </motion.span>
              <span style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(201,168,76,0.5)' }}>
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>
        ) : null}

        {/* ── EXIT FLASH ── */}
        <AnimatePresence>
          {exitFlash && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 50, background: 'radial-gradient(ellipse, rgba(255,230,150,1) 0%, rgba(201,168,76,0.9) 30%, transparent 70%)', transformOrigin: 'center' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 4, opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1] }}
            />
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
}
