# Project Overview: WeCare Health & Clinical Platform

> **Clinical Management, Specialist Routing & Advanced Telemetry Platform**  
> Organized in a clean fullstack MVC (Model-View-Controller) architecture.

---

## 🏗️ Project Architecture

```
BUILDRent/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── models/
│   │   │   ├── appointment.model.ts
│   │   │   ├── equipment.model.ts
│   │   │   ├── types.model.ts
│   │   │   ├── user.model.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── views/
│   │   │   ├── pages/
│   │   │   │   ├── home.page.tsx
│   │   │   │   ├── about.page.tsx
│   │   │   │   ├── departments.page.tsx
│   │   │   │   ├── doctors.page.tsx
│   │   │   │   ├── appointments.page.tsx
│   │   │   │   ├── booking.page.tsx
│   │   │   │   ├── equipment.page.tsx
│   │   │   │   ├── equipment-details.page.tsx
│   │   │   │   ├── login.page.tsx
│   │   │   │   ├── register.page.tsx
│   │   │   │   └── dashboard.page.tsx
│   │   │   │
│   │   │   └── components/
│   │   │       ├── navbar.component.tsx
│   │   │       ├── footer.component.tsx
│   │   │       ├── equipment-card.component.tsx
│   │   │       ├── sidebar.component.tsx
│   │   │       ├── top-scroll-progress.component.tsx
│   │   │       ├── appointment/
│   │   │       │   ├── appointment-bento.component.tsx
│   │   │       │   └── my-appointments-bento.component.tsx
│   │   │       └── ui/
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── equipment.controller.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── equipment.service.ts
│   │   │   └── firebase.service.ts
│   │   │
│   │   ├── routes/
│   │   │   └── app.routes.tsx
│   │   │
│   │   ├── hooks/
│   │   │   └── use-equipment.hook.ts
│   │   │
│   │   ├── context/
│   │   │   └── auth.context.tsx
│   │   │
│   │   ├── utils/
│   │   │   ├── department-colors.util.ts
│   │   │   └── utils.util.ts
│   │   │
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.config.js
│   │   │
│   │   ├── models/
│   │   │   ├── booking.model.js
│   │   │   ├── equipment.model.js
│   │   │   ├── review.model.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── views/
│   │   │   └── README.md
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── equipment.controller.js
│   │   │   └── user.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── booking.route.js
│   │   │   ├── equipment.route.js
│   │   │   └── user.route.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── upload.middleware.js
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── booking.service.js
│   │   │   └── equipment.service.js
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.util.js
│   │   │   └── logger.util.js
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── booking.validator.js
│   │   │   └── equipment.validator.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── tests/
│   │   └── api.test.js
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
