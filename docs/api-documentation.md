# REST API Documentation

The WeCare backend delivers a complete REST API for authentication, equipment catalog exploration, appointment management, and administrative oversight.

Base URL: `http://localhost:5000/api`

---

## 🔐 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user session.
- **Request Body:**
  ```json
  {
    "email": "sarah.connor@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "usr_pat_003",
        "name": "Sarah Connor",
        "email": "sarah.connor@example.com",
        "role": "patient"
      },
      "token": "wecare_token_usr_pat_003_..."
    }
  }
  ```

### `POST /api/auth/register`
Creates a new patient, doctor, or caregiver account.
- **Request Body:**
  ```json
  {
    "name": "Bruce Banner",
    "email": "bruce.banner@wecare.health",
    "password": "SecurePassword123!",
    "role": "doctor",
    "specialty": "Radiation Oncology & Cellular Biology"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": { ... },
      "token": "..."
    }
  }
  ```

### `GET /api/auth/me`
Retrieves currently authenticated session identity.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Current user object.

---

## 🔬 2. Equipment Endpoints

### `GET /api/equipment`
Queries equipment catalog with optional filter parameters.
- **Query Parameters:**
  - `category` (string, optional)
  - `departmentId` (string, optional)
  - `status` (string: `available` | `in-use` | `reserved`)
  - `search` (string, keyword search)
- **Response (200 OK):** Array of equipment items.

### `GET /api/equipment/:id`
Retrieves single equipment specifications by ID.

### `POST /api/equipment`
Adds an apparatus to the equipment inventory (Admin clearance required).

---

## 📅 3. Bookings & Appointments Endpoints

### `GET /api/bookings`
Retrieves bookings list.
- **Query Parameters:**
  - `email` (string, filter for patient appointments)
  - `status` (string, filter by `pending`, `approved`, `rejected`, `upcoming`, `cancelled`)
  - `doctorId` (string)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "bookingId": "WC-2026-9042",
        "patientName": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "departmentName": "Cardiovascular Care",
        "doctorName": "Dr. Tony Stark",
        "date": "2026-11-20",
        "time": "10:00 AM",
        "status": "approved"
      }
    ]
  }
  ```

### `POST /api/bookings`
Submits a new appointment booking.
- **Request Body:**
  ```json
  {
    "patientName": "Sarah Connor",
    "email": "sarah.connor@example.com",
    "phone": "+1 555-0199",
    "departmentId": "cardiology",
    "departmentName": "Cardiology & Surgery",
    "doctorId": "tony-stark",
    "doctorName": "Dr. Tony Stark",
    "date": "2026-12-05",
    "time": "09:30 AM",
    "visitType": "in-person",
    "reason": "Routine clinical assessment"
  }
  ```

### `PATCH /api/bookings/:bookingId/status`
Updates status of a booking (`approved`, `rejected`, `cancelled`, `completed`).

### `DELETE /api/bookings/:bookingId`
Permanently purges a booking from storage.

---

## 👥 4. User Endpoints

- `GET /api/users`: Returns all users (Chief Admin only).
- `GET /api/users/:id`: Returns user profile.
- `PUT /api/users/:id`: Updates profile data.
- `DELETE /api/users/:id`: Removes account from system.
