'use client';

import React, { useState, useEffect } from 'react';
import { m as motion } from "framer-motion";

interface SocialPopupProps {
  onClose: () => void;
}

const GOLD_PRIMARY = "#C9A84C";

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  href: 'https://facebook.com/japoni.auto',          icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/japoni_auto',          icon: <g><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"/></g> },
  { id: 'x',         label: 'X',         href: 'https://x.com/japoni_auto',                 icon: <path d="M4 4l11.733 16h4.267l-11.733-16z M4 20l6.768-6.108 M20 4l-6.768 6.108" strokeWidth="2"/> },
  { id: 'threads',   label: 'Threads',   href: 'https://threads.net/@japoni_auto',           icon: <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z M12 7v10 M7 12h10" strokeWidth="2"/> },
  { id: 'pinterest', label: 'Pinterest', href: 'https://pinterest.com/japoniauto',           icon: <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" strokeWidth="2"/> },
  { id: 'linkedin',  label: 'LinkedIn',  href: 'https://linkedin.com/company/japoni-auto',   icon: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"/> },
  { id: 'youtube',   label: 'YouTube',   href: 'https://youtube.com/@JaponiAuto',            icon: <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z M9.75 15.02V8.98L15.25 12l-5.5 3.02z"/> },
  { id: 'tiktok',    label: 'TikTok',    href: 'https://tiktok.com/@japoni_auto',            icon: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" strokeWidth="2"/> },
  { id: 'telegram',  label: 'Telegram',  href: 'https://t.me/JaponiAuto',                    icon: <path d="M22 2L2 10.5l7.5 3L18 7l-7 8.5 7.5 5.5z" strokeWidth="2"/> },
  { id: 'whatsapp',  label: 'WhatsApp',  href: 'https://wa.me/213XXXXXXXXX',                 icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.035a11.848 11.848 0 001.592 5.925L0 22.133l4.246-1.113a11.782 11.782 0 005.804 1.541h.005c6.637 0 12.032-5.396 12.035-12.035a11.81 11.81 0 00-3.676-8.502"/> },
  { id: 'wechat',    label: 'WeChat',    href: '#',                                          icon: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2z"/> },
  { id: 'viber',     label: 'Viber',     href: '#',                                          icon: <path d="M12 2L2 12h10l-1 10z" strokeWidth="2"/> },
  { id: 'discord',   label: 'Discord',   href: 'https://discord.gg/japoni-auto',             icon: <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 13.25 13.25 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.682 4.37.07.07 0 003.653 4.4c-2.909 4.333-3.708 8.563-3.31 12.73a.072.072 0 00.027.051c1.92 1.412 3.775 2.27 5.59 2.827a.076.076 0 00.082-.027c.428-.584.8-1.205 1.12-1.859a.077.077 0 00-.041-.106 13.107 13.107 0 01-1.745-.83.077.077 0 01-.007-.129c.143-.108.286-.22.423-.334a.076.076 0 01.082-.012c3.652 1.667 7.607 1.667 11.206 0a.076.076 0 01.083.011c.137.115.28.226.424.335a.077.077 0 01-.006.13 10.97 10.97 0 01-1.747.828.077.077 0 00-.041.107c.32.654.692 1.275 1.12 1.859a.075.075 0 00.082.027c1.821-.557 3.676-1.415 5.596-2.827a.073.073 0 00.027-.05c.456-4.832-.756-9.018-3.32-12.744a.077.077 0 00-.029-.03zM8.02 14.17c-1.18 0-2.157-1.085-2.157-2.42 0-1.334.957-2.42 2.157-2.42 1.21 0 2.176 1.086 2.157 2.42 0 1.335-.956 2.42-2.157 2.42zm7.973 0c-1.18 0-2.156-1.085-2.156-2.42 0-1.334.956-2.42 2.156-2.42 1.21 0 2.176 1.086 2.157 2.42 0 1.335-.957 2.42-2.157 2.42z"/> },
];

const BOKEH = [
  { w:240, h:240, top:'8%',  left:'5%',  bg:'rgba(201,168,76,0.07)', blur:80 },
  { w:180, h:180, top:'60%', left:'2%',  bg:'rgba(201,168,76,0.05)', blur:60 },
  { w:300, h:300, top:'20%', left:'70%', bg:'rgba(201,168,76,0.06)', blur:100 },
  { w:150, h:150, top:'75%', left:'80%', bg:'rgba(255,220,100,0.04)', blur:50 },
  { w:200, h:200, top:'5%',  left:'45%', bg:'rgba(201,168,76,0.04)', blur:70 },
  { w:120, h:120, top:'85%', left:'40%', bg:'rgba(255,255,255,0.025)', blur:40 },
  { w:260, h:260, top:'40%', left:'85%', bg:'rgba(201,168,76,0.05)', blur:90 },
  { w:100, h:100, top:'50%', left:'25%', bg:'rgba(255,220,100,0.03)', blur:35 },
  { w:180, h:180, top:'15%', left:'15%', bg:'rgba(201,168,76,0.04)', blur:65 },
  { w:220, h:220, top:'70%', left:'60%', bg:'rgba(201,168,76,0.06)', blur:75 },
  { w:140, h:140, top:'35%', left:'55%', bg:'rgba(255,255,255,0.02)', blur:45 },
  { w:160, h:160, top:'90%', left:'10%', bg:'rgba(201,168,76,0.04)', blur:55 },
];

export default function SocialPopup({ onClose }: SocialPopupProps) {
  const [neverShow, setNeverShow] = useState(false);
  const [glintActive, setGlintActive] = useState(false);
  const [emblemSpun, setEmblemSpun] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setGlintActive(true), 800);
    const t2 = setTimeout(() => setEmblemSpun(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleClose = () => {
    if (neverShow) {
      localStorage.setItem('japoniPopupDismissed', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">

      {/* ── BACKDROP ── */}
      <motion.div
        className="fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(201,168,76,0.08) 0%, rgba(15,10,5,0.95) 45%, rgba(0,0,0,0.97) 100%)',
          backdropFilter: 'blur(14px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleClose}
      >
        {BOKEH.map((b, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: b.w,
              height: b.h,
              top: b.top,
              left: b.left,
              background: b.bg,
              filter: `blur(${b.blur}px)`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
            animate={{ scale: [1, 1.15, 1], y: [0, -12, 0] }}
            transition={{ duration: 7 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      {/* ── MODAL CONTAINER ── */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative z-[9999] overflow-hidden"
        style={{
          width: '480px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          borderRadius: '20px',
          background: 'linear-gradient(160deg, #1a1208 0%, #0f0d0a 15%, #0a0a0a 40%, #0d0b08 70%, #111008 100%)',
          boxShadow: `0 0 0 1.5px ${GOLD_PRIMARY}, inset 0 0 0 1px rgba(201,168,76,0.2), 0 0 0 4px rgba(201,168,76,0.1), 0 0 0 8px rgba(201,168,76,0.04), 0 30px 100px rgba(0,0,0,0.9), 0 0 60px rgba(201,168,76,0.12), 0 0 120px rgba(201,168,76,0.06)`,
        }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Carbon fiber texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.04) 0deg 90deg, rgba(0,0,0,0.3) 90deg 180deg)',
            backgroundSize: '5px 5px',
            opacity: 1,
            borderRadius: '20px',
          }}
        />
        {/* Depth gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.04] via-transparent to-black/30" />

        {/* Corner filigrees */}
        {[
          { pos: 'top-3 left-3',    rot: 0 },
          { pos: 'top-3 right-3',   rot: 90 },
          { pos: 'bottom-3 left-3', rot: -90 },
          { pos: 'bottom-3 right-3',rot: 180 },
        ].map((c, i) => (
          <motion.div
            key={i}
            className={`absolute ${c.pos} w-3.5 h-3.5`}
            style={{ transform: `rotate(${c.rot}deg)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M1 14V1H14" stroke={GOLD_PRIMARY} strokeWidth="1.5"/>
              <rect x="0" y="0" width="2" height="2" transform="translate(13 0) rotate(45)" fill={GOLD_PRIMARY}/>
              <rect x="0" y="0" width="2" height="2" transform="translate(0 13) rotate(45)" fill={GOLD_PRIMARY}/>
            </svg>
          </motion.div>
        ))}

        {/* Glint sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 h-full w-[200%]"
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(232,196,76,0.35) 45%, rgba(255,255,255,0.5) 50%, rgba(232,196,76,0.35) 55%, transparent 65%)' }}
            initial={{ x: '-100%' }}
            animate={glintActive ? { x: '100%' } : {}}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-md flex items-center justify-center border transition-all"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a, #222)',
            borderColor: 'rgba(201,168,76,0.4)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px rgba(255,255,255,0.06)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5), inset 0 1px rgba(255,255,255,0.06), 0 0 12px rgba(201,168,76,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5), inset 0 1px rgba(255,255,255,0.06)';
          }}
        >
          <svg viewBox="0 0 32 32" className="w-5 h-5" stroke={GOLD_PRIMARY} strokeWidth="1.5" strokeLinecap="round">
            <line x1="9" y1="9" x2="23" y2="23"/>
            <line x1="23" y1="9" x2="9" y2="23"/>
          </svg>
        </button>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="relative z-1 overflow-y-auto max-h-[calc(90vh-100px)] pt-10 pb-6 px-6 scrollbar-hide">

          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-8">

            {/* Shield emblem */}
            <motion.div
              style={{
                width: 80, height: 88,
                filter: 'drop-shadow(0 0 16px rgba(201,168,76,0.5)) drop-shadow(0 0 40px rgba(201,168,76,0.2)) drop-shadow(0 4px 12px rgba(0,0,0,0.8))',
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
              animate={emblemSpun ? { opacity: 1, scale: 1, rotate: 360 } : { opacity: 1, scale: 1, rotate: 0 }}
              transition={emblemSpun
                ? { duration: 3, ease: 'easeInOut' }
                : { type: 'spring', stiffness: 120, damping: 14, delay: 0.4 }}
            >
              <svg viewBox="0 0 80 88" fill="none">
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="100%">
                    <stop offset="0%"   stopColor="#E8C96A"/>
                    <stop offset="50%"  stopColor="#C9A84C"/>
                    <stop offset="100%" stopColor="#8B6914"/>
                  </linearGradient>
                </defs>
                <path d="M40 2L2 14v24c0 24.64 16.14 44.4 38 48 21.86-3.6 38-23.36 38-48V14L40 2z" fill="rgba(26,18,8,0.95)" stroke={GOLD_PRIMARY} strokeWidth="2"/>
                <text x="40" y="38" textAnchor="middle" fill="url(#goldGrad)" style={{ fontFamily: 'Cormorant Garamond', fontWeight: 'bold', fontStyle: 'italic', fontSize: 24 }}>JA</text>
                <line x1="16" y1="46" x2="64" y2="46" stroke={GOLD_PRIMARY} strokeWidth="1"/>
                <g transform="translate(40, 64)">
                  <circle r="12" stroke={GOLD_PRIMARY} strokeWidth="1.5"/>
                  {[0, 72, 144, 216, 288].map(deg => <line key={deg} x1="0" y1="0" x2="0" y2="-12" transform={`rotate(${deg})`} stroke={GOLD_PRIMARY} strokeWidth="1.5"/>)}
                  <circle r="2.5" fill="#E8C96A"/>
                  <rect x="-1" y="-16" width="2" height="6" fill={GOLD_PRIMARY}/>
                  <path d="M-10 0 A 10 10 0 0 1 10 0" stroke="rgba(201,168,76,0.5)" strokeWidth="1" fill="none" transform="rotate(-135)"/>
                </g>
              </svg>
            </motion.div>

            {/* Typography */}
            <div className="text-center px-4">
              {/* FIX 10 — Eyebrow */}
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
                className="text-[11px] uppercase mb-1"
                style={{
                  fontFamily: 'Cormorant Garamond',
                  letterSpacing: '0.4em',
                  color: 'rgba(201,168,76,0.8)',
                  textShadow: '0 0 12px rgba(201,168,76,0.4)',
                }}
              >
                Restez Connectés
              </motion.p>

              {/* FIX 6 — Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="text-[22px] leading-tight text-[#E8E8E8] mt-1"
                style={{ fontFamily: 'Inter' }}
              >
                Suivez{' '}
                <span
                  className="italic font-bold"
                  style={{
                    fontFamily: 'Cormorant Garamond',
                    color: '#E8C96A',
                    textShadow: '0 0 30px rgba(201,168,76,0.7), 0 0 60px rgba(201,168,76,0.3), 0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  JAPONI AUTO
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                className="text-[13px] leading-[1.65] text-white/55 mt-3 max-w-[340px] mx-auto"
                style={{ fontFamily: 'Inter' }}
              >
                Exclusivités, avant-premières de nouveaux modèles et coulisses de l&apos;automobile premium !
              </motion.p>

              {/* FIX 9 — Gold divider */}
              <motion.div
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.85, duration: 0.5 }}
                className="mx-auto mt-4"
                style={{
                  width: 60,
                  height: '1.5px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.3) 20%, #E8C96A 50%, rgba(201,168,76,0.3) 80%, transparent 100%)',
                  boxShadow: '0 0 8px rgba(201,168,76,0.4)',
                }}
              />
            </div>
          </div>

          {/* ── PLATFORM GRID ── */}
          <motion.div
            className="grid grid-cols-3 gap-[10px] mb-8"
            variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.9 } } }}
            initial="hidden" animate="show"
          >
            {PLATFORMS.map((p, i) => (
              <motion.a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.85 }, show: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center h-[72px] rounded-[10px] relative overflow-hidden group col-span-1 ${p.id === 'discord' ? 'col-start-2' : ''}`}
                style={{
                  background: 'linear-gradient(145deg, #1f1a0f 0%, #161210 50%, #1a1508 100%)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)',
                  gap: 6,
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #2a2010 0%, #1e1810 50%, #241c0c 100%)';
                  e.currentTarget.style.border = '1px solid rgba(201,168,76,0.75)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(201,168,76,0.2), inset 0 1px 0 rgba(201,168,76,0.15), 0 4px 16px rgba(0,0,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #1f1a0f 0%, #161210 50%, #1a1508 100%)';
                  e.currentTarget.style.border = '1px solid rgba(201,168,76,0.35)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,168,76,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)';
                }}
              >
                {/* Carbon fiber */}
                <div className="absolute inset-0 opacity-100 pointer-events-none rounded-[10px]"
                  style={{ backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.015) 0deg 90deg, transparent 90deg 180deg)', backgroundSize: '4px 4px' }}
                />

                {/* Icon */}
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-[22px] h-[22px] relative z-10"
                  fill={GOLD_PRIMARY}
                  stroke={GOLD_PRIMARY}
                  animate={{ filter: [`drop-shadow(0 1px 3px rgba(201,168,76,0.25))`, `drop-shadow(0 0 10px rgba(201,168,76,0.6))`, `drop-shadow(0 1px 3px rgba(201,168,76,0.25))`] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {p.icon}
                </motion.svg>

                <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#C9A84C] group-hover:text-[#E8C96A] transition-colors relative z-10" style={{ fontFamily: 'Inter' }}>
                  {p.label}
                </span>

                {/* Hover glint */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%', transition: { duration: 0.4 } }}
                />
              </motion.a>
            ))}
          </motion.div>

          {/* ── RATINGS STRIP ── */}
          <div className="flex flex-col items-center gap-2 py-4 border-y mx-2" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
            {/* FIX 7 — Stars */}
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  viewBox="0 0 24 24"
                  className="w-[18px] h-[18px]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1 + i * 0.08, type: 'spring', stiffness: 250, damping: 12 }}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255,200,50,0.8)) drop-shadow(0 0 16px rgba(201,168,76,0.5))' }}
                >
                  <defs>
                    <linearGradient id={`starGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%"   stopColor="#FFD700"/>
                      <stop offset="50%"  stopColor="#C9A84C"/>
                      <stop offset="100%" stopColor="#E8C96A"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill={`url(#starGrad${i})`}/>
                </motion.svg>
              ))}
            </div>

            {/* FIX 8 — Rating score */}
            <p
              className="text-[20px] font-bold"
              style={{
                fontFamily: 'Cormorant Garamond',
                color: '#FFD700',
                textShadow: '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(201,168,76,0.4)',
              }}
            >
              4.9/5
            </p>
            <p className="text-[11px] tracking-[0.08em] text-center" style={{ fontFamily: 'Inter', color: 'rgba(201,168,76,0.55)' }}>
              (150+ avis Google) — L&apos;expérience JAPONI.
            </p>
          </div>

          {/* ── TOGGLE ── */}
          <div
            className="flex items-center gap-3 px-4 py-4 cursor-pointer group"
            onClick={() => setNeverShow(!neverShow)}
          >
            <div
              className={`w-10 h-[22px] rounded-full border relative transition-all duration-300 ${neverShow ? 'border-[#C9A84C]' : ''}`}
              style={{
                background: neverShow ? 'rgba(201,168,76,0.15)' : 'linear-gradient(90deg, #1a1a1a, #222)',
                borderColor: neverShow ? '#C9A84C' : 'rgba(201,168,76,0.25)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }}
            >
              <motion.div
                className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full`}
                animate={{ x: neverShow ? 18 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={neverShow
                  ? { background: 'linear-gradient(135deg, #E8C96A, #C9A84C)', boxShadow: '0 0 8px rgba(201,168,76,0.6)' }
                  : { background: 'linear-gradient(135deg, #333, #2a2a2a)', border: '1px solid rgba(201,168,76,0.3)' }}
              />
            </div>
            <span className="text-[11px] text-[#C9A84C]/40 group-hover:text-[#C9A84C]/70 transition-colors" style={{ fontFamily: 'Inter' }}>
              Ne plus afficher cette offre exclusive.
            </span>
          </div>

          {/* ── FOOTER ── */}
          <div className="flex flex-col items-center pt-2 pb-4">
            <div className="w-full h-[1px] mb-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)', boxShadow: '0 0 6px rgba(201,168,76,0.15)' }}/>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase" style={{ fontFamily: 'Inter', color: 'rgba(201,168,76,0.35)' }}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="opacity-50">
                <path d="M7 1L1 4v5c0 4.11 2.56 7.95 6 9 3.44-1.05 6-4.89 6-9V4L7 1z" stroke={GOLD_PRIMARY} strokeWidth="1"/>
              </svg>
              JAPONI AUTO — L&apos;excellence automobile algérienne
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
