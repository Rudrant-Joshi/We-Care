/**
 * Backend Booking / Appointment Service
 */

import { Booking, inMemoryBookings } from '../models/booking.model.js';

export class BookingService {
  static async getAll(filter = {}) {
    let list = [...inMemoryBookings];
    if (filter.email) {
      list = list.filter(b => b.email === filter.email.toLowerCase().trim());
    }
    if (filter.status) {
      list = list.filter(b => b.status === filter.status);
    }
    if (filter.doctorId) {
      list = list.filter(b => b.doctorId === filter.doctorId);
    }
    if (filter.departmentId) {
      list = list.filter(b => b.departmentId === filter.departmentId);
    }
    return list;
  }

  static async getByBookingId(bookingId) {
    return inMemoryBookings.find(b => b.bookingId === bookingId) || null;
  }

  static async create(payload) {
    const booking = new Booking(payload);
    inMemoryBookings.push(booking);
    return booking;
  }

  static async updateStatus(bookingId, status, adminNotes = '') {
    const booking = inMemoryBookings.find(b => b.bookingId === bookingId);
    if (!booking) return null;
    booking.status = status;
    if (adminNotes) {
      booking.adminNotes = adminNotes;
    }
    booking.lastUpdated = new Date().toISOString();
    return booking;
  }

  static async delete(bookingId) {
    const index = inMemoryBookings.findIndex(b => b.bookingId === bookingId);
    if (index === -1) return false;
    inMemoryBookings.splice(index, 1);
    return true;
  }
}

export default BookingService;
