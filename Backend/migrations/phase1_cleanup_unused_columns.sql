-- ============================================================================
-- PHASE 1: Cleanup Unused Columns
-- ============================================================================
-- Purpose: Remove unused columns from notifications and request_assignments tables
-- Risk: VERY LOW (these columns are never used in production code)
-- Estimated Time: 30 seconds
-- Rollback: Can restore from backup tables
-- ============================================================================

-- Step 1: Create backups
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications_backup_phase1 AS SELECT * FROM notifications;
CREATE TABLE IF NOT EXISTS request_assignments_backup_phase1 AS SELECT * FROM request_assignments;

SELECT 'Backup tables created successfully' AS status;

-- Step 2: Verify current columns
-- ============================================================================
SELECT 'Current notifications columns:' AS info;
DESCRIBE notifications;

SELECT 'Current request_assignments columns:' AS info;
DESCRIBE request_assignments;

-- Step 3: Drop unused columns from notifications table
-- ============================================================================
SELECT 'Dropping 7 unused columns from notifications table...' AS status;

ALTER TABLE notifications
  DROP COLUMN IF EXISTS attached_file_ids,
  DROP COLUMN IF EXISTS delivery_status,
  DROP COLUMN IF EXISTS sent_at,
  DROP COLUMN IF EXISTS retry_count,
  DROP COLUMN IF EXISTS max_retries,
  DROP COLUMN IF EXISTS gmail_thread_id,
  DROP COLUMN IF EXISTS scheduled_at,
  DROP COLUMN IF EXISTS recipient_role;

SELECT 'notifications table updated successfully' AS status;

-- Step 4: Drop unused columns from request_assignments table
-- ============================================================================
SELECT 'Dropping 4 unused columns from request_assignments table...' AS status;

ALTER TABLE request_assignments
  DROP COLUMN IF EXISTS completed_at,
  DROP COLUMN IF EXISTS reassigned_at,
  DROP COLUMN IF EXISTS reassigned_to,
  DROP COLUMN IF EXISTS reassignment_reason;

SELECT 'request_assignments table updated successfully' AS status;

-- Step 5: Verify changes
-- ============================================================================
SELECT 'Updated notifications columns:' AS info;
DESCRIBE notifications;

SELECT 'Updated request_assignments columns:' AS info;
DESCRIBE request_assignments;

-- Step 6: Verify row counts (should be unchanged)
-- ============================================================================
SELECT
  'notifications' AS table_name,
  COUNT(*) AS row_count
FROM notifications
UNION ALL
SELECT
  'notifications_backup' AS table_name,
  COUNT(*) AS row_count
FROM notifications_backup_phase1
UNION ALL
SELECT
  'request_assignments' AS table_name,
  COUNT(*) AS row_count
FROM request_assignments
UNION ALL
SELECT
  'request_assignments_backup' AS table_name,
  COUNT(*) AS row_count
FROM request_assignments_backup_phase1;

-- ============================================================================
-- PHASE 1 COMPLETE
-- ============================================================================
SELECT '✅ Phase 1 completed successfully!' AS status;
SELECT 'notifications: Removed 7 unused columns' AS result;
SELECT 'request_assignments: Removed 4 unused columns' AS result;