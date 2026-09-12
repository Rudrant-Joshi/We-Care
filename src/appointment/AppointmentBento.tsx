"use client";

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  ArrowRight,
  Star,
  Download,
  RefreshCw,
  Heart,
  Brain,
  Bone,
  Baby,
  Microscope,
  Siren,
  ScanLine,
  Info,
  Check,
  Building2,
  AlertCircle,
  ListChecks,
} from 'lucide-react';

import type {
  DepartmentOption,
  DoctorOption,
  DateOption,
  TimeSlot,
  VisitType,
  ConfirmedAppointment,
} from './types';
import { saveAppointment } from './storage';
import { DEPARTMENT_COLORS } from '../lib/department-colors';
import { useAuth } from '../auth';

/* ==========================================================================
   Static Department Catalog (Synced 100% with Canonical Department Colors)
   ========================================================================== */

const DEPARTMENTS: DepartmentOption[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    specialty: 'Cardiovascular Institute',
    badge: DEPARTMENT_COLORS.cardiology.badge,
    icon: Heart,
    gradientFrom: DEPARTMENT_COLORS.cardiology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.cardiology.gradientTo,
    description: 'Comprehensive cardiovascular diagnostics, interventional catheterization, and post-cardiac rehabilitation.',
  },
  {
    id: 'neurology',
    name: 'Neurology',
    specialty: 'Brain & Nervous System',
    badge: DEPARTMENT_COLORS.neurology.badge,
    icon: Brain,
    gradientFrom: DEPARTMENT_COLORS.neurology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.neurology.gradientTo,
    description: 'Advanced neuro-diagnostics, acute stroke management, and spinal reconstructive surgery.',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    specialty: 'Bones, Joints & Spine',
    badge: DEPARTMENT_COLORS.orthopedics.badge,
    icon: Bone,
    gradientFrom: DEPARTMENT_COLORS.orthopedics.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.orthopedics.gradientTo,
    description: 'Robotic-assisted joint replacement, sports medicine, and reconstructive spine care.',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    specialty: 'Newborn to Adolescent Care',
    badge: DEPARTMENT_COLORS.pediatrics.badge,
    icon: Baby,
    gradientFrom: DEPARTMENT_COLORS.pediatrics.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.pediatrics.gradientTo,
    description: 'Warm, family-centered pediatric care, neonatal intensive therapy, and growth monitoring.',
  },
  {
    id: 'oncology',
    name: 'Oncology',
    specialty: 'Cancer Diagnostics & Care',
    badge: DEPARTMENT_COLORS.oncology.badge,
    icon: Microscope,
    gradientFrom: DEPARTMENT_COLORS.oncology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.oncology.gradientTo,
    description: 'Targeted immunotherapies, precision radiation oncology, and multi-disciplinary tumor care.',
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    specialty: 'Skin, Hair & Nail Health',
    badge: DEPARTMENT_COLORS.dermatology.badge,
    icon: Sparkles,
    gradientFrom: DEPARTMENT_COLORS.dermatology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.dermatology.gradientTo,
    description: 'Medical and cosmetic dermatology, Mohs micrographic surgery, and advanced laser therapy.',
  },
  {
    id: 'emergency',
    name: 'Emergency & Trauma',
    specialty: 'Level 1 Trauma Center',
    badge: DEPARTMENT_COLORS.emergency.badge,
    icon: Siren,
    gradientFrom: DEPARTMENT_COLORS.emergency.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.emergency.gradientTo,
    description: 'Round-the-clock Level-1 trauma response with rapid triage protocols and resuscitation bays.',
  },
  {
    id: 'radiology',
    name: 'Radiology & Imaging',
    specialty: 'Advanced Imaging & Diagnostics',
    badge: DEPARTMENT_COLORS.radiology.badge,
    icon: ScanLine,
    gradientFrom: DEPARTMENT_COLORS.radiology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.radiology.gradientTo,
    description: 'High-field 7T MRI scanners, dual-source photon CT, and same-day diagnostic reports.',
  },
];

/* ==========================================================================
   Doctor Roster with Canonical Department Colors & Verified Portraits
   ========================================================================== */

const DOCTORS: DoctorOption[] = [
  {
    id: 'iron-man',
    name: 'Dr. Tony Stark',
    role: 'Chief Medical Director & Cardiothoracic Lead',
    departmentId: 'cardiology',
    specialty: 'Cardiothoracic Surgery & Bio-Cardiovascular Systems',
    degree: 'MD, FACS',
    rating: 5.0,
    experience: '28+ Yrs',
    image: '/doctor-images/iron-man.jpg',
    gradientFrom: DEPARTMENT_COLORS.cardiology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.cardiology.gradientTo,
  },
  {
    id: 'war-machine',
    name: 'Dr. James Rhodes',
    role: 'Interventional Cardiology & Cardiac Trauma Lead',
    departmentId: 'cardiology',
    specialty: 'Advanced Coronary Interventions & Structural Heart',
    degree: 'MD, FACC',
    rating: 4.9,
    experience: '18+ Yrs',
    image: '/doctor-images/war-machine.jpg',
    gradientFrom: DEPARTMENT_COLORS.cardiology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.cardiology.gradientTo,
  },
  {
    id: 'doctor-strange',
    name: 'Dr. Stephen Strange',
    role: 'Chief of Neurosurgery & Vascular Neurology',
    departmentId: 'neurology',
    specialty: 'Complex Micro-Neurosurgery & Cerebrovascular Repair',
    degree: 'MD, PhD',
    rating: 5.0,
    experience: '22+ Yrs',
    image: '/doctor-images/doctor-strange.jpg',
    gradientFrom: DEPARTMENT_COLORS.neurology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.neurology.gradientTo,
  },
  {
    id: 'hulk',
    name: 'Dr. Bruce Banner',
    role: 'Director of Neurobiology & Cellular Dynamics',
    departmentId: 'neurology',
    specialty: 'Biophysical Neural Pathways & Autonomic Regulation',
    degree: 'MD, PhD',
    rating: 4.9,
    experience: '24+ Yrs',
    image: '/doctor-images/hulk.jpg',
    gradientFrom: DEPARTMENT_COLORS.neurology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.neurology.gradientTo,
  },
  {
    id: 'captain-america',
    name: 'Dr. Steve Rogers',
    role: 'Chief of Orthopedic Surgery & Physical Rehab',
    departmentId: 'orthopedics',
    specialty: 'Peak Kinetic Biomechanics & Bone Restoration',
    degree: 'MD, FAAOS',
    rating: 5.0,
    experience: '25+ Yrs',
    image: '/doctor-images/captain-america.jpg',
    gradientFrom: DEPARTMENT_COLORS.orthopedics.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.orthopedics.gradientTo,
  },
  {
    id: 'winter-soldier',
    name: 'Dr. Bucky Barnes',
    role: 'Bionic Prosthetics & Joint Reconstruction Lead',
    departmentId: 'orthopedics',
    specialty: 'Vibranium Joint Arthroplasty & Neural Bionics',
    degree: 'MD, FAAOS',
    rating: 4.9,
    experience: '19+ Yrs',
    image: '/doctor-images/winter-soldier.jpg',
    gradientFrom: DEPARTMENT_COLORS.orthopedics.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.orthopedics.gradientTo,
  },
  {
    id: 'spider-man',
    name: 'Dr. Peter Parker',
    role: 'Pediatric Care Lead & Adolescent Medicine',
    departmentId: 'pediatrics',
    specialty: 'General Pediatrics & Youth Vitality Medicine',
    degree: 'MD, FAAP',
    rating: 5.0,
    experience: '12+ Yrs',
    image: '/doctor-images/spider-man.jpg',
    gradientFrom: DEPARTMENT_COLORS.pediatrics.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.pediatrics.gradientTo,
  },
  {
    id: 'ant-man',
    name: 'Dr. Scott Lang',
    role: 'Micro-Pediatrics & Neonatal Care Specialist',
    departmentId: 'pediatrics',
    specialty: 'Precision Neonatal Micro-Interventions & NICU',
    degree: 'MD',
    rating: 4.9,
    experience: '14+ Yrs',
    image: '/doctor-images/ant-man.jpg',
    gradientFrom: DEPARTMENT_COLORS.pediatrics.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.pediatrics.gradientTo,
  },
  {
    id: 'black-panther',
    name: "Dr. T'Challa",
    role: 'Chief of Cellular Oncology & Advanced Therapeutics',
    departmentId: 'oncology',
    specialty: 'Targeted Molecular Immunotherapy & Cellular Oncology',
    degree: 'MD, PhD',
    rating: 5.0,
    experience: '21+ Yrs',
    image: '/doctor-images/black-panther.jpg',
    gradientFrom: DEPARTMENT_COLORS.oncology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.oncology.gradientTo,
  },
  {
    id: 'vision',
    name: 'Dr. Vision',
    role: 'Computational Oncology & Targeted Radiosurgery',
    departmentId: 'oncology',
    specialty: 'Molecular Spectral Targeting & Sub-Millimeter Radiosurgery',
    degree: 'MD, PhD',
    rating: 4.9,
    experience: '16+ Yrs',
    image: '/doctor-images/vision.jpg',
    gradientFrom: DEPARTMENT_COLORS.oncology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.oncology.gradientTo,
  },
  {
    id: 'black-widow',
    name: 'Dr. Natasha Romanoff',
    role: 'Dermatologic Surgeon & Scar Reconstruction Lead',
    departmentId: 'dermatology',
    specialty: 'Surgical Dermatology, Trauma Revision & Tissue Repair',
    degree: 'MD, FAAD',
    rating: 5.0,
    experience: '18+ Yrs',
    image: '/doctor-images/black-widow.jpg',
    gradientFrom: DEPARTMENT_COLORS.dermatology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.dermatology.gradientTo,
  },
  {
    id: 'scarlet-witch',
    name: 'Dr. Wanda Maximoff',
    role: 'Cellular Rejuvenation & Cosmetic Dermatology',
    departmentId: 'dermatology',
    specialty: 'Cosmetic Dermatology & Deep Dermal Restorative Therapy',
    degree: 'MD',
    rating: 4.9,
    experience: '14+ Yrs',
    image: '/doctor-images/scarlet-witch.jpg',
    gradientFrom: DEPARTMENT_COLORS.dermatology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.dermatology.gradientTo,
  },
  {
    id: 'thor',
    name: 'Dr. Thor Odinson',
    role: 'Head of Emergency Trauma & Acute Resuscitation',
    departmentId: 'emergency',
    specialty: 'Cardiac Arrest Resuscitation & Emergency Defibrillation',
    degree: 'MD, FACEP',
    rating: 5.0,
    experience: '25+ Yrs',
    image: '/doctor-images/thor.jpg',
    gradientFrom: DEPARTMENT_COLORS.emergency.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.emergency.gradientTo,
  },
  {
    id: 'captain-marvel',
    name: 'Dr. Carol Danvers',
    role: 'Acute Trauma Surgeon & Rapid Flight Response',
    departmentId: 'emergency',
    specialty: 'Critical Multi-Trauma Stabilization & Flight Evacuation',
    degree: 'MD',
    rating: 4.9,
    experience: '17+ Yrs',
    image: '/doctor-images/captain-marvel.jpg',
    gradientFrom: DEPARTMENT_COLORS.emergency.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.emergency.gradientTo,
  },
  {
    id: 'hawkeye',
    name: 'Dr. Clint Barton',
    role: 'Chief Diagnostic Radiologist & Precision Imaging',
    departmentId: 'radiology',
    specialty: 'Zero-Miss Diagnostic Radiology, MRI & CT Diagnostics',
    degree: 'MD',
    rating: 5.0,
    experience: '21+ Yrs',
    image: '/doctor-images/hawkeye.jpg',
    gradientFrom: DEPARTMENT_COLORS.radiology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.radiology.gradientTo,
  },
  {
    id: 'falcon',
    name: 'Dr. Sam Wilson',
    role: 'Aerial & High-Resolution Bio-Spectral Imaging Lead',
    departmentId: 'radiology',
    specialty: 'Bio-Spectral 3D Tomography & Image-Guided Scans',
    degree: 'MD, FACR',
    rating: 4.9,
    experience: '16+ Yrs',
    image: '/doctor-images/falcon.jpg',
    gradientFrom: DEPARTMENT_COLORS.radiology.gradientFrom,
    gradientTo: DEPARTMENT_COLORS.radiology.gradientTo,
  },
];

/* ==========================================================================
   Time Slots & Dynamic Date Helpers
   ========================================================================== */

const TIME_SLOTS: TimeSlot[] = [
  { id: 't1', time: '08:30 AM', period: 'morning', available: true },
  { id: 't2', time: '09:15 AM', period: 'morning', available: true },
  { id: 't3', time: '10:00 AM', period: 'morning', available: true },
  { id: 't4', time: '10:45 AM', period: 'morning', available: true },
  { id: 't5', time: '11:30 AM', period: 'morning', available: true },
  { id: 't6', time: '01:15 PM', period: 'afternoon', available: true },
  { id: 't7', time: '02:00 PM', period: 'afternoon', available: true },
  { id: 't8', time: '02:45 PM', period: 'afternoon', available: true },
  { id: 't9', time: '03:30 PM', period: 'afternoon', available: true },
  { id: 't10', time: '04:15 PM', period: 'afternoon', available: true },
  { id: 't11', time: '05:00 PM', period: 'afternoon', available: true },
];

const INSURANCE_PROVIDERS = [
  'BlueCross BlueShield',
  'Aetna Healthcare',
  'UnitedHealthcare (Optum)',
  'Cigna Health & Life',
  'Kaiser Permanente (PPO)',
  'Medicare / Senior Advantage',
  'Self-Pay / Direct Health Plan',
];

function generateNextDays(count = 7): DateOption[] {
  const days: DateOption[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);

    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNumber = d.getDate();
    const fullDate = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    days.push({
      id: `d-${i}`,
      fullDate,
      dayName,
      dayNumber,
      monthName,
      isToday: i === 0,
    });
  }

  return days;
}

/* ==========================================================================
   Main Appointment Bento Component
   ========================================================================== */

export function AppointmentBento() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const dateOptions = useMemo(() => generateNextDays(7), []);

  // Form selections state
  const [selectedDeptId, setSelectedDeptId] = useState<string>('cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('iron-man');
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].fullDate);
  const [selectedTime, setSelectedTime] = useState<string>('09:15 AM');
  const [visitType] = useState<VisitType>('in-person');

  // Patient details state - initialized from authenticated user if available
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [insurance, setInsurance] = useState('BlueCross BlueShield');
  const [reason, setReason] = useState('');

  // Sync state when currentUser authenticates or changes
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setPatientName((prev) => prev || currentUser.name);
      if (currentUser.email) setEmail((prev) => prev || currentUser.email);
      if (currentUser.phone) setPhone((prev) => prev || currentUser.phone || '');
    }
  }, [currentUser]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedAppointment | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active Department
  const activeDept = useMemo(
    () => DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0],
    [selectedDeptId]
  );

  // Filtered Doctors list matching active department
  const availableDoctors = useMemo(() => {
    return DOCTORS.filter((doc) => doc.departmentId === selectedDeptId);
  }, [selectedDeptId]);

  // Active selected Doctor
  const activeDoctor = useMemo(() => {
    const found = DOCTORS.find((d) => d.id === selectedDoctorId);
    if (found && found.departmentId === selectedDeptId) {
      return found;
    }
    return availableDoctors[0] || DOCTORS[0];
  }, [selectedDoctorId, selectedDeptId, availableDoctors]);

  // Handle department change: reset doctor if incompatible
  const handleSelectDepartment = (deptId: string) => {
    setSelectedDeptId(deptId);
    // If current selected doctor doesn't belong to new dept, switch to first doctor of new department
    const currDoc = DOCTORS.find((d) => d.id === selectedDoctorId);
    if (!currDoc || currDoc.departmentId !== deptId) {
      const firstDocOfDept = DOCTORS.find((d) => d.departmentId === deptId);
      if (firstDocOfDept) {
        setSelectedDoctorId(firstDocOfDept.id);
      }
    }
  };

  // Submit handler
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Enforce Authentication before booking
    if (!currentUser) {
      setValidationError('You must sign in or register before scheduling an appointment.');
      setTimeout(() => {
        navigate('/login?redirect=/book-appointment');
      }, 1000);
      return;
    }

    if (!patientName.trim()) {
      setValidationError('Please enter your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address for appointment confirmations.');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      setValidationError('Please enter a valid contact phone number.');
      return;
    }

    setIsSubmitting(true);

    // Simulate clinical triage and appointment reservation
    setTimeout(() => {
      const randomCode = `WC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
      const bookingData: ConfirmedAppointment = {
        bookingId: randomCode,
        userId: currentUser?.id,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        departmentId: selectedDeptId,
        doctorId: activeDoctor.id,
        doctorName: activeDoctor.name,
        doctorRole: activeDoctor.role,
        doctorImage: activeDoctor.image,
        departmentName: activeDept.name,
        specialty: activeDept.specialty,
        gradientFrom: activeDept.gradientFrom,
        gradientTo: activeDept.gradientTo,
        date: selectedDate,
        time: selectedTime,
        visitType,
        patientName,
        email,
        phone,
        insuranceProvider: insurance,
        reason: reason || 'Comprehensive Specialist Consultation & Assessment',
        status: 'pending',
        location: 'WeCare Clinical Tower 4, Suite 800 (San Francisco, CA)',
      };

      saveAppointment(bookingData);
      setConfirmedBooking(bookingData);
      setIsSubmitting(false);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }, 900);
  };

  // Reset booking form
  const handleResetBooking = () => {
    setConfirmedBooking(null);
    setPatientName('');
    setEmail('');
    setPhone('');
    setReason('');
    setValidationError(null);
  };

  // Dynamic focus styling matching active department signature color
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = activeDept.gradientFrom;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${activeDept.gradientFrom}25`;
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.boxShadow = '';
  };

  return (
    <section id="appointment-bento-section" className="relative w-full max-w-[1720px] mx-auto px-4 sm:px-8 md:px-14 py-8 md:py-16">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
      >
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>INSTANT CLINICAL RESERVATION</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
          Book an Appointment with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600">
            WeCare Specialists
          </span>
        </h2>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Schedule in-person clinical consultations with board-certified hospital specialists.
          Select your specialty, choose your doctor, and receive immediate clinical confirmation.
        </p>

        {/* Quick Highlights Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-slate-200/80 text-xs font-mono font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero-Wait Digital Triage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Board-Certified Specialists</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>40+ Insurers Accepted</span>
          </div>
        </div>
      </motion.div>

      {/* Main Booking Container */}
      <AnimatePresence mode="wait">
        {!confirmedBooking ? (
          <motion.div
            key="booking-form-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* LEFT 7 COLS: Selection Steps Form */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              {/* STEP 1: Select Medical Department */}
              <motion.div
                id="step-specialty"
                initial={{ opacity: 0, y: 55, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-28 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm transform-gpu will-change-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-7 rounded-lg text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                        boxShadow: `0 2px 8px ${activeDept.gradientFrom}40`,
                      }}
                    >
                      01
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Select Medical Specialty
                      </h3>
                      <p className="text-xs text-slate-500">
                        Choose the clinical department matching your health needs
                      </p>
                    </div>
                  </div>
                  <span
                    className="hidden sm:inline-block text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border shadow-2xs transition-all"
                    style={{
                      color: activeDept.gradientFrom,
                      backgroundColor: `${activeDept.gradientFrom}15`,
                      borderColor: `${activeDept.gradientFrom}35`,
                    }}
                  >
                    {activeDept.name} Selected
                  </span>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DEPARTMENTS.map((dept, idx) => {
                    const isSelected = selectedDeptId === dept.id;
                    const Icon = dept.icon;
                    return (
                      <motion.button
                        key={dept.id}
                        type="button"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.03 * idx, duration: 0.35 }}
                        whileHover={{ y: -4, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectDepartment(dept.id)}
                        className={`group relative p-3 rounded-xl border text-left transition-colors duration-200 cursor-pointer flex flex-col justify-between transform-gpu ${
                          isSelected
                            ? 'text-white shadow-md'
                            : 'bg-slate-50/70 hover:bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                        }`}
                        style={
                          isSelected
                            ? {
                                background: `linear-gradient(135deg, ${dept.gradientFrom}, ${dept.gradientTo})`,
                                borderColor: dept.gradientFrom,
                                boxShadow: `0 8px 20px -4px ${dept.gradientFrom}50`,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`size-7 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs'
                            }`}
                            style={{
                              color: isSelected ? '#ffffff' : dept.gradientFrom,
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <span className="size-2 rounded-full bg-white animate-pulse" />
                          )}
                        </div>
                        <div>
                          <span
                            className={`block text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isSelected ? 'text-white/90' : 'text-slate-500'
                            }`}
                          >
                            {dept.badge}
                          </span>
                          <span className="block text-xs font-bold truncate leading-tight mt-0.5">
                            {dept.name}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* STEP 2: Doctor Selection with Verified Face Headshots */}
              <motion.div
                id="step-doctor"
                initial={{ opacity: 0, y: 55, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-28 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm transform-gpu will-change-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-7 rounded-lg text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                        boxShadow: `0 2px 8px ${activeDept.gradientFrom}40`,
                      }}
                    >
                      02
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Select Physician or Specialist
                      </h3>
                      <p className="text-xs text-slate-500">
                        Available specialists for {activeDept.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {availableDoctors.length} available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {availableDoctors.map((doc, idx) => {
                    const isSelected = activeDoctor.id === doc.id;
                    const docColor = doc.gradientFrom || activeDept.gradientFrom;

                    return (
                      <motion.button
                        key={doc.id}
                        type="button"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.04 * idx, duration: 0.35 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`relative p-3 rounded-xl border text-left transition-colors duration-200 cursor-pointer flex items-center gap-3 transform-gpu ${
                          isSelected
                            ? 'shadow-xs ring-2'
                            : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: `${docColor}12`,
                                borderColor: docColor,
                                boxShadow: `0 4px 14px ${docColor}25`,
                              }
                            : undefined
                        }
                      >
                        {/* Doctor Avatar */}
                        <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 bg-slate-100 shadow-2xs">
                          <img
                            src={doc.image || `/doctor-images/${doc.id}.jpg`}
                            alt={doc.name}
                            className="w-full h-full object-cover object-[center_25%]"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.dataset.fallback) {
                                target.dataset.fallback = '1';
                                target.src = `/doctor-images/${doc.id}.jpg`;
                              }
                            }}
                          />
                          {isSelected && (
                            <div
                              className="absolute inset-0 border-2 rounded-xl"
                              style={{ borderColor: docColor }}
                            />
                          )}
                        </div>

                        {/* Doctor Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {doc.name}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: docColor }} />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {doc.role}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                              <Star className="w-2.5 h-2.5 fill-amber-500 stroke-none" />
                              <span>{doc.rating}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {doc.experience}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* STEP 3: Date & Time Picker */}
              <motion.div
                id="step-datetime"
                initial={{ opacity: 0, y: 55, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-28 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm transform-gpu will-change-transform"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <span
                    className="size-7 rounded-lg text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                      boxShadow: `0 2px 8px ${activeDept.gradientFrom}40`,
                    }}
                  >
                    03
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Preferred Date & Time Slot
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select your preferred consultation window
                    </p>
                  </div>
                </div>

                {/* Day selector pills */}
                <div className="mb-5">
                  <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Select Day
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {dateOptions.map((date) => {
                      const isSelected = selectedDate === date.fullDate;
                      return (
                        <motion.button
                          key={date.id}
                          type="button"
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          onClick={() => setSelectedDate(date.fullDate)}
                          className={`p-2.5 rounded-xl border text-center transition-colors duration-200 cursor-pointer flex flex-col items-center transform-gpu ${
                            isSelected
                              ? 'text-white shadow-md'
                              : 'bg-slate-50/70 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                          }`}
                          style={
                            isSelected
                              ? {
                                  background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                                  borderColor: activeDept.gradientFrom,
                                  boxShadow: `0 4px 14px ${activeDept.gradientFrom}40`,
                                }
                              : undefined
                          }
                        >
                          <span
                            className={`text-[10px] font-mono font-semibold uppercase ${
                              isSelected ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {date.dayName}
                          </span>
                          <span className="text-base font-extrabold my-0.5">
                            {date.dayNumber}
                          </span>
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            {date.monthName}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Available Time Windows
                    </label>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Standard: 30 Mins Consultation
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <motion.button
                          key={slot.id}
                          type="button"
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-2 rounded-lg text-xs font-mono font-bold transition-colors duration-200 cursor-pointer text-center border transform-gpu ${
                            isSelected
                              ? 'shadow-xs'
                              : 'bg-slate-50/80 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                          style={
                            isSelected
                              ? {
                                  background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                                  borderColor: activeDept.gradientFrom,
                                  color: '#ffffff',
                                  boxShadow: `0 4px 12px ${activeDept.gradientFrom}40`,
                                }
                              : undefined
                          }
                        >
                          {slot.time}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* STEP 4: Visit Modality & Patient Information Form */}
              <motion.div
                id="step-details"
                initial={{ opacity: 0, y: 55, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-28 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm transform-gpu will-change-transform"
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <span
                    className="size-7 rounded-lg text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                      boxShadow: `0 2px 8px ${activeDept.gradientFrom}40`,
                    }}
                  >
                    04
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Patient Clinical Intake Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Provide contact and clinical intake data for hospital reservation
                    </p>
                  </div>
                </div>

                {/* Patient Information Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Patient Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          placeholder="e.g. Eleanor Vance"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          placeholder="e.g. eleanor@example.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          placeholder="e.g. (415) 890-2341"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Insurance Carrier */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Insurance Carrier (Optional)
                      </label>
                      <select
                        value={insurance}
                        onChange={(e) => setInsurance(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none transition-all cursor-pointer"
                      >
                        {INSURANCE_PROVIDERS.map((ins) => (
                          <option key={ins} value={ins}>
                            {ins}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clinical Reason / Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason for Consultation & Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Briefly describe your symptoms, recent tests, or consultation goals..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Validation Error Alert */}
                  {validationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Submit Button with Spring Micro-interaction */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.015 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.985 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-colors duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group hover:brightness-105 transform-gpu"
                      style={{
                        background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                        boxShadow: `0 6px 20px -4px ${activeDept.gradientFrom}50`,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Reserving Clinical Time Slot...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm & Book Appointment</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>

            </div>

            {/* RIGHT 5 COLS: Live Interactive Appointment Pass & Info Bento */}
            <div id="step-pass" className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-6 scroll-mt-28">
              
              {/* Modern Clinical Pass Card with WeCare Signature Backing Shade & Ambient Glow (GPU Accelerated) */}
              <motion.div
                initial={{ opacity: 0, y: 55, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative w-full rounded-2xl transition-all duration-300 transform-gpu will-change-transform"
              >
                
                {/* 1. Skewed gradient backing panel - High visibility shade (GPU transform only) */}
                <span
                  className="absolute -top-1.5 left-[10px] w-[calc(100%-12px)] h-full rounded-2xl transform skew-x-[6deg] opacity-90 group-hover:skew-x-[2deg] group-hover:opacity-100 transition-transform duration-300 pointer-events-none z-0 transform-gpu"
                  style={{
                    background: `linear-gradient(315deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                  }}
                />

                {/* 2. Blurred vibrant neon glow shadow (GPU transform only) */}
                <span
                  className="absolute -top-1 left-[10px] w-[calc(100%-12px)] h-full rounded-2xl transform skew-x-[6deg] opacity-55 blur-[24px] group-hover:skew-x-[2deg] group-hover:opacity-80 group-hover:blur-[30px] transition-all duration-300 pointer-events-none z-0 transform-gpu"
                  style={{
                    background: `linear-gradient(315deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                  }}
                />

                {/* 3. Foreground Liquid Glass Content Panel with color-infused tint */}
                <div
                  className="relative z-20 h-full p-6 backdrop-blur-md rounded-2xl border text-slate-900 transition-all duration-300 flex flex-col justify-between transform-gpu overflow-hidden"
                  style={{
                    background: `linear-gradient(175deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 55%, ${activeDept.gradientFrom}14 100%)`,
                    borderColor: `${activeDept.gradientFrom}45`,
                    boxShadow: `0 10px 28px -6px ${activeDept.gradientFrom}28, 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.95)`,
                  }}
                >
                  {/* Top colored accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                    }}
                  />

                  {/* Pass Header */}
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-7 rounded-lg flex items-center justify-center text-white shadow-2xs"
                          style={{
                            background: `linear-gradient(135deg, ${activeDept.gradientFrom}, ${activeDept.gradientTo})`,
                          }}
                        >
                          <activeDept.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
                          APPOINTMENT SUMMARY
                        </span>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800">
                        CONFIRMED ON SUBMIT
                      </span>
                    </div>

                    {/* Doctor Preview Box */}
                    <div className="flex items-center gap-3.5 my-4 p-3 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs">
                      <img
                        src={activeDoctor.image || `/doctor-images/${activeDoctor.id}.jpg`}
                        alt={activeDoctor.name}
                        className="size-14 rounded-xl object-cover object-[center_25%] border border-slate-200/80 shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = '1';
                            target.src = `/doctor-images/${activeDoctor.id}.jpg`;
                          }
                        }}
                      />
                      <div className="min-w-0">
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider block"
                          style={{ color: activeDept.gradientFrom }}
                        >
                          {activeDept.name} Specialty
                        </span>
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {activeDoctor.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {activeDoctor.role}
                        </p>
                      </div>
                    </div>

                    {/* Schedule Ticket Grid */}
                    <div className="grid grid-cols-2 gap-2.5 my-4">
                      <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono mb-1">
                          <CalendarIcon className="w-3.5 h-3.5" style={{ color: activeDept.gradientFrom }} />
                          <span>DATE</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {selectedDate}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono mb-1">
                          <Clock className="w-3.5 h-3.5" style={{ color: activeDept.gradientFrom }} />
                          <span>TIME</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {selectedTime}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 col-span-2">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono mb-1">
                          <MapPin className="w-3.5 h-3.5" style={{ color: activeDept.gradientFrom }} />
                          <span>MODALITY & LOCATION</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 block">
                          WeCare Clinical Tower 4, Suite 800 (San Francisco, CA)
                        </span>
                      </div>
                    </div>

                    {/* Financial / Insurance Transparency */}
                    <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between text-xs mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" style={{ color: activeDept.gradientFrom }} />
                        <div>
                          <span className="block font-bold text-slate-900">
                            {insurance}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Direct In-Network Claims Processing
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border"
                        style={{
                          color: activeDept.gradientFrom,
                          backgroundColor: `${activeDept.gradientFrom}15`,
                          borderColor: `${activeDept.gradientFrom}35`,
                        }}
                      >
                        Co-Pay $0–$35
                      </span>
                    </div>
                  </div>

                  {/* Bottom Security Assurance */}
                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>HIPAA & HL7 ENCRYPTED</span>
                    </span>
                    <span>SLOT HELD 15 MIN</span>
                  </div>

                </div>
              </motion.div>

              {/* Value Props Mini Bento Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs cursor-default transform-gpu"
                >
                  <div
                    className="size-7 rounded-lg flex items-center justify-center mb-2"
                    style={{
                      backgroundColor: `${activeDept.gradientFrom}15`,
                      color: activeDept.gradientFrom,
                    }}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mb-0.5">
                    Fast Digital Check-in
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Skip the waiting room paperwork by completing digital intake beforehand.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs cursor-default transform-gpu"
                >
                  <div
                    className="size-7 rounded-lg flex items-center justify-center mb-2"
                    style={{
                      backgroundColor: `${activeDept.gradientFrom}15`,
                      color: activeDept.gradientFrom,
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mb-0.5">
                    SMS Concierge Service
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Get automated calendar reminders and one-tap cancellation/reschedule links.
                  </p>
                </motion.div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* ==========================================================================
             CONFIRMED BOOKING SUCCESS PASS
             ========================================================================== */
          <motion.div
            key="booking-success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-xl overflow-hidden">
              
              {/* Top Accent Gradient Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{
                  background: `linear-gradient(90deg, ${confirmedBooking.gradientFrom}, ${confirmedBooking.gradientTo})`,
                }}
              />

              {/* Success Badge */}
              <div className="text-center pb-6 border-b border-slate-200">
                <div
                  className="size-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"
                  style={{
                    backgroundColor: `${confirmedBooking.gradientFrom}18`,
                    color: confirmedBooking.gradientFrom,
                  }}
                >
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2 border bg-amber-50 text-amber-800 border-amber-300"
                >
                  REQUEST CODE: {confirmedBooking.bookingId} &bull; PENDING ADMIN APPROVAL
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Appointment Request Submitted!
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mt-1">
                  Your appointment request has been dispatched to hospital administration and is <strong className="text-amber-700">pending admin approval</strong>. A notification will update upon confirmation.
                </p>
              </div>

              {/* Booking Summary Pass */}
              <div className="py-6 space-y-4">
                {/* Doctor Row */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <img
                    src={(confirmedBooking.doctorImage || '').replace(/^\/doctors\//, '/doctor-images/') || `/doctor-images/${confirmedBooking.doctorId || 'iron-man'}.jpg`}
                    alt={confirmedBooking.doctorName}
                    className="size-16 rounded-xl object-cover object-[center_25%] border border-slate-200 shadow-sm"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = `/doctor-images/${confirmedBooking.doctorId || 'iron-man'}.jpg`;
                      }
                    }}
                  />
                  <div>
                    <span
                      className="text-[11px] font-mono font-bold uppercase tracking-wider block"
                      style={{ color: confirmedBooking.gradientFrom }}
                    >
                      {confirmedBooking.specialty}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {confirmedBooking.doctorName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {confirmedBooking.doctorRole}
                    </p>
                  </div>
                </div>

                {/* Details Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Patient Name
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {confirmedBooking.patientName}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Date & Reserved Slot
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {confirmedBooking.date} @ {confirmedBooking.time}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Visit Format
                    </span>
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" style={{ color: confirmedBooking.gradientFrom }} />
                      <span>In-Person Clinical Suite</span>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      Insurance Carrier
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {confirmedBooking.insuranceProvider}
                    </span>
                  </div>
                </div>

                {/* Patient Instructions */}
                <div
                  className="p-4 rounded-xl border text-xs text-slate-700 leading-relaxed space-y-1"
                  style={{
                    backgroundColor: `${confirmedBooking.gradientFrom}08`,
                    borderColor: `${confirmedBooking.gradientFrom}25`,
                  }}
                >
                  <div
                    className="font-bold flex items-center gap-1.5"
                    style={{ color: confirmedBooking.gradientFrom }}
                  >
                    <Info className="w-4 h-4" />
                    <span>Next Steps & Preparation</span>
                  </div>
                  <p>
                    • Status: <strong className="text-amber-700">Pending Clinic Admin Approval</strong>. Once approved by the administrator, your clinical pass will be confirmed.
                  </p>
                  <p>
                    • Please arrive 10 minutes prior with a valid government photo ID and insurance card.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/appointments')}
                  className="w-full sm:w-1/3 py-3 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ListChecks className="w-4 h-4" />
                  <span>My Appointments</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:WeCare Appointment - ${confirmedBooking.doctorName}\nDESCRIPTION:${confirmedBooking.specialty} consultation with ${confirmedBooking.doctorName}.\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
                    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `wecare-appointment-${confirmedBooking.bookingId}.ics`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full sm:w-1/3 py-3 px-3 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:brightness-110"
                  style={{
                    background: `linear-gradient(135deg, ${confirmedBooking.gradientFrom}, ${confirmedBooking.gradientTo})`,
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Add to Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetBooking}
                  className="w-full sm:w-1/3 py-3 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Book Another</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
