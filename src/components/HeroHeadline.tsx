import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface HeroHeadlineProps {
  onBookDemo?: () => void;
  onLearnMore?: () => void;
}

export const HeroHeadline: React.FC<HeroHeadlineProps> = ({ 
  onBookDemo, 
  onLearnMore 
}) => {
  return (
    <div id="hero-headline-container" className="flex flex-col justify-center max-w-xl z-20">
      {/* Subtle indicator pill */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-xl mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
      >
        <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
        <span className="text-[12px] font-semibold tracking-wider uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Your Health, Our Sacred Mission</span>
      </motion.div>

      {/* Main Massive Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-medium text-white leading-[1.08] tracking-[-0.03em] mb-8 select-none drop-shadow-[0_2px_8px_rgba(0,10,30,0.35)]"
      >
        <span className="block font-semibold">World-Class</span>
        <span className="block text-white">Healthcare,</span>
        <span className="block bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent font-bold">
          Delivered with Care
        </span>
      </motion.h1>

      {/* CTAs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="flex flex-wrap items-center gap-4 pt-2"
      >
        {/* Primary Pill: Book Appointment */}
        <motion.button
          id="hero-cta-book-demo"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onBookDemo}
          className="relative group px-8 py-3.5 rounded-full text-[15px] font-bold text-slate-900 bg-white shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_32px_rgba(56,189,248,0.35)] flex items-center gap-2.5 cursor-pointer transform-gpu transition-all"
        >
          <span>Book Appointment</span>
          <ArrowUpRight className="w-4 h-4 text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>

        {/* Secondary Pill: Learn More (Liquid Glass) */}
        <motion.button
          id="hero-cta-learn-more"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={onLearnMore}
          className="relative px-8 py-3.5 rounded-full text-[15px] font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-2xl shadow-[0_8px_25px_rgba(0,25,70,0.15)] flex items-center gap-2 cursor-pointer transform-gpu transition-all"
        >
          <span>Learn More</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
