'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hash = await bcrypt.hash('password123', 12);

    // ═══════════════════════════════════════════
    // 1. Users
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('users', [
      // Admin
      {
        email: 'admin@hhbb.com',
        password_hash: hash,
        full_name: 'Admin HHBB',
        phone: '+39 041 123 4567',
        role: 'admin',
        referral_code: 'ADMIN001',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      // Employees
      {
        email: 'marco.rossi@hhbb.com',
        password_hash: hash,
        full_name: 'Marco Rossi',
        phone: '+39 041 234 5678',
        role: 'employee',
        referral_code: 'MARCO001',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'giulia.bianchi@hhbb.com',
        password_hash: hash,
        full_name: 'Giulia Bianchi',
        phone: '+39 041 345 6789',
        role: 'employee',
        referral_code: 'GIULIA01',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'luca.verdi@hhbb.com',
        password_hash: hash,
        full_name: 'Luca Verdi',
        phone: '+39 045 456 7890',
        role: 'employee',
        referral_code: 'LUCA0001',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      // Customers
      {
        email: 'customer1@example.com',
        password_hash: hash,
        full_name: 'Anna Schmidt',
        phone: '+49 170 1234567',
        role: 'customer',
        referral_code: 'ANNA0001',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'customer2@example.com',
        password_hash: hash,
        full_name: 'John Smith',
        phone: '+44 7700 123456',
        role: 'customer',
        referral_code: 'JOHN0001',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        email: 'customer3@example.com',
        password_hash: hash,
        full_name: 'Marie Dupont',
        phone: '+33 6 12 34 56 78',
        role: 'customer',
        referral_code: 'MARIE001',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ], {});

    // ═══════════════════════════════════════════
    // 2. Properties (Hotel Locations)
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('properties', [
      {
        name: 'HHBB Venezia Centro',
        address: 'Calle Larga XXII Marzo, 2399',
        city: 'Venezia',
        country: 'Italy',
        latitude: 45.4316,
        longitude: 12.3371,
        phone: '+39 041 520 0600',
        email: 'venezia@hhbb.com',
        description: 'Boutique hotel nel cuore di Venezia, a pochi passi da Piazza San Marco.',
        image_url: '/images/properties/venezia.jpg',
        amenities: JSON.stringify(['WiFi', 'Colazione', 'Concierge', 'Vista Canal Grande']),
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        name: 'HHBB Verona',
        address: 'Via Roma, 15',
        city: 'Verona',
        country: 'Italy',
        latitude: 45.4384,
        longitude: 10.9916,
        phone: '+39 045 800 1234',
        email: 'verona@hhbb.com',
        description: 'Hotel elegante vicino all\'Arena di Verona, perfetto per amanti dell\'opera.',
        image_url: '/images/properties/verona.jpg',
        amenities: JSON.stringify(['WiFi', 'Colazione', 'Parcheggio', 'Spa']),
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        name: 'HHBB Lago di Garda',
        address: 'Lungolago Cesare Battisti, 8',
        city: 'Sirmione',
        country: 'Italy',
        latitude: 45.4960,
        longitude: 10.6067,
        phone: '+39 030 990 5678',
        email: 'garda@hhbb.com',
        description: 'Resort con vista mozzafiato sul Lago di Garda, con accesso diretto alla spiaggia.',
        image_url: '/images/properties/garda.jpg',
        amenities: JSON.stringify(['WiFi', 'Colazione', 'Piscina', 'Spiaggia privata', 'Ristorante']),
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ], {});

    // ═══════════════════════════════════════════
    // 3. Rooms
    // ═══════════════════════════════════════════
    const rooms = [];
    const roomTypes = [
      { type: 'single', price: 89, capacity: 1 },
      { type: 'double', price: 139, capacity: 2 },
      { type: 'suite', price: 249, capacity: 2 },
      { type: 'family', price: 199, capacity: 4 }
    ];

    // Venezia: 12 rooms
    for (let floor = 1; floor <= 3; floor++) {
      roomTypes.forEach((rt, i) => {
        rooms.push({
          property_id: 1,
          room_number: `${floor}0${i + 1}`,
          type: rt.type,
          price_per_night: rt.price + (floor * 10), // higher floors cost more
          capacity: rt.capacity,
          floor,
          status: 'available',
          description: `${rt.type.charAt(0).toUpperCase() + rt.type.slice(1)} room on floor ${floor}`,
          amenities: JSON.stringify(['TV', 'Minibar', 'Aria condizionata']),
          is_active: true,
          created_at: now,
          updated_at: now
        });
      });
    }

    // Verona: 8 rooms
    for (let floor = 1; floor <= 2; floor++) {
      roomTypes.forEach((rt, i) => {
        rooms.push({
          property_id: 2,
          room_number: `${floor}0${i + 1}`,
          type: rt.type,
          price_per_night: rt.price,
          capacity: rt.capacity,
          floor,
          status: 'available',
          description: `${rt.type.charAt(0).toUpperCase() + rt.type.slice(1)} room on floor ${floor}`,
          amenities: JSON.stringify(['TV', 'Minibar', 'Cassaforte']),
          is_active: true,
          created_at: now,
          updated_at: now
        });
      });
    }

    // Garda: 10 rooms
    for (let floor = 1; floor <= 2; floor++) {
      roomTypes.forEach((rt, i) => {
        rooms.push({
          property_id: 3,
          room_number: `${floor}0${i + 1}`,
          type: rt.type,
          price_per_night: rt.price + 20, // lake view premium
          capacity: rt.capacity,
          floor,
          status: 'available',
          description: `${rt.type.charAt(0).toUpperCase() + rt.type.slice(1)} room with lake view`,
          amenities: JSON.stringify(['TV', 'Minibar', 'Balcone', 'Vista lago']),
          is_active: true,
          created_at: now,
          updated_at: now
        });
      });
    }

    // Add 2 extra suites for Garda
    rooms.push({
      property_id: 3,
      room_number: '301',
      type: 'suite',
      price_per_night: 349,
      capacity: 2,
      floor: 3,
      status: 'available',
      description: 'Presidential Suite with panoramic lake view',
      amenities: JSON.stringify(['TV', 'Minibar', 'Jacuzzi', 'Terrazza panoramica']),
      is_active: true,
      created_at: now,
      updated_at: now
    });
    rooms.push({
      property_id: 3,
      room_number: '302',
      type: 'family',
      price_per_night: 289,
      capacity: 5,
      floor: 3,
      status: 'available',
      description: 'Deluxe Family Suite with play area',
      amenities: JSON.stringify(['TV', 'Minibar', 'Area giochi', 'Due bagni']),
      is_active: true,
      created_at: now,
      updated_at: now
    });

    await queryInterface.bulkInsert('rooms', rooms, {});

    // ═══════════════════════════════════════════
    // 4. Employees
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('employees', [
      { user_id: 2, property_id: 1, position: 'Receptionist', total_points: 45, is_active: true, hire_date: '2025-01-15', created_at: now, updated_at: now },
      { user_id: 3, property_id: 1, position: 'Manager', total_points: 120, is_active: true, hire_date: '2024-06-01', created_at: now, updated_at: now },
      { user_id: 4, property_id: 2, position: 'Receptionist', total_points: 30, is_active: true, hire_date: '2025-03-10', created_at: now, updated_at: now }
    ], {});

    // ═══════════════════════════════════════════
    // 5. Sample Bookings
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('bookings', [
      {
        user_id: 5, room_id: 1, property_id: 1,
        check_in: '2026-04-10', check_out: '2026-04-14',
        guests: 1, status: 'confirmed', total_price: 396,
        referral_code_used: null, notes: 'Early check-in requested',
        created_at: now, updated_at: now
      },
      {
        user_id: 6, room_id: 5, property_id: 1,
        check_in: '2026-04-15', check_out: '2026-04-18',
        guests: 2, status: 'confirmed', total_price: 447,
        referral_code_used: 'ANNA0001', notes: null,
        created_at: now, updated_at: now
      },
      {
        user_id: 7, room_id: 13, property_id: 2,
        check_in: '2026-04-20', check_out: '2026-04-23',
        guests: 2, status: 'confirmed', total_price: 417,
        referral_code_used: null, notes: 'Anniversary trip',
        created_at: now, updated_at: now
      },
      {
        user_id: 5, room_id: 21, property_id: 3,
        check_in: '2026-05-01', check_out: '2026-05-05',
        guests: 2, status: 'confirmed', total_price: 636,
        referral_code_used: null, notes: null,
        created_at: now, updated_at: now
      }
    ], {});

    // ═══════════════════════════════════════════
    // 6. Sample Referrals
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('referrals', [
      {
        referrer_user_id: 5, referred_user_id: 6, booking_id: 2,
        status: 'booking_made', points_awarded: 0,
        created_at: now, updated_at: now
      }
    ], {});

    // ═══════════════════════════════════════════
    // 7. Customer Loyalty
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('customer_loyalty', [
      { user_id: 5, total_bookings: 2, total_nights: 8, total_spent: 1032, tier: 'silver', loyalty_points: 1032, created_at: now, updated_at: now },
      { user_id: 6, total_bookings: 1, total_nights: 3, total_spent: 447, tier: 'bronze', loyalty_points: 447, created_at: now, updated_at: now },
      { user_id: 7, total_bookings: 1, total_nights: 3, total_spent: 417, tier: 'bronze', loyalty_points: 417, created_at: now, updated_at: now }
    ], {});

    // ═══════════════════════════════════════════
    // 8. Point Logs
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('point_logs', [
      { employee_id: 1, points_change: 10, balance_after: 10, type: 'referral_reward', reason: 'Referral claim approved — Guest Anna Schmidt', created_by: 1, created_at: new Date(now - 7 * 86400000) },
      { employee_id: 1, points_change: 15, balance_after: 25, type: 'manual_bonus', reason: 'Outstanding customer service — April', created_by: 1, created_at: new Date(now - 3 * 86400000) },
      { employee_id: 1, points_change: 20, balance_after: 45, type: 'referral_reward', reason: 'Referral claim approved — Guest John Smith', created_by: 1, created_at: now },
      { employee_id: 2, points_change: 50, balance_after: 50, type: 'manual_bonus', reason: 'Q1 Performance bonus', created_by: 1, created_at: new Date(now - 14 * 86400000) },
      { employee_id: 2, points_change: -5, balance_after: 45, type: 'penalty', reason: 'Late arrival — March 15', created_by: 1, created_at: new Date(now - 10 * 86400000) },
      { employee_id: 2, points_change: 75, balance_after: 120, type: 'referral_reward', reason: 'Multiple referrals bonus', created_by: 1, created_at: now },
      { employee_id: 3, points_change: 30, balance_after: 30, type: 'manual_bonus', reason: 'Welcome bonus', created_by: 1, created_at: now }
    ], {});

    // ═══════════════════════════════════════════
    // 9. Settings
    // ═══════════════════════════════════════════
    await queryInterface.bulkInsert('settings', [
      { key: 'referral_points_default', value: JSON.stringify(10), description: 'Default points awarded per successful referral', created_at: now, updated_at: now },
      { key: 'loyalty_tiers', value: JSON.stringify({ bronze: 0, silver: 500, gold: 2000, platinum: 5000 }), description: 'Loyalty tier thresholds (by total spent in EUR)', created_at: now, updated_at: now },
      { key: 'company_name', value: JSON.stringify('HHBB Hotels'), description: 'Company display name', created_at: now, updated_at: now }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('point_logs', null, {});
    await queryInterface.bulkDelete('customer_loyalty', null, {});
    await queryInterface.bulkDelete('referral_claims', null, {});
    await queryInterface.bulkDelete('referrals', null, {});
    await queryInterface.bulkDelete('bookings', null, {});
    await queryInterface.bulkDelete('employees', null, {});
    await queryInterface.bulkDelete('rooms', null, {});
    await queryInterface.bulkDelete('properties', null, {});
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('settings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
