require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security Middleware
app.use(helmet()); // Add various HTTP headers for security
app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

// Rate limiting (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);

  // Stricter rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per hour
    message: 'Too many login attempts, please try again after an hour'
  });
  app.use('/api/auth/', authLimiter);
}

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // 10 minutes
}));

app.use(morgan('dev'));

// Configure compression
app.use(compression({
  level: 6, // Default compression level
  threshold: 0, // No minimum size threshold
  filter: (req, res) => {
    if (req.headers['accept-encoding'] && req.headers['accept-encoding'] !== '') {
      return compression.filter(req, res);
    }
    return false;
  }
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Error handling
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err; // Re-throw to handle in tests
  }
};

// Server startup
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await connectDB();
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (err) {
      console.error('Server startup failed:', err);
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
