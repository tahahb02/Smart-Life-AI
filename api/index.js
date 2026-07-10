import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security
app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_URL || '*', 
  credentials: true 
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Trop de requêtes, réessayez plus tard.' },
});
app.use('/api/', limiter);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
import authRoutes from '../backend/routes/auth.js';
import userRoutes from '../backend/routes/users.js';
import budgetRoutes from '../backend/routes/budget.js';
import taskRoutes from '../backend/routes/tasks.js';
import appointmentRoutes from '../backend/routes/appointments.js';
import medicineRoutes from '../backend/routes/medicines.js';
import chatRoutes from '../backend/routes/chat.js';
import invoiceRoutes from '../backend/routes/invoices.js';
import notificationRoutes from '../backend/routes/notifications.js';
import adminRoutes from '../backend/routes/admin.js';
import loyaltyRoutes from '../backend/routes/loyalty.js';
import referralRoutes from '../backend/routes/referral.js';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SmartLife API opérationnelle' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/referral', referralRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
  });
});

// Connect to MongoDB and export app
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
    throw error;
  }
};

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur de connexion à la base de données' });
  }
});

export default app;
