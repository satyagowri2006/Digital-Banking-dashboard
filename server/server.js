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

// ✅ Allowed Frontend Origins
const allowedOrigins = [
  'http://localhost:3000',                                 // Local Development
  'https://digital-banking-dashboard.vercel.app',         // Vercel Frontend
  process.env.CLIENT_URL                                   // Optional from Render
].filter(Boolean);

// ✅ FIXED CORS CONFIG (handles preflight + headers)
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Handle all preflight OPTIONS requests

// ✅ Socket.io Setup with CORS support
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make io accessible to routes
app.set('io', io);

// ✅ ROUTES (Order matters)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const walletRoutes = require('./routes/walletRoutes');
app.use('/api/wallet', walletRoutes);

app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.json({ message: '✅ Banking Dashboard API is running...' });
});

// Error Handler
app.use(errorHandler);

// Socket.io Events
require('./sockets/notificationSocket')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Allowed Origins:`, allowedOrigins);
});
