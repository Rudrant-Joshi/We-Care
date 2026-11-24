/**
 * Express Application Setup
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.route.js';
import equipmentRoutes from './routes/equipment.route.js';
import bookingRoutes from './routes/booking.route.js';
import userRoutes from './routes/user.route.js';

import { notFoundHandler, globalErrorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded clinical media
const uploadDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WeCare Health REST API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Compatibility route aliases
app.use('/api/appointments', bookingRoutes);
app.use('/api/doctors', equipmentRoutes);

// Catch 404
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
