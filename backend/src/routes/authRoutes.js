/**
 * Authentication Routes
 */

import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { validateLogin, validateRegister } from '../validators/authValidator.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);
router.get('/me', authenticateToken, AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
