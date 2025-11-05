const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables FIRST
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize email service
require('./services/emailService');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make io accessible to routes
app.set('io', io);

// ✅ ROUTES — order matters!

// Auth routes must load BEFORE any protected routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Wallet Routes (Protected Routes)
const walletRoutes = require('./routes/walletRoutes');
app.use('/api/wallet', walletRoutes);

// Other Protected/Feature Routes
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health Check
app.get('/', (req, res) => {
  res.json({ message: '✅ Banking Dashboard API is running' });
});

// Error Handler
app.use(errorHandler);

// Socket.io connection
require('./sockets/notificationSocket')(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
