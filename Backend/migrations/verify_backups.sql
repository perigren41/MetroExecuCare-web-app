-- Verify Backup Tables After Migration
-- Run this script after executing Phase 1 and/or Phase 2 migrations
-- to confirm that backup tables were created successfully

-- ============================================================================
-- PHASE 1 BACKUP VERIFICATION
-- ============================================================================

-- Check if Phase 1 backup tables exist
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    DATA_LENGTH,
    INDEX_LENGTH,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('notifications_backup_phase1', 'request_assignments_backup_phase1')
ORDER BY TABLE_NAME;

-- Verify notifications backup record count
SELECT
    'notifications_backup_phase1' as backup_table,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM notifications_backup_phase1;

-- Verify request_assignments backup record count
SELECT
    'request_assignments_backup_phase1' as backup_table,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM request_assignments_backup_phase1;

-- Compare record counts: Production vs Backup (Phase 1)
SELECT
    'notifications' as table_comparison,
    (SELECT COUNT(*) FROM notifications) as current_production_count,
    (SELECT COUNT(*) FROM notifications_backup_phase1) as backup_count,
    CASE
        WHEN (SELECT COUNT(*) FROM notifications) = (SELECT COUNT(*) FROM notifications_backup_phase1)
        THEN '✅ MATCH'
        ELSE '⚠️ MISMATCH'
    END as status;

SELECT
    'request_assignments' as table_comparison,
    (SELECT COUNT(*) FROM request_assignments) as current_production_count,
    (SELECT COUNT(*) FROM request_assignments_backup_phase1) as backup_count,
    CASE
        WHEN (SELECT COUNT(*) FROM request_assignments) = (SELECT COUNT(*) FROM request_assignments_backup_phase1)
        THEN '✅ MATCH'
        ELSE '⚠️ MISMATCH'
    END as status;

-- Show sample records from Phase 1 backups
SELECT 'Sample from notifications_backup_phase1' as info;
SELECT * FROM notifications_backup_phase1 LIMIT 3;

SELECT 'Sample from request_assignments_backup_phase1' as info;
SELECT * FROM request_assignments_backup_phase1 LIMIT 3;

-- ============================================================================
-- PHASE 2 BACKUP VERIFICATION
-- ============================================================================

-- Check if Phase 2 backup table exists
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    DATA_LENGTH,
    INDEX_LENGTH,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'checkup_requests_backup_phase2';

-- Verify checkup_requests backup record count
SELECT
    'checkup_requests_backup_phase2' as backup_table,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record,
    COUNT(hospital_id) as records_with_hospital_id,
    COUNT(hospital_name) as records_with_hospital_name,
    COUNT(hospital_address) as records_with_hospital_address,
    COUNT(hospital_contact) as records_with_hospital_contact
FROM checkup_requests_backup_phase2;

-- Compare record counts: Production vs Backup (Phase 2)
SELECT
    'checkup_requests' as table_comparison,
    (SELECT COUNT(*) FROM checkup_requests) as current_production_count,
    (SELECT COUNT(*) FROM checkup_requests_backup_phase2) as backup_count,
    CASE
        WHEN (SELECT COUNT(*) FROM checkup_requests) = (SELECT COUNT(*) FROM checkup_requests_backup_phase2)
        THEN '✅ MATCH'
        ELSE '⚠️ MISMATCH'
    END as status;

-- Show sample records from Phase 2 backup with hospital data
SELECT 'Sample from checkup_requests_backup_phase2 (showing hospital fields)' as info;
SELECT
    id,
    request_number,
    request_type,
    hospital_id,
    hospital_name,
    hospital_address,
    hospital_contact,
    hr_assigned_hospital_id,
    created_at
FROM checkup_requests_backup_phase2
LIMIT 5;

-- ============================================================================
-- VERIFY COLUMNS WERE DROPPED FROM PRODUCTION TABLES
-- ============================================================================

-- Verify Phase 1: Check that columns were removed from notifications
SELECT
    'notifications columns after Phase 1' as info,
    COLUMN_NAME,
    DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'notifications'
ORDER BY ORDINAL_POSITION;

-- Verify Phase 1: Check that columns were removed from request_assignments
SELECT
    'request_assignments columns after Phase 1' as info,
    COLUMN_NAME,
    DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'request_assignments'
ORDER BY ORDINAL_POSITION;

-- Verify Phase 2: Check that hospital columns were removed from checkup_requests
SELECT
    'checkup_requests columns after Phase 2' as info,
    COLUMN_NAME,
    DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'checkup_requests'
ORDER BY ORDINAL_POSITION;

-- Check specifically that hospital columns are gone
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ Hospital columns successfully removed from checkup_requests'
        ELSE '⚠️ Hospital columns still exist in checkup_requests'
    END as verification_status,
    COUNT(*) as hospital_columns_remaining
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'checkup_requests'
    AND COLUMN_NAME IN ('hospital_name', 'hospital_address', 'hospital_contact');

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

SELECT '========================================' as '';
SELECT 'BACKUP VERIFICATION SUMMARY' as '';
SELECT '========================================' as '';

SELECT
    'Total backup tables created' as metric,
    COUNT(*) as count
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%backup_phase%';

SELECT
    'Total records backed up' as metric,
    (SELECT COUNT(*) FROM notifications_backup_phase1) +
    (SELECT COUNT(*) FROM request_assignments_backup_phase1) +
    (SELECT COUNT(*) FROM checkup_requests_backup_phase2) as count;

SELECT
    'Backup tables size (MB)' as metric,
    ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE '%backup_phase%';

-- Recommendation: Keep backups for 30 days, then drop with:
-- DROP TABLE IF EXISTS notifications_backup_phase1;
-- DROP TABLE IF EXISTS request_assignments_backup_phase1;
-- DROP TABLE IF EXISTS checkup_requests_backup_phase2;