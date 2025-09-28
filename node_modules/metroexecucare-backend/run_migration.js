const { pool } = require('./config/database/connection');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running user fields migration...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'config/database/migrations/add_user_fields_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}...`);
          await pool.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`ℹ️  Statement ${i + 1}: ${error.message}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log('🎉 Migration completed successfully!');

    // Verify the changes
    console.log('\n📊 Verifying database schema...');
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'users'
      AND table_schema = DATABASE()
      AND COLUMN_NAME IN ('department', 'branch', 'birth_date')
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Current user table columns:');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();