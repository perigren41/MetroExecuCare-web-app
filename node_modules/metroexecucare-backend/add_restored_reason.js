const mysql = require('mysql2/promise');
require('dotenv').config();

async function addRestoredReasonField() {
  let connection;
  try {
    // Create connection to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'metroexecu_user',
      password: process.env.DB_PASSWORD || 'capstoneDevelopers!01',
      database: process.env.DB_NAME || 'metroexecucare_db'
    });

    console.log('Connected to database. Adding restored_reason field...');

    // Check if column already exists
    const [existingColumns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'metroexecucare_db'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'restored_reason'
    `);

    if (existingColumns.length === 0) {
      // Add restored_reason column to users table
      await connection.execute(`
        ALTER TABLE users
        ADD COLUMN restored_reason TEXT NULL
        COMMENT 'Reason for restoring the user account'
        AFTER restored_by
      `);
      console.log('✅ Added restored_reason column');
    } else {
      console.log('✅ restored_reason column already exists');
    }

    console.log('✅ Successfully added restored_reason field to users table');

    // Show updated table structure
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'metroexecucare_db'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME LIKE '%restored%'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📋 Restoration-related fields in users table:');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE}) - ${col.COLUMN_COMMENT || 'No comment'}`);
    });

  } catch (error) {
    console.error('❌ Error adding restored_reason field:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
addRestoredReasonField();