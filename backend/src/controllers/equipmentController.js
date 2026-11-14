/**
 * Backend Equipment Controller
 */

import EquipmentService from '../services/equipmentService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export class EquipmentController {
  static async getAll(req, res, next) {
    try {
      const items = await EquipmentService.getAll(req.query);
      return successResponse(res, items, 'Equipment list retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const item = await EquipmentService.getById(req.params.id);
      if (!item) {
        return errorResponse(res, 'Equipment not found', 404);
      }
      return successResponse(res, item, 'Equipment details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const item = await EquipmentService.create(req.body);
      return successResponse(res, item, 'Equipment created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const item = await EquipmentService.update(req.params.id, req.body);
      if (!item) {
        return errorResponse(res, 'Equipment not found', 404);
      }
      return successResponse(res, item, 'Equipment updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const success = await EquipmentService.delete(req.params.id);
      if (!success) {
        return errorResponse(res, 'Equipment not found', 404);
      }
      return successResponse(res, null, 'Equipment deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export default EquipmentController;
