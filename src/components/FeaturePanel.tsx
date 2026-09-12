import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Brain,
  Activity,
  Baby,
  ArrowUpRight,
  Star,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────── */

interface Spec {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;         // tailwind text color
  bg: string;            // gradient stops
  glow: string;          // rgba for ambient glow
  doctor: string;
  role: string;
  degree: string;
  img: string;
  slot: string;
  stat: string;
  statLabel: string;
}

const SPECS: Spec[] = [
  {
    id: 'cardio',
    label: 'Cardiology',
    icon: Heart,
    color: 'text-rose-300',
    bg: 'from-rose-500/50 to-pink-600/25',
    glow: 'rgba(244,63,94,0.35)',
    doctor: 'Dr. Tony Stark',
    role: 'Chief of Cardiothoracic Surgery',
    degree: 'MD, FACS',
    img: '/doctor-images/iron-man.jpg',
    slot: 'Today 11:30 AM',
    stat: '99.8%',
    statLabel: 'Success Rate',
  },
  {
    id: 'neuro',
    label: 'Neurology',
    icon: Brain,
    color: 'text-violet-300',
    bg: 'from-violet-500/50 to-purple-600/25',
    glow: 'rgba(139,92,246,0.35)',
    doctor: 'Dr. Stephen Strange',
    role: 'Chief of Neurosurgery',
    degree: 'MD, PhD',
    img: '/doctor-images/doctor-strange.jpg',
    slot: 'Today 12:15 PM',
    stat: '< 18m',
    statLabel: 'Door-to-Needle',
  },
  {
    id: 'trauma',
    label: 'Trauma & ER',
    icon: Activity,
    color: 'text-amber-300',
    bg: 'from-amber-500/50 to-orange-600/25',
    glow: 'rgba(245,158,11,0.35)',
    doctor: 'Dr. Thor Odinson',
    role: 'Head of Emergency',
    degree: 'MD, FACEP',
    img: '/doctor-images/thor.jpg',
    slot: 'Now — 0m Wait',
    stat: '< 4m',
    statLabel: 'Triage Speed',
  },
  {
    id: 'peds',
    label: 'Pediatrics',
    icon: Baby,
    color: 'text-sky-300',
    bg: 'from-sky-500/50 to-cyan-600/25',
    glow: 'rgba(14,165,233,0.35)',
    doctor: 'Dr. Peter Parker',
    role: 'Pediatric Care Lead',
    degree: 'MD, FAAP',
    img: '/doctor-images/spider-man.jpg',
    slot: 'Today 2:00 PM',
    stat: '100%',
    statLabel: 'Family Trust',
  },
];

const CYCLE_MS = 4800;

/* ─────────────────────────────────────────────────────────
   GLASS TILE — reusable container
   ───────────────────────────────────────────────────────── */

const GlassTile: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}> = ({ children, className = '', delay = 0, hover = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 18, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={hover ? { y: -3, scale: 1.02 } : undefined}
    className={`rounded-[20px] overflow-hidden transition-shadow duration-300 ${className}`}
    style={{
      background:
        'linear-gradient(160deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 100%)',
      backdropFilter: 'blur(32px) saturate(200%)',
      WebkitBackdropFilter: 'blur(32px) saturate(200%)',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow:
        'inset 0 1px 2px rgba(255,255,255,0.5), 0 20px 48px -12px rgba(0,12,40,0.28), 0 0 0 1px rgba(255,255,255,0.15)',
    }}
  >
    {children}
  </motion.div>
);

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────── */

interface FeaturePanelProps {
  onWorkflowClick?: () => void;
  onAgentsClick?: () => void;
}

export const FeaturePanel: React.FC<FeaturePanelProps> = ({
  onWorkflowClick,
}) => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const spec = SPECS[idx];

  // Auto-cycle
  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SPECS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [hovered]);

  // 3-D tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 120, damping: 18 });

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    },
    [mx, my],
  );
  const onLeave = useCallback(() => {
    mx.set(0.5);
    my.set(0.5);
    setHovered(false);
  }, [mx, my]);

  const book = useCallback(() => {
    onWorkflowClick ? onWorkflowClick() : navigate('/book-appointment');
  }, [onWorkflowClick, navigate]);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      className="w-full max-w-[460px] select-none"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        id="hero-clinical-console"
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative transform-gpu"
      >
        {/* ── Ambient glow that shifts per specialty ── */}
        <motion.div
          className="absolute -inset-8 rounded-[44px] blur-3xl pointer-events-none -z-10"
          animate={{ opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(ellipse at 50% 40%, ${spec.glow} 0%, transparent 70%)` }}
        />

        {/* ════════════════════════════════════════════
            BENTO GRID — asymmetric mosaic layout
            ════════════════════════════════════════════ */}
        <div className="grid grid-cols-5 grid-rows-[auto_auto_auto] gap-2.5">

          {/* ┌─────────────────────────────────────────┐
              │  TILE A — Doctor Portrait (spans 3 cols, 2 rows)
              └─────────────────────────────────────────┘ */}
          <GlassTile
            className="col-span-3 row-span-2 relative min-h-[260px] group cursor-pointer"
            delay={0.08}
            hover={false}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                {/* Doctor photo fills the entire tile */}
                <img
                  src={spec.img}
                  alt={spec.doctor}
                  className="absolute inset-0 w-full h-full object-cover object-[center_15%] transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
                {/* Doctor info at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                    <span className="text-[10.5px] font-extrabold text-emerald-300 uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                      Verified Lead
                    </span>
                  </div>
                  <h3 className="text-[22px] font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    {spec.doctor}
                  </h3>
                  <p className="text-[12px] text-white/80 font-semibold mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                    {spec.role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </GlassTile>

          {/* ┌────────────────┐
              │  TILE B — Rating
              └────────────────┘ */}
          <GlassTile className="col-span-2 p-3.5 flex flex-col justify-between" delay={0.16}>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.7 + i * 0.06, type: 'spring', stiffness: 300 }}
                >
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                </motion.div>
              ))}
            </div>
            <div>
              <div className="text-[30px] font-black text-white leading-none tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                4.9
              </div>
              <div className="text-[10.5px] text-white/70 font-bold mt-0.5">
                1,400+ reviews
              </div>
            </div>
          </GlassTile>

          {/* ┌────────────────┐
              │  TILE C — Next Slot
              └────────────────┘ */}
          <GlassTile className="col-span-2 p-3.5 flex flex-col justify-between" delay={0.24}>
            <Clock className="w-5 h-5 text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`slot-${spec.id}`}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-[14px] font-extrabold text-white leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
                    {spec.slot}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="text-[10.5px] text-white/65 font-bold mt-0.5">
                Next Available
              </div>
            </div>
          </GlassTile>

          {/* ┌────────────────┐
              │  TILE D — Key Stat
              └────────────────┘ */}
          <GlassTile className="col-span-2 p-3.5 flex flex-col justify-between" delay={0.3}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${spec.color}`}>
              {spec.statLabel}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`stat-${spec.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-[30px] font-black text-white leading-none tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
              >
                {spec.stat}
              </motion.div>
            </AnimatePresence>
            <div className="text-[10.5px] text-white/65 font-bold">
              {spec.degree}
            </div>
          </GlassTile>

          {/* ┌────────────────┐
              │  TILE E — Specialty Selector
              └────────────────┘ */}
          <GlassTile className="col-span-3 p-2.5" delay={0.36} hover={false}>
            <div className="flex items-center justify-between gap-1">
              {SPECS.map((s, i) => {
                const Icon = s.icon;
                const active = idx === i;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className="relative flex-1 flex flex-col items-center gap-1 py-2 rounded-xl cursor-pointer transition-colors duration-200"
                  >
                    {active && (
                      <motion.div
                        layoutId="specBg"
                        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${s.bg}`}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className={`relative z-10 w-4.5 h-4.5 transition-all duration-200 ${active ? `${s.color} drop-shadow-[0_0_6px_currentColor]` : 'text-white/55'}`} />
                    <span className={`relative z-10 text-[9.5px] font-bold tracking-tight transition-colors duration-200 ${active ? 'text-white' : 'text-white/55'}`}>
                      {s.label}
                    </span>
                    {/* Auto-rotate progress */}
                    {active && !hovered && (
                      <motion.div
                        className="absolute bottom-0.5 left-2 right-2 h-[2px] rounded-full bg-white/30 origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }}
                        key={`prog-${idx}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </GlassTile>

          {/* ┌─────────────────────────────────────────┐
              │  TILE F — Book CTA (full-width)
              └─────────────────────────────────────────┘ */}
          <motion.button
            type="button"
            onClick={book}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="col-span-5 relative rounded-[20px] py-4 px-5 flex items-center justify-between cursor-pointer border-0 group overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,246,255,0.92) 100%)',
              boxShadow: '0 14px 36px -8px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.7)',
            }}
          >
            {/* Shimmer sweep on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(56,189,248,0.12) 50%, transparent 60%)',
                backgroundSize: '250% 100%',
                animation: 'shimmer-sweep 3s ease-in-out infinite',
              }}
            />
            <span className="relative flex items-center gap-2.5">
              <Sparkles className="w-4.5 h-4.5 text-sky-500" />
              <span className="text-[15px] font-extrabold text-slate-900">
                Book Consultation
              </span>
            </span>
            <span className="relative flex items-center gap-1.5 text-slate-600 group-hover:text-slate-900 text-[12px] font-bold transition-colors">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`cta-${spec.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  with {spec.doctor.split(' ')[1]}
                </motion.span>
              </AnimatePresence>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </motion.button>

        </div>

        {/* Footer */}
        <div className="pt-3 text-center">
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="text-[11.5px] font-bold text-white/65 hover:text-white transition-colors cursor-pointer"
          >
            Explore All 42 Specialists →
          </button>
        </div>

      </motion.div>
    </div>
  );
};
