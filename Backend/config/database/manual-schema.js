const { pool } = require('./connection');

async function createTablesManually() {
  console.log('🔄 Creating tables manually...');
  
  try {
    // Drop tables in reverse order due to foreign key constraints
    const dropQueries = [
      'DROP TABLE IF EXISTS activity_logs',
      'DROP TABLE IF EXISTS faqs',
      'DROP TABLE IF EXISTS system_settings',
      'DROP TABLE IF EXISTS notifications',
      'DROP TABLE IF EXISTS request_approvals',
      'DROP TABLE IF EXISTS request_assignments',
      'DROP TABLE IF EXISTS request_files',
      'DROP TABLE IF EXISTS checkup_requests',
      'DROP TABLE IF EXISTS hospitals',
      'DROP TABLE IF EXISTS users'
    ];

    console.log('📊 Dropping existing tables...');
    for (const query of dropQueries) {
      try {
        await pool.execute(query);
      } catch (error) {
        // Ignore "table doesn't exist" errors
        if (!error.message.includes("doesn't exist")) {
          throw error;
        }
      }
    }

    // Create users table
    await pool.execute(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        middle_name VARCHAR(50),
        role ENUM('executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin') NOT NULL,
        department VARCHAR(100),
        position VARCHAR(100),
        branch VARCHAR(100),
        contact_number VARCHAR(20),
        profile_picture VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_employee_id (employee_id),
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
      )
    `);
    console.log('✅ Users table created');

    // Create hospitals table
    await pool.execute(`
      CREATE TABLE hospitals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20),
        email VARCHAR(100),
        is_accredited BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name),
        INDEX idx_city (city),
        INDEX idx_is_accredited (is_accredited),
        INDEX idx_is_active (is_active)
      )
    `);
    console.log('✅ Hospitals table created');

    // Create checkup_requests table
    await pool.execute(`
      CREATE TABLE checkup_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        request_number VARCHAR(50) UNIQUE NOT NULL,
        employee_id INT NOT NULL,
        request_type ENUM('letter_of_approval', 'letter_of_authorization') NOT NULL,
        hospital_id INT,
        hospital_name VARCHAR(200),
        hospital_address TEXT,
        hospital_contact VARCHAR(20),
        hr_assigned_hospital_id INT,
        preferred_date DATE,
        letter_purpose TEXT,
        current_status ENUM('pending', 'assigned_to_hr', 'hr_processing', 'benefits_review', 'welfare_review', 'approved', 'rejected', 'letter_generated', 'letter_sent', 'completed') DEFAULT 'pending',
        priority_level ENUM('normal', 'urgent') DEFAULT 'normal',
        assigned_hr_id INT,
        assigned_at TIMESTAMP NULL,
        rejected_at TIMESTAMP NULL,
        rejection_reason TEXT,
        rejected_by INT,
        letter_generated_at TIMESTAMP NULL,
        letter_generated_by INT,
        letter_sent_at TIMESTAMP NULL,
        due_date DATE,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
        FOREIGN KEY (hr_assigned_hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_hr_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (letter_generated_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_request_number (request_number),
        INDEX idx_employee_id (employee_id),
        INDEX idx_current_status (current_status),
        INDEX idx_request_type (request_type),
        INDEX idx_created_at (created_at),
        INDEX idx_assigned_hr_id (assigned_hr_id)
      )
    `);
    console.log('✅ Checkup requests table created');

    // Create request_files table
    await pool.execute(`
      CREATE TABLE request_files (
        id INT PRIMARY KEY AUTO_INCREMENT,
        request_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        file_type VARCHAR(100),
        file_extension VARCHAR(10),
        file_category ENUM('supporting_document', 'letter_of_approval', 'letter_of_authorization', 'additional_document') NOT NULL,
        uploaded_by INT,
        generated_by INT,
        is_active BOOLEAN DEFAULT TRUE,
        is_sent_to_executive BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP NULL,
        access_token VARCHAR(255),
        expires_at TIMESTAMP NULL,
        download_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_request_id (request_id),
        INDEX idx_file_category (file_category),
        INDEX idx_is_active (is_active),
        INDEX idx_access_token (access_token)
      )
    `);
    console.log('✅ Request files table created');

    // Create request_assignments table
    await pool.execute(`
      CREATE TABLE request_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        request_id INT NOT NULL,
        hr_personnel_id INT NOT NULL,
        assigned_by INT NOT NULL,
        assignment_type ENUM('auto_assigned', 'manually_assigned', 'self_claimed') NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        completed_at TIMESTAMP NULL,
        reassigned_at TIMESTAMP NULL,
        reassigned_to INT,
        reassignment_reason TEXT,
        notes TEXT,
        
        FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (hr_personnel_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reassigned_to) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_request_id (request_id),
        INDEX idx_hr_personnel_id (hr_personnel_id),
        INDEX idx_is_active (is_active)
      )
    `);
    console.log('✅ Request assignments table created');

    // Create request_approvals table
    await pool.execute(`
      CREATE TABLE request_approvals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        request_id INT NOT NULL,
        approver_id INT NULL,
        approver_role ENUM('hr_personnel', 'benefits_officer', 'welfare_head') NOT NULL,
        approval_stage ENUM('hr_stage', 'benefits_stage', 'welfare_stage') NOT NULL,
        action ENUM('approved', 'rejected', 'pending', 'returned_for_revision') DEFAULT 'pending',
        comments TEXT,
        action_date TIMESTAMP NULL,
        is_current_stage BOOLEAN DEFAULT FALSE,
        stage_order INT NOT NULL,
        approved_hospital_id INT,
        approved_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
        
        INDEX idx_request_id (request_id),
        INDEX idx_approver_id (approver_id),
        INDEX idx_approval_stage (approval_stage),
        INDEX idx_action (action),
        INDEX idx_is_current_stage (is_current_stage)
      )
    `);
    console.log('✅ Request approvals table created');

    // Create notifications table
    await pool.execute(`
      CREATE TABLE notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        request_id INT,
        notification_type ENUM('request_submitted', 'request_assigned', 'hr_processing_started', 'hr_approved', 'benefits_review_started', 'benefits_approved', 'welfare_review_started', 'welfare_approved', 'request_approved_final', 'request_rejected', 'letter_generated', 'letter_sent_to_executive', 'file_uploaded', 'due_date_reminder', 'overdue_alert', 'request_completed') NOT NULL,
        recipient_email VARCHAR(100) NOT NULL,
        recipient_role VARCHAR(50),
        recipient_id INT,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        html_content TEXT,
        attached_file_ids JSON,
        status ENUM('pending', 'sent', 'failed', 'bounced', 'delivered') DEFAULT 'pending',
        sent_at TIMESTAMP NULL,
        delivery_status TEXT,
        error_message TEXT,
        retry_count INT DEFAULT 0,
        max_retries INT DEFAULT 3,
        gmail_message_id VARCHAR(255),
        gmail_thread_id VARCHAR(255),
        scheduled_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_request_id (request_id),
        INDEX idx_recipient_email (recipient_email),
        INDEX idx_notification_type (notification_type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Notifications table created');

    // Create system_settings table
    await pool.execute(`
      CREATE TABLE system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_setting_key (setting_key)
      )
    `);
    console.log('✅ System settings table created');

    // Create faqs table
    await pool.execute(`
      CREATE TABLE faqs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category ENUM('general', 'application_process', 'special_requests', 'letter_requests', 'timeline', 'medical_tests', 'hospitals', 'file_uploads') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        view_count INT DEFAULT 0,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_category (category),
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order)
      )
    `);
    console.log('✅ FAQs table created');

    // Create activity_logs table
    await pool.execute(`
      CREATE TABLE activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        request_id INT,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        old_values JSON,
        new_values JSON,
        file_id INT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (file_id) REFERENCES request_files(id) ON DELETE SET NULL,
        
        INDEX idx_request_id (request_id),
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Activity logs table created');

    console.log('🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

module.exports = {
  createTablesManually
};