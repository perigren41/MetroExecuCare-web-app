const bcrypt = require('bcryptjs');
const { pool } = require('../config/database/connection');

// Create initial admin user and sample users
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if admin already exists
    const [existingAdmin] = await pool.execute(
      'SELECT id FROM users WHERE role = ? AND email = ?',
      ['admin', 'admin@metroexecucare.com']
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists, skipping seeding...');
      return;
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('MetroAdmin123!', 12);
    const hrPassword = await bcrypt.hash('HRPassword123!', 12);
    const benefitsPassword = await bcrypt.hash('BenefitsPass123!', 12);
    const welfarePassword = await bcrypt.hash('WelfarePass123!', 12);
    const executivePassword = await bcrypt.hash('ExecPass123!', 12);

    // Create sample users
    const usersToCreate = [
      {
        employee_id: '100001',
        email: 'admin@metroexecucare.com',
        password: adminPassword,
        first_name: 'Metro',
        last_name: 'Administrator',
        middle_name: 'Bank',
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        phone: '+63-917-123-4567',
        is_active: 1
      },
      {
        employee_id: '200001',
        email: 'hr.manager@metroexecucare.com',
        password: hrPassword,
        first_name: 'Maria',
        last_name: 'Santos',
        middle_name: 'Cruz',
        role: 'hr_personnel',
        department: 'Human Resources',
        position: 'HR Manager',
        phone: '+63-917-234-5678',
        is_active: 1
      },
      {
        employee_id: '300001',
        email: 'benefits.officer@metroexecucare.com',
        password: benefitsPassword,
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        middle_name: 'Lopez',
        role: 'benefits_officer',
        department: 'Human Resources',
        position: 'Benefits Officer',
        phone: '+63-917-345-6789',
        is_active: 1
      },
      {
        employee_id: '400001',
        email: 'welfare.head@metroexecucare.com',
        password: welfarePassword,
        first_name: 'Ana',
        last_name: 'Rodriguez',
        middle_name: 'Gomez',
        role: 'welfare_head',
        department: 'Executive',
        position: 'Welfare Head',
        phone: '+63-917-456-7890',
        is_active: 1
      },
      {
        employee_id: '500001',
        email: 'john.executive@metroexecucare.com',
        password: executivePassword,
        first_name: 'John',
        last_name: 'Garcia',
        middle_name: 'Martinez',
        role: 'executive',
        department: 'Marketing',
        position: 'Marketing Director',
        phone: '+63-917-567-8901',
        is_active: 1
      },
      {
        employee_id: '500002',
        email: 'lisa.executive@metroexecucare.com',
        password: executivePassword,
        first_name: 'Lisa',
        last_name: 'Fernandez',
        middle_name: 'Sanchez',
        role: 'executive',
        department: 'Finance',
        position: 'Finance Manager',
        phone: '+63-917-678-9012',
        is_active: 1
      }
    ];

    // Insert users
    const insertQuery = `
      INSERT INTO users (
        employee_id, email, password_hash, first_name, last_name, middle_name, role, 
        department, position, contact_number, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    for (const user of usersToCreate) {
      await pool.execute(insertQuery, [
        user.employee_id,
        user.email,
        user.password,
        user.first_name,
        user.last_name,
        user.middle_name,
        user.role,
        user.department,
        user.position,
        user.phone,
        user.is_active
      ]);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@metroexecucare.com / MetroAdmin123!');
    console.log('HR Manager: hr.manager@metroexecucare.com / HRPassword123!');
    console.log('Benefits Officer: benefits.officer@metroexecucare.com / BenefitsPass123!');
    console.log('Welfare Head: welfare.head@metroexecucare.com / WelfarePass123!');
    console.log('Executive 1: john.executive@metroexecucare.com / ExecPass123!');
    console.log('Executive 2: lisa.executive@metroexecucare.com / ExecPass123!');

  } catch (error) {
    console.error('❌ Database seeding error:', error);
    throw error;
  }
};

// Function to reset database (for development only)
const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Delete all users except preserve any existing data you want to keep
    await pool.execute('DELETE FROM users WHERE email LIKE "%@metroexecucare.com"');
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset error:', error);
    throw error;
  }
};

// Export functions
module.exports = {
  seedDatabase,
  resetDatabase
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding process failed:', error);
      process.exit(1);
    });
}