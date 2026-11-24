# WeCare Health 🏥✨

> **Advanced Clinical Care, Specialist Directory & Medical Equipment Platform**  
> Complete fullstack platform organized according to clean MVC (Model-View-Controller) architecture.

---

## 📁 Project Directory Structure

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
│   ├── .env
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
