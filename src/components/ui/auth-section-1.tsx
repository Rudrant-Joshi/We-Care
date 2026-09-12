"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useState } from "react";
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
  ShieldCheck,
  Eye,
  EyeOff,
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

      setSuccessMsg(
        mode === "register"
          ? isBookingRedirect
            ? "Account created! Redirecting to appointment booking..."
            : "Account created! Redirecting to your dashboard..."
          : isBookingRedirect
            ? "Signed in! Redirecting to appointment booking..."
            : "Signed in! Redirecting to your appointments..."
      );

      if (onSuccess) {
        setTimeout(() => {
          const isAdmin = email.trim().toLowerCase() === "rudrant.joshi@gmail.com";
          onSuccess({
            email: email.trim(),
            name: mode === "register" ? fullName.trim() : email.split("@")[0],
            role: isAdmin ? "admin" : "patient",
          });
        }, 400);
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

      setSuccessMsg(
        isBookingRedirect
          ? "Google sign-in verified! Redirecting to appointment booking..."
          : "Google sign-in verified! Redirecting..."
      );

      if (onSuccess) {
        setTimeout(onSuccess, 500);
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
      {/* Subtle Architectural Dot Grid Canvas */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-50" 
      />

      <div className="relative z-10 grid h-full max-h-full gap-4 lg:gap-6 lg:grid-cols-2 max-w-[1540px] w-full mx-auto my-auto items-stretch">
        
        {/* Left Form Card */}
        <div className="flex flex-col justify-center rounded-2xl border border-slate-200/90 bg-white px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-6 xl:px-12 xl:py-7 shadow-sm sm:shadow-md overflow-y-auto max-h-full">
          <div className="mx-auto w-full max-w-[480px]">
            
            {/* Top Brand & Mode Switcher */}
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2.5 no-underline group" title="Return to Home Page">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center tracking-tight text-lg font-black">
                  <span className="text-slate-900">We</span>
                  <span className="text-blue-600 ml-0.5">Care</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-1.5 animate-pulse" />
                </div>
              </a>

              <div className="flex items-center gap-2.5">
                {/* Mode Toggle Pills (Register / Login) */}
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      mode === "login"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                      mode === "register"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Register
                  </button>
                </div>

                <a
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                  title="Return to Home Page"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </a>
              </div>
            </div>

            {/* Prominent Booking Redirection Gate Alert */}
            {isBookingRedirect && (
              <div className="mb-3.5 rounded-xl bg-blue-50 border border-blue-200/90 p-3 flex items-start gap-2.5 text-xs text-blue-900 shadow-2xs">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-blue-900">Sign In Required to Book</div>
                  <div className="text-blue-700 text-[11.5px] mt-0.5">
                    Please sign in or register your account to book an appointment with our specialist physicians and receive your confirmed clinical pass.
                  </div>
                </div>
              </div>
            )}

            {/* Title & Context for Booking Appointments */}
            <div className="mb-3 sm:mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Secure Firebase Healthcare Auth</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {mode === "register" ? "Create Patient Account" : "Patient Sign In"}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                {mode === "register"
                  ? "Register to schedule specialist consultations and access your clinical history."
                  : "Sign in to access your appointments, medical records, and physician visits."}
              </p>
            </div>

            {/* Google One-Click Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full h-10 sm:h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
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
            </button>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Or continue with email
              </span>
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="mb-3 rounded-xl bg-red-50 border border-red-200 p-3 flex flex-col gap-2.5 text-xs font-medium text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{errorMsg}</span>
                </div>
                {typeof window !== "undefined" && window.location.hostname === "127.0.0.1" && (
                  <a
                    href={window.location.href.replace("127.0.0.1", "localhost")}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline shadow-xs"
                  >
                    <span>Open via http://localhost:5173 for Google Auth</span>
                  </a>
                )}
              </div>
            )}
            {successMsg && (
              <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-start gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Full Name</label>
                  <div className="flex h-10 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent text-slate-900 outline-none text-xs sm:text-sm font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Email ID</label>
                <div className="flex h-10 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15">
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
                <div className="flex h-10 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-900 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15">
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

              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="mt-1 flex h-10 sm:h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer disabled:opacity-50"
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
              </button>

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
        </div>

        {/* Right Shader Banner - Blue Hospital Theme */}
        <div className="relative hidden lg:flex overflow-hidden rounded-2xl bg-[#070e20] p-7 sm:p-8 lg:p-9 xl:p-11 text-white border border-blue-900/30 shadow-xl h-full max-h-full">
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
            {/* Top Telemetry Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-bold tracking-wider text-white shadow-2xs w-fit">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>WECARE PATIENT PORTAL</span>
            </div>

            {/* Main Headline & Relatable Patient Care Points */}
            <div className="my-auto py-4">
              <h2 className="max-w-[560px] text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                {brandTitle.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < brandTitle.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="mt-3 max-w-md text-sm sm:text-base text-white/80 leading-relaxed font-normal">
                {brandSubtitle}
              </p>

              {/* Relatable Patient Appointment Highlights */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Verified Specialists
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Instant Clinical Pass
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  In-Person Clinical Care
                </span>
              </div>
            </div>

            {/* Bottom Action */}
            <a
              href="/book-appointment"
              className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/40 active:scale-[0.98] w-fit"
            >
              <Calendar className="w-4 h-4 text-sky-300" />
              <span>Book an Appointment</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
