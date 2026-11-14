import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, Clock, MapPin, Phone, Mail, Award, Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 transition-colors relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                WeCare <span className="text-emerald-400 font-medium">Health</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Next-generation clinical care, intelligent specialist routing, and comprehensive hospital telemetry. Delivering compassionate medical excellence 24 hours a day, 365 days a year.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> JCI & NABH Accredited
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Activity className="w-3.5 h-3.5" /> 24/7 Level 1 Trauma
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">About Our Center</Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-emerald-400 transition-colors">Clinical Departments</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-emerald-400 transition-colors">Specialist Directory</Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-emerald-400 transition-colors">Equipment & Tech</Link>
              </li>
            </ul>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Patient Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/book-appointment" className="hover:text-emerald-400 transition-colors">Book an Appointment</Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-emerald-400 transition-colors">My Appointments</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">Patient Portal Login</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors">Chief Admin Console</Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Emergency Care</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Emergency Line</span>
                  <span className="text-rose-400 font-bold">+1 (800) 911-CARE</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100 Innovation Parkway, Medical Center District</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Triage & ER: 24/7 Continuous</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} WeCare Health Network. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Compliant</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Clinical Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
