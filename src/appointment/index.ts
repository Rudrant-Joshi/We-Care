/**
 * Appointment Feature Module
 *
 * Clean module export interface for Appointments & Book Appointment features.
 * This self-contained folder structure ensures zero-coupling with other pages,
 * making future deletion or toggling trivial.
 */

export { default, default as AppointmentsPage } from './AppointmentsPage';
export { default as BookAppointmentPage } from './BookAppointmentPage';
export { default as AppointmentSection } from './AppointmentSection';
export { MyAppointmentsBento } from './MyAppointmentsBento';
export { AppointmentBento } from './AppointmentBento';
export * from './types';
export * from './storage';
