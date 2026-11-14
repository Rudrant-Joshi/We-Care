/**
 * Equipment Validators
 */

export function validateEquipmentCreation(req, res, next) {
  const { name, category, departmentId, dailyRate } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Equipment name is required.' });
  }
  if (!category) {
    return res.status(400).json({ success: false, error: 'Category is required.' });
  }
  if (!departmentId) {
    return res.status(400).json({ success: false, error: 'Department ID is required.' });
  }
  next();
}
