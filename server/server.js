const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables first
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize email service
require('./services/emailService');

const app = express();
const server = http.createServer(app);

// Trust proxy (helps with cookies when using credentials)
app.set('trust proxy', 1);

// Allowed local frontend
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';

// CORS (Local)
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Socket.io Setup
const io = socketIo(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Make io accessible in routes
app.set('io', io);

// ✅ ROUTES — order is correct
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health Check
app.get('/', (req, res) => {
  res.json({ message: '✅ Local Banking API is running' });
});

// Error Handler
app.use(errorHandler);

// Socket.io listener
require('./sockets/notificationSocket')(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Local Server running at http://localhost:${PORT}`);
  console.log(`🌍 Allowed Origin: ${allowedOrigin}`);
});
