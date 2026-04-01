const jwt = require('jsonwebtoken');
const { User, CustomerLoyalty, Employee } = require('../models');
const { validationResult } = require('express-validator');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password, full_name, phone, referral_code } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({
      email,
      password_hash: password, // Hook will hash it
      full_name,
      phone,
      role: 'customer'
    });

    // Create loyalty record
    await CustomerLoyalty.create({ user_id: user.id });

    // Handle referral code usage
    if (referral_code) {
      const referrer = await User.findOne({ where: { referral_code } });
      if (referrer) {
        const { Referral } = require('../models');
        await Referral.create({
          referrer_user_id: referrer.id,
          referred_user_id: user.id,
          status: 'pending'
        });
      }
    }

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Employee, as: 'employee', required: false }
      ]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Employee, as: 'employee', required: false },
        { model: CustomerLoyalty, as: 'loyalty', required: false }
      ]
    });

    res.json({ user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/me
 */
const updateMe = async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body;
    const user = await User.findByPk(req.user.id);

    if (full_name) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

    await user.save();

    res.json({ message: 'Profile updated', user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { register, login, getMe, updateMe };
