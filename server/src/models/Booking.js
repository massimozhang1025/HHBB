const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'rooms', key: 'id' }
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'properties', key: 'id' }
    },
    check_in: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_out: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'checked_in', 'checked_out', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed'
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    referral_code_used: {
      type: DataTypes.STRING(12),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'bookings',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['room_id'] },
      { fields: ['property_id'] },
      { fields: ['check_in', 'check_out'] },
      { fields: ['status'] }
    ]
  });

  return Booking;
};
