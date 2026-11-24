/**
 * Helper Utilities & Standard Response Formatter
 */

export function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

export function errorResponse(res, error = 'An error occurred', statusCode = 400, details = null) {
  return res.status(statusCode).json({
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  });
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
