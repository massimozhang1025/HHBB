const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Referral = sequelize.define('Referral', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    referrer_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    referred_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'bookings', key: 'id' }
    },
    // Three-step status:
    // 1. pending     → referral code shared, waiting for use
    // 2. booking_made → referred customer made a booking
    // 3. checked_in  → referred customer checked in
    // 4. completed   → points awarded, cycle complete
    status: {
      type: DataTypes.ENUM('pending', 'booking_made', 'checked_in', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    points_awarded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'referrals',
    indexes: [
      { fields: ['referrer_user_id'] },
      { fields: ['referred_user_id'] },
      { fields: ['status'] }
    ]
  });

  return Referral;
};
