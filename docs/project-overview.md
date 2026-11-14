# Project Overview: WeCare Health & Clinical Platform

> **Clinical Management, Specialist Routing & Advanced Telemetry Platform**  
> Organized in a clean fullstack MVC (Model-View-Controller) architecture.

---

## 🏗️ Project Architecture

```
BUILDRent/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── models/
│   │   │   ├── equipmentModel.js
│   │   │   ├── equipmentModel.ts
│   │   │   ├── appointmentModel.ts
│   │   │   ├── userModel.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── views/
│   │   │   ├── pages/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── Equipment.jsx
│   │   │   │   ├── EquipmentDetails.jsx
│   │   │   │   ├── Booking.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── About.tsx
│   │   │   │   ├── Departments.tsx
│   │   │   │   ├── Doctors.tsx
│   │   │   │   └── Appointments.tsx
│   │   │   │
│   │   │   └── components/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── EquipmentCard.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── ui/
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── equipmentController.js
│   │   │   └── bookingController.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── equipmentService.js
│   │   │   └── bookingService.js
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── assets/
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── hooks/
│   │   │   ├── useTypewriter.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useAppointments.ts
│   │   │   └── useEquipment.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── utils/
│   │   │   ├── utils.ts
│   │   │   ├── department-colors.ts
│   │   │   └── firebase.ts
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Equipment.js
│   │   │   ├── Booking.js
│   │   │   └── Review.js
│   │   │
│   │   ├── views/
│   │   │   └── README.md
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── equipmentController.js
│   │   │   ├── bookingController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── equipmentRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   └── userRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── equipmentService.js
│   │   │   └── bookingService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── helpers.js
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── bookingValidator.js
│   │   │   └── equipmentValidator.js
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── config/
│   │   ├── .gitignore
│   │   └── package.json
│   ├── uploads/
│   ├── tests/
│   │   └── api.test.js
│   ├── .env
│   └── package.json
│
├── docs/
│   ├── project-overview.md
│   └── api-documentation.md
│
└── README.md
```

---

## 💎 Key Subsystems & Layers

### 1. Frontend (Client Layer)
- **Models (`frontend/src/models/`)**: Strongly-typed schemas for Users, Appointments, Equipment, Specialists, and Departments.
- **Views (`frontend/src/views/`)**:
  - `pages/`: Page-level route views (Home, Login, Register, Equipment, EquipmentDetails, Booking, Dashboard, Doctors, Departments, About).
  - `components/`: Modular presentation components including Navbar, Footer, EquipmentCard, Sidebar, and modern Bento/Carousel UI components.
- **Controllers (`frontend/src/controllers/`)**: Business logic orchestration connecting presentation views with background services and state stores.
- **Services (`frontend/src/services/`)**: High-level communication with Firebase Auth, Cloud Firestore, and the Express REST API.
- **Routes (`frontend/src/routes/`)**: Animated SPA page routing with transition handling and automatic scroll positioning.

### 2. Backend (Server Layer)
- **RESTful API**: Built on Express.js providing endpoints for authentication, equipment discovery, appointment booking, and user administration.
- **Validation & Security**: Input validation middlewares, CORS protection, sanitized endpoints, and role-based access gates.
- **Storage**: In-memory and persistent ACID data layer with MongoDB/PostgreSQL connector abstractions.

---

## 🚀 Quick Start Guide

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running Backend
```bash
cd backend
npm install
npm run dev
```

### Running Both Concurrently
From the root repository directory:
```bash
npm run dev
```
