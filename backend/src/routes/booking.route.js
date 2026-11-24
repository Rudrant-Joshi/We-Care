/**
 * Booking / Appointment Routes
 */

import { Router } from 'express';
import BookingController from '../controllers/booking.controller.js';
import { validateBookingCreation } from '../validators/booking.validator.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', BookingController.getAll);
router.get('/:bookingId', BookingController.getById);
router.post('/', validateBookingCreation, BookingController.create);
router.patch('/:bookingId/status', BookingController.updateStatus);
router.delete('/:bookingId', BookingController.remove);

export default router;
