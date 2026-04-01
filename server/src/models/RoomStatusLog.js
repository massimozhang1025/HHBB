const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomStatusLog = sequelize.define('RoomStatusLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'rooms', key: 'id' }
    },
    old_status: {
      type: DataTypes.ENUM('available', 'occupied', 'cleaning', 'maintenance'),
      allowNull: false
    },
    new_status: {
      type: DataTypes.ENUM('available', 'occupied', 'cleaning', 'maintenance'),
      allowNull: false
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    }
  }, {
    tableName: 'room_status_logs',
    updatedAt: false
  });

  return RoomStatusLog;
};
