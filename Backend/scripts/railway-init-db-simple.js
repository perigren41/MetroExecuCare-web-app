/**
 * Simple Railway Database Initialization Script
 * This script initializes the database using the existing manual-schema function
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  console.log('🚀 Starting Railway Database Initialization...\n');

  try {
    // Import the schema creation function
    const { createTablesManually } = require('../config/database/manual-schema');
    const { pool } = require('../config/database/connection');

    console.log('📋 Database Configuration:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}\n`);

    // Create all tables
    console.log('🔨 Creating database tables...');
    await createTablesManually();
    console.log('✅ All tables created successfully!\n');

    // Seed initial data
    console.log('🌱 Seeding initial data...\n');

    // 1. System Settings
    console.log('   📝 Inserting system settings...');
    await pool.execute(`
      INSERT INTO system_settings (setting_key, setting_value, description) VALUES
      ('app_name', 'MetroExecuCare', 'Application name'),
      ('app_version', '1.3.0', 'Current application version'),
      ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
      ('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
      ('allowed_file_types', 'pdf', 'Comma-separated list of allowed file extensions'),
      ('email_notifications_enabled', 'true', 'Enable/disable email notifications'),
      ('session_timeout', '3600', 'Session timeout in seconds (1 hour)')
    `);
    console.log('   ✅ System settings inserted');

    // 2. Hospitals
    console.log('   🏥 Inserting hospitals...');
    await pool.execute(`
      INSERT INTO hospitals (name, address, city, contact_number, is_active) VALUES
      ('Metro Manila General Hospital', '123 Main Street, Manila', 'Manila', '(02) 1234-5678', 1),
      ('Makati Medical Center', '456 Ayala Avenue, Makati', 'Makati', '(02) 8888-8999', 1),
      ('St. Luke\\'s Medical Center', '279 E Rodriguez Sr. Ave, Quezon City', 'Quezon City', '(02) 7230-0101', 1),
      ('The Medical City', 'Ortigas Avenue, Pasig City', 'Pasig', '(02) 8988-1000', 1),
      ('Philippine General Hospital', 'Taft Avenue, Manila', 'Manila', '(02) 554-8400', 1)
    `);
    console.log('   ✅ Hospitals inserted');

    // 3. FAQs
    console.log('   ❓ Inserting FAQs...');
    await pool.execute(`
      INSERT INTO faqs (question, answer, category, display_order) VALUES
      ('What is MetroExecuCare?', 'MetroExecuCare is an executive health checkup management system for Metrobank employees.', 'general', 1),
      ('How do I request a checkup?', 'Log in to your account, go to the dashboard, and click on either "Request Letter of Approval" or "Request Letter of Authorization".', 'application_process', 2),
      ('What is the difference between Letter of Approval and Letter of Authorization?', 'Letter of Approval is for pre-approved checkups at partner hospitals. Letter of Authorization is for checkups at non-partner hospitals requiring special authorization.', 'letter_requests', 3),
      ('How long does it take to process my request?', 'Typically 3-5 business days, depending on the current workload and approval stages.', 'timeline', 4),
      ('Who can I contact for support?', 'Contact the HR department or email metroexecucare@gmail.com for assistance.', 'general', 5)
    `);
    console.log('   ✅ FAQs inserted');

    // 4. Create default users
    console.log('   👥 Creating default users...');

    // Admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    await pool.execute(`
      INSERT INTO users (
        employee_id, email, password_hash, first_name, last_name,
        role, department, contact_number, is_active
      ) VALUES (
        'ADMIN001', 'admin@metroexecucare.com', ?,
        'System', 'Administrator', 'admin', 'IT Department',
        '09171234567', 1
      )
    `, [adminPassword]);
    console.log('   ✅ Admin user created');

    // HR user
    const hrPassword = await bcrypt.hash('HR@123', 10);
    await pool.execute(`
      INSERT INTO users (
        employee_id, email, password_hash, first_name, last_name,
        role, department, contact_number, is_active
      ) VALUES (
        'HR001', 'hr@metroexecucare.com', ?,
        'HR', 'Personnel', 'hr_personnel', 'Human Resources',
        '09171234568', 1
      )
    `, [hrPassword]);
    console.log('   ✅ HR user created');

    // Benefits Officer
    const benefitsPassword = await bcrypt.hash('Benefits@123', 10);
    await pool.execute(`
      INSERT INTO users (
        employee_id, email, password_hash, first_name, last_name,
        role, department, contact_number, is_active
      ) VALUES (
        'BEN001', 'benefits@metroexecucare.com', ?,
        'Benefits', 'Officer', 'benefits_officer', 'Benefits & Services',
        '09171234569', 1
      )
    `, [benefitsPassword]);
    console.log('   ✅ Benefits Officer created');

    // Welfare Head
    const welfarePassword = await bcrypt.hash('Welfare@123', 10);
    await pool.execute(`
      INSERT INTO users (
        employee_id, email, password_hash, first_name, last_name,
        role, department, contact_number, is_active
      ) VALUES (
        'WEL001', 'welfare@metroexecucare.com', ?,
        'Welfare', 'Head', 'welfare_head', 'Welfare & Recreation',
        '09171234570', 1
      )
    `, [welfarePassword]);
    console.log('   ✅ Welfare Head created');

    // Executive user
    const executivePassword = await bcrypt.hash('Executive@123', 10);
    await pool.execute(`
      INSERT INTO users (
        employee_id, email, password_hash, first_name, last_name,
        role, department, contact_number, is_active
      ) VALUES (
        'EXE001', 'executive@metroexecucare.com', ?,
        'John', 'Doe', 'executive', 'Management',
        '09171234571', 1
      )
    `, [executivePassword]);
    console.log('   ✅ Executive user created');

    console.log('\n✅ Database initialization completed successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📝 Default User Accounts Created:');
    console.log('═══════════════════════════════════════════════════');
    console.log('   Admin:     admin@metroexecucare.com     / Admin@123');
    console.log('   HR:        hr@metroexecucare.com        / HR@123');
    console.log('   Benefits:  benefits@metroexecucare.com  / Benefits@123');
    console.log('   Welfare:   welfare@metroexecucare.com   / Welfare@123');
    console.log('   Executive: executive@metroexecucare.com / Executive@123');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Change these passwords immediately after first login!\n');

    // Close the pool
    await pool.end();
    console.log('🔌 Database connection closed\n');

  } catch (error) {
    console.error('\n💥 Fatal error during initialization:', error);
    process.exit(1);
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 All done! Your Railway database is ready to use.\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
