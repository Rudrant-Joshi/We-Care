"use client";
import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "motion/react";
import {
  Check,
  Calendar,
  ArrowRight,
  MapPin,
  Phone,
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
  Building2,
  BriefcaseMedical,
  type LucideIcon,
} from "lucide-react";
import { DEPARTMENT_COLORS, type DepartmentColorToken } from "../../lib/department-colors";

interface DepartmentsBentoProps {
  onBookConsultation?: () => void;
}

/* ==========================================================================
   Smooth Animated Count-Up Number (Spring Physics & Easing)
   Local, self-contained copy — mirrors the About module's implementation
   so this feature stays zero-coupled and independently deletable.
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
   Data Models
   ========================================================================== */

type DepartmentTheme = DepartmentColorToken;

interface Department {
  id: string;
  icon: LucideIcon;
  name: string;
  tag: string;
  wing: string;
  phone: string;
  rating: number;
  description: string;
  services: string[];
  theme: DepartmentTheme;
}

const THEMES: Record<string, DepartmentTheme> = {
  rose: DEPARTMENT_COLORS.cardiology,
  violet: DEPARTMENT_COLORS.neurology,
  amber: DEPARTMENT_COLORS.orthopedics,
  cyan: DEPARTMENT_COLORS.pediatrics,
  emerald: DEPARTMENT_COLORS.oncology,
  pink: DEPARTMENT_COLORS.dermatology,
  orange: DEPARTMENT_COLORS.emergency,
  blue: DEPARTMENT_COLORS.radiology,
};

const DEPARTMENTS: Department[] = [
  {
    id: "cardiology",
    icon: Heart,
    name: "Cardiology",
    tag: "Heart & Vascular Care",
    wing: "Wing A, 2nd Floor",
    phone: "+1 (555) 101-2001",
    rating: 4.9,
    description:
      "Comprehensive cardiovascular diagnostics, interventional cardiology, and post-cardiac rehabilitation delivered by a 24/7 catheterization team.",
    services: [
      "Electrocardiogram (ECG) & Stress Testing",
      "Cardiac Catheterization Lab",
      "Echocardiography & Doppler Imaging",
      "Heart Failure Management Clinic",
      "Post-Surgical Cardiac Rehabilitation",
    ],
    theme: THEMES.rose,
  },
  {
    id: "neurology",
    icon: Brain,
    name: "Neurology",
    tag: "Brain & Nervous System",
    wing: "Wing C, 3rd Floor",
    phone: "+1 (555) 101-2003",
    rating: 4.8,
    description:
      "Advanced neuro-diagnostics and specialized treatment for stroke, epilepsy, and complex neurological disorders with dedicated EEG monitoring.",
    services: [
      "EEG & Electromyography (EMG)",
      "Acute Stroke Rapid-Response Unit",
      "Epilepsy & Seizure Management Clinic",
      "Migraine & Chronic Headache Therapy",
      "Sleep Disorders Evaluation Lab",
    ],
    theme: THEMES.violet,
  },
  {
    id: "orthopedics",
    icon: Bone,
    name: "Orthopedics",
    tag: "Bones, Joints & Spine",
    wing: "Wing A, 1st Floor",
    phone: "+1 (555) 101-2004",
    rating: 4.9,
    description:
      "Full-spectrum orthopedic surgery and rehabilitation, from robotic-assisted joint replacement to sports medicine and spine care.",
    services: [
      "Robotic-Assisted Joint Replacement",
      "Sports Medicine & Trauma Clinic",
      "Spine & Chronic Back Pain Care",
      "Arthroscopic Keyhole Surgery",
      "Post-Op Physical Therapy Programs",
    ],
    theme: THEMES.amber,
  },
  {
    id: "pediatrics",
    icon: Baby,
    name: "Pediatrics",
    tag: "Newborn to Adolescent Care",
    wing: "Wing B, Ground Floor",
    phone: "+1 (555) 101-2002",
    rating: 5.0,
    description:
      "Warm, family-centered pediatric care spanning newborn screening, vaccination, and growth monitoring through adolescence.",
    services: [
      "Newborn Screenings & NICU Support",
      "Immunizations & Vaccination Schedule",
      "Growth & Development Monitoring",
      "Childhood Asthma & Allergy Program",
      "24/7 Pediatric Emergency Care",
    ],
    theme: THEMES.cyan,
  },
  {
    id: "oncology",
    icon: Microscope,
    name: "Oncology",
    tag: "Cancer Diagnostics & Care",
    wing: "Wing D, 4th Floor",
    phone: "+1 (555) 101-2005",
    rating: 4.9,
    description:
      "Multi-disciplinary cancer treatment combining chemotherapy, immunotherapy, and genetic profiling with compassionate palliative support.",
    services: [
      "Chemotherapy & Infusion Suites",
      "Immunotherapy & Targeted Biologics",
      "Cancer Genetic Counseling",
      "Pain & Palliative Management",
      "Active Clinical Trial Screening",
    ],
    theme: THEMES.emerald,
  },
  {
    id: "dermatology",
    icon: Sparkles,
    name: "Dermatology",
    tag: "Skin, Hair & Nail Health",
    wing: "Wing B, 1st Floor",
    phone: "+1 (555) 101-2006",
    rating: 4.8,
    description:
      "Medical, surgical, and cosmetic dermatology delivering skin cancer screening, chronic condition management, and laser therapy.",
    services: [
      "Skin Cancer Screening & Biopsies",
      "Acne & Rosacea Specialized Clinic",
      "Psoriasis & Eczema Management",
      "Laser Skin Resurfacing",
      "Allergy Patch Testing",
    ],
    theme: THEMES.pink,
  },
  {
    id: "emergency",
    icon: Siren,
    name: "Emergency & Trauma",
    tag: "Level 1 Trauma Center",
    wing: "Wing A, Ground Floor",
    phone: "+1 (555) 101-2007",
    rating: 4.9,
    description:
      "Round-the-clock Level 1 trauma response with rapid triage protocols, resuscitation bays, and direct ambulance dispatch.",
    services: [
      "24/7 Level 1 Trauma Response",
      "Rapid Triage & Resuscitation Bays",
      "Ambulance Dispatch & Pre-Hospital Care",
      "Critical Care Stabilization",
      "Poison Control & Toxicology",
    ],
    theme: THEMES.orange,
  },
  {
    id: "radiology",
    icon: ScanLine,
    name: "Radiology & Imaging",
    tag: "Diagnostic Imaging",
    wing: "Wing C, Ground Floor",
    phone: "+1 (555) 101-2008",
    rating: 4.8,
    description:
      "State-of-the-art MRI, CT, and digital X-ray imaging with sub-24-hour radiologist reporting across all outpatient referrals.",
    services: [
      "MRI & CT Scan Suites",
      "Digital X-Ray & Fluoroscopy",
      "Ultrasound & Doppler Studies",
      "Mammography Screening",
      "Same-Day Radiologist Reporting",
    ],
    theme: THEMES.blue,
  },
];

interface DeptDoctor {
  id: string;
  name: string;
  role: string;
  degree: string;
  rating: number;
}

const DOCTORS_BY_DEPT: Record<string, DeptDoctor[]> = {
  cardiology: [
    { id: "iron-man", name: "Dr. Tony Stark", role: "Chief Medical Director & Cardiothoracic Lead", degree: "MD, FACS", rating: 5.0 },
    { id: "war-machine", name: "Dr. James Rhodes", role: "Interventional Cardiology & Cardiac Trauma Lead", degree: "MD, FACC", rating: 4.9 },
  ],
  neurology: [
    { id: "doctor-strange", name: "Dr. Stephen Strange", role: "Chief of Neurosurgery & Vascular Neurology", degree: "MD, PhD", rating: 5.0 },
    { id: "hulk", name: "Dr. Bruce Banner", role: "Director of Neurobiology & Cellular Dynamics", degree: "MD, PhD", rating: 4.9 },
  ],
  orthopedics: [
    { id: "captain-america", name: "Dr. Steve Rogers", role: "Chief of Orthopedic Surgery & Physical Rehab", degree: "MD, FAAOS", rating: 5.0 },
    { id: "winter-soldier", name: "Dr. Bucky Barnes", role: "Bionic Prosthetics & Joint Reconstruction Lead", degree: "MD, FAAOS", rating: 4.9 },
  ],
  pediatrics: [
    { id: "spider-man", name: "Dr. Peter Parker", role: "Pediatric Care Lead & Adolescent Medicine", degree: "MD, FAAP", rating: 5.0 },
    { id: "ant-man", name: "Dr. Scott Lang", role: "Micro-Pediatrics & Neonatal Care Specialist", degree: "MD", rating: 4.9 },
  ],
  oncology: [
    { id: "black-panther", name: "Dr. T'Challa", role: "Chief of Cellular Oncology & Advanced Therapeutics", degree: "MD, PhD", rating: 5.0 },
    { id: "vision", name: "Dr. Vision", role: "Computational Oncology & Targeted Radiosurgery", degree: "MD, PhD", rating: 4.9 },
  ],
  dermatology: [
    { id: "black-widow", name: "Dr. Natasha Romanoff", role: "Dermatologic Surgeon & Scar Reconstruction Lead", degree: "MD, FAAD", rating: 5.0 },
    { id: "scarlet-witch", name: "Dr. Wanda Maximoff", role: "Cellular Rejuvenation & Cosmetic Dermatology", degree: "MD", rating: 4.9 },
  ],
  emergency: [
    { id: "thor", name: "Dr. Thor Odinson", role: "Head of Emergency Trauma & Acute Resuscitation", degree: "MD, FACEP", rating: 5.0 },
    { id: "captain-marvel", name: "Dr. Carol Danvers", role: "Acute Trauma Surgeon & Rapid Flight Response", degree: "MD", rating: 4.9 },
  ],
  radiology: [
    { id: "hawkeye", name: "Dr. Clint Barton", role: "Chief Diagnostic Radiologist & Precision Imaging", degree: "MD", rating: 5.0 },
    { id: "falcon", name: "Dr. Sam Wilson", role: "Aerial & High-Resolution Bio-Spectral Imaging Lead", degree: "MD, FACR", rating: 4.9 },
  ],
};

/* ==========================================================================
   Department Directory Card (Skewed Gradient Panels & Glassmorphic Design)
   ========================================================================== */

function DepartmentCard({
  dept,
  idx,
  isActive,
  onSelect,
}: {
  dept: Department;
  idx: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = dept.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 55, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.18, margin: "0px 0px -40px 0px" }}
      transition={{
        delay: (idx % 4) * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full pt-4 pb-2 transform-gpu will-change-transform"
    >
      <motion.div
        onClick={onSelect}
        whileHover={{ y: -8, scale: 1.025 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="group relative w-full h-[380px] cursor-pointer select-none"
      >
        {/* 1. Skewed gradient backing panel */}
        <span
          className={`absolute top-0 left-[22px] w-3/5 h-full rounded-2xl transform ${
            isActive
              ? "skew-x-0 left-[10px] w-[calc(100%-20px)] opacity-95"
              : "skew-x-[12deg] opacity-75 group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-95"
          } transition-all duration-500 pointer-events-none z-0`}
          style={{
            background: `linear-gradient(315deg, ${dept.theme.gradientFrom}, ${dept.theme.gradientTo})`,
          }}
        />

        {/* 2. Skewed blurred neon glow shadow */}
        <span
          className={`absolute top-0 left-[22px] w-3/5 h-full rounded-2xl transform ${
            isActive
              ? "skew-x-0 left-[10px] w-[calc(100%-20px)] opacity-55"
              : "skew-x-[12deg] opacity-25 blur-[26px] group-hover:skew-x-0 group-hover:left-[10px] group-hover:w-[calc(100%-20px)] group-hover:opacity-60"
          } blur-[26px] transition-all duration-500 pointer-events-none z-0 will-change-transform transform-gpu`}
          style={{
            background: `linear-gradient(315deg, ${dept.theme.gradientFrom}, ${dept.theme.gradientTo})`,
          }}
        />

        {/* 3. Foreground Transparent Liquid Glass Content Panel (Clean White Liquid Glass Theme) */}
        <div
          className={`relative z-20 h-full p-6 bg-white/60 backdrop-blur-[14px] rounded-2xl border ${
            isActive
              ? "border-white/95 shadow-[0_16px_36px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,1)]"
              : "border-white/80 shadow-[0_8px_28px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:border-white hover:shadow-[0_16px_36px_rgba(0,0,0,0.09)]"
          } text-slate-900 transition-all duration-500 flex flex-col justify-between`}
          style={
            isActive
              ? {
                  borderColor: `${dept.theme.gradientFrom}70`,
                  boxShadow: `0 14px 32px -4px ${dept.theme.gradientFrom}25, 0 0 0 1px ${dept.theme.gradientFrom}20, inset 0 1.5px 2px rgba(255,255,255,0.95)`,
                }
              : undefined
          }
        >
          {/* Top Info */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ rotate: [-5, 5, 0], scale: 1.12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`size-12 rounded-xl flex items-center justify-center ${dept.theme.iconBg} shadow-md`}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>

              {isActive ? (
                <motion.span
                  layoutId="active-ward-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${dept.theme.gradientFrom}, ${dept.theme.gradientTo})`,
                    boxShadow: `0 2px 8px ${dept.theme.gradientFrom}40`,
                  }}
                >
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  Active Ward
                </motion.span>
              ) : (
                <motion.span
                  whileHover={{ scale: 1.08 }}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-white/85 px-2.5 py-0.5 rounded-full border shadow-2xs"
                  style={{
                    color: dept.theme.gradientFrom,
                    borderColor: `${dept.theme.gradientFrom}35`,
                  }}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                  {dept.rating}
                </motion.span>
              )}
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">
                {dept.name}
              </h4>
              <p className={`text-[11px] font-mono font-bold uppercase tracking-wide mt-0.5 ${dept.theme.solid}`}>
                {dept.tag}
              </p>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {dept.description}
            </p>
          </div>

          {/* Bottom Info & Action */}
          <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <BriefcaseMedical className="w-3.5 h-3.5" style={{ color: dept.theme.gradientFrom }} />
                {DOCTORS_BY_DEPT[dept.id]?.length ?? 0} Specialists
              </span>
              <span className="font-mono text-slate-400 text-[10.5px]">
                {dept.wing.split(",")[0]}
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-white group/btn"
              style={{
                background: `linear-gradient(135deg, ${dept.theme.gradientFrom}, ${dept.theme.gradientTo})`,
                boxShadow: `0 4px 14px ${dept.theme.gradientFrom}35`,
              }}
            >
              <span>{isActive ? "Viewing Overview" : "Explore Department"}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1.5 duration-200" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================================
   Main Departments Bento Component
   ========================================================================== */

export function DepartmentsBento({ onBookConsultation }: DepartmentsBentoProps) {
  const [activeDeptId, setActiveDeptId] = useState<string>(DEPARTMENTS[0].id);
  const activeDept = DEPARTMENTS.find((d) => d.id === activeDeptId) ?? DEPARTMENTS[0];
  const activeDoctors = DOCTORS_BY_DEPT[activeDept.id] ?? [];
  const deepDiveRef = useRef<HTMLDivElement>(null);

  const handleSelectDept = (id: string) => {
    setActiveDeptId(id);
    if (deepDiveRef.current) {
      const topOffset = deepDiveRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-slate-50 py-20 px-4 sm:px-6 font-sans min-h-screen relative overflow-x-clip text-slate-900">
      {/* Ambient background glow orbs */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -25, 0], x: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-20 w-[550px] h-[550px] rounded-full bg-blue-400/10 blur-[140px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 30, 0], x: [0, -20, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 -right-20 w-[500px] h-[500px] rounded-full bg-rose-400/10 blur-[140px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-emerald-400/8 blur-[140px]"
      />

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        {/* ====================================================================
            1. HEADER
            ==================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <motion.div
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/90 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Clinical Roster
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
            Explore Our Medical Departments
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
            Eight flagship specialty wards — part of WeCare's wider network of{" "}
            <span className="font-semibold text-slate-900">
              <AnimatedNumber value={18} suffix="+" />
            </span>{" "}
            outpatient departments operating under certified hygiene and medical
            supervision protocols.
          </p>
        </motion.div>

        {/* Sticky Quick-Scroll Section Navigation Pill Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.4 }}
          className="sticky top-20 z-30 flex items-center justify-center pointer-events-auto"
        >
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-md shadow-slate-900/5 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>All Specialties ({DEPARTMENTS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (deepDiveRef.current) {
                  const topOffset = deepDiveRef.current.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top: topOffset, behavior: 'smooth' });
                }
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>{activeDept.name} Ward Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('dept-specialists')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <BriefcaseMedical className="w-3.5 h-3.5 text-emerald-600" />
              <span>Specialist Doctors</span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('dept-routing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
              <span>Care Routing</span>
            </button>
          </div>
        </motion.div>

        {/* ====================================================================
            2. DEPARTMENT DIRECTORY BENTO GRID
            ==================================================================== */}
        <div id="departments" className="space-y-8 scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between flex-wrap gap-3"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Choose a Specialty ({DEPARTMENTS.length})
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Tap a department to view full details below
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {DEPARTMENTS.map((dept, idx) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                idx={idx}
                isActive={dept.id === activeDeptId}
                onSelect={() => handleSelectDept(dept.id)}
              />
            ))}
          </div>
        </div>

        {/* ====================================================================
            3. ACTIVE DEPARTMENT DEEP-DIVE PANEL (Clean Liquid Glass Aesthetic)
            ==================================================================== */}
        <div ref={deepDiveRef} className="space-y-8 scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="group/deepdive relative w-full pt-4 pb-2 transform-gpu will-change-transform"
          >
            {/* 1. Large Skewed gradient backing panel matching active department */}
            <motion.span
              key={`backing-${activeDept.id}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 0.85, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-2 left-[28px] w-3/4 sm:w-[70%] h-[calc(100%-16px)] rounded-3xl transform skew-x-[6deg] sm:skew-x-[8deg] pointer-events-none z-0 transition-all duration-700"
              style={{
                background: `linear-gradient(315deg, ${activeDept.theme.gradientFrom}, ${activeDept.theme.gradientTo})`,
              }}
            />

            {/* 2. Large Skewed blurred neon glow shadow */}
            <motion.span
              key={`glow-${activeDept.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.5 }}
              className="absolute top-2 left-[28px] w-3/4 sm:w-[70%] h-[calc(100%-16px)] rounded-3xl transform skew-x-[6deg] sm:skew-x-[8deg] blur-[36px] pointer-events-none z-0 transition-all duration-700"
              style={{
                background: `linear-gradient(315deg, ${activeDept.theme.gradientFrom}, ${activeDept.theme.gradientTo})`,
              }}
            />

            {/* 3. Foreground Transparent Liquid Glass Content Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDept.id}
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.985 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 bg-white/50 backdrop-blur-[20px] rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] p-6 sm:p-10 space-y-10 text-slate-900 overflow-hidden transform-gpu will-change-transform"
              >
                {/* Top accent bar echoing the active department's color */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeDept.theme.topAccent}`}
                />

                {/* Department Title & Quick CTA */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: [-6, 6, 0], scale: 1.1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={`size-14 rounded-2xl flex items-center justify-center ${activeDept.theme.iconBg} shadow-md`}
                    >
                      {React.createElement(activeDept.icon, { className: "w-7 h-7 text-white" })}
                    </motion.div>
                    <div className="space-y-1">
                      <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${activeDept.theme.solid}`}>
                        {activeDept.tag}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {activeDept.name} Department
                      </h3>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onBookConsultation}
                    className="px-6 py-3.5 rounded-2xl text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${activeDept.theme.gradientFrom}, ${activeDept.theme.gradientTo})`,
                      boxShadow: `0 6px 18px ${activeDept.theme.gradientFrom}40`,
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Book in {activeDept.name}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Overview */}
                <div className="relative z-10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Overview
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                    {activeDept.description}
                  </p>
                </div>

                {/* Services & Ward Logistics */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Services Checklist */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Offered Clinical Services
                    </h4>
                    <ul className="space-y-2">
                      {activeDept.services.map((service, index) => (
                        <motion.li
                          key={service}
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.04 * index, duration: 0.35, ease: "easeOut" }}
                          whileHover={{ x: 6 }}
                          className="flex items-start gap-2.5 text-sm text-slate-700 font-medium p-1.5 rounded-xl hover:bg-white/50 transition-colors cursor-default"
                        >
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.04 * index + 0.05, type: "spring", stiffness: 450 }}
                            className="shrink-0 mt-0.5"
                          >
                            <Check className={`w-4 h-4 ${activeDept.theme.solid}`} />
                          </motion.span>
                          <span>{service}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Ward & Logistics Card */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="space-y-4 bg-white/60 backdrop-blur-[14px] p-6 rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Ward &amp; Logistics
                      </h4>

                      <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }} className="flex items-center gap-3 group/item">
                        <div
                          className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm border border-white shadow-2xs flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform"
                          style={{ color: activeDept.theme.gradientFrom }}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono">Clinic Location</p>
                          <p className="text-sm font-bold text-slate-800">{activeDept.wing}</p>
                        </div>
                      </motion.div>

                      <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }} className="flex items-center gap-3 group/item">
                        <div
                          className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm border border-white shadow-2xs flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform"
                          style={{ color: activeDept.theme.gradientFrom }}
                        >
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono">Direct Nursing Station</p>
                          <a
                            href={`tel:${activeDept.phone.replace(/\D/g, "")}`}
                            className="text-sm font-bold text-slate-800 hover:text-slate-950 transition-colors"
                          >
                            {activeDept.phone}
                          </a>
                        </div>
                      </motion.div>

                      <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }} className="flex items-center gap-3 group/item">
                        <div
                          className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm border border-white shadow-2xs flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform"
                          style={{ color: activeDept.theme.gradientFrom }}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono">Outpatient Hours</p>
                          <p className="text-sm font-bold text-slate-800">
                            {activeDept.id === "emergency" ? "24/7 — No Appointment Needed" : "Sun–Fri, 8:00 AM – 8:00 PM"}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-4 border-t border-slate-200/70 leading-relaxed italic">
                      Emergency triage admissions are accepted directly without token scheduling via Wing A ambulance decks.
                    </p>
                  </motion.div>
                </div>

                {/* Specialists Attached */}
                <div id="dept-specialists" className="relative z-10 space-y-5 pt-6 border-t border-slate-200/80 scroll-mt-28">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <BriefcaseMedical className={`w-4 h-4 ${activeDept.theme.solid}`} />
                    Specialist Clinicians in {activeDept.name} ({activeDoctors.length})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDoctors.map((doc, idx) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 35, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ delay: 0.08 * idx, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -6, scale: 1.02, borderColor: `${activeDept.theme.gradientFrom}90` }}
                        onClick={onBookConsultation}
                        className="p-4 bg-white/60 backdrop-blur-[14px] rounded-2xl border border-slate-200/90 hover:bg-white/85 shadow-[0_4px_18px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all flex items-center justify-between group cursor-pointer transform-gpu will-change-transform"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-xl overflow-hidden shadow-sm shrink-0 ring-2 ring-white/90 group-hover:scale-105 transition-transform bg-slate-100">
                            <img
                              src={`/doctors/${doc.id}.jpg`}
                              alt={doc.name}
                              loading="lazy"
                              className="w-full h-full object-cover object-[center_25%]"
                            />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">
                              {doc.name}
                            </h5>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {doc.role} &bull; {doc.degree}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-0.5">
                              <Star className="w-3 h-3 fill-amber-500 stroke-none" />
                              {doc.rating}
                            </div>
                          </div>
                        </div>

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookConsultation?.();
                          }}
                          whileHover={{ scale: 1.15, rotate: 6, borderColor: activeDept.theme.gradientFrom }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer shrink-0"
                          style={{ color: activeDept.theme.gradientFrom }}
                          title="Book Consultation"
                        >
                          <Calendar className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ====================================================================
            4. CLOSING CONSULTATION BANNER
            ==================================================================== */}
        <div id="dept-routing" className="relative w-full pt-2 scroll-mt-28">
          {/* Blue Skewed gradient glow backdrop */}
          <span
            className="absolute top-2 left-[24px] w-3/4 sm:w-[70%] h-[calc(100%-12px)] rounded-3xl transform skew-x-[6deg] opacity-75 blur-[30px] pointer-events-none z-0"
            style={{
              background: "linear-gradient(315deg, #3b82f6, #06b6d4)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 55, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.18, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative z-20 rounded-3xl bg-white/60 backdrop-blur-[20px] p-8 sm:p-12 text-slate-900 border border-slate-200/90 shadow-[0_16px_40px_rgba(37,99,235,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] flex flex-col md:flex-row items-center justify-between gap-8 transition-shadow hover:shadow-[0_24px_50px_rgba(37,99,235,0.14)] transform-gpu will-change-transform"
          >
            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
                <BriefcaseMedical className="w-3.5 h-3.5 text-blue-600" /> Not Sure Which Department?
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Talk to Patient Care — We'll Route You Right
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our front-desk clinical coordinators can match your symptoms to the
                correct specialist and department in under five minutes, no referral required.
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
    </section>
  );
}

export default DepartmentsBento;
