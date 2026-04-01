/**
 * Quick seed script — run after the server has started and synced the DB.
 * Usage: node seed-db.js
 * Supports DATABASE_URL for cloud deployments.
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || undefined,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    }
  );
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const now = new Date();
    const hash = await bcrypt.hash('password123', 12);

    // Check if data already exists
    const [existingUsers] = await sequelize.query("SELECT COUNT(*) as count FROM users");
    if (parseInt(existingUsers[0].count) > 0) {
      console.log('⚠️  Data already exists. Drop tables first if you want to re-seed.');
      console.log(`   Found ${existingUsers[0].count} users.`);
      process.exit(0);
    }

    console.log('🌱 Seeding users...');
    await sequelize.query(`
      INSERT INTO users (email, password_hash, full_name, phone, role, referral_code, is_active, created_at, updated_at) VALUES
      ('admin@hhbb.com', '${hash}', 'Admin HHBB', '+39 041 123 4567', 'admin', 'ADMIN001', true, NOW(), NOW()),
      ('marco.rossi@hhbb.com', '${hash}', 'Marco Rossi', '+39 041 234 5678', 'employee', 'MARCO001', true, NOW(), NOW()),
      ('giulia.bianchi@hhbb.com', '${hash}', 'Giulia Bianchi', '+39 041 345 6789', 'employee', 'GIULIA01', true, NOW(), NOW()),
      ('luca.verdi@hhbb.com', '${hash}', 'Luca Verdi', '+39 045 456 7890', 'employee', 'LUCA0001', true, NOW(), NOW()),
      ('customer1@example.com', '${hash}', 'Anna Schmidt', '+49 170 1234567', 'customer', 'ANNA0001', true, NOW(), NOW()),
      ('customer2@example.com', '${hash}', 'John Smith', '+44 7700 123456', 'customer', 'JOHN0001', true, NOW(), NOW()),
      ('customer3@example.com', '${hash}', 'Marie Dupont', '+33 6 12 34 56 78', 'customer', 'MARIE001', true, NOW(), NOW())
    `);

    console.log('🏨 Seeding properties...');
    await sequelize.query(`
      INSERT INTO properties (name, address, city, country, latitude, longitude, phone, email, description, amenities, is_active, created_at, updated_at) VALUES
      ('HHBB Venezia Centro', 'Calle Larga XXII Marzo, 2399', 'Venezia', 'Italy', 45.4316, 12.3371, '+39 041 520 0600', 'venezia@hhbb.com', 'Boutique hotel nel cuore di Venezia, a pochi passi da Piazza San Marco.', '["WiFi","Colazione","Concierge","Vista Canal Grande"]', true, NOW(), NOW()),
      ('HHBB Verona', 'Via Roma, 15', 'Verona', 'Italy', 45.4384, 10.9916, '+39 045 800 1234', 'verona@hhbb.com', 'Hotel elegante vicino all''Arena di Verona, perfetto per amanti dell''opera.', '["WiFi","Colazione","Parcheggio","Spa"]', true, NOW(), NOW()),
      ('HHBB Lago di Garda', 'Lungolago Cesare Battisti, 8', 'Sirmione', 'Italy', 45.4960, 10.6067, '+39 030 990 5678', 'garda@hhbb.com', 'Resort con vista mozzafiato sul Lago di Garda, con accesso diretto alla spiaggia.', '["WiFi","Colazione","Piscina","Spiaggia privata","Ristorante"]', true, NOW(), NOW())
    `);

    console.log('🛏️  Seeding rooms...');
    const roomTypes = [
      { type: 'single', price: 89, capacity: 1 },
      { type: 'double', price: 139, capacity: 2 },
      { type: 'suite', price: 249, capacity: 2 },
      { type: 'family', price: 199, capacity: 4 }
    ];

    // Venezia: 12 rooms (3 floors × 4 types)
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 0; i < roomTypes.length; i++) {
        const rt = roomTypes[i];
        await sequelize.query(`
          INSERT INTO rooms (property_id, room_number, type, price_per_night, capacity, floor, status, description, amenities, is_active, created_at, updated_at)
          VALUES (1, '${floor}0${i + 1}', '${rt.type}', ${rt.price + floor * 10}, ${rt.capacity}, ${floor}, 'available', '${rt.type} room floor ${floor}', '["TV","Minibar","AC"]', true, NOW(), NOW())
        `);
      }
    }

    // Verona: 8 rooms (2 floors × 4 types)
    for (let floor = 1; floor <= 2; floor++) {
      for (let i = 0; i < roomTypes.length; i++) {
        const rt = roomTypes[i];
        await sequelize.query(`
          INSERT INTO rooms (property_id, room_number, type, price_per_night, capacity, floor, status, description, amenities, is_active, created_at, updated_at)
          VALUES (2, '${floor}0${i + 1}', '${rt.type}', ${rt.price}, ${rt.capacity}, ${floor}, 'available', '${rt.type} room floor ${floor}', '["TV","Minibar","Safe"]', true, NOW(), NOW())
        `);
      }
    }

    // Garda: 10 rooms (2 floors × 4 types + 2 extras)
    for (let floor = 1; floor <= 2; floor++) {
      for (let i = 0; i < roomTypes.length; i++) {
        const rt = roomTypes[i];
        await sequelize.query(`
          INSERT INTO rooms (property_id, room_number, type, price_per_night, capacity, floor, status, description, amenities, is_active, created_at, updated_at)
          VALUES (3, '${floor}0${i + 1}', '${rt.type}', ${rt.price + 20}, ${rt.capacity}, ${floor}, 'available', '${rt.type} lake view', '["TV","Minibar","Balcony","Lake view"]', true, NOW(), NOW())
        `);
      }
    }
    await sequelize.query(`
      INSERT INTO rooms (property_id, room_number, type, price_per_night, capacity, floor, status, description, amenities, is_active, created_at, updated_at) VALUES
      (3, '301', 'suite', 349, 2, 3, 'available', 'Presidential Suite panoramic view', '["TV","Minibar","Jacuzzi","Terrace"]', true, NOW(), NOW()),
      (3, '302', 'family', 289, 5, 3, 'available', 'Deluxe Family Suite', '["TV","Minibar","Play area","Two bathrooms"]', true, NOW(), NOW())
    `);

    console.log('👔 Seeding employees...');
    await sequelize.query(`
      INSERT INTO employees (user_id, property_id, position, total_points, is_active, hire_date, created_at, updated_at) VALUES
      (2, 1, 'Receptionist', 45, true, '2025-01-15', NOW(), NOW()),
      (3, 1, 'Manager', 120, true, '2024-06-01', NOW(), NOW()),
      (4, 2, 'Receptionist', 30, true, '2025-03-10', NOW(), NOW())
    `);

    console.log('📅 Seeding bookings...');
    await sequelize.query(`
      INSERT INTO bookings (user_id, room_id, property_id, check_in, check_out, guests, status, total_price, notes, created_at, updated_at) VALUES
      (5, 1, 1, '2026-04-10', '2026-04-14', 1, 'confirmed', 396, 'Early check-in requested', NOW(), NOW()),
      (6, 5, 1, '2026-04-15', '2026-04-18', 2, 'confirmed', 447, NULL, NOW(), NOW()),
      (7, 13, 2, '2026-04-20', '2026-04-23', 2, 'confirmed', 417, 'Anniversary trip', NOW(), NOW()),
      (5, 21, 3, '2026-05-01', '2026-05-05', 2, 'confirmed', 636, NULL, NOW(), NOW())
    `);

    console.log('🎁 Seeding referrals...');
    await sequelize.query(`
      INSERT INTO referrals (referrer_user_id, referred_user_id, booking_id, status, points_awarded, created_at, updated_at) VALUES
      (5, 6, 2, 'booking_made', 0, NOW(), NOW())
    `);

    console.log('⭐ Seeding point logs...');
    await sequelize.query(`
      INSERT INTO point_logs (employee_id, points_change, balance_after, type, reason, created_by, created_at) VALUES
      (1, 10, 10, 'referral_reward', 'Referral approved — Anna Schmidt', 1, NOW() - INTERVAL '7 days'),
      (1, 15, 25, 'manual_bonus', 'Outstanding service — April', 1, NOW() - INTERVAL '3 days'),
      (1, 20, 45, 'referral_reward', 'Referral approved — John Smith', 1, NOW()),
      (2, 50, 50, 'manual_bonus', 'Q1 Performance bonus', 1, NOW() - INTERVAL '14 days'),
      (2, -5, 45, 'penalty', 'Late arrival — March 15', 1, NOW() - INTERVAL '10 days'),
      (2, 75, 120, 'referral_reward', 'Multiple referrals bonus', 1, NOW()),
      (3, 30, 30, 'manual_bonus', 'Welcome bonus', 1, NOW())
    `);

    console.log('💎 Seeding customer loyalty...');
    await sequelize.query(`
      INSERT INTO customer_loyalty (user_id, total_bookings, total_nights, total_spent, tier, loyalty_points, created_at, updated_at) VALUES
      (5, 2, 8, 1032, 'silver', 1032, NOW(), NOW()),
      (6, 1, 3, 447, 'bronze', 447, NOW(), NOW()),
      (7, 1, 3, 417, 'bronze', 417, NOW(), NOW())
    `);

    console.log('⚙️  Seeding settings...');
    await sequelize.query(`
      INSERT INTO settings (key, value, description, created_at, updated_at) VALUES
      ('referral_points_default', '10', 'Default points per referral', NOW(), NOW()),
      ('loyalty_tiers', '{"bronze":0,"silver":500,"gold":2000,"platinum":5000}', 'Loyalty tier thresholds (EUR)', NOW(), NOW()),
      ('company_name', '"HHBB Hotels"', 'Company display name', NOW(), NOW())
    `);

    console.log('\n✅ Seeding complete!');
    console.log('   - 7 users (1 admin, 3 employees, 3 customers)');
    console.log('   - 3 properties (Venezia, Verona, Garda)');
    console.log('   - 30 rooms');
    console.log('   - 3 employees with point history');
    console.log('   - 4 bookings');
    console.log('   - 1 referral');
    console.log('\n   Password for all accounts: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
