"use client";
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useInView,
} from "motion/react";
import {
  Check,
  Calendar,
  ArrowRight,
  Eye,
  Star,
  Sparkles,
  Clock,
  Heart,
  Brain,
  Bone,
  Baby,
  Microscope,
  Siren,
  ScanLine,
  Stethoscope,
  ShieldCheck,
  Award,
  BriefcaseMedical,
  X,
  MapPin,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

interface DoctorsBentoProps {
  onBookConsultation?: () => void;
}

/* ==========================================================================
   Smooth Animated Count-Up Number (Spring Physics & Easing)
   ========================================================================== */

function AnimatedNumber({
  value,
  duration = 1.4,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(ease * value);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {Math.round(displayValue).toLocaleString()}
      {suffix}
    </span>
  );
}

/* ==========================================================================
   Data Models & Doctor Roster
   ========================================================================== */

interface Doctor {
  id: string;
  icon: LucideIcon;
  name: string;
  role: string;
  department: string;
  departmentId: string;
  specialty: string;
  degree: string;
  experience: string;
  bio: string;
  highlights: string[];
  badge: string;
  rating: number;
  gradientFrom: string;
  gradientTo: string;
  image: string;
}

const ALL_DOCTORS: Doctor[] = [
  // ── Cardiology (Rose) ──
  {
    id: "iron-man",
    icon: Stethoscope,
    name: "Dr. Tony Stark",
    role: "Chief Medical Director & Cardiothoracic Lead",
    department: "Cardiology",
    departmentId: "cardiology",
    specialty: "Cardiothoracic Surgery & Bio-Cardiovascular Systems",
    degree: "MD, FACS",
    experience: "28+ Years",
    bio: "Pioneer in artificial cardiac arc-technology, beating-heart surgeries, and micro-engineered cardiovascular implants for critically compromised patients.",
    highlights: ["Cardiovascular Lead", "3,800+ Surgeries", "Medical Director"],
    badge: "DIRECTOR",
    rating: 5.0,
    gradientFrom: "#f43f5e",
    gradientTo: "#e11d48",
    image: "/doctors/iron-man.jpg",
  },
  {
    id: "war-machine",
    icon: Heart,
    name: "Dr. James Rhodes",
    role: "Interventional Cardiology & Cardiac Trauma Lead",
    department: "Cardiology",
    departmentId: "cardiology",
    specialty: "Advanced Coronary Interventions & Structural Heart",
    degree: "MD, FACC",
    experience: "18+ Years",
    bio: "Specializes in high-acuity cardiovascular interventions, complex coronary stenting, and trauma-induced myocardial stabilization.",
    highlights: ["FACC Certified", "1,800+ Stents", "Trauma Cardiology"],
    badge: "CARDIOLOGIST",
    rating: 4.9,
    gradientFrom: "#f43f5e",
    gradientTo: "#e11d48",
    image: "/doctors/war-machine.jpg",
  },

  // ── Neurology (Violet) ──
  {
    id: "doctor-strange",
    icon: Brain,
    name: "Dr. Stephen Strange",
    role: "Chief of Neurosurgery & Vascular Neurology",
    department: "Neurology",
    departmentId: "neurology",
    specialty: "Complex Micro-Neurosurgery & Cerebrovascular Repair",
    degree: "MD, PhD",
    experience: "22+ Years",
    bio: "World-renowned neurosurgeon leading sub-millimeter surgical management of complex brainstem tumors, aneurysm clippings, and vascular brain anomalies.",
    highlights: ["Master Neurosurgeon", "NIH Fellow", "Micro-Surgical Lead"],
    badge: "NEUROSURGEON",
    rating: 5.0,
    gradientFrom: "#8b5cf6",
    gradientTo: "#6366f1",
    image: "/doctors/doctor-strange.jpg",
  },
  {
    id: "hulk",
    icon: Brain,
    name: "Dr. Bruce Banner",
    role: "Director of Neurobiology & Cellular Dynamics",
    department: "Neurology",
    departmentId: "neurology",
    specialty: "Biophysical Neural Pathways & Autonomic Regulation",
    degree: "MD, PhD",
    experience: "24+ Years",
    bio: "Holder of 7 PhDs in biophysics and neuro-cellular biology, pioneering autonomic nervous system bio-regulation and stress-induced neurological therapies.",
    highlights: ["7 PhD Degrees", "Cellular Biophysics", "Neuro-Regulation"],
    badge: "NEUROBIOLOGIST",
    rating: 4.9,
    gradientFrom: "#8b5cf6",
    gradientTo: "#6366f1",
    image: "/doctors/hulk.jpg",
  },

  // ── Orthopedics (Amber) ──
  {
    id: "captain-america",
    icon: Bone,
    name: "Dr. Steve Rogers",
    role: "Chief of Orthopedic Surgery & Physical Rehab",
    department: "Orthopedics",
    departmentId: "orthopedics",
    specialty: "Peak Kinetic Biomechanics & Bone Restoration",
    degree: "MD, FAAOS",
    experience: "25+ Years",
    bio: "Leader in accelerated musculoskeletal restoration, high-impact fracture repair, and human biomechanical endurance rehab restoring peak vitality.",
    highlights: ["FAAOS Board", "Joint Integrity Lead", "Rapid Rehab"],
    badge: "ORTHOPEDIC CHIEF",
    rating: 5.0,
    gradientFrom: "#f59e0b",
    gradientTo: "#ea580c",
    image: "/doctors/captain-america.jpg",
  },
  {
    id: "winter-soldier",
    icon: Bone,
    name: "Dr. Bucky Barnes",
    role: "Bionic Prosthetics & Joint Reconstruction Lead",
    department: "Orthopedics",
    departmentId: "orthopedics",
    specialty: "Vibranium Joint Arthroplasty & Neural Bionics",
    degree: "MD, FAAOS",
    experience: "19+ Years",
    bio: "World specialist in advanced bionic limb kinematics, complex joint replacement, and neuro-muscular integration for severe trauma survivors.",
    highlights: ["Neural Prosthetics", "1,500+ Implants", "Trauma Joint Lead"],
    badge: "BIONIC SURGEON",
    rating: 4.9,
    gradientFrom: "#f59e0b",
    gradientTo: "#ea580c",
    image: "/doctors/winter-soldier.jpg",
  },

  // ── Pediatrics (Cyan) ──
  {
    id: "spider-man",
    icon: Baby,
    name: "Dr. Peter Parker",
    role: "Pediatric Care Lead & Adolescent Medicine",
    department: "Pediatrics",
    departmentId: "pediatrics",
    specialty: "General Pediatrics & Youth Vitality Medicine",
    degree: "MD, FAAP",
    experience: "12+ Years",
    bio: "Energetic, empathetic pediatric physician dedicated to gentle childhood care, developmental milestones, youth athletic medicine, and preventive health.",
    highlights: ["FAAP Certified", "Youth Wellness", "Community Favorite"],
    badge: "PEDIATRIC LEAD",
    rating: 5.0,
    gradientFrom: "#06b6d4",
    gradientTo: "#0284c7",
    image: "/doctors/spider-man.jpg",
  },
  {
    id: "ant-man",
    icon: Baby,
    name: "Dr. Scott Lang",
    role: "Micro-Pediatrics & Neonatal Care Specialist",
    department: "Pediatrics",
    departmentId: "pediatrics",
    specialty: "Precision Neonatal Micro-Interventions & NICU",
    degree: "MD",
    experience: "14+ Years",
    bio: "Master of delicate micro-pediatric interventions, premature newborn intensive care (NICU), and family-centered pediatric bedside support.",
    highlights: ["NICU Specialist", "Micro-Care Lead", "Family Advocate"],
    badge: "NEONATOLOGIST",
    rating: 4.9,
    gradientFrom: "#06b6d4",
    gradientTo: "#0284c7",
    image: "/doctors/ant-man.jpg",
  },

  // ── Oncology (Emerald) ──
  {
    id: "black-panther",
    icon: Microscope,
    name: "Dr. T'Challa",
    role: "Chief of Cellular Oncology & Advanced Therapeutics",
    department: "Oncology",
    departmentId: "oncology",
    specialty: "Targeted Molecular Immunotherapy & Cellular Oncology",
    degree: "MD, PhD",
    experience: "21+ Years",
    bio: "Pioneering researcher leading revolutionary non-invasive cellular immunotherapies, genomic tumor sequencing, and compassionate oncology care.",
    highlights: ["Cellular Oncology Lead", "Immunotherapy", "Global Research PI"],
    badge: "ONCOLOGIST",
    rating: 5.0,
    gradientFrom: "#10b981",
    gradientTo: "#0d9488",
    image: "/doctors/black-panther.jpg",
  },
  {
    id: "vision",
    icon: Microscope,
    name: "Dr. Vision",
    role: "Computational Oncology & Targeted Radiosurgery",
    department: "Oncology",
    departmentId: "oncology",
    specialty: "Molecular Spectral Targeting & Sub-Millimeter Radiosurgery",
    degree: "MD, PhD",
    experience: "16+ Years",
    bio: "Delivers sub-millimeter stereotactic robotic radiosurgery, algorithmic radiation dosage optimization, and real-time tumor tracking.",
    highlights: ["Sub-Millimeter Beam", "AI Dosage", "Stereotactic Lead"],
    badge: "RADIOSURGEON",
    rating: 4.9,
    gradientFrom: "#10b981",
    gradientTo: "#0d9488",
    image: "/doctors/vision.jpg",
  },

  // ── Dermatology (Pink) ──
  {
    id: "black-widow",
    icon: Sparkles,
    name: "Dr. Natasha Romanoff",
    role: "Dermatologic Surgeon & Scar Reconstruction Lead",
    department: "Dermatology",
    departmentId: "dermatology",
    specialty: "Surgical Dermatology, Trauma Revision & Tissue Repair",
    degree: "MD, FAAD",
    experience: "18+ Years",
    bio: "Specializes in precision micrographic dermatologic surgery, trauma scar reconstruction, and advanced dermal tissue restorative therapies.",
    highlights: ["FAAD Board", "Scar Reconstruction", "Micro-Surgical Derm"],
    badge: "SURGICAL DERM",
    rating: 5.0,
    gradientFrom: "#ec4899",
    gradientTo: "#c026d3",
    image: "/doctors/black-widow.jpg",
  },
  {
    id: "scarlet-witch",
    icon: Sparkles,
    name: "Dr. Wanda Maximoff",
    role: "Cellular Rejuvenation & Cosmetic Dermatology",
    department: "Dermatology",
    departmentId: "dermatology",
    specialty: "Cosmetic Dermatology & Deep Dermal Restorative Therapy",
    degree: "MD",
    experience: "14+ Years",
    bio: "Aesthetic medicine authority delivering revolutionary collagen stimulation, laser resurfacing, and deep cellular restorative dermatology.",
    highlights: ["Dermal Biostimulation", "Laser Master", "Aesthetic Science"],
    badge: "COSMETIC SPECIALIST",
    rating: 4.9,
    gradientFrom: "#ec4899",
    gradientTo: "#c026d3",
    image: "/doctors/scarlet-witch.jpg",
  },

  // ── Emergency (Orange) ──
  {
    id: "thor",
    icon: ShieldCheck,
    name: "Dr. Thor Odinson",
    role: "Head of Emergency Trauma & Acute Resuscitation",
    department: "Emergency",
    departmentId: "emergency",
    specialty: "Cardiac Arrest Resuscitation & Emergency Defibrillation",
    degree: "MD, FACEP",
    experience: "25+ Years",
    bio: "Commands Level 1 Trauma chambers with legendary resuscitation speed, high-voltage cardiac defibrillation protocols, and acute crisis life support.",
    highlights: ["Level 1 Trauma Lead", "Defibrillation Master", "Instant Triage"],
    badge: "TRAUMA CHAIR",
    rating: 5.0,
    gradientFrom: "#f97316",
    gradientTo: "#ef4444",
    image: "/doctors/thor.jpg",
  },
  {
    id: "captain-marvel",
    icon: Siren,
    name: "Dr. Carol Danvers",
    role: "Acute Trauma Surgeon & Rapid Flight Response",
    department: "Emergency",
    departmentId: "emergency",
    specialty: "Critical Multi-Trauma Stabilization & Flight Evacuation",
    degree: "MD",
    experience: "17+ Years",
    bio: "Directs rapid-response medical flight teams, critical multi-organ trauma stabilization, and emergency thoracotomy interventions.",
    highlights: ["Flight Evac Director", "Multi-Organ Trauma", "Rapid Response"],
    badge: "TRAUMA SURGEON",
    rating: 4.9,
    gradientFrom: "#f97316",
    gradientTo: "#ef4444",
    image: "/doctors/captain-marvel.jpg",
  },

  // ── Radiology (Blue) ──
  {
    id: "hawkeye",
    icon: ScanLine,
    name: "Dr. Clint Barton",
    role: "Chief Diagnostic Radiologist & Precision Imaging",
    department: "Radiology",
    departmentId: "radiology",
    specialty: "Zero-Miss Diagnostic Radiology, MRI & CT Diagnostics",
    degree: "MD",
    experience: "21+ Years",
    bio: "Legendary precision diagnostic radiologist with an infallible eye for microscopic target identification, early tumor detection, and CT contrast mastery.",
    highlights: ["Zero-Miss Accuracy", "MRI & CT Master", "Same-Day Analysis"],
    badge: "RADIOLOGIST",
    rating: 5.0,
    gradientFrom: "#3b82f6",
    gradientTo: "#1d4ed8",
    image: "/doctors/hawkeye.jpg",
  },
  {
    id: "falcon",
    icon: ScanLine,
    name: "Dr. Sam Wilson",
    role: "Aerial & High-Resolution Bio-Spectral Imaging Lead",
    department: "Radiology",
    departmentId: "radiology",
    specialty: "Bio-Spectral 3D Tomography & Image-Guided Scans",
    degree: "MD, FACR",
    experience: "16+ Years",
    bio: "Pioneering imaging specialist overseeing high-altitude airborne scanners, wide-spectrum 3D vascular reconstruction, and real-time fluoroscopic guidance.",
    highlights: ["3D Tomography", "Spectral Imaging", "FACR Certified"],
    badge: "IMAGING DIRECTOR",
    rating: 4.9,
    gradientFrom: "#3b82f6",
    gradientTo: "#1d4ed8",
    image: "/doctors/falcon.jpg",
  },
];

/* ==========================================================================
   Doctor Card (Skewed Gradient Panels & Glassmorphic Design)
   Matches the DepartmentCard theme exactly.
   Compact length, unobscured photo, click to view full details.
   ========================================================================== */

function DoctorCard({
  doc,
  idx,
  onSelect,
}: {
  doc: Doctor;
  idx: number;
  onSelect: (doc: Doctor) => void;
}) {
  const Icon = doc.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 55, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{
        delay: (idx % 4) * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full pt-3 pb-2 transform-gpu will-change-transform"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        onClick={() => onSelect(doc)}
        role="button"
        tabIndex={0}
        aria-label={`View full details for ${doc.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(doc);
          }
        }}
        className="group relative w-full min-h-[415px] h-full cursor-pointer select-none transform-gpu will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
      >
        {/* 1. Skewed gradient backing panel */}
        <span
          className="absolute -top-1.5 left-[12px] w-[calc(100%-14px)] h-full rounded-2xl transform skew-x-[6deg] opacity-90 group-hover:skew-x-0 group-hover:-top-2 group-hover:left-[6px] group-hover:w-[calc(100%-12px)] group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 will-change-transform"
          style={{
            background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
          }}
        />

        {/* 2. Blurred vibrant neon glow shadow */}
        <span
          className="absolute -top-1 left-[10px] w-[calc(100%-12px)] h-full rounded-2xl transform skew-x-[6deg] opacity-55 blur-[26px] group-hover:skew-x-0 group-hover:left-[6px] group-hover:w-[calc(100%-12px)] group-hover:opacity-85 group-hover:blur-[32px] transition-all duration-300 pointer-events-none z-0 transform-gpu will-change-transform"
          style={{
            background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
          }}
        />

        {/* 3. Foreground Liquid Glass Content Panel with color-infused tint */}
        <div
          className="relative z-20 h-full p-4 sm:backdrop-blur-md rounded-2xl border text-slate-900 transition-all duration-300 flex flex-col justify-between transform-gpu overflow-hidden"
          style={{
            background: `linear-gradient(175deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.90) 52%, ${doc.gradientFrom}14 100%)`,
            borderColor: `${doc.gradientFrom}45`,
            boxShadow: `0 10px 28px -6px ${doc.gradientFrom}28, 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.95)`,
          }}
        >
          {/* Top colored accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl pointer-events-none"
            style={{
              background: `linear-gradient(90deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
            }}
          />

          {/* Clean Doctor Photo: Square (1:1 aspect ratio) */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.06)] bg-slate-100 group/img border border-slate-100 shrink-0">
            <img
              src={doc.image}
              alt={doc.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-[center_15%] transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Compact Info Section */}
          <div className="space-y-1.5 flex-1 flex flex-col justify-center pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wide px-2 py-0.5 rounded-md border bg-white/90"
                style={{
                  color: doc.gradientFrom,
                  borderColor: `${doc.gradientFrom}35`,
                }}
              >
                <Icon className="w-3 h-3" />
                {doc.department}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80">
                <Star className="w-3 h-3 fill-amber-500 stroke-none" />
                {doc.rating}
              </span>
            </div>

            <div className="pt-0.5">
              <div className="flex items-baseline justify-between gap-1.5">
                <h4 className="text-[15px] font-black text-slate-900 tracking-tight leading-snug truncate">
                  {doc.name}
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                  {doc.degree}
                </span>
              </div>
              <p className="text-[11.5px] font-medium text-slate-600 line-clamp-2 leading-snug mt-0.5 min-h-[30px]">
                {doc.role}
              </p>
            </div>
          </div>

          {/* Dedicated See Details Button on Card: Opens Doctor Details Modal */}
          <div className="pt-2.5 border-t border-slate-100/90 mt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(doc);
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-white group/btn hover:brightness-105 transform-gpu"
              style={{
                background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                boxShadow: `0 4px 14px ${doc.gradientFrom}35`,
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>See Details</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 duration-200" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================================
   Doctor Detail Modal Dialog
   ========================================================================== */

function DoctorDetailModal({
  doc,
  onClose,
  onBookConsultation,
}: {
  doc: Doctor | null;
  onClose: () => void;
  onBookConsultation?: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!doc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [doc, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {doc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-modal-name"
          className="fixed inset-0 z-[99999] overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          {/* Centering Wrapper: min-h-full ensures the modal is centered when there is space, and scrolls gracefully without cutting off the top when space is tight */}
          <div className="min-h-full flex items-center justify-center p-3 sm:p-6 text-center pointer-events-none">
            {/* Modal Dialog Window */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[88vh] flex flex-col text-left pointer-events-auto"
            >
            {/* Integrated Modern Header (Clean, legible, non-overflowing) */}
            <div
              className="relative p-5 sm:p-6 border-b border-slate-100 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${doc.gradientFrom}14 0%, ${doc.gradientTo}06 60%, #ffffff 100%)`,
              }}
            >
              {/* Top Bar: Verification Badge & Close Button */}
              <div className="flex items-center justify-between gap-3 mb-3.5">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider shadow-2xs text-white"
                  style={{
                    background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified WeCare Specialist
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Doctor Identity Row: Square Portrait + Typography */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                <div
                  className="relative shrink-0 size-20 sm:size-24 rounded-2xl overflow-hidden shadow-md ring-2 ring-white bg-slate-100"
                >
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-full object-cover object-[center_15%]"
                  />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 id="doctor-modal-name" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      {doc.name}, <span className="text-slate-500 font-semibold text-sm sm:text-base">{doc.degree}</span>
                    </h3>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs"
                      style={{
                        background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                      }}
                    >
                      {doc.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    {doc.role} &bull; <span style={{ color: doc.gradientFrom }}>{doc.department}</span>
                  </p>

                  {/* Meta Pills: Rating, Experience, Department */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                      <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                      {doc.rating} Rating
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {doc.experience}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border shadow-2xs"
                      style={{
                        color: doc.gradientFrom,
                        borderColor: `${doc.gradientFrom}35`,
                      }}
                    >
                      <doc.icon className="w-3 h-3" />
                      {doc.department} Lead
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="px-6 sm:px-8 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Specialty Highlight Banner */}
              <div
                className="p-4 rounded-2xl border flex items-start gap-3.5"
                style={{
                  backgroundColor: `${doc.gradientFrom}08`,
                  borderColor: `${doc.gradientFrom}30`,
                }}
              >
                <div
                  className="size-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                  }}
                >
                  <doc.icon className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Primary Specialty & Focus
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900">
                    {doc.specialty}
                  </p>
                </div>
              </div>

              {/* About Specialist */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Biography & Clinical Philosophy
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {doc.bio}
                </p>
              </div>

              {/* Clinical Highlights & Achievements */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Clinical Highlights & Accreditations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {doc.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700"
                    >
                      <Check
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: doc.gradientFrom }}
                      />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Details & Hospital Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Clinic Wing & Location
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    WeCare Medical Tower &bull; {doc.department}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Suite 800 &bull; In-Person Hospital Suite Consultations
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    Education & Credentials
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {doc.degree} &bull; Verified Specialist
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tertiary Clinical Fellowship & Surgical Board
                  </p>
                </div>
              </div>
            </div>

          {/* Modal Footer CTA */}
          <div className="p-4 sm:px-8 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 hidden sm:block">
              Immediate consultation bookings available today
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookConsultation?.();
                }}
                className="px-6 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                  boxShadow: `0 4px 14px ${doc.gradientFrom}40`,
                }}
              >
                <Calendar className="w-4 h-4" />
                Book Consultation
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )}
</AnimatePresence>,
document.body
);
}

/* ==========================================================================
   Featured Leadership Spotlight Card
   ========================================================================== */

function FeaturedDoctorBanner({
  doc,
  onSelectDoctor,
}: {
  doc: Doctor;
  onSelectDoctor?: (doc: Doctor) => void;
}) {
  const Icon = doc.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 55, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full pt-4 pb-2 transform-gpu will-change-transform"
    >
      {/* Skewed gradient backdrop - Enhanced */}
      <span
        className="absolute top-1 left-[16px] w-[calc(100%-20px)] sm:w-[85%] h-[calc(100%-8px)] rounded-3xl transform skew-x-[4deg] sm:skew-x-[6deg] opacity-90 pointer-events-none z-0"
        style={{
          background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
        }}
      />
      <span
        className="absolute top-1 left-[16px] w-[calc(100%-20px)] sm:w-[85%] h-[calc(100%-8px)] rounded-3xl transform skew-x-[4deg] sm:skew-x-[6deg] opacity-60 blur-[32px] pointer-events-none z-0 transform-gpu"
        style={{
          background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
        }}
      />

      {/* Foreground glass panel with color tint */}
      <div
        className="relative z-20 sm:backdrop-blur-md rounded-3xl border p-6 sm:p-10 text-slate-900 overflow-hidden transform-gpu"
        style={{
          background: `linear-gradient(165deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 50%, ${doc.gradientFrom}14 100%)`,
          borderColor: `${doc.gradientFrom}50`,
          boxShadow: `0 20px 45px -10px ${doc.gradientFrom}35, 0 8px 20px rgba(0,0,0,0.04), inset 0 1.5px 2px rgba(255,255,255,0.95)`,
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div
              className="relative shrink-0 cursor-pointer group/img"
              onClick={() => onSelectDoctor?.(doc)}
              title="Click to view full details"
            >
              <div className="size-24 sm:size-32 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/90 bg-slate-100 transition-transform group-hover/img:scale-105 duration-200">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover object-[center_25%]"
                />
              </div>
              <motion.div
                whileHover={{ rotate: [-6, 6, 0], scale: 1.1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute -bottom-2 -right-2 size-10 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white"
                style={{
                  background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                }}
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs"
                  style={{
                    background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                  }}
                >
                  {doc.badge}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                  {doc.rating}
                </span>
              </div>
              <h3
                onClick={() => onSelectDoctor?.(doc)}
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight cursor-pointer"
                title="Click to view full details"
              >
                {doc.name}, {doc.degree}
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                {doc.role} &bull; {doc.department}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                {doc.bio}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {doc.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white/80 border border-slate-200/80 text-slate-700 shadow-2xs"
                  >
                    <Check className="w-3 h-3" style={{ color: doc.gradientFrom }} />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectDoctor?.(doc)}
              className="px-5 py-3.5 rounded-2xl bg-white/95 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              View Full Details
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectDoctor?.(doc)}
              className="px-6 py-3.5 rounded-2xl text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              style={{
                background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                boxShadow: `0 6px 18px ${doc.gradientFrom}40`,
              }}
            >
              <Calendar className="w-4 h-4" />
              Book with {doc.name.split(" ")[1]}
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
   Main DoctorsBento Component
   ========================================================================== */

export function DoctorsBento({ onBookConsultation }: DoctorsBentoProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const featuredDoctor = ALL_DOCTORS[0]; // Dr. Tony Stark — Medical Director

  return (
    <section className="bg-slate-50 py-20 px-4 sm:px-6 font-sans min-h-screen relative overflow-x-clip text-slate-900">
      {/* Ambient background glow orbs - GPU-composited static gradients for 60-120fps scrolling */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-blue-400/8 blur-[100px] transform-gpu"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-20 w-[450px] h-[450px] rounded-full bg-rose-400/8 blur-[100px] transform-gpu"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-400/6 blur-[100px] transform-gpu"
      />

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        {/* ====================================================================
            1. HERO HEADER
            ==================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/90 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer transition-transform duration-200 hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Specialist Directory
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
            Meet Our Medical Specialists
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            Board-certified clinicians and surgeons across{" "}
            <span className="font-semibold text-slate-900">
              <AnimatedNumber value={ALL_DOCTORS.length} />
            </span>{" "}
            specialties — each with decades of tertiary surgical and
            diagnostic experience serving over{" "}
            <span className="font-semibold text-slate-900">
              <AnimatedNumber value={250000} suffix="+" />
            </span>{" "}
            patient families.
          </p>
        </motion.div>

        {/* ====================================================================
            2. FEATURED MEDICAL DIRECTOR SPOTLIGHT
            ==================================================================== */}
        <FeaturedDoctorBanner
          doc={featuredDoctor}
          onSelectDoctor={setSelectedDoctor}
        />

        {/* ====================================================================
            3. ALL MEDICAL SPECIALISTS GRID (Non-Sticky Clean Roster)
            ==================================================================== */}
        <div id="doctors-roster" className="space-y-8 scroll-mt-28">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                All Medical Specialists
              </h3>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 uppercase tracking-wider bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              {ALL_DOCTORS.length} Board-Certified Specialists
            </span>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {ALL_DOCTORS.map((doc, idx) => (
              <DoctorCard
                key={doc.id}
                doc={doc}
                idx={idx}
                onSelect={setSelectedDoctor}
              />
            ))}
          </div>
        </div>

        {/* ====================================================================
            4. CLOSING CONSULTATION BANNER
            ==================================================================== */}
        <div className="relative w-full pt-2">
          {/* Blue Skewed gradient glow backdrop */}
          <span
            className="absolute top-2 left-[24px] w-3/4 sm:w-[70%] h-[calc(100%-12px)] rounded-3xl transform skew-x-[6deg] opacity-75 blur-[24px] pointer-events-none z-0 transform-gpu"
            style={{
              background: "linear-gradient(315deg, #3b82f6, #06b6d4)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 55, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative z-20 rounded-3xl bg-white/85 sm:backdrop-blur-md p-8 sm:p-12 text-slate-900 border border-slate-200/90 shadow-[0_16px_40px_rgba(37,99,235,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] flex flex-col md:flex-row items-center justify-between gap-8 transition-shadow hover:shadow-[0_24px_50px_rgba(37,99,235,0.12)] transform-gpu will-change-transform"
          >
            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
                <BriefcaseMedical className="w-3.5 h-3.5 text-blue-600" /> Need Help Choosing a Specialist?
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Schedule a Consultation — We'll Match You Right
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our front-desk clinical coordinators can match your symptoms to the
                correct specialist in under five minutes, no referral required.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBookConsultation}
              className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 shrink-0 flex items-center gap-3 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white" />
              Book Initial Consultation
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Interactive Doctor Detail Modal Dialog */}
      <DoctorDetailModal
        doc={selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onBookConsultation={onBookConsultation}
      />
    </section>
  );
}

export default DoctorsBento;
