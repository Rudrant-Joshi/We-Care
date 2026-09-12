# WeCare Appointment & Booking Feature Module

This folder (`src/appointment/`) contains the complete, self-contained **Appointments & Booking System** for WeCare Health.

## Architecture & Distinct Sections

As requested, the functionality is divided into two distinct, high-impact sections:

### 1. Appointments Section (`/appointments` & `/appointment`)
- **Patient Appointment Records & Stats**:
  - Displays the total number of appointments a user has made (lifetime bookings, upcoming active, and completed visits).
  - Status tracking (`Upcoming & Active`, `Completed`, `Cancelled`).
  - Interactive cards with doctor portraits, date, time, physical suite location, and clinical reason.
  - One-tap actions: *Clinic Directions*, *Reschedule*, *Cancel Booking*, *Download Calendar (.ics)*, and *Remove Record*.
  - Direct `+ Book New Appointment` button.

### 2. Book Appointment Section (`/book-appointment` & `/book`)
- **Complete 4-Step Interactive Booking Experience**:
  - Triggered whenever the user clicks **"BOOK APPOINTMENT"** anywhere in the navigation, hero, or cards.
  - Step 1: Medical Department Selector (Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, Dermatology, Emergency, Radiology).
  - Step 2: Specialist Selector with real doctor portraits (`/doctors/*.jpg`).
  - Step 3: Dynamic 7-day calendar and morning/afternoon slot picker.
  - Step 4: Patient clinical intake form & verification.
  - Live Digital Pass Card with colored backing tabs and ambient glow.
  - Instant Confirmation Pass with reference code (`WC-2026-XXXX`), calendar download, and direct link to *My Appointments*.

---

## Files in this Directory

- `index.ts`: Barrel export for both pages and helper utilities.
- `AppointmentsPage.tsx`: Full page for patient appointment records and live stats (`/appointments`).
- `BookAppointmentPage.tsx`: Full page for the interactive booking wizard (`/book-appointment`).
- `MyAppointmentsBento.tsx`: The stats counter and appointment cards list bento.
- `AppointmentBento.tsx`: The 4-step booking flow and live appointment pass bento.
- `AppointmentSection.tsx`: Standalone embeddable wrapper.
- `storage.ts`: Local storage persistence and state management.
- `types.ts`: TypeScript data models and interfaces.

---

## How to Delete This Entire Module in the Future

If you ever wish to remove the appointment feature completely, follow these 2 simple steps:

### 1. Delete this directory:
```bash
rm -rf src/appointment
```

### 2. Remove the routes in `src/App.tsx`:
Remove the import `{ AppointmentsPage, BookAppointmentPage } from './appointment';` and its routes in `src/App.tsx`.
