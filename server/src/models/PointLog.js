const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PointLog = sequelize.define('PointLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'employees', key: 'id' }
    },
    points_change: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    balance_after: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('referral_reward', 'manual_bonus', 'penalty', 'adjustment'),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    }
  }, {
    tableName: 'point_logs',
    // Immutable: no updates or deletes at model level
    updatedAt: false,
    indexes: [
      { fields: ['employee_id'] },
      { fields: ['type'] },
      { fields: ['created_at'] }
    ]
  });

  return PointLog;
};
