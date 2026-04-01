const { Referral, ReferralClaim, User, Booking, Employee, PointLog } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/referrals/my-code — Get my referral code + QR data
 */
const getMyCode = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'referral_code', 'full_name']
    });

    const stats = await Referral.count({
      where: { referrer_user_id: req.user.id },
      group: ['status']
    });

    res.json({
      referral_code: user.referral_code,
      qr_data: `REF:${user.referral_code}`,
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: parseInt(s.count) }), {})
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/my-referrals — List people I've referred
 */
const getMyReferrals = async (req, res, next) => {
  try {
    const referrals = await Referral.findAll({
      where: { referrer_user_id: req.user.id },
      include: [
        { model: User, as: 'referred', attributes: ['full_name', 'email'] },
        { model: Booking, as: 'booking', attributes: ['check_in', 'check_out', 'status'], required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ referrals });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/referrals/claim — Employee claims a referral reward
 */
const claimReferral = async (req, res, next) => {
  try {
    const { referral_id, notes } = req.body;

    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(403).json({ error: 'Only employees can claim referrals' });
    }

    const referral = await Referral.findByPk(referral_id);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    // Check for duplicate claim
    const existingClaim = await ReferralClaim.findOne({
      where: { employee_id: employee.id, referral_id }
    });
    if (existingClaim) {
      return res.status(409).json({ error: 'Already claimed this referral' });
    }

    const claim = await ReferralClaim.create({
      employee_id: employee.id,
      referral_id,
      notes,
      status: 'pending'
    });

    res.status(201).json({ message: 'Referral claim submitted for review', claim });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/pending — Admin: get pending referral claims
 */
const getPendingClaims = async (req, res, next) => {
  try {
    const claims = await ReferralClaim.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Employee, as: 'employee',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }]
        },
        {
          model: Referral, as: 'referral',
          include: [
            { model: User, as: 'referrer', attributes: ['full_name', 'referral_code'] },
            { model: User, as: 'referred', attributes: ['full_name'] },
            { model: Booking, as: 'booking', required: false }
          ]
        }
      ],
      order: [['claimed_at', 'ASC']]
    });

    res.json({ claims });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/referrals/:id/review — Admin: approve/reject referral claim
 */
const reviewClaim = async (req, res, next) => {
  try {
    const { status, notes, points } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const claim = await ReferralClaim.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employee' },
        { model: Referral, as: 'referral' }
      ]
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({ error: 'Claim already resolved' });
    }

    // Update claim
    await claim.update({
      status,
      notes: notes || claim.notes,
      resolved_at: new Date(),
      resolved_by: req.user.id
    });

    // If approved, award points
    if (status === 'approved') {
      const pointsToAward = points || 10; // default 10 points
      const employee = claim.employee;
      const newBalance = employee.total_points + pointsToAward;

      // Update employee points
      await employee.update({ total_points: newBalance });

      // Create immutable point log
      await PointLog.create({
        employee_id: employee.id,
        points_change: pointsToAward,
        balance_after: newBalance,
        type: 'referral_reward',
        reason: `Referral claim #${claim.id} approved`,
        created_by: req.user.id
      });

      // Update referral status to completed
      await claim.referral.update({
        status: 'completed',
        points_awarded: pointsToAward
      });
    }

    res.json({ message: `Claim ${status}`, claim });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyCode, getMyReferrals, claimReferral, getPendingClaims, reviewClaim };
