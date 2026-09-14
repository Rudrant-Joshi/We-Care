import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { ImageStreamHero } from '@/components/ui/image-stream-hero';
import MusicVideoPinStack from '@/components/ui/music-video-pin-stack';
import { ArrowRight, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';

const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const pillItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const HOSPITAL_IMAGES = [
  // 1. Operating Theater (Category 1)
  {
    src: '/hospital/cardiac_or.jpg',
    alt: 'High-tech sterile cardiac surgery operating theater with illuminated robotic overhead lights and surgical bed',
  },
  // 2. Hospital Bed (Category 2)
  {
    src: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=85',
    alt: 'Modern private inpatient hospital room with adjustable care bed, IV stand, and clinical monitoring panel',
  },
  // 3. High-Tech Equipment (Category 3)
  {
    src: '/hospital/mri_scanner_suite.jpg',
    alt: 'Advanced 3T MRI diagnostic imaging scanner suite with motorized scanning table and radiology controls',
  },
  // 4. Modern Architecture (Category 4)
  {
    src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85',
    alt: 'Grand modern hospital arrival reception atrium, curved marble desk, and patient lounge',
  },
  // 5. Operating Theater (Category 1) - [3-photo gap from Photo 1]
  {
    src: '/hospital/or_adventhealth.jpg',
    alt: 'Modern surgical operating suite with sterile operating table, dual robotic overhead lamps, and anesthesia monitors',
  },
  // 6. Hospital Bed (Category 2) - [3-photo gap from Photo 2]
  {
    src: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=85',
    alt: 'Pristine hospital inpatient recovery ward with clean modern care beds, bedside cabinets, and privacy curtains',
  },
  // 7. High-Tech Equipment (Category 3) - [3-photo gap from Photo 3]
  {
    src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85',
    alt: 'High-tech private clinical examination and surgical treatment suite with robotic overhead arm lamp and monitors',
  },
  // 8. Modern Architecture (Category 4) - [3-photo gap from Photo 4]
  {
    src: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=85',
    alt: 'Modern multi-story regional hospital architectural facade with glass curtain walls and emergency entrance',
  },
  // 9. Operating Theater (Category 1) - [3-photo gap from Photo 5]
  {
    src: '/hospital/or_sterile_clean.jpg',
    alt: 'Cleanroom surgical operating theater with ceiling equipment booms, twin robotic surgical lights, and motorized table',
  },
  // 10. Hospital Bed (Category 2) - [3-photo gap from Photo 6]
  {
    src: 'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&w=1200&q=85',
    alt: 'Executive hospital patient room with adjustable medical bed, clean linens, and bedside telemetry stand',
  },
  // 11. High-Tech Equipment (Category 3) - [3-photo gap from Photo 7]
  {
    src: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1200&q=85',
    alt: 'Automated clinical laboratory diagnostic hardware with sample analysis testing arrays',
  },
  // 12. Modern Architecture (Category 4) - [3-photo gap from Photo 8]
  {
    src: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85',
    alt: 'Executive medical center campus building with modern architectural glass entrance portico',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main
      id="vortiq-home-page"
      className="relative w-full bg-white text-slate-900 flex flex-col font-sans select-none"
    >
      {/* Modern Medical Engineering Subtle Architectural Dot Grid Canvas matching website */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-35"
      />

      {/* Hero Viewport Container - Exactly 100svh so Section 2 is only visible on scroll */}
      <div className="relative z-10 w-full h-[100svh] min-h-[100svh] max-h-[100svh] flex flex-col justify-between overflow-hidden bg-white">
        {/* Navigation Bar in White Theme */}
        <div className="relative z-30 w-full border-b border-slate-100/80 bg-white/90 backdrop-blur-md shadow-xs font-sans shrink-0">
          <Navbar />
        </div>

        {/* Image Stream Hero Corridor with Diverse Hospital Photography */}
        <ImageStreamHero
          images={HOSPITAL_IMAGES}
          cards={9}
          speed={18}
          axis={50}
          className="relative z-10 w-full flex-1 flex flex-col items-center justify-between py-2 sm:py-4 text-center font-sans overflow-hidden"
        >
          <div className="relative z-10 flex h-full flex-1 flex-col items-center justify-between py-1 sm:py-2 text-center pointer-events-none font-sans">
            {/* Top Section: Hospital Headline, Trust Badge & Action CTAs */}
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="px-6 pointer-events-auto flex flex-col items-center max-w-4xl mx-auto mt-1 sm:mt-2 font-sans"
            >
              {/* JCI Quality & Clinical Accreditation Badge with Live Pulse */}
              <motion.div
                variants={heroItemVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50/95 border border-blue-200/90 text-blue-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-3 shadow-xs hover:shadow-md hover:shadow-blue-500/15 backdrop-blur-md cursor-default font-sans select-none transition-shadow"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span>JCI Accredited Hospital • 24/7 Emergency & Specialty Care</span>
              </motion.div>

              {/* Main Hospital Headline matching website typography */}
              <motion.h1
                variants={heroItemVariants}
                className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-[58px] font-black tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto font-sans"
              >
                World-Class Healthcare,
                <br />
                <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                  Centered Around You.
                </span>
              </motion.h1>

              {/* Interactive Primary & Secondary Action CTAs with Spring Physics */}
              <motion.div
                variants={heroItemVariants}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 font-sans"
              >
                <motion.button
                  id="home-book-appointment-btn"
                  onClick={() => navigate('/book-appointment')}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="group px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer font-sans"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </motion.button>
                <motion.button
                  id="home-specialists-btn"
                  onClick={() => navigate('/doctors')}
                  whileHover={{ scale: 1.04, y: -2, borderColor: '#93c5fd', color: '#2563eb' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="px-7 py-3 rounded-full bg-white/95 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-sm hover:shadow-md transition-all backdrop-blur-md cursor-pointer font-sans"
                >
                  Meet Our Specialists
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Bottom Section: Clinical Trust Signals, Description & Scroll Down Indicator */}
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl text-balance px-6 pointer-events-auto mt-auto pb-3 sm:pb-4 pt-1 flex flex-col items-center font-sans"
            >
              {/* Three Pillar Trust Indicator Pills with Interactive Hover States */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-2 font-sans">
                <motion.div
                  variants={pillItemVariants}
                  whileHover={{ y: -3, scale: 1.03, borderColor: '#93c5fd' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-md text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all font-sans cursor-default"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>150+ Board-Certified Specialists</span>
                </motion.div>
                <motion.div
                  variants={pillItemVariants}
                  whileHover={{ y: -3, scale: 1.03, borderColor: '#93c5fd' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-md text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all font-sans cursor-default"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero-Wait Emergency Triage</span>
                </motion.div>
                <motion.div
                  variants={pillItemVariants}
                  whileHover={{ y: -3, scale: 1.03, borderColor: '#93c5fd' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs hover:shadow-md text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all font-sans cursor-default"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>99.4% Patient Recovery Score</span>
                </motion.div>
              </div>

              {/* Narrative Hospital Description */}
              <motion.p
                variants={heroItemVariants}
                className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed max-w-xl mx-auto font-sans mb-2.5"
              >
                From advanced robotic surgery to compassionate bedside nursing and routine family wellness, WeCare Hospital provides continuous, specialized medical excellence 24 hours a day.
              </motion.p>

              {/* Animated Scroll Down Indicator with High-Intensity Up-Down Motion */}
              <motion.div variants={heroItemVariants} className="pt-1">
                <motion.div
                  animate={{
                    y: [-6, 10, -6],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex items-center justify-center"
                >
                  <motion.button
                    type="button"
                    id="home-scroll-down-btn"
                    onClick={() => {
                      const nextSection = document.querySelector('[data-tsuna-id="music-video-pin-stack"]');
                      if (nextSection) {
                        nextSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                      }
                    }}
                    whileHover={{
                      scale: 1.06,
                      backgroundColor: 'rgba(239, 246, 255, 0.98)',
                      borderColor: 'rgba(147, 197, 253, 0.9)',
                      boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.2)',
                    }}
                    whileTap={{ scale: 0.96 }}
                    className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 text-slate-700 hover:text-blue-600 border border-slate-200/90 text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer backdrop-blur-md shadow-xs"
                    aria-label="Scroll down to view more"
                  >
                    <span>Scroll down</span>
                    <motion.span
                      animate={{ y: [0, 4, 0] }}
                      transition={{
                        duration: 0.75,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="inline-flex"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600 transition-transform duration-200 group-hover:translate-y-0.5" />
                    </motion.span>
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </ImageStreamHero>
      </div>

      {/* Interactive Hospital Clinical Pin Stack Section */}
      <MusicVideoPinStack
        heading="CLINICAL CARE"
        className="w-full relative z-20"
      />
    </main>
  );
}
