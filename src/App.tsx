/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import HomePage from './pages/HomePage';
import AboutPage from './about';
import DepartmentsPage from './departments';
import DoctorsPage from './doctors';
import { AppointmentsPage, BookAppointmentPage } from './appointment';
import { AuthPage, AuthProvider } from './auth';
import AdminPortalPage from './admin';
import { TopScrollProgress } from './components/TopScrollProgress';

/**
 * Scroll to top on route change
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen transform-gpu will-change-transform"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Home Page */}
        <Route
          path="/"
          element={
            <PageWrapper>
              <HomePage />
            </PageWrapper>
          }
        />

        {/* Dedicated About Page */}
        <Route
          path="/about"
          element={
            <PageWrapper>
              <AboutPage />
            </PageWrapper>
          }
        />

        {/* Dedicated Departments Page */}
        <Route
          path="/departments"
          element={
            <PageWrapper>
              <DepartmentsPage />
            </PageWrapper>
          }
        />

        {/* Dedicated Doctors Page */}
        <Route
          path="/doctors"
          element={
            <PageWrapper>
              <DoctorsPage />
            </PageWrapper>
          }
        />
        <Route path="/our-doctors" element={<Navigate to="/doctors" replace />} />

        {/* Dedicated Appointments Schedule & History */}
        <Route
          path="/appointments"
          element={
            <PageWrapper>
              <AppointmentsPage />
            </PageWrapper>
          }
        />
        <Route path="/appointment" element={<Navigate to="/book-appointment" replace />} />

        {/* Dedicated Book an Appointment Wizard */}
        <Route
          path="/book-appointment"
          element={
            <PageWrapper>
              <BookAppointmentPage />
            </PageWrapper>
          }
        />
        <Route
          path="/book"
          element={
            <PageWrapper>
              <BookAppointmentPage />
            </PageWrapper>
          }
        />

        {/* Fallback route */}
        <Route
          path="/login"
          element={
            <PageWrapper>
              <AuthPage />
            </PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PageWrapper>
              <AuthPage />
            </PageWrapper>
          }
        />

        {/* Dedicated Admin Portal for Rudrant Joshi */}
        <Route
          path="/admin"
          element={
            <PageWrapper>
              <AdminPortalPage />
            </PageWrapper>
          }
        />
        <Route path="/admin/appointments" element={<Navigate to="/admin" replace />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <TopScrollProgress />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
