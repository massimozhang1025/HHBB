require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { sequelize } = require('./models');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const {
  requestSanitizer,
  sqlInjectionGuard,
  enforceHTTPS,
  payloadGuard,
  validateJWTSecret
} = require('./middleware/security');

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
// Startup Security Checks
// ═══════════════════════════════════════════
validateJWTSecret();

// ═══════════════════════════════════════════
// Security Middleware (Layer 1 — Transport)
// ═══════════════════════════════════════════

// HTTPS enforcement for production (Render/Railway/Heroku set x-forwarded-proto)
if (isProd) {
  app.set('trust proxy', 1);
  app.use(enforceHTTPS);
}

// Helmet — comprehensive HTTP security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],        // Vite build inline scripts
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://maps.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null       // Force HTTPS in browser
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false
}));

// ═══════════════════════════════════════════
// Security Middleware (Layer 2 — CORS)
// ═══════════════════════════════════════════
const allowedOrigins = isProd
  ? [
      process.env.CLIENT_URL,
      'https://hhbb.onrender.com',
      'https://hhbb-hotel.onrender.com'
    ].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5177'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // Cache preflight for 24h
}));

// ═══════════════════════════════════════════
// Security Middleware (Layer 3 — Input)
// ═══════════════════════════════════════════
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// XSS sanitization on all inputs
app.use(requestSanitizer);

// SQL injection pattern detection (extra layer over Sequelize)
app.use(sqlInjectionGuard);

// Payload size guard
app.use(payloadGuard);

// ═══════════════════════════════════════════
// Logging
// ═══════════════════════════════════════════
app.use(morgan(isProd ? 'combined' : 'dev'));

// ═══════════════════════════════════════════
// Rate Limiting (Layer 4 — Abuse Prevention)
// ═══════════════════════════════════════════

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Strict rate limit for auth endpoints (anti-brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 10 : 50,    // 10 login attempts per 15 min in prod
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ═══════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    security: {
      helmet: true,
      cors: true,
      rateLimiting: true,
      xssSanitization: true,
      sqlInjectionGuard: true,
      https: isProd,
      bcrypt: true,
      jwt: true,
      rbac: true
    }
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
  app.use(express.static(clientDist, {
    maxAge: '1y',           // Cache static assets for 1 year
    etag: true,
    lastModified: true
  }));

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
      console.log(`🛡️  Security: Helmet + CORS + RateLimit + XSS + SQLi Guard + RBAC + JWT + bcrypt`);
      if (isProd) {
        console.log(`📦 Serving frontend from /client/dist`);
        console.log(`🔒 HTTPS enforcement: enabled`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
