const { Employee, PointLog, User } = require('../models');

/**
 * GET /api/points/my — Employee's own points
 */
const getMyPoints = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: PointLog,
        as: 'pointLogs',
        order: [['created_at', 'DESC']],
        limit: 50
      }]
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    res.json({
      total_points: employee.total_points,
      logs: employee.pointLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/points/employee/:id — Admin: employee's point details
 */
const getEmployeePoints = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'email'] }
      ]
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { count, rows } = await PointLog.findAndCountAll({
      where: { employee_id: employee.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      employee: {
        id: employee.id,
        name: employee.user.full_name,
        total_points: employee.total_points,
        position: employee.position
      },
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/points/adjust — Admin: manually add/deduct points
 */
const adjustPoints = async (req, res, next) => {
  try {
    const { employee_id, points, type, reason } = req.body;

    if (!employee_id || points === undefined || !reason) {
      return res.status(400).json({ error: 'employee_id, points, and reason are required' });
    }

    const validTypes = ['manual_bonus', 'penalty', 'adjustment'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid type', valid: validTypes });
    }

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const newBalance = employee.total_points + parseInt(points);

    // Create immutable log entry
    const log = await PointLog.create({
      employee_id: employee.id,
      points_change: parseInt(points),
      balance_after: newBalance,
      type,
      reason,
      created_by: req.user.id
    });

    // Update employee balance
    await employee.update({ total_points: newBalance });

    res.status(201).json({
      message: `Points adjusted: ${points > 0 ? '+' : ''}${points}`,
      new_balance: newBalance,
      log
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/points/leaderboard — Employee ranking
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { is_active: true },
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'avatar_url'] }
      ],
      order: [['total_points', 'DESC']],
      limit: 20
    });

    res.json({
      leaderboard: employees.map((e, i) => ({
        rank: i + 1,
        name: e.user.full_name,
        avatar: e.user.avatar_url,
        position: e.position,
        points: e.total_points
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyPoints, getEmployeePoints, adjustPoints, getLeaderboard };
