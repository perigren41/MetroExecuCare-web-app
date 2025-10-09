/**
 * Railway Database Initialization Script
 * This script initializes the database with the complete schema and seed data
 * Run this ONCE after creating the MySQL database in Railway
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  let connection;

  try {
    console.log('🔄 Connecting to Railway MySQL database...');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || process.env.MYSQLHOST,
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      user: process.env.DB_USER || process.env.MYSQLUSER,
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
      database: process.env.DB_NAME || process.env.MYSQLDATABASE,
      multipleStatements: true
    });

    console.log('✅ Connected to database');
    console.log(`📦 Database: ${process.env.DB_NAME || process.env.MYSQLDATABASE}`);

    // Check if tables already exist
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.DB_NAME || process.env.MYSQLDATABASE]
    );

    if (tables.length > 0) {
      console.log('⚠️  Database already has tables:', tables.map(t => t.TABLE_NAME).join(', '));
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        readline.question('Do you want to DROP all tables and reinitialize? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Initialization cancelled');
        process.exit(0);
      }

      // Drop all tables
      console.log('🗑️  Dropping existing tables...');
      for (const table of tables) {
        await connection.execute(`DROP TABLE IF EXISTS ${table.TABLE_NAME}`);
      }
      console.log('✅ All tables dropped');
    }

    console.log('📋 Creating database schema...');

    // Read and execute manual schema
    const fs = require('fs').promises;
    const path = require('path');
    const schemaPath = path.join(__dirname, '..', 'config', 'database', 'manual-schema.js');

    // Load schema
    const schema = require(schemaPath);

    // Execute schema creation
    console.log('🔨 Creating tables...');
    for (const tableName in schema.tables) {
      const tableSQL = schema.tables[tableName];
      await connection.execute(tableSQL);
      console.log(`   ✓ Created table: ${tableName}`);
    }

    console.log('✅ All tables created successfully');

    // Seed initial data
    console.log('🌱 Seeding initial data...');

    // 1. System Settings
    await connection.execute(`
      INSERT INTO system_settings (setting_key, setting_value, description) VALUES
      ('app_name', 'MetroExecuCare', 'Application name'),
      ('app_version', '1.3.0', 'Current application version'),
      ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
      ('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
      ('allowed_file_types', 'pdf', 'Comma-separated list of allowed file extensions'),
      ('email_notifications_enabled', 'true', 'Enable/disable email notifications'),
      ('session_timeout', '3600', 'Session timeout in seconds (1 hour)')
    `);
    console.log('   ✓ System settings inserted');

    // 2. Hospitals
    await connection.execute(`
      INSERT INTO hospitals (name, address, contact_number, is_active) VALUES
      ('Metro Manila General Hospital', '123 Main Street, Manila', '(02) 1234-5678', 1),
      ('Makati Medical Center', '456 Ayala Avenue, Makati', '(02) 8888-8999', 1),
      ('St. Luke\\'s Medical Center', '279 E Rodriguez Sr. Ave, Quezon City', '(02) 7230-0101', 1),
      ('The Medical City', 'Ortigas Avenue, Pasig City', '(02) 8988-1000', 1),
      ('Philippine General Hospital', 'Taft Avenue, Manila', '(02) 554-8400', 1)
    `);
    console.log('   ✓ Hospitals inserted');

    // 3. FAQs
    await connection.execute(`
      INSERT INTO faqs (question, answer, category, display_order) VALUES
      ('What is MetroExecuCare?', 'MetroExecuCare is an executive health checkup management system for Metrobank employees.', 'general', 1),
      ('How do I request a checkup?', 'Log in to your account, go to the dashboard, and click on either "Request Letter of Approval" or "Request Letter of Authorization".', 'requests', 2),
      ('What is the difference between Letter of Approval and Letter of Authorization?', 'Letter of Approval is for pre-approved checkups at partner hospitals. Letter of Authorization is for checkups at non-partner hospitals requiring special authorization.', 'requests', 3),
      ('How long does it take to process my request?', 'Typically 3-5 business days, depending on the current workload and approval stages.', 'processing', 4),
      ('Who can I contact for support?', 'Contact the HR department or email metroexecucare@gmail.com for assistance.', 'support', 5)
    `);
    console.log('   ✓ FAQs inserted');

    // 4. Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    await connection.execute(`
      INSERT INTO users (
        employee_id, email, password, first_name, last_name,
        role, department, contact_number, is_active, email_verified
      ) VALUES (
        'ADMIN001', 'admin@metroexecucare.com', ?,
        'System', 'Administrator', 'admin', 'IT Department',
        '09171234567', 1, 1
      )
    `, [adminPassword]);
    console.log('   ✓ Admin user created (email: admin@metroexecucare.com, password: Admin@123)');

    // 5. Create sample HR user
    const hrPassword = await bcrypt.hash('HR@123', 10);
    await connection.execute(`
      INSERT INTO users (
        employee_id, email, password, first_name, last_name,
        role, department, contact_number, is_active, email_verified
      ) VALUES (
        'HR001', 'hr@metroexecucare.com', ?,
        'HR', 'Personnel', 'hr_personnel', 'Human Resources',
        '09171234568', 1, 1
      )
    `, [hrPassword]);
    console.log('   ✓ HR user created (email: hr@metroexecucare.com, password: HR@123)');

    // 6. Create sample Benefits Officer
    const benefitsPassword = await bcrypt.hash('Benefits@123', 10);
    await connection.execute(`
      INSERT INTO users (
        employee_id, email, password, first_name, last_name,
        role, department, contact_number, is_active, email_verified
      ) VALUES (
        'BEN001', 'benefits@metroexecucare.com', ?,
        'Benefits', 'Officer', 'benefits_officer', 'Benefits & Services',
        '09171234569', 1, 1
      )
    `, [benefitsPassword]);
    console.log('   ✓ Benefits Officer created (email: benefits@metroexecucare.com, password: Benefits@123)');

    // 7. Create sample Welfare Head
    const welfarePassword = await bcrypt.hash('Welfare@123', 10);
    await connection.execute(`
      INSERT INTO users (
        employee_id, email, password, first_name, last_name,
        role, department, contact_number, is_active, email_verified
      ) VALUES (
        'WEL001', 'welfare@metroexecucare.com', ?,
        'Welfare', 'Head', 'welfare_head', 'Welfare & Recreation',
        '09171234570', 1, 1
      )
    `, [welfarePassword]);
    console.log('   ✓ Welfare Head created (email: welfare@metroexecucare.com, password: Welfare@123)');

    // 8. Create sample Executive user
    const executivePassword = await bcrypt.hash('Executive@123', 10);
    await connection.execute(`
      INSERT INTO users (
        employee_id, email, password, first_name, last_name,
        role, department, contact_number, is_active, email_verified
      ) VALUES (
        'EXE001', 'executive@metroexecucare.com', ?,
        'John', 'Doe', 'executive', 'Management',
        '09171234571', 1, 1
      )
    `, [executivePassword]);
    console.log('   ✓ Executive user created (email: executive@metroexecucare.com, password: Executive@123)');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📝 Default User Accounts Created:');
    console.log('   Admin:     admin@metroexecucare.com     / Admin@123');
    console.log('   HR:        hr@metroexecucare.com        / HR@123');
    console.log('   Benefits:  benefits@metroexecucare.com  / Benefits@123');
    console.log('   Welfare:   welfare@metroexecucare.com   / Welfare@123');
    console.log('   Executive: executive@metroexecucare.com / Executive@123');
    console.log('\n⚠️  IMPORTANT: Change these passwords immediately after first login!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n🎉 All done! Your database is ready to use.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during initialization:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
