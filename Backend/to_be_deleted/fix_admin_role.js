const { pool } = require('./config/database/connection');

async function fixAdminRole() {
  try {
    console.log('🔄 Fixing admin user role...');

    // Update the role for the admin user
    const [result] = await pool.execute(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', 'admin@metroexecucare.com']
    );

    console.log('✅ Updated admin user role:', result);

    // Verify the change
    const [users] = await pool.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['admin@metroexecucare.com']
    );

    console.log('📊 Admin user details:');
    console.log(users[0]);

    console.log('🎉 Admin role fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing admin role:', error.message);
  } finally {
    await pool.end();
  }
}

fixAdminRole();