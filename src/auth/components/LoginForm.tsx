import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import type { UserRole } from '../types';
import { ROLE_CONFIGS } from '../types';
import { useAuth, DEMO_USERS } from '../AuthContext';

interface LoginFormProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export function LoginForm({
  activeRole,
  onRoleChange: _onRoleChange,
  onSwitchToRegister,
  onSuccess,
}: LoginFormProps) {
  const { login, demoLogin } = useAuth();
  const config = ROLE_CONFIGS[activeRole];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, activeRole);
    setIsLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    demoLogin(role);
    onSuccess();
  };

  return (
    <div className="w-full flex flex-col justify-between py-2">
      {/* Form Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: config.primaryColor, color: config.primaryColor }} 
          />
          <span 
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: config.primaryColor }}
          >
            {config.title}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Sign in to view your encrypted telemetry, test results, and care timelines.
        </p>
      </div>

      {/* Quick 1-Click Demo Personas */}
      <div className="mb-6 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
        <div className="flex items-center justify-between mb-2.5 text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1-CLICK DEMO ACCESS
          </span>
          <span className="text-[10px] text-slate-400">Instant test</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['patient', 'doctor', 'caregiver'] as UserRole[]).map((r) => {
            const demo = DEMO_USERS[r];
            const isCur = activeRole === r;
            return (
              <button
                type="button"
                key={r}
                onClick={() => handleQuickDemo(r)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all text-center truncate cursor-pointer ${
                  isCur
                    ? 'bg-white/20 text-white border border-white/30 shadow-md font-semibold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
                title={`Quick Sign In as ${demo.name}`}
              >
                {r === 'patient' && 'Patient Alex'}
                {r === 'doctor' && 'Dr. Bennett'}
                {r === 'caregiver' && 'Elena (Care)'}
              </button>
            );
          })}
        </div>
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
            Clinical or Registered Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.morgan@healthmail.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl holo-input text-sm text-white placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300 tracking-wide">
              Security Key / Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              Forgot Key?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-3 rounded-xl holo-input text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Security Badge */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500/30"
            />
            <span className="text-xs text-slate-400">Trust this station for 30 days</span>
          </label>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            SSL Encrypted
          </div>
        </div>

        {/* Submit Button */}
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
              <span>Authenticating Telemetry...</span>
            </div>
          ) : (
            <>
              <span>Authorize & Enter Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Social / SSO Options */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="text-center mb-3">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            OR VERIFY WITH IDENTITY PROVIDER
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleQuickDemo('patient')}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Google Health</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('doctor')}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Govt / NHS Pass</span>
          </button>
        </div>
      </div>

      {/* Switch to Register footer */}
      <div className="mt-6 text-center text-xs text-slate-400">
        New to WeCare Cybernetic Health?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-bold text-white hover:underline cursor-pointer inline-flex items-center gap-1"
          style={{ color: config.primaryColor }}
        >
          Create an Account
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-6 rounded-3xl holo-glass-card border border-white/20 shadow-2xl text-left"
            >
              <h3 className="text-xl font-bold text-white mb-2">Reset Biometric Passkey</h3>
              <p className="text-xs text-slate-300 mb-4">
                Enter your verified email or medical ID. We will transmit an encrypted one-time access token.
              </p>

              {forgotSent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col items-center text-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <p className="font-semibold">Recovery Dispatch Sent!</p>
                  <p className="text-emerald-200/80 text-[11px]">
                    Check your inbox or hospital SMS for the verification sequence.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSent(false);
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter registered email..."
                    className="w-full px-4 py-3 rounded-xl holo-input text-sm text-white placeholder-slate-500 outline-none"
                    defaultValue={email}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="w-1/2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotSent(true)}
                      className="w-1/2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Send Token
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
