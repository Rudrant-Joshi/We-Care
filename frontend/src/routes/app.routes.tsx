import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import Home from '../views/pages/home.page';
import About from '../views/pages/about.page';
import Departments from '../views/pages/departments.page';
import Doctors from '../views/pages/doctors.page';
import Appointments from '../views/pages/appointments.page';
import Booking from '../views/pages/booking.page';
import Login from '../views/pages/login.page';
import Register from '../views/pages/register.page';
import Dashboard from '../views/pages/dashboard.page';
import Equipment from '../views/pages/equipment.page';

/**
 * Scroll to top on route change
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Home Page */}
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Dedicated About Page */}
        <Route
          path="/about"
          element={
            <PageWrapper>
              <About />
            </PageWrapper>
          }
        />

        {/* Dedicated Departments Page */}
        <Route
          path="/departments"
          element={
            <PageWrapper>
              <Departments />
            </PageWrapper>
          }
        />

        {/* Dedicated Doctors Page */}
        <Route
          path="/doctors"
          element={
            <PageWrapper>
              <Doctors />
            </PageWrapper>
          }
        />
        <Route path="/our-doctors" element={<Navigate to="/doctors" replace />} />

        {/* Dedicated Appointments Schedule & History */}
        <Route
          path="/appointments"
          element={
            <PageWrapper>
              <Appointments />
            </PageWrapper>
          }
        />
        <Route path="/appointment" element={<Navigate to="/book-appointment" replace />} />

        {/* Dedicated Book an Appointment Wizard */}
        <Route
          path="/book-appointment"
          element={
            <PageWrapper>
              <Booking />
            </PageWrapper>
          }
        />
        <Route path="/book" element={<Navigate to="/book-appointment" replace />} />
        <Route
          path="/booking"
          element={
            <PageWrapper>
              <Booking />
            </PageWrapper>
          }
        />

        {/* Specialized Equipment Catalog */}
        <Route
          path="/equipment"
          element={
            <PageWrapper>
              <Equipment />
            </PageWrapper>
          }
        />
        <Route
          path="/equipment/:id"
          element={
            <PageWrapper>
              <Equipment />
            </PageWrapper>
          }
        />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />
        <Route path="/auth" element={<Navigate to="/login" replace />} />

        {/* Dedicated Admin Portal & Dashboard */}
        <Route
          path="/admin"
          element={
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          }
        />
        <Route path="/admin/appointments" element={<Navigate to="/admin" replace />} />
        <Route
          path="/dashboard"
          element={
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;
