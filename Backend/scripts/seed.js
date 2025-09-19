#!/usr/bin/env node

require('dotenv').config();
const { seedDatabase, resetDatabase } = require('../seeds/adminSeeds');

const command = process.argv[2];

const showHelp = () => {
  console.log(`
🌱 MetroExecuCare Database Seeding Tool

Usage:
  npm run seed              - Run database seeding
  npm run seed:reset        - Reset and reseed database
  npm run seed:help         - Show this help message

Commands:
  seed                     - Create initial admin and sample users
  reset                    - Remove existing seed data and recreate
  help                     - Display this help message

Examples:
  npm run seed             # Create initial data
  npm run seed:reset       # Reset and recreate data
  `);
};

const runSeed = async () => {
  try {
    switch (command) {
      case 'reset':
        console.log('🔄 Resetting database and reseeding...');
        await resetDatabase();
        await seedDatabase();
        break;
      
      case 'help':
        showHelp();
        break;
      
      case undefined:
      case 'seed':
        console.log('🌱 Running database seeding...');
        await seedDatabase();
        break;
      
      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
    
    console.log('✅ Seeding script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding script failed:', error);
    process.exit(1);
  }
};

runSeed();