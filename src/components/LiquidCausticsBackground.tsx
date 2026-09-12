import React, { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

interface LiquidCausticsBackgroundProps {
  glowIntensity?: number;
  interactive?: boolean;
}

export const LiquidCausticsBackground: React.FC<LiquidCausticsBackgroundProps> = ({
  glowIntensity = 1,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const addRipple = (x: number, y: number, isStrong = false) => {
      ripplesRef.current.push({
        x,
        y,
        radius: 4,
        maxRadius: isStrong ? 220 : 130,
        alpha: (isStrong ? 0.35 : 0.18) * glowIntensity,
        speed: isStrong ? 2.5 : 1.8,
        color: Math.random() > 0.4 ? 'rgba(0, 150, 255,' : 'rgba(120, 210, 255,',
      });

      // Keep max 15 ripples for pristine performance
      if (ripplesRef.current.length > 15) {
        ripplesRef.current.shift();
      }
    };

    let lastMouseMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      const now = Date.now();
      if (now - lastMouseMoveTime > 120) {
        addRipple(e.clientX, e.clientY, false);
        lastMouseMoveTime = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      addRipple(e.clientX, e.clientY, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Periodic ambient subtle liquid pulse from visor origin
    const ambientInterval = setInterval(() => {
      const visorX = window.innerWidth * 0.5;
      const visorY = window.innerHeight * 0.45;
      addRipple(visorX + (Math.random() * 40 - 20), visorY + (Math.random() * 20 - 10), false);
    }, 4500);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.0035;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Outer liquid refraction ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color} ${r.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner caustic specular highlight
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.radius - 6), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.45})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Cursor liquid glass aura
      if (mousePosRef.current.x > 0 && mousePosRef.current.y > 0) {
        const grad = ctx.createRadialGradient(
          mousePosRef.current.x,
          mousePosRef.current.y,
          0,
          mousePosRef.current.x,
          mousePosRef.current.y,
          180
        );
        grad.addColorStop(0, `rgba(0, 150, 255, ${0.08 * glowIntensity})`);
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.02 * glowIntensity})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mousePosRef.current.x, mousePosRef.current.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearInterval(ambientInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [glowIntensity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      id="liquid-caustics-canvas"
      className="pointer-events-none absolute inset-0 z-10 w-full h-full"
    />
  );
};
