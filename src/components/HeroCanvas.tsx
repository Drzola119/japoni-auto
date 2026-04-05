'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Setup Frames
    const totalFrames = 181;
    const frameUrls = Array.from({ length: totalFrames }, (_, i) => {
      const num = (i + 1).toString().padStart(3, '0');
      return `/frames/ezgif-frame-${num}.jpg`;
    });

    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    // Load frames
    frameUrls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedImages[i] = img;
        loadedCount++;
        setProgress(Math.round((loadedCount / totalFrames) * 100));

        if (loadedCount === totalFrames) {
          // All loaded, start animation
          setLoading(false);
          startAnimation();
        }
      };
      img.onerror = () => {
        console.error('Failed to load frame:', url);
        // Fallback progress to avoid getting stuck if an image fails
        loadedCount++;
        setProgress(Math.round((loadedCount / totalFrames) * 100));
        if (loadedCount === totalFrames) {
          setLoading(false);
          startAnimation();
        }
      };
    });

    // Animation Loop
    const FPS = 24;
    const FRAME_INTERVAL = 1000 / FPS;
    let lastTimestamp = 0;
    let currentFrameIndex = 0;
    let animationId: number;
    let handleResizeRef: () => void;

    const renderFrame = (img: HTMLImageElement) => {
      if (!img || !canvas || !ctx) return;

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Dark Overlay to ensure readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;

      if (delta >= FRAME_INTERVAL) {
        if (loadedImages[currentFrameIndex]) {
          renderFrame(loadedImages[currentFrameIndex]);
        }
        currentFrameIndex = (currentFrameIndex + 1) % loadedImages.length;
        lastTimestamp = timestamp - (delta % FRAME_INTERVAL);
      }

      animationId = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (loadedImages[0]) {
        renderFrame(loadedImages[0]);
      }
      
      handleResizeRef = () => {
        if (loadedImages[currentFrameIndex]) {
          renderFrame(loadedImages[currentFrameIndex]);
        }
      };
      window.addEventListener('resize', handleResizeRef);
      
      animationId = requestAnimationFrame(tick);
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (handleResizeRef) {
        window.removeEventListener('resize', handleResizeRef);
      }
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-[#0A0A0F] flex flex-col items-center justify-center p-4"
          >
            <div className="text-[#C9A84C] font-serif text-2xl tracking-[0.2em] mb-6 font-light" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              JAPONI AUTO
            </div>
            <div className="w-[200px] h-0.5 bg-[rgba(201,168,76,0.2)] rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#C9A84C] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[#9A9480] text-xs uppercase tracking-widest font-sans">
              Chargement... {progress}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 object-cover"
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
}
