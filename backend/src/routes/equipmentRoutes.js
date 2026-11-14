/**
 * Equipment Routes
 */

import { Router } from 'express';
import EquipmentController from '../controllers/equipmentController.js';
import { validateEquipmentCreation } from '../validators/equipmentValidator.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', EquipmentController.getAll);
router.get('/:id', EquipmentController.getById);
router.post('/', authenticateToken, validateEquipmentCreation, EquipmentController.create);
router.put('/:id', authenticateToken, EquipmentController.update);
router.delete('/:id', authenticateToken, EquipmentController.remove);

export default router;
