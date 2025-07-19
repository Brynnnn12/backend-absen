/**
 * Database Seeder untuk Pengguna Karyawan Contoh
 * Jalankan script ini untuk membuat pengguna karyawan contoh untuk testing
 */

/* eslint-disable no-console */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { logger } = require('../src/utils');

const employeeData = [
  {
    name: 'Budi Santoso',
    email: 'budi@absensi.com',
    password: 'password123',
    role: 'karyawan'
  },
  {
    name: 'Siti Nurhaliza',
    email: 'siti@absensi.com',
    password: 'password123',
    role: 'karyawan'
  },
  {
    name: 'Ahmad Wijaya',
    email: 'ahmad@absensi.com',
    password: 'password123',
    role: 'karyawan'
  }
];

const seedEmployees = async () => {
  try {
    // Koneksi ke database
    await mongoose.connect(process.env.MONGO_URI);
    logger.logInfo('Connected to database for seeding employees');

    let createdCount = 0;
    let existingCount = 0;

    for (const empData of employeeData) {
      // Cek apakah karyawan sudah ada
      const existingEmployee = await User.findOne({ email: empData.email });

      if (existingEmployee) {
        existingCount++;
        logger.logInfo('Employee already exists', { email: empData.email });
        continue;
      }

      // Buat pengguna karyawan
      const employee = await User.create(empData);
      createdCount++;

      logger.logInfo('Employee created successfully', {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      });
    }

    console.log('\n✅ Employee seeding completed!');
    console.log(`🆕 Created: ${createdCount} new employees`);
    console.log(`📋 Existing: ${existingCount} employees already exist`);
    console.log(`📊 Total in seed: ${employeeData.length} employees`);

    if (createdCount > 0) {
      console.log('\n👥 Sample Employee Accounts:');
      employeeData.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.name} (${emp.email}) - Password: ${emp.password}`);
      });
      console.log('\n⚠️  Silakan ubah password setelah login pertama kali!');
    }

  } catch (error) {
    logger.logError('Error seeding employee users', error);
    console.error('❌ Employee seeding failed:', error.message);
  } finally {
    // Tutup koneksi database
    await mongoose.connection.close();
    logger.logInfo('Database connection closed');
    process.exit(0);
  }
};

// Jalankan seeder
if (require.main === module) {
  console.log('🌱 Memulai seeder pengguna karyawan...\n');
  seedEmployees();
}

module.exports = { seedEmployees, employeeData };
