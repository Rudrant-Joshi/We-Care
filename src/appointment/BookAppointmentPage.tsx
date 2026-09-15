/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  Stethoscope, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { AppointmentBento } from './AppointmentBento';
import { useAuth } from '../auth';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { currentUser, demoLogin } = useAuth();

  const handleBookAppointment = () => {
    navigate('/book-appointment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoAccess = () => {
    demoLogin('patient');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main
      id="vortiq-book-appointment-page"
      className="relative min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between font-sans overflow-x-clip"
    >

      {/* Modern Medical Engineering Subtle Architectural Dot Grid Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-35"
      />

      {/* Clean White Navbar Header Shell */}
      <div className="bg-white/95 backdrop-blur-md w-full relative z-40 border-b border-slate-200/90 shadow-xs">
        <Navbar onBookDemoClick={handleBookAppointment} />
      </div>

      {/* Main Dedicated Book Appointment Bento Section or Auth Gate */}
      <div className="relative z-20 flex-1">
        {currentUser ? (
          <AppointmentBento />
        ) : (
          <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden"
            >
              {/* Subtle green ambient floating aura matching template */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#135940]/15 rounded-full blur-3xl pointer-events-none animate-blob" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1b7454]/15 rounded-full blur-3xl pointer-events-none animate-blob [animation-delay:4s]" />

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Security Badge */}
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#135940] text-xs font-mono font-bold uppercase tracking-wider mb-6 cursor-default"
                >
                  <Lock className="w-3.5 h-3.5 text-[#135940] animate-pulse" />
                  <span>AUTHENTICATION REQUIRED BEFORE BOOKING</span>
                </motion.div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4 max-w-2xl">
                  Sign In to Reserve Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135940] via-[#1b7454] to-emerald-600">
                    Specialist Appointment
                  </span>
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
                  To ensure verified patient scheduling, HIPAA-compliant medical record security, and immediate digital clinical pass generation, please sign in or register your account before selecting a consultation slot.
                </p>

                {/* Main Action Buttons with Micro-Animations */}
                <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 24px -4px rgba(19, 89, 64, 0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                    onClick={() => navigate('/login?redirect=/book-appointment')}
                    className="w-full sm:w-1/2 h-12 rounded-xl bg-[#135940] hover:bg-[#1b7454] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#135940]/25 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, y: -1, borderColor: "#a7f3d0" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                    onClick={() => navigate('/register?redirect=/book-appointment')}
                    className="w-full sm:w-1/2 h-12 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-[#135940]" />
                    <span>Create Account</span>
                  </motion.button>
                </div>

                {/* Instant Demo Access Pill with Spring Hover */}
                <div className="mt-5 pt-4 border-t border-slate-100 w-full flex flex-col items-center">
                  <p className="text-xs text-slate-500 mb-2">
                    Reviewing the application? Test booking without typing credentials:
                  </p>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={handleDemoAccess}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-[#135940] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#135940]" />
                    <span>Instant Demo Patient Access (Alex Morgan)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Value Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 w-full text-left pt-6 border-t border-slate-100">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                      <Stethoscope className="w-4 h-4 text-[#135940]" />
                      <span>12 Specialties</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-snug">
                      Cardiology, Neurology, Orthopedics, Oncology & Trauma care.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Immediate Pass</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-snug">
                      Instant appointment confirmation with QR clinical triage code.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <span>Encrypted Health</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-snug">
                      Protected Firebase authentication and secure medical record storage.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          </section>
        )}
      </div>

      {/* Light Clean Footer */}
      <footer className="relative z-20 w-full px-4 sm:px-8 md:px-14 py-6 flex flex-col sm:flex-row items-center justify-between text-[11.5px] font-mono text-slate-500 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <span>LATITUDE: 37.7749° N</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>LONGITUDE: 122.4194° W</span>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0 font-medium">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-slate-700">WE CARE CLINICAL SCHEDULING OPERATIONAL</span>
        </div>
      </footer>
    </main>
  );
}
