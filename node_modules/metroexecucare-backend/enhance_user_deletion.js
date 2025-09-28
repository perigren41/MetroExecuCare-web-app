const { pool } = require('./config/database/connection');

async function enhanceUserDeletionSchema() {
  try {
    console.log('🔄 Enhancing user deletion schema...');

    // Add deletion tracking columns if they don't exist
    const columnsToAdd = [
      { name: 'deleted_at', type: 'TIMESTAMP NULL' },
      { name: 'deleted_by', type: 'INT NULL' },
      { name: 'deletion_reason', type: 'TEXT' },
      { name: 'restored_at', type: 'TIMESTAMP NULL' },
      { name: 'restored_by', type: 'INT NULL' }
    ];

    for (const column of columnsToAdd) {
      try {
        // Check if column exists
        const [columns] = await pool.execute(`
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE table_name = 'users'
          AND table_schema = DATABASE()
          AND column_name = ?
        `, [column.name]);

        if (columns.length === 0) {
          await pool.execute(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`);
          console.log(`✅ Added column: ${column.name}`);
        } else {
          console.log(`ℹ️  Column ${column.name} already exists`);
        }
      } catch (error) {
        console.error(`❌ Error adding column ${column.name}:`, error.message);
      }
    }

    // Add foreign key constraints if they don't exist
    try {
      await pool.execute(`
        ALTER TABLE users
        ADD CONSTRAINT fk_deleted_by
        FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint for deleted_by');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('ℹ️  Foreign key constraint for deleted_by already exists or not needed');
      }
    }

    try {
      await pool.execute(`
        ALTER TABLE users
        ADD CONSTRAINT fk_restored_by
        FOREIGN KEY (restored_by) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint for restored_by');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('ℹ️  Foreign key constraint for restored_by already exists or not needed');
      }
    }

    // Verify the schema
    console.log('\n📊 Verifying enhanced user table structure...');
    const [allColumns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'users'
      AND table_schema = DATABASE()
      AND COLUMN_NAME IN ('deleted_at', 'deleted_by', 'deletion_reason', 'restored_at', 'restored_by')
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Enhanced deletion tracking columns:');
    allColumns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });

    console.log('\n🎉 User deletion schema enhancement completed successfully!');

  } catch (error) {
    console.error('❌ Schema enhancement failed:', error.message);
  } finally {
    await pool.end();
  }
}

enhanceUserDeletionSchema();