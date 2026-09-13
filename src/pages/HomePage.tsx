import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ImageStreamHero } from '@/components/ui/image-stream-hero';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const HOSPITAL_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=80',
    alt: 'Surgical team performing precision procedure in operating theater',
  },
  {
    src: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80',
    alt: 'Modern hospital inpatient recovery room with adjustable care bed',
  },
  {
    src: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80',
    alt: 'Clinical nurse preparing sterile hospital injection and medication',
  },
  {
    src: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=800&q=80',
    alt: 'High-tech hospital CT and MRI diagnostic imaging scanner suite',
  },
  {
    src: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=800&q=80',
    alt: 'Doctor performing clinical checkup and diagnostic blood pressure test',
  },
  {
    src: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
    alt: 'Hospital recovery inpatient ward with multiple care beds and curtains',
  },
  {
    src: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    alt: 'State-of-the-art sterile surgical operating room and overhead lamps',
  },
  {
    src: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    alt: 'Compassionate hospital bedside nursing and patient support',
  },
  {
    src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    alt: 'Modern hospital arrival reception and patient registration lounge',
  },
  {
    src: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    alt: 'Attending medical specialist with stethoscope at hospital clinic',
  },
  {
    src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    alt: 'Physician reviewing digital health telemetry records and stethoscope',
  },
  {
    src: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
    alt: 'Hospital clinical pharmaceutical vials and patient treatment syringe',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-white text-slate-900 flex flex-col justify-between overflow-hidden select-none">
      {/* Navigation Bar in White Theme */}
      <div className="relative z-30 w-full border-b border-slate-100/80 bg-white/90 backdrop-blur-md">
        <Navbar />
      </div>

      {/* Image Stream Hero Corridor with Diverse Hospital Photography */}
      <ImageStreamHero
        images={HOSPITAL_IMAGES}
        cards={9}
        speed={18}
        axis={54}
        className="relative z-10 w-full flex-1 min-h-[calc(100vh-80px)] flex flex-col items-center justify-between py-6 sm:py-10 text-center bg-white"
      >
        <div className="relative z-10 flex h-full flex-1 flex-col items-center justify-between py-2 sm:py-6 text-center pointer-events-none">
          {/* Top Section: Hospital Headline, Trust Badge & Action CTAs */}
          <div className="px-6 pointer-events-auto flex flex-col items-center max-w-4xl mx-auto mt-2">
            {/* JCI Quality & Clinical Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-4 shadow-xs backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span>JCI Accredited Hospital • 24/7 Emergency & Specialty Care</span>
            </div>

            {/* Main Hospital Headline */}
            <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              World-Class Healthcare,
              <br />
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                Centered Around You.
              </span>
            </h1>

            {/* Interactive Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-5">
              <button
                id="home-book-appointment-btn"
                onClick={() => navigate('/book-appointment')}
                className="group px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                id="home-specialists-btn"
                onClick={() => navigate('/doctors')}
                className="px-7 py-3 rounded-full bg-white/95 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-semibold border border-slate-200 shadow-sm transition-all hover:scale-[1.03] active:scale-[0.98] backdrop-blur-xs cursor-pointer"
              >
                Meet Our Specialists
              </button>
            </div>
          </div>

          {/* Bottom Section: Clinical Trust Signals & Description */}
          <div className="max-w-2xl text-balance px-6 pointer-events-auto mt-auto pt-6 flex flex-col items-center">
            {/* Three Pillar Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600 mb-3">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>150+ Board-Certified Specialists</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Wait Emergency Triage</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>99.4% Patient Recovery Score</span>
              </span>
            </div>

            {/* Narrative Hospital Description */}
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              From advanced robotic surgery to compassionate bedside nursing and routine family wellness, WeCare Hospital provides continuous, specialized medical excellence 24 hours a day.
            </p>
          </div>
        </div>
      </ImageStreamHero>
    </div>
  );
}
