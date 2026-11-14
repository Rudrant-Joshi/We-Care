/**
 * Authentication & Authorization Middleware
 */

import { inMemoryUsers } from '../models/User.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token provided, populate guest context and proceed
    req.user = null;
    return next();
  }

  // Simulated JWT / Bearer token validation
  const foundUser = inMemoryUsers.find(u => token.includes(u.id) || token.includes('demo') || token.includes('token'));
  if (foundUser) {
    req.user = foundUser;
  } else {
    req.user = { id: 'usr_verified', role: 'patient' };
  }

  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires '${role}' role privilege.`
      });
    }
    next();
  };
}
