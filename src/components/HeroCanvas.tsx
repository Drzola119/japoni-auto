'use client';

import { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);

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
    const totalFrames = 600;
    const initialBatchSize = 60;
    const frameUrls = Array.from({ length: totalFrames }, (_, i) => {
      const num = (i + 1).toString().padStart(3, '0');
      return `/frames/ezgif-frame-${num}.jpg`;
    });

    let loadedCount = 0;
    const loadedImages = loadedImagesRef.current;

    // Animation Loop Variables
    const FPS = 30;
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
        currentFrameIndex = (currentFrameIndex + 1) % totalFrames;
        lastTimestamp = timestamp - (delta % FRAME_INTERVAL);
      }
      animationId = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      
      if (loadedImages[0]) renderFrame(loadedImages[0]);
      
      handleResizeRef = () => {
        if (loadedImages[currentFrameIndex]) renderFrame(loadedImages[currentFrameIndex]);
      };
      window.addEventListener('resize', handleResizeRef);
      animationId = requestAnimationFrame(tick);
    };

    // Helper to load a single image
    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = frameUrls[index];
        img.onload = () => {
          loadedImages[index] = img;
          loadedCount++;
          if (loadedCount >= initialBatchSize && !startedRef.current) {
            startAnimation();
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount >= initialBatchSize && !startedRef.current) {
            startAnimation();
          }
          resolve();
        };
      });
    };

    // Loading strategy:
    // 1. Load first 60 frames in parallel to start fast
    const loadInitial = async () => {
      const initialPromises = [];
      for (let i = 0; i < initialBatchSize; i++) {
        initialPromises.push(loadImage(i));
      }
      await Promise.all(initialPromises);
      
      // 2. Load the rest in small background chunks of 15
      const chunkSize = 15;
      for (let i = initialBatchSize; i < totalFrames; i += chunkSize) {
        const chunkPromises = [];
        for (let j = 0; j < chunkSize && (i + j) < totalFrames; j++) {
          chunkPromises.push(loadImage(i + j));
        }
        await Promise.all(chunkPromises);
        // Small delay between chunks to keep main thread and network free
        await new Promise(r => setTimeout(r, 100));
      }
    };

    loadInitial();

    // Safety timeout: if after 5 seconds we haven't started, force start
    const safetyT = setTimeout(() => {
      if (!startedRef.current) startAnimation();
    }, 5000);

    return () => {
      clearTimeout(safetyT);
      window.removeEventListener('resize', resizeCanvas);
      if (handleResizeRef) window.removeEventListener('resize', handleResizeRef);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 object-cover"
      style={{ pointerEvents: 'none' }}
    />
  );
}
