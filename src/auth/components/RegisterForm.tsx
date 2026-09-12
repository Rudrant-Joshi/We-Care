import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, AlertCircle, Sparkles, Stethoscope, ArrowRight } from 'lucide-react';
import type { UserRole } from '../types';
import { ROLE_CONFIGS } from '../types';
import { useAuth } from '../AuthContext';

interface RegisterFormProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export function RegisterForm({
  activeRole,
  onRoleChange,
  onSwitchToLogin,
  onSuccess,
}: RegisterFormProps) {
  const { register } = useAuth();
  const config = ROLE_CONFIGS[activeRole];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('Neurology & Critical Care');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-sky-400', text: 'text-sky-300' };
    return { score: 4, label: 'Military-Grade', color: 'bg-emerald-400', text: 'text-emerald-300' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please provide a valid clinical or personal email.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('You must accept the HIPAA Compliance and Patient Data Terms.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: fullName,
      email,
      password,
      phone,
      role: activeRole,
      specialty: activeRole === 'doctor' ? specialty : undefined,
    });
    setIsLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setErrorMessage(result.error || 'Failed to initialize identity registration.');
    }
  };

  return (
    <div className="w-full flex flex-col justify-between py-2">
      {/* Form Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span 
            className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: config.primaryColor, color: config.primaryColor }} 
          />
          <span 
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: config.primaryColor }}
          >
            Create New Account
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Initialize Identity
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Join the quantum healthcare network with 256-bit neural encryption.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-5 p-1 rounded-2xl bg-white/5 border border-white/10 flex gap-1">
        {(['patient', 'doctor', 'caregiver'] as UserRole[]).map((r) => {
          const isSel = activeRole === r;
          const conf = ROLE_CONFIGS[r];
          return (
            <button
              type="button"
              key={r}
              onClick={() => onRoleChange(r)}
              className={`relative flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none text-center ${
                isSel ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isSel && (
                <motion.div
                  layoutId="register-role-pill"
                  className="absolute inset-0 rounded-xl bg-white/15 border border-white/20 shadow-md"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: conf.primaryColor }} />
                <span>{conf.title.split(' ')[0]}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Fields */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name & Phone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl holo-input text-xs text-white placeholder-slate-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Mobile Contact
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl holo-input text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.morgan@hospital.org"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl holo-input text-xs text-white placeholder-slate-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Doctor Specialty If Role is Doctor */}
        {activeRole === 'doctor' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Clinical Discipline / Board Certifications
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl holo-input text-xs text-white bg-slate-900 outline-none cursor-pointer"
              >
                <option value="Cardiology & Vascular Medicine">Cardiology & Vascular Medicine</option>
                <option value="Neurology & Brain Sciences">Neurology & Brain Sciences</option>
                <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                <option value="Orthopedic Surgery">Orthopedic Surgery</option>
                <option value="Oncology & Genetic Therapy">Oncology & Genetic Therapy</option>
                <option value="General & Emergency Medicine">General & Emergency Medicine</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Passwords (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Create Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl holo-input text-xs text-white placeholder-slate-500 outline-none font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full pl-9 pr-9 py-2.5 rounded-xl holo-input text-xs text-white placeholder-slate-500 outline-none font-mono ${
                  confirmPassword && confirmPassword === password ? 'border-emerald-500/60' : ''
                }`}
                required
              />
              {confirmPassword && confirmPassword === password && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Password Strength Meter */}
        {password && (
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">ENCRYPTION RESISTANCE:</span>
              <span className={`font-bold ${passwordStrength.text || 'text-white'}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full rounded-full transition-all duration-300 ${
                    passwordStrength.score >= step ? passwordStrength.color : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Terms & Consent */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500/30"
          />
          <span className="text-[11px] text-slate-400 leading-relaxed">
            I consent to encrypted storage under HIPAA and GDPR telemetry regulations, and accept the{' '}
            <span className="text-sky-300 underline">WeCare Clinical Trust Standards</span>.
          </span>
        </label>

        {/* Submit Registration Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r ${config.accentGradient}`}
          style={{
            boxShadow: `0 8px 25px -4px ${config.glowColor}`,
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Provisioning Digital Passkey...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Complete Enrollment</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Switch to Login Footer */}
      <div className="mt-5 text-center text-xs text-slate-400">
        Already registered in the network?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-white hover:underline cursor-pointer inline-flex items-center gap-1"
          style={{ color: config.primaryColor }}
        >
          Sign In
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
