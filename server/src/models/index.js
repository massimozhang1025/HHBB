const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Support DATABASE_URL (Render, Railway, Heroku) or individual credentials
let sequelize;
if (process.env.DATABASE_URL && env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: dbConfig.pool || { max: 10, min: 2, acquire: 30000, idle: 10000 },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool || { max: 5, min: 0, acquire: 30000, idle: 10000 },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  );
}

// ═══════════════════════════════════════════
// Model Imports
// ═══════════════════════════════════════════
const UserModel = require('./User');
const PropertyModel = require('./Property');
const RoomModel = require('./Room');
const BookingModel = require('./Booking');
const EmployeeModel = require('./Employee');
const ReferralModel = require('./Referral');
const ReferralClaimModel = require('./ReferralClaim');
const PointLogModel = require('./PointLog');
const RoomStatusLogModel = require('./RoomStatusLog');
const CustomerLoyaltyModel = require('./CustomerLoyalty');
const NotificationModel = require('./Notification');
const AuditLogModel = require('./AuditLog');
const SettingModel = require('./Setting');

// ═══════════════════════════════════════════
// Initialize Models
// ═══════════════════════════════════════════
const User = UserModel(sequelize);
const Property = PropertyModel(sequelize);
const Room = RoomModel(sequelize);
const Booking = BookingModel(sequelize);
const Employee = EmployeeModel(sequelize);
const Referral = ReferralModel(sequelize);
const ReferralClaim = ReferralClaimModel(sequelize);
const PointLog = PointLogModel(sequelize);
const RoomStatusLog = RoomStatusLogModel(sequelize);
const CustomerLoyalty = CustomerLoyaltyModel(sequelize);
const Notification = NotificationModel(sequelize);
const AuditLog = AuditLogModel(sequelize);
const Setting = SettingModel(sequelize);

// ═══════════════════════════════════════════
// Associations
// ═══════════════════════════════════════════

// Property ↔ Room
Property.hasMany(Room, { foreignKey: 'property_id', as: 'rooms' });
Room.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Property ↔ Employee
Property.hasMany(Employee, { foreignKey: 'property_id', as: 'employees' });
Employee.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// User ↔ Employee
User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ Booking
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Room ↔ Booking
Room.hasMany(Booking, { foreignKey: 'room_id', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// Property ↔ Booking
Property.hasMany(Booking, { foreignKey: 'property_id', as: 'bookings' });
Booking.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// User ↔ Referral (as referrer)
User.hasMany(Referral, { foreignKey: 'referrer_user_id', as: 'referralsMade' });
Referral.belongsTo(User, { foreignKey: 'referrer_user_id', as: 'referrer' });

// User ↔ Referral (as referred)
User.hasMany(Referral, { foreignKey: 'referred_user_id', as: 'referralsReceived' });
Referral.belongsTo(User, { foreignKey: 'referred_user_id', as: 'referred' });

// Booking ↔ Referral
Booking.hasOne(Referral, { foreignKey: 'booking_id', as: 'referral' });
Referral.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Employee ↔ ReferralClaim
Employee.hasMany(ReferralClaim, { foreignKey: 'employee_id', as: 'claims' });
ReferralClaim.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Referral ↔ ReferralClaim
Referral.hasMany(ReferralClaim, { foreignKey: 'referral_id', as: 'claims' });
ReferralClaim.belongsTo(Referral, { foreignKey: 'referral_id', as: 'referral' });

// Employee ↔ PointLog
Employee.hasMany(PointLog, { foreignKey: 'employee_id', as: 'pointLogs' });
PointLog.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Room ↔ RoomStatusLog
Room.hasMany(RoomStatusLog, { foreignKey: 'room_id', as: 'statusLogs' });
RoomStatusLog.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// User ↔ CustomerLoyalty
User.hasOne(CustomerLoyalty, { foreignKey: 'user_id', as: 'loyalty' });
CustomerLoyalty.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ AuditLog
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const db = {
  sequelize,
  Sequelize,
  User,
  Property,
  Room,
  Booking,
  Employee,
  Referral,
  ReferralClaim,
  PointLog,
  RoomStatusLog,
  CustomerLoyalty,
  Notification,
  AuditLog,
  Setting
};

module.exports = db;
