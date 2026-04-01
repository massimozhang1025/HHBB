/**
 * Security Middleware — comprehensive input sanitization & security hardening
 */

/**
 * XSS Sanitizer — strips dangerous HTML/script tags from all string inputs
 */
const sanitizeInput = (obj) => {
  if (typeof obj === 'string') {
    return obj
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

/**
 * Request Sanitizer Middleware
 * Sanitizes req.body, req.query, and req.params against XSS
 */
const requestSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
};

/**
 * SQL Injection Pattern Detector
 * Extra layer on top of Sequelize's built-in parameterized queries
 */
const sqlInjectionGuard = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|EXECUTE|CREATE)\b\s)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i
  ];

  const checkValue = (value) => {
    if (typeof value !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj) => {
    if (!obj) return false;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) return true;
      } else if (checkValue(value)) {
        return true;
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query)) {
    return res.status(400).json({
      error: 'Potentially malicious input detected'
    });
  }

  next();
};

/**
 * HTTPS Enforcer — redirects HTTP → HTTPS in production
 * Works with Render, Railway, Heroku, AWS ELB (x-forwarded-proto header)
 */
const enforceHTTPS = (req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https' &&
    !req.hostname.includes('localhost')
  ) {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
};

/**
 * Request Size Limiter — prevents oversized payloads per route type
 */
const payloadGuard = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || 0);
  const maxSize = 1 * 1024 * 1024; // 1MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Payload too large. Maximum size is 1MB.'
    });
  }
  next();
};

/**
 * JWT Secret Validator — ensures a strong secret is configured at startup
 */
const validateJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error('❌ SECURITY ERROR: JWT_SECRET must be at least 32 characters long');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  if (secret && secret.includes('change-in-production')) {
    console.warn('⚠️  WARNING: JWT_SECRET contains default placeholder. Change it for production!');
  }
};

module.exports = {
  requestSanitizer,
  sqlInjectionGuard,
  enforceHTTPS,
  payloadGuard,
  validateJWTSecret
};
