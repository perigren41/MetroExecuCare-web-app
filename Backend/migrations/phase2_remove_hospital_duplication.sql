-- Phase 2: Remove Hospital Data Duplication from checkup_requests
-- This migration removes redundant hospital fields that duplicate data from the hospitals table
--
-- IMPORTANT: Run this AFTER deploying the Phase 2 code changes that remove these fields from:
--   - Backend/controllers/requestWorkflowController.js
--   - Backend/controllers/requestManagementController.js
--   - Backend/validators/requestValidators.js
--   - Frontend/src/webpages/LOA_Submit.jsx
--
-- Execution date: [TO BE FILLED WHEN RUNNING]
-- Database: metroexecucare_production (Railway MySQL)

-- Step 1: Create backup of checkup_requests table before making changes
CREATE TABLE IF NOT EXISTS checkup_requests_backup_phase2 AS
SELECT * FROM checkup_requests;

-- Verify backup was created
SELECT
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    'checkup_requests_backup_phase2' as backup_table
FROM checkup_requests_backup_phase2;

-- Step 2: Verify all checkup_requests have hospital_id set (should be NULL or valid FK)
SELECT
    COUNT(*) as total_requests,
    COUNT(hospital_id) as with_hospital_id,
    COUNT(*) - COUNT(hospital_id) as without_hospital_id
FROM checkup_requests;

-- Step 3: Drop redundant hospital columns from checkup_requests
-- These columns duplicate data that already exists in the hospitals table via FK relationship
ALTER TABLE checkup_requests
  DROP COLUMN IF EXISTS hospital_name,
  DROP COLUMN IF EXISTS hospital_address,
  DROP COLUMN IF EXISTS hospital_contact;

-- Step 4: Verify columns were dropped successfully
DESCRIBE checkup_requests;

-- Step 5: Verify existing FK relationships are intact
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'checkup_requests'
    AND REFERENCED_TABLE_NAME IS NOT NULL
    AND COLUMN_NAME IN ('hospital_id', 'hr_assigned_hospital_id');

-- Step 6: Test query to verify JOIN-based data retrieval still works
SELECT
    cr.id,
    cr.request_number,
    cr.request_type,
    h.name as hospital_name,
    h.address as hospital_address,
    h.contact_number as hospital_contact,
    h2.name as hr_assigned_hospital_name
FROM checkup_requests cr
LEFT JOIN hospitals h ON cr.hospital_id = h.id
LEFT JOIN hospitals h2 ON cr.hr_assigned_hospital_id = h2.id
LIMIT 5;

-- Migration completed successfully!
-- Note: Keep backup table for 30 days, then drop:
-- DROP TABLE IF EXISTS checkup_requests_backup_phase2;