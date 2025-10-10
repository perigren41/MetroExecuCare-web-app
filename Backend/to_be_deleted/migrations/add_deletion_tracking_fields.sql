-- Migration script to add deletion tracking fields to users table
-- Run this script to track deletion reasons, dates, and who deleted users

-- Add deleted_at column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'deleted_at') = 0,
    'ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at',
    'SELECT "Column deleted_at already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add deletion_reason column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'deletion_reason') = 0,
    'ALTER TABLE users ADD COLUMN deletion_reason TEXT NULL DEFAULT NULL AFTER deleted_at',
    'SELECT "Column deletion_reason already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add deleted_by column if it doesn't exist (references user who performed deletion)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'deleted_by') = 0,
    'ALTER TABLE users ADD COLUMN deleted_by INT NULL DEFAULT NULL AFTER deletion_reason',
    'SELECT "Column deleted_by already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add restored_at column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'restored_at') = 0,
    'ALTER TABLE users ADD COLUMN restored_at TIMESTAMP NULL DEFAULT NULL AFTER deleted_by',
    'SELECT "Column restored_at already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add restored_by column if it doesn't exist (references user who performed restoration)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'restored_by') = 0,
    'ALTER TABLE users ADD COLUMN restored_by INT NULL DEFAULT NULL AFTER restored_at',
    'SELECT "Column restored_by already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add restoration_reason column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND column_name = 'restoration_reason') = 0,
    'ALTER TABLE users ADD COLUMN restoration_reason TEXT NULL DEFAULT NULL AFTER restored_by',
    'SELECT "Column restoration_reason already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key index for deleted_by if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND index_name = 'idx_deleted_by') = 0,
    'ALTER TABLE users ADD INDEX idx_deleted_by (deleted_by)',
    'SELECT "Index idx_deleted_by already exists" AS message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key index for restored_by if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
     WHERE table_name = 'users'
     AND table_schema = DATABASE()
     AND index_name = 'idx_restored_by') = 0,
    'ALTER TABLE users ADD INDEX idx_restored_by (restored_by)',
    'SELECT "Index idx_restored_by already exists" AS message'
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
AND COLUMN_NAME IN ('deleted_at', 'deletion_reason', 'deleted_by', 'restored_at', 'restored_by', 'restoration_reason')
ORDER BY ORDINAL_POSITION;
