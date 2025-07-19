/**
 * Database Seeder untuk Pengguna Admin
 * Jalankan script ini untuk membuat pengguna admin default
 */

/* eslint-disable no-console */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { logger } = require('../src/utils');

const adminData = {
  name: 'Super Admin',
  email: 'admin@absensi.com',
  password: 'admin123456',
  role: 'admin'
};

const seedAdmin = async () => {
  try {
    // Koneksi ke database
    await mongoose.connect(process.env.MONGO_URI);
    logger.logInfo('Connected to database for seeding');

    // Cek apakah admin sudah ada
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      logger.logInfo('Admin user already exists', { email: adminData.email });
      return;
    }

    // Buat pengguna admin
    const admin = await User.create(adminData);

    logger.logInfo('Admin user created successfully', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    console.log('\n✅ Admin user seeded successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', adminData.role);
    console.log('\n⚠️  Silakan ubah password setelah login pertama kali!');

  } catch (error) {
    logger.logError('Error seeding admin user', error);
    console.error('❌ Seeding failed:', error.message);
  } finally {
    // Tutup koneksi database
    await mongoose.connection.close();
    logger.logInfo('Database connection closed');
    process.exit(0);
  }
};

// Jalankan seeder
if (require.main === module) {
  console.log('🌱 Memulai seeder pengguna admin...\n');
  seedAdmin();
}

module.exports = { seedAdmin, adminData };
