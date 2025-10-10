-- Migration script to add missing fields to users table
-- Run this script to update existing database with new fields

-- Add department column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'department') = 0,
    'ALTER TABLE users ADD COLUMN department VARCHAR(100) AFTER position',
    'SELECT "Column department already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add branch column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'branch') = 0,
    'ALTER TABLE users ADD COLUMN branch VARCHAR(200) AFTER department',
    'SELECT "Column branch already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add birth_date column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'birth_date') = 0,
    'ALTER TABLE users ADD COLUMN birth_date DATE AFTER contact_number',
    'SELECT "Column birth_date already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for new columns
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND index_name = 'idx_department') = 0,
    'ALTER TABLE users ADD INDEX idx_department (department)',
    'SELECT "Index idx_department already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND index_name = 'idx_branch') = 0,
    'ALTER TABLE users ADD INDEX idx_branch (branch)',
    'SELECT "Index idx_branch already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE table_name = 'users'
AND table_schema = DATABASE()
AND COLUMN_NAME IN ('department', 'branch', 'birth_date')
ORDER BY ORDINAL_POSITION;