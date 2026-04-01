const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'properties', key: 'id' }
    },
    room_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('single', 'double', 'suite', 'family'),
      allowNull: false,
      defaultValue: 'double'
    },
    price_per_night: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'cleaning', 'maintenance'),
      allowNull: false,
      defaultValue: 'available'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    amenities: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'rooms',
    indexes: [
      { unique: true, fields: ['property_id', 'room_number'] }
    ]
  });

  return Room;
};
