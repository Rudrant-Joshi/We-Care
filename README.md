# WeCare Health 🏥✨

> **Advanced Clinical Care, Specialist Directory & Medical Equipment Platform**  
> Complete fullstack platform organized according to clean MVC (Model-View-Controller) architecture.

---

## 📁 Project Directory Structure

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
├── config/
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## ⚡ Getting Started

### 1. Run Everything from Root
Install and run both frontend and backend concurrently:
```bash
npm run dev
```

### 2. Frontend Only
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

To build production bundle:
```bash
cd frontend
npm run build
```

### 3. Backend Only
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

To execute backend automated API test suite:
```bash
cd backend
npm test
```

---

## 📑 Documentation
- **Architecture & System Design**: See [docs/project-overview.md](docs/project-overview.md)
- **REST API Reference**: See [docs/api-documentation.md](docs/api-documentation.md)
