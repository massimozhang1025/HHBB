const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' }
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'properties', key: 'id' }
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Staff'
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'employees',
    indexes: [
      { unique: true, fields: ['user_id'] },            // Fast user→employee lookup
      { fields: ['property_id'] },                       // Filter by property
      { fields: ['total_points'] },                      // Leaderboard sort
      { fields: ['is_active'] },                         // Active employee filter
      { fields: ['property_id', 'is_active'] }           // Combined: active employees per property
    ]
  });

  return Employee;
};
