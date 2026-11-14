import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface CyberAvatarProps {
  glowIntensity?: number;
  interactive?: boolean;
}

export const CyberAvatar: React.FC<CyberAvatarProps> = ({ 
  glowIntensity = 1,
  interactive = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Motion values for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [4, -4]), {
    stiffness: 120,
    damping: 20
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), {
    stiffness: 120,
    damping: 20
  });

  const [isHovered, setIsHovered] = useState(false);

  // Handle mouse movement for subtle 3D tilt
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Render twinkling constellation stars on the head/skull
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Define star particles constrained to the skull curve
    // Head center roughly at (330, 240) in a 600x600 viewBox
    const starCount = 130;
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      speed: number;
      color: string;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      // Semi-elliptical distribution over upper skull (around x: 260-390, y: 150-250)
      const u = Math.random();
      const v = Math.random();
      const r = Math.sqrt(u) * 65;
      const theta = v * Math.PI * 1.6 - 0.3; // concentrated on upper rear and crown
      
      const x = 320 + Math.cos(theta) * (r * 1.15) - (Math.sin(theta) * 10);
      const y = 205 + Math.sin(theta) * (r * 0.95);

      const isOrange = Math.random() > 0.25;
      const color = isOrange ? '#ff7e1d' : '#ffe1b3';

      stars.push({
        x,
        y,
        size: Math.random() * 1.6 + 0.6,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.04 + 0.015,
        color
      });
    }

    let time = 0;
    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const pulse = Math.sin(time * 2 + i) * 0.35 + 0.65;
        const currentAlpha = star.baseAlpha * pulse * glowIntensity;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.min(1, Math.max(0, currentAlpha));
        ctx.shadowBlur = star.size > 1.2 ? 6 : 2;
        ctx.shadowColor = '#ff5500';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [glowIntensity]);

  return (
    <div
      ref={containerRef}
      id="cyber-avatar-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[560px] aspect-[4/5] flex items-center justify-center select-none"
      style={{ perspective: 1000 }}
    >
      {/* Visor glowing ambient light field on plain black */}
      <div 
        className="absolute top-[28%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[220px] rounded-full pointer-events-none transition-opacity duration-700 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 95, 0, 0.28) 0%, rgba(255, 60, 0, 0.12) 50%, transparent 75%)',
          opacity: isHovered ? 1.2 * glowIntensity : 0.85 * glowIntensity
        }}
      />

      {/* Motion wrapper for 3D tilt */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 600 750"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
        >
          <defs>
            {/* Shading for face & neck */}
            <linearGradient id="skinBase" x1="200" y1="180" x2="420" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e1814" />
              <stop offset="35%" stopColor="#181310" />
              <stop offset="70%" stopColor="#0e0b09" />
              <stop offset="100%" stopColor="#070605" />
            </linearGradient>

            <linearGradient id="skinCheekGlow" x1="280" y1="260" x2="400" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#451e08" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#2a1204" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0705" stopOpacity="0" />
            </linearGradient>

            {/* Turtleneck collar gradient */}
            <linearGradient id="turtleneckGrad" x1="220" y1="430" x2="380" y2="700" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1c1613" />
              <stop offset="30%" stopColor="#140f0c" />
              <stop offset="70%" stopColor="#0a0807" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>

            {/* Glowing neon visor rim gradients */}
            <linearGradient id="visorGlowBar" x1="230" y1="240" x2="430" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff2a00" />
              <stop offset="25%" stopColor="#ff5e00" />
              <stop offset="60%" stopColor="#ff9900" />
              <stop offset="85%" stopColor="#ffc030" />
              <stop offset="100%" stopColor="#ffe680" />
            </linearGradient>

            <linearGradient id="visorGlass" x1="260" y1="240" x2="420" y2="330" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff5e00" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#ff8400" stopOpacity="0.65" />
              <stop offset="80%" stopColor="#ffaa00" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0.1" />
            </linearGradient>

            {/* Liquid glass caustic reflection */}
            <linearGradient id="visorSpecular" x1="270" y1="250" x2="390" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#ffe2b3" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#ff9900" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
            </linearGradient>

            {/* Neon rim light outline (right side jaw & ear contour) */}
            <linearGradient id="rimLightGrad" x1="220" y1="220" x2="410" y2="460" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff851b" />
              <stop offset="40%" stopColor="#ff5500" />
              <stop offset="70%" stopColor="#d13800" />
              <stop offset="100%" stopColor="#450e00" />
            </linearGradient>

            <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="18" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.45 0 0 0  0 0 0.1 0 0  0 0 0 2 0" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Liquid distortion filter */}
            <filter id="liquidVisorDisp">
              <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* BACK OF HEAD & HAIR SHAPE (Deep obsidian black against plain black) */}
          <path
            d="M 235 240 
               C 225 180, 260 120, 335 120 
               C 400 120, 440 160, 435 220
               C 432 250, 420 270, 410 290
               L 415 320
               C 420 360, 410 400, 395 440
               C 385 470, 375 490, 375 510
               L 375 680
               L 190 680
               L 200 510
               C 200 480, 205 450, 215 410
               C 225 370, 220 340, 220 310
               C 220 280, 230 260, 235 240 Z"
            fill="url(#skinBase)"
          />

          {/* HEAD & FACE SCULPT */}
          <path
            d="M 260 170
               C 285 135, 360 130, 400 165
               C 430 190, 435 225, 430 260
               C 425 285, 418 310, 412 335
               C 405 365, 395 390, 375 415
               C 355 435, 330 445, 305 440
               C 280 435, 265 415, 255 385
               C 240 340, 235 300, 235 260
               C 235 215, 245 190, 260 170 Z"
            fill="url(#skinBase)"
          />

          {/* NOSE & JAW SILHOUETTE (Facing 3/4 right) */}
          <path
            d="M 370 260
               C 385 270, 398 285, 405 315
               C 408 328, 404 336, 396 342
               C 388 348, 380 350, 378 356
               C 375 364, 386 374, 384 382
               C 380 395, 365 410, 350 418
               C 330 428, 305 432, 280 425
               L 275 390
               Z"
            fill="#15100d"
          />

          {/* AMBER CHEEK & NOSE LIGHT BOUNCE */}
          <ellipse
            cx="345"
            cy="320"
            rx="55"
            ry="40"
            fill="url(#skinCheekGlow)"
            transform="rotate(15 345 320)"
          />

          {/* EAR & TEMPLE CONTOUR WITH REAR ORANGE RIM LIGHT */}
          <path
            d="M 240 280
               C 235 265, 245 250, 255 255
               C 265 260, 268 280, 265 305
               C 262 325, 250 335, 242 330
               C 236 325, 238 300, 240 280 Z"
            fill="#17120e"
            stroke="url(#rimLightGrad)"
            strokeWidth="2"
          />

          {/* REAR RIM LIGHT (Along back of head and neck) */}
          <path
            d="M 242 165
               C 230 200, 222 250, 225 300
               C 228 350, 225 400, 220 460
               C 216 490, 210 540, 205 600"
            stroke="url(#rimLightGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonBlur)"
            opacity="0.85"
          />

          {/* JAWLINE RIM LIGHT (Front right edge) */}
          <path
            d="M 372 360
               C 378 375, 376 390, 368 405
               C 356 422, 336 434, 310 440"
            stroke="#ff6600"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
            filter="url(#neonBlur)"
          />

          {/* HIGH TURTLENECK COLLAR & SHOULDERS */}
          <path
            d="M 230 450
               C 260 458, 320 460, 360 445
               C 375 440, 385 450, 382 475
               C 378 510, 375 560, 370 610
               L 390 680
               L 180 680
               L 205 610
               C 215 560, 222 505, 230 450 Z"
            fill="url(#turtleneckGrad)"
          />

          {/* Turtleneck collar folds and highlights */}
          <path
            d="M 235 460 C 275 470, 330 468, 360 455"
            stroke="rgba(255, 120, 30, 0.25)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 225 510 C 265 525, 330 520, 370 500"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 215 570 C 260 585, 330 580, 375 555"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* ========================================================= */}
          {/* THE FUTURISTIC ORANGE GLOWING VISOR (Focal Masterpiece) */}
          {/* ========================================================= */}
          
          {/* Visor Outer Halo/Bloom */}
          <path
            d="M 240 250
               C 260 230, 320 220, 420 240
               C 445 245, 455 255, 448 275
               C 438 300, 420 325, 395 338
               C 350 360, 290 340, 260 310
               C 245 295, 235 275, 240 250 Z"
            fill="rgba(255, 90, 0, 0.25)"
            filter="url(#neonBlur)"
          />

          {/* Visor Temples Wrap-around Strap (Glowing Neon Arc over Ear) */}
          <path
            d="M 228 272
               C 230 250, 248 240, 275 238
               L 310 236"
            stroke="url(#visorGlowBar)"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#neonBlur)"
          />
          <path
            d="M 228 272
               C 230 250, 248 240, 275 238
               L 310 236"
            stroke="#fff1cc"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* VISOR LIQUID GLASS BODY */}
          <g filter="url(#liquidVisorDisp)">
            <path
              d="M 270 240
                 C 310 232, 380 238, 435 252
                 C 448 255, 454 266, 448 280
                 C 438 305, 418 328, 388 340
                 C 345 356, 295 342, 275 318
                 C 265 305, 260 270, 270 240 Z"
              fill="url(#visorGlass)"
              stroke="rgba(255, 140, 30, 0.4)"
              strokeWidth="1.5"
            />
          </g>

          {/* Internal HUD / holographic lines inside the visor */}
          <path
            d="M 290 262 L 415 275"
            stroke="rgba(255, 240, 200, 0.4)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <path
            d="M 310 282 L 400 292"
            stroke="rgba(255, 200, 100, 0.3)"
            strokeWidth="0.8"
            strokeDasharray="12 4"
          />

          {/* Bright Glowing Neon Upper Edge Bar */}
          <path
            d="M 268 240
               C 310 232, 380 238, 436 252"
            stroke="url(#visorGlowBar)"
            strokeWidth="5.5"
            strokeLinecap="round"
            filter="url(#neonBlur)"
          />
          <path
            d="M 275 240
               C 315 233, 375 239, 430 252"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Bright Lower Neon Edge of Visor */}
          <path
            d="M 278 318
               C 300 338, 345 352, 388 338
               C 415 328, 432 305, 442 284"
            stroke="url(#visorGlowBar)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#neonBlur)"
          />
          <path
            d="M 288 322
               C 310 338, 345 348, 385 336
               C 410 326, 428 305, 438 288"
            stroke="#ffeedd"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* SPECULAR LIQUID GLASS HIGHLIGHT ON VISOR */}
          <path
            d="M 285 246
               C 320 240, 360 245, 400 256
               C 385 272, 350 280, 305 274
               Z"
            fill="url(#visorSpecular)"
          />

          {/* Front Corner Prism Glint */}
          <circle
            cx="435"
            cy="255"
            r="3.5"
            fill="#ffffff"
            filter="url(#intenseGlow)"
          />
        </svg>

        {/* Constellation Canvas layer (rendered directly over the skull) */}
        <canvas
          ref={canvasRef}
          width={600}
          height={750}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Subtle Liquid Glass Visor Lens Flare Refraction */}
        <div 
          className="absolute top-[32%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-[180px] h-[50px] rounded-full pointer-events-none mix-blend-screen transition-transform duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,160,50,0.4) 40%, transparent 80%)',
            filter: 'blur(6px)',
            opacity: isHovered ? 0.9 : 0.65,
            transform: `translate(${mouseX.get() * 0.05}px, ${mouseY.get() * 0.05}px)`
          }}
        />
      </motion.div>

      {/* Technical coordinate tag under the portrait */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md text-[11px] font-mono text-white/40 tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
        <span>VORTIQ_NEURAL_SYNAPSE // v4.2</span>
      </div>
    </div>
  );
};
