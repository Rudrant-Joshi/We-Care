/**
 * Types for the WeCare Appointment & Booking Module
 * 
 * Self-contained in src/appointment/ to ensure zero coupling with other modules.
 */

import type { LucideIcon } from 'lucide-react';

export type VisitType = 'in-person' | 'telehealth';
export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'upcoming' | 'completed' | 'cancelled';

export interface DepartmentOption {
  id: string;
  name: string;
  specialty: string;
  badge: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  description: string;
}

export interface DoctorOption {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  specialty: string;
  degree: string;
  rating: number;
  experience: string;
  image: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface DateOption {
  id: string;
  fullDate: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday?: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  period: 'morning' | 'afternoon';
  available: boolean;
}

export interface AppointmentFormData {
  departmentId: string;
  doctorId: string;
  date: string;
  time: string;
  visitType: VisitType;
  patientName: string;
  email: string;
  phone: string;
  insuranceProvider: string;
  reason: string;
}

export interface ConfirmedAppointment extends AppointmentFormData {
  bookingId: string;
  createdAt: string;
  doctorName: string;
  doctorRole: string;
  doctorImage: string;
  departmentName: string;
  specialty: string;
  gradientFrom: string;
  gradientTo: string;
  status: AppointmentStatus;
  location?: string;
  userId?: string;
  adminNotes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  lastUpdated?: string;
  createdAtIso?: string;
  timestamp?: number;
  savedAt?: string;
}

export type StoredAppointment = ConfirmedAppointment;

export function hasUserProvidedReason(reason?: string | null): boolean {
  if (!reason) return false;
  const trimmed = reason.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower === 'comprehensive specialist consultation & assessment' ||
    lower === 'comprehensive specialist consultation and assessment' ||
    lower === 'admin scheduled specialist consultation'
  ) {
    return false;
  }
  return true;
}
