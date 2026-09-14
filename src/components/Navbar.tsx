import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User as UserIcon, LogOut, ShieldAlert } from 'lucide-react';
import type { NavItem } from '../types';
import { useAuth } from '../auth';
import { getUserAppointments, getStoredAppointments } from '../appointment/storage';

interface NavbarProps {
  onBookDemoClick?: () => void;
}

// Routes that use the light Slate/Blue theme
const LIGHT_ROUTES = [
  '/',
  '/about',
  '/departments',
  '/doctors',
  '/appointment',
  '/appointments',
  '/book-appointment',
  '/book',
  '/login',
  '/register',
];

export const Navbar = ({ onBookDemoClick: _onBookDemoClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [apptCount, setApptCount] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Monitor window scroll to adjust navbar depth & glass reflection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com';

  // Keep live appointment count synced (shows all hospital bookings for admin, personal for patient)
  useEffect(() => {
    const syncCount = () => {
      try {
        const count = isAdmin
          ? getStoredAppointments().length
          : getUserAppointments(currentUser).length;
        setApptCount(count);
      } catch {
        setApptCount(0);
      }
    };

    syncCount();
    window.addEventListener('wecare_appointments_changed', syncCount);
    window.addEventListener('wecare_auth_state_changed', syncCount);
    window.addEventListener('storage', syncCount);
    return () => {
      window.removeEventListener('wecare_appointments_changed', syncCount);
      window.removeEventListener('wecare_auth_state_changed', syncCount);
      window.removeEventListener('storage', syncCount);
    };
  }, [location.pathname, currentUser, isAdmin]);

  // Check if we are on a light-themed page (About, Departments, Doctors, Appointments, Book)
  const isAbout = LIGHT_ROUTES.includes(location.pathname);
  const isBookAppointment =
    location.pathname === '/book-appointment' ||
    location.pathname === '/book';
  const isAppointments =
    location.pathname === '/appointments';

  const activeTab =
    location.pathname === '/about'
      ? 'About Us'
      : location.pathname === '/departments'
        ? 'Departments'
        : location.pathname === '/doctors'
          ? 'Our Doctors'
          : isAppointments
            ? (isAdmin ? 'All Appointments' : 'My Appointments')
            : isBookAppointment
              ? 'Book Appointment'
              : 'Home';

  // Dynamic Navigation Items: 'All Appointments' for Chief Admin, 'My Appointments' for Patients
  const navItems: NavItem[] = useMemo(() => [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Departments', href: '/departments' },
    { label: 'Our Doctors', href: '/doctors' },
    { label: isAdmin ? 'All Appointments' : 'My Appointments', href: '/appointments' },
  ], [isAdmin]);

  const handleNavClick = (item: NavItem) => {
    if (item.href === '/') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (
      item.href === '/about' ||
      item.href === '/departments' ||
      item.href === '/doctors' ||
      item.href === '/appointments' ||
      item.href === '/book-appointment'
    ) {
      if (location.pathname !== item.href) {
        navigate(item.href);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (item.href === '#appointments') {
      if (location.pathname !== '/appointments') {
        navigate('/appointments');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (item.href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/' + item.href);
      } else {
        const target = document.querySelector(item.href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleBookAppointmentClick = () => {
    if (!currentUser) {
      navigate('/login?redirect=/book-appointment');
    } else if (location.pathname !== '/book-appointment') {
      navigate('/book-appointment');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="vortiq-navbar"
      className={`relative z-30 w-full max-w-[1720px] mx-auto flex items-center justify-between px-6 sm:px-10 md:px-16 transition-all duration-300 ${isScrolled ? 'py-3 drop-shadow-xs' : 'py-4'
        }`}
    >
      {/* Brand Logo (Left) */}
      <a
        href="/"
        id="nav-brand-logo"
        onClick={handleLogoClick}
        className={`group flex items-center gap-3 no-underline transition-transform hover:scale-[1.02] ${isAbout ? 'text-slate-900' : 'text-white'
          }`}
      >
        {/* Brand Pill Tile */}
        <div
          className={`relative flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden transition-all shadow-sm ${isAbout
              ? 'bg-blue-600 text-white border border-blue-500'
              : 'navbar-brand-pill'
            }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white drop-shadow-[0_1px_4px_rgba(0,60,150,0.5)] group-hover:scale-110 transition-transform"
          >
            <path
              d="M 5 19 L 12 5 L 19 19 L 14 19 L 12 14 L 10 19 Z"
              fill="currentColor"
            />
            <circle cx="12" cy="10" r="1.8" fill={isAbout ? '#ffffff' : '#38bdf8'} />
          </svg>
        </div>

        <div className="flex items-center tracking-tight">
          <span className={`text-2xl font-black tracking-tight ${isAbout ? 'text-slate-900' : 'text-white'}`}>
            We
          </span>
          <span className={`text-2xl font-bold ml-1 tracking-tight ${isAbout ? 'text-blue-600' : 'text-white'}`}>
            Care
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ml-1.5 animate-pulse ${isAbout ? 'bg-blue-600' : 'bg-sky-300'}`} />
        </div>
      </a>

      {/* Center Nav Pills with Dynamic Light/Dark Contrast */}
      <nav
        id="nav-center-menu"
        className={`hidden md:flex items-center p-1.5 rounded-full transition-all ${isAbout
            ? 'bg-slate-100/90 border border-slate-200/90 shadow-sm'
            : 'navbar-liquid-island'
          }`}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.label;
          return (
            <motion.button
              key={item.label}
              type="button"
              id={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleNavClick(item)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`relative px-5 py-2 text-[13px] tracking-wide transition-all duration-300 rounded-full select-none cursor-pointer transform-gpu ${isActive
                  ? isAbout
                    ? 'text-white font-bold'
                    : 'text-black font-bold'
                  : isAbout
                    ? 'text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-white font-semibold hover:bg-white/15 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill-bg"
                  className={`absolute inset-0 rounded-full ${isAbout
                      ? 'bg-blue-600 shadow-[0_2px_10px_rgba(37,99,235,0.3)]'
                      : 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.2)]'
                    }`}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{item.label}</span>
                {item.href === '/appointments' && apptCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-mono font-bold ${isActive
                        ? isAbout
                          ? 'bg-white text-blue-600'
                          : 'bg-black text-white'
                        : isAbout
                          ? 'bg-blue-600 text-white'
                          : 'bg-sky-400 text-black'
                      }`}
                  >
                    {apptCount}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Right Action: Button */}
      <div className="hidden sm:flex items-center gap-3">
        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md ${location.pathname === '/admin'
                ? 'bg-purple-600 text-white shadow-purple-600/30 ring-2 ring-purple-400'
                : isAbout
                  ? 'bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300'
                  : 'bg-purple-600/80 hover:bg-purple-600 text-white border border-purple-400/40 shadow-purple-600/20'
              }`}
            title="Chief Admin Console (Rudrant Joshi)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
            <span>Admin Portal</span>
          </button>
        )}

        {currentUser ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${isAbout
                  ? 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
                  : 'navbar-brand-pill text-white'
                }`}
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`w-6 h-6 rounded-full object-cover ${isAbout ? 'border border-slate-200' : ''}`}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold max-w-[110px] truncate">
                {currentUser.name}
              </span>
              <span className={`w-2 h-2 rounded-full ${currentUser.role === 'admin'
                  ? 'bg-purple-400 shadow-[0_0_8px_#a855f7]'
                  : currentUser.role === 'patient'
                    ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'
                    : currentUser.role === 'doctor'
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
                }`} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className={`absolute right-0 mt-2 w-56 p-3 rounded-2xl shadow-2xl z-50 backdrop-blur-2xl ${isAbout
                      ? 'bg-white border border-slate-200 text-slate-900 shadow-slate-300/60'
                      : 'bg-white/25 text-white border-0 shadow-[0_20px_50px_rgba(0,25,70,0.25)]'
                    }`}
                >
                  <div className={`px-2 py-1.5 mb-2 ${isAbout ? 'border-b border-slate-200' : ''}`}>
                    <div className="text-xs font-bold truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                    <div className="mt-1.5 text-[9px] font-mono uppercase font-bold text-sky-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {currentUser.role} portal online
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-2 py-2 rounded-xl text-xs font-bold text-purple-600 hover:bg-purple-500/15 transition-colors cursor-pointer flex items-center justify-between mb-1"
                    >
                      <span>Admin Control Center</span>
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/appointments');
                    }}
                    className={`w-full text-left px-2 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${isAbout ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                      }`}
                  >
                    {isAdmin ? 'All Hospital Appointments' : 'My Clinical Telemetry'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer flex items-center justify-between mt-1"
                  >
                    <span>Log Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${isAbout
                ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 shadow-sm'
                : 'navbar-action-btn text-white hover:text-sky-300'
              }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        <button
          id="nav-book-demo-btn"
          onClick={handleBookAppointmentClick}
          className={`relative group px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${isAbout
              ? isBookAppointment
                ? 'text-white bg-blue-700 ring-2 ring-blue-500 ring-offset-2 ring-offset-white shadow-lg shadow-blue-500/30 scale-105'
                : 'text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95'
              : isBookAppointment
                ? 'text-black bg-white ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_22px_rgba(56,189,248,0.7)] scale-105'
                : 'text-black bg-white shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:bg-slate-100 hover:shadow-[0_6px_25px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95'
            }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            <span>BOOK APPOINTMENT</span>
            <span
              className={`w-2 h-2 rounded-full transition-transform ${isBookAppointment
                  ? isAbout
                    ? 'bg-emerald-300 animate-pulse'
                    : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse'
                  : isAbout
                    ? 'bg-white group-hover:scale-125'
                    : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.9)] group-hover:scale-125'
                }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`flex md:hidden items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-colors ${isAbout
            ? 'border border-slate-200 bg-slate-100 text-slate-800'
            : 'navbar-brand-pill text-white'
          }`}
      >
        <div className="flex flex-col gap-1.5 w-5">
          <span className={`h-0.5 w-full transition-all duration-300 ${isAbout ? 'bg-slate-800' : 'bg-white'} ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`h-0.5 w-full transition-opacity duration-300 ${isAbout ? 'bg-slate-800' : 'bg-white'} ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-full transition-all duration-300 ${isAbout ? 'bg-slate-800' : 'bg-white'} ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-6 right-6 mt-2 p-4 rounded-3xl flex flex-col gap-2 md:hidden shadow-2xl ${isAbout
                ? 'bg-white border border-slate-200 text-slate-900 shadow-xl'
                : 'navbar-liquid-island'
              }`}
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavClick(item);
                }}
                className={`w-full py-2.5 px-4 text-left text-sm rounded-xl transition-colors flex items-center justify-between ${activeTab === item.label
                    ? isAbout
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-white text-black font-bold shadow-sm'
                    : isAbout
                      ? 'text-slate-700 font-semibold hover:bg-slate-100'
                      : 'text-white font-semibold hover:bg-white/15'
                  }`}
              >
                <span>{item.label}</span>
                {item.href === '/appointments' && apptCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${activeTab === item.label
                        ? isAbout
                          ? 'bg-white/20 text-white'
                          : 'bg-black/20 text-black'
                        : isAbout
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-white/20 text-white'
                      }`}
                  >
                    {apptCount}
                  </span>
                )}
              </button>
            ))}

            {/* Mobile Admin Link if logged in as Admin */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/admin');
                }}
                className="w-full py-2.5 px-4 text-left text-sm rounded-xl transition-colors flex items-center justify-between bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-200" />
                  <span>Admin Command Console</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded-full">Chief Admin</span>
              </button>
            )}

            {/* Mobile Auth Button */}
            {currentUser ? (
              <div className={`p-3 rounded-xl border flex items-center justify-between ${isAbout ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                }`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold truncate max-w-[130px]">{currentUser.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 font-medium"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className={`w-full py-2.5 px-4 text-left text-sm rounded-xl font-semibold flex items-center gap-2 ${isAbout ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/15'
                  }`}
              >
                <UserIcon className="w-4 h-4 text-sky-400" />
                <span>Sign In / Register</span>
              </button>
            )}

            <div className={`pt-2 border-t ${isAbout ? 'border-slate-200' : 'border-white/20'}`}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleBookAppointmentClick();
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all ${isAbout
                    ? isBookAppointment
                      ? 'bg-blue-700 text-white ring-2 ring-blue-500 ring-offset-1 font-black shadow-lg'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    : isBookAppointment
                      ? 'text-black bg-white ring-2 ring-sky-400 font-black shadow-lg'
                      : 'text-black bg-white hover:bg-slate-100'
                  }`}
              >
                <span>BOOK APPOINTMENT</span>
                <span
                  className={`w-2 h-2 rounded-full ${isBookAppointment
                      ? 'bg-emerald-400 animate-pulse'
                      : isAbout
                        ? 'bg-white'
                        : 'bg-sky-500'
                    }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
