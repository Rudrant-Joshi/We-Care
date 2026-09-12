import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Brain,
  Activity,
  Baby,
  ShieldCheck,
  Clock,
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface FeaturePanelProps {
  onWorkflowClick?: () => void;
  onAgentsClick?: () => void;
}

interface SpecialtyOption {
  id: string;
  tabLabel: string;
  icon: React.ElementType;
  activeColor: string;
  inactiveColor: string;
  doctorName: string;
  doctorRole: string;
  doctorDegree: string;
  experience: string;
  image: string;
  nextSlot: string;
  metricLabel: string;
  metricValue: string;
  metricSub: string;
  bpm: number;
  rhythm: string;
}

const SPECIALTIES: SpecialtyOption[] = [
  {
    id: 'cardiology',
    tabLabel: 'Cardiology',
    icon: Heart,
    activeColor: 'text-rose-600',
    inactiveColor: 'text-rose-200',
    doctorName: 'Dr. Tony Stark',
    doctorRole: 'Chief of Cardiothoracic Surgery',
    doctorDegree: 'MD, FACS • 28y Experience',
    experience: '3,800+ Surgeries',
    image: '/doctor-images/iron-man.jpg',
    nextSlot: 'Today • 11:30 AM',
    metricLabel: 'Surgical Success',
    metricValue: '99.8%',
    metricSub: '✓ Cardiovascular Benchmark',
    bpm: 72,
    rhythm: 'Arc-Paced Normal Sinus Rhythm',
  },
  {
    id: 'neurology',
    tabLabel: 'Neurology',
    icon: Brain,
    activeColor: 'text-violet-600',
    inactiveColor: 'text-violet-200',
    doctorName: 'Dr. Stephen Strange',
    doctorRole: 'Chief of Neurosurgery & Vascular Neurology',
    doctorDegree: 'MD, PhD • 22y Experience',
    experience: 'Complex Cerebrovascular Lead',
    image: '/doctor-images/doctor-strange.jpg',
    nextSlot: 'Today • 12:15 PM',
    metricLabel: 'Door-to-Needle',
    metricValue: '< 18m',
    metricSub: '✓ Micro-Surgical Excellence',
    bpm: 76,
    rhythm: 'Cerebral Perfusion Active',
  },
  {
    id: 'emergency',
    tabLabel: 'Trauma & ER',
    icon: Activity,
    activeColor: 'text-amber-600',
    inactiveColor: 'text-amber-200',
    doctorName: 'Dr. Thor Odinson',
    doctorRole: 'Head of Emergency & Resuscitation',
    doctorDegree: 'MD, FACEP • 25y Experience',
    experience: 'Level 1 Trauma Verified',
    image: '/doctor-images/thor.jpg',
    nextSlot: 'Immediate • 0m Wait',
    metricLabel: 'Triage Response',
    metricValue: '< 4m',
    metricSub: '⚡ Instant Defibrillation Desk',
    bpm: 82,
    rhythm: 'Rapid Resuscitation Active',
  },
  {
    id: 'pediatrics',
    tabLabel: 'Pediatrics',
    icon: Baby,
    activeColor: 'text-sky-600',
    inactiveColor: 'text-sky-200',
    doctorName: 'Dr. Peter Parker',
    doctorRole: 'Pediatric Care Lead & Adolescent Medicine',
    doctorDegree: 'MD, FAAP • 12y Experience',
    experience: 'Youth Health & Pediatrics',
    image: '/doctor-images/spider-man.jpg',
    nextSlot: 'Today • 02:00 PM',
    metricLabel: 'Family Trust',
    metricValue: '100%',
    metricSub: '✓ 5-Star Pediatric Wing',
    bpm: 68,
    rhythm: 'Neonatal & Pediatric Care',
  },
];

export const FeaturePanel: React.FC<FeaturePanelProps> = ({
  onWorkflowClick,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('cardiology');

  const currentSpecialty =
    SPECIALTIES.find((s) => s.id === activeTab) || SPECIALTIES[0];

  const handleBookDoctor = () => {
    if (onWorkflowClick) {
      onWorkflowClick();
    } else {
      navigate('/book-appointment');
    }
  };

  const handleViewAllDoctors = () => {
    navigate('/doctors');
  };

  return (
    <motion.div
      id="hero-clinical-console"
      initial={{ opacity: 0, x: 25, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[435px] flex flex-col space-y-3 bg-transparent border-0 shadow-none p-0 text-white select-none transform-gpu relative"
    >
      {/* Top Header: Live Clinical Command & Rating Pills with Borderless Transparent White Glass */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/25 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,25,70,0.12)] transition-all">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
          </span>
          <span className="text-[11.5px] font-mono font-bold tracking-wider text-white uppercase drop-shadow-[0_1px_2px_rgba(0,10,30,0.4)]">
            Live Clinical Desk
          </span>
          <span className="text-emerald-200 text-[9.5px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded drop-shadow-xs">
            24/7 ON-CALL
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/25 backdrop-blur-2xl text-[11.5px] font-bold text-white shadow-[0_4px_20px_rgba(0,25,70,0.12)] transition-all">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 drop-shadow-xs" />
          <span className="drop-shadow-[0_1px_2px_rgba(0,10,30,0.4)]">4.9</span>
          <span className="text-white/80 text-[10px] font-normal drop-shadow-xs">(1.4k+)</span>
        </div>
      </div>

      {/* Interactive Specialty Switcher Tabs (Borderless Transparent White Glass) */}
      <div>
        <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white/18 hover:bg-white/22 backdrop-blur-2xl shadow-[0_6px_20px_rgba(0,25,70,0.1)] transition-all">
          {SPECIALTIES.map((spec) => {
            const Icon = spec.icon;
            const isActive = activeTab === spec.id;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => setActiveTab(spec.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-slate-900 shadow-[0_4px_14px_rgba(255,255,255,0.5)] font-bold'
                    : 'text-white hover:text-white hover:bg-white/20 font-medium'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSpecialtyPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center mb-0.5">
                  <Icon className={`w-4 h-4 ${isActive ? spec.activeColor : spec.inactiveColor}`} />
                </span>
                <span className={`relative z-10 text-[11px] leading-tight tracking-tight ${isActive ? 'text-slate-900 font-bold' : 'text-white drop-shadow-[0_1px_2px_rgba(0,10,30,0.5)]'}`}>
                  {spec.tabLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Specialist Spotlight Card (Borderless Transparent White Glass) */}
      <div className="relative overflow-hidden rounded-2xl bg-white/20 hover:bg-white/25 p-3.5 sm:p-4 transition-all duration-200 backdrop-blur-2xl shadow-[0_8px_25px_rgba(0,25,70,0.12)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSpecialty.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3.5"
          >
            {/* Doctor Avatar with verified badge and active pulse */}
            <div className="relative flex-shrink-0">
              <img
                src={currentSpecialty.image}
                alt={currentSpecialty.doctorName}
                className="w-15 h-15 rounded-2xl object-cover object-[center_25%] shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-3 h-3 text-white" />
              </span>
            </div>

            {/* Doctor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[16px] sm:text-[17px] font-extrabold text-white truncate tracking-tight drop-shadow-[0_1px_3px_rgba(0,20,50,0.5)]">
                  {currentSpecialty.doctorName}
                </h4>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/30 text-white shadow-2xs">
                  Lead
                </span>
              </div>
              <p className="text-[12px] font-semibold text-sky-100 truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,20,50,0.4)]">
                {currentSpecialty.doctorRole}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/25 px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-md">
                  <Clock className="w-3 h-3 text-emerald-300" />
                  <span>{currentSpecialty.nextSlot}</span>
                </span>
                <span className="text-[11px] text-white/90 font-mono hidden sm:inline drop-shadow-[0_1px_2px_rgba(0,10,30,0.4)]">
                  {currentSpecialty.doctorDegree.split('•')[0]}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Live ECG Waveform & Heartbeat Telemetry (Borderless Transparent White Glass) */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-white/18 hover:bg-white/22 backdrop-blur-2xl shadow-[0_6px_20px_rgba(0,25,70,0.1)] transition-all">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
          <div className="flex items-center gap-1.5 text-white font-bold drop-shadow-[0_1px_2px_rgba(0,10,30,0.4)]">
            <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span className="tracking-wide">VITAL TELEMETRY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
            <span className="text-white/80 font-medium">PULSE:</span>
            <span className="text-emerald-300 font-extrabold tabular-nums drop-shadow-[0_1px_2px_rgba(0,10,30,0.4)]">
              {currentSpecialty.bpm} BPM
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* Animated ECG Waveform SVG */}
        <div className="relative h-6 w-full overflow-hidden">
          <svg
            viewBox="0 0 320 30"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ecgGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#34d399" stopOpacity="1" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
              </linearGradient>
              <filter id="ecgNeon" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Background static trace */}
            <path
              d="M 0,15 L 45,15 L 50,11 L 55,19 L 60,15 L 85,15 L 90,3 L 95,27 L 100,8 L 105,18 L 110,15 L 145,15 L 150,11 L 155,19 L 160,15 L 185,15 L 190,3 L 195,27 L 200,8 L 205,18 L 210,15 L 245,15 L 250,11 L 255,19 L 260,15 L 285,15 L 290,3 L 295,27 L 300,8 L 305,18 L 310,15 L 320,15"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1.3"
            />
            {/* Moving active pulse sweep */}
            <motion.path
              d="M 0,15 L 45,15 L 50,11 L 55,19 L 60,15 L 85,15 L 90,3 L 95,27 L 100,8 L 105,18 L 110,15 L 145,15 L 150,11 L 155,19 L 160,15 L 185,15 L 190,3 L 195,27 L 200,8 L 205,18 L 210,15 L 245,15 L 250,11 L 255,19 L 260,15 L 285,15 L 290,3 L 295,27 L 300,8 L 305,18 L 310,15 L 320,15"
              fill="none"
              stroke="url(#ecgGlowGrad)"
              strokeWidth="2.4"
              filter="url(#ecgNeon)"
              strokeDasharray="60 260"
              animate={{ strokeDashoffset: [320, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </div>
      </div>

      {/* Dual Key Metrics Pods (Borderless Transparent White Glass) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-white/18 hover:bg-white/22 backdrop-blur-2xl shadow-[0_6px_20px_rgba(0,25,70,0.1)] transition-all">
          <div className="text-[10px] uppercase tracking-wider font-mono text-white/80 font-bold drop-shadow-xs">
            {currentSpecialty.metricLabel}
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight mt-0.5 drop-shadow-[0_1px_3px_rgba(0,20,50,0.4)]">
            {currentSpecialty.metricValue}
          </div>
          <div className="text-[10.5px] text-emerald-200 font-semibold mt-0.5 truncate drop-shadow-xs">
            {currentSpecialty.metricSub}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/18 hover:bg-white/22 backdrop-blur-2xl shadow-[0_6px_20px_rgba(0,25,70,0.1)] transition-all">
          <div className="text-[10px] uppercase tracking-wider font-mono text-white/80 font-bold drop-shadow-xs">
            Door-to-Doctor
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight mt-0.5 drop-shadow-[0_1px_3px_rgba(0,20,50,0.4)]">
            &lt; 8 Mins
          </div>
          <div className="text-[10.5px] text-sky-100 font-semibold mt-0.5 drop-shadow-xs">
            ⚡ 24/7 Rapid Triage
          </div>
        </div>
      </div>

      {/* Primary Action Button: Book Doctor */}
      <motion.button
        id="feature-book-specialist-btn"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        onClick={handleBookDoctor}
        className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-[14px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_32px_rgba(56,189,248,0.35)] flex items-center justify-between group cursor-pointer transition-all duration-200 border-0"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Book Consultation</span>
        </span>
        <div className="flex items-center gap-1.5 text-slate-800 group-hover:text-slate-950 font-bold text-xs">
          <span>With {currentSpecialty.doctorName.split(' ')[1]}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.button>

      {/* Secondary Doctor Directory Link */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={handleViewAllDoctors}
          className="inline-flex items-center gap-1 text-[12px] font-bold text-white hover:text-sky-200 transition-colors cursor-pointer group drop-shadow-[0_1px_3px_rgba(0,20,50,0.5)]"
        >
          <span>Explore All 42 Medical Specialists</span>
          <ChevronRight className="w-3.5 h-3.5 text-sky-300 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
