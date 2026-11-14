/**
 * Backend Booking / Appointment Controller
 */

import BookingService from '../services/bookingService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export class BookingController {
  static async getAll(req, res, next) {
    try {
      const bookings = await BookingService.getAll(req.query);
      return successResponse(res, bookings, 'Bookings list retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const booking = await BookingService.getByBookingId(req.params.bookingId);
      if (!booking) {
        return errorResponse(res, 'Booking not found', 404);
      }
      return successResponse(res, booking, 'Booking details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const booking = await BookingService.create(req.body);
      return successResponse(res, booking, 'Appointment booked successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status, adminNotes } = req.body;
      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }
      const updated = await BookingService.updateStatus(req.params.bookingId, status, adminNotes);
      if (!updated) {
        return errorResponse(res, 'Booking not found', 404);
      }
      return successResponse(res, updated, `Booking marked as ${status}`);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const success = await BookingService.delete(req.params.bookingId);
      if (!success) {
        return errorResponse(res, 'Booking not found', 404);
      }
      return successResponse(res, null, 'Booking deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export default BookingController;
