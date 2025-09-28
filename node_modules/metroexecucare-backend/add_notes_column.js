const { pool } = require('./config/database/connection');

async function addNotesColumn() {
  console.log('🔄 Adding notes column to users table...');

  try {
    // Check if notes column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'notes'
    `);

    if (columns.length > 0) {
      console.log('✅ Notes column already exists in users table');
      return;
    }

    // Add notes column
    await pool.execute(`
      ALTER TABLE users
      ADD COLUMN notes TEXT AFTER profile_picture
    `);

    console.log('✅ Notes column added successfully to users table');

  } catch (error) {
    console.error('❌ Error adding notes column:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addNotesColumn().catch(console.error);