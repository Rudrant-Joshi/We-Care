/**
 * Backend Authentication Controller
 */

import AuthService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return successResponse(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return successResponse(res, result, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res, next) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Not authenticated', 401);
      }
      return successResponse(res, req.user, 'Current user session');
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    return successResponse(res, null, 'Logged out successfully');
  }
}

export default AuthController;
