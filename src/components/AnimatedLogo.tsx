'use client';

import React, { useEffect, useRef } from 'react';
import { m as motion, useInView, useScroll, useTransform } from "framer-motion";

interface AnimatedLogoProps {
  variant?: "navbar" | "footer";
  className?: string;
}

const GOLD_PRIMARY   = "#C9A84C";   // main gold
const GOLD_BRIGHT    = "#E8C96A";   // bright gold for shimmer peak
const GOLD_GLOW      = "rgba(201,168,76,0.6)"; // gold glow shadow
const GOLD_GLOW_SOFT = "rgba(201,168,76,0.15)"; // very soft ambient glow
const WHITE_PURE     = "#FFFFFF";
const WHITE_SOFT     = "#E8E8E8";

export default function AnimatedLogo({ variant = "navbar", className }: AnimatedLogoProps) {
  const footerLogoRef = useRef(null);
  const isInView = useInView(footerLogoRef, { once: true, margin: "-50px" });
  const { scrollY } = useScroll();
  const logoBrightness = useTransform(scrollY, [0, 80], [1, 1.15]);

  useEffect(() => {
    // Inject CSS Keyframes
    const styleId = 'animated-logo-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes logoShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes goldBreathe {
          0%,100% {
            filter: drop-shadow(0 0 3px rgba(201,168,76,0.3))
                    drop-shadow(0 0 6px rgba(201,168,76,0.1));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(201,168,76,0.7))
                    drop-shadow(0 0 16px rgba(201,168,76,0.3))
                    drop-shadow(0 0 24px rgba(201,168,76,0.1));
            transform: scale(1.04);
          }
        }

        @keyframes iconSpinIn {
          0%   { transform: rotate(-15deg) scale(0.6); opacity: 0; }
          60%  { transform: rotate(5deg) scale(1.05); opacity: 1; }
          80%  { transform: rotate(-2deg) scale(0.98); }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }

        @keyframes autoTextShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }

        @keyframes logoFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-3px); }
        }

        @keyframes particleDrift {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.4; }
          100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
        }

        @keyframes crownGlow {
          0%,100% { opacity: 0; transform: scaleX(0.5) translateY(4px); }
          50%      { opacity: 1; transform: scaleX(1) translateY(0px); }
        }

        .logo-navbar-wrapper:hover .logo-icon-wrap {
          animation: none !important;
          transform: rotate(12deg) scale(1.15) !important;
          filter: drop-shadow(0 0 12px rgba(201,168,76,0.9))
                   drop-shadow(0 0 24px rgba(201,168,76,0.4)) !important;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }

        .logo-auto-text {
          background: linear-gradient(
            90deg,
            #8B6914 0%,
            #C9A84C 20%,
            #E8C96A 40%,
            #FFFACD 50%,
            #E8C96A 60%,
            #C9A84C 80%,
            #8B6914 100%
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: autoTextShimmer 3s linear infinite;
        }

        .logo-navbar-wrapper:hover .logo-auto-text {
          animation-duration: 1s;
          letter-spacing: 0.35em !important;
          transition: letter-spacing 0.4s ease;
        }

        .logo-navbar-wrapper:hover .logo-accent-line {
          filter: brightness(1.5);
          box-shadow: 0 0 8px rgba(201,168,76,0.8);
          transition: all 0.2s ease;
        }

        .logo-navbar-wrapper::before {
          content: "";
          position: absolute;
          inset: -8px -12px;
          background: radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%);
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .logo-navbar-wrapper:hover::before {
          opacity: 1;
        }

        .logo-footer-wrapper:hover .logo-crown-glow {
          animation: crownGlow 0.6s ease forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-icon-wrap,
          .footer-logo-icon,
          .logo-particle,
          .logo-auto-text,
          .footer-auto-text,
          .logo-footer-wrapper {
            animation: none !important;
          }
          .logo-particle {
            display: none !important;
          }
        }

        .logo-icon-wrap        { will-change: transform, filter; }
        .logo-footer-wrapper   { will-change: transform; }
        .logo-particle         { will-change: transform, opacity; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const navbarLetterVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: (i: number) => ({
      y: "0%",
      opacity: 1,
      transition: {
        delay: 0.4 + i * 0.06,
        duration: 0.7,
        ease: "easeOut" as const
      }
    })
  };

  const footerLetterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.3 + i * 0.05,
        duration: 0.6,
        ease: "easeOut" as const
      }
    })
  };

  const IconSVG = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD_PRIMARY} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a2 2 0 00-1.6-.8H8.3a2 2 0 00-1.6.8L4 11l-5.16.86a1 1 0 00-.84.99V16h3" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );

  if (variant === "navbar") {
    return (
      <motion.div 
        className={`logo-navbar-wrapper flex items-center gap-3 relative cursor-pointer ${className}`}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        style={{ filter: `brightness(${logoBrightness})` }}
        aria-label="JAPONI AUTO — Accueil"
        role="link"
        tabIndex={0}
      >
        {/* CAR ICON */}
        <motion.div 
          className="logo-icon-wrap"
          style={{
            animation: 'iconSpinIn 1.2s cubic-bezier(0.16,1,0.3,1) forwards 0.2s, goldBreathe 4s ease-in-out infinite 1.5s'
          }}
        >
          <IconSVG />
        </motion.div>

        {/* TEXT BLOCK */}
        <div className="logo-text-block flex flex-col justify-center">
          <div className="logo-japoni-row flex overflow-hidden">
            {'JAPONI'.split('').map((letter, i) => (
              <motion.span 
                key={i} 
                custom={i}
                variants={navbarLetterVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ 
                  color: [WHITE_PURE, GOLD_PRIMARY, GOLD_BRIGHT, GOLD_PRIMARY, WHITE_PURE],
                  transition: { duration: 1.2, delay: i * 0.04 }
                }}
                className="logo-letter-japoni leading-none"
                style={{ 
                  fontFamily: '"Cormorant Garamond", serif', 
                  fontWeight: 500, 
                  fontSize: '1.4rem', 
                  letterSpacing: '0.08em',
                  color: WHITE_PURE,
                  display: 'inline-block'
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <motion.div 
            className="logo-auto-text"
            style={{ 
              fontFamily: '"Inter", sans-serif', 
              fontWeight: 500, 
              fontSize: '0.75rem', 
              marginTop: '1px', 
              letterSpacing: '0.25em',
              opacity: 0.9
            }}
          >
            AUTO
          </motion.div>
        </div>

        {/* ACCENT UNDERLINE */}
        <motion.div 
          className="logo-accent-line absolute"
          style={{
            bottom: '-4px',
            left: 0,
            width: '100%',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${GOLD_PRIMARY} 40%, ${GOLD_BRIGHT} 50%, ${GOLD_PRIMARY} 60%, transparent)`,
            transformOrigin: 'left center'
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>
    );
  }

  // FOOTER VARIANT
  return (
    <motion.div 
      ref={footerLogoRef}
      className={`logo-footer-wrapper flex items-center gap-3 relative cursor-pointer ${className}`}
      initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        filter: "blur(0px)",
        transition: { duration: 1.0, ease: "easeOut" }
      } : {}}
      whileHover={{ scale: 1.04 }}
      style={{
        animation: isInView ? 'logoFloat 6s ease-in-out infinite 1.5s' : 'none'
      }}
      aria-label="JAPONI AUTO — Accueil"
      role="link"
      tabIndex={0}
    >
      {/* PARTICLE SYSTEM */}
      <div className="logo-particles absolute inset-0 pointer-events-none" aria-hidden="true">
        {[
          {x: 10, y: -45, d: 0.0}, {x: -15, y: -38, d: 0.4}, {x: 20, y: -52, d: 0.8}, {x: -8, y: -41, d: 1.2},
          {x: 5, y: -60, d: 0.2}, {x: -20, y: -35, d: 0.6}, {x: 14, y: -48, d: 1.0}, {x: -12, y: -55, d: 1.4}
        ].map((p, i) => (
          <div 
            key={i} 
            className="absolute rounded-full"
            style={{
              width: i % 2 === 0 ? '3px' : '2px',
              height: i % 2 === 0 ? '3px' : '2px',
              background: GOLD_PRIMARY,
              left: '14px',
              top: '14px',
              opacity: 0.5,
              animation: `particleDrift ${2.5 + i * 0.2}s ease-out infinite`,
              animationDelay: `${p.d}s`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ICON */}
      <motion.div 
        className="footer-logo-icon"
        initial={{ rotate: -20, scale: 0.5, opacity: 0 }}
        animate={isInView ? { rotate: 0, scale: 1, opacity: 1 } : {}}
        transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 14 }}
        style={{
          animation: isInView ? 'goldBreathe 5s ease-in-out infinite 1s' : 'none'
        }}
      >
        <IconSVG />
      </motion.div>

      {/* TEXT */}
      <div className="footer-logo-text flex items-center gap-2 overflow-hidden">
        <div className="flex">
          {'JAPONI'.split('').map((letter, i) => (
            <motion.span 
              key={i}
              custom={i}
              variants={footerLetterVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="footer-japoni"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '1.4rem',
                color: WHITE_SOFT,
                letterSpacing: '0.15em',
                fontWeight: 500
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        <motion.span 
          className="footer-auto-text"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.85rem',
            letterSpacing: '0.15em',
            fontWeight: 600,
            textShadow: isInView ? `0 0 12px ${GOLD_GLOW}, 0 0 24px ${GOLD_GLOW_SOFT}` : 'none'
          }}
        >
          AUTO
        </motion.span>
      </div>

      {/* GOLD CROWN GLOW */}
      <div className="logo-crown-glow absolute" style={{
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '6px',
        background: `linear-gradient(90deg, transparent, ${GOLD_PRIMARY} 30%, ${GOLD_BRIGHT} 50%, ${GOLD_PRIMARY} 70%, transparent)`,
        borderRadius: '4px',
        filter: 'blur(3px)',
        opacity: 0
      }} />

      {/* ACCENT LINE IN FOOTER */}
      <motion.div 
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: 0,
          width: '100%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${GOLD_PRIMARY} 40%, ${GOLD_BRIGHT} 50%, ${GOLD_PRIMARY} 60%, transparent)`,
          transformOrigin: 'left center'
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.6 }}
      />
    </motion.div>
  );
}
