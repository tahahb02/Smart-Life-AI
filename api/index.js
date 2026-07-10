import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur de connexion à la base de données', detail: error.message });
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SmartLife API opérationnelle' });
});

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

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
  });
});

export default app;
