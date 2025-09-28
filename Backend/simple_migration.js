const { pool } = require('./config/database/connection');

async function addBirthDateColumn() {
  try {
    console.log('🔄 Adding birth_date column to users table...');

    // Check if birth_date column exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'users'
      AND table_schema = DATABASE()
      AND column_name = 'birth_date'
    `);

    if (columns.length > 0) {
      console.log('ℹ️  birth_date column already exists');
    } else {
      // Add birth_date column
      await pool.execute('ALTER TABLE users ADD COLUMN birth_date DATE AFTER contact_number');
      console.log('✅ birth_date column added successfully');
    }

    // Check if department column exists
    const [deptColumns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'users'
      AND table_schema = DATABASE()
      AND column_name = 'department'
    `);

    if (deptColumns.length === 0) {
      await pool.execute('ALTER TABLE users ADD COLUMN department VARCHAR(100) AFTER position');
      console.log('✅ department column added successfully');
    } else {
      console.log('ℹ️  department column already exists');
    }

    // Check if branch column exists
    const [branchColumns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'users'
      AND table_schema = DATABASE()
      AND column_name = 'branch'
    `);

    if (branchColumns.length === 0) {
      await pool.execute('ALTER TABLE users ADD COLUMN branch VARCHAR(200) AFTER department');
      console.log('✅ branch column added successfully');
    } else {
      console.log('ℹ️  branch column already exists');
    }

    // Verify all columns
    console.log('\n📊 Verifying user table structure...');
    const [allColumns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'users'
      AND table_schema = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Current user table columns:');
    allColumns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

addBirthDateColumn();