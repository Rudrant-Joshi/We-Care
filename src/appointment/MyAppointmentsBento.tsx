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
  Search,
  ArrowRight,
  QrCode,
  Activity,
  Compass,
  Check,
  Stethoscope,
  Info,
  RefreshCw,
} from 'lucide-react';

import type { StoredAppointment } from './types';
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
import { getDepartmentColor, DEPARTMENT_COLORS } from '../lib/department-colors';
import { useAuth } from '../auth/AuthContext';

/* ==========================================================================
   Animation Presets & Variants
   ========================================================================== */

const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

const sectionItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const viewModeTransitionVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.99, filter: 'blur(3px)' },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    filter: 'blur(3px)',
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

/* ==========================================================================
   Types & View Modes
   ========================================================================== */

type ViewMode = 'passbook' | 'timeline' | 'ledger';
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
  const [viewMode, setViewMode] = useState<ViewMode>('passbook');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'upcoming'>('latest');

  // Interactive modal states
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [directionModalAppt, setDirectionModalAppt] = useState<StoredAppointment | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

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
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as StoredAppointment;
            if (data && data.bookingId && !isMockAppointment(data.bookingId) && !isMockAppointment(docSnap.id)) {
              remoteList.push(data);
            }
          });
          const local = getStoredAppointments().filter((l) => !isMockAppointment(l.bookingId));
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

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const list = await syncAppointmentsFromFirestore();
      if (list) setAppointments(sortAppointmentsDescending(list));
      setNotification('Appointments synchronized with hospital cloud.');
    } catch {
      setNotification('Refreshed local records.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setTimeout(() => setNotification(null), 3000);
      }, 600);
    }
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
      className="relative w-full max-w-[1720px] mx-auto px-3.5 sm:px-8 md:px-14 py-6 md:py-14 font-sans"
    >
      
      {/* ====================================================================
          1. EXECUTIVE PATIENT TELEMETRY HEADER & COUNTDOWN HERO
          ==================================================================== */}
      <motion.div variants={sectionItemVariants} className="relative mb-8 pb-8 border-b border-slate-200/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting & Identity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-[#135940] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#135940] animate-pulse" />
                {isAdmin ? 'CHIEF CLINICAL LEDGER' : 'VERIFIED PATIENT SCHEDULE'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE SYNC
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
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
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2, borderColor: '#a7f3d0', color: '#135940' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              disabled={isSyncing}
              onClick={handleManualSync}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              title="Sync latest records from cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#135940] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05, y: -2, boxShadow: '0 14px 28px -4px rgba(19, 89, 64, 0.45)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => navigate('/book-appointment')}
              className="px-6 py-3.5 rounded-2xl text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#135940]/25 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
        
        {/* Metric 1: Total Consultations */}
        <motion.div
          variants={sectionItemVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-500">
              Total Visits
            </span>
            <div className="size-7 sm:size-9 rounded-xl bg-emerald-50 text-[#135940] flex items-center justify-center shadow-xs">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {stats.total}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span className="size-1.5 rounded-full bg-[#135940] animate-pulse shrink-0" />
            <span className="truncate">Lifetime schedule repository</span>
          </div>
        </motion.div>

        {/* Metric 2: Pending Triage Review */}
        <motion.div
          variants={sectionItemVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-amber-800">
              Pending Review
            </span>
            <div className="size-7 sm:size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-600 tabular-nums">
            {stats.pending}
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium truncate">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="truncate">Under hospital triage review</span>
          </div>
        </motion.div>

        {/* Metric 3: Approved & Confirmed Passes */}
        <motion.div
          variants={sectionItemVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-emerald-800">
              Active Passes
            </span>
            <div className="size-7 sm:size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-600 tabular-nums">
            {stats.approved}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium truncate">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">Suites allocated & confirmed</span>
          </div>
        </motion.div>

        {/* Metric 4: Completed Consultations */}
        <motion.div
          variants={sectionItemVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-slate-500">
              Completed Care
            </span>
            <div className="size-7 sm:size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-indigo-600 tabular-nums">
            {stats.completed}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span className="truncate">Consultation notes archived</span>
          </div>
        </motion.div>
      </div>

      {/* ====================================================================
          3. ADVANCED CONTROLS: SEARCH, FILTERS & 3-WAY VIEW SWITCHER
          ==================================================================== */}
      <motion.div variants={sectionItemVariants} className="p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 min-w-[240px] group">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-[#135940] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor, specialty, pass ID, or clinical reason..."
              className="w-full h-11 pl-10 pr-9 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base sm:text-sm font-medium hover:bg-slate-100/70 focus:bg-white focus:border-[#135940] focus:ring-4 focus:ring-[#135940]/15 outline-none transition-all"
            />
            {searchQuery && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

          {/* Sort Order Toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -1, borderColor: '#a7f3d0', color: '#135940' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            onClick={() => setSortOrder((prev) => (prev === 'latest' ? 'upcoming' : 'latest'))}
            className="h-11 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer select-none shrink-0"
            title="Toggle sort order"
          >
            <motion.div
              animate={{ rotate: sortOrder === 'latest' ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#135940]" />
            </motion.div>
            <span>{sortOrder === 'latest' ? 'Newest First' : 'Earliest First'}</span>
          </motion.button>

          {/* View Mode Switcher: Passbook vs Timeline vs Ledger */}
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 text-xs w-full lg:w-auto shrink-0 justify-between sm:justify-start">
            <motion.button
              type="button"
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => setViewMode('passbook')}
              className={`flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer select-none ${
                viewMode === 'passbook' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {viewMode === 'passbook' && (
                <motion.div
                  layoutId="active-view-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#135940] to-[#1b7454] shadow-md shadow-[#135940]/25"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <QrCode className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Passbook</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => setViewMode('timeline')}
              className={`flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer select-none ${
                viewMode === 'timeline' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {viewMode === 'timeline' && (
                <motion.div
                  layoutId="active-view-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#135940] to-[#1b7454] shadow-md shadow-[#135940]/25"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Activity className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Timeline</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => setViewMode('ledger')}
              className={`flex-1 sm:flex-initial relative flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer select-none ${
                viewMode === 'ledger' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {viewMode === 'ledger' && (
                <motion.div
                  layoutId="active-view-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#135940] to-[#1b7454] shadow-md shadow-[#135940]/25"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <List className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Ledger</span>
            </motion.button>
          </div>
        </div>

        {/* Status Tabs Bar with Native App Pill Slider */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-x-auto scrollbar-none max-w-full">
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
                  className={`shrink-0 relative px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive ? 'text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-status-tab"
                      className="absolute inset-0 rounded-xl shadow-md shadow-slate-900/10"
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
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="hidden sm:inline">Specialty:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold outline-none cursor-pointer hover:bg-white transition-colors"
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
        ) : viewMode === 'passbook' ? (
          /* ================================================================
             VIEW 1: LUXURY MEDICAL BOARDING PASSBOOK (Default)
             ================================================================ */
          <motion.div
            key={`view-passbook-${statusFilter}-${deptFilter}`}
            variants={viewModeTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch"
          >
            {filteredAppointments.map((appt, idx) => {
              const deptColor = getDepartmentColor(appt.departmentId);
              const isPending = appt.status === 'pending';
              const isApproved = appt.status === 'approved' || appt.status === 'upcoming';
              const isRejected = appt.status === 'rejected';
              const isCompleted = appt.status === 'completed';

              return (
                <motion.div
                  key={appt.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ delay: (idx % 3) * 0.04, duration: 0.35 }}
                  whileHover={{ y: -5 }}
                  className="group relative w-full flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
                >
                  {/* Top Colored Signature Strip */}
                  <div
                    className="h-2 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${deptColor.gradientFrom}, ${deptColor.gradientTo})`,
                    }}
                  />

                  {/* Main Pass Container */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
                      {/* Pass Header: Department, Booking ID, Status Badge */}
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100/90 mb-3.5">
                          <span
                            className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono font-bold uppercase tracking-wider text-white shadow-2xs"
                            style={{
                              background: `linear-gradient(135deg, ${deptColor.gradientFrom}, ${deptColor.gradientTo})`,
                            }}
                          >
                            {appt.departmentName}
                          </span>

                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending Review
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Confirmed Pass
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Doctor Profile Header with Hover Spring Zoom */}
                        <div className="flex items-center gap-3.5">
                          <motion.div
                            whileHover={{ scale: 1.08, rotate: 2 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                            className="relative size-14 sm:size-16 rounded-2xl overflow-hidden shrink-0 border-2 bg-slate-100 shadow-sm"
                            style={{ borderColor: `${deptColor.gradientFrom}50` }}
                          >
                            <img
                              src={(appt.doctorImage || '').replace(/^\/doctors\//, '/doctor-images/') || `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`}
                              alt={appt.doctorName}
                              className="w-full h-full object-cover object-[center_25%]"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.fallback) {
                                  target.dataset.fallback = '1';
                                  target.src = `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`;
                                }
                              }}
                            />
                          </motion.div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                              {appt.doctorName}
                            </h4>
                            <p className="text-xs text-slate-500 truncate font-medium">
                              {appt.specialty}
                            </p>
                            <span className="text-[11px] font-mono font-bold text-slate-400 block mt-0.5">
                              Pass: {appt.bookingId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Ticket Matrix */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">CONSULTATION DATE</span>
                          <span className="font-bold text-slate-900 flex items-center gap-1 truncate">
                            <CalendarIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                            {appt.date}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">TIME WINDOW</span>
                          <span className="font-bold text-slate-900 flex items-center gap-1 truncate">
                            <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                            {appt.time}
                          </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            Tower 4, Suite 800
                          </span>
                          <span className="font-bold text-slate-700 shrink-0">
                            {appt.insuranceProvider ? 'In-Network' : 'Self-Pay'}
                          </span>
                        </div>
                      </div>

                      {/* Admin Triage Feedback Note (if rejected) */}
                      {isRejected && appt.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>Clinic note: {appt.rejectionReason}</span>
                        </div>
                      )}

                      {/* Perforated Seam Line */}
                      <div className="relative py-1">
                        <div className="border-t border-dashed border-slate-300" />
                        <div className="absolute -left-7 top-1/2 -translate-y-1/2 size-4 rounded-full bg-slate-50 border-r border-slate-200" />
                        <div className="absolute -right-7 top-1/2 -translate-y-1/2 size-4 rounded-full bg-slate-50 border-l border-slate-200" />
                      </div>

                      {/* Action Bar with Motion Micro-interactions */}
                      <div className="space-y-2">
                        {isAdmin && isPending && (
                          <div className="grid grid-cols-2 gap-2">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.04, y: -1 }}
                              whileTap={{ scale: 0.96 }}
                              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                              onClick={() => handleApprove(appt.bookingId)}
                              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.04, y: -1 }}
                              whileTap={{ scale: 0.96 }}
                              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                              onClick={() => handleReject(appt.bookingId)}
                              className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </motion.button>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                            onClick={() => setDirectionModalAppt(appt)}
                            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#135940]" />
                            <span>Clinic Map</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.08, y: -1, rotate: -3 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                            onClick={() => handleDownloadIcs(appt)}
                            className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#135940] text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Download Calendar (.ics)"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Cancel / Reschedule footer links */}
                        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 font-medium">
                          {isApproved || isPending ? (
                            <>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05, x: 2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/book-appointment')}
                                className="text-[#135940] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reschedule</span>
                              </motion.button>

                              {cancellingId === appt.bookingId ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-rose-600 font-bold">Cancel?</span>
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => handleConfirmCancel(appt.bookingId)}
                                    className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] cursor-pointer shadow-2xs"
                                  >
                                    Yes
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={() => setCancellingId(null)}
                                    className="text-slate-400 hover:text-slate-700 text-[10px] cursor-pointer"
                                  >
                                    No
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setCancellingId(appt.bookingId)}
                                  className="text-rose-600 hover:text-rose-700 cursor-pointer font-semibold"
                                >
                                  Cancel Pass
                                </motion.button>
                              )}
                            </>
                          ) : (
                            <>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05, x: 2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/book-appointment')}
                                className="text-[#135940] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>Rebook Visit</span>
                              </motion.button>

                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(appt.bookingId)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                Remove Pass
                              </motion.button>
                            </>
                          )}
                        </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : viewMode === 'timeline' ? (
          /* ================================================================
             VIEW 2: CLINICAL JOURNEY TIMELINE
             ================================================================ */
          <motion.div
            key="view-timeline"
            variants={viewModeTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative max-w-3xl mx-auto py-6 space-y-6"
          >
            {/* Center Track Line with Animated Glow */}
            <div className="absolute top-6 bottom-6 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-[#135940] via-emerald-600 to-slate-200" />

            {filteredAppointments.map((appt) => {
              const deptColor = getDepartmentColor(appt.departmentId);

              return (
                <div key={appt.bookingId} className="relative flex items-start gap-4 sm:gap-6 pl-2 group">
                  {/* Timeline Node Icon with Magnetic Spring Hover */}
                  <motion.div
                    whileHover={{ scale: 1.25, rotate: 12 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                    className="relative z-10 size-10 sm:size-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 border-2 border-white cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${deptColor.gradientFrom}, ${deptColor.gradientTo})`,
                      boxShadow: `0 4px 14px ${deptColor.gradientFrom}45`,
                    }}
                  >
                    <Stethoscope className="w-5 h-5 text-white" />
                  </motion.div>

                  {/* Card Content with Slide & Lift Micro-interaction */}
                  <motion.div
                    whileHover={{ x: 6, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex-1 p-4 sm:p-5 rounded-3xl backdrop-blur-md border transition-all duration-300"
                    style={{
                      background: `linear-gradient(175deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.94) 65%, ${deptColor.gradientFrom}08 100%)`,
                      borderColor: `${deptColor.gradientFrom}35`,
                      boxShadow: `0 6px 20px -4px ${deptColor.gradientFrom}18, 0 2px 8px rgba(0,0,0,0.03)`,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {appt.date} &bull; {appt.time}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-white shadow-2xs"
                          style={{ backgroundColor: deptColor.gradientFrom }}
                        >
                          {appt.departmentName}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        ID: {appt.bookingId}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900">
                      {appt.doctorName},{' '}
                      <span className="text-slate-500 font-medium text-sm">{appt.specialty}</span>
                    </h4>

                    {appt.reason && (
                      <p className="text-xs text-slate-600 mt-1 italic">
                        &ldquo;{appt.reason}&rdquo;
                      </p>
                    )}

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#135940]" />
                        WeCare Medical Tower 4, Suite 800
                      </span>

                      <div className="flex items-center gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDirectionModalAppt(appt)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          Directions
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownloadIcs(appt)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#135940] hover:bg-emerald-100 font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.ICS</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          /* ================================================================
             VIEW 3: EXECUTIVE HIGH-DENSITY LEDGER
             ================================================================ */
          <motion.div
            key="view-ledger"
            variants={viewModeTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Pass ID</th>
                    <th className="py-3.5 px-4 font-bold">Physician & Specialty</th>
                    <th className="py-3.5 px-4 font-bold">Scheduled Time</th>
                    <th className="py-3.5 px-4 font-bold">Patient</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appt) => {
                    const deptColor = getDepartmentColor(appt.departmentId);
                    return (
                      <motion.tr
                        key={appt.bookingId}
                        whileHover={{
                          backgroundColor: 'rgba(248, 250, 252, 0.95)',
                          scale: 1.002,
                          transition: { duration: 0.15 },
                        }}
                        className="transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {appt.bookingId}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 group-hover:text-[#135940] transition-colors">
                            {appt.doctorName}
                          </div>
                          <span
                            className="text-[10px] font-mono font-bold uppercase"
                            style={{ color: deptColor.gradientFrom }}
                          >
                            {appt.departmentName} &bull; {appt.specialty}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          <div className="font-bold">{appt.date}</div>
                          <div className="text-[11px] text-slate-400">{appt.time}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          <div>{appt.patientName}</div>
                          <div className="text-[11px] text-slate-400">{appt.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.15, rotate: -4 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownloadIcs(appt)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#135940] hover:bg-emerald-50 cursor-pointer"
                              title="Download Calendar"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.15, rotate: 4 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDirectionModalAppt(appt)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#135940] hover:bg-emerald-50 cursor-pointer"
                              title="Floor Directions"
                            >
                              <Compass className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
              className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-7 shadow-2xl border border-slate-200 overflow-hidden text-left my-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-xl bg-emerald-50 text-[#135940] flex items-center justify-center shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Hospital Wing & Suite Directions
                    </h3>
                    <p className="text-xs text-slate-500">
                      WeCare Medical Tower &bull; Pass {directionModalAppt.bookingId}
                    </p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDirectionModalAppt(null)}
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Wayfinding Beacon Details */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#135940]" />
                    Clinical Tower 4 &bull; 8th Floor Reception
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Check in at the 8th Floor concierge desk with Reference Code{' '}
                    <strong className="text-slate-900 font-mono font-bold">{directionModalAppt.bookingId}</strong>.
                    An admission nurse will escort you directly to Suite 800 for your consultation with{' '}
                    <strong className="text-slate-900">{directionModalAppt.doctorName}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">ELEVATOR BANK</span>
                    <span className="font-bold text-slate-800">East Tower Elevators (Express 1-4)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">PARKING VALET</span>
                    <span className="font-bold text-slate-800">Complimentary Plaza Parking Gate B</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Please arrive 10 minutes prior to your scheduled consultation window ({directionModalAppt.time}) with your insurance card and photo ID.</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setDirectionModalAppt(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl text-xs sm:text-sm font-medium border border-slate-700 backdrop-blur-md"
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
