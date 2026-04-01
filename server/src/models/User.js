const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('customer', 'employee', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    referral_code: {
      type: DataTypes.STRING(12),
      unique: true,
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
        // Generate unique referral code
        if (!user.referral_code) {
          user.referral_code = generateReferralCode();
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      }
    },
    indexes: [
      { fields: ['role'] },                          // Filter by role (admin/employee/customer)
      { fields: ['is_active'] },                     // Active user filter
      { fields: ['role', 'is_active'] },             // Combined: active users of a role
      { unique: true, fields: ['referral_code'] }    // Referral code lookup
    ]
  });

  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.toSafeJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  return User;
};

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
