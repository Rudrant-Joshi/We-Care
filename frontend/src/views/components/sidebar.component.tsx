import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  Stethoscope,
  Building2,
  Wrench,
  ShieldAlert,
  LogOut,
  User,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/auth.context';

export interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className = '', onClose }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.includes('admin');

  const navLinks = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Bookings & Schedule', to: '/appointments', icon: CalendarCheck2 },
    { label: 'Doctors Directory', to: '/doctors', icon: Stethoscope },
    { label: 'Clinical Departments', to: '/departments', icon: Building2 },
    { label: 'Clinical Equipment', to: '/equipment', icon: Wrench },
    ...(isAdmin ? [{ label: 'Admin Command', to: '/admin', icon: ShieldAlert }] : [])
  ];

  return (
    <aside
      className={`w-64 h-full bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between p-4 ${className}`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">WeCare Portal</h2>
            <span className="text-[11px] text-emerald-400 font-medium">Healthcare Network</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Section & Logout */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        {currentUser ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 text-xs font-bold">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
