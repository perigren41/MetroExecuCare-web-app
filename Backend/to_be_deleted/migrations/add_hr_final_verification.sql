-- Migration script to add HR final verification stage to the workflow
-- Run this script to update database schema for 5-stage workflow

-- Add 'hr_final_verification' to checkup_requests.current_status ENUM
ALTER TABLE checkup_requests
MODIFY COLUMN current_status ENUM(
    'pending',
    'assigned_to_hr',
    'hr_processing',
    'benefits_review',
    'welfare_review',
    'hr_final_verification',  -- NEW: HR final document verification stage
    'approved',
    'rejected',
    'letter_generated',
    'letter_sent',
    'completed'
) DEFAULT 'pending';

-- Add 'hr_final_stage' to request_approvals.approval_stage ENUM
ALTER TABLE request_approvals
MODIFY COLUMN approval_stage ENUM(
    'hr_stage',
    'benefits_stage',
    'welfare_stage',
    'hr_final_stage'  -- NEW: HR final verification approval stage
) NOT NULL;

-- Verify the changes
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('checkup_requests', 'request_approvals')
  AND COLUMN_NAME IN ('current_status', 'approval_stage')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Show successful completion
SELECT 'Migration completed successfully: HR final verification stage added' AS result;