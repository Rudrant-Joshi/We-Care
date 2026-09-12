/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MyAppointmentsBento } from './MyAppointmentsBento';

export default function AppointmentsPage() {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/book-appointment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main
      id="vortiq-appointments-page"
      className="relative min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between font-sans overflow-x-clip"
    >

      {/* Modern Medical Engineering Subtle Architectural Dot Grid Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-35"
      />

      {/* Dynamic Ambient Colorful Gradient Orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-20 w-[580px] h-[580px] rounded-full bg-gradient-to-br from-blue-400/20 via-sky-300/15 to-transparent blur-3xl transform-gpu" />
        <div className="absolute top-1/4 -right-24 w-[620px] h-[620px] rounded-full bg-gradient-to-bl from-purple-400/15 via-indigo-300/12 to-transparent blur-3xl transform-gpu" />
        <div className="absolute bottom-20 left-1/4 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-teal-300/10 to-transparent blur-3xl transform-gpu" />
        <div className="absolute top-2/3 right-1/3 w-[450px] h-[450px] rounded-full bg-gradient-to-r from-amber-400/10 via-orange-300/8 to-transparent blur-3xl transform-gpu" />
      </div>

      {/* Clean White Navbar Header Shell */}
      <div className="bg-white/95 backdrop-blur-md w-full relative z-40 border-b border-slate-200/90 shadow-xs">
        <Navbar onBookDemoClick={handleBookAppointment} />
      </div>

      {/* Main Dedicated My Appointments Bento Section */}
      <div className="relative z-20 flex-1">
        <MyAppointmentsBento />
      </div>

      {/* Light Clean Footer matching Slate-50 background */}
      <footer className="relative z-20 w-full px-8 md:px-14 py-6 flex flex-col sm:flex-row items-center justify-between text-[11.5px] font-mono text-slate-500 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <span>LATITUDE: 37.7749° N</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>LONGITUDE: 122.4194° W</span>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0 font-medium">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-slate-700">WE CARE PATIENT SCHEDULE REPOSITORY OPERATIONAL</span>
        </div>
      </footer>
    </main>
  );
}
