-- Migration: Add File Request System & Request Management Enhancement
-- Version: 1.3.0
-- Date: January 2025
-- Purpose: Enable approvers to request additional files from executives
--          and allow executives to manage their requests (edit/delete if unclaimed)

-- =============================================================================
-- STEP 1: Update checkup_requests table
-- =============================================================================

-- Add timestamp tracking for when each role was assigned/claimed the request
ALTER TABLE checkup_requests
ADD COLUMN assigned_hr_at TIMESTAMP NULL COMMENT 'When HR was assigned/claimed this request',
ADD COLUMN assigned_benefits_at TIMESTAMP NULL COMMENT 'When Benefits Officer was assigned/claimed this request',
ADD COLUMN assigned_welfare_at TIMESTAMP NULL COMMENT 'When Welfare Head was assigned/claimed this request';

-- Add indexes for performance
ALTER TABLE checkup_requests
ADD INDEX idx_assigned_hr_at (assigned_hr_at),
ADD INDEX idx_assigned_benefits_at (assigned_benefits_at),
ADD INDEX idx_assigned_welfare_at (assigned_welfare_at);

-- Note: We already have these fields from previous migrations:
-- - assigned_hr_id, assigned_benefits_id, assigned_welfare_id (for tracking who claimed)
-- - current_status (for workflow status)
-- - letter_purpose (for request purpose)
-- - selected_hospital_name, selected_hospital_address, selected_hospital_contact

-- =============================================================================
-- STEP 2: Create file_requests table
-- =============================================================================

-- This table tracks when approvers request additional files from executives
CREATE TABLE file_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL COMMENT 'Which checkup request this file request belongs to',
  requested_by INT NOT NULL COMMENT 'User ID of approver who requested files (HR/Benefits/Welfare)',
  requested_by_role ENUM('hr_personnel', 'benefits_officer', 'welfare_head') NOT NULL COMMENT 'Role of the person requesting files',
  message TEXT NOT NULL COMMENT 'Message to executive explaining what files are needed',
  status ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending' COMMENT 'Status of the file request',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the file request was created',
  fulfilled_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When the file request was fulfilled by executive',
  cancelled_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When the file request was cancelled',

  -- Indexes for performance
  INDEX idx_request_id (request_id),
  INDEX idx_requested_by (requested_by),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),

  -- Foreign key constraints
  FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='Tracks file requests from approvers to executives';

-- =============================================================================
-- STEP 3: Update request_files table
-- =============================================================================

-- Add field to link uploaded files to file requests (if file is a response)
ALTER TABLE request_files
ADD COLUMN file_request_id INT NULL COMMENT 'Links to file_requests table if this file is uploaded in response to a file request. NULL if initial submission.';

-- Add index and foreign key
ALTER TABLE request_files
ADD INDEX idx_file_request_id (file_request_id),
ADD FOREIGN KEY (file_request_id) REFERENCES file_requests(id) ON DELETE SET NULL;

-- Add submission_type field to distinguish initial vs additional files
ALTER TABLE request_files
ADD COLUMN submission_type ENUM('initial_submission', 'additional_requested') DEFAULT 'initial_submission'
COMMENT 'Whether this file was uploaded during initial request submission or as additional file later';

-- Update existing files to have correct submission_type
UPDATE request_files
SET submission_type = 'initial_submission'
WHERE submission_type IS NULL;

-- Note: Keep existing file_type field for medical categories
-- file_type ENUM('medical_records', 'prescription', 'lab_results', 'identification', 'other')
-- submission_type determines WHEN the file was uploaded
-- file_type determines WHAT TYPE of medical document it is

-- =============================================================================
-- STEP 4: Update notifications table to support file request notifications
-- =============================================================================

-- Check if notification_type needs updating
ALTER TABLE notifications
MODIFY COLUMN notification_type ENUM(
  'request_submitted',
  'request_assigned',
  'request_approved',
  'request_rejected',
  'request_updated',
  'reminder',
  'file_requested',        -- NEW: Approver requested files from executive
  'file_uploaded'          -- NEW: Executive uploaded requested files
) NOT NULL;

-- =============================================================================
-- STEP 5: Verification
-- =============================================================================

-- Display completion message
SELECT 'Migration completed successfully!' as status;

-- Display table stats
SELECT
  'checkup_requests' as table_name,
  COUNT(*) as total_records,
  COUNT(assigned_hr_id) as hr_assigned_count,
  COUNT(assigned_benefits_id) as benefits_assigned_count,
  COUNT(assigned_welfare_id) as welfare_assigned_count
FROM checkup_requests
UNION ALL
SELECT
  'file_requests' as table_name,
  COUNT(*) as total_records,
  NULL as hr_assigned_count,
  NULL as benefits_assigned_count,
  NULL as welfare_assigned_count
FROM file_requests
UNION ALL
SELECT
  'request_files' as table_name,
  COUNT(*) as total_records,
  COUNT(file_request_id) as files_from_requests,
  NULL as benefits_assigned_count,
  NULL as welfare_assigned_count
FROM request_files;

-- =============================================================================
-- NOTES FOR DEVELOPERS:
-- =============================================================================

-- EDITABILITY LOGIC (EXECUTIVE ONLY):
-- A request is editable by the executive (request owner) ONLY if:
--   assigned_hr_id IS NULL (HR has not claimed/assigned yet)
--
-- Once HR claims (assigned_hr_id is set), executive can:
--   - View request details
--   - Upload files in response to file requests
--   - Cannot edit request details
--   - Cannot delete request

-- FILE REQUEST FLOW:
-- 1. Approver creates file_request record (status = 'pending')
-- 2. Email sent to executive
-- 3. Executive uploads files (stored in request_files with file_request_id link)
-- 4. file_request status updated to 'fulfilled'
-- 5. Email sent to approver

-- SUBMISSION TYPE LOGIC:
-- submission_type = 'initial_submission' when:
--   - File uploaded during request creation
--   - file_request_id IS NULL
--
-- submission_type = 'additional_requested' when:
--   - File uploaded in response to file request
--   - file_request_id IS NOT NULL

-- EXAMPLE QUERIES:
--
-- Check if request is editable for executive:
--   SELECT assigned_hr_id IS NULL as is_editable FROM checkup_requests WHERE id = ?;
--
-- Get pending file requests for a request:
--   SELECT * FROM file_requests WHERE request_id = ? AND status = 'pending';
--
-- Get all files for a request (grouped by type):
--   SELECT submission_type, file_type, original_filename
--   FROM request_files
--   WHERE request_id = ?
--   ORDER BY submission_type, created_at;
--
-- Check if executive has active request:
--   SELECT id, request_type, current_status
--   FROM checkup_requests
--   WHERE employee_id = ?
--   AND current_status NOT IN ('approved', 'rejected', 'completed', 'deleted')
--   LIMIT 1;
