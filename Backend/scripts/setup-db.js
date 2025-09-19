#!/usr/bin/env node

const { initializeDatabase, resetDatabase } = require('../config/database/init');
const { closePool } = require('../config/database/connection');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'init':
        console.log('🔄 Initializing database...');
        await initializeDatabase();
        break;
        
      case 'reset':
        console.log('⚠️  This will delete ALL existing data!');
        console.log('Are you sure? (This action cannot be undone)');
        
        // In production, you might want to add a confirmation prompt here
        if (process.env.NODE_ENV === 'production') {
          console.log('❌ Database reset is not allowed in production!');
          process.exit(1);
        }
        
        await resetDatabase();
        break;
        
      default:
        console.log('Usage: node scripts/setup-db.js [init|reset]');
        console.log('  init  - Initialize database with schema and initial data');
        console.log('  reset - Reset database (WARNING: Deletes all data)');
        process.exit(1);
    }
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
    process.exit(0);
  }
}

main();