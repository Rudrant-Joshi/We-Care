/**
 * Error Handling Middleware
 */

import logger from '../utils/logger.util.js';

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
}

export function globalErrorHandler(err, req, res, next) {
  logger.error(`Unhandled API error on ${req.method} ${req.url}:`, err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
}
