/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroHeadline } from '../components/HeroHeadline';
import { FeaturePanel } from '../components/FeaturePanel';
import BackgroundVideo from '../components/BackgroundVideo';
import { LiquidGlassFilter } from '../components/LiquidGlassFilter';
import { DemoModal } from '../components/DemoModal';
import type { LiquidGlassConfig } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'demo' | 'learn'>('demo');

  // Liquid glass configuration state
  const [glassConfig] = useState<LiquidGlassConfig>({
    blurAmount: 24,
    glassOpacity: 0.08,
    refractionIntensity: 14,
    blueGlowIntensity: 1.0,
    fluidAnimation: true,
    chromaticShift: true,
  });

  const handleOpenDemo = () => {
    setModalMode('demo');
    setModalOpen(true);
  };

  const handleOpenLearn = () => {
    setModalMode('learn');
    setModalOpen(true);
  };

  const handleBookAppointment = () => {
    navigate('/book-appointment');
  };

  return (
    <main
      id="vortiq-app-root"
      className="relative min-h-screen lg:h-screen lg:max-h-screen w-full bg-transparent text-white overflow-y-auto lg:overflow-hidden flex flex-col justify-between selection:bg-sky-500 selection:text-black font-sans select-none"
    >
      {/* Interactive Doctor Background Video */}
      <BackgroundVideo />

      {/* SVG Optical Refraction Filters */}
      <LiquidGlassFilter displacementScale={glassConfig.refractionIntensity} />

      {/* Soft Ambient Light Gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(0,30,80,0.08)_100%)]"
      />

      {/* Top Navigation Bar */}
      <Navbar onBookDemoClick={handleBookAppointment} />

      {/* ====================================================================
          DOCTOR SCREEN HERO (Non-Scrollable Viewport Lock)
          ==================================================================== */}
      <div
        id="hero-content-wrapper"
        className="relative z-20 w-full flex-1 max-w-[1720px] mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-4 md:py-8 flex flex-col justify-center items-center overflow-hidden"
      >
        {/* Main Columns */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20 my-auto">
          {/* Left Column: Headline & Action Buttons */}
          <div className="w-full lg:max-w-lg xl:max-w-xl flex justify-center lg:justify-start">
            <HeroHeadline
              onBookDemo={handleBookAppointment}
              onLearnMore={handleOpenLearn}
            />
          </div>

          {/* Right Column: AI Workflow & Smart Agents Feature Stack */}
          <div className="w-full lg:max-w-md xl:max-w-[440px] flex justify-center lg:justify-end">
            <FeaturePanel
              onWorkflowClick={handleBookAppointment}
              onAgentsClick={handleOpenDemo}
            />
          </div>
        </div>
      </div>

      {/* Interactive Demo / Consultation Modal */}
      <DemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
      />
    </main>
  );
}
