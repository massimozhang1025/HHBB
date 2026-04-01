const { Booking, Room, Property, Employee, User, Referral, PointLog } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * GET /api/analytics/dashboard — Overview KPIs
 */
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalBookings,
      recentBookings,
      totalRevenue,
      recentRevenue,
      totalProperties,
      totalRooms,
      occupiedRooms,
      totalEmployees,
      activeReferrals
    ] = await Promise.all([
      Booking.count({ where: { status: { [Op.ne]: 'cancelled' } } }),
      Booking.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo }, status: { [Op.ne]: 'cancelled' } } }),
      Booking.sum('total_price', { where: { status: { [Op.ne]: 'cancelled' } } }),
      Booking.sum('total_price', { where: { created_at: { [Op.gte]: thirtyDaysAgo }, status: { [Op.ne]: 'cancelled' } } }),
      Property.count({ where: { is_active: true } }),
      Room.count({ where: { is_active: true } }),
      Room.count({ where: { status: 'occupied' } }),
      Employee.count({ where: { is_active: true } }),
      Referral.count({ where: { status: { [Op.ne]: 'completed' } } })
    ]);

    res.json({
      kpi: {
        totalBookings,
        recentBookings,
        totalRevenue: totalRevenue || 0,
        recentRevenue: recentRevenue || 0,
        totalProperties,
        totalRooms,
        occupiedRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
        totalEmployees,
        activeReferrals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/bookings/trends — Booking trend data for charts
 */
const getBookingTrends = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;
    if (period === '365d') days = 365;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const bookings = await Booking.findAll({
      where: {
        created_at: { [Op.gte]: startDate },
        status: { [Op.ne]: 'cancelled' }
      },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total_price')), 'revenue']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    res.json({ trends: bookings, period });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/properties/performance — Property-level performance
 */
const getPropertyPerformance = async (req, res, next) => {
  try {
    const properties = await Property.findAll({
      where: { is_active: true },
      include: [{
        model: Booking,
        as: 'bookings',
        where: { status: { [Op.ne]: 'cancelled' } },
        attributes: [],
        required: false
      }],
      attributes: {
        include: [
          [fn('COUNT', col('bookings.id')), 'booking_count'],
          [fn('COALESCE', fn('SUM', col('bookings.total_price')), 0), 'total_revenue']
        ]
      },
      group: ['Property.id'],
      order: [[literal('total_revenue'), 'DESC']],
      raw: true
    });

    res.json({ properties });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/employees/ranking — Top employees
 */
const getEmployeeRanking = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { is_active: true },
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'email'] },
        { model: Property, as: 'property', attributes: ['name'] }
      ],
      order: [['total_points', 'DESC']],
      limit: 20
    });

    res.json({ employees });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getBookingTrends, getPropertyPerformance, getEmployeeRanking };
