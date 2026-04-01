const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// ═══════════════════════════════════════════
// POST /api/auth/register — strict validation
// ═══════════════════════════════════════════
router.post('/register', [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .isLength({ max: 128 }).withMessage('Password too long'),
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name required')
    .isLength({ max: 255 }).withMessage('Name too long')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Name contains invalid characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone too long')
    .matches(/^[+0-9\s()-]+$/).withMessage('Invalid phone format'),
  body('referral_code')
    .optional()
    .trim()
    .isAlphanumeric().withMessage('Invalid referral code')
    .isLength({ max: 12 })
], register);

// ═══════════════════════════════════════════
// POST /api/auth/login — anti-enumeration
// ═══════════════════════════════════════════
router.post('/login', [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail()
    .isLength({ max: 255 }),
  body('password')
    .notEmpty().withMessage('Password required')
    .isLength({ max: 128 })
], login);

// ═══════════════════════════════════════════
// Protected profile routes
// ═══════════════════════════════════════════
router.get('/me', authenticate, getMe);

router.put('/me', authenticate, [
  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/).withMessage('Name contains invalid characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .matches(/^[+0-9\s()-]*$/).withMessage('Invalid phone format'),
  body('avatar_url')
    .optional()
    .isURL().withMessage('Invalid URL')
    .isLength({ max: 500 })
], updateMe);

module.exports = router;
