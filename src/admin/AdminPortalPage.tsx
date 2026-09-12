"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  LogOut,
  ArrowLeft,
  Stethoscope,
  PlusCircle,
  X,
  Edit3,
  Save,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import type { StoredAppointment, AppointmentStatus, VisitType } from '../appointment/types';
import {
  getStoredAppointments,
  saveAppointment,
  approveStoredAppointment,
  rejectStoredAppointment,
  updateStoredAppointmentStatus,
  updateStoredAppointmentNotes,
  deleteStoredAppointment,
  getAppointmentCounts,
  syncAppointmentsFromFirestore,
  isMockAppointment,
} from '../appointment/storage';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const { currentUser, login, logout } = useAuth();

  // Admin Access Check
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com';

  // State
  const [appointments, setAppointments] = useState<StoredAppointment[]>(() => getStoredAppointments());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<StoredAppointment | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Login State for Gate
  const [gateEmail, setGateEmail] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  // New Appointment Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newInsurance, setNewInsurance] = useState('BlueCross BlueShield');
  const [newDept, setNewDept] = useState<'cardiology' | 'neurology' | 'orthopedics'>('cardiology');
  const [newDoctor, setNewDoctor] = useState('Dr. Tony Stark');
  const [newDate, setNewDate] = useState('Tomorrow, Sep 15, 2026');
  const [newTime, setNewTime] = useState('10:00 AM');
  const newVisitType: VisitType = 'in-person';
  const [newReason, setNewReason] = useState('');

  // Load appointments
  const refreshAppointments = () => {
    const list = getStoredAppointments();
    setAppointments(list);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    refreshAppointments();
    try {
      const cloudList = await syncAppointmentsFromFirestore();
      if (cloudList && cloudList.length > 0) {
        setAppointments(cloudList);
      }
      showToast('Synced with Cloud Firestore & local repository.');
    } catch {
      showToast('Refreshed local records.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    // 1. Initial Cloud Sync
    syncAppointmentsFromFirestore().then((cloudList) => {
      if (cloudList) {
        setAppointments(cloudList);
      }
    });

    // 2. Real-time Cloud Firestore Listener for instant multi-user updates
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = onSnapshot(
        collection(db, 'appointments'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteList: StoredAppointment[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as StoredAppointment;
              if (data && data.bookingId && !isMockAppointment(data.bookingId) && !isMockAppointment(docSnap.id)) {
                remoteList.push(data);
              }
            });
            const local = getStoredAppointments();
            const remoteIds = new Set(remoteList.map((r) => r.bookingId));
            const cleanLocal = local.filter((l) => !isMockAppointment(l.bookingId));
            const merged = [...remoteList, ...cleanLocal.filter((l) => !remoteIds.has(l.bookingId))];
            setAppointments(merged);
            localStorage.setItem('wecare_user_appointments_v2', JSON.stringify(merged));
          } else {
            const local = getStoredAppointments();
            setAppointments(local);
          }
        },
        (error) => {
          console.warn('[Admin Portal] Firestore live subscription notice:', error.message);
        }
      );
    } catch {
      // Graceful fallback
    }

    // 3. Multi-tab and window listeners
    window.addEventListener('wecare_appointments_changed', refreshAppointments);
    window.addEventListener('wecare_auth_state_changed', refreshAppointments);
    window.addEventListener('storage', refreshAppointments);
    window.addEventListener('focus', refreshAppointments);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener('wecare_appointments_changed', refreshAppointments);
      window.removeEventListener('wecare_auth_state_changed', refreshAppointments);
      window.removeEventListener('storage', refreshAppointments);
      window.removeEventListener('focus', refreshAppointments);
    };
  }, [currentUser, isAdmin]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPIs
  const stats = useMemo(() => {
    return getAppointmentCounts(appointments);
  }, [appointments]);

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    appointments.forEach((a) => {
      if (a.departmentName) depts.add(a.departmentName);
    });
    return Array.from(depts);
  }, [appointments]);

  // Filtered & Searched Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // Status Filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false;
      }
      // Department Filter
      if (departmentFilter !== 'all' && appt.departmentName.toLowerCase() !== departmentFilter.toLowerCase()) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = appt.patientName?.toLowerCase().includes(query);
        const matchEmail = appt.email?.toLowerCase().includes(query);
        const matchPhone = appt.phone?.toLowerCase().includes(query);
        const matchDoc = appt.doctorName?.toLowerCase().includes(query);
        const matchDept = appt.departmentName?.toLowerCase().includes(query);
        const matchId = appt.bookingId?.toLowerCase().includes(query);
        const matchReason = appt.reason?.toLowerCase().includes(query);
        return matchName || matchEmail || matchPhone || matchDoc || matchDept || matchId || matchReason;
      }
      return true;
    });
  }, [appointments, statusFilter, departmentFilter, searchQuery]);

  // Handle Quick Login
  const handleGateLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGateLoading(true);
    setGateError(null);
    const res = await login(gateEmail, gatePassword, 'admin');
    setGateLoading(false);
    if (!res.success) {
      setGateError(res.error || 'Failed to authenticate admin credentials.');
    } else {
      showToast('Welcome back, Chief Admin Rudrant Joshi.');
      refreshAppointments();
      syncAppointmentsFromFirestore().then((cloudList) => {
        setAppointments(cloudList ?? getStoredAppointments());
      });
    }
  };

  // Status Change Handler
  const handleStatusChange = (bookingId: string, newStatus: AppointmentStatus) => {
    const updated = updateStoredAppointmentStatus(bookingId, newStatus);
    setAppointments(updated);
    if (selectedAppointment && selectedAppointment.bookingId === bookingId) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
    showToast(`Appointment ${bookingId} status updated to "${newStatus.toUpperCase()}".`);
  };

  // Direct Approve Handler
  const handleApprove = (bookingId: string) => {
    const updated = approveStoredAppointment(bookingId);
    setAppointments(updated);
    if (selectedAppointment && selectedAppointment.bookingId === bookingId) {
      setSelectedAppointment({ ...selectedAppointment, status: 'approved' });
    }
    showToast(`Appointment ${bookingId} has been APPROVED.`);
  };

  // Direct Reject Handler
  const handleReject = (bookingId: string) => {
    const updated = rejectStoredAppointment(bookingId);
    setAppointments(updated);
    if (selectedAppointment && selectedAppointment.bookingId === bookingId) {
      setSelectedAppointment({ ...selectedAppointment, status: 'rejected' });
    }
    showToast(`Appointment ${bookingId} has been REJECTED.`);
  };

  // Delete Handler
  const handleDelete = (bookingId: string) => {
    if (window.confirm(`Are you sure you want to permanently delete appointment ${bookingId}?`)) {
      const updated = deleteStoredAppointment(bookingId);
      setAppointments(updated);
      if (selectedAppointment?.bookingId === bookingId) {
        setSelectedAppointment(null);
      }
      showToast(`Appointment ${bookingId} removed from repository.`);
    }
  };

  // Open Dossier
  const handleOpenDossier = (appt: StoredAppointment) => {
    setSelectedAppointment(appt);
    setEditingNotes(appt.adminNotes || '');
    setIsEditingNotes(false);
  };

  // Save Notes
  const handleSaveNotes = () => {
    if (!selectedAppointment) return;
    const updated = updateStoredAppointmentNotes(selectedAppointment.bookingId, editingNotes);
    setAppointments(updated);
    setSelectedAppointment({ ...selectedAppointment, adminNotes: editingNotes });
    setIsEditingNotes(false);
    showToast('Clinical admin notes successfully updated.');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (appointments.length === 0) return;
    const headers = [
      'Booking ID',
      'Patient Name',
      'Email',
      'Phone',
      'Insurance',
      'Department',
      'Doctor',
      'Date',
      'Time',
      'Visit Type',
      'Status',
      'Reason',
      'Admin Notes',
    ];
    const rows = appointments.map((a) => [
      `"${a.bookingId}"`,
      `"${a.patientName}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.insuranceProvider}"`,
      `"${a.departmentName}"`,
      `"${a.doctorName}"`,
      `"${a.date}"`,
      `"${a.time}"`,
      `"${a.visitType}"`,
      `"${a.status}"`,
      `"${(a.reason || '').replace(/"/g, '""')}"`,
      `"${(a.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wecare-appointments-admin-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported all patient appointment records to CSV.');
  };

  // Create appointment directly from Admin Console
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newEmail.trim()) {
      alert('Patient name and email are required.');
      return;
    }

    const bookingId = `WC-2026-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    const newAppt: StoredAppointment = {
      bookingId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      departmentId: newDept,
      doctorId: newDept === 'cardiology' ? 'iron-man' : newDept === 'neurology' ? 'doctor-strange' : 'captain-america',
      doctorName: newDoctor,
      doctorRole: 'Senior Clinical Specialist',
      doctorImage:
        newDept === 'cardiology'
          ? '/doctor-images/iron-man.jpg'
          : newDept === 'neurology'
            ? '/doctor-images/doctor-strange.jpg'
            : '/doctor-images/captain-america.jpg',
      departmentName: newDept.charAt(0).toUpperCase() + newDept.slice(1),
      specialty: newDept === 'cardiology' ? 'Arc-Reactor Cardiothoracic Surgery' : newDept === 'neurology' ? 'Complex Micro-Neurosurgery' : 'Peak Kinetic Biomechanics',
      gradientFrom: newDept === 'cardiology' ? '#f43f5e' : newDept === 'neurology' ? '#8b5cf6' : '#f59e0b',
      gradientTo: newDept === 'cardiology' ? '#e11d48' : newDept === 'neurology' ? '#6366f1' : '#ea580c',
      date: newDate,
      time: newTime,
      visitType: newVisitType,
      patientName: newPatientName.trim(),
      email: newEmail.trim(),
      phone: newPhone || '(555) 000-0000',
      insuranceProvider: newInsurance,
      reason: newReason || 'Admin Scheduled Specialist Consultation',
      status: 'upcoming',
      location: 'WeCare Clinical Tower 4, Suite 800 (San Francisco, CA)',
      adminNotes: 'Manually scheduled by Chief Admin Rudrant Joshi.',
    };

    saveAppointment(newAppt);
    setIsNewBookingModalOpen(false);
    setNewPatientName('');
    setNewEmail('');
    setNewPhone('');
    setNewReason('');
    showToast(`Successfully registered appointment ${bookingId} for ${newAppt.patientName}.`);
  };

  // RENDER: SECURITY CLEARANCE GATE IF NOT ADMIN
  if (!isAdmin) {
    return (
      <main className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-purple-500 selection:text-white font-sans overflow-hidden">
        {/* Futuristic Glowing Background Grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:32px_32px] opacity-20"
        />
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-purple-500/30 bg-slate-900/90 backdrop-blur-2xl p-7 sm:p-9 shadow-[0_20px_70px_rgba(139,92,246,0.25)]">
          {/* Top Admin Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white">WeCare Central</h1>
                <p className="text-[10.5px] font-mono text-purple-300 font-bold">CHIEF ADMIN COMMAND CONSOLE</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-red-500/15 border border-red-500/30 text-red-400">
              Restricted
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            This terminal oversees hospital-wide patient appointments, telemetry records, and specialist triage. Clearance credentials required.
          </p>

          {gateError && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-2 text-xs font-medium text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="admin@wecare.org"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Console Security Passkey
              </label>
              <input
                type="password"
                required
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full mt-2 h-11 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30 active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {gateLoading ? 'Authenticating Clearance...' : 'Authenticate & Unlock Console'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Patient Schedule</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  // RENDER: AUTHENTICATED CHIEF ADMIN PORTAL
  return (
    <main
      id="wecare-admin-portal"
      className="relative min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white"
    >
      {/* Background Subtle Medical Data Mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:36px_36px] opacity-15 z-0"
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-purple-600 text-white shadow-2xl flex items-center gap-2 text-xs font-bold border border-purple-400/40 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP EXECUTIVE COMMAND HEADER */}
      <header className="relative z-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Admin ID */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">WeCare Central Admin</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  ROOT CLEARANCE
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="text-purple-300 font-semibold">{currentUser?.email || 'rudrant.joshi@gmail.com'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Syncing All Users
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              title="Sync appointments with Cloud Firestore & local storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewBookingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule Patient</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Patient View</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ADMIN DASHBOARD BODY */}
      <div className="relative z-10 flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* KPI OVERVIEW METRICS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Appointments */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>All Bookings</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.total}</div>
            <div className="text-[10px] text-purple-300 font-mono mt-1">Cross-user ledger</div>
          </div>

          {/* Pending Approval */}
          <div className="rounded-2xl bg-slate-800/60 border border-amber-500/40 p-4 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-400 text-xs font-medium mb-1">
              <span>Pending Review</span>
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{stats.pending}</div>
            <div className="text-[10px] text-amber-300/80 font-mono mt-1">Awaiting approval</div>
          </div>

          {/* Approved & Active */}
          <div className="rounded-2xl bg-slate-800/60 border border-emerald-500/40 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-medium mb-1">
              <span>Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{stats.approved}</div>
            <div className="text-[10px] text-emerald-300/80 font-mono mt-1">Confirmed slots</div>
          </div>

          {/* Rejected */}
          <div className="rounded-2xl bg-slate-800/60 border border-rose-500/40 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-rose-400 text-xs font-medium mb-1">
              <span>Rejected</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">{stats.rejected}</div>
            <div className="text-[10px] text-rose-300/80 font-mono mt-1">Declined requests</div>
          </div>

          {/* Completed */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Completed</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">{stats.completed}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Care delivered</div>
          </div>

          {/* Unique Patients */}
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Unique Patients</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">{stats.uniquePatients}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Registered users</div>
          </div>
        </section>

        {/* SEARCH, FILTERS & CONTROLS TOOLBAR */}
        <section className="rounded-3xl bg-slate-800/40 border border-slate-700/70 p-4 sm:p-5 backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all users by patient name, email, doctor, booking ID, phone..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Groups */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Status Filter */}
            <div className="flex flex-wrap items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-700 text-xs">
              {(
                [
                  { id: 'all', label: `All (${stats.total})` },
                  { id: 'pending', label: `Pending (${stats.pending})` },
                  { id: 'approved', label: `Approved (${stats.approved})` },
                  { id: 'rejected', label: `Rejected (${stats.rejected})` },
                  { id: 'completed', label: `Completed (${stats.completed})` },
                  { id: 'cancelled', label: `Cancelled (${stats.cancelled})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10.5px] transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? tab.id === 'pending'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : tab.id === 'approved'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : tab.id === 'rejected'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>


            {/* Department Filter Dropdown */}
            {departmentsList.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

            {/* Simple List / Table View Switcher */}
            <div className="flex items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Simple List View"
              >
                Simple List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                Table View
              </button>
            </div>
          </div>
        </section>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div>
            Showing <span className="text-white font-bold">{filteredAppointments.length}</span> patient appointment
            {filteredAppointments.length === 1 ? '' : 's'} across the system
          </div>
          {(searchQuery || statusFilter !== 'all' || departmentFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* APPOINTMENTS DATA PRESENTATION */}
        {filteredAppointments.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-800/30 p-12 text-center flex flex-col items-center justify-center">
            <Calendar className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">
              {appointments.length === 0 ? 'No Patient Appointments Booked Yet' : 'No Matching Appointments Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {appointments.length === 0
                ? 'The hospital registry is currently clean. As patients schedule consultations through the booking portal, their appointments will appear here in real-time.'
                : 'No patient appointment records matched your current query or filter selection.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="rounded-3xl border border-slate-800 bg-slate-800/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/80 bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Booking ID & Patient</th>
                    <th className="py-3.5 px-4 font-bold">Contact & Insurance</th>
                    <th className="py-3.5 px-4 font-bold">Doctor & Specialty</th>
                    <th className="py-3.5 px-4 font-bold">Scheduled Time</th>
                    <th className="py-3.5 px-4 font-bold">Mode & Room</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAppointments.map((appt) => (
                    <tr
                      key={appt.bookingId}
                      className="hover:bg-slate-700/30 transition-colors group cursor-default"
                    >
                      {/* Booking ID & Patient */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-purple-400 font-bold text-xs">{appt.bookingId}</div>
                        <div className="font-bold text-white text-sm mt-0.5">{appt.patientName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{appt.reason}</div>
                      </td>

                      {/* Contact & Insurance */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{appt.email}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{appt.phone}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700 text-[10px] text-slate-300 font-semibold">
                          {appt.insuranceProvider || 'Private Pay'}
                        </span>
                      </td>

                      {/* Doctor & Specialty */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={(appt.doctorImage || '').replace(/^\/doctors\//, '/doctor-images/') || `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`}
                            alt={appt.doctorName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.dataset.fallback) {
                                target.dataset.fallback = '1';
                                target.src = `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`;
                              }
                            }}
                          />
                          <div>
                            <div className="font-bold text-white">{appt.doctorName}</div>
                            <div className="text-[11px] text-slate-400">{appt.departmentName}</div>
                          </div>
                        </div>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-semibold">{appt.date}</div>
                        <div className="text-[11px] text-purple-300 font-mono mt-0.5">{appt.time}</div>
                      </td>

                      {/* Mode & Room */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-bold">
                            <MapPin className="w-3 h-3" />
                            In-Person Clinic
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px] mt-1">
                          {appt.location}
                        </div>
                      </td>

                      {/* Status Selector & Quick Action */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          {appt.status === 'pending' && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleApprove(appt.bookingId)}
                                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Approve patient appointment"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(appt.bookingId)}
                                className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10.5px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Reject patient appointment"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}

                          <select
                            value={appt.status}
                            onChange={(e) => handleStatusChange(appt.bookingId, e.target.value as AppointmentStatus)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider outline-none border cursor-pointer transition-colors ${
                              appt.status === 'pending'
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : appt.status === 'approved' || appt.status === 'upcoming'
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                  : appt.status === 'rejected'
                                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                                    : appt.status === 'completed'
                                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                                      : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <option value="pending" className="bg-slate-900 text-amber-300">Pending</option>
                            <option value="approved" className="bg-slate-900 text-emerald-300">Approved</option>
                            <option value="rejected" className="bg-slate-900 text-rose-300">Rejected</option>
                            <option value="completed" className="bg-slate-900 text-blue-300">Completed</option>
                            <option value="cancelled" className="bg-slate-900 text-slate-400">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDossier(appt)}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            title="Open Full Patient Intake Dossier"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(appt.bookingId)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                            title="Delete Appointment Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SIMPLE & SWEET LIST VIEW */
          <div className="space-y-3">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.bookingId}
                className="rounded-2xl border border-slate-800/90 bg-slate-800/40 hover:bg-slate-800/70 hover:border-purple-500/40 backdrop-blur-xl p-4 sm:p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left: Patient & Doctor Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="size-11 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                    {appt.patientName ? appt.patientName.charAt(0).toUpperCase() : 'P'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-purple-400 font-bold text-xs">
                        {appt.bookingId}
                      </span>
                      <span className="text-white font-extrabold text-sm sm:text-base">
                        {appt.patientName}
                      </span>
                      <span className="text-xs text-slate-400">
                        &bull; {appt.email} &bull; {appt.phone}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="text-white font-semibold flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
                        {appt.doctorName}
                      </span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-400">{appt.departmentName} ({appt.specialty})</span>
                    </div>

                    {appt.reason && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                        <span className="text-slate-500">Reason:</span> {appt.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Date, Time, Status Dropdown & Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-700/60">
                  <div className="space-y-0.5 text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-300 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{appt.time}</span>
                    </div>
                  </div>

                  {/* Quick Status Action & Selector */}
                  <div className="flex items-center gap-2">
                    {appt.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(appt.bookingId)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Approve patient appointment"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(appt.bookingId)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Reject patient appointment"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    <select
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt.bookingId, e.target.value as AppointmentStatus)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border cursor-pointer transition-colors ${
                        appt.status === 'pending'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : appt.status === 'approved' || appt.status === 'upcoming'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : appt.status === 'rejected'
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                              : appt.status === 'completed'
                                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <option value="pending" className="bg-slate-900 text-amber-300">Pending</option>
                      <option value="approved" className="bg-slate-900 text-emerald-300">Approved</option>
                      <option value="rejected" className="bg-slate-900 text-rose-300">Rejected</option>
                      <option value="completed" className="bg-slate-900 text-blue-300">Completed</option>
                      <option value="cancelled" className="bg-slate-900 text-slate-400">Cancelled</option>
                    </select>
                  </div>

                  {/* Actions: Dossier & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenDossier(appt)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Open Patient Clinical Dossier"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Dossier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(appt.bookingId)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PATIENT CLINICAL DOSSIER MODAL */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-400 font-bold">
                      {selectedAppointment.bookingId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${
                        selectedAppointment.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : selectedAppointment.status === 'approved' || selectedAppointment.status === 'upcoming'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : selectedAppointment.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : selectedAppointment.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {selectedAppointment.status === 'pending'
                        ? 'Pending Approval'
                        : selectedAppointment.status === 'approved'
                          ? 'Approved'
                          : selectedAppointment.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{selectedAppointment.patientName}</h3>
                  <p className="text-xs text-slate-400">Clinical Intake & Consultation Dossier</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dossier Body */}
              <div className="py-5 space-y-4 text-xs">
                {/* Patient Information Grid */}
                <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Contact Email</span>
                    <span className="text-white font-medium">{selectedAppointment.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Primary Phone</span>
                    <span className="text-white font-medium">{selectedAppointment.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Insurance Carrier</span>
                    <span className="text-white font-medium">{selectedAppointment.insuranceProvider || 'Self-Pay / None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Visit Mode</span>
                    <span className="text-purple-300 font-medium uppercase font-mono">
                      {selectedAppointment.visitType}
                    </span>
                  </div>
                </div>

                {/* Clinical Booking Schedule Details */}
                <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Attending Physician</span>
                    <span className="text-white font-bold text-sm">{selectedAppointment.doctorName}</span>
                    <span className="text-slate-400 block">{selectedAppointment.doctorRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Department / Specialty</span>
                    <span className="text-white font-semibold">{selectedAppointment.departmentName}</span>
                    <span className="text-slate-400 block">{selectedAppointment.specialty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Scheduled Date & Slot</span>
                    <span className="text-white font-medium">{selectedAppointment.date} at {selectedAppointment.time}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Room / Clinical Suite</span>
                    <span className="text-slate-300 font-medium">{selectedAppointment.location}</span>
                  </div>
                </div>

                {/* Reason / Symptoms */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 font-semibold block text-[11px] mb-1">
                    Chief Complaint / Consultation Symptoms
                  </span>
                  <p className="text-white text-xs leading-relaxed">{selectedAppointment.reason}</p>
                </div>

                {/* Admin Clinical Notes */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      Chief Admin Telemetry & Clinical Observations
                    </span>
                    {!isEditingNotes ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(true)}
                        className="text-purple-400 hover:text-purple-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Note</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Note</span>
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <textarea
                      rows={3}
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Add clinical observation, triage notes, or follow-up instructions..."
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-purple-500/50 text-white text-xs outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-slate-300 italic text-xs">
                      {selectedAppointment.adminNotes || 'No administrative notes recorded yet. Click "Edit Note" to add one.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold">Status:</span>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedAppointment.bookingId)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedAppointment.status === 'approved' || selectedAppointment.status === 'upcoming'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(selectedAppointment.bookingId)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedAppointment.status === 'rejected'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppointment.bookingId, 'completed')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                      selectedAppointment.status === 'completed'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppointment.bookingId, 'cancelled')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                      selectedAppointment.status === 'cancelled'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE PATIENT DIRECTLY MODAL */}
      <AnimatePresence>
        {isNewBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-purple-500/30 bg-slate-900 p-6 sm:p-7 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-white">Schedule New Patient Appointment</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="jordan.h@example.com"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Contact Phone</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Insurance Carrier</label>
                    <input
                      type="text"
                      value={newInsurance}
                      onChange={(e) => setNewInsurance(e.target.value)}
                      placeholder="BlueCross / Aetna"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setNewDept(val);
                        if (val === 'cardiology') setNewDoctor('Dr. Tony Stark');
                        if (val === 'neurology') setNewDoctor('Dr. Stephen Strange');
                        if (val === 'orthopedics') setNewDoctor('Dr. Steve Rogers');
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                    >
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                      <option value="orthopedics">Orthopedics</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Attending Doctor</label>
                    <input
                      type="text"
                      value={newDoctor}
                      onChange={(e) => setNewDoctor(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Date</label>
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="Mon, Sep 21, 2026"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Time Slot</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Visit Mode & Location</label>
                  <div className="h-9 px-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>In-Person Clinical Suite (WeCare Medical Tower)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Reason / Symptoms</label>
                  <textarea
                    rows={2}
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="Describe intake reason or consultation request..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Register & Schedule Appointment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-3">
          <span>CONSOLE: WC-ADMIN-CORE-V2</span>
          <span>•</span>
          <span>AUTHORIZED CHIEF ADMIN: RUDRANT JOSHI</span>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>ALL PATIENT SCHEDULE RECORDS SECURE & SYNCED</span>
        </div>
      </footer>
    </main>
  );
}
