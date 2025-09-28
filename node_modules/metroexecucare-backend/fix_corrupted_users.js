const { pool } = require('./config/database/connection');
require('dotenv').config();

async function fixCorruptedUsers() {
  let connection;
  try {
    // Create connection to database
    connection = await pool;

    console.log('🔄 Starting corrupted user data cleanup...');

    // Find all users with corrupted emails (containing 'deleted_' prefix)
    const [corruptedUsers] = await connection.execute(`
      SELECT id, email, is_active, deleted_at, deleted_by, deletion_reason
      FROM users
      WHERE email LIKE 'deleted_%'
      ORDER BY id
    `);

    console.log(`\n📊 Found ${corruptedUsers.length} users with corrupted emails`);

    if (corruptedUsers.length === 0) {
      console.log('✅ No corrupted users found - database is clean!');
      return;
    }

    // Display corrupted users
    console.log('\n🔍 Corrupted users:');
    corruptedUsers.forEach(user => {
      console.log(`- ID ${user.id}: ${user.email} (active: ${user.is_active})`);
    });

    // Fix each corrupted user
    let fixedCount = 0;
    for (const user of corruptedUsers) {
      try {
        // Extract original email by removing all 'deleted_' prefixes
        let originalEmail = user.email;

        // Remove all instances of 'deleted_TIMESTAMP_' pattern
        originalEmail = originalEmail.replace(/deleted_\d+_/g, '');

        console.log(`\n🔧 Fixing user ID ${user.id}:`);
        console.log(`   From: ${user.email}`);
        console.log(`   To:   ${originalEmail}`);

        // Check if the original email is already taken by an active user
        const [emailCheck] = await connection.execute(
          'SELECT id FROM users WHERE email = ? AND id != ? AND is_active = 1',
          [originalEmail, user.id]
        );

        if (emailCheck.length > 0) {
          console.log(`   ❌ Cannot restore - email ${originalEmail} is taken by user ID ${emailCheck[0].id}`);
          continue;
        }

        // Update the user record
        await connection.execute(`
          UPDATE users SET
            email = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [originalEmail, user.id]);

        fixedCount++;
        console.log(`   ✅ Fixed user ID ${user.id}`);

      } catch (error) {
        console.error(`   ❌ Error fixing user ID ${user.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Cleanup completed! Fixed ${fixedCount} out of ${corruptedUsers.length} users.`);

    // Show final status
    const [finalUsers] = await connection.execute(`
      SELECT id, email, is_active, deleted_at, deleted_by, deletion_reason
      FROM users
      WHERE is_active = 0
      ORDER BY id
    `);

    console.log(`\n📋 Final status: ${finalUsers.length} inactive users`);
    finalUsers.forEach(user => {
      console.log(`- ID ${user.id}: ${user.email} (deleted_at: ${user.deleted_at ? 'SET' : 'NULL'})`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }
}

// Run the script
fixCorruptedUsers();