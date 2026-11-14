/**
 * Booking / Appointment Model
 */

export class Booking {
  constructor({
    bookingId,
    patientName,
    email,
    phone = '',
    departmentId,
    departmentName,
    doctorId,
    doctorName,
    doctorImage = '/doctor-images/ant-man.jpg',
    doctorRole = 'Attending Specialist',
    specialty = 'Clinical Medicine',
    date,
    time,
    visitType = 'in-person',
    insuranceProvider = 'Self-Pay / Clinical Direct',
    reason = 'General Consultation',
    status = 'pending',
    timestamp = Date.now(),
    createdAt = new Date().toISOString(),
    adminNotes = ''
  }) {
    this.bookingId = bookingId || 'WC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    this.patientName = patientName;
    this.email = email ? email.toLowerCase().trim() : '';
    this.phone = phone;
    this.departmentId = departmentId;
    this.departmentName = departmentName;
    this.doctorId = doctorId;
    this.doctorName = doctorName;
    this.doctorImage = doctorImage;
    this.doctorRole = doctorRole;
    this.specialty = specialty;
    this.date = date;
    this.time = time;
    this.visitType = visitType;
    this.insuranceProvider = insuranceProvider;
    this.reason = reason;
    this.status = status;
    this.timestamp = timestamp;
    this.createdAt = createdAt;
    this.adminNotes = adminNotes;
  }
}

export const inMemoryBookings = [
  new Booking({
    bookingId: 'WC-2026-9042',
    patientName: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    phone: '+1 (555) 432-1100',
    departmentId: 'cardiology',
    departmentName: 'Cardiovascular Care',
    doctorId: 'tony-stark',
    doctorName: 'Dr. Tony Stark',
    date: '2026-11-20',
    time: '10:00 AM',
    visitType: 'in-person',
    reason: 'Annual cardiac assessment and telemetry follow-up',
    status: 'approved'
  })
];

export default Booking;
