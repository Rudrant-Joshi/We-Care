"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HeartPulse,
  User,
  ArrowLeft,
  ArrowRight,
  Home,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

export interface AuthSectionOneProps {
  initialMode?: "register" | "login";
  redirectUrl?: string;
  isBookingRedirect?: boolean;
  onSuccess?: (user?: any) => void;
  brandTitle?: string;
  brandSubtitle?: string;
}

export default function AuthSectionOne({
  initialMode = "login",
  redirectUrl: _redirectUrl = "/appointments",
  isBookingRedirect = false,
  onSuccess,
  brandTitle = "Book Appointments,\nCare Faster",
  brandSubtitle = "Select your medical specialist, choose a convenient time slot, and manage your family's hospital care.",
}: AuthSectionOneProps = {}) {
  const [mode, setMode] = useState<"register" | "login">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const handleCopyDomain = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.hostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const { login, register, loginWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const isAdmin = email.trim().toLowerCase() === "rudrant.joshi@gmail.com";
        const res = await login(email, password, isAdmin ? "admin" : "patient");
        if (!res.success) {
          setErrorMsg(res.error || "Failed to sign in. Please verify your credentials.");
          setIsSubmitting(false);
          return;
        }
      } else {
        const cleanName = fullName.trim();
        if (!cleanName) {
          setErrorMsg("Please enter your full name.");
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes("@")) {
          setErrorMsg("Please enter a valid email address.");
          setIsSubmitting(false);
          return;
        }
        if (!password || password.length < 6) {
          setErrorMsg("Password must be at least 6 characters long.");
          setIsSubmitting(false);
          return;
        }
        const res = await register({
          name: cleanName,
          email: email.trim(),
          password,
          role: "patient",
        });
        if (!res.success) {
          setErrorMsg(res.error || "Failed to create account. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      const isAdmin =
        email.trim().toLowerCase() === "rudrant.joshi@gmail.com" ||
        email.trim().toLowerCase().includes("admin");

      if (isAdmin) {
        setSuccessMsg("Chief Admin credentials verified! Directly opening Admin Panel...");
      } else {
        setSuccessMsg(
          mode === "register"
            ? isBookingRedirect
              ? "Account created! Redirecting to appointment booking..."
              : "Account created! Redirecting to your dashboard..."
            : isBookingRedirect
              ? "Signed in! Redirecting to appointment booking..."
              : "Signed in! Redirecting to your appointments..."
        );
      }

      if (onSuccess) {
        setTimeout(() => {
          let authedUser: any = null;
          try {
            const saved = localStorage.getItem("wecare_authenticated_user_v1");
            if (saved) authedUser = JSON.parse(saved);
          } catch {}

          onSuccess(
            authedUser || {
              email: email.trim(),
              name: mode === "register" ? fullName.trim() : email.split("@")[0],
              role: isAdmin ? "admin" : "patient",
            }
          );
        }, 350);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleSubmitting(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || "Google sign-in could not be completed.");
        setIsGoogleSubmitting(false);
        return;
      }

      let googleUser: any = null;
      try {
        const saved = localStorage.getItem("wecare_authenticated_user_v1");
        if (saved) googleUser = JSON.parse(saved);
      } catch {}

      const isGoogleAdmin =
        googleUser?.role === "admin" ||
        googleUser?.email?.toLowerCase() === "rudrant.joshi@gmail.com" ||
        googleUser?.email?.toLowerCase().includes("admin");

      if (isGoogleAdmin) {
        setSuccessMsg("Chief Admin Google verified! Directly opening Admin Panel...");
      } else {
        setSuccessMsg(
          isBookingRedirect
            ? "Google sign-in verified! Redirecting to appointment booking..."
            : "Google sign-in verified! Redirecting to your appointments..."
        );
      }

      if (onSuccess) {
        setTimeout(() => onSuccess(googleUser), 350);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google authentication failed.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter your email address in the field above to receive password reset link.");
      return;
    }
    setErrorMsg(null);
    const res = await resetPassword(email);
    if (res.success) {
      setSuccessMsg(`Password reset instructions sent to ${email}. Please check your inbox.`);
    } else {
      setErrorMsg(res.error || "Could not send password reset email.");
    }
  };

  const termsText = (
    <>
      By {mode === "register" ? "registering" : "signing in"}, you agree to WeCare's{" "}
      <a
        href="#"
        className="font-medium text-slate-700 underline underline-offset-2 hover:text-blue-600 transition-colors"
      >
        Booking Terms
      </a>{" "}
      and{" "}
      <a
        href="#"
        className="font-medium text-slate-700 underline underline-offset-2 hover:text-blue-600 transition-colors"
      >
        HIPAA Privacy Policy
      </a>
      .
    </>
  );

  return (
    <section className="relative min-h-screen lg:h-screen lg:max-h-screen bg-slate-50 p-3 sm:p-4 lg:p-5 xl:p-6 text-slate-900 antialiased font-sans flex flex-col justify-center overflow-x-hidden lg:overflow-hidden">
      {/* Dynamic Ambient Background Glow Orbs */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -25, 0], x: [0, 15, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed -top-32 -left-20 w-[520px] h-[520px] rounded-full bg-blue-400/12 blur-[130px] z-0"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 25, 0], x: [0, -15, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-sky-400/10 blur-[130px] z-0"
      />

      {/* Subtle Architectural Dot Grid Canvas */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-50" 
      />

      <div className="relative z-10 grid h-full max-h-full gap-4 lg:gap-6 lg:grid-cols-2 max-w-[1540px] w-full mx-auto my-auto items-stretch">
        
        {/* Left Form Card with Entrance Animation */}
        <motion.div
          initial={{ opacity: 0, x: -28, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-6 xl:px-12 xl:py-7 shadow-lg shadow-slate-900/5 overflow-y-auto max-h-full"
        >
          <div className="mx-auto w-full max-w-[480px]">
            
            {/* Top Brand & Mode Switcher */}
            <div className="mb-4 sm:mb-5 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2.5 no-underline group" title="Return to Home Page">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25"
                >
                  <HeartPulse className="w-4 h-4 text-white" />
                </motion.div>
                <div className="flex items-center tracking-tight text-lg font-black">
                  <span className="text-slate-900">We</span>
                  <span className="text-blue-600 ml-0.5">Care</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-1.5 animate-pulse" />
                </div>
              </a>

              <div className="flex items-center gap-2.5">
                {/* Mode Toggle Pills (Register / Login) with Spring Animated Indicator */}
                <div className="relative inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`relative z-10 rounded-lg px-3.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                      mode === "login"
                        ? "text-blue-600 font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode === "login" && (
                      <motion.span
                        layoutId="active-auth-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`relative z-10 rounded-lg px-3.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                      mode === "register"
                        ? "text-blue-600 font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode === "register" && (
                      <motion.span
                        layoutId="active-auth-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                      />
                    )}
                    Register
                  </button>
                </div>

                <motion.a
                  href="/"
                  whileHover={{ x: -2 }}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                  title="Return to Home Page"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </motion.a>
              </div>
            </div>

            {/* Title & Context for Booking Appointments */}
            <div className="mb-4 sm:mb-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {mode === "register" ? "Create Patient Account" : "Patient Sign In"}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    {mode === "register"
                      ? "Register to schedule specialist consultations and access your clinical history."
                      : "Sign in to access your appointments, medical records, and physician visits."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Google One-Click Sign In */}
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting || isSubmitting}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-full h-10 sm:h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleSubmitting ? "Connecting Google..." : "Continue with Google"}</span>
            </motion.button>


            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Or continue with email
              </span>
            </div>

            {/* Error & Success Messages with Smooth Animation */}
            <AnimatePresence mode="wait">
              {errorMsg && (() => {
                const isDomainError = errorMsg.includes("Domain unauthorized") || errorMsg.includes("unauthorized-domain");
                const isIp = typeof window !== "undefined" && window.location.hostname === "127.0.0.1";
                const currentHostname = typeof window !== "undefined" ? window.location.hostname : "we-care-app-rouge.vercel.app";

                return (
                  <motion.div
                    key="error-alert"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`mb-3.5 rounded-2xl p-3.5 flex flex-col gap-2.5 text-xs font-medium border ${
                      isDomainError
                        ? "bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isDomainError ? "text-amber-600" : "text-red-500"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <div className={`font-bold text-xs ${isDomainError ? "text-amber-900" : "text-red-800"}`}>
                          {isDomainError ? "Firebase Authorized Domain Setup Required" : "Authentication Notice"}
                        </div>
                        <div className="text-[11.5px] leading-relaxed text-slate-700">{errorMsg}</div>
                      </div>
                    </div>

                    {isDomainError && (
                      <div className="mt-1 pt-2.5 border-t border-amber-300/60 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-amber-200 shadow-2xs">
                          <span className="font-mono text-xs text-slate-800 font-bold truncate">
                            {currentHostname}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyDomain}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            title="Copy domain to clipboard"
                          >
                            {copiedDomain ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span>Copy Domain</span>
                              </>
                            )}
                          </button>
                        </div>

                        <a
                          href="https://console.firebase.google.com/project/wecare-165d7/authentication/settings"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all no-underline shadow-xs cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Firebase Console Settings ↗</span>
                        </a>

                        <div className="text-[11px] text-slate-600 leading-snug space-y-0.5">
                          <div>1. Scroll down to <strong>Authorized domains</strong></div>
                          <div>2. Click <strong>Add domain</strong>, paste <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10.5px] font-bold">{currentHostname}</code> & click <strong>Save</strong></div>
                        </div>

                        <div className="mt-0.5 p-2 rounded-lg bg-blue-50 border border-blue-200/80 text-[11px] text-blue-900 leading-snug">
                          💡 <strong>Immediate Alternative:</strong> You can also register or sign in with <strong>Email & Password</strong> below right away without needing any Firebase setup!
                        </div>
                      </div>
                    )}

                    {isIp && (
                      <a
                        href={window.location.href.replace("127.0.0.1", "localhost")}
                        className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline shadow-xs"
                      >
                        <span>Open via http://localhost:5173 for Google Auth</span>
                      </a>
                    )}
                  </motion.div>
                );
              })()}
              {successMsg && (
                <motion.div
                  key="success-alert"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-start gap-2 text-xs font-semibold text-emerald-800 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence initial={false}>
                {mode === "register" && (
                  <motion.div
                    key="field-name"
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden space-y-1"
                  >
                    <label className="text-[11px] font-bold text-slate-700">Full Name</label>
                    <div className="flex h-10 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        required={mode === "register"}
                        placeholder="e.g. John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent text-slate-900 outline-none text-xs sm:text-sm font-medium placeholder:text-slate-400"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Email ID</label>
                <div className="flex h-10 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none text-xs sm:text-sm font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="flex h-10 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={mode === "register" ? 6 : 1}
                    placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none text-xs sm:text-sm font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors cursor-pointer shrink-0"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                  />
                  <span className="text-[11.5px]">Stay signed in on this device</span>
                </label>
              </div>

              <div className="text-[11px] text-slate-500 leading-snug">
                {termsText}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                whileHover={{ scale: 1.015, y: -1, boxShadow: "0 10px 24px -4px rgba(37, 99, 235, 0.38)" }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="mt-1 flex h-10 sm:h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? "Authenticating..."
                  : mode === "register"
                    ? isBookingRedirect
                      ? "Create Account & Book Appointment"
                      : "Register Patient Account"
                    : isBookingRedirect
                      ? "Sign In & Book Appointment"
                      : "Sign In to Account"}
              </motion.button>

              {/* Switch Mode Prompt */}
              <div className="pt-1 text-center text-xs text-slate-600">
                {mode === "login" ? (
                  <span>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Create Patient Account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>

              {/* Return to Home Page Section */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Looking to explore hospital departments?</span>
                </span>
                <a
                  href="/"
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline text-[11px]"
                >
                  <span>Return to Home Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Shader Banner with Entrance Animation & Micro-Interactions */}
        <motion.div
          initial={{ opacity: 0, x: 28, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden lg:flex overflow-hidden rounded-2xl bg-[#070e20] p-7 sm:p-8 lg:p-9 xl:p-11 text-white border border-blue-900/30 shadow-xl h-full max-h-full"
        >
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#38BDF8", "#2563EB", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-[#070e20]"
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            {/* Top Telemetry Badge with Pulse */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-bold tracking-wider text-white shadow-2xs w-fit"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>WECARE PATIENT PORTAL</span>
            </motion.div>

            {/* Main Headline & Relatable Patient Care Points with Staggered Entrance */}
            <div className="my-auto py-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5 }}
                className="max-w-[560px] text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.1]"
              >
                {brandTitle.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < brandTitle.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-3 max-w-md text-sm sm:text-base text-white/80 leading-relaxed font-normal"
              >
                {brandSubtitle}
              </motion.p>

              {/* Relatable Patient Appointment Highlights with Spring Hover */}
              <div className="mt-5 flex flex-wrap gap-2">
                <motion.span
                  whileHover={{ scale: 1.06, y: -2, backgroundColor: "rgba(255,255,255,0.18)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white/90 cursor-default select-none"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Verified Specialists
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.06, y: -2, backgroundColor: "rgba(255,255,255,0.18)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white/90 cursor-default select-none"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Instant Clinical Pass
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.06, y: -2, backgroundColor: "rgba(255,255,255,0.18)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white/90 cursor-default select-none"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  In-Person Clinical Care
                </motion.span>
              </div>
            </div>

            {/* Bottom Action */}
            <motion.a
              href="/book-appointment"
              whileHover={{ scale: 1.04, x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 hover:border-white/40 active:scale-[0.98] w-fit"
            >
              <Calendar className="w-4 h-4 text-sky-300" />
              <span>Book an Appointment</span>
            </motion.a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
