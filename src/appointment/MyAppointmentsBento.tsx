"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Download,
  PlusCircle,
  ShieldCheck,
  RotateCcw,
  CalendarCheck2,
  CheckCircle2,
  X,
  AlertCircle,
  List,
  LayoutGrid,
  Search,
  ArrowRight,
  Compass,
  Check,
  Info,
} from 'lucide-react';

import { type StoredAppointment, hasUserProvidedReason } from './types';
import {
  getUserAppointments,
  getStoredAppointments,
  approveStoredAppointment,
  rejectStoredAppointment,
  cancelStoredAppointment,
  deleteStoredAppointment,
  syncAppointmentsFromFirestore,
  isMockAppointment,
  getAppointmentCreationTimestamp,
  sortAppointmentsDescending,
} from './storage';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { DEPARTMENT_COLORS } from '../lib/department-colors';
import { useAuth, getDeletedUserEmails } from '../auth/AuthContext';

/* ==========================================================================
   Animation Presets & Variants
   ========================================================================== */

const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const sectionItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1], // Deceleration curve: arrives swiftly and slows down smoothly to rest
    },
  },
};

const scrollDecelerateItemVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1], // Smooth deceleration curve: elements glide in while scrolling and slow down
    },
  },
};

const viewModeTransitionVariants: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.985, filter: 'blur(3px)' },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    filter: 'blur(3px)',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/* ==========================================================================
   Date Parsing Helper for Clinical Timeline & Cards
   ========================================================================== */

function parseAppointmentDateTime(dateStr?: string, timeStr?: string) {
  if (!dateStr) return { dayOfWeek: 'APT', month: 'CAL', dayNum: '•', time: timeStr || '' };

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return {
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      dayNum: String(d.getDate()).padStart(2, '0'),
      time: timeStr || '',
    };
  }

  const parts = dateStr.split(',');
  if (parts.length >= 2) {
    const dayOfWeek = (parts[0] || '').trim().slice(0, 3).toUpperCase() || 'APT';
    const monthDay = parts[1].trim().split(' ');
    const month = (monthDay[0] || '').slice(0, 3).toUpperCase() || 'CAL';
    const dayNum = monthDay[1] || '•';
    return { dayOfWeek, month, dayNum, time: timeStr || '' };
  }

  return { dayOfWeek: 'APT', month: 'CAL', dayNum: dateStr.slice(0, 5), time: timeStr || '' };
}

/* ==========================================================================
   Types & View Modes
   ========================================================================== */

type ViewMode = 'list' | 'cards';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

/* ==========================================================================
   Main MyAppointmentsBento Component
   ========================================================================== */

export function MyAppointmentsBento() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com';

  // Appointments state
  const [appointments, setAppointments] = useState<StoredAppointment[]>(() => {
    const adminCheck =
      currentUser?.role === 'admin' ||
      currentUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com';
    return adminCheck
      ? sortAppointmentsDescending(getStoredAppointments().filter((a) => !isMockAppointment(a.bookingId)))
      : sortAppointmentsDescending(getUserAppointments(currentUser).filter((a) => !isMockAppointment(a.bookingId)));
  });

  // UI & View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'upcoming'>('latest');

  // Interactive modal states
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [directionModalAppt, setDirectionModalAppt] = useState<StoredAppointment | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync / Load helper
  const loadAppointments = useCallback(() => {
    const list = isAdmin
      ? getStoredAppointments().filter((a) => !isMockAppointment(a.bookingId))
      : getUserAppointments(currentUser).filter((a) => !isMockAppointment(a.bookingId));
    setAppointments(sortAppointmentsDescending(list));
  }, [currentUser, isAdmin]);

  // Firestore Real-Time Listener & Telemetry Sync
  useEffect(() => {
    syncAppointmentsFromFirestore().then((cloudList) => {
      const cleanList = (cloudList || []).filter((a) => !isMockAppointment(a.bookingId));
      if (isAdmin) {
        setAppointments(sortAppointmentsDescending(cleanList.length > 0 ? cleanList : getStoredAppointments()));
      } else {
        const userList = cleanList.filter(
          (a) =>
            currentUser?.email &&
            a.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
        );
        setAppointments(sortAppointmentsDescending(userList.length > 0 ? userList : getUserAppointments(currentUser)));
      }
    });

    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = onSnapshot(collection(db, 'appointments'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: StoredAppointment[] = [];
          const deletedEmails = new Set(getDeletedUserEmails().map((e) => e.toLowerCase().trim()));
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as StoredAppointment;
            const apptEmail = (data?.email || '').toLowerCase().trim();
            if (
              data &&
              data.bookingId &&
              !isMockAppointment(data.bookingId) &&
              !isMockAppointment(docSnap.id) &&
              (!apptEmail || !deletedEmails.has(apptEmail))
            ) {
              remoteList.push(data);
            }
          });
          const local = getStoredAppointments().filter((l) => {
            if (isMockAppointment(l.bookingId)) return false;
            const lEmail = (l.email || '').toLowerCase().trim();
            if (lEmail && deletedEmails.has(lEmail)) return false;
            return true;
          });
          const remoteIds = new Set(remoteList.map((r) => r.bookingId));
          const merged = [...remoteList, ...local.filter((l) => !remoteIds.has(l.bookingId))];
          localStorage.setItem('wecare_user_appointments_v2', JSON.stringify(merged));

          if (isAdmin) {
            setAppointments(sortAppointmentsDescending(merged));
          } else {
            const userList = merged.filter(
              (a) =>
                currentUser?.email &&
                a.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
            );
            setAppointments(sortAppointmentsDescending(userList));
          }
        } else {
          loadAppointments();
        }
      });
    } catch {
      // Fallback local storage sync
    }

    const handleSync = () => loadAppointments();
    window.addEventListener('wecare_appointments_changed', handleSync);
    window.addEventListener('wecare_auth_state_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener('wecare_appointments_changed', handleSync);
      window.removeEventListener('wecare_auth_state_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [currentUser, isAdmin, loadAppointments]);

  // Compute live summary statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const approved = appointments.filter((a) => a.status === 'approved' || a.status === 'upcoming').length;
    const rejected = appointments.filter((a) => a.status === 'rejected').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    return { total, pending, approved, rejected, completed };
  }, [appointments]);


  // Filtered & Searched Appointments
  const filteredAppointments = useMemo(() => {
    let list = [...appointments];

    // Status filter
    if (statusFilter === 'pending') {
      list = list.filter((a) => a.status === 'pending');
    } else if (statusFilter === 'approved') {
      list = list.filter((a) => a.status === 'approved' || a.status === 'upcoming');
    } else if (statusFilter === 'rejected') {
      list = list.filter((a) => a.status === 'rejected');
    } else if (statusFilter === 'completed') {
      list = list.filter((a) => a.status === 'completed');
    }

    // Department filter
    if (deptFilter !== 'all') {
      list = list.filter((a) => a.departmentId === deptFilter);
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.bookingId?.toLowerCase().includes(q) ||
          a.doctorName?.toLowerCase().includes(q) ||
          a.patientName?.toLowerCase().includes(q) ||
          a.departmentName?.toLowerCase().includes(q) ||
          a.specialty?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortOrder === 'latest') {
      return sortAppointmentsDescending(list);
    } else {
      return list.sort((a, b) => getAppointmentCreationTimestamp(a) - getAppointmentCreationTimestamp(b));
    }
  }, [appointments, statusFilter, deptFilter, searchQuery, sortOrder]);

  // Actions
  const handleApprove = (bookingId: string) => {
    approveStoredAppointment(bookingId);
    loadAppointments();
    setNotification(`Appointment ${bookingId} approved and confirmed.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = (bookingId: string) => {
    rejectStoredAppointment(bookingId);
    loadAppointments();
    setNotification(`Appointment ${bookingId} has been rejected.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmCancel = (bookingId: string) => {
    cancelStoredAppointment(bookingId);
    loadAppointments();
    setCancellingId(null);
    setNotification(`Appointment ${bookingId} has been cancelled.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = (bookingId: string) => {
    deleteStoredAppointment(bookingId);
    loadAppointments();
    setNotification(`Appointment record ${bookingId} removed from history.`);
    setTimeout(() => setNotification(null), 4000);
  };


  const handleDownloadIcs = (appt: StoredAppointment) => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:WeCare Specialist Consultation - ${appt.doctorName}\nDESCRIPTION:${appt.specialty} with ${appt.doctorName}. Booking ID: ${appt.bookingId}.\nLOCATION:${appt.location || 'WeCare Medical Tower 4, Suite 800'}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wecare-${appt.bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.section
      id="my-appointments-section"
      variants={sectionContainerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-[1720px] mx-auto px-3 sm:px-6 md:px-14 py-4 sm:py-8 md:py-14 font-sans"
    >
      
      {/* ====================================================================
          1. EXECUTIVE PATIENT TELEMETRY HEADER & COUNTDOWN HERO
          ==================================================================== */}
      <motion.div variants={sectionItemVariants} className="relative mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Greeting & Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-[#135940] text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#135940] animate-pulse" />
                {isAdmin ? 'CHIEF CLINICAL LEDGER' : 'VERIFIED PATIENT SCHEDULE'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9.5px] sm:text-[10px] font-mono font-bold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE SYNC
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.1]">
              {isAdmin ? (
                <>
                  Hospital Patient{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-[#135940] to-[#1b7454]">
                    Ledger
                  </span>
                </>
              ) : (
                <>
                  Clinical Passes &{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135940] via-[#1b7454] to-emerald-600">
                    Appointments
                  </span>
                </>
              )}
            </h1>

            <p className="text-slate-600 text-xs sm:text-base max-w-2xl leading-relaxed">
              {isAdmin
                ? 'Central hospital records. Authorize pending consultations, review admission passes, and triage clinical schedules.'
                : `Welcome ${currentUser?.name ? currentUser.name : 'back'}. Access your digital hospital admission passes, upcoming physician visits, and consultation itineraries.`}
            </p>
          </div>

          {/* Quick Actions Strip */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2, boxShadow: '0 14px 28px -4px rgba(19, 89, 64, 0.45)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => navigate('/book-appointment')}
              className="px-6 py-3.5 rounded-2xl text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#135940]/25 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto min-h-[46px]"
              style={{
                background: 'linear-gradient(135deg, #135940, #1b7454)',
              }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

      </motion.div>

      {/* ====================================================================
          2. TELEMETRY METRIC CUBES
          ==================================================================== */}
      <motion.div
        variants={sectionContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 mb-6 sm:mb-8"
      >
        
        {/* Metric 1: Total Consultations */}
        <motion.div
          variants={scrollDecelerateItemVariants}
          whileHover={{
            y: -6,
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 20 },
          }}
          className="group p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Visits
            </span>
            <div className="size-7 sm:size-8 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shrink-0">
              <CalendarCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#135940]" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {stats.total}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium truncate">
            <span className="size-1.5 rounded-full bg-[#135940] shrink-0" />
            <span className="truncate">Patient schedule repository</span>
          </div>
        </motion.div>

        {/* Metric 2: Pending Triage Review */}
        <motion.div
          variants={scrollDecelerateItemVariants}
          whileHover={{
            y: -6,
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 20 },
          }}
          className="group p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
              Pending Review
            </span>
            <div className="size-7 sm:size-8 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-700 tabular-nums">
            {stats.pending}
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-700 mt-1 flex items-center gap-1.5 font-medium truncate">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="truncate">Clinical triage in progress</span>
          </div>
        </motion.div>

        {/* Metric 3: Approved & Confirmed Passes */}
        <motion.div
          variants={scrollDecelerateItemVariants}
          whileHover={{
            y: -6,
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 20 },
          }}
          className="group p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
              Active Passes
            </span>
            <div className="size-7 sm:size-8 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100 text-[#135940] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-800 tabular-nums">
            {stats.approved}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-700 mt-1 flex items-center gap-1.5 font-medium truncate">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">Confirmed clinical admissions</span>
          </div>
        </motion.div>

        {/* Metric 4: Completed Consultations */}
        <motion.div
          variants={scrollDecelerateItemVariants}
          whileHover={{
            y: -6,
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 20 },
          }}
          className="group p-3 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Completed Care
            </span>
            <div className="size-7 sm:size-8 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shrink-0">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-800 tabular-nums">
            {stats.completed}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
            <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
            <span className="truncate">Consultations archived</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ====================================================================
          3. ADVANCED CONTROLS: SEARCH, FILTERS & 3-WAY VIEW SWITCHER
          ==================================================================== */}
      <motion.div
        variants={scrollDecelerateItemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm mb-5 sm:mb-6 space-y-3 sm:space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 min-w-0 group">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-[#135940] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor, specialty, pass ID, or clinical reason..."
              className="w-full h-11 pl-10 pr-9 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium hover:bg-slate-100/70 focus:bg-white focus:border-[#135940] focus:ring-4 focus:ring-[#135940]/15 outline-none transition-all"
            />
            {searchQuery && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

          {/* Mobile-friendly side-by-side Toolbar: Sort & View Switcher */}
          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            {/* Sort Order Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -1, borderColor: '#a7f3d0', color: '#135940' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => setSortOrder((prev) => (prev === 'latest' ? 'upcoming' : 'latest'))}
              className="flex-1 lg:flex-initial h-11 px-3 sm:px-3.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer select-none shrink-0"
              title="Toggle sort order"
            >
              <motion.div
                animate={{ rotate: sortOrder === 'latest' ? 0 : 180 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#135940]" />
              </motion.div>
              <span className="truncate">{sortOrder === 'latest' ? 'Newest' : 'Earliest'}</span>
            </motion.button>

            {/* View Mode Switcher: List vs Cards */}
            <div className="flex-1 lg:flex-initial flex items-center bg-slate-100 rounded-xl sm:rounded-2xl p-1 border border-slate-200 text-xs shrink-0 justify-between">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                onClick={() => setViewMode('list')}
                className={`flex-1 relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:rounded-xl font-bold text-xs transition-colors cursor-pointer select-none ${
                  viewMode === 'list' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {viewMode === 'list' && (
                  <motion.div
                    layoutId="active-view-pill"
                    className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#135940] to-[#1b7454] shadow-md shadow-[#135940]/25"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <List className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">List</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                onClick={() => setViewMode('cards')}
                className={`flex-1 relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:rounded-xl font-bold text-xs transition-colors cursor-pointer select-none ${
                  viewMode === 'cards' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {viewMode === 'cards' && (
                  <motion.div
                    layoutId="active-view-pill"
                    className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#135940] to-[#1b7454] shadow-md shadow-[#135940]/25"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <LayoutGrid className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">Cards</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Status Tabs Bar with Native App Pill Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 sm:pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl sm:rounded-2xl bg-slate-100 border border-slate-200/80 overflow-x-auto scrollbar-none max-w-full touch-pan-x">
            {(
              [
                { id: 'all', label: `All (${stats.total})`, color: '#135940' },
                { id: 'pending', label: `Pending (${stats.pending})`, color: '#d97706' },
                { id: 'approved', label: `Active (${stats.approved})`, color: '#059669' },
                { id: 'rejected', label: `Rejected (${stats.rejected})`, color: '#e11d48' },
                { id: 'completed', label: `Completed (${stats.completed})`, color: '#4f46e5' },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`shrink-0 relative px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive ? 'text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-status-tab"
                      className="absolute inset-0 rounded-lg sm:rounded-xl shadow-md shadow-slate-900/10"
                      style={{ backgroundColor: tab.color }}
                      transition={{ type: 'spring', stiffness: 550, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 font-bold">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Department Filter Selector */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0">
            <span className="shrink-0 text-slate-500">Specialty:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold outline-none cursor-pointer hover:bg-white transition-colors"
            >
              <option value="all">All Specialties</option>
              {Object.entries(DEPARTMENT_COLORS).map(([id, conf]) => (
                <option key={id} value={id}>
                  {conf.badge}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* ====================================================================
          4. MAIN VIEW RENDERING: PASSBOOK / TIMELINE / LEDGER
          ==================================================================== */}
      <AnimatePresence mode="wait">
        {filteredAppointments.length === 0 ? (
          /* Empty State with Floating Micro-animation */
          <motion.div
            key="empty-schedule-view"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="p-8 sm:p-14 text-center rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto my-8 relative overflow-hidden"
          >
            {/* Ambient Background Radial Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"
            />

            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
              className="size-16 sm:size-20 mx-auto mb-4 rounded-3xl bg-emerald-50 text-[#135940] flex items-center justify-center shadow-xs border border-emerald-100/80"
            >
              <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
              {appointments.length === 0 ? 'No Scheduled Appointments' : 'No Matching Appointments Found'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              {appointments.length === 0
                ? 'Your personal consultation schedule is currently blank. Schedule a visit with our board-certified clinical specialists to generate your digital hospital admission pass.'
                : 'No clinical appointments matched your current search keywords or category filters. Try clearing your filters or search terms.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {appointments.length > 0 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDeptFilter('all');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Clear Filters
                </motion.button>
              )}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => navigate('/book-appointment')}
                className="px-6 py-2.5 rounded-xl bg-[#135940] hover:bg-[#1b7454] text-white text-xs font-bold transition-all shadow-md shadow-[#135940]/25 flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Appointment</span>
              </motion.button>
            </div>
          </motion.div>
        ) : viewMode === 'list' ? (
          /* ================================================================
             VIEW 1: MODERN EXECUTIVE CLINICAL LIST (Default)
             ================================================================ */
          <motion.div
            key={`view-list-${statusFilter}-${deptFilter}`}
            variants={viewModeTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-3"
          >
            {filteredAppointments.map((appt, idx) => {
              const isPending = appt.status === 'pending';
              const isApproved = appt.status === 'approved' || appt.status === 'upcoming';
              const isRejected = appt.status === 'rejected';
              const isCompleted = appt.status === 'completed';
              const dt = parseAppointmentDateTime(appt.date, appt.time);

              return (
                <motion.div
                  key={appt.bookingId}
                  initial={{ opacity: 0, y: 35, scale: 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.1 }}
                  transition={{
                    delay: Math.min((idx % 6) * 0.05, 0.25),
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1], // Deceleration while scrolling
                  }}
                  whileHover={{
                    y: -4,
                    scale: 1.008,
                    transition: { type: 'spring', stiffness: 380, damping: 24 },
                  }}
                  className="group relative p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-shadow duration-300 flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 cursor-default"
                >
                  {/* Left: Date Capsule + Doctor & Clinical Info */}
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-5 flex-1 min-w-0">
                    
                    {/* Calendar Date Pill */}
                    <div className="w-12 sm:w-18 h-13 sm:h-18 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center shrink-0 text-center font-mono select-none shadow-2xs transition-transform duration-300 group-hover:scale-105 group-hover:border-slate-300">
                      <span className="text-[8.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                        {dt.month}
                      </span>
                      <span className="text-base sm:text-2xl font-black text-slate-900 leading-tight my-0.5">
                        {dt.dayNum}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                        {dt.dayOfWeek}
                      </span>
                    </div>

                    {/* Doctor Avatar */}
                    <div className="relative size-11 sm:size-14 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs group-hover:shadow-md transition-all duration-300">
                      <img
                        src={(appt.doctorImage || '').replace(/^\/doctors\//, '/doctor-images/') || `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`}
                        alt={appt.doctorName}
                        className="w-full h-full object-cover object-[center_25%] transition-transform duration-500 ease-out group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = '1';
                            target.src = `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`;
                          }
                        }}
                      />
                    </div>

                    {/* Doctor & Appointment Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                          {appt.doctorName}
                        </h4>
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10.5px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 shrink-0">
                          {appt.departmentName}
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-slate-400 font-medium shrink-0">
                          #{appt.bookingId}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-800 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#135940]" />
                          <span>{appt.time}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 font-medium truncate max-w-[130px] sm:max-w-none">
                          {appt.specialty}
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="items-center gap-1 text-slate-500 hidden sm:flex">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{appt.location || 'Medical Tower 4, Suite 800'}</span>
                        </span>
                      </div>

                      {hasUserProvidedReason(appt.reason) && (
                        <p className="text-[11px] sm:text-[11.5px] text-slate-500 mt-1 line-clamp-1 italic">
                          &ldquo;{appt.reason}&rdquo;
                        </p>
                      )}

                      {isRejected && appt.rejectionReason && (
                        <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Clinic note: {appt.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Pill & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-2.5 sm:gap-3 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0 w-full xl:w-auto">
                    
                    {/* Status Badge */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Confirmed Pass
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <X className="w-3 h-3 text-rose-600" />
                            Declined
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Check className="w-3 h-3 text-slate-500" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {isAdmin && isPending && (
                        <>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            onClick={() => handleApprove(appt.bookingId)}
                            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs min-h-[38px]"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                            onClick={() => handleReject(appt.bookingId)}
                            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs min-h-[38px]"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </motion.button>
                        </>
                      )}

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        onClick={() => setDirectionModalAppt(appt)}
                        className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
                        title="Hospital directions"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#135940] transition-transform duration-300 group-hover:rotate-45" />
                        <span>Directions</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        onClick={() => handleDownloadIcs(appt)}
                        className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
                        title="Add to Calendar (.ICS)"
                      >
                        <Download className="w-3.5 h-3.5 text-[#135940] transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span>Calendar</span>
                      </motion.button>

                      {/* Cancel or Delete Action */}
                      {cancellingId === appt.bookingId ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirmCancel(appt.bookingId)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer hover:bg-rose-700 min-h-[38px]"
                          >
                            Confirm
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCancellingId(null)}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer hover:bg-slate-200 min-h-[38px]"
                          >
                            No
                          </motion.button>
                        </div>
                      ) : isPending || isApproved ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15, rotate: 8 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                          onClick={() => setCancellingId(appt.bookingId)}
                          className="size-9.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                          title="Cancel Appointment"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      ) : (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15, rotate: 8 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                          onClick={() => handleDelete(appt.bookingId)}
                          className="size-9.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                          title="Remove Record"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ================================================================
             VIEW 2: MINIMALIST ARCHITECTURAL CARDS
             ================================================================ */
          <motion.div
            key={`view-cards-${statusFilter}-${deptFilter}`}
            variants={viewModeTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredAppointments.map((appt, idx) => {
              const isPending = appt.status === 'pending';
              const isApproved = appt.status === 'approved' || appt.status === 'upcoming';
              const isRejected = appt.status === 'rejected';
              const isCompleted = appt.status === 'completed';

              return (
                <motion.div
                  key={appt.bookingId}
                  initial={{ opacity: 0, y: 38, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.1 }}
                  transition={{
                    delay: Math.min((idx % 3) * 0.07, 0.22),
                    duration: 0.75,
                    ease: [0.16, 1, 0.3, 1], // Deceleration while scrolling
                  }}
                  whileHover={{
                    y: -6,
                    scale: 1.018,
                    transition: { type: 'spring', stiffness: 350, damping: 22 },
                  }}
                  className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between space-y-4 cursor-default"
                >
                  {/* Card Header: Department badge + Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 transition-transform duration-200 group-hover:scale-105">
                      {appt.departmentName}
                    </span>
                    <div className="transition-transform duration-200 group-hover:scale-105">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Confirmed
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <X className="w-3 h-3 text-rose-600" />
                          Declined
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Check className="w-3 h-3 text-slate-500" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Doctor Row */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative size-14 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs group-hover:shadow-md transition-all duration-300">
                      <img
                        src={(appt.doctorImage || '').replace(/^\/doctors\//, '/doctor-images/') || `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`}
                        alt={appt.doctorName}
                        className="w-full h-full object-cover object-[center_25%] transition-transform duration-500 ease-out group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = '1';
                            target.src = `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`;
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-slate-900 tracking-tight truncate">
                        {appt.doctorName}
                      </h4>
                      <p className="text-xs text-slate-500 truncate font-medium">
                        {appt.specialty}
                      </p>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        Pass ID: {appt.bookingId}
                      </span>
                    </div>
                  </div>

                  {/* Schedule & Location Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs font-mono transition-transform duration-300 group-hover:border-slate-200">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#135940]" />
                        <span className="font-semibold">{appt.date}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[#135940] font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{appt.time}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{appt.location || 'Medical Tower 4, Suite 800'}</span>
                    </div>
                  </div>

                  {hasUserProvidedReason(appt.reason) && (
                    <p className="text-[11.5px] text-slate-500 italic line-clamp-1">
                      &ldquo;{appt.reason}&rdquo;
                    </p>
                  )}

                  {isRejected && appt.rejectionReason && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{appt.rejectionReason}</span>
                    </div>
                  )}

                  {/* Card Footer Actions */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        onClick={() => setDirectionModalAppt(appt)}
                        className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[38px]"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#135940] transition-transform duration-300 group-hover:rotate-45" />
                        <span>Directions</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        onClick={() => handleDownloadIcs(appt)}
                        className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[38px]"
                      >
                        <Download className="w-3.5 h-3.5 text-[#135940] transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span>.ICS</span>
                      </motion.button>
                    </div>

                    {cancellingId === appt.bookingId ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleConfirmCancel(appt.bookingId)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer hover:bg-rose-700 min-h-[38px]"
                        >
                          Confirm
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCancellingId(null)}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] cursor-pointer hover:bg-slate-200 min-h-[38px]"
                        >
                          No
                        </motion.button>
                      </div>
                    ) : isPending || isApproved ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => setCancellingId(appt.bookingId)}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-600 font-medium cursor-pointer shrink-0 min-h-[38px] flex items-center justify-center"
                      >
                        Cancel
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => handleDelete(appt.bookingId)}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-600 font-medium cursor-pointer shrink-0 min-h-[38px] flex items-center justify-center"
                      >
                        Remove
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          5. INTERACTIVE HOSPITAL FLOOR MAP & DIRECTIONS MODAL
          ==================================================================== */}
      <AnimatePresence>
        {directionModalAppt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-7 shadow-2xl border border-slate-200 overflow-hidden text-left my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-9 sm:size-10 rounded-xl bg-emerald-50 text-[#135940] flex items-center justify-center shadow-xs shrink-0">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                      Hospital Wing & Suite Directions
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      WeCare Medical Tower &bull; Pass {directionModalAppt.bookingId}
                    </p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDirectionModalAppt(null)}
                  className="size-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Wayfinding Beacon Details */}
              <div className="space-y-3.5 sm:space-y-4 text-xs">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#135940] shrink-0" />
                    <span>Clinical Tower 4 &bull; 8th Floor Reception</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11.5px] sm:text-xs">
                    Check in at the 8th Floor concierge desk with Reference Code{' '}
                    <strong className="text-slate-900 font-mono font-bold">{directionModalAppt.bookingId}</strong>.
                    An admission nurse will escort you directly to Suite 800 for your consultation with{' '}
                    <strong className="text-slate-900">{directionModalAppt.doctorName}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">ELEVATOR BANK</span>
                    <span className="font-bold text-slate-800 text-xs">East Tower Elevators (Express 1-4)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">PARKING VALET</span>
                    <span className="font-bold text-slate-800 text-xs">Complimentary Plaza Parking Gate B</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2 text-[11px] sm:text-xs">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Please arrive 10 minutes prior to your scheduled consultation window ({directionModalAppt.time}) with your insurance card and photo ID.</span>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setDirectionModalAppt(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm text-center min-h-[42px] flex items-center justify-center"
                >
                  Got It, Thanks
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Status Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center justify-between sm:justify-start gap-3 px-4 py-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl text-xs sm:text-sm font-medium border border-slate-700 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="ml-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.section>
  );
}

export default MyAppointmentsBento;
