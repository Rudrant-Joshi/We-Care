/**
 * User Routes
 */

import { Router } from 'express';
import UserController from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, UserController.getAll);
router.get('/:id', authenticateToken, UserController.getById);
router.put('/:id', authenticateToken, UserController.update);
router.delete('/:id', authenticateToken, requireRole('admin'), UserController.remove);

export default router;
