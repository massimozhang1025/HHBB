const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerLoyalty = sequelize.define('CustomerLoyalty', {
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
    total_bookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_nights: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    tier: {
      type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
      defaultValue: 'bronze'
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'customer_loyalty'
  });

  return CustomerLoyalty;
};
