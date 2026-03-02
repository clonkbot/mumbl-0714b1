import { useEffect, useRef } from 'react';

interface WaveformProps {
  isActive: boolean;
}

export function Waveform({ isActive }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const bars = 48;
    const barWidth = width / bars - 2;
    const barGap = 2;

    // Frequency data simulation
    const frequencies = Array(bars).fill(0).map(() => Math.random() * 0.3);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update frequencies with smooth interpolation
      for (let i = 0; i < bars; i++) {
        const target = isActive ? 0.2 + Math.random() * 0.6 : 0.1;
        frequencies[i] += (target - frequencies[i]) * 0.15;
      }

      // Draw bars
      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + barGap);
        const barHeight = frequencies[i] * height;
        const y = (height - barHeight) / 2;

        // Gradient color based on height
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(100, 100, 255, 0.5)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
        ctx.shadowBlur = 8;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-16 md:h-20"
      style={{ maxWidth: '400px' }}
    />
  );
}
