-- Rollback: Remove File Request System & Request Management Enhancement
-- Version: 1.3.0 Rollback
-- Date: January 2025
-- Purpose: Rollback changes if needed

-- =============================================================================
-- STEP 1: Remove foreign keys (must be done first)
-- =============================================================================

-- Remove foreign key from request_files to file_requests
ALTER TABLE request_files
DROP FOREIGN KEY request_files_ibfk_4;

-- =============================================================================
-- STEP 2: Drop file_requests table
-- =============================================================================

DROP TABLE IF EXISTS file_requests;

-- =============================================================================
-- STEP 3: Remove added columns from request_files
-- =============================================================================

ALTER TABLE request_files
DROP COLUMN file_request_id,
DROP COLUMN submission_type;

-- =============================================================================
-- STEP 4: Remove added columns from checkup_requests
-- =============================================================================

ALTER TABLE checkup_requests
DROP COLUMN assigned_hr_at,
DROP COLUMN assigned_benefits_at,
DROP COLUMN assigned_welfare_at;

-- =============================================================================
-- STEP 5: Revert notifications table
-- =============================================================================

ALTER TABLE notifications
MODIFY COLUMN notification_type ENUM(
  'request_submitted',
  'request_assigned',
  'request_approved',
  'request_rejected',
  'request_updated',
  'reminder'
) NOT NULL;

-- =============================================================================
-- STEP 6: Verification
-- =============================================================================

SELECT 'Rollback completed successfully!' as status;
SELECT 'All file request system changes have been reverted.' as message;
