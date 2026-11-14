/**
 * Booking / Appointment Routes
 */

import { Router } from 'express';
import BookingController from '../controllers/bookingController.js';
import { validateBookingCreation } from '../validators/bookingValidator.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', BookingController.getAll);
router.get('/:bookingId', BookingController.getById);
router.post('/', validateBookingCreation, BookingController.create);
router.patch('/:bookingId/status', BookingController.updateStatus);
router.delete('/:bookingId', BookingController.remove);

export default router;
