const fs = require('fs').promises;
const path = require('path');
const { pool, testConnection } = require('./connection');
const { createTablesManually } = require('./manual-schema');

async function initializeDatabase() {
  console.log('🔄 Initializing MetroExecuCare Database...');
  
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Create tables using manual approach (more reliable)
    await createTablesManually();
    
    console.log('✅ Database schema created successfully!');
    
    // Insert initial system settings
    await insertInitialData();
    
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

async function insertInitialData() {
  console.log('📝 Inserting initial data...');
  
  try {
    // Insert system settings
    const systemSettings = [
      ['max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'],
      ['allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png', 'Allowed file extensions for uploads'],
      ['request_processing_days', '15', 'Maximum days to process a request'],
      ['notification_enabled', 'true', 'Enable email notifications'],
      ['auto_assignment_enabled', 'true', 'Enable automatic HR assignment'],
      ['system_maintenance_mode', 'false', 'System maintenance mode flag']
    ];

    for (const [key, value, description] of systemSettings) {
      await pool.execute(
        'INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
        [key, value, description]
      );
    }

    // Insert sample hospitals (common accredited hospitals)
    const sampleHospitals = [
      [
        'St. Luke\'s Medical Center - Global City',
        '32nd Street and 5th Avenue, Bonifacio Global City',
        'Taguig City',
        '(02) 7789-7700',
        'info@stluke.com.ph'
      ],
      [
        'Makati Medical Center',
        '2 Amorsolo Street, Legaspi Village',
        'Makati City',
        '(02) 8888-8999',
        'info@makatimed.net.ph'
      ],
      [
        'Asian Hospital and Medical Center',
        '2205 Civic Drive, Filinvest Corporate City',
        'Muntinlupa City',
        '(02) 7771-9000',
        'info@asianhospital.com'
      ]
    ];

    for (const hospital of sampleHospitals) {
      await pool.execute(
        'INSERT IGNORE INTO hospitals (name, address, city, contact_number, email) VALUES (?, ?, ?, ?, ?)',
        hospital
      );
    }

    // Insert sample FAQs
    const sampleFAQs = [
      [
        'How long does it take to process my annual check-up request?',
        'Typically, requests are processed within 10-15 working days from submission to final approval.',
        'timeline'
      ],
      [
        'Can I request a specific hospital that\'s not on the accredited list?',
        'Yes, you can submit a special request for non-accredited hospitals. Additional approval may be required.',
        'special_requests'
      ],
      [
        'What documents do I need to upload with my request?',
        'You may need to upload supporting documents depending on your request type. The system will guide you through the required documents.',
        'file_uploads'
      ],
      [
        'How will I know the status of my request?',
        'You will receive email notifications at each stage of the approval process. You can also check your request status in the system.',
        'application_process'
      ]
    ];

    for (const [question, answer, category] of sampleFAQs) {
      await pool.execute(
        'INSERT IGNORE INTO faqs (question, answer, category, display_order) VALUES (?, ?, ?, ?)',
        [question, answer, category, 1]
      );
    }

    console.log('✅ Initial data inserted successfully!');

  } catch (error) {
    console.error('❌ Error inserting initial data:', error.message);
    throw error;
  }
}

// Function to reset database (use with caution!)
async function resetDatabase() {
  console.log('⚠️  RESETTING DATABASE - ALL DATA WILL BE LOST!');
  
  try {
    await createTablesManually();
    await insertInitialData();
    console.log('✅ Database reset completed!');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  insertInitialData,
  resetDatabase
};