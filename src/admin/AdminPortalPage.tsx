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
  List,
  LayoutGrid,
  Table,
  Mail,
  Phone,
  ChevronRight,
  ArrowRight,
  User,
} from 'lucide-react';

import { useAuth, DEMO_USERS, getRegisteredAccounts } from '../auth/AuthContext';
import type { UserRole } from '../auth/types';
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
  sortAppointmentsDescending,
  getAppointmentCreationTimestamp,
} from '../appointment/storage';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Helper to format when patient registered/booked (pure helper outside component)
function formatRegistrationTiming(appt: StoredAppointment): string {
  const ts = getAppointmentCreationTimestamp(appt);
  if (!ts) return appt.createdAt ? `Time: ${appt.createdAt}` : 'Recent';

  const diffMs = Date.now() - ts;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return 'Just registered';
  if (diffMinutes < 60) return `Registered ${diffMinutes}m ago`;
  if (diffHours < 24) return `Registered ${diffHours}h ago`;

  return `Registered ${new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

// Helper to parse date into Month, Day, and Weekday
function parseAdminDate(dateStr?: string) {
  if (!dateStr) return { month: 'APPT', day: '--', dayOfWeek: 'Date' };
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      if (!isNaN(d.getTime())) {
        return {
          month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          day: day.toString().padStart(2, '0'),
          dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        };
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: d.getDate().toString().padStart(2, '0'),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
      };
    }
  } catch {}
  return { month: 'APPT', day: '--', dayOfWeek: 'Date' };
}

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  badgeNumber?: string;
  createdAt?: string;
  isRegistered: boolean;
  appointments: StoredAppointment[];
}

export default function AdminPortalPage() {
  const navigate = useNavigate();
  const { currentUser, login, logout } = useAuth();

  // Admin Access Check
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === 'rudrant.joshi@gmail.com';

  // State (Appointments chronologically sorted: newest registered patient appears first)
  const [appointments, setAppointments] = useState<StoredAppointment[]>(() =>
    sortAppointmentsDescending(getStoredAppointments())
  );
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<StoredAppointment | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wecare_admin_view_mode');
      if (saved === 'list' || saved === 'cards' || saved === 'table') return saved;
    }
    return 'list';
  });

  const handleSetViewMode = (mode: 'list' | 'cards' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem('wecare_admin_view_mode', mode);
    } catch {}
  };
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Navigation tabs: 'appointments' vs 'users'
  const [activeAdminTab, setActiveAdminTab] = useState<'appointments' | 'users'>('appointments');
  const [selectedUser, setSelectedUser] = useState<AdminUserAccount | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'patient' | 'doctor' | 'admin'>('all');

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
            const merged = sortAppointmentsDescending([
              ...remoteList,
              ...cleanLocal.filter((l) => !remoteIds.has(l.bookingId)),
            ]);
            setAppointments(merged);
            localStorage.setItem('wecare_user_appointments_v2', JSON.stringify(merged));
          } else {
            const local = sortAppointmentsDescending(getStoredAppointments());
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

  // Filtered & Searched Appointments (Chronologically sorted: latest registered patient appears first)
  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter((appt) => {
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

    // Sort: newest/latest registered patient comes first
    return [...filtered].sort((a, b) => {
      const timeA = getAppointmentCreationTimestamp(a);
      const timeB = getAppointmentCreationTimestamp(b);
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [appointments, statusFilter, departmentFilter, searchQuery, sortOrder]);

  // Split appointments into Pending (requiring triage action) and Done (processed/completed/past)
  const pendingAppointments = useMemo(
    () => filteredAppointments.filter((a) => a.status === 'pending'),
    [filteredAppointments]
  );
  const doneAppointments = useMemo(
    () => filteredAppointments.filter((a) => a.status !== 'pending'),
    [filteredAppointments]
  );

  // Compile all system users from demo accounts, registered accounts, and patient bookings
  const allUsers = useMemo<AdminUserAccount[]>(() => {
    const userMap = new Map<string, AdminUserAccount>();

    // 1. Seed demo accounts
    Object.values(DEMO_USERS).forEach((demo) => {
      const email = demo.email.toLowerCase().trim();
      userMap.set(email, {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        phone: demo.phone,
        role: demo.role,
        avatar: demo.avatar,
        badgeNumber: demo.badgeNumber,
        createdAt: demo.memberSince ? `Member since ${demo.memberSince}` : 'System Account',
        isRegistered: true,
        appointments: [],
      });
    });

    // 2. Add locally registered user accounts
    const registered = getRegisteredAccounts();
    registered.forEach((acc) => {
      const email = acc.email.toLowerCase().trim();
      const existing = userMap.get(email);
      if (existing) {
        existing.name = acc.name || existing.name;
        existing.role = acc.role || existing.role;
        existing.isRegistered = true;
        if (acc.createdAt) {
          existing.createdAt = new Date(acc.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      } else {
        userMap.set(email, {
          id: acc.id,
          name: acc.name,
          email: acc.email,
          role: acc.role,
          badgeNumber: `WC-${acc.id.slice(0, 4).toUpperCase()}-PT`,
          createdAt: acc.createdAt
            ? new Date(acc.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Registered User',
          isRegistered: true,
          appointments: [],
        });
      }
    });

    // 3. Map all appointments to user accounts
    appointments.forEach((appt) => {
      const email = (appt.email || '').toLowerCase().trim();
      if (!email) return;

      let user = userMap.get(email);
      if (!user) {
        user = {
          id: `usr-pat-${appt.bookingId}`,
          name: appt.patientName || email.split('@')[0],
          email: appt.email,
          phone: appt.phone,
          role: 'patient',
          badgeNumber: `WC-${appt.bookingId.replace(/[^0-9]/g, '').slice(0, 4) || 'PT'}-PT`,
          createdAt: appt.createdAt ? `Booked ${appt.createdAt}` : 'Patient Client',
          isRegistered: false,
          appointments: [],
        };
        userMap.set(email, user);
      } else {
        if (!user.phone && appt.phone) user.phone = appt.phone;
        if (appt.patientName && (!user.name || user.name === email.split('@')[0])) {
          user.name = appt.patientName;
        }
      }

      user.appointments.push(appt);
    });

    // Sort appointments for each user descending (latest first)
    userMap.forEach((u) => {
      u.appointments = sortAppointmentsDescending(u.appointments);
    });

    // Return list: Chief admin first, then most bookings first
    return Array.from(userMap.values()).sort((a, b) => {
      if (a.role === 'admin') return -1;
      if (b.role === 'admin') return 1;
      if (b.appointments.length !== a.appointments.length) {
        return b.appointments.length - a.appointments.length;
      }
      return a.name.localeCompare(b.name);
    });
  }, [appointments]);

  // Filter users by search query and role
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase().trim();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          (u.badgeNumber && u.badgeNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allUsers, userRoleFilter, userSearchQuery]);

  // Quick switch from appointment to user profile
  const handleSelectUserByEmail = (email?: string, name?: string) => {
    if (!email && !name) return;
    const match = allUsers.find(
      (u) =>
        (email && u.email.toLowerCase() === email.toLowerCase()) ||
        (name && u.name.toLowerCase() === name.toLowerCase())
    );
    if (match) {
      setSelectedUser(match);
      setActiveAdminTab('users');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  // Export to CSV with OWASP CSV Injection Sanitization (CWE-1236)
  const handleExportCSV = () => {
    if (appointments.length === 0) return;

    // Secure CSV cell sanitizer preventing CSV Formula Injection (CWE-1236)
    const sanitizeCsvCell = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      let str = String(val).replace(/"/g, '""');
      // If cell begins with formula trigger character (=, +, -, @, \t, \r), neutralize with single quote prefix
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

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
      sanitizeCsvCell(a.bookingId),
      sanitizeCsvCell(a.patientName),
      sanitizeCsvCell(a.email),
      sanitizeCsvCell(a.phone),
      sanitizeCsvCell(a.insuranceProvider),
      sanitizeCsvCell(a.departmentName),
      sanitizeCsvCell(a.doctorName),
      sanitizeCsvCell(a.date),
      sanitizeCsvCell(a.time),
      sanitizeCsvCell(a.visitType),
      sanitizeCsvCell(a.status),
      sanitizeCsvCell(a.reason),
      sanitizeCsvCell(a.adminNotes),
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

    const now = Date.now();
    const bookingId = `WC-2026-${now.toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    const newAppt: StoredAppointment = {
      bookingId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtIso: new Date(now).toISOString(),
      timestamp: now,
      savedAt: new Date(now).toISOString(),
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

  // Reusable collection renderer for Table, Cards, and List layouts
  const renderAppointmentsGroup = (
    list: StoredAppointment[],
    emptyMessage: string,
    _isPendingSection?: boolean
  ) => {
    if (list.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
          {emptyMessage}
        </div>
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="rounded-3xl border border-slate-800 bg-slate-800/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
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
                {list.map((appt, idx) => (
                  <tr
                    key={appt.bookingId}
                    className={`hover:bg-slate-700/30 transition-colors group cursor-default ${
                      sortOrder === 'latest' && idx === 0 ? 'bg-purple-950/20' : ''
                    }`}
                  >
                    {/* Booking ID & Patient */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-400 font-bold text-xs">{appt.bookingId}</span>
                        {sortOrder === 'latest' && idx === 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Latest Registered
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectUserByEmail(appt.email, appt.patientName)}
                        className="font-bold text-white text-sm mt-0.5 hover:text-purple-300 transition-colors text-left cursor-pointer hover:underline block"
                        title="Click to inspect this user's profile and all their appointments"
                      >
                        {appt.patientName}
                      </button>
                      <div className="flex items-center gap-1.5 text-[10.5px] mt-0.5">
                        <span className="text-purple-300 font-medium font-mono">{formatRegistrationTiming(appt)}</span>
                        <span className="text-slate-500">&bull;</span>
                        <span className="text-slate-400 truncate max-w-[140px]">{appt.reason}</span>
                      </div>
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
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(appt.bookingId)}
                              className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10.5px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
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
      );
    }

    if (viewMode === 'cards') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((appt, idx) => {
            const dateInfo = parseAdminDate(appt.date);
            const isLatest = sortOrder === 'latest' && idx === 0;

            return (
              <div
                key={appt.bookingId}
                className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
                  isLatest
                    ? 'bg-slate-900/90 border-purple-500/60 shadow-purple-950/20 ring-1 ring-purple-500/40'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700/90'
                }`}
              >
                {/* Card Top: Booking ID, Latest Badge, Status Pill */}
                <div className="p-5 pb-4 border-b border-slate-800/70">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/25 font-mono text-xs font-bold text-purple-300">
                        {appt.bookingId}
                      </span>
                      {isLatest && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Latest Registered
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {appt.time}
                    </span>
                  </div>

                  {/* Patient Name, Initial, Timing & Contact */}
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleSelectUserByEmail(appt.email, appt.patientName)}
                      className="size-11 rounded-2xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-200 border border-purple-500/30 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner cursor-pointer transition-colors"
                      title="View user profile"
                    >
                      {appt.patientName ? appt.patientName.charAt(0).toUpperCase() : 'P'}
                    </button>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleSelectUserByEmail(appt.email, appt.patientName)}
                        className="font-extrabold text-white text-base truncate hover:text-purple-300 transition-colors text-left cursor-pointer hover:underline block"
                        title="Click to inspect this user's profile and all their appointments"
                      >
                        {appt.patientName}
                      </button>
                      <div className="flex items-center gap-2 text-[11px] text-purple-300 font-mono mt-0.5">
                        <span>{formatRegistrationTiming(appt)}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-slate-400 truncate">{appt.insuranceProvider || 'Private Pay'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                        <span className="truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          {appt.email}
                        </span>
                        <span className="truncate flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          {appt.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body: Scheduled Date Box, Doctor Info, Reason */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    {/* Scheduled Date Capsule & Mode */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex flex-col items-center justify-center text-center shrink-0">
                          <span className="text-[9px] font-mono font-bold text-purple-300 uppercase leading-none">{dateInfo.month}</span>
                          <span className="text-sm font-extrabold text-white leading-none mt-0.5">{dateInfo.day}</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{dateInfo.dayOfWeek}, {appt.date}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[180px]">{appt.location || 'Main Medical Center'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300">
                        In-Person
                      </span>
                    </div>

                    {/* Doctor Profile */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30 border border-slate-800/60">
                      <img
                        src={(appt.doctorImage || '').replace(/^\/doctors\//, '/doctor-images/') || `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`}
                        alt={appt.doctorName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = '1';
                            target.src = `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`;
                          }
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          {appt.doctorName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {appt.departmentName} &bull; {appt.specialty}
                        </div>
                      </div>
                    </div>

                    {/* Reason for Visit */}
                    {appt.reason && (
                      <div className="p-2.5 rounded-xl bg-slate-800/20 border border-slate-800/50 text-xs text-slate-300">
                        <span className="text-slate-500 font-medium">Chief Complaint:</span>{' '}
                        <span className="italic">{appt.reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Status Action & Dossier */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800/80 flex flex-col gap-2.5">
                  {appt.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(appt.bookingId)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title="Approve appointment"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(appt.bookingId)}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title="Reject appointment"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt.bookingId, e.target.value as AppointmentStatus)}
                      className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border cursor-pointer transition-colors ${
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

                    <button
                      type="button"
                      onClick={() => handleOpenDossier(appt)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
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
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    /* LIST VIEW (DEFAULT) - RESPONSIVE FOR MOBILE & DESKTOP */
    return (
      <div className="space-y-3">
        {list.map((appt, idx) => {
          const dateInfo = parseAdminDate(appt.date);
          const isLatest = sortOrder === 'latest' && idx === 0;

          return (
            <div
              key={appt.bookingId}
              className={`rounded-2xl border backdrop-blur-xl p-3.5 sm:p-5 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 sm:gap-4 shadow-sm ${
                isLatest
                  ? 'border-purple-500/60 bg-slate-900/90 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
                  : 'border-slate-800/90 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40'
              }`}
            >
              {/* Left: Date Capsule + Patient & Doctor Info */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {/* Date Capsule */}
                <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center shrink-0 shadow-inner">
                  <span className="text-[8.5px] sm:text-[9px] font-mono font-bold text-purple-300 uppercase leading-none">
                    {dateInfo.month}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-white leading-none my-0.5 sm:my-1">
                    {dateInfo.day}
                  </span>
                  <span className="text-[8.5px] sm:text-[9px] text-slate-400 font-medium leading-none">
                    {dateInfo.dayOfWeek}
                  </span>
                </div>

                {/* Patient Avatar Circle */}
                <button
                  type="button"
                  onClick={() => handleSelectUserByEmail(appt.email, appt.patientName)}
                  className="size-9 sm:size-11 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 relative cursor-pointer transition-colors"
                  title="View user profile"
                >
                  {appt.patientName ? appt.patientName.charAt(0).toUpperCase() : 'P'}
                  {isLatest && (
                    <span className="absolute -top-1 -right-1 size-2.5 sm:size-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  )}
                </button>

                {/* Information Cluster */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="font-mono text-purple-400 font-bold text-[11px] sm:text-xs bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      {appt.bookingId}
                    </span>
                    {isLatest && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-mono font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Latest
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelectUserByEmail(appt.email, appt.patientName)}
                      className="text-white font-extrabold text-sm sm:text-base hover:text-purple-300 transition-colors text-left cursor-pointer hover:underline truncate max-w-[200px] sm:max-w-none"
                      title="Click to inspect this user's profile and all their appointments"
                    >
                      {appt.patientName}
                    </button>
                    <span className="text-[11px] sm:text-[11.5px] text-purple-300 font-medium font-mono">
                      &bull; {formatRegistrationTiming(appt)}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[160px] sm:max-w-none">
                      &bull; {appt.email}
                    </span>
                    {appt.phone && (
                      <span className="text-[11px] sm:text-xs text-slate-400 font-mono hidden sm:inline">
                        &bull; {appt.phone}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-[9.5px] sm:text-[10px] text-slate-300 font-semibold shrink-0">
                      {appt.insuranceProvider || 'Private Pay'}
                    </span>
                  </div>

                  {/* Doctor & Location Line */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-300 mt-1">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={(appt.doctorImage || '').replace(/^\/doctors\//, '/doctor-images/') || `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`}
                        alt={appt.doctorName}
                        className="w-5 h-5 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = '1';
                            target.src = `/doctor-images/${appt.doctorId || 'iron-man'}.jpg`;
                          }
                        }}
                      />
                      <span className="text-white font-semibold truncate max-w-[140px] sm:max-w-none">
                        {appt.doctorName}
                      </span>
                    </div>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400 truncate max-w-[140px] sm:max-w-none">{appt.departmentName}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-purple-300 font-mono text-[11px] flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {appt.time}
                    </span>
                    <span className="text-slate-500 hidden sm:inline">&bull;</span>
                    <span className="text-slate-400 items-center gap-1 text-[11px] hidden sm:flex">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {appt.location || 'Main Medical Center'}
                    </span>
                  </div>

                  {appt.reason && (
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1 italic">
                      <span className="text-slate-500">Reason:</span> {appt.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Quick Status Action, Selector & Dossier Button */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-2 sm:gap-3 shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-800/80 w-full xl:w-auto">
                {appt.status === 'pending' && (
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleApprove(appt.bookingId)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[36px]"
                      title="Approve patient appointment"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(appt.bookingId)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[36px]"
                      title="Reject patient appointment"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-1">
                  <select
                    value={appt.status}
                    onChange={(e) => handleStatusChange(appt.bookingId, e.target.value as AppointmentStatus)}
                    className={`flex-1 sm:flex-initial h-9 px-3 rounded-xl text-xs font-bold uppercase tracking-wider outline-none border cursor-pointer transition-colors ${
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

                  <button
                    type="button"
                    onClick={() => handleOpenDossier(appt)}
                    className="h-9 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                    title="Open Patient Clinical Dossier"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(appt.bookingId)}
                    className="h-9 w-9 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
      <header className="relative z-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-3.5 sm:px-8 py-3 sm:py-3.5">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand & Admin ID */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-600/30 shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black tracking-tight text-white truncate">WeCare Central Admin</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30 shrink-0">
                  ROOT CLEARANCE
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px] sm:text-[11px] text-slate-400 font-mono truncate">
                <span className="text-purple-300 font-semibold truncate">{currentUser?.email || 'rudrant.joshi@gmail.com'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleManualRefresh}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-60 min-h-[36px]"
              title="Sync appointments with Cloud Firestore & local storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewBookingModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 active:scale-95 cursor-pointer min-h-[36px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule Patient</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer min-h-[36px]"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer min-h-[36px]"
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
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer min-h-[36px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ADMIN DASHBOARD BODY */}
      <div className="relative z-10 flex-1 max-w-[1720px] w-full mx-auto px-3.5 sm:px-8 py-5 sm:py-8 flex flex-col gap-5 sm:gap-6">
        
        {/* TOP LEVEL NAVIGATION TABS: APPOINTMENTS vs USERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveAdminTab('appointments');
                setSelectedUser(null);
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeAdminTab === 'appointments'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">Appointments</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold shrink-0">
                {appointments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveAdminTab('users');
                setSelectedUser(null);
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeAdminTab === 'users'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">User Accounts</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold shrink-0">
                {allUsers.length}
              </span>
            </button>
          </div>

          {activeAdminTab === 'users' && selectedUser && (
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer transition-colors shadow-xs w-full sm:w-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Users Directory</span>
            </button>
          )}
        </div>

        {activeAdminTab === 'appointments' ? (
          /* ================================================================
             TAB 1: APPOINTMENTS & TRIAGE COMMAND CENTER
             ================================================================ */
          <div className="space-y-6">
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
              <button
                type="button"
                onClick={() => {
                  setActiveAdminTab('users');
                  setUserRoleFilter('patient');
                }}
                className="rounded-2xl bg-slate-800/60 border border-indigo-500/40 p-4 backdrop-blur-md hover:bg-slate-800/90 transition-all text-left cursor-pointer group"
                title="Click to view all patients in directory"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-300 text-xs font-medium mb-1">
                  <span>Registered Users</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">{allUsers.length}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <span>View Users</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            </section>

            {/* SEARCH, FILTERS & CONTROLS TOOLBAR */}
            <section className="rounded-2xl sm:rounded-3xl bg-slate-800/40 border border-slate-700/70 p-3.5 sm:p-5 backdrop-blur-xl flex flex-col gap-3.5">
              
              {/* Search Input */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient name, email, doctor, booking ID..."
                  className="w-full h-11 pl-10 pr-9 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 text-base sm:text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Tabs Bar - Horizontally scrollable on mobile */}
              <div className="overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
                <div className="flex items-center gap-1 bg-slate-900/90 rounded-2xl p-1 border border-slate-700 text-xs shadow-xs w-max min-w-full">
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
                      className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10.5px] transition-all cursor-pointer shrink-0 ${
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
              </div>

              {/* Controls Toolbar: Department, Sort Order & Layout Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Department Filter Dropdown */}
                {departmentsList.length > 0 && (
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-semibold outline-none cursor-pointer flex-1 sm:flex-initial min-w-[140px]"
                  >
                    <option value="all">All Departments</option>
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto flex-1 justify-end">
                  {/* Sort Order */}
                  <div className="flex items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-700 text-xs shadow-xs flex-1 sm:flex-initial justify-center">
                    <button
                      type="button"
                      onClick={() => setSortOrder('latest')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        sortOrder === 'latest' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Display newest registered patient appointments first"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Latest First</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortOrder('oldest')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        sortOrder === 'oldest' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Display oldest registered patient appointments first"
                    >
                      Oldest First
                    </button>
                  </div>

                  {/* View Mode Switcher: List / Cards / Table */}
                  <div className="flex items-center bg-slate-900/90 rounded-2xl p-1 border border-slate-700 text-xs shadow-xs flex-1 sm:flex-initial justify-center">
                    <button
                      type="button"
                      onClick={() => handleSetViewMode('list')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Executive List View (Default)"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetViewMode('cards')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        viewMode === 'cards' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Executive Cards Grid"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetViewMode('table')}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        viewMode === 'table' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Dense Data Table"
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* RESULTS HEADER */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 gap-2">
              <div className="flex items-center gap-2.5">
                <span>
                  Showing <span className="text-white font-bold">{filteredAppointments.length}</span> patient appointment
                  {filteredAppointments.length === 1 ? '' : 's'} across the system
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-[10.5px] font-mono font-bold text-purple-300">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>{sortOrder === 'latest' ? 'Timing: Latest Registered at Front' : 'Timing: Oldest Registered First'}</span>
                </span>
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
            ) : statusFilter === 'all' ? (
              /* TWO DISTINCT SECTIONS: PENDING (Action Required) vs ALL PROCESSED APPOINTMENTS */
              <div className="space-y-8">
                {/* SECTION 1: PENDING APPOINTMENTS */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Clock className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          Pending Appointments
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {pendingAppointments.length} Requiring Action
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Awaiting clinical triage review, physician approval, or status update
                        </p>
                      </div>
                    </div>
                  </div>

                  {renderAppointmentsGroup(
                    pendingAppointments,
                    "No pending appointments requiring triage. All patient requests have been addressed.",
                    true
                  )}
                </div>

                {/* SECTION 2: ALL PROCESSED & COMPLETED APPOINTMENTS */}
                <div className="space-y-3.5 pt-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          All Processed Appointments
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {doneAppointments.length} Processed & Done
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Approved visits, completed clinical care, and archived records
                        </p>
                      </div>
                    </div>
                  </div>

                  {renderAppointmentsGroup(
                    doneAppointments,
                    "No completed or processed appointments recorded yet.",
                    false
                  )}
                </div>
              </div>
            ) : (
              /* SPECIFIC FILTERED STATUS SECTION */
              <div className="space-y-3.5">
                <div className="pb-2 border-b border-slate-800 flex items-center gap-2">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    {statusFilter} Appointments ({filteredAppointments.length})
                  </h3>
                </div>
                {renderAppointmentsGroup(
                  filteredAppointments,
                  `No appointments with status "${statusFilter}" found.`
                )}
              </div>
            )}
          </div>
        ) : (
          /* ================================================================
             TAB 2: USER ACCOUNTS DIRECTORY & MANAGEMENT
             ================================================================ */
          <div className="space-y-6">
            {selectedUser ? (
              /* DEDICATED SELECTED USER PROFILE & ALL THEIR APPOINTMENTS */
              <div className="space-y-6">
                {/* User Identity Banner Card */}
                <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-purple-500/40 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="size-13 sm:size-16 rounded-xl sm:rounded-2xl bg-purple-600/25 text-purple-200 border-2 border-purple-500/40 flex items-center justify-center font-extrabold text-xl sm:text-2xl shrink-0 shadow-inner">
                      {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                      ) : (
                        selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-2xl font-black text-white truncate max-w-[220px] sm:max-w-none">{selectedUser.name}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-mono font-bold uppercase shrink-0 ${
                          selectedUser.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : selectedUser.role === 'doctor'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}>
                          {selectedUser.role === 'admin' ? 'Chief Admin' : selectedUser.role === 'doctor' ? 'Physician' : 'Patient'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 shrink-0">
                          {selectedUser.badgeNumber || selectedUser.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                        <span className="flex items-center gap-1 truncate max-w-[180px] sm:max-w-none">
                          <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate">{selectedUser.email}</span>
                        </span>
                        {selectedUser.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{selectedUser.phone}</span>
                          </span>
                        )}
                        <span className="text-slate-500 hidden sm:inline">&bull;</span>
                        <span className="text-slate-400 text-[11px] sm:text-xs">{selectedUser.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Pills */}
                  <div className="grid grid-cols-3 sm:flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <div className="px-2.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                      <div className="text-base sm:text-lg font-black text-white font-mono">{selectedUser.appointments.length}</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-mono">Bookings</div>
                    </div>
                    <div className="px-2.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                      <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                        {selectedUser.appointments.filter((a) => a.status === 'pending').length}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-amber-300 uppercase font-mono">Pending</div>
                    </div>
                    <div className="px-2.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                        {selectedUser.appointments.filter((a) => a.status === 'approved' || a.status === 'upcoming' || a.status === 'completed').length}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-emerald-300 uppercase font-mono">Confirmed</div>
                    </div>
                  </div>
                </div>

                {/* All Appointments for this User */}
                <div className="space-y-6">
                  {selectedUser.appointments.length === 0 ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-800/30 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                      <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mb-3" />
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1">No Appointments Booked Yet</h3>
                      <p className="text-xs text-slate-400 max-w-sm">
                        This user account has been registered in the system, but has not scheduled any consultations yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 sm:space-y-8">
                      {/* User's Pending Appointments */}
                      {selectedUser.appointments.some((a) => a.status === 'pending') && (
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                            <h3 className="text-sm sm:text-base font-extrabold text-white">
                              Pending Requests ({selectedUser.appointments.filter((a) => a.status === 'pending').length})
                            </h3>
                          </div>
                          {renderAppointmentsGroup(
                            selectedUser.appointments.filter((a) => a.status === 'pending'),
                            "No pending appointments for this user.",
                            true
                          )}
                        </div>
                      )}

                      {/* User's Processed & Scheduled Appointments */}
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                          <h3 className="text-sm sm:text-base font-extrabold text-white">
                            Completed & Scheduled Appointments ({selectedUser.appointments.filter((a) => a.status !== 'pending').length})
                          </h3>
                        </div>
                        {renderAppointmentsGroup(
                          selectedUser.appointments.filter((a) => a.status !== 'pending'),
                          "No completed appointments recorded for this user.",
                          false
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* USER ACCOUNTS DIRECTORY LISTING */
              <div className="space-y-5 sm:space-y-6">
                {/* USER TELEMETRY OVERVIEW CARDS */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                  <div className="rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/80 p-3 sm:p-4 backdrop-blur-md">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                      <span>Total Accounts</span>
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-xl sm:text-3xl font-black text-white font-mono">{allUsers.length}</div>
                    <div className="text-[9.5px] sm:text-[10px] text-purple-300 font-mono mt-1">System-wide users</div>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl bg-slate-800/60 border border-sky-500/30 p-3 sm:p-4 backdrop-blur-md">
                    <div className="flex items-center justify-between text-sky-400 text-xs font-medium mb-1">
                      <span>Patients</span>
                      <User className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xl sm:text-3xl font-black text-sky-400 font-mono">
                      {allUsers.filter((u) => u.role === 'patient').length}
                    </div>
                    <div className="text-[9.5px] sm:text-[10px] text-sky-300/80 font-mono mt-1">Registered clients</div>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl bg-slate-800/60 border border-emerald-500/30 p-3 sm:p-4 backdrop-blur-md">
                    <div className="flex items-center justify-between text-emerald-400 text-xs font-medium mb-1">
                      <span>Doctors & Staff</span>
                      <Stethoscope className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl sm:text-3xl font-black text-emerald-400 font-mono">
                      {allUsers.filter((u) => u.role === 'doctor' || u.role === 'caregiver').length}
                    </div>
                    <div className="text-[9.5px] sm:text-[10px] text-emerald-300/80 font-mono mt-1">Clinical specialists</div>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl bg-slate-800/60 border border-purple-500/30 p-3 sm:p-4 backdrop-blur-md">
                    <div className="flex items-center justify-between text-purple-400 text-xs font-medium mb-1">
                      <span>Patient Bookings</span>
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-xl sm:text-3xl font-black text-purple-400 font-mono">{appointments.length}</div>
                    <div className="text-[9.5px] sm:text-[10px] text-purple-300 font-mono mt-1">Total consultations</div>
                  </div>
                </section>

                {/* USER SEARCH & ROLE FILTER TOOLBAR */}
                <section className="rounded-2xl sm:rounded-3xl bg-slate-800/40 border border-slate-700/70 p-3.5 sm:p-5 backdrop-blur-xl flex flex-col gap-3.5">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search accounts by name, email, phone, or badge ID..."
                      className="w-full h-11 pl-10 pr-9 rounded-xl sm:rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 text-base sm:text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    {userSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setUserSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Role Filters - Horizontally scrollable on mobile */}
                  <div className="overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
                    <div className="flex items-center gap-1.5 bg-slate-900/90 rounded-2xl p-1 border border-slate-700 text-xs w-max min-w-full sm:min-w-0">
                      {[
                        { id: 'all', label: `All Users (${allUsers.length})` },
                        { id: 'patient', label: `Patients (${allUsers.filter((u) => u.role === 'patient').length})` },
                        { id: 'doctor', label: `Doctors (${allUsers.filter((u) => u.role === 'doctor').length})` },
                        { id: 'admin', label: `Admins (${allUsers.filter((u) => u.role === 'admin').length})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setUserRoleFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10.5px] transition-all cursor-pointer shrink-0 ${
                            userRoleFilter === tab.id ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* USER ACCOUNTS GRID */}
                {filteredUsers.length === 0 ? (
                  <div className="rounded-3xl border border-slate-800 bg-slate-800/30 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mb-3" />
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">No Users Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      No registered user accounts match your search query or role filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {filteredUsers.map((u) => {
                      const pendingCount = u.appointments.filter((a) => a.status === 'pending').length;

                      return (
                        <div
                          key={u.id + u.email}
                          onClick={() => setSelectedUser(u)}
                          className="rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/95 hover:border-purple-500/50 active:scale-[0.99] transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between gap-3.5 sm:gap-4 cursor-pointer group shadow-lg hover:shadow-purple-950/20"
                        >
                          {/* Card Top: Avatar, Name, Role */}
                          <div className="flex items-start gap-3.5">
                            <div className="size-12 rounded-2xl bg-purple-600/20 text-purple-200 border border-purple-500/30 flex items-center justify-center font-bold text-base shrink-0 group-hover:border-purple-500/60 transition-colors">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-2xl" />
                              ) : (
                                u.name ? u.name.charAt(0).toUpperCase() : 'U'
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-extrabold text-white text-base truncate group-hover:text-purple-300 transition-colors">
                                  {u.name}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase shrink-0 ${
                                  u.role === 'admin'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                    : u.role === 'doctor'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                }`}>
                                  {u.role}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5 truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{u.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Details Line */}
                          <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                            {u.phone && (
                              <div className="flex items-center gap-1.5 font-mono">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">{u.createdAt}</span>
                              <span className="font-mono text-purple-300 text-[10px]">{u.badgeNumber}</span>
                            </div>
                          </div>

                          {/* Appointments Count & Action Button */}
                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25 font-mono text-xs font-bold text-purple-300">
                                {u.appointments.length} Booking{u.appointments.length === 1 ? '' : 's'}
                              </span>
                              {pendingCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] font-bold text-amber-300">
                                  {pendingCount} Pending
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(u);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-sm group-hover:shadow-purple-600/30"
                            >
                              <span>View Appointments</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
              className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-slate-900 p-4 sm:p-8 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto"
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
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-slate-400 font-semibold w-full sm:w-auto mb-1 sm:mb-0">Status Action:</span>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedAppointment.bookingId)}
                    className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all min-h-[36px] ${
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
                    className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all min-h-[36px] ${
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
                    className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl font-bold flex items-center justify-center cursor-pointer transition-all min-h-[36px] ${
                      selectedAppointment.status === 'completed'
                        ? 'bg-[#135940] text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedAppointment.bookingId, 'cancelled')}
                    className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl font-bold flex items-center justify-center cursor-pointer transition-all min-h-[36px] ${
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
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors text-center"
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
              className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-slate-900 p-4 sm:p-7 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none focus:border-purple-500"
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
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Contact Phone</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Insurance Carrier</label>
                    <input
                      type="text"
                      value={newInsurance}
                      onChange={(e) => setNewInsurance(e.target.value)}
                      placeholder="BlueCross / Aetna"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none"
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
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Date</label>
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      placeholder="Mon, Sep 21, 2026"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Time Slot</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs outline-none"
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
