const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'metroexecucare_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔗 Connected to database');

    // Read and execute migration script
    const migrationPath = path.join(__dirname, '../config/database/migrations/add_hr_final_verification.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    // Split SQL statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('📝 Executing migration...');

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const [results] = await connection.execute(statement);

        // If it's a SELECT statement, show results
        if (statement.trim().toUpperCase().startsWith('SELECT')) {
          console.log('Results:', results);
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('🔄 Please restart your backend server to pick up the changes.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration
runMigration();