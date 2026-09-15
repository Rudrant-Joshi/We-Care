/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { DemoModal } from '../components/DemoModal';
import { MyAppointmentsBento } from './MyAppointmentsBento';

export default function AppointmentPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'demo' | 'learn'>('demo');

  const handleOpenDemo = () => {
    setModalMode('demo');
    setModalOpen(true);
  };

  return (
    <main
      id="vortiq-appointment-page"
      className="relative min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between font-sans overflow-x-clip"
    >

      {/* Modern Medical Engineering Subtle Architectural Dot Grid Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-35"
      />

      {/* Clean White Navbar Header Shell */}
      <div className="bg-white/95 backdrop-blur-md w-full relative z-40 border-b border-slate-200/90 shadow-xs">
        <Navbar onBookDemoClick={handleOpenDemo} />
      </div>

      {/* Main Dedicated My Appointments Bento Section */}
      <div className="relative z-20 flex-1">
        <MyAppointmentsBento />
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
          <span className="text-slate-700">WE CARE CLINICAL SCHEDULING OPERATIONAL</span>
        </div>
      </footer>

      {/* Appointment Booking Fallback Modal */}
      <DemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
      />
    </main>
  );
}
