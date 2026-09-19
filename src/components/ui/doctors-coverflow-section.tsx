"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView, type Variants } from "motion/react";
import {
  Sparkles,
  Calendar,
  Award,
  ArrowRight,
  Filter,
  LayoutGrid,
  Layers,
  Star,
  Eye,
} from "lucide-react";
import {
  CoverflowCarousel,
  type CoverflowSlide,
} from "@/components/ui/coverflow-carousel";
import {
  ALL_DOCTORS,
  type Doctor,
  DoctorDetailModal,
} from "@/components/ui/doctors-bento";

/* ==========================================================================
   Animation Variants — matching HomePage + DoctorsBento project patterns
   ========================================================================== */

const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const sectionItemVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const filterPillVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const carouselCardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const gridCardVariants: Variants = {
  hidden: { opacity: 0, y: 55, scale: 0.96 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: (idx % 4) * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const bannerVariants: Variants = {
  hidden: { opacity: 0, y: 55, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ==========================================================================
   Animated Count-Up Number (matching DoctorsBento pattern)
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

  // Using a ref for RAF to avoid state-driven re-renders
  const frameRef = useRef<number>(0);

  // Trigger animation when in view
  if (isInView && displayValue === 0 && value > 0) {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(ease * value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    frameRef.current = requestAnimationFrame(step);
  }

  return (
    <span ref={ref} className="tabular-nums">
      {Math.round(displayValue).toLocaleString()}
      {suffix}
    </span>
  );
}

/* ==========================================================================
   Component Types
   ========================================================================== */

interface DoctorsCoverflowSectionProps {
  onBookConsultation?: () => void;
}

const DEPARTMENTS = [
  "All",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Oncology",
  "Dermatology",
  "Emergency",
  "Radiology",
];

/* ==========================================================================
   Main DoctorsCoverflowSection Component
   ========================================================================== */

export function DoctorsCoverflowSection({
  onBookConsultation,
}: DoctorsCoverflowSectionProps) {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [activeDoctorModal, setActiveDoctorModal] = useState<Doctor | null>(null);
  const [viewMode, setViewMode] = useState<"coverflow" | "grid">("coverflow");

  // Filter doctors based on selected department
  const filteredDoctors = useMemo(() => {
    if (selectedDept === "All") return ALL_DOCTORS;
    return ALL_DOCTORS.filter(
      (doc) => doc.department.toLowerCase() === selectedDept.toLowerCase()
    );
  }, [selectedDept]);

  // Convert filtered doctors to CoverflowSlide format
  const slides: CoverflowSlide[] = useMemo(() => {
    return filteredDoctors.map((doc) => ({
      src: doc.image,
      alt: `${doc.name} - ${doc.specialty}`,
      title: `${doc.name}, ${doc.degree}`,
      subtitle: `${doc.role} • ${doc.department}`,
      badge: doc.badge,
      meta: [
        { label: "Department", value: doc.department },
        { label: "Specialty", value: doc.specialty.split("&")[0].trim() },
        { label: "Experience", value: doc.experience },
        { label: "Rating", value: `★ ${doc.rating.toFixed(1)} / 5.0` },
      ],
    }));
  }, [filteredDoctors]);

  const [, setActiveSlideIndex] = useState(0);

  return (
    <section className="relative w-full py-12 sm:py-20 px-3.5 sm:px-6 md:px-12 bg-slate-50 text-slate-900 overflow-hidden font-sans min-h-screen">

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 md:space-y-20 relative z-10">
        {/* ====================================================================
            1. HERO HEADER — Staggered scroll-reveal with blur-in
            ==================================================================== */}
        <motion.div
          variants={sectionContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4"
        >
          <motion.div
            variants={sectionItemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-[#135940] text-xs font-bold uppercase tracking-wider shadow-2xs cursor-default transition-shadow hover:shadow-md hover:shadow-emerald-600/15 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#135940]" />
            3D Specialist Carousel
          </motion.div>

          <motion.h2
            variants={sectionItemVariants}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight"
          >
            Meet Our Medical Specialists
          </motion.h2>

          <motion.p
            variants={sectionItemVariants}
            className="text-sm sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal"
          >
            Board-certified clinicians and surgeons across{" "}
            <span className="font-semibold text-slate-900">
              <AnimatedNumber value={ALL_DOCTORS.length} />
            </span>{" "}
            specialties — interact with the 3D coverflow, drag or use arrow keys, or
            click any card to view detailed clinical credentials and{" "}
            <span className="font-semibold text-slate-900">
              book a consult
            </span>
            .
          </motion.p>
        </motion.div>

        {/* ====================================================================
            2. FILTER BAR & VIEW MODE TOGGLE — Staggered pills with spring hover
            ==================================================================== */}
        <motion.div
          variants={sectionContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 pb-4 border-b border-slate-200/80"
        >
          {/* Department Filter Pills */}
          <motion.div
            variants={filterPillVariants}
            className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none"
          >
            <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-500 font-semibold mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Dept:
            </span>
            {DEPARTMENTS.map((dept) => {
              const isActive = selectedDept === dept;
              return (
                <motion.button
                  key={dept}
                  type="button"
                  onClick={() => {
                    setSelectedDept(dept);
                    setActiveSlideIndex(0);
                  }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${isActive
                    ? "bg-[#135940] text-white shadow-xs font-semibold"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                  {dept}
                  {dept === "All" && ` (${ALL_DOCTORS.length})`}
                </motion.button>
              );
            })}
          </motion.div>

          {/* View Mode Switcher */}
          <motion.div
            variants={filterPillVariants}
            className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl shrink-0 self-center md:self-auto"
          >
            <motion.button
              type="button"
              onClick={() => setViewMode("coverflow")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "coverflow"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#135940]" />
              3D Coverflow
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setViewMode("grid")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === "grid"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
              Grid Directory
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ====================================================================
            3. DYNAMIC DISPLAY AREA — Animated view transitions
            ==================================================================== */}
        <AnimatePresence mode="wait">
          {viewMode === "coverflow" ? (
            <motion.div
              key="coverflow-view"
              variants={carouselCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1, margin: "0px 0px -40px 0px" }}
              exit={{ opacity: 0, scale: 0.96, y: 30, transition: { duration: 0.3 } }}
              className="space-y-6 transform-gpu will-change-transform"
            >
              {/* 3D Coverflow Carousel — Clean white container */}
              <div className="relative rounded-3xl bg-white p-2 sm:p-6 overflow-hidden">

                <CoverflowCarousel
                  key={selectedDept}
                  slides={slides}
                  cardWidth="clamp(190px, 24vw, 300px)"
                  rotate={40}
                  depth={0.7}
                  perspective={3.2}
                  fade={0}
                  loop={slides.length > 3}
                  showCaption={true}
                  showNavigation={true}
                  showPagination={true}
                  label="Medical Specialist Carousel"
                  onSelect={setActiveSlideIndex}
                  onSlideClick={(slide) => {
                    const match = ALL_DOCTORS.find(
                      (d) => `${d.name}, ${d.degree}` === slide.title || d.image === slide.src
                    );
                    if (match) setActiveDoctorModal(match);
                  }}
                />

                {/* Consultation Booking CTA for Specialist */}
                <div className="flex items-center justify-center pt-3 pb-1">
                  <motion.button
                    type="button"
                    onClick={onBookConsultation}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#135940] hover:bg-[#1b7454] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#135940]/25 hover:shadow-lg hover:shadow-[#135940]/40 flex items-center justify-center gap-2 cursor-pointer transition-all group/cta"
                  >
                    <Calendar className="w-4 h-4 text-white" />
                    Book Specialist Consultation
                    <ArrowRight className="w-3.5 h-3.5 text-white group-hover/cta:translate-x-1 transition-transform duration-200" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ==================================================================
               GRID VIEW — DoctorCard-style staggered scroll reveals
               ================================================================== */
            <motion.div
              key="grid-view"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7"
            >
              {filteredDoctors.map((doc, idx) => {
                const Icon = doc.icon;
                return (
                  <motion.div
                    key={doc.id}
                    custom={idx}
                    variants={gridCardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
                    className="h-full pt-3 pb-2 transform-gpu will-change-transform"
                  >
                    <motion.div
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                      onClick={() => setActiveDoctorModal(doc)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View full details for ${doc.name}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveDoctorModal(doc);
                        }
                      }}
                      className="group relative w-full min-h-[415px] h-full cursor-pointer select-none transform-gpu will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                    >
                      {/* 1. Skewed gradient backing panel */}
                      <span
                        className="absolute -top-1.5 max-sm:left-[8px] max-sm:w-[calc(100%-12px)] max-sm:skew-x-[2deg] sm:left-[12px] sm:w-[calc(100%-14px)] sm:skew-x-[6deg] h-full rounded-2xl transform opacity-90 group-hover:skew-x-0 group-hover:-top-2 group-hover:left-[6px] group-hover:w-[calc(100%-12px)] group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 will-change-transform"
                        style={{
                          background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                        }}
                      />

                      {/* 2. Blurred vibrant neon glow shadow */}
                      <span
                        className="absolute -top-1 max-sm:left-[8px] max-sm:w-[calc(100%-12px)] max-sm:skew-x-[2deg] sm:left-[10px] sm:w-[calc(100%-12px)] sm:skew-x-[6deg] h-full rounded-2xl transform opacity-55 blur-[26px] group-hover:skew-x-0 group-hover:left-[6px] group-hover:w-[calc(100%-12px)] group-hover:opacity-85 group-hover:blur-[32px] transition-all duration-300 pointer-events-none z-0 transform-gpu will-change-transform"
                        style={{
                          background: `linear-gradient(315deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                        }}
                      />

                      {/* 3. Foreground Liquid Glass Content Panel */}
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

                        {/* Clean Doctor Photo */}
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

                        {/* See Details Button with spring animation */}
                        <div className="pt-2.5 border-t border-slate-100/90 mt-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDoctorModal(doc);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-white group/btn hover:brightness-105 transform-gpu"
                            style={{
                              background: `linear-gradient(135deg, ${doc.gradientFrom}, ${doc.gradientTo})`,
                              boxShadow: `0 4px 14px ${doc.gradientFrom}35`,
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Full Detail</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 duration-200" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================================
            4. CLOSING CONSULTATION BANNER — Clean solid gradient
            ==================================================================== */}
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
          className="rounded-3xl bg-gradient-to-br from-[#135940] to-[#0e4230] p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >

          <div className="space-y-2 text-center md:text-left">
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-mono font-semibold uppercase tracking-wider"
            >
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              Verified Board Credentials
            </motion.span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Need assistance selecting a specialist for your diagnosis?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Our clinical care coordinators match your exact symptoms to the ideal
              board-certified physician within minutes.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={onBookConsultation}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="px-6 py-3.5 rounded-xl bg-white text-[#135940] hover:bg-emerald-50 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 group/book"
          >
            <Calendar className="w-4 h-4 text-[#135940]" />
            Request Rapid Appointment
            <ArrowRight className="w-4 h-4 text-[#135940] group-hover/book:translate-x-1.5 transition-transform duration-200" />
          </motion.button>
        </motion.div>
      </div>

      {/* Interactive Doctor Detail Modal Dialog */}
      <DoctorDetailModal
        doc={activeDoctorModal}
        onClose={() => setActiveDoctorModal(null)}
        onBookConsultation={onBookConsultation}
      />
    </section>
  );
}

export default DoctorsCoverflowSection;
