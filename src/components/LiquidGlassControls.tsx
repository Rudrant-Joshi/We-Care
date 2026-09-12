import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Copy, Check, Droplets } from 'lucide-react';
import type { LiquidGlassConfig } from '../types';

interface LiquidGlassControlsProps {
  config: LiquidGlassConfig;
  onChange: (config: LiquidGlassConfig) => void;
}

export const LiquidGlassControls = ({
  config,
  onChange,
}: LiquidGlassControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCss = () => {
    const cssString = `/* Liquid Glass Effect */
.liquid-glass {
  background: radial-gradient(
    120% 120% at 30% 20%,
    rgba(255, 255, 255, ${config.glassOpacity.toFixed(2)}) 0%,
    rgba(255, 255, 255, 0.02) 40%,
    rgba(255, 110, 0, 0.04) 80%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: blur(${config.blurAmount}px) saturate(180%);
  -webkit-backdrop-filter: blur(${config.blurAmount}px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 1px 0 rgba(0, 0, 0, 0.6),
    0 24px 48px -12px rgba(0, 0, 0, 0.8),
    0 0 30px -5px rgba(255, 110, 0, ${(config.amberGlowIntensity ?? 1.0) * 0.15});
}`;
    navigator.clipboard.writeText(cssString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="liquid-glass-controller" className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 w-80 p-5 rounded-2xl liquid-glass-panel border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-sm font-semibold tracking-wide">Liquid Glass Tuner</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 pt-3.5 text-xs">
              {/* Blur slider */}
              <div>
                <div className="flex justify-between text-white/70 mb-1.5">
                  <span>Glass Blur</span>
                  <span className="font-mono text-orange-300">{config.blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={config.blurAmount}
                  onChange={(e) => onChange({ ...config, blurAmount: Number(e.target.value) })}
                  className="w-full accent-orange-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Refraction Scale */}
              <div>
                <div className="flex justify-between text-white/70 mb-1.5">
                  <span>Liquid Refraction</span>
                  <span className="font-mono text-orange-300">{config.refractionIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="28"
                  value={config.refractionIntensity}
                  onChange={(e) => onChange({ ...config, refractionIntensity: Number(e.target.value) })}
                  className="w-full accent-orange-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Amber Visor Caustic Glow */}
              <div>
                <div className="flex justify-between text-white/70 mb-1.5">
                  <span>Visor Amber Aura</span>
                  <span className="font-mono text-orange-300">{Math.round((config.amberGlowIntensity ?? 1.0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.8"
                  step="0.1"
                  value={config.amberGlowIntensity ?? 1.0}
                  onChange={(e) => onChange({ ...config, amberGlowIntensity: Number(e.target.value) })}
                  className="w-full accent-orange-500 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <span className="text-white/70">Fluid Sweep Wave</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, fluidAnimation: !config.fluidAnimation })}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    config.fluidAnimation ? 'bg-orange-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                      config.fluidAnimation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/70">Chromatic Dispersion</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, chromaticShift: !config.chromaticShift })}
                  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    config.chromaticShift ? 'bg-orange-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                      config.chromaticShift ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Copy CSS Button */}
              <button
                onClick={handleCopyCss}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied Liquid Glass CSS!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-orange-400" />
                    <span>Copy Liquid Glass CSS</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Pill */}
      <button
        id="toggle-liquid-glass-settings"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full liquid-glass-panel border border-white/25 hover:border-orange-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer text-xs font-semibold tracking-wide text-white transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
        </span>
        <Droplets className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform" />
        <span>Liquid Glass FX</span>
        <Sliders className="w-3.5 h-3.5 text-white/60 ml-0.5" />
      </button>
    </div>
  );
};
