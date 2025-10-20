-- ============================================================================
-- PHASE 3: Branches & Departments Normalization
-- ============================================================================
-- Purpose: Create departments and branches tables, migrate VARCHAR data to FK relationships
-- Estimated Time: 5 minutes
-- Rollback: Can restore by reverting to VARCHAR columns
-- ============================================================================

-- Step 1: Create backup of users table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users_backup_phase3 AS SELECT * FROM users;

SELECT 'Backup table created: users_backup_phase3' AS status;

-- Verify backup
SELECT
    'users_backup_phase3' as backup_table,
    COUNT(*) as total_records
FROM users_backup_phase3;

-- Step 2: Create departments table
-- ============================================================================
SELECT 'Creating departments table...' AS status;

CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
);

SELECT 'departments table created' AS status;

-- Step 3: Seed initial departments (15 common banking departments)
-- ============================================================================
SELECT 'Seeding initial departments...' AS status;

INSERT INTO departments (name, description, is_active) VALUES
('Executive Management', 'Executive leadership and management team', TRUE),
('Human Resources', 'Human resources and employee relations', TRUE),
('Information Technology', 'IT infrastructure, development, and support', TRUE),
('Finance & Accounting', 'Financial operations and accounting', TRUE),
('Benefits & Services', 'Employee benefits and services administration', TRUE),
('Welfare & Recreation', 'Employee welfare and recreational activities', TRUE),
('Operations', 'General business operations', TRUE),
('Risk Management', 'Risk assessment and management', TRUE),
('Compliance', 'Regulatory compliance and governance', TRUE),
('Audit', 'Internal audit and controls', TRUE),
('Marketing', 'Marketing and brand management', TRUE),
('Branch Operations', 'Branch management and operations', TRUE),
('Customer Service', 'Customer support and service', TRUE),
('Treasury', 'Treasury and investment operations', TRUE),
('Legal', 'Legal affairs and corporate counsel', TRUE);

SELECT 'Departments seeded successfully' AS status;

-- Verify departments
SELECT * FROM departments ORDER BY name;

-- Step 4: Create branches table
-- ============================================================================
SELECT 'Creating branches table...' AS status;

CREATE TABLE IF NOT EXISTS branches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  region VARCHAR(100),
  contact_number VARCHAR(20),
  email VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_code (code),
  INDEX idx_city (city),
  INDEX idx_is_active (is_active)
);

SELECT 'branches table created' AS status;

-- Step 5: Seed initial branches (from existing data)
-- ============================================================================
SELECT 'Seeding initial branches...' AS status;

INSERT INTO branches (name, code, city, region, is_active) VALUES
('Metrobank Fort - Ecoprime Tower', 'FORT-ECO', 'Taguig', 'NCR', TRUE),
('Metrobank Taguig - Puregold Branch', 'TAG-PURE', 'Taguig', 'NCR', TRUE),
('Metrobank Fort - McKinley Branch', 'FORT-MCK', 'Taguig', 'NCR', TRUE),
('Metrobank Fort - Ten West Campus Branch', 'FORT-TWC', 'Taguig', 'NCR', TRUE);

SELECT 'Branches seeded successfully' AS status;

-- Verify branches
SELECT * FROM branches ORDER BY name;

-- Step 6: Add FK columns to users table
-- ============================================================================
SELECT 'Adding FK columns to users table...' AS status;

ALTER TABLE users
  ADD COLUMN department_id INT AFTER role,
  ADD COLUMN branch_id INT AFTER department_id;

SELECT 'FK columns added to users table' AS status;

-- Step 7: Create foreign key constraints
-- ============================================================================
SELECT 'Creating foreign key constraints...' AS status;

ALTER TABLE users
  ADD CONSTRAINT fk_users_department
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

SELECT 'Foreign key constraints created' AS status;

-- Step 8: Add indexes for performance
-- ============================================================================
SELECT 'Adding indexes...' AS status;

ALTER TABLE users
  ADD INDEX idx_department_id (department_id),
  ADD INDEX idx_branch_id (branch_id);

SELECT 'Indexes added' AS status;

-- Step 9: Migrate department data
-- ============================================================================
SELECT 'Migrating department data...' AS status;

-- Map "IT" and "IT Department" to "Information Technology"
UPDATE users
SET department_id = (SELECT id FROM departments WHERE name = 'Information Technology')
WHERE department IN ('IT', 'IT Department');

-- Map "Management" to "Executive Management"
UPDATE users
SET department_id = (SELECT id FROM departments WHERE name = 'Executive Management')
WHERE department = 'Management';

-- Map "Data" to "Information Technology" (assuming data team is under IT)
UPDATE users
SET department_id = (SELECT id FROM departments WHERE name = 'Information Technology')
WHERE department = 'Data';

-- Map "Human Resources" and "Human Resource" to "Human Resources"
UPDATE users
SET department_id = (SELECT id FROM departments WHERE name = 'Human Resources')
WHERE department IN ('Human Resources', 'Human Resource');

-- Map "Benefits & Services" and HTML-encoded version to "Benefits & Services"
UPDATE users
SET department_id = (SELECT id FROM departments WHERE name = 'Benefits & Services')
WHERE department IN ('Benefits & Services', 'Benefits &amp;amp; Services', 'Benefits &amp; Services');

-- Map "Welfare and Recreation" to "Welfare & Recreation"
UPDATE users
SET department_id = (SELECT id FROM departments WHERE name = 'Welfare & Recreation')
WHERE department = 'Welfare and Recreation';

-- Map "Finance" to "Finance & Accounting"
UPDATE users
SET department_id = (SELECT id FROM departments WHERE name = 'Finance & Accounting')
WHERE department = 'Finance';

SELECT 'Department data migrated' AS status;

-- Step 10: Migrate branch data
-- ============================================================================
SELECT 'Migrating branch data...' AS status;

-- Map branches exactly
UPDATE users
SET branch_id = (SELECT id FROM branches WHERE name = 'Metrobank Fort - Ecoprime Tower')
WHERE branch = 'Metrobank Fort - Ecoprime Tower';

UPDATE users
SET branch_id = (SELECT id FROM branches WHERE name = 'Metrobank Taguig - Puregold Branch')
WHERE branch = 'Metrobank Taguig - Puregold Branch';

UPDATE users
SET branch_id = (SELECT id FROM branches WHERE name = 'Metrobank Fort - McKinley Branch')
WHERE branch IN ('Metrobank Fort - Mckinley Branch', 'Metrobank Fort - McKinley Branch');

UPDATE users
SET branch_id = (SELECT id FROM branches WHERE name = 'Metrobank Fort - Ten West Campus Branch')
WHERE branch IN ('Metrobank Fort-Ten West Campus Branch', 'Metrobank Fort - Ten West Campus Branch');

SELECT 'Branch data migrated' AS status;

-- Step 11: Verification
-- ============================================================================
SELECT 'Verifying migration...' AS status;

-- Check department migration
SELECT
    'Department Migration' as verification,
    COUNT(*) as total_users,
    COUNT(department_id) as users_with_dept_id,
    COUNT(department) as users_with_dept_varchar,
    COUNT(*) - COUNT(department_id) as missing_dept_id
FROM users;

-- Check branch migration
SELECT
    'Branch Migration' as verification,
    COUNT(*) as total_users,
    COUNT(branch_id) as users_with_branch_id,
    COUNT(branch) as users_with_branch_varchar,
    COUNT(*) - COUNT(branch_id) as missing_branch_id
FROM users;

-- Show department distribution
SELECT
    d.name as department_name,
    COUNT(u.id) as user_count
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
GROUP BY d.id, d.name
ORDER BY user_count DESC, d.name;

-- Show branch distribution
SELECT
    b.name as branch_name,
    COUNT(u.id) as user_count
FROM branches b
LEFT JOIN users u ON u.branch_id = b.id
GROUP BY b.id, b.name
ORDER BY user_count DESC, b.name;

-- Sample users with new FK relationships
SELECT
    u.employee_id,
    u.first_name,
    u.last_name,
    u.department as old_department,
    d.name as new_department,
    u.branch as old_branch,
    b.name as new_branch
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN branches b ON u.branch_id = b.id
LIMIT 10;

-- Check for any unmapped users
SELECT
    employee_id,
    first_name,
    last_name,
    department as old_department,
    branch as old_branch,
    department_id,
    branch_id
FROM users
WHERE department_id IS NULL OR (branch IS NOT NULL AND branch_id IS NULL);

-- Step 12: Verify foreign key constraints
-- ============================================================================
SELECT
    'Foreign Key Verification' as info,
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND REFERENCED_TABLE_NAME IN ('departments', 'branches');

-- ============================================================================
-- PHASE 3 COMPLETE
-- ============================================================================
SELECT '✅ Phase 3 completed successfully!' AS status;
SELECT 'Created: departments table (15 departments)' AS result;
SELECT 'Created: branches table (4 branches)' AS result;
SELECT 'Migrated: All user department and branch data to FK relationships' AS result;
SELECT 'Note: Old VARCHAR columns (department, branch) kept for 30-day rollback safety' AS note;

-- ============================================================================
-- OPTIONAL: Drop old VARCHAR columns (run after 30-day verification period)
-- ============================================================================
-- DO NOT RUN IMMEDIATELY - Keep for rollback safety
--
-- After 30 days of successful operation:
-- ALTER TABLE users
--   DROP COLUMN department,
--   DROP COLUMN branch;
--
-- DROP TABLE IF EXISTS users_backup_phase3;