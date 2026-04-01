const { Property, Room } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/properties
 */
const getAll = async (req, res, next) => {
  try {
    const { city, search, active } = req.query;
    const where = {};

    if (active !== 'false') where.is_active = true;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const properties = await Property.findAll({
      where,
      include: [{
        model: Room,
        as: 'rooms',
        attributes: ['id', 'type', 'status', 'price_per_night'],
        where: { is_active: true },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.json({ properties });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties/:id
 */
const getById = async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [{
        model: Room,
        as: 'rooms',
        where: { is_active: true },
        required: false,
        order: [['room_number', 'ASC']]
      }]
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/properties (Admin only)
 */
const create = async (req, res, next) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ message: 'Property created', property });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/properties/:id (Admin only)
 */
const update = async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await property.update(req.body);
    res.json({ message: 'Property updated', property });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/properties/:id (Admin — soft delete)
 */
const remove = async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await property.update({ is_active: false });
    res.json({ message: 'Property deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
