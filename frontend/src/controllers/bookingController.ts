/**
 * Booking Controller
 * 
 * Manages patient booking flows, slot scheduling validation, appointment submission,
 * cancellation, and status tracking across views.
 */

import {
  getUserAppointments,
  getStoredAppointments,
  saveAppointment,
  updateStoredAppointmentStatus,
  deleteStoredAppointment,
  cancelStoredAppointment
} from '../services/bookingService';
import type {
  StoredAppointment,
  AppointmentFormData,
  AppointmentStatus
} from '../models/appointmentModel';

export class BookingController {
  static getAppointmentsForUser(email: string): StoredAppointment[] {
    return getUserAppointments({ email });
  }

  static getAllAppointments(): StoredAppointment[] {
    return getStoredAppointments();
  }

  static validateBookingData(data: Partial<AppointmentFormData>): { valid: boolean; error?: string } {
    if (!data.departmentId) return { valid: false, error: 'Please select a clinical department.' };
    if (!data.doctorId) return { valid: false, error: 'Please select a specialist doctor.' };
    if (!data.date) return { valid: false, error: 'Please choose an appointment date.' };
    if (!data.time) return { valid: false, error: 'Please choose an available time slot.' };
    if (!data.patientName || data.patientName.trim().length < 2) {
      return { valid: false, error: 'Please enter patient full name.' };
    }
    if (!data.email || !data.email.includes('@')) {
      return { valid: false, error: 'Please enter a valid patient email address.' };
    }
    return { valid: true };
  }

  static createBooking(
    formData: AppointmentFormData,
    doctorMeta: {
      name: string;
      role?: string;
      specialty?: string;
      image?: string;
      gradientFrom?: string;
      gradientTo?: string;
    },
    departmentName: string
  ): { success: boolean; appointment?: StoredAppointment; error?: string } {
    const validation = this.validateBookingData(formData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const now = new Date();
      const bookingId = 'WC-' + now.getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const appt: StoredAppointment = {
        bookingId,
        patientName: formData.patientName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || '',
        insuranceProvider: formData.insuranceProvider?.trim() || 'Self-Pay / Clinical Direct',
        departmentId: formData.departmentId,
        departmentName,
        doctorId: formData.doctorId,
        doctorName: doctorMeta.name,
        doctorRole: doctorMeta.role || 'Attending Specialist',
        specialty: doctorMeta.specialty || 'Clinical Medicine',
        doctorImage: doctorMeta.image || '/doctor-images/ant-man.jpg',
        gradientFrom: doctorMeta.gradientFrom || 'from-emerald-500',
        gradientTo: doctorMeta.gradientTo || 'to-teal-600',
        date: formData.date,
        time: formData.time,
        visitType: formData.visitType || 'in-person',
        reason: formData.reason?.trim() || 'General Specialist Consultation',
        status: 'pending',
        timestamp: now.getTime(),
        createdAt: now.toLocaleString(),
        createdAtIso: now.toISOString(),
        savedAt: now.toISOString()
      };

      saveAppointment(appt);
      return { success: true, appointment: appt };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit appointment.' };
    }
  }

  static updateStatus(bookingId: string, status: AppointmentStatus): boolean {
    updateStoredAppointmentStatus(bookingId, status);
    return true;
  }

  static cancelBooking(bookingId: string): boolean {
    cancelStoredAppointment(bookingId);
    return true;
  }

  static deleteBooking(bookingId: string): boolean {
    deleteStoredAppointment(bookingId);
    return true;
  }
}

export default BookingController;
