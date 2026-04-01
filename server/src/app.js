require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { sequelize } = require('./models');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const referralRoutes = require('./routes/referrals');
const pointRoutes = require('./routes/points');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ═══════════════════════════════════════════
// Global Middleware
// ═══════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: false,  // Allow inline scripts from Vite build
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: isProd
    ? (process.env.CLIENT_URL || true)  // In prod, allow same-origin or explicit CLIENT_URL
    : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(isProd ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ═══════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/analytics', analyticsRoutes);

// ═══════════════════════════════════════════
// Serve Frontend (Production)
// ═══════════════════════════════════════════
if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  
  // SPA fallback — any non-API route serves index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ═══════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

// ═══════════════════════════════════════════
// Start Server
// ═══════════════════════════════════════════
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models
    if (!isProd) {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synced (dev mode)');
    } else {
      await sequelize.sync();
      console.log('✅ Database models synced (production)');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 HHBB PMS Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (isProd) console.log(`📦 Serving frontend from /client/dist`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
