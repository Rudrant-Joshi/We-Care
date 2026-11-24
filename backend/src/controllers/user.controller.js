/**
 * Backend User Controller
 */

import { inMemoryUsers } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/helpers.util.js';

export class UserController {
  static async getAll(req, res, next) {
    try {
      const safeUsers = inMemoryUsers.map(u => u.toJSON());
      return successResponse(res, safeUsers, 'Users retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const user = inMemoryUsers.find(u => u.id === req.params.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      return successResponse(res, user.toJSON(), 'User profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const user = inMemoryUsers.find(u => u.id === req.params.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;
      if (req.body.specialty) user.specialty = req.body.specialty;
      return successResponse(res, user.toJSON(), 'User updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const index = inMemoryUsers.findIndex(u => u.id === req.params.id);
      if (index === -1) {
        return errorResponse(res, 'User not found', 404);
      }
      inMemoryUsers.splice(index, 1);
      return successResponse(res, null, 'User deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
