import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, Clock, MapPin, Phone, Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-50/90 text-slate-600 border-t border-slate-200/90 pt-16 pb-12 transition-colors relative overflow-hidden font-sans">
      {/* Background Soft Medical Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Architectural Dot Grid Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group no-underline">
              <div className="w-9 h-9 rounded-xl bg-[#135940] flex items-center justify-center text-white shadow-md shadow-[#135940]/20 transition-transform group-hover:scale-105">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center tracking-tight text-xl font-black">
                <span className="text-slate-900">We</span>
                <span className="text-[#135940] ml-0.5">Care</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1.5 font-mono">
                  Health
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Next-generation clinical care, intelligent specialist routing, and comprehensive hospital telemetry. Delivering compassionate medical excellence 24 hours a day, 365 days a year.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#135940] border border-emerald-200/80 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#135940]" /> JCI &amp; NABH Accredited
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80 shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-sky-700" /> 24/7 Level 1 Trauma
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-600 hover:text-[#135940] transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 hover:text-[#135940] transition-colors">About Our Center</Link>
              </li>
              <li>
                <Link to="/departments" className="text-slate-600 hover:text-[#135940] transition-colors">Clinical Departments</Link>
              </li>
              <li>
                <Link to="/doctors" className="text-slate-600 hover:text-[#135940] transition-colors">Specialist Directory</Link>
              </li>
              <li>
                <Link to="/equipment" className="text-slate-600 hover:text-[#135940] transition-colors">Equipment &amp; Tech</Link>
              </li>
            </ul>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-mono">
              Patient Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/book-appointment" className="text-slate-600 hover:text-[#135940] transition-colors">Book an Appointment</Link>
              </li>
              <li>
                <Link to="/appointments" className="text-slate-600 hover:text-[#135940] transition-colors">My Appointments</Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-[#135940] transition-colors">Patient Portal Login</Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-600 hover:text-[#135940] transition-colors">Chief Admin Console</Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-mono">
              Emergency Care
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="p-3 rounded-xl bg-white border border-rose-200/80 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-700 text-xs font-medium">24/7 Rapid Response</span>
                    <a href="tel:18009112273" className="text-rose-600 font-extrabold text-sm hover:underline">
                      +1 (800) 911-CARE
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-slate-600 text-xs">
                <MapPin className="w-4 h-4 text-[#135940] shrink-0 mt-0.5" />
                <span>100 Innovation Parkway, Medical Center District</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-600 text-xs">
                <Clock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>Triage &amp; ER: 24/7 Continuous Admission</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} WeCare Health Network. All rights reserved.</p>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-slate-700 font-semibold">WE CARE CLINICAL PROTOCOL ACTIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">HIPAA Compliant</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
