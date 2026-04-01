const { Room, Property, Booking, RoomStatusLog } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/rooms — Search available rooms
 */
const search = async (req, res, next) => {
  try {
    const { property_id, type, check_in, check_out, capacity, min_price, max_price } = req.query;
    const where = { is_active: true };

    if (property_id) where.property_id = property_id;
    if (type) where.type = type;
    if (capacity) where.capacity = { [Op.gte]: parseInt(capacity) };
    if (min_price || max_price) {
      where.price_per_night = {};
      if (min_price) where.price_per_night[Op.gte] = parseFloat(min_price);
      if (max_price) where.price_per_night[Op.lte] = parseFloat(max_price);
    }

    let rooms = await Room.findAll({
      where,
      include: [{
        model: Property,
        as: 'property',
        attributes: ['id', 'name', 'city', 'address']
      }],
      order: [['price_per_night', 'ASC']]
    });

    // Filter by availability if dates provided
    if (check_in && check_out) {
      const bookedRoomIds = await Booking.findAll({
        where: {
          status: { [Op.notIn]: ['cancelled'] },
          [Op.or]: [
            {
              check_in: { [Op.lt]: check_out },
              check_out: { [Op.gt]: check_in }
            }
          ]
        },
        attributes: ['room_id'],
        raw: true
      });

      const bookedIds = new Set(bookedRoomIds.map(b => b.room_id));
      rooms = rooms.filter(r => !bookedIds.has(r.id));
    }

    res.json({ rooms, total: rooms.length });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms/:id
 */
const getById = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }]
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rooms (Admin only)
 */
const create = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ message: 'Room created', room });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/rooms/:id (Admin only)
 */
const update = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await room.update(req.body);
    res.json({ message: 'Room updated', room });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/rooms/:id/status (Employee+)
 * Quick status toggle: available → occupied → cleaning → available
 */
const updateStatus = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'cleaning', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', valid: validStatuses });
    }

    const oldStatus = room.status;

    // Log status change
    await RoomStatusLog.create({
      room_id: room.id,
      old_status: oldStatus,
      new_status: status,
      changed_by: req.user.id
    });

    await room.update({ status });

    res.json({
      message: `Room status updated: ${oldStatus} → ${status}`,
      room
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { search, getById, create, update, updateStatus };
