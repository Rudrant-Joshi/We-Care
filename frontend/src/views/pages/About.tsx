/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AboutBento } from '../components/ui/about-bento';

export default function AboutPage() {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/book-appointment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main
      id="vortiq-about-page"
      className="relative min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between font-sans overflow-x-clip"
    >

      {/* Modern Medical Engineering Subtle Architectural Dot Grid Canvas */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40" 
      />

      {/* Clean White Navbar Header Shell matching About section */}
      <div className="bg-white/95 backdrop-blur-md w-full relative z-40 border-b border-slate-200/90 shadow-xs">
        <Navbar onBookDemoClick={handleBookAppointment} />
      </div>

      {/* Main Dedicated About Bento Section with Slate-50 Background */}
      <div className="relative z-20 flex-1">
        <AboutBento onBookConsultation={handleBookAppointment} />
      </div>

      {/* Light Clean Footer matching Slate-50 background */}
      <footer className="relative z-20 w-full px-4 sm:px-8 md:px-14 py-6 flex flex-col sm:flex-row items-center justify-between text-[11.5px] font-mono text-slate-500 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <span>LATITUDE: 37.7749° N</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>LONGITUDE: 122.4194° W</span>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0 font-medium">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-slate-700">WE CARE PROTOCOL OPERATIONAL</span>
        </div>
      </footer>
    </main>
  );
}
