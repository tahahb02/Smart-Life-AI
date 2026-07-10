import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
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
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import budgetRoutes from './routes/budget.js';
import taskRoutes from './routes/tasks.js';
import appointmentRoutes from './routes/appointments.js';
import medicineRoutes from './routes/medicines.js';
import chatRoutes from './routes/chat.js';
import invoiceRoutes from './routes/invoices.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import loyaltyRoutes from './routes/loyalty.js';
import referralRoutes from './routes/referral.js';

// Routes
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

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Client connecté: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log(`Client déconnecté: ${socket.id}`);
  });
});

app.set('io', io);

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté à:', process.env.MONGODB_URI);

    const { verifySMTPConnection } = await import('./utils/sendEmail.js');
    const { verifyWhatsAppConnection } = await import('./utils/sendWhatsApp.js');
    await verifySMTPConnection();
    await verifyWhatsAppConnection();

    if (process.env.NODE_ENV === 'development') {
      console.log('');
      console.log('🔧 Mode développement activé');
      console.log('   Les codes OTP seront affichés dans la console');
      console.log('');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Serveur SmartLife démarré sur le port ${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
      console.log(`   Client: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error(`❌ Erreur de démarrage: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   MongoDB n\'est pas démarré. Lancez mongod ou utilisez Docker Compose.');
    }
    process.exit(1);
  }
};

startServer();

export { app, server, io };
