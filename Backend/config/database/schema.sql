-- MetroExecuCare Database Schema
-- This file contains the complete database structure for the application

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS metroexecucare_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE metroexecucare_db;

-- Drop existing tables (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS request_approvals;
DROP TABLE IF EXISTS request_assignments;
DROP TABLE IF EXISTS request_files;
DROP TABLE IF EXISTS checkup_requests;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS users;

-- Create users table
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
  birth_date DATE,
  profile_picture VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL DEFAULT NULL,
  login_attempts INT DEFAULT 0,
  account_locked_until TIMESTAMP NULL DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,

  INDEX idx_employee_id (employee_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_department (department),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
);

-- Create hospitals table
CREATE TABLE hospitals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  contact_number VARCHAR(50),
  email VARCHAR(100),
  website VARCHAR(200),
  available_services JSON,
  operating_hours VARCHAR(100),
  accreditation_status ENUM('accredited', 'pending', 'suspended') DEFAULT 'accredited',
  accreditation_date DATE,
  accreditation_expiry DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_city (city),
  INDEX idx_accreditation_status (accreditation_status),
  INDEX idx_is_active (is_active)
);

-- Create checkup_requests table
CREATE TABLE checkup_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  employee_number VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20),
  birth_date DATE,
  request_type ENUM('annual_checkup', 'special_checkup', 'medical_clearance') NOT NULL DEFAULT 'annual_checkup',
  hospital_id INT,
  hospital_name VARCHAR(200),
  preferred_date DATE,
  alternative_date DATE,
  medical_history TEXT,
  current_medications TEXT,
  special_instructions TEXT,
  status ENUM('pending', 'assigned', 'processing', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  completion_date TIMESTAMP NULL DEFAULT NULL,
  assigned_hr_id INT,
  assigned_hr_first_name VARCHAR(50),
  assigned_hr_last_name VARCHAR(50),
  assigned_benefits_id INT,
  assigned_benefits_first_name VARCHAR(50),
  assigned_benefits_last_name VARCHAR(50),
  assigned_welfare_id INT,
  assigned_welfare_first_name VARCHAR(50),
  assigned_welfare_last_name VARCHAR(50),
  rejection_reason TEXT,
  admin_notes TEXT,
  hr_notes TEXT,
  benefits_notes TEXT,
  welfare_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_employee_id (employee_id),
  INDEX idx_employee_number (employee_number),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_submission_date (submission_date),
  INDEX idx_due_date (due_date),
  INDEX idx_assigned_hr_id (assigned_hr_id),
  INDEX idx_assigned_benefits_id (assigned_benefits_id),
  INDEX idx_assigned_welfare_id (assigned_welfare_id),
  INDEX idx_hospital_id (hospital_id),

  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_hr_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_benefits_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_welfare_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create request_files table
CREATE TABLE request_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_type ENUM('medical_records', 'prescription', 'lab_results', 'identification', 'other') DEFAULT 'other',
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_request_id (request_id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_file_type (file_type),

  FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create request_assignments table
CREATE TABLE request_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  assigned_to INT NOT NULL,
  assigned_by INT NOT NULL,
  assignment_type ENUM('hr_personnel', 'benefits_officer', 'welfare_head') NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assignment_notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  INDEX idx_request_id (request_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_assigned_by (assigned_by),
  INDEX idx_assignment_type (assignment_type),

  FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create request_approvals table
CREATE TABLE request_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  approver_id INT NOT NULL,
  approval_stage ENUM('hr_review', 'benefits_approval', 'welfare_approval', 'final_approval') NOT NULL,
  action ENUM('approved', 'rejected', 'returned') NOT NULL,
  approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comments TEXT,
  rejection_reason TEXT,
  approval_duration_days INT,

  INDEX idx_request_id (request_id),
  INDEX idx_approver_id (approver_id),
  INDEX idx_approval_stage (approval_stage),
  INDEX idx_action (action),
  INDEX idx_approval_date (approval_date),

  FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT,
  user_id INT,
  notification_type ENUM('request_submitted', 'request_assigned', 'request_approved', 'request_rejected', 'request_updated', 'reminder') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP NULL DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_request_id (request_id),
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),

  FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create system_settings table
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,

  INDEX idx_setting_key (setting_key),

  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create faqs table
CREATE TABLE faqs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,

  INDEX idx_category (category),
  INDEX idx_display_order (display_order),
  INDEX idx_is_active (is_active),

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create activity_logs table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_created_at (created_at),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert initial system settings
INSERT INTO system_settings (setting_key, setting_value, description, setting_type) VALUES
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'number'),
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png', 'Allowed file extensions for uploads', 'string'),
('request_processing_days', '15', 'Maximum days to process a request', 'number'),
('notification_enabled', 'true', 'Enable email notifications', 'boolean'),
('auto_assignment_enabled', 'true', 'Enable automatic HR assignment', 'boolean'),
('system_maintenance_mode', 'false', 'System maintenance mode flag', 'boolean');

-- Insert sample hospitals
INSERT INTO hospitals (name, address, city, contact_number, email, available_services, operating_hours) VALUES
('St. Luke''s Medical Center - Global City', '32nd Street and 5th Avenue, Bonifacio Global City', 'Taguig City', '(02) 7789-7700', 'info@stluke.com.ph', '{"executive_checkup": true, "laboratory": true, "imaging": true}', '24/7'),
('Makati Medical Center', '2 Amorsolo Street, Legaspi Village', 'Makati City', '(02) 8888-8999', 'info@makatimed.net.ph', '{"executive_checkup": true, "laboratory": true, "imaging": true}', '24/7'),
('Asian Hospital and Medical Center', '2205 Civic Drive, Filinvest Corporate City', 'Muntinlupa City', '(02) 7771-9000', 'info@asianhospital.com', '{"executive_checkup": true, "laboratory": true, "imaging": true}', '24/7');

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
('How long does it take to process my annual check-up request?', 'Typically, requests are processed within 10-15 working days from submission to final approval.', 'timeline', 1),
('Can I request a specific hospital that''s not on the accredited list?', 'Yes, you can submit a special request for non-accredited hospitals. Additional approval may be required.', 'special_requests', 2),
('What documents do I need to upload with my request?', 'You may need to upload supporting documents depending on your request type. The system will guide you through the required documents.', 'file_uploads', 3),
('How will I know the status of my request?', 'You will receive email notifications at each stage of the approval process. You can also check your request status in the system.', 'application_process', 4);

-- Create default admin user (password: admin123 - change this immediately!)
INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role, department, position, is_active) VALUES
('ADMIN001', 'admin@metroexecucare.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'admin', 'IT', 'System Administrator', TRUE);

-- Display completion message
SELECT 'Database schema created successfully!' as message;