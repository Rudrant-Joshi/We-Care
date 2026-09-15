/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { DoctorsBento } from "../components/ui/doctors-bento";
import Demo from "@/components/ui/demo";

export default function DoctorsPage() {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate("/book-appointment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      id="vortiq-doctors-page"
      className="relative min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between font-sans overflow-x-clip"
    >
      {/* Modern Medical Engineering Subtle Architectural Dot Grid Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-35"
      />

      {/* Section 1: Template Implementation for Doctors with Non-Sticky Navbar */}
      <section className="relative z-20 w-full">
        <Demo
          word="DOCTORS"
          navbar={
            <div className="bg-white/95 backdrop-blur-md w-full relative z-40 border-b border-slate-200/90 shadow-xs">
              <Navbar onBookDemoClick={handleBookAppointment} />
            </div>
          }
          primaryButton={{
            label: "Browse Doctor Roster ↓",
            onClick: (e) => {
              e.preventDefault();
              document
                .getElementById("doctors-roster")
                ?.scrollIntoView({ behavior: "smooth" });
            },
          }}
          secondaryButton={{
            label: "Book Appointment →",
            onClick: (e) => {
              e.preventDefault();
              handleBookAppointment();
            },
          }}
        />
      </section>

      {/* Main Dedicated Doctors Bento Section with Scroll Reveal */}
      <motion.div
        id="doctors-roster"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 flex-1 scroll-mt-28"
      >
        <DoctorsBento onBookConsultation={handleBookAppointment} />
      </motion.div>

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
