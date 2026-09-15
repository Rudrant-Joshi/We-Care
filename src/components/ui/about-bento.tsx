"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  useInView,
  AnimatePresence,
} from "motion/react";
import {
  Check,
  HeartHandshake,
  Award,
  FlaskConical,
  ShieldCheck,
  Clock,
  MapPin,
  Sparkles,
  Stethoscope,
  ArrowRight,
  Activity,
  Calendar,
  ChevronDown,
  Cpu,
  Wind,
  Radio,
  FileCheck2,
  Users,
} from "lucide-react";
import { DEPARTMENT_COLORS } from "../../lib/department-colors";

interface AboutBentoProps {
  onBookConsultation?: () => void;
}

/* ==========================================================================
   Smooth Animated Count-Up Number (Spring Physics & Easing)
   ========================================================================== */

function AnimatedNumber({
  value,
  duration = 1.4,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // easeOutExpo for crisp executive arrival
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * value;
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, value, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ==========================================================================
   3D Interactive Tilt & Specular Sheen Card (Agency Grade)
   ========================================================================== */

function TiltCard({
  children,
  className = "",
  spotlightColor = "rgba(59, 130, 246, 0.14)",
  tiltAmount = 7,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  tiltAmount?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 280, damping: 26 });
  const mouseY = useSpring(y, { stiffness: 280, damping: 26 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [tiltAmount, -tiltAmount]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-tiltAmount, tiltAmount]);

  const rawMouseX = useMotionValue(-1000);
  const rawMouseY = useMotionValue(-1000);

  function handleMouseEnter() {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = rectRef.current || ref.current.getBoundingClientRect();
    rectRef.current = rect;
    const width = rect.width;
    const height = rect.height;

    const mouseFromLeft = e.clientX - rect.left;
    const mouseFromTop = e.clientY - rect.top;

    rawMouseX.set(mouseFromLeft);
    rawMouseY.set(mouseFromTop);

    const xPct = mouseFromLeft / width - 0.5;
    const yPct = mouseFromTop / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    rectRef.current = null;
    x.set(0);
    y.set(0);
    rawMouseX.set(-1000);
    rawMouseY.set(-1000);
  }

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      className={`relative overflow-hidden group [perspective:1000px] cursor-pointer will-change-transform ${className}`}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: useMotionTemplate`radial-gradient(380px circle at ${rawMouseX}px ${rawMouseY}px, ${spotlightColor}, transparent 70%)`,
        }}
      />

      {/* Specular Glass Reflection Sweep on Hover */}
      <div className="pointer-events-none absolute -inset-full w-[250%] h-[250%] bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-45 translate-x-[-130%] group-hover:translate-x-[130%] transition-transform duration-1000 ease-out z-20" />

      {/* 3D Floating Inner Content Container */}
      <div
        style={{ transform: "translateZ(20px)" }}
        className="relative z-10 h-full flex flex-col justify-between"
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ==========================================================================
   Data Models
   ========================================================================== */

const DOCTORS = [
  {
    id: "iron-man",
    icon: Stethoscope,
    name: "Dr. Tony Stark, MD",
    role: "Chief Medical Director & Co-Founder",
    specialty: "Arc-Reactor Cardiothoracic Surgery",
    experience: "28+ Years Experience",
    bio: "Pioneer in artificial cardiac arc-technology, beating-heart surgeries, and micro-engineered cardiovascular implants for critically compromised patients.",
    highlights: ["Arc-Pacing Lead", "3,800+ Heart Surgeries", "Clinical Ethics Board"],
    badge: "DIRECTOR",
    badgeColor: "from-rose-500 to-red-600",
    gradientFrom: DEPARTMENT_COLORS.cardiology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.cardiology.gradientTo,
    solid: DEPARTMENT_COLORS.cardiology.solid,
    borderHover: "hover:border-rose-400/80 hover:shadow-[0_20px_40px_rgba(244,63,94,0.14)]",
    topAccent: DEPARTMENT_COLORS.cardiology.topAccent,
    iconTheme: "bg-rose-50 text-rose-600 border-rose-200/80 group-hover:bg-rose-600 group-hover:text-white",
    specialtyBadge: DEPARTMENT_COLORS.cardiology.tagBadge,
    highlightBadge: "bg-rose-50/60 text-rose-900 border-rose-200/60",
    buttonHover: "group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
    image: "/doctor-images/iron-man.jpg",
  },
  {
    id: "captain-america",
    icon: Cpu,
    name: "Dr. Steve Rogers, MD",
    role: "Chief of Orthopedic Surgery & Physical Rehab",
    specialty: "Peak Kinetic Biomechanics & Bone Restoration",
    experience: "25+ Years Experience",
    bio: "Leader in accelerated musculoskeletal restoration, high-impact fracture repair, and human biomechanical endurance rehab restoring peak vitality.",
    highlights: ["FAAOS Board", "2,800+ Navigations", "Rehab Director"],
    badge: "CHIEF SURGEON",
    badgeColor: "from-amber-500 to-orange-600",
    gradientFrom: DEPARTMENT_COLORS.orthopedics.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.orthopedics.gradientTo,
    solid: DEPARTMENT_COLORS.orthopedics.solid,
    borderHover: "hover:border-amber-400/80 hover:shadow-[0_20px_40px_rgba(245,158,11,0.14)]",
    topAccent: DEPARTMENT_COLORS.orthopedics.topAccent,
    iconTheme: "bg-amber-50 text-amber-600 border-amber-200/80 group-hover:bg-amber-600 group-hover:text-white",
    specialtyBadge: DEPARTMENT_COLORS.orthopedics.tagBadge,
    highlightBadge: "bg-amber-50/60 text-amber-900 border-amber-200/60",
    buttonHover: "group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
    image: "/doctor-images/captain-america.jpg",
  },
  {
    id: "thor",
    icon: ShieldCheck,
    name: "Dr. Thor Odinson, MD",
    role: "Head of Emergency Trauma & Acute Resuscitation",
    specialty: "Cardiac Arrest Resuscitation & Emergency Defibrillation",
    experience: "25+ Years Experience",
    bio: "Commands Level 1 Trauma chambers with legendary resuscitation speed, high-voltage cardiac defibrillation protocols, and acute crisis life support.",
    highlights: ["Level 1 Trauma Lead", "Defibrillation Master", "Instant Triage"],
    badge: "TRAUMA CHAIR",
    badgeColor: "from-orange-500 to-red-600",
    gradientFrom: DEPARTMENT_COLORS.emergency.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.emergency.gradientTo,
    solid: DEPARTMENT_COLORS.emergency.solid,
    borderHover: "hover:border-orange-400/80 hover:shadow-[0_20px_40px_rgba(249,115,22,0.14)]",
    topAccent: DEPARTMENT_COLORS.emergency.topAccent,
    iconTheme: "bg-orange-50 text-orange-600 border-orange-200/80 group-hover:bg-orange-600 group-hover:text-white",
    specialtyBadge: DEPARTMENT_COLORS.emergency.tagBadge,
    highlightBadge: "bg-orange-50/60 text-orange-900 border-orange-200/60",
    buttonHover: "group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600",
    image: "/doctor-images/thor.jpg",
  },
];

const CLINICAL_PILLARS = [
  {
    icon: HeartHandshake,
    title: "Compassionate Care",
    tag: "PATIENT EMPATHY",
    description:
      "We treat every patient like a beloved family member. Clinical empathy, emotional dignity, and round-the-clock bedside support guide every diagnosis.",
    keyPoints: ["Empathetic Bedside Triage", "Family Consultation Rooms", "Holistic Recovery Plans"],
    gradientFrom: "#f43f5e",
    gradientTo: "#e11d48",
    solid: "text-rose-600",
    gradientBg: "from-rose-500/10 via-white to-rose-50/40",
    border: "border-rose-200/90 hover:border-rose-400 hover:shadow-[0_20px_45px_rgba(244,63,94,0.18)]",
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30",
    tagBadge: "bg-rose-100/90 text-rose-800 border-rose-200",
    progressBar: "bg-gradient-to-r from-rose-500 to-red-600",
    topAccent: "from-rose-500 to-red-600",
    glowColor: "bg-rose-400/20",
    spotlight: "rgba(244, 63, 94, 0.2)",
  },
  {
    icon: Award,
    title: "Clinical Excellence",
    tag: "BOARD ACCREDITED",
    description:
      "Rigorous adherence to international evidence-based therapeutics and ongoing surgical safety certifications with zero clinical compromise.",
    keyPoints: ["Joint Commission Gold Seal", "Zero-Defect Surgical Checks", "Continuous Peer Review"],
    gradientFrom: "#f59e0b",
    gradientTo: "#ea580c",
    solid: "text-amber-600",
    gradientBg: "from-amber-500/10 via-white to-amber-50/40",
    border: "border-amber-200/90 hover:border-amber-400 hover:shadow-[0_20px_45px_rgba(245,158,11,0.18)]",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30",
    tagBadge: "bg-amber-100/90 text-amber-800 border-amber-200",
    progressBar: "bg-gradient-to-r from-amber-500 to-orange-600",
    topAccent: "from-amber-500 to-orange-600",
    glowColor: "bg-amber-400/20",
    spotlight: "rgba(245, 158, 11, 0.2)",
  },
  {
    icon: FlaskConical,
    title: "Patient-First Innovation",
    tag: "SMART ROBOTICS",
    description:
      "State-of-the-art robotic surgery platforms, digital pathology, AI diagnostics, and active multi-disciplinary clinical trials.",
    keyPoints: ["Sub-Millimeter Da Vinci Tech", "AI Deterioration Telemetry", "Minimally Invasive Focus"],
    gradientFrom: "#10b981",
    gradientTo: "#0d9488",
    solid: "text-emerald-600",
    gradientBg: "from-emerald-500/10 via-white to-emerald-50/40",
    border: "border-emerald-200/90 hover:border-emerald-400 hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)]",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30",
    tagBadge: "bg-emerald-100/90 text-emerald-800 border-emerald-200",
    progressBar: "bg-gradient-to-r from-emerald-500 to-teal-600",
    topAccent: "from-emerald-500 to-teal-600",
    glowColor: "bg-emerald-400/20",
    spotlight: "rgba(16, 185, 129, 0.2)",
  },
  {
    icon: ShieldCheck,
    title: "Absolute Integrity",
    tag: "ETHICAL PROTOCOL",
    description:
      "Uncompromising patient confidentiality, transparent procedures, clear billing, and dedicated patient advocacy at every step.",
    keyPoints: ["Itemized Upfront Estimates", "Biometric Encrypted Records", "Dedicated Patient Advocate"],
    gradientFrom: "#135940",
    gradientTo: "#1b7454",
    solid: "text-[#135940]",
    gradientBg: "from-emerald-500/10 via-white to-emerald-50/40",
    border: "border-emerald-200/90 hover:border-emerald-400 hover:shadow-[0_20px_45px_rgba(19,89,64,0.18)]",
    iconBg: "bg-gradient-to-br from-[#135940] to-[#1b7454] text-white shadow-md shadow-[#135940]/30",
    tagBadge: "bg-emerald-100/90 text-[#135940] border-emerald-200",
    progressBar: "bg-gradient-to-r from-[#135940] to-[#1b7454]",
    topAccent: "from-[#135940] to-[#1b7454]",
    glowColor: "bg-emerald-400/20",
    spotlight: "rgba(19, 89, 64, 0.2)",
  },
];

const TIMELINE_MILESTONES = [
  {
    year: "1996",
    title: "Hospital Foundation",
    desc: "Established as a 40-bed family outpatient clinic with personalized bedside care and emergency stabilization.",
    badgeBg: "from-[#135940] to-[#1b7454]",
    nodeColor: "bg-[#135940]",
  },
  {
    year: "2005",
    title: "Cardiology Wing & Cath Labs",
    desc: "Expanded to 120 in-patient beds with 2 dedicated state-of-the-art heart surgery suites.",
    badgeBg: "from-[#135940] to-[#1b7454]",
    nodeColor: "bg-[#135940]",
  },
  {
    year: "2015",
    title: "Joint Commission Gold Seal",
    desc: "Achieved national accreditation confirming compliance with the highest medical quality benchmarks.",
    badgeBg: "from-[#135940] to-[#1b7454]",
    nodeColor: "bg-[#135940]",
  },
  {
    year: "2023",
    title: "Robotic Surgery & Smart EHR",
    desc: "Integrated AI-driven robotic assistance and paperless digital triage booking protocols.",
    badgeBg: "from-[#135940] to-[#1b7454]",
    nodeColor: "bg-[#135940]",
  },
];

const CLINICAL_PROTOCOLS = [
  {
    id: "robotics",
    icon: Cpu,
    title: "Da Vinci Xi 4th-Gen Surgical Robotics",
    badge: "SUB-MILLIMETER PRECISION",
    summary:
      "Enables minimally invasive complex procedures through 3D HD visualization, tremor filtration, and wrist-articulated micro-instruments.",
    highlights: ["40% reduced recovery period", "Minimal surgical blood loss", "Discharge within 24-48 hours"],
  },
  {
    id: "laminar",
    icon: Wind,
    title: "ISO Class 5 Laminar Airflow Theaters",
    badge: "100% HEPA FILTERED",
    summary:
      "Continuous positive-pressure unidirectional sterile air curtain ensures 99.997% airborne particulate filtration during all active operations.",
    highlights: ["Ultra-clean surgical micro-environment", "Zero surgical-site infection target", "Real-time air change monitoring"],
  },
  {
    id: "telemetry",
    icon: Radio,
    title: "Real-Time Central Telemetry & AI Monitoring",
    badge: "24/7 BEDSIDE SURVEILLANCE",
    summary:
      "Automated continuous vital metrics tracking immediately alerts the intensivist response team before physiological deterioration occurs.",
    highlights: ["Instantaneous arrhythmia recognition", "Automated rapid response dispatch", "Multi-parameter telemetry"],
  },
  {
    id: "paperless",
    icon: FileCheck2,
    title: "Paperless HIPAA-Compliant Smart EHR",
    badge: "SECURE DIGITAL TRIAGE",
    summary:
      "Zero-latency communication between diagnostic labs, radiological scans, and on-duty specialists across outpatient and in-patient wards.",
    highlights: ["Biometric record encryption", "Immediate radiological transfer", "Direct patient portal access"],
  },
];

/* ==========================================================================
   Clinical Value Pillar Card (Skewed Gradient Panels & Glassmorphic Design)
   ========================================================================== */

function ClinicalPillarCard({
  pillar,
  idx,
}: {
  pillar: (typeof CLINICAL_PILLARS)[0];
  idx: number;
}) {
  const Icon = pillar.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 55, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{
        delay: Math.min((idx % 4) * 0.08, 0.24),
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full pt-4 pb-2 transform-gpu will-change-transform"
    >
      <motion.div
        whileHover={{ y: -8, scale: 1.025 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="group relative w-full h-[400px] cursor-pointer select-none"
      >
        {/* 1. Skewed gradient backing panel */}
        <span
          className="absolute top-0 left-[22px] w-3/5 h-full rounded-2xl transform skew-x-[12deg] opacity-75 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-95 transition-all duration-500 pointer-events-none z-0"
          style={{
            background: `linear-gradient(315deg, ${pillar.gradientFrom}, ${pillar.gradientTo})`,
          }}
        />

        {/* 2. Skewed blurred neon glow shadow */}
        <span
          className="absolute top-0 left-[22px] w-3/5 h-full rounded-2xl transform skew-x-[12deg] opacity-25 blur-[26px] group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-60 transition-all duration-500 pointer-events-none z-0"
          style={{
            background: `linear-gradient(315deg, ${pillar.gradientFrom}, ${pillar.gradientTo})`,
          }}
        />

        {/* 3. Animated floating frosted glass blur badges */}
        <span className="pointer-events-none absolute inset-0 z-10 overflow-visible">
          <span
            className="absolute top-0 left-0 size-0 rounded-xl opacity-0 bg-white/70 backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.06)] border border-white/90 transition-all duration-300 animate-blob group-hover:top-[-16px] group-hover:left-[20px] group-hover:size-12 group-hover:opacity-100"
          />
          <span
            className="absolute bottom-0 right-0 size-0 rounded-xl opacity-0 bg-white/70 backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.06)] border border-white/90 transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-16px] group-hover:right-[20px] group-hover:size-12 group-hover:opacity-100"
          />
        </span>

        {/* 4. Foreground Transparent Liquid Glass Content Panel (Clean White Liquid Glass Theme) */}
        <div className="relative z-20 h-full p-6 bg-white/60 backdrop-blur-[14px] rounded-2xl border border-white/80 shadow-[0_8px_28px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:border-white hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] text-slate-900 transition-all duration-500 flex flex-col justify-between">
          {/* Top Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ rotate: [-5, 5, 0], scale: 1.12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="size-12 rounded-xl flex items-center justify-center text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${pillar.gradientFrom}, ${pillar.gradientTo})`,
                }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>

              <span
                className="font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border bg-white/80 shadow-2xs"
                style={{
                  color: pillar.gradientFrom,
                  borderColor: `${pillar.gradientFrom}40`,
                }}
              >
                {pillar.tag}
              </span>
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">
                {pillar.title}
              </h4>
              <p
                className="text-[11px] font-mono font-bold uppercase tracking-wide mt-0.5"
                style={{ color: pillar.gradientFrom }}
              >
                Institutional Standard
              </p>
            </div>

            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
              {pillar.description}
            </p>

            {/* Checklist items */}
            <div className="space-y-1.5 pt-1">
              {pillar.keyPoints.map((point, pIdx) => (
                <div
                  key={pIdx}
                  className="flex items-center gap-2 text-[11px] font-mono font-medium text-slate-600 group-hover:translate-x-1 transition-transform duration-300"
                  style={{ transitionDelay: `${pIdx * 50}ms` }}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Progress Meter */}
          <div className="pt-3 border-t border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-semibold">
              <span className="tracking-wider text-[10px]">VERIFIED STANDARD</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                100%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 1, ease: "easeOut" }}
                className="h-full rounded-full shadow-xs"
                style={{
                  background: `linear-gradient(90deg, ${pillar.gradientFrom}, ${pillar.gradientTo})`,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================================
   Doctor Specialist Card (Skewed Gradient Panels & Glassmorphic Design)
   ========================================================================== */

function DoctorCard({
  doc,
  idx,
  onBookConsultation,
}: {
  doc: (typeof DOCTORS)[0];
  idx: number;
  onBookConsultation?: () => void;
}) {
  const Icon = doc.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 55, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{
        delay: Math.min((idx % 3) * 0.08, 0.2),
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full pt-4 pb-2 transform-gpu will-change-transform"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className="group relative w-full h-[540px] cursor-pointer select-none transform-gpu will-change-transform"
      >
        {/* 1. Skewed gradient backing panel */}
        <span
          className="absolute top-0 left-[22px] w-3/5 h-full rounded-2xl transform skew-x-[12deg] opacity-75 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-95 transition-all duration-300 pointer-events-none z-0 will-change-transform"
          style={{
            background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
          }}
        />

        {/* 2. Skewed blurred neon glow shadow */}
        <span
          className="absolute top-0 left-[22px] w-3/5 h-full rounded-2xl transform skew-x-[12deg] opacity-25 blur-[26px] group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-60 transition-all duration-300 pointer-events-none z-0 transform-gpu will-change-transform"
          style={{
            background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
          }}
        />

        {/* 3. Foreground Transparent Liquid Glass Content Panel */}
        <div className="relative z-20 h-full p-4 sm:p-5 bg-white/60 backdrop-blur-[14px] rounded-2xl border border-white/80 shadow-[0_8px_28px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:border-white hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)] text-slate-900 transition-all duration-300 flex flex-col justify-between transform-gpu">
          <div>
            {/* Top Doctor Image Banner */}
            <div className="relative w-full h-56 rounded-xl overflow-hidden mb-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] bg-slate-100 group/img">
              <img
                src={doc.image}
                alt={doc.name}
                loading="lazy"
                className="w-full h-full object-cover object-[center_25%] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-75 pointer-events-none" />

              {/* Department badge in top-left */}
              <span
                className="absolute top-2.5 left-2.5 inline-flex items-center px-2.5 py-1 rounded-full text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md backdrop-blur-md"
                style={{
                  background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                }}
              >
                {doc.badge}
              </span>

              {/* Doctor icon badge in top-right */}
              <motion.div
                whileHover={{ rotate: [-6, 6, 0], scale: 1.1 }}
                className="absolute top-2.5 right-2.5 size-8 rounded-lg flex items-center justify-center text-white shadow-md backdrop-blur-md"
                style={{
                  background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                }}
              >
                <Icon className="w-4 h-4 text-white" />
              </motion.div>

              {/* Experience pill in bottom-right */}
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white shadow-sm font-mono">
                <Clock className="w-3 h-3" style={{ color: doc.gradientFrom }} />
                <span>{doc.experience}</span>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="space-y-1.5">
              <span
                className="inline-block text-[11px] font-mono font-bold tracking-wide px-2.5 py-0.5 rounded-lg border bg-white/80"
                style={{
                  color: doc.gradientFrom,
                  borderColor: `${doc.gradientFrom}40`,
                }}
              >
                {doc.specialty}
              </span>
              <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                {doc.name}
              </h4>
              <p className="text-xs font-semibold text-slate-500">
                {doc.role}
              </p>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                {doc.bio}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {doc.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/80 text-slate-700 shadow-2xs"
                  >
                    <Check className="w-3 h-3" style={{ color: doc.gradientFrom }} />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="pt-3 border-t border-slate-200/60 mt-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                onBookConsultation?.();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-white group/btn hover:brightness-105"
              style={{
                background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                boxShadow: `0 4px 14px ${doc.gradientFrom}35`,
              }}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Request Appointment</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1.5 duration-200" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AboutBento({ onBookConsultation }: AboutBentoProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [openProtocol, setOpenProtocol] = useState<string>("robotics");

  // Elemental Scroll progress for timeline beam
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 55%"],
  });

  const laserScaleY = useSpring(timelineProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section className="bg-slate-50 py-10 sm:py-16 md:py-20 px-3.5 sm:px-6 font-sans min-h-screen relative overflow-x-clip text-slate-900">
      {/* Subtle elemental background ambient glow orbs */}
      <motion.div
        aria-hidden="true"
        animate={{
          y: [0, -25, 0],
          x: [0, 20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-20 w-[550px] h-[550px] rounded-full bg-emerald-400/10 blur-[140px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 -right-20 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-[140px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-rose-400/8 blur-[140px]"
      />

      <div className="max-w-7xl mx-auto space-y-24 relative z-10">
        {/* ====================================================================
            1. HERO IMPACT BENTO (With 3D Physics Tilt, Sheen & Animated Numbers)
            ==================================================================== */}
        <div>
          {/* Header with Pop-up Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <motion.div
              whileHover={{ scale: 1.06, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-[#135940] text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#135940] animate-pulse" />
              Our Healthcare Legacy
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
              About Our Medical Mission
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              Three decades of clinical excellence, pioneering robotic surgery,
              and compassionate human healing serving over{" "}
              <span className="font-semibold text-slate-900">
                <AnimatedNumber value={250000} suffix="+" />
              </span>{" "}
              patient families.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Bento Card 1: Large Heritage Card (2x2) with Smooth Pop-Up */}
            <motion.div
              initial={{ opacity: 0, y: 55, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-2 md:row-span-2 h-full transform-gpu will-change-transform"
            >
              <TiltCard
                tiltAmount={6}
                spotlightColor="rgba(19, 89, 64, 0.14)"
                className="bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-3xl p-5 sm:p-8 md:p-12 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 h-full flex flex-col justify-between"
              >
                {/* Rotating Background Starburst Emblem with smooth interactive hover spin */}
                <svg
                  width="377"
                  height="368"
                  className="w-96 fill-emerald-50/70 absolute -bottom-16 -right-16 group-hover:rotate-180 duration-1000 ease-out pointer-events-none transition-transform"
                  viewBox="0 0 377 368"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M179.692 5.79814C182.635 -1.93287 193.572 -1.93285 196.515 5.79816L229.505 92.466C231.206 96.9342 236.103 99.2928 240.657 97.8366L328.986 69.5929C336.865 67.0735 343.684 75.6242 339.474 82.7452L292.284 162.574C289.851 166.69 291.061 171.99 295.038 174.642L372.192 226.091C379.075 230.68 376.641 241.343 368.449 242.491L276.613 255.369C271.878 256.033 268.489 260.283 268.895 265.047L276.776 357.445C277.479 365.688 267.625 370.433 261.619 364.744L194.293 300.973C190.821 297.686 185.386 297.686 181.914 300.973L114.588 364.744C108.582 370.433 98.7281 365.688 99.4311 357.445L107.312 265.047C107.718 260.283 104.329 256.033 99.5941 255.369L7.7582 242.491C-0.433812 241.343 -2.86746 230.68 4.01488 226.091L81.1687 174.642C85.1465 171.99 86.3561 166.69 83.9231 162.574L36.7325 82.7452C32.523 75.6242 39.342 67.0735 47.2212 69.5929L135.55 97.8366C140.104 99.2928 145.001 96.9342 146.702 92.4659L179.692 5.79814Z" />
                </svg>

                <div className="space-y-6 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex px-4 py-2 rounded-full bg-[#135940] text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#135940]/25"
                  >
                    Clinical Heritage Since 1996
                  </motion.div>
                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    HEALING WITHOUT
                    <br />
                    <span className="text-[#135940]">
                      BOUNDARIES.
                    </span>
                  </h3>
                </div>

                <div className="mt-6 space-y-5 relative z-10">
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg font-normal">
                    At WeCare Hospitals, we recognize that true healing is a careful blend
                    of medical science, cutting-edge technology, and sincere compassion.
                    From our sterile laminar airflow operating suites to our 24/7 trauma emergency desk,
                    every room is built for patient tranquility.
                  </p>

                  {/* Pop-up Interactive Feature Badges with Spring Hover */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <motion.div
                      whileHover={{ scale: 1.04, x: 4 }}
                      className="flex items-center gap-2.5 text-xs font-bold text-amber-900 bg-amber-50/90 px-4 py-2.5 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-colors"
                    >
                      <Check className="w-4 h-4 text-amber-600 shrink-0" />
                      Joint Commission Accredited
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.04, x: 4 }}
                      className="flex items-center gap-2.5 text-xs font-bold text-sky-900 bg-sky-50/90 px-4 py-2.5 rounded-xl border border-sky-200/80 shadow-2xs hover:border-sky-400 transition-colors"
                    >
                      <Check className="w-4 h-4 text-sky-600 shrink-0" />
                      Robotic Surgery Suites
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.04, x: 4 }}
                      className="flex items-center gap-2.5 text-xs font-bold text-emerald-950 bg-emerald-50/90 px-4 py-2.5 rounded-xl border border-emerald-200/80 shadow-2xs hover:border-emerald-400 transition-colors"
                    >
                      <Check className="w-4 h-4 text-[#135940] shrink-0" />
                      Fully Electronic Health Record
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.04, x: 4 }}
                      className="flex items-center gap-2.5 text-xs font-bold text-emerald-900 bg-emerald-50/90 px-4 py-2.5 rounded-xl border border-emerald-200/80 shadow-2xs hover:border-emerald-400 transition-colors"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      Research Clinical Boards
                    </motion.div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Bento Card 2: Surgical Success Stat Card with Smooth Pop-Up */}
            <motion.div
              initial={{ opacity: 0, y: 55, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
              transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="h-full transform-gpu will-change-transform"
            >
              <TiltCard
                tiltAmount={9}
                spotlightColor="rgba(255, 255, 255, 0.28)"
                className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl shadow-emerald-600/25 relative overflow-hidden h-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-100">
                    Surgical Success
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 180 }}
                    className="p-2 rounded-xl bg-white/15 backdrop-blur-md shadow-inner cursor-pointer"
                  >
                    <Activity className="w-5 h-5 text-white animate-pulse" />
                  </motion.div>
                </div>
                <div className="space-y-3 my-6">
                  <div className="text-4xl sm:text-6xl font-black tracking-tight block drop-shadow-lg cursor-default origin-left">
                    <AnimatedNumber value={99.4} decimals={1} suffix="%" />
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      whileInView={{ width: "99.4%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      className="h-full bg-white rounded-full shadow-[0_0_14px_rgba(255,255,255,0.95)]"
                    />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100/95 leading-snug font-normal">
                  Over 4,200 successful major procedures conducted annually across multi-disciplinary surgical suites.
                </p>
              </TiltCard>
            </motion.div>

            {/* Bento Card 3: Medical Leadership Card with Smooth Pop-Up */}
            <motion.div
              initial={{ opacity: 0, y: 55, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
              transition={{ delay: 0.16, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="h-full transform-gpu will-change-transform"
            >
              <TiltCard
                tiltAmount={9}
                spotlightColor="rgba(52, 211, 153, 0.22)"
                className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#082d22] rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl shadow-slate-900/40 border border-slate-800 relative overflow-hidden h-full"
              >
                <div className="flex items-center justify-between">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 12 }}
                    className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-inner cursor-pointer"
                  >
                    <Stethoscope className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold shadow-xs">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    BOARD LEAD
                  </span>
                </div>
                <div className="space-y-1.5 my-4">
                  <h4 className="text-xl font-bold tracking-tight text-white">
                    Dr. Tony Stark
                  </h4>
                  <p className="text-xs text-sky-300 font-medium">
                    Medical Director &amp; Co-Founder
                  </p>
                </div>
                <p className="text-xs text-slate-300/90 italic border-t border-slate-800/80 pt-3">
                  "Every consultation and recovery check is an opportunity to honor patient trust with world-class skill."
                </p>
              </TiltCard>
            </motion.div>

            {/* Bento Card 4: Action Consultation Booking Card with Smooth Pop-Up */}
            <motion.div
              initial={{ opacity: 0, y: 55, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
              transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-2 h-full transform-gpu will-change-transform"
            >
              <TiltCard
                tiltAmount={7}
                onClick={onBookConsultation}
                spotlightColor="rgba(19, 89, 64, 0.3)"
                className="rounded-3xl p-5 sm:p-8 border border-[#135940]/40 bg-gradient-to-br from-slate-900 via-[#135940] to-slate-900 text-white shadow-xl shadow-slate-950/30 transition-all duration-300 gap-6 h-full"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-6">
                  <div className="space-y-2.5">
                    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Priority Emergency &amp; Outpatient
                    </div>
                    <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                      Schedule a Consultation
                    </h4>
                    <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                      Connect directly with leading specialists across 18 outpatient departments or request urgent clinical triage.
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="size-16 sm:size-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl bg-[#135940] hover:bg-[#1b7454] text-white shrink-0 shadow-lg shadow-[#135940]/50 transition-colors"
                  >
                    <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8" />
                  </motion.div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>

        {/* ====================================================================
            2. OUR MEDICAL LEADERSHIP TEAM (Interactive Specialty Filters & Spring Layout)
            ==================================================================== */}
        <div id="doctors" className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-[#135940] text-xs font-bold uppercase tracking-wider">
              Specialist Directory
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Medical Leadership &amp; Surgeons
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Every department at WeCare is helmed by board-certified clinical
              pioneers with decades of tertiary surgical experience.
            </p>
          </motion.div>

          {/* Doctors Grid with Skewed Gradient Backing Panels & Glassmorphic Liquid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DOCTORS.map((doc, idx) => (
              <DoctorCard
                key={doc.id}
                doc={doc}
                idx={idx}
                onBookConsultation={onBookConsultation}
              />
            ))}
          </div>
        </div>

        {/* ====================================================================
            3. FOUR CORE CLINICAL PILLARS (3D Physics Tilt with Floating Icons)
            ==================================================================== */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
              Institutional Values
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Core Clinical Values
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              These fundamental principles guide every diagnosis, surgical recommendation,
              and patient interaction across our campus.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CLINICAL_PILLARS.map((pillar, idx) => (
              <ClinicalPillarCard key={pillar.title} pillar={pillar} idx={idx} />
            ))}
          </div>
        </div>

        {/* ====================================================================
            4. INTERACTIVE CLINICAL TECHNOLOGIES ACCORDION SHOWCASE
            ==================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl p-5 sm:p-8 md:p-12 border border-slate-200 shadow-sm space-y-8"
        >
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> High-Precision Infrastructure
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Next-Generation Clinical Infrastructure &amp; Safety Protocols
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Explore our sterile surgical environment specifications, AI robotics platforms,
              and patient monitoring technologies that set tertiary care benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLINICAL_PROTOCOLS.map((protocol, pIdx) => {
              const isOpen = openProtocol === protocol.id;
              const Icon = protocol.icon;
              return (
                <motion.div
                  key={protocol.id}
                  layout
                  initial={{ opacity: 0, y: 35, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.12, margin: "0px 0px -30px 0px" }}
                  transition={{ delay: 0.08 * pIdx, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setOpenProtocol(isOpen ? "" : protocol.id)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isOpen
                      ? "bg-slate-900 text-white border-slate-800 shadow-xl"
                      : "bg-slate-50 hover:bg-white text-slate-900 border-slate-200/90 hover:border-emerald-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isOpen
                            ? "bg-[#135940] text-white shadow-md shadow-[#135940]/30"
                            : "bg-white text-[#135940] border border-slate-200 shadow-xs"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span
                          className={`font-mono text-[10px] font-bold tracking-wider uppercase block ${
                            isOpen ? "text-emerald-300" : "text-[#135940]"
                          }`}
                        >
                          {protocol.badge}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold tracking-tight mt-0.5">
                          {protocol.title}
                        </h4>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`p-1.5 rounded-full shrink-0 ${
                        isOpen ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden pt-4 space-y-4 text-xs sm:text-sm text-slate-300"
                      >
                        <p className="leading-relaxed">{protocol.summary}</p>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                          {protocol.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-emerald-400 text-[11px] font-mono font-medium border border-slate-700"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              {h}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ====================================================================
            5. TIMELINE & CAMPUS INFRASTRUCTURE (Elemental Scroll & Animated Stats)
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Campus Statistics with Smooth Pop-Up */}
          <motion.div
            initial={{ opacity: 0, y: 55, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 h-full transform-gpu will-change-transform"
          >
            <TiltCard
              tiltAmount={6}
              spotlightColor="rgba(56, 189, 248, 0.2)"
              className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-8 md:p-10 flex flex-col justify-between shadow-2xl border border-slate-800 h-full"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">
                  <MapPin className="w-3.5 h-3.5" /> Medical District Campus
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Advanced Clinical Infrastructure
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  240,000 square foot state-of-the-art campus fitted with sterile laminar
                  airflow surgical chambers, central ICUs, and priority triage hubs.
                </p>
              </div>

              {/* 4 Colorful Statistics Blocks with Dynamic Roll-up Numbers */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 my-6 sm:my-8">
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.93 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-900/80 border border-sky-500/35 shadow-md hover:border-sky-400 cursor-pointer"
                >
                  <span className="text-2xl sm:text-4xl font-black font-mono text-sky-400 block drop-shadow-sm">
                    <AnimatedNumber value={80} suffix="+" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 block mt-1">
                    Critical Care Beds
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.93 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.16, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900/80 border border-emerald-500/35 shadow-md hover:border-emerald-400 cursor-pointer"
                >
                  <span className="text-2xl sm:text-4xl font-black font-mono text-emerald-400 block drop-shadow-sm">
                    <AnimatedNumber value={18} />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 block mt-1">
                    Outpatient Depts
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.93 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.24, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900/80 border border-amber-500/35 shadow-md hover:border-amber-400 cursor-pointer"
                >
                  <span className="text-2xl sm:text-4xl font-black font-mono text-amber-400 block drop-shadow-sm">
                    <AnimatedNumber value={4200} suffix="+" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 block mt-1">
                    Annual Surgeries
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.93 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.32, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/60 to-slate-900/80 border border-rose-500/35 shadow-md hover:border-rose-400 cursor-pointer"
                >
                  <span className="text-2xl sm:text-4xl font-black font-mono text-rose-400 block drop-shadow-sm">
                    <AnimatedNumber value={12} />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300 block mt-1">
                    Fleet Ambulances
                  </span>
                </motion.div>
              </div>

              <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/40 text-[11px] sm:text-xs text-emerald-300 font-mono font-bold shadow-sm">
                <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                FACILITY STATUS: 24/7 DISPATCH OPERATIONAL
              </div>
            </TiltCard>
          </motion.div>

          {/* Right Column: Historical Milestone Timeline with Smooth Pop-Up */}
          <motion.div
            initial={{ opacity: 0, y: 55, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 h-full transform-gpu will-change-transform"
          >
            <div
              ref={timelineRef}
              className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full relative overflow-hidden"
            >
              <div className="space-y-2 mb-6 sm:mb-8">
                <span className="text-xs font-mono uppercase tracking-widest font-bold text-[#135940]">
                  Three Decades of Growth
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Timeline of Medical Excellence
                </h3>
              </div>

              {/* Elemental Scroll Timeline Track */}
              <div className="relative space-y-4 sm:space-y-6 pl-5 sm:pl-6 py-2">
                {/* Static Background Rail */}
                <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-slate-200 rounded-full" />

                {/* Elemental Scroll Animated Laser Beam - Single Solid Medical Green */}
                <motion.div
                  style={{ scaleY: laserScaleY, originY: 0 }}
                  className="absolute left-[6px] top-3 bottom-3 w-[4px] bg-[#135940] rounded-full shadow-[0_0_10px_rgba(19,89,64,0.6)] z-0"
                />

                {TIMELINE_MILESTONES.map((m, idx) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ delay: 0.08 * idx, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ x: 8, scale: 1.015 }}
                    className="relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all duration-300 shadow-2xs group cursor-default z-10"
                  >
                    {/* Node Dot with Glow */}
                    <span className="absolute -left-[23px] top-6 size-3.5 rounded-full bg-[#135940] border-2 border-white shadow-sm group-hover:scale-150 transition-transform" />

                    <span
                      className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${m.badgeBg} text-white font-mono font-bold text-sm tracking-tight shrink-0 shadow-md group-hover:scale-105 transition-transform origin-left`}
                    >
                      {m.year}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                        {m.title}
                      </h5>
                      <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-normal">
                        {m.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Continuous Joint Commission Benchmark Accreditation
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onBookConsultation}
                  className="px-6 py-2.5 rounded-xl bg-[#135940] hover:bg-[#1b7454] text-white text-xs font-bold transition-all shadow-md shadow-[#135940]/25 flex items-center gap-2 cursor-pointer"
                >
                  Book Appointment
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ====================================================================
            6. PATIENT TRUST & CLINICAL ETHICS BANNER (Bottom Bento Closer)
            ==================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-gradient-to-r from-[#135940] via-[#1b7454] to-[#0e4230] p-8 sm:p-12 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-400/30">
              <Users className="w-3.5 h-3.5" /> Patient Rights &amp; Assurance
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dedicated to Transparent, Evidence-Based Medicine
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every procedure is preceded by comprehensive informed consent, multi-disciplinary review,
              and full financial transparency so you and your family can focus on what matters most: recovery.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBookConsultation}
            className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#135940] font-bold text-sm shadow-xl shrink-0 flex items-center gap-3 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#135940]" />
            Book Initial Consultation
            <ArrowRight className="w-4 h-4 text-[#135940]" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutBento;
