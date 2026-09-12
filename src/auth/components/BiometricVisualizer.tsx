import { motion } from 'motion/react';
import { ShieldCheck, Activity, Lock, Stethoscope, User, Fingerprint } from 'lucide-react';
import type { UserRole } from '../types';
import { ROLE_CONFIGS } from '../types';

interface BiometricVisualizerProps {
  activeRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
}

export function BiometricVisualizer({ activeRole, onRoleSelect }: BiometricVisualizerProps) {
  const config = ROLE_CONFIGS[activeRole];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-12 overflow-hidden select-none">
      {/* Dynamic Ambient Backlight glow based on selected role */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at 50% 45%, ${config.glowColor} 0%, rgba(15, 23, 42, 0) 70%)`,
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Subtle Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Header Information & Protocol Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-widest text-white/50 uppercase">
              WECARE IDENTITY MATRIX
            </div>
            <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
              <span>ZERO-TRUST TELEMETRY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        <motion.div
          key={config.securityClearance}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border ${config.badgeBg}`}
        >
          {config.securityClearance}
        </motion.div>
      </div>

      {/* Central Holographic Core & Orbital Rings */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          
          {/* Outer Gyro Ring 1 */}
          <div className="absolute inset-0 rounded-full border border-white/10 animate-orbit-slow pointer-events-none">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor]"
              style={{ backgroundColor: config.primaryColor, color: config.primaryColor }}
            />
            <div className="absolute bottom-2 right-12 w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>

          {/* Middle Counter-Rotating Ring 2 */}
          <div className="absolute inset-6 rounded-full border border-dashed border-white/20 animate-orbit-reverse pointer-events-none">
            <div 
              className="absolute bottom-0 right-1/2 translate-x-1/2 w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: config.primaryColor, color: config.primaryColor }}
            />
          </div>

          {/* Inner High-Speed Gyro Ring 3 */}
          <div className="absolute inset-14 rounded-full border border-white/15 animate-orbit-fast pointer-events-none">
            <div className="absolute top-2 left-6 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
          </div>

          {/* Core Central Biometric Glass Orb */}
          <motion.div
            layout
            className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center text-center p-3 holo-glass-card shadow-[0_0_45px_rgba(0,0,0,0.8)] border border-white/25"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            {/* Pulsing inner aura */}
            <motion.div
              animate={{
                scale: [0.95, 1.08, 0.95],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full blur-lg -z-10"
              style={{ backgroundColor: config.primaryColor }}
            />

            {/* Role Icon */}
            <div 
              className="p-3 rounded-2xl mb-1 bg-white/10 backdrop-blur-md border border-white/20"
              style={{ color: config.primaryColor }}
            >
              {activeRole === 'patient' && <User className="w-8 h-8" />}
              {activeRole === 'doctor' && <Stethoscope className="w-8 h-8" />}
              {activeRole === 'caregiver' && <ShieldCheck className="w-8 h-8" />}
            </div>

            <span className="text-xs font-bold text-white tracking-wide drop-shadow-md">
              {config.title.split(' ')[0]}
            </span>
            <span className="text-[10px] font-mono text-white/60 tracking-wider">
              ONLINE
            </span>
          </motion.div>

          {/* Floating Live Telemetry Badge (Top Right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute -top-2 -right-4 px-3 py-1.5 rounded-xl holo-glass-card border border-white/15 flex items-center gap-2 shadow-lg backdrop-blur-xl"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[9px] font-mono text-white/50 leading-none">BIOMETRIC PULSE</div>
              <div className="text-[11px] font-mono font-bold text-emerald-300">72 BPM NORMAL</div>
            </div>
          </motion.div>

          {/* Floating Encryption Badge (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-2 -left-4 px-3 py-1.5 rounded-xl holo-glass-card border border-white/15 flex items-center gap-2 shadow-lg backdrop-blur-xl"
          >
            <Fingerprint className="w-3.5 h-3.5 text-sky-400" />
            <div className="text-left">
              <div className="text-[9px] font-mono text-white/50 leading-none">SECURITY SHIELD</div>
              <div className="text-[11px] font-mono font-bold text-sky-300">AES-256 VAULT</div>
            </div>
          </motion.div>
        </div>

        {/* Live ECG Heartbeat Waveform SVG */}
        <div className="w-full max-w-sm mt-8 px-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/60 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SYNCHRONOUS VITALS
            </span>
            <span className="tracking-wider">0.02ms LATENCY</span>
          </div>

          <div className="relative h-12 w-full rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center px-2">
            <svg className="w-full h-10 stroke-current" viewBox="0 0 400 60" fill="none">
              <path
                d="M 0 30 L 70 30 L 80 10 L 90 50 L 100 25 L 110 32 L 120 30 L 210 30 L 220 10 L 230 50 L 240 25 L 250 32 L 260 30 L 350 30 L 360 10 L 370 50 L 380 25 L 390 32 L 400 30"
                className="animate-ecg-pulse"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: config.primaryColor }}
              />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Role Navigation Tiles */}
      <div className="relative z-10 pt-4 border-t border-white/10">
        <div className="text-[11px] font-mono tracking-wider text-white/60 uppercase mb-3 flex items-center justify-between">
          <span>SELECT ACCESS LEVEL</span>
          <span className="text-white/40">3 PORTALS AVAILABLE</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((role) => {
            const roleConf = ROLE_CONFIGS[role];
            const isSelected = activeRole === role;

            return (
              <button
                key={role}
                onClick={() => onRoleSelect(role)}
                className={`relative p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white/15 border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selected-role-halo"
                    className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
                    style={{ borderColor: roleConf.primaryColor }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <div 
                  className="text-xs font-bold truncate flex items-center gap-1.5"
                  style={{ color: isSelected ? roleConf.primaryColor : '#ffffff' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: roleConf.primaryColor }} />
                  {roleConf.title.split(' ')[0]}
                </div>
                <div className="text-[10px] text-white/50 truncate mt-0.5">
                  {role === 'patient' && 'Personal Care'}
                  {role === 'doctor' && 'Clinician Hub'}
                  {role === 'caregiver' && 'Family Proxy'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
