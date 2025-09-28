const { pool } = require('../config/database/connection');

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Starting database schema fixes...');

    // 1. Fix notification_type column size
    console.log('📊 Fixing notification_type column size...');
    await pool.execute(`
      ALTER TABLE notifications
      MODIFY COLUMN notification_type VARCHAR(50)
    `);
    console.log('✅ notification_type column fixed');

    // 2. Remove redundant hospital columns from checkup_requests
    console.log('🏥 Removing redundant hospital columns...');

    // Check if columns exist before dropping them
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'metroexecucare_db'
      AND TABLE_NAME = 'checkup_requests'
      AND COLUMN_NAME IN ('hospital_name', 'hospital_address', 'hospital_contact', 'letter_generated_at', 'letter_generated_by', 'letter_sent_at')
    `);

    const columnsToRemove = columns.map(col => col.COLUMN_NAME);

    for (const column of columnsToRemove) {
      await pool.execute(`ALTER TABLE checkup_requests DROP COLUMN ${column}`);
      console.log(`✅ Dropped column: ${column}`);
    }

    console.log('🎉 Database schema fixes completed successfully!');

    // Show final table structure
    console.log('\n📋 Current checkup_requests table structure:');
    const [structure] = await pool.execute(`DESCRIBE checkup_requests`);
    console.table(structure);

    console.log('\n📋 Current notifications table notification_type info:');
    const [notificationInfo] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'metroexecucare_db'
      AND TABLE_NAME = 'notifications'
      AND COLUMN_NAME = 'notification_type'
    `);
    console.table(notificationInfo);

  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  fixDatabaseSchema()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabaseSchema };