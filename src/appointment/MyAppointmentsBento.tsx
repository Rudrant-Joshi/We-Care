"use client";

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Download,
  PlusCircle,
  Building2,
  ShieldCheck,
  RotateCcw,
  CalendarCheck2,
  ListFilter,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  List,
  LayoutGrid,
  Sparkles,
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
} from './storage';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { getDepartmentColor } from '../lib/department-colors';
import { useAuth } from '../auth/AuthContext';

export function MyAppointmentsBento() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com';

  const loadAppointments = () => {
    const list = isAdmin
      ? getStoredAppointments().filter((a) => !isMockAppointment(a.bookingId))
      : getUserAppointments(currentUser).filter((a) => !isMockAppointment(a.bookingId));
    setAppointments(list);
  };

  // Load appointments: all hospital appointments for admin, personal schedule for patient.
  // Strictly rejects any fake/mock appointments.
  useEffect(() => {
    loadAppointments();
    syncAppointmentsFromFirestore().then((cloudList) => {
      const cleanList = (cloudList || []).filter((a) => !isMockAppointment(a.bookingId));
      if (isAdmin) {
        setAppointments(cleanList.length > 0 ? cleanList : getStoredAppointments());
      } else {
        const userList = cleanList.filter(
          (a) =>
            currentUser?.email &&
            a.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
        );
        setAppointments(userList.length > 0 ? userList : getUserAppointments(currentUser));
      }
    });

    // Real-time Firestore synchronization for live patient booking telemetry
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
            setAppointments(merged);
          } else {
            const userList = merged.filter(
              (a) =>
                currentUser?.email &&
                a.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
            );
            setAppointments(userList);
          }
        } else {
          loadAppointments();
        }
      });
    } catch {
      // Fallback
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [currentUser, isAdmin]);

  // Sync when appointments or auth state changes
  useEffect(() => {
    const handleSync = () => {
      loadAppointments();
    };
    window.addEventListener('wecare_appointments_changed', handleSync);
    window.addEventListener('wecare_auth_state_changed', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('wecare_appointments_changed', handleSync);
      window.removeEventListener('wecare_auth_state_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [currentUser, isAdmin]);

  // Compute live summary statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const approved = appointments.filter((a) => a.status === 'approved' || a.status === 'upcoming').length;
    const rejected = appointments.filter((a) => a.status === 'rejected').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    return { total, pending, approved, rejected, completed };
  }, [appointments]);

  // Filtered list
  const filteredAppointments = useMemo(() => {
    if (filter === 'pending') {
      return appointments.filter((a) => a.status === 'pending');
    }
    if (filter === 'approved') {
      return appointments.filter((a) => a.status === 'approved' || a.status === 'upcoming');
    }
    if (filter === 'rejected') {
      return appointments.filter((a) => a.status === 'rejected');
    }
    if (filter === 'completed') {
      return appointments.filter((a) => a.status === 'completed');
    }
    return appointments;
  }, [appointments, filter]);

  // Handle clinical approval by admin
  const handleApprove = (bookingId: string) => {
    approveStoredAppointment(bookingId);
    loadAppointments();
    setNotification(`Appointment ${bookingId} has been approved.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle rejection by admin
  const handleReject = (bookingId: string) => {
    rejectStoredAppointment(bookingId);
    loadAppointments();
    setNotification(`Appointment ${bookingId} has been rejected.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle appointment cancellation
  const handleConfirmCancel = (bookingId: string) => {
    cancelStoredAppointment(bookingId);
    loadAppointments();
    setCancellingId(null);
    setNotification(`Appointment ${bookingId} has been successfully cancelled.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle appointment deletion from history
  const handleDeleteAppointment = (bookingId: string) => {
    deleteStoredAppointment(bookingId);
    loadAppointments();
    setNotification(`Appointment record ${bookingId} removed from history.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Download ICS helper
  const handleDownloadIcs = (appt: StoredAppointment) => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:WeCare Clinical Appointment - ${appt.doctorName}\nDESCRIPTION:${appt.specialty} with ${appt.doctorName}. Booking ID: ${appt.bookingId}.\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
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
    <section id="my-appointments-section" className="relative w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-14 py-8 md:py-16">
      
      {/* Top Section Header with Prominent Counter & CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-200/90 relative">
        <div>
          {isAdmin ? (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-100 border border-purple-300 text-purple-800 text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                <span>ALL PATIENT APPOINTMENTS &bull; CHIEF ADMIN CLEARANCE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">
                All Hospital{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                  Appointments
                </span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
                Full hospital clinical ledger. Review, verify, and monitor scheduled consultations across all registered patients and clinical departments.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-100 via-sky-50 to-indigo-100 border border-blue-300 text-blue-800 text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>PATIENT CLINICAL SCHEDULE REPOSITORY</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">
                My Scheduled{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                  Appointments
                </span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
                Manage your clinical appointments, view digital hospital admission passes, and schedule consultations with WeCare board-certified specialists.
              </p>
            </>
          )}
        </div>

        {/* Primary CTA: Book Another Appointment */}
        <div className="shrink-0 flex items-center gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => navigate('/book-appointment')}
            className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:brightness-110 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2.5 cursor-pointer transform-gpu"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Appointment</span>
          </motion.button>
        </div>
      </div>

      {/* Global Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS BENTO ROW: 3-column rich chromatic overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        
        {/* Total Appointments Count (Blue / Sky Theme) */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-blue-50/50 to-sky-100/30 border border-blue-200/90 shadow-sm relative overflow-hidden group hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all transform-gpu will-change-transform"
        >
          {/* Top color bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
          
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-mono font-bold text-blue-900 uppercase tracking-wider">
              {isAdmin ? 'Total Bookings' : 'Total Appointments'}
            </span>
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/30 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100/90 px-2.5 py-0.5 rounded-full border border-blue-200">
              all bookings
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-600 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
            <span>{isAdmin ? 'Hospital ledger records' : 'Your clinical appointment history'}</span>
          </div>
        </motion.div>

        {/* Pending Approval Count (Amber / Gold Theme) */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ delay: 0.06, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-amber-50/70 to-orange-100/35 border border-amber-300/90 shadow-sm relative overflow-hidden group hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/15 transition-all transform-gpu will-change-transform"
        >
          {/* Top color bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600" />

          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-mono font-bold text-amber-900 uppercase tracking-wider">
              Pending Approval
            </span>
            <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black text-amber-600 tabular-nums">
              {stats.pending}
            </span>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              {isAdmin ? 'Action Required' : 'Awaiting Review'}
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
            <span className="relative flex size-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            </span>
            <span>{isAdmin ? 'Approve or reject patient slots' : 'Pending clinic admin review'}</span>
          </div>
        </motion.div>

        {/* Approved & Active Consultations (Emerald / Teal Theme) */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ delay: 0.12, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-emerald-50/70 to-teal-100/35 border border-emerald-300/90 shadow-sm relative overflow-hidden group hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/15 transition-all transform-gpu will-change-transform"
        >
          {/* Top color bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-mono font-bold text-emerald-900 uppercase tracking-wider">
              Approved & Active
            </span>
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 tabular-nums">
              {stats.approved}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Confirmed
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
            <span className="relative flex size-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span>{isAdmin ? 'Confirmed patient consultations' : 'Confirmed hospital admission passes'}</span>
          </div>
        </motion.div>

      </div>

      {/* Filter Tabs Bar with Sliding Layout Pill */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-4 mb-8 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md shadow-slate-900/5">
        {/* Top vibrant accent border */}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full opacity-80" />

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          {(
            [
              { id: 'all', label: `All (${stats.total})`, activeGradient: 'from-blue-600 to-indigo-600' },
              { id: 'pending', label: `Pending (${stats.pending})`, activeGradient: 'from-amber-500 to-orange-600' },
              { id: 'approved', label: `Approved (${stats.approved})`, activeGradient: 'from-emerald-600 to-teal-600' },
              { id: 'rejected', label: `Rejected (${stats.rejected})`, activeGradient: 'from-rose-600 to-red-600' },
              { id: 'completed', label: `Completed (${stats.completed})`, activeGradient: 'from-slate-700 to-slate-900' },
            ] as const
          ).map((tab) => {
            const isActive = filter === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  isActive ? 'text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-appointments-filter-pill"
                    className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.activeGradient} shadow-sm`}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 font-extrabold">
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-600 hidden sm:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <ListFilter className="w-3.5 h-3.5 text-blue-600" />
            <span>Showing <strong className="text-slate-900 font-bold">{filteredAppointments.length}</strong> record{filteredAppointments.length === 1 ? '' : 's'}</span>
          </div>

          {/* View Mode Switcher: Simple List vs Cards */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Simple List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Simple List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* APPOINTMENT RECORDS WITH ANIMATE PRESENCE */}
      <AnimatePresence mode="wait">
        {filteredAppointments.length > 0 ? (
          viewMode === 'list' ? (
            /* SIMPLE & SWEET LIST VIEW */
            <motion.div
              key={`list-${filter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {filteredAppointments.map((appt) => {
                const isPending = appt.status === 'pending';
                const isApproved = appt.status === 'approved' || appt.status === 'upcoming';
                const isRejected = appt.status === 'rejected';
                const isCompleted = appt.status === 'completed';
                const isCancelled = appt.status === 'cancelled';
                const deptColor = getDepartmentColor(appt.departmentId);

                return (
                  <motion.div
                    key={appt.bookingId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-white via-white to-slate-50/70 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden"
                    style={{
                      borderLeftWidth: '5px',
                      borderLeftColor: deptColor.gradientFrom,
                    }}
                  >
                    {/* Subtle top/bottom color glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at top left, ${deptColor.gradientFrom}0d, transparent 70%)`,
                      }}
                    />

                    {/* Left: Doctor & Patient Info */}
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1 relative z-10">
                      {/* Doctor Avatar with department color ring */}
                      <div
                        className="relative size-13 rounded-xl overflow-hidden shrink-0 border-2 bg-slate-100 shadow-sm"
                        style={{ borderColor: `${deptColor.gradientFrom}55` }}
                      >
                        <img
                          src={appt.doctorImage}
                          alt={appt.doctorName}
                          className="w-full h-full object-cover object-[center_25%]"
                        />
                        <span
                          className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: deptColor.gradientFrom }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wide">
                            ID: {appt.bookingId}
                          </span>
                          <span
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-xs"
                            style={{
                              background: `linear-gradient(135deg, ${deptColor.gradientFrom}, ${deptColor.gradientTo})`,
                              boxShadow: `0 2px 8px ${deptColor.gradientFrom}40`,
                            }}
                          >
                            {appt.departmentName}
                          </span>

                          {/* Status Badges */}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-300 shadow-2xs">
                              <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-2 bg-amber-500"></span>
                              </span>
                              <span>Pending Admin Approval</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 border border-emerald-300 shadow-2xs">
                              <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                              </span>
                              <span>Approved & Confirmed</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-rose-50 to-red-50 text-rose-900 border border-rose-300 shadow-2xs">
                              <X className="w-3 h-3 text-rose-600" />
                              <span>Rejected by Clinic</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                              <span>Completed</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200">
                              <span>Cancelled</span>
                            </span>
                          )}
                        </div>

                        {/* Patient Name (prominent for Admin) */}
                        {isAdmin && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-1 p-1 px-2 rounded-lg bg-purple-50 border border-purple-200/80 w-fit">
                            <span className="font-extrabold text-purple-900 text-xs">
                              Patient: {appt.patientName}
                            </span>
                            <span className="text-[11px] text-purple-700">
                              &bull; {appt.email} &bull; {appt.phone}
                            </span>
                          </div>
                        )}

                        {/* Doctor Name & Specialty */}
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-900 font-extrabold">{appt.doctorName}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-600 font-normal">{appt.specialty}</span>
                        </div>

                        {appt.reason && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                            <span className="font-medium text-slate-600 not-italic">Intake Reason:</span> &ldquo;{appt.reason}&rdquo;
                          </p>
                        )}
                        {isPending && (
                          <p className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>This request is awaiting clinic administrative review and confirmation.</span>
                          </p>
                        )}
                        {isRejected && appt.rejectionReason && (
                          <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>Note: {appt.rejectionReason}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Date, Time, Location & Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3.5 sm:gap-5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 relative z-10">
                      {/* Schedule Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900 font-mono bg-blue-50/90 border border-blue-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs text-xs">
                          <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>{appt.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-sky-900 font-mono bg-sky-50/90 border border-sky-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs text-xs">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>{appt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-900 font-medium bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[170px]">{appt.location || 'Clinical Suite'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Admin Direct Actions on Pending */}
                        {isAdmin && isPending && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(appt.bookingId)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/20"
                              title="Approve this appointment"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(appt.bookingId)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-105 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-rose-500/20"
                              title="Reject this appointment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadIcs(appt)}
                          className="p-2.5 rounded-xl border border-blue-200 text-blue-700 bg-blue-50/70 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer shadow-2xs"
                          title="Download Calendar (.ics)"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {(isApproved || isPending) && (
                          cancellingId === appt.bookingId ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-rose-600 font-bold">Cancel?</span>
                              <button
                                type="button"
                                onClick={() => handleConfirmCancel(appt.bookingId)}
                                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancellingId(null)}
                                className="px-1 text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCancellingId(appt.bookingId)}
                              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                              title="Cancel Consultation"
                            >
                              Cancel
                            </button>
                          )
                        )}

                        {/* Delete from history if completed, cancelled or rejected */}
                        {(isCompleted || isCancelled || isRejected) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAppointment(appt.bookingId)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove from history"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* BENTO CARDS GRID */
            <motion.div
              key={`cards-${filter}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch"
            >
              {filteredAppointments.map((appt, idx) => {
                const isPending = appt.status === 'pending';
                const isApproved = appt.status === 'approved' || appt.status === 'upcoming';
                const isRejected = appt.status === 'rejected';
                const isCompleted = appt.status === 'completed';
                const isCancelled = appt.status === 'cancelled';
                const deptColor = getDepartmentColor(appt.departmentId);
                const gradFrom = deptColor.gradientFrom;
                const gradTo = deptColor.gradientTo;

              return (
                <motion.div
                  key={appt.bookingId}
                  initial={{ opacity: 0, y: 55, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
                  transition={{ duration: 0.5, delay: (idx % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-full rounded-2xl transition-all duration-300 transform-gpu flex flex-col justify-between will-change-transform"
                >
                  {/* 1. Skewed gradient backing panel with canonical department colors (pure GPU transform) */}
                  <span
                    className="absolute -top-1.5 left-[10px] w-[calc(100%-12px)] h-full rounded-2xl transform skew-x-[6deg] opacity-90 group-hover:skew-x-[2deg] group-hover:opacity-100 transition-transform duration-300 pointer-events-none z-0 transform-gpu"
                    style={{
                      background: `linear-gradient(315deg, ${gradFrom}, ${gradTo})`,
                    }}
                  />

                  {/* 2. Blurred vibrant neon glow shadow */}
                  <span
                    className="absolute -top-1 left-[10px] w-[calc(100%-12px)] h-full rounded-2xl transform skew-x-[6deg] opacity-55 blur-[24px] group-hover:skew-x-[2deg] group-hover:opacity-80 group-hover:blur-[30px] transition-all duration-300 pointer-events-none z-0 transform-gpu"
                    style={{
                      background: `linear-gradient(315deg, ${gradFrom}, ${gradTo})`,
                    }}
                  />

                {/* 3. Foreground Liquid Glass Content Panel with color-infused tint */}
                <div
                  className="relative z-20 h-full p-5 sm:p-6 backdrop-blur-md rounded-2xl border text-slate-900 transition-all duration-300 flex flex-col justify-between transform-gpu overflow-hidden bg-white"
                  style={{
                    background: `linear-gradient(175deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 55%, ${gradFrom}14 100%)`,
                    borderColor: `${gradFrom}45`,
                    boxShadow: `0 10px 28px -6px ${gradFrom}28, 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.95)`,
                  }}
                >
                  {/* Top colored accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`,
                    }}
                  />

                  {/* Header: Booking ID + Status Badge */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3.5">
                      <span className="text-[11px] font-mono font-bold tracking-wider text-slate-600 uppercase">
                        ID: {appt.bookingId}
                      </span>

                      {/* Status Indicator */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>PENDING APPROVAL</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>APPROVED & ACTIVE</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          <X className="w-3 h-3 text-rose-600" />
                          <span>REJECTED</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          <span>COMPLETED</span>
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200">
                          <span>CANCELLED</span>
                        </span>
                      )}
                    </div>

                    {/* Admin Mode: Patient Identity Pill */}
                    {isAdmin && (
                      <div className="mb-3.5 p-2.5 rounded-xl bg-purple-50/90 border border-purple-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                            {appt.patientName ? appt.patientName.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{appt.patientName}</span>
                            <span className="text-slate-500 block text-[10px] truncate">{appt.email} &bull; {appt.phone}</span>
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[9.5px] font-mono font-bold">
                          PATIENT
                        </span>
                      </div>
                    )}

                    {/* Doctor Info Row */}
                    <div className="flex items-center gap-3.5 mb-4 p-3 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs">
                      <div className="relative size-14 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 bg-slate-100">
                        <img
                          src={appt.doctorImage}
                          alt={appt.doctorName}
                          className="w-full h-full object-cover object-[center_25%]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider block truncate"
                          style={{ color: gradFrom }}
                        >
                          {appt.departmentName} &bull; {appt.specialty}
                        </span>
                        <h4 className="text-base font-black text-slate-900 truncate">
                          {appt.doctorName}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {appt.doctorRole}
                        </p>
                      </div>
                    </div>

                    {/* Schedule & Location Matrix */}
                    <div className="space-y-2 text-xs mb-4">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 font-mono">
                        <div className="flex items-center gap-2 text-slate-700">
                          <CalendarIcon className="w-3.5 h-3.5" style={{ color: gradFrom }} />
                          <span className="font-bold">{appt.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5" style={{ color: gradFrom }} />
                          <span className="font-bold">{appt.time}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 text-slate-700 flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: gradFrom }} />
                        <div className="min-w-0">
                          <span className="font-bold block leading-tight">
                            In-Person Clinical Consultation
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {appt.location || 'WeCare Clinical Tower 4, Suite 800'}
                          </span>
                        </div>
                      </div>

                      {appt.reason && (
                        <div
                          className="p-2.5 rounded-xl border text-[11px] text-slate-600"
                          style={{
                            backgroundColor: `${gradFrom}0a`,
                            borderColor: `${gradFrom}28`,
                          }}
                        >
                          <span className="font-bold block mb-0.5" style={{ color: gradFrom }}>
                            Clinical Reason:
                          </span>
                          <p className="line-clamp-2">{appt.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3.5 border-t border-slate-200/80 space-y-2">
                    
                    {/* Primary Action Button */}
                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.025, y: -1 }}
                          whileTap={{ scale: 0.975 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          onClick={() => alert(`Directions to WeCare Clinical Tower 4, Suite 800:\nCheck in at 8th Floor Reception with Reference: ${appt.bookingId}`)}
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:brightness-105 transform-gpu"
                          style={{
                            background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                            boxShadow: `0 4px 14px ${gradFrom}35`,
                          }}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Clinic Directions</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          onClick={() => handleDownloadIcs(appt)}
                          title="Download Calendar (.ics)"
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer transform-gpu"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}

                    {/* Admin Direct Action Buttons on Pending Cards */}
                    {isAdmin && isPending && (
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleApprove(appt.bookingId)}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Approve this appointment"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(appt.bookingId)}
                          className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Reject this appointment"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* Secondary Actions: Reschedule / Cancel / Delete */}
                    <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-slate-100">
                      {(isApproved || isPending) ? (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('/book-appointment')}
                            className="font-bold flex items-center gap-1 cursor-pointer hover:underline"
                            style={{ color: gradFrom }}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reschedule</span>
                          </button>

                          {cancellingId === appt.bookingId ? (
                            <div className="flex items-center gap-2">
                              <span className="text-rose-600 font-bold text-[10px]">Sure?</span>
                              <button
                                type="button"
                                onClick={() => handleConfirmCancel(appt.bookingId)}
                                className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Yes, Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancellingId(null)}
                                className="text-slate-500 text-[10px] hover:text-slate-800"
                              >
                                Back
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCancellingId(appt.bookingId)}
                              className="text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate('/book-appointment')}
                            className="font-bold flex items-center gap-1 cursor-pointer hover:underline"
                            style={{ color: gradFrom }}
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Book New Slot</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAppointment(appt.bookingId)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            Remove Record
                          </button>
                        </>
                      )}
                    </div>

                  </div>

                </div>
                </motion.div>
              );
            })}
          </motion.div>
        )) : appointments.length === 0 ? (
          /* Empty State for New User / Blank Schedule */
          <motion.div
            key="empty-no-appointments"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative p-10 sm:p-14 text-center rounded-3xl bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/40 border border-blue-200/90 shadow-lg max-w-xl mx-auto my-6 overflow-hidden transform-gpu"
          >
            {/* Top accent gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
            
            {/* Ambient colorful glow halo */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 size-48 rounded-full bg-gradient-to-br from-blue-400/20 via-sky-300/20 to-purple-400/15 blur-2xl pointer-events-none" />

            <div className="relative size-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/30 border border-white/40">
              <CalendarIcon className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
              {isAdmin ? 'No Hospital Appointments On Record' : 'No Appointments Booked Yet'}
            </h3>

            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
              {isAdmin
                ? 'There are currently no patient consultation bookings registered in the hospital system ledger.'
                : currentUser
                  ? `Hello ${currentUser.name}, your schedule is currently blank. Schedule your consultation with our board-certified specialists and your booking telemetry will appear here.`
                  : 'Your clinical schedule is currently blank. Sign in or register to book and manage consultations with our verified medical specialists.'}
            </p>

            {/* Quick Colored Guarantees Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 border border-blue-300 text-blue-900 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Zero Wait-Time Triage</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Board-Certified Specialists</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/90 border border-purple-300 text-purple-900 text-xs font-bold shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Hospital In-Person Suites</span>
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => navigate('/book-appointment')}
              className="py-3.5 px-8 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/30 transform-gpu"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Appointment</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Empty Filter State */
          <motion.div
            key="empty-filter-state"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative p-10 text-center rounded-3xl bg-gradient-to-b from-white via-slate-50 to-blue-50/20 border border-slate-200/90 shadow-sm max-w-xl mx-auto my-6 overflow-hidden"
          >
            <div className="size-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-300 shadow-inner">
              <CalendarIcon className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1.5">
              No Appointments in this Category
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
              {isAdmin
                ? `No hospital patient appointments currently match the "${filter}" filter status.`
                : `You currently have no consultations matching the "${filter}" filter. Schedule a new appointment or switch filter tabs.`}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter('all')}
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>View All Appointments</span>
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/book-appointment')}
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book New</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
