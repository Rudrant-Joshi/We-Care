/**
 * Booking / Appointment Validators
 */

export function validateBookingCreation(req, res, next) {
  const { departmentId, doctorId, date, time, patientName, email } = req.body;

  if (!departmentId) {
    return res.status(400).json({ success: false, error: 'Department ID is required.' });
  }
  if (!doctorId) {
    return res.status(400).json({ success: false, error: 'Doctor ID is required.' });
  }
  if (!date || !time) {
    return res.status(400).json({ success: false, error: 'Appointment date and time are required.' });
  }
  if (!patientName || patientName.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Patient name must be at least 2 characters.' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'A valid patient email is required.' });
  }

  next();
}
