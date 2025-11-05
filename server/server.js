const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// 1) Env first
dotenv.config();

// 2) DB
connectDB();

// 3) Email (if you have it)
require('./services/emailService');

const app = express();
const server = http.createServer(app);

// 4) Allowed origins (local + Vercel + optional env)
const allowedOrigins = [
  'http://localhost:3000',
  'https://digital-banking-dashboard.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

// 5) **Manual CORS middleware** — handles ALL requests including OPTIONS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Vary', 'Origin'); // important for proxies/caching
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  // Reply immediately to preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 6) Socket.io with explicit CORS
const io = socketIo(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true }
});

// 7) Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 8) Make io available
app.set('io', io);

// 9) Routes (order matters)
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

// 10) Health
app.get('/', (req, res) => {
  res.json({ message: '✅ Banking Dashboard API is running...' });
});

// 11) Errors
app.use(errorHandler);

// 12) Sockets
require('./sockets/notificationSocket')(io);

// 13) Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌍 Allowed Origins:', allowedOrigins);
});
