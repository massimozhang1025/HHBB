const { Booking, Room, Property, User, Referral, CustomerLoyalty, Employee, RoomStatusLog } = require('../models');
const { Op } = require('sequelize');

/**
 * POST /api/bookings — Create a booking
 */
const create = async (req, res, next) => {
  try {
    const { room_id, check_in, check_out, guests, notes, referral_code } = req.body;

    // Get room details
    const room = await Room.findByPk(room_id, {
      include: [{ model: Property, as: 'property' }]
    });
    if (!room || !room.is_active) {
      return res.status(404).json({ error: 'Room not found or inactive' });
    }

    // Check availability
    const conflict = await Booking.findOne({
      where: {
        room_id,
        status: { [Op.notIn]: ['cancelled'] },
        check_in: { [Op.lt]: check_out },
        check_out: { [Op.gt]: check_in }
      }
    });
    if (conflict) {
      return res.status(409).json({ error: 'Room not available for these dates' });
    }

    // Calculate price
    const nights = Math.ceil(
      (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24)
    );
    if (nights < 1) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }
    const total_price = parseFloat(room.price_per_night) * nights;

    // Create booking
    const booking = await Booking.create({
      user_id: req.user.id,
      room_id,
      property_id: room.property_id,
      check_in,
      check_out,
      guests: guests || 1,
      total_price,
      referral_code_used: referral_code || null,
      notes
    });

    // Update referral status if code used
    if (referral_code) {
      const referrer = await User.findOne({ where: { referral_code } });
      if (referrer) {
        const referral = await Referral.findOne({
          where: {
            referrer_user_id: referrer.id,
            referred_user_id: req.user.id,
            status: 'pending'
          }
        });
        if (referral) {
          await referral.update({ status: 'booking_made', booking_id: booking.id });
        }
      }
    }

    // Update loyalty
    let loyalty = await CustomerLoyalty.findOne({ where: { user_id: req.user.id } });
    if (!loyalty) {
      loyalty = await CustomerLoyalty.create({ user_id: req.user.id });
    }
    const newSpent = parseFloat(loyalty.total_spent) + total_price;
    let newTier = 'bronze';
    if (newSpent >= 5000) newTier = 'platinum';
    else if (newSpent >= 2000) newTier = 'gold';
    else if (newSpent >= 500) newTier = 'silver';

    await loyalty.update({
      total_bookings: loyalty.total_bookings + 1,
      total_nights: loyalty.total_nights + nights,
      total_spent: newSpent,
      loyalty_points: loyalty.loyalty_points + Math.floor(total_price),
      tier: newTier
    });

    // Load full booking data
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Room, as: 'room' },
        { model: Property, as: 'property' }
      ]
    });

    res.status(201).json({ message: 'Booking created', booking: fullBooking });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/my — Customer's own bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Room, as: 'room', attributes: ['room_number', 'type', 'image_url'] },
        { model: Property, as: 'property', attributes: ['name', 'city', 'address'] }
      ],
      order: [['check_in', 'DESC']]
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings — All bookings (Employee+)
 */
const getAll = async (req, res, next) => {
  try {
    const { property_id, status, from, to, page = 1, limit = 50 } = req.query;
    const where = {};

    if (property_id) where.property_id = property_id;
    if (status) where.status = status;
    if (from) where.check_in = { ...where.check_in, [Op.gte]: from };
    if (to) where.check_out = { ...where.check_out, [Op.lte]: to };

    // If employee, restrict to their property
    if (req.user.role === 'employee') {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (emp) where.property_id = emp.property_id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: Room, as: 'room', attributes: ['room_number', 'type'] },
        { model: Property, as: 'property', attributes: ['name'] }
      ],
      order: [['check_in', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      bookings: rows,
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
 * PATCH /api/bookings/:id/status — Update booking status (Employee+)
 */
const updateStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Room, as: 'room' }]
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status } = req.body;
    const validTransitions = {
      confirmed: ['checked_in', 'cancelled'],
      checked_in: ['checked_out'],
      checked_out: [],
      cancelled: []
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from ${booking.status} to ${status}`,
        allowed: validTransitions[booking.status]
      });
    }

    // Handle check-in: update room status
    if (status === 'checked_in') {
      await Room.update({ status: 'occupied' }, { where: { id: booking.room_id } });
      await RoomStatusLog.create({
        room_id: booking.room_id,
        old_status: booking.room?.status || 'available',
        new_status: 'occupied',
        changed_by: req.user.id
      });

      // Update referral to checked_in
      if (booking.referral_code_used) {
        const referral = await Referral.findOne({
          where: { booking_id: booking.id, status: 'booking_made' }
        });
        if (referral) {
          await referral.update({ status: 'checked_in' });
        }
      }
    }

    // Handle check-out: set room to cleaning
    if (status === 'checked_out') {
      await Room.update({ status: 'cleaning' }, { where: { id: booking.room_id } });
      await RoomStatusLog.create({
        room_id: booking.room_id,
        old_status: 'occupied',
        new_status: 'cleaning',
        changed_by: req.user.id
      });
    }

    // Handle cancellation
    if (status === 'cancelled') {
      booking.cancelled_at = new Date();
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findByPk(booking.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: Room, as: 'room', attributes: ['room_number', 'type'] },
        { model: Property, as: 'property', attributes: ['name'] }
      ]
    });

    res.json({ message: `Booking status updated to ${status}`, booking: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings/auto-checkin — Bulk check-in all confirmed bookings for today
 */
const autoCheckIn = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { property_id } = req.body;

    const where = {
      status: 'confirmed',
      check_in: { [Op.lte]: today }
    };
    if (property_id) where.property_id = property_id;

    const bookings = await Booking.findAll({
      where,
      include: [{ model: Room, as: 'room' }]
    });

    const results = { success: 0, skipped: 0, errors: [] };

    for (const booking of bookings) {
      try {
        // Skip if room is occupied by another booking
        if (booking.room?.status === 'occupied') {
          results.skipped++;
          results.errors.push(`Room ${booking.room.room_number}: already occupied`);
          continue;
        }

        await Room.update({ status: 'occupied' }, { where: { id: booking.room_id } });
        await RoomStatusLog.create({
          room_id: booking.room_id,
          old_status: booking.room?.status || 'available',
          new_status: 'occupied',
          changed_by: req.user.id
        });

        booking.status = 'checked_in';
        await booking.save();

        // Update referral if applicable
        if (booking.referral_code_used) {
          const referral = await Referral.findOne({
            where: { booking_id: booking.id, status: 'booking_made' }
          });
          if (referral) await referral.update({ status: 'checked_in' });
        }

        results.success++;
      } catch (err) {
        results.errors.push(`Booking #${booking.id}: ${err.message}`);
      }
    }

    res.json({
      message: `Auto check-in complete: ${results.success} checked in, ${results.skipped} skipped`,
      results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/bookings/:id — Cancel booking (Customer can cancel own)
 */
const cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Customer can only cancel their own
    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Cannot cancel another user\'s booking' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be cancelled' });
    }

    await booking.update({ status: 'cancelled', cancelled_at: new Date() });
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getMyBookings, getAll, updateStatus, autoCheckIn, cancel };
