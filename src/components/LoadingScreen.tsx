'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

// Stable random data generated once
const SPARKS_DATA = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  tx: (((i * 137) % 400) - 200),
  ty: -((i * 73) % 180 + 40),
  size: 2 + (i % 5),
  dur: 0.5 + (i % 8) * 0.1,
  delay: (i % 10) * 0.12,
  color: ['#FFD700','#FF8C00','#FFA500','#ffffff','#C9A84C'][i % 5],
  streak: i % 3 === 0,
}));

const SMOKE_DATA = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  tx: -(60 + i * 35),
  ty: -(30 + (i % 4) * 20),
  size: 50 + (i % 3) * 30,
  dur: 1.5 + (i % 4) * 0.3,
  delay: i * 0.2,
  hot: i < 3,
}));

const FLAMES_DATA = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  ox: (i - 2) * 20,
  oy: (i % 2) * -10,
  dur: 0.18 + i * 0.04,
  delay: i * 0.07,
  rot: (i - 2) * 14,
}));

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'drift' | 'logo' | 'bar' | 'exit'>('drift');
  const [progress, setProgress] = useState(0);
  const [logoOn, setLogoOn] = useState(false);
  const [barOn, setBarOn] = useState(false);
  const [exitFlash, setExitFlash] = useState(false);
  const [alive, setAlive] = useState(true);

  const sparks = useMemo(() => SPARKS_DATA, []);
  const smoke = useMemo(() => SMOKE_DATA, []);
  const flames = useMemo(() => FLAMES_DATA, []);

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('logo'); setLogoOn(true); }, 800);
    const t2 = setTimeout(() => { setPhase('bar');  setBarOn(true);  }, 1800);
    const t3 = setTimeout(() => { setPhase('exit'); setExitFlash(true); }, 3000);
    const t4 = setTimeout(() => { setAlive(false); onComplete(); }, 3500);

    // progress counter starts at 1800ms
    const pStart = Date.now() + 1800;
    const iv = setInterval(() => {
      const elapsed = Date.now() - pStart;
      const pct = Math.min(100, (elapsed / 1200) * 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(iv);
    }, 16);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [onComplete]);

  if (!alive) return null;

  /* ── car drift motion props ── */
  const carAnimate = phase === 'exit'
    ? { x: 900, opacity: 0, rotate: -2, scale: 1 }
    : phase === 'drift'
    ? { x: [0, 8, -8, 5, -3, 0], y: [0, -3, 3, -2, 1, 0], rotate: -6, scale: 1, opacity: 1 }
    : { x: [-3, 3, -3], y: [0, -1, 0], rotate: -3, scale: 1, opacity: 1 };

  const carTransition = phase === 'exit'
    ? { duration: 0.5, ease: [0.3, 0, 0.7, 1] as const }
    : phase === 'drift'
    ? { x: { duration: 0.4, repeat: 4, repeatType: 'mirror' as const }, y: { duration: 0.35, repeat: 4, repeatType: 'mirror' as const }, scale: { duration: 0.3 }, opacity: { duration: 0.3 } }
    : { x: { duration: 0.15, repeat: Infinity, repeatType: 'mirror' as const }, y: { duration: 0.2, repeat: Infinity, repeatType: 'mirror' as const } };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999, overflow: 'hidden',
        background: '#050302',
      }}
    >
      {/* ── BACKGROUND LAYERS ── */}
      {/* Ground atmosphere */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(180deg, transparent 0%, rgba(30,15,0,0.5) 40%, rgba(50,20,0,0.75) 70%, rgba(10,5,0,0.95) 100%)', zIndex: 1 }} />

      {/* Center fire aura */}
      <motion.div
        style={{ position: 'absolute', top: '40%', left: '50%', width: 800, height: 500, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(255,110,0,0.22) 0%, rgba(201,168,76,0.12) 30%, rgba(180,60,0,0.06) 55%, transparent 80%)', filter: 'blur(50px)', zIndex: 2 }}
        animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Upper vignette */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(0,0,0,0.97) 0%, transparent 100%)', zIndex: 3, pointerEvents: 'none' }} />

      {/* Edge vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.97) 100%)', zIndex: 4, pointerEvents: 'none' }} />

      {/* Screen edge fire glow */}
      {[
        { style: { top:0, left:0, right:0, height:100, background:'linear-gradient(180deg,rgba(255,80,0,0.05),transparent)' } },
        { style: { bottom:0, left:0, right:0, height:220, background:'linear-gradient(0deg,rgba(255,90,0,0.18),transparent)' } },
        { style: { top:0, bottom:0, left:0, width:180, background:'linear-gradient(90deg,rgba(255,80,0,0.09),transparent)' } },
        { style: { top:0, bottom:0, right:0, width:180, background:'linear-gradient(270deg,rgba(255,80,0,0.09),transparent)' } },
      ].map((e, i) => (
        <motion.div key={i} style={{ position:'absolute', ...e.style, zIndex:5, pointerEvents:'none' }}
          animate={{ opacity:[0,0.6,0] }}
          transition={{ duration: 0.5, repeat:Infinity, delay: i*0.12, repeatType:'reverse' }}
        />
      ))}

      {/* ── ROAD / GROUND ── */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'41%', zIndex:6 }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(12,10,8,0) 0%,rgba(18,14,10,0.7) 35%,rgba(8,6,4,0.97) 65%,#040302 100%)' }} />

        {/* Road reflection */}
        <motion.div
          style={{ position:'absolute', bottom:'34%', left:'28%', right:'28%', height:110, background:'radial-gradient(ellipse,rgba(255,100,0,0.28) 0%,rgba(201,168,76,0.12) 45%,transparent 85%)', filter:'blur(22px)' }}
          animate={{ scaleX:[0.7,1.5,0.7], opacity:[0.35,0.95,0.35] }}
          transition={{ duration:0.85, repeat:Infinity, ease:'easeInOut' }}
        />

        {/* Tire skid marks */}
        <svg style={{ position:'absolute', bottom:0, left:0, right:0, width:'100%', height:180 }} viewBox="0 0 800 180" preserveAspectRatio="none">
          <motion.path d="M390 200 Q355 130 335 60" stroke="rgba(16,10,4,0.9)" strokeWidth="16" fill="none" strokeLinecap="round"
            initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:0.85 }} transition={{ duration:0.55, delay:0.18 }}
          />
          <motion.path d="M410 200 Q445 130 465 60" stroke="rgba(16,10,4,0.9)" strokeWidth="16" fill="none" strokeLinecap="round"
            initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:0.85 }} transition={{ duration:0.55, delay:0.18 }}
          />
          {/* Hot rubber glow */}
          <motion.path d="M390 200 Q355 130 335 60" stroke="rgba(255,70,0,0.35)" strokeWidth="9" fill="none" strokeLinecap="round" style={{ filter:'blur(5px)' }}
            animate={{ opacity:[0,0.55,0] }} transition={{ duration:1.4, repeat:Infinity }}
          />
          <motion.path d="M410 200 Q445 130 465 60" stroke="rgba(255,70,0,0.35)" strokeWidth="9" fill="none" strokeLinecap="round" style={{ filter:'blur(5px)' }}
            animate={{ opacity:[0,0.55,0] }} transition={{ duration:1.4, repeat:Infinity, delay:0.2 }}
          />
        </svg>
      </div>

      {/* ── CAR + EFFECTS ZONE (z-index 20 — above all bg layers) ── */}
      <div style={{
        position: 'absolute', bottom: '28%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 20,
      }}>

        {/* SMOKE */}
        {smoke.map(s => (
          <motion.div key={s.id}
            style={{
              position:'absolute', width:s.size, height:s.size, bottom:15, right:10,
              borderRadius:'50%',
              background: s.hot
                ? 'radial-gradient(ellipse,rgba(130,65,0,0.55) 0%,rgba(80,38,0,0.28) 55%,transparent 100%)'
                : 'radial-gradient(ellipse,rgba(55,48,38,0.62) 0%,rgba(28,22,16,0.3) 55%,transparent 100%)',
              filter:`blur(${s.hot ? 14 : 24}px)`, pointerEvents:'none',
            }}
            animate={{ x:[0,s.tx], y:[0,s.ty], scale:[0.3,2.8], opacity:[0,0.75,0] }}
            transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:'easeOut' }}
          />
        ))}

        {/* FIRE — base core */}
        <motion.div style={{
          position:'absolute', width:195, height:270, bottom:25, right:-45,
          background:'radial-gradient(ellipse at bottom center,rgba(255,205,0,0.95) 0%,rgba(255,95,0,0.85) 22%,rgba(215,35,0,0.65) 48%,rgba(140,0,0,0.28) 72%,transparent 100%)',
          filter:'blur(10px)', pointerEvents:'none', borderRadius:'44% 44% 28% 28%',
        }}
          animate={{ scaleY:[1,1.45,0.88,1.32,1], scaleX:[1,0.82,1.12,0.92,1], opacity:[0.75,1,0.75] }}
          transition={{ duration:0.28, repeat:Infinity }}
        />

        {/* FIRE — flame tongues */}
        {flames.map(f => (
          <motion.div key={f.id} style={{
            position:'absolute', width:36, height:115, bottom:40+f.oy, right:-18+f.ox,
            background:'linear-gradient(0deg,rgba(255,75,0,1) 0%,rgba(255,195,0,0.92) 48%,transparent 100%)',
            borderRadius:'50% 50% 28% 28%', filter:'blur(3px)', pointerEvents:'none',
            transformOrigin:'bottom center',
          }}
            animate={{ scaleY:[1,1.9,0.65,1.55,1], rotate:[f.rot, f.rot+16, f.rot-16, f.rot], x:[0,10,-10,0] }}
            transition={{ duration:f.dur, delay:f.delay, repeat:Infinity }}
          />
        ))}

        {/* FIRE — outer golden halo */}
        <motion.div style={{
          position:'absolute', width:380, height:290, bottom:-18, right:-170,
          background:'radial-gradient(ellipse,rgba(255,145,0,0.16) 0%,rgba(201,168,76,0.09) 38%,transparent 72%)',
          filter:'blur(28px)', pointerEvents:'none',
        }}
          animate={{ scale:[0.88,1.22,0.88] }}
          transition={{ duration:0.55, repeat:Infinity }}
        />

        {/* Golden luxury blend */}
        <motion.div style={{
          position:'absolute', width:170, height:170, bottom:18, right:-55,
          background:'radial-gradient(ellipse,rgba(255,215,0,0.42) 0%,rgba(201,168,76,0.2) 42%,transparent 82%)',
          filter:'blur(14px)', pointerEvents:'none',
        }}
          animate={{ opacity:[0.5,1,0.5] }}
          transition={{ duration:0.28, repeat:Infinity, repeatType:'reverse' }}
        />

        {/* SPARKS */}
        {sparks.map(s => (
          <motion.div key={s.id} style={{
            position:'absolute',
            width: s.streak ? 2 : s.size,
            height: s.streak ? s.size * 3 : s.size,
            borderRadius: s.streak ? 2 : '50%',
            background: s.color, bottom:18, right:0, pointerEvents:'none',
          }}
            animate={{ x:[0,s.tx], y:[0,s.ty], rotate:s.tx, scale:[1,0], opacity:[1,0] }}
            transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:'easeOut' }}
          />
        ))}

        {/* ── THE CAR ── */}
        <motion.div
          style={{ position:'relative', willChange:'transform', display:'block' }}
          initial={{ scale:0.65, opacity:0 }}
          animate={carAnimate}
          transition={carTransition}
        >
          {/* Undercar glow */}
          <motion.div style={{
            position:'absolute', bottom:-4, left:'12%', right:'12%', height:7,
            background:'rgba(255,75,0,0.28)', filter:'blur(7px)', borderRadius:4,
          }}
            animate={{ scaleX:[0.8,1.25,0.8], opacity:[0.38,0.85,0.38] }}
            transition={{ duration:0.58, repeat:Infinity }}
          />

          <svg
            viewBox="0 0 540 145"
            style={{ width:'min(520px,80vw)', height:'auto', display:'block', overflow:'visible' }}
          >
            {/* ── BODY ── */}
            {/* Lower body sill */}
            <path d="M 55 118 L 475 118 L 498 96 L 468 84 L 390 79 L 378 48 L 282 28 L 175 30 L 122 50 L 72 66 L 35 82 L 28 98 Z"
              fill="#121212" stroke="rgba(201,168,76,0.5)" strokeWidth="1" />

            {/* Side body highlight stripe */}
            <path d="M 88 84 L 404 84 L 426 76 L 82 76 Z" fill="rgba(201,168,76,0.06)" />

            {/* Cabin/roof */}
            <path d="M 135 65 L 168 28 L 295 25 L 375 44 L 375 66 Z"
              fill="#0e0e0e" stroke="rgba(201,168,76,0.35)" strokeWidth="0.8" />

            {/* Windshield */}
            <path d="M 160 64 L 182 31 L 290 28 L 299 64 Z"
              fill="rgba(28,22,12,0.88)" stroke="rgba(201,168,76,0.25)" strokeWidth="0.7" />
            {/* windshield glint */}
            <path d="M 170 62 L 188 34 L 222 31 L 218 62 Z" fill="rgba(201,168,76,0.05)" />

            {/* Rear window */}
            <path d="M 304 64 L 314 29 L 370 44 L 370 65 Z"
              fill="rgba(18,14,8,0.9)" stroke="rgba(201,168,76,0.2)" strokeWidth="0.7" />

            {/* Rear wing */}
            <rect x="462" y="78" width="42" height="4" rx="2" fill="#111" stroke="#C9A84C" strokeWidth="0.8" />
            <rect x="490" y="62" width="4" height="18" rx="1" fill="#111" stroke="#C9A84C" strokeWidth="0.6" />

            {/* Door lines */}
            <line x1="225" y1="68" x2="222" y2="115" stroke="rgba(201,168,76,0.15)" strokeWidth="0.6" />
            <line x1="310" y1="66" x2="308" y2="115" stroke="rgba(201,168,76,0.15)" strokeWidth="0.6" />

            {/* ── FRONT WHEEL ── */}
            {/* Tire */}
            <ellipse cx="120" cy="112" rx="28" ry="28" fill="#090909" />
            {/* Rim */}
            <motion.g style={{ transformOrigin:'120px 112px' }}
              animate={{ rotate: phase === 'exit' ? 3600 : 1440 }}
              transition={{ duration: phase === 'exit' ? 0.4 : 3, ease:'linear', repeat:Infinity }}
            >
              <circle cx="120" cy="112" r="21" fill="#141414" stroke="#C9A84C" strokeWidth="1.5" />
              {[0,72,144,216,288].map(deg => (
                <line key={deg}
                  x1={120} y1={112}
                  x2={120 + 19*Math.cos(deg*Math.PI/180)}
                  y2={112 + 19*Math.sin(deg*Math.PI/180)}
                  stroke="#C9A84C" strokeWidth="1.5"
                />
              ))}
              <circle cx="120" cy="112" r="4.5" fill="#E8C96A" />
            </motion.g>
            <circle cx="120" cy="112" r="27" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="2" />

            {/* ── REAR WHEEL ── */}
            <ellipse cx="400" cy="112" rx="28" ry="28" fill="#090909" />
            <motion.g style={{ transformOrigin:'400px 112px' }}
              animate={{ rotate: phase === 'exit' ? 7200 : 2880 }}
              transition={{ duration: phase === 'exit' ? 0.3 : 1.5, ease:'linear', repeat:Infinity }}
            >
              <circle cx="400" cy="112" r="21" fill="#141414" stroke="#C9A84C" strokeWidth="1.5" />
              {[0,72,144,216,288].map(deg => (
                <line key={deg}
                  x1={400} y1={112}
                  x2={400 + 19*Math.cos(deg*Math.PI/180)}
                  y2={112 + 19*Math.sin(deg*Math.PI/180)}
                  stroke="#C9A84C" strokeWidth="1.5"
                />
              ))}
              <circle cx="400" cy="112" r="4.5" fill="#E8C96A" />
            </motion.g>
            <circle cx="400" cy="112" r="27" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="2" />

            {/* ── HEADLIGHTS ── */}
            <path d="M 33 90 L 24 85 L 26 73 L 40 78 Z" fill="rgba(255,242,205,0.95)" style={{ filter:'drop-shadow(0 0 8px rgba(255,240,200,0.9)) drop-shadow(0 0 20px rgba(255,220,150,0.5))' }} />
            <path d="M 37 96 L 28 93 L 30 86 L 42 88 Z" fill="rgba(255,220,140,0.75)" />

            {/* ── TAILLIGHTS ── */}
            <motion.g
              animate={{ opacity:[1,0.35,1] }}
              transition={{ duration:0.28, repeat:Infinity }}
              style={{ filter:'drop-shadow(0 0 10px rgba(255,0,0,0.95)) drop-shadow(0 0 25px rgba(255,50,0,0.6))' }}
            >
              <path d="M 498 95 L 510 88 L 509 78 L 496 82 Z" fill="rgba(255,25,0,0.98)" />
              <path d="M 495 102 L 506 98 L 505 91 L 493 94 Z" fill="rgba(255,50,0,0.78)" />
            </motion.g>
          </svg>
        </motion.div>
      </div>

      {/* ── LOGO (z-index 30) ── */}
      <AnimatePresence>
        {logoOn && (
          <motion.div
            style={{
              position:'absolute', top:'16%', left:'50%',
              transform:'translateX(-50%)',
              zIndex: 30,
              width:'min(400px,88vw)',
              display:'flex', flexDirection:'column', alignItems:'center',
              pointerEvents:'none',
            }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.25 }}
          >
            {/* Fire sweep line */}
            <motion.div style={{ height:2, background:'linear-gradient(90deg,transparent,#FF6000,#FFD700,#FF6000,transparent)', filter:'blur(1px)', width:0, marginBottom:10 }}
              animate={{ width:'100%' }} transition={{ duration:0.45 }}
            />

            {/* Car icon */}
            <motion.svg viewBox="0 0 80 30" style={{ width:44, height:'auto', marginBottom:10, filter:'drop-shadow(0 0 14px rgba(201,168,76,0.9))' }}
              animate={{ y:[0,-3,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
            >
              <path d="M4 24 L76 24 L80 18 L74 15 L60 13 L58 5 L44 2 L22 3 L14 8 L6 12 L1 17 Z" fill="#C9A84C" />
            </motion.svg>

            {/* JAPONI letters */}
            <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:4 }}>
              {'JAPONI'.split('').map((ch, i) => (
                <motion.span key={i}
                  style={{ fontFamily:'Cormorant Garamond,Georgia,serif', fontWeight:700, fontStyle:'italic', fontSize:'clamp(34px,8vw,54px)', lineHeight:1, letterSpacing:'0.1em', color:'#E8C96A', textShadow:'0 0 28px rgba(201,168,76,0.85),0 0 70px rgba(201,168,76,0.35),0 2px 4px rgba(0,0,0,0.9)' }}
                  initial={{ opacity:0, scaleY:0.45, y:12 }}
                  animate={{ opacity:1, scaleY:1, y:0 }}
                  transition={{ duration:0.38, delay:i*0.055 }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {/* AUTO */}
            <motion.div
              style={{ fontFamily:'Inter,Arial,sans-serif', fontWeight:300, fontSize:'clamp(12px,3vw,17px)', letterSpacing:'0.7em', textTransform:'uppercase', color:'rgba(201,168,76,0.78)', borderTop:'1px solid rgba(201,168,76,0.32)', borderBottom:'1px solid rgba(201,168,76,0.32)', padding:'4px 14px', textShadow:'0 0 18px rgba(201,168,76,0.45)' }}
              initial={{ opacity:0, letterSpacing:'0.1em' }}
              animate={{ opacity:1, letterSpacing:'0.7em' }}
              transition={{ duration:0.4, delay:0.38 }}
            >
              AUTO
            </motion.div>

            {/* Tagline */}
            <motion.p style={{ fontFamily:'Inter,Arial,sans-serif', fontSize:9, letterSpacing:'0.45em', textTransform:'uppercase', color:'rgba(201,168,76,0.58)', marginTop:10 }}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.35, delay:0.65 }}
            >
              ALG&Eacute;RIE&apos;S #1 CAR MARKETPLACE
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOADING BAR (z-index 30) ── */}
      <AnimatePresence>
        {barOn && (
          <motion.div
            style={{ position:'absolute', bottom:'12%', left:'50%', transform:'translateX(-50%)', width:'min(320px,80vw)', zIndex:30, pointerEvents:'none' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}
          >
            {/* Track */}
            <div style={{ width:'100%', height:2, background:'rgba(201,168,76,0.14)', border:'1px solid rgba(201,168,76,0.22)', borderRadius:2, position:'relative', overflow:'hidden' }}>
              {/* Fill */}
              <motion.div
                style={{ position:'absolute', top:0, left:0, height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#8B6914,#C9A84C,#E8C96A,#C9A84C)', backgroundSize:'200% 100%' }}
                animate={{ backgroundPosition:['0% 0%','200% 0%'] }}
                transition={{ duration:1.4, repeat:Infinity, ease:'linear' }}
              />
              {/* Fuse head */}
              <div style={{ position:'absolute', right:`${100-progress}%`, top:-3, width:5, height:8, background:'#FFD700', borderRadius:2, filter:'blur(2px)', boxShadow:'0 0 8px rgba(255,215,0,0.95)' }} />
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', marginTop:7, alignItems:'center' }}>
              <motion.span style={{ fontFamily:'Inter,Arial,sans-serif', fontSize:9, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(201,168,76,0.38)' }}
                animate={{ opacity:[0.38,0.85,0.38] }} transition={{ duration:1, repeat:Infinity }}
              >
                CHARGEMENT EN COURS...
              </motion.span>
              <span style={{ fontFamily:'Inter,Arial,sans-serif', fontSize:10, letterSpacing:'0.12em', color:'rgba(201,168,76,0.55)' }}>
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXIT FLASH (z-index 50) ── */}
      <AnimatePresence>
        {exitFlash && (
          <motion.div
            style={{ position:'absolute', inset:0, zIndex:50, background:'radial-gradient(ellipse,rgba(255,228,145,1) 0%,rgba(201,168,76,0.92) 28%,transparent 68%)', transformOrigin:'center', pointerEvents:'none' }}
            initial={{ scale:0, opacity:0 }}
            animate={{ scale:4.5, opacity:[0,1,0] }}
            transition={{ duration:0.55, times:[0,0.45,1] }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
