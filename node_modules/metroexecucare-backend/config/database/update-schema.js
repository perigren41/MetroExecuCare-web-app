const { pool } = require('./connection');

async function updateSchema() {
  try {
    console.log('🔄 Updating database schema...');
    
    // Make approver_id nullable
    await pool.execute('ALTER TABLE request_approvals MODIFY approver_id INT NULL');
    console.log('✅ Updated request_approvals.approver_id to be nullable');
    
    // Verify the change
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'request_approvals' 
      AND TABLE_SCHEMA = 'metroexecucare_db' 
      AND COLUMN_NAME = 'approver_id'
    `);
    
    console.log('📊 Column info:', columns[0]);
    console.log('🎉 Schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
  } finally {
    await pool.end();
  }
}

updateSchema();