/**
 * Authentication Validators
 */

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'A valid email is required.' });
  }
  next();
}

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'A valid email is required.' });
  }
  next();
}
