const { pool } = require('../config/database/connection');

async function fixForeignKeyAndComplete() {
  try {
    console.log('🔧 Completing database schema fixes...');

    // 1. Drop foreign key constraint for letter_generated_by
    console.log('🔗 Dropping foreign key constraint...');
    await pool.execute(`
      ALTER TABLE checkup_requests
      DROP FOREIGN KEY checkup_requests_ibfk_6
    `);
    console.log('✅ Foreign key constraint dropped');

    // 2. Drop the remaining columns
    console.log('📊 Dropping remaining columns...');

    const remainingColumns = ['letter_generated_by', 'letter_sent_at'];

    for (const column of remainingColumns) {
      try {
        await pool.execute(`ALTER TABLE checkup_requests DROP COLUMN ${column}`);
        console.log(`✅ Dropped column: ${column}`);
      } catch (error) {
        if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
          throw error;
        }
        console.log(`⚠️ Column ${column} doesn't exist or already dropped`);
      }
    }

    console.log('🎉 Database schema fixes completed successfully!');

    // Show final table structure
    console.log('\n📋 Final checkup_requests table structure:');
    const [structure] = await pool.execute(`DESCRIBE checkup_requests`);
    console.table(structure);

  } catch (error) {
    console.error('❌ Error completing database schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  fixForeignKeyAndComplete()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { fixForeignKeyAndComplete };