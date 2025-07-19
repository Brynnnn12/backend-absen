/**
 * Main Database Seeder
 * Run this script to seed all initial data
 */

/* eslint-disable no-console */

require('dotenv').config();
const { seedAdmin } = require('./adminSeeder');
const { seedEmployees } = require('./employeeSeeder');

const runAllSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    console.log('📝 Step 1: Seeding Admin User...');
    await seedAdmin();
    
    console.log('\n📝 Step 2: Seeding Employee Users...');
    await seedEmployees();
    
    console.log('\n🎉 All seeders completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin user ready');
    console.log('✅ Sample employees ready');
    console.log('\n🚀 You can now start the application and login with seeded accounts.');
    
  } catch (error) {
    console.error('❌ Seeding process failed:', error.message);
    process.exit(1);
  }
};

// Run all seeders
if (require.main === module) {
  runAllSeeders();
}

module.exports = { runAllSeeders };
