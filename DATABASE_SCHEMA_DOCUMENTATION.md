# MetroExecuCare Database Schema Documentation
## Version 1.3 - Request Management Enhancement

**Last Updated:** January 2025
**Status:** ✅ Fully Synced and Consolidated

---

## Overview

This document provides comprehensive information about the MetroExecuCare database schema. All schema changes have been **consolidated into `Backend/config/database/manual-schema.js`** for easy management.

---

## Database Setup

### **Primary Schema File:**
- **File:** `Backend/config/database/manual-schema.js`
- **Purpose:** Complete database schema definition
- **Usage:** Run `npm run db:reset` to create all tables with this schema

### **Seed Data File:**
- **File:** `Backend/config/database/init.js`
- **Purpose:** Inserts initial data (admin user, sample hospitals, test users)
- **Usage:** Automatically runs after `db:reset`

### **Connection File:**
- **File:** `Backend/config/database/connection.js`
- **Purpose:** MySQL connection pool configuration

---

## Table Structure

### 1. **users** (Authentication & User Management)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- employee_id (UNIQUE, VARCHAR(50))
- email (UNIQUE, VARCHAR(100))
- password_hash (VARCHAR(255))
- first_name, last_name, middle_name
- role (ENUM: 'executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin')
- department (VARCHAR(100))
- position (VARCHAR(100))
- branch (VARCHAR(100))
- contact_number (VARCHAR(20))
- birth_date (DATE)
- profile_picture (VARCHAR(500))
- is_active (BOOLEAN, DEFAULT TRUE)
- last_login (TIMESTAMP NULL)
- created_at, updated_at (TIMESTAMP)

Indexes:
- idx_employee_id, idx_email, idx_role, idx_is_active
```

**Notes:**
- ✅ All user fields are included (department, branch, birth_date)
- ❌ NO soft-delete columns (deleted_at, deleted_by, etc.) - these were removed
- Uses `is_active` flag for active/inactive status

---

### 2. **hospitals** (Hospital Directory)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- name (VARCHAR(200))
- address (TEXT)
- city (VARCHAR(100))
- contact_number (VARCHAR(20))
- email (VARCHAR(100))
- is_accredited (BOOLEAN, DEFAULT TRUE)
- is_active (BOOLEAN, DEFAULT TRUE)
- created_at, updated_at (TIMESTAMP)

Indexes:
- idx_name, idx_city, idx_is_accredited, idx_is_active
```

---

### 3. **checkup_requests** (Main Request Table)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- request_number (UNIQUE, VARCHAR(50))
- employee_id (FK → users.id)
- request_type (ENUM: 'letter_of_approval', 'letter_of_authorization')
- hospital_id (FK → hospitals.id, NULL)
- hospital_name, hospital_address, hospital_contact (VARCHAR/TEXT)
- hr_assigned_hospital_id (FK → hospitals.id, NULL)
- preferred_date (DATE)
- letter_purpose (TEXT)
- current_status (ENUM) - See Status Flow below
- priority_level (ENUM: 'normal', 'urgent')
- assigned_hr_id (FK → users.id, NULL)
- assigned_benefits_id (FK → users.id, NULL) ✅ v1.3
- assigned_welfare_id (FK → users.id, NULL) ✅ v1.3
- assigned_at (TIMESTAMP NULL)
- assigned_hr_at (TIMESTAMP NULL) ✅ v1.3
- assigned_benefits_at (TIMESTAMP NULL) ✅ v1.3
- assigned_welfare_at (TIMESTAMP NULL) ✅ v1.3
- rejected_at, rejection_reason, rejected_by
- letter_generated_at, letter_generated_by, letter_sent_at
- due_date (DATE)
- completed_at (TIMESTAMP NULL)
- created_at, updated_at (TIMESTAMP)

current_status ENUM Values:
1. 'pending' - Initial state after executive creates request
2. 'assigned_to_hr' - HR claimed/assigned
3. 'hr_processing' - HR is processing (selecting hospital, etc.)
4. 'benefits_review' - Benefits Officer reviewing
5. 'welfare_review' - Welfare Head reviewing
6. 'hr_final_verification' - HR final document verification ✅ v1.3
7. 'approved' - All approvals complete
8. 'rejected' - Rejected by any approver
9. 'letter_generated' - Letter PDF generated
10. 'letter_sent' - Letter sent to executive
11. 'completed' - Request fully completed
12. 'cancelled' - Executive cancelled ✅ v1.3
13. 'deleted' - Executive deleted (soft delete) ✅ v1.3

Indexes:
- idx_request_number, idx_employee_id, idx_current_status
- idx_request_type, idx_created_at
- idx_assigned_hr_id, idx_assigned_benefits_id, idx_assigned_welfare_id
- idx_assigned_hr_at, idx_assigned_benefits_at, idx_assigned_welfare_at
```

**Key Changes in v1.3:**
- ✅ Added timestamp tracking for when each role claims request
- ✅ Added 'hr_final_verification' status for 4-stage workflow
- ✅ Added 'cancelled' and 'deleted' statuses for executive management

---

### 4. **file_requests** (File Request System) ✅ NEW in v1.3
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- request_id (FK → checkup_requests.id)
- requested_by (FK → users.id)
- requested_by_role (ENUM: 'hr_personnel', 'benefits_officer', 'welfare_head')
- message (TEXT)
- status (ENUM: 'pending', 'fulfilled', 'cancelled')
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- fulfilled_at (TIMESTAMP NULL)
- cancelled_at (TIMESTAMP NULL)

Indexes:
- idx_request_id, idx_requested_by, idx_status, idx_created_at

Foreign Keys:
- request_id → checkup_requests(id) ON DELETE CASCADE
- requested_by → users(id) ON DELETE CASCADE
```

**Purpose:** Allows approvers to request additional files from executives during review process

---

### 5. **request_files** (File Storage)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- request_id (FK → checkup_requests.id)
- file_name (VARCHAR(255))
- original_file_name (VARCHAR(255))
- file_path (VARCHAR(500))
- file_size (INT)
- file_type (VARCHAR(100))
- file_extension (VARCHAR(10))
- file_category (ENUM: 'supporting_document', 'letter_of_approval',
                       'letter_of_authorization', 'additional_document')
- submission_type (ENUM: 'initial_submission', 'additional_requested') ✅ v1.3
- file_request_id (FK → file_requests.id, NULL) ✅ v1.3
- uploaded_by (FK → users.id, NULL)
- generated_by (FK → users.id, NULL)
- is_active (BOOLEAN, DEFAULT TRUE)
- is_sent_to_executive (BOOLEAN, DEFAULT FALSE)
- sent_at (TIMESTAMP NULL)
- access_token (VARCHAR(255))
- expires_at (TIMESTAMP NULL)
- download_count (INT, DEFAULT 0)
- created_at, updated_at (TIMESTAMP)

Indexes:
- idx_request_id, idx_file_category, idx_file_request_id
- idx_submission_type, idx_is_active, idx_access_token

Foreign Keys:
- request_id → checkup_requests(id) ON DELETE CASCADE
- file_request_id → file_requests(id) ON DELETE SET NULL ✅ v1.3
- uploaded_by → users(id) ON DELETE SET NULL
- generated_by → users(id) ON DELETE SET NULL
```

**Key Changes in v1.3:**
- ✅ Added `file_request_id` to link files uploaded in response to file requests
- ✅ Added `submission_type` to distinguish initial vs additional files

---

### 6. **request_assignments** (Assignment History)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- request_id (FK → checkup_requests.id)
- hr_personnel_id (FK → users.id)
- assigned_by (FK → users.id)
- assignment_type (ENUM: 'auto_assigned', 'manually_assigned', 'self_claimed')
- assigned_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- is_active (BOOLEAN, DEFAULT TRUE)
- completed_at (TIMESTAMP NULL)
- reassigned_at (TIMESTAMP NULL)
- reassigned_to (FK → users.id, NULL)
- reassignment_reason (TEXT)
- notes (TEXT)

Indexes:
- idx_request_id, idx_hr_personnel_id, idx_is_active
```

---

### 7. **request_approvals** (Approval Workflow)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- request_id (FK → checkup_requests.id)
- approver_id (FK → users.id, NULL) - Nullable for pending approvals ✅
- approver_role (ENUM: 'hr_personnel', 'benefits_officer', 'welfare_head')
- approval_stage (ENUM) - See below
- action (ENUM: 'approved', 'rejected', 'pending', 'returned_for_revision')
- comments (TEXT)
- action_date (TIMESTAMP NULL)
- is_current_stage (BOOLEAN, DEFAULT FALSE)
- stage_order (INT)
- approved_hospital_id (FK → hospitals.id, NULL)
- approved_date (DATE)
- created_at, updated_at (TIMESTAMP)

approval_stage ENUM Values:
1. 'hr_stage' - Initial HR processing
2. 'benefits_stage' - Benefits Officer review
3. 'welfare_stage' - Welfare Head review
4. 'hr_final_stage' - HR final verification ✅ v1.3

Indexes:
- idx_request_id, idx_approver_id, idx_approval_stage
- idx_action, idx_is_current_stage

Foreign Keys:
- request_id → checkup_requests(id) ON DELETE CASCADE
- approver_id → users(id) ON DELETE CASCADE (nullable)
- approved_hospital_id → hospitals(id) ON DELETE SET NULL
```

**4-Stage Workflow (v1.3):**
1. HR Stage → Reviews request, assigns hospital
2. Benefits Stage → Reviews benefits eligibility
3. Welfare Stage → Reviews welfare compliance
4. HR Final Stage → Final document verification before letter generation ✅ NEW

---

### 8. **notifications** (Email Notification Queue)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- request_id (FK → checkup_requests.id, NULL)
- notification_type (ENUM) - See below
- recipient_email (VARCHAR(100))
- recipient_role (VARCHAR(50))
- recipient_id (FK → users.id, NULL)
- subject (VARCHAR(255))
- message (TEXT)
- html_content (TEXT)
- attached_file_ids (JSON)
- status (ENUM: 'pending', 'sent', 'failed', 'bounced', 'delivered')
- sent_at (TIMESTAMP NULL)
- delivery_status (TEXT)
- error_message (TEXT)
- retry_count (INT, DEFAULT 0)
- max_retries (INT, DEFAULT 3)
- gmail_message_id (VARCHAR(255))
- gmail_thread_id (VARCHAR(255))
- scheduled_at (TIMESTAMP NULL)
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

notification_type ENUM Values:
- 'request_submitted', 'request_assigned'
- 'hr_processing_started', 'hr_approved'
- 'benefits_review_started', 'benefits_approved'
- 'welfare_review_started', 'welfare_approved'
- 'request_approved_final', 'request_rejected'
- 'letter_generated', 'letter_sent_to_executive'
- 'file_uploaded', 'file_requested' ✅ v1.3
- 'due_date_reminder', 'overdue_alert', 'request_completed'

Indexes:
- idx_request_id, idx_recipient_email, idx_notification_type
- idx_status, idx_created_at
```

---

### 9. **system_settings** (Application Configuration)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- setting_key (UNIQUE, VARCHAR(100))
- setting_value (TEXT)
- description (TEXT)
- updated_by (FK → users.id, NULL)
- updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

Indexes:
- idx_setting_key
```

---

### 10. **faqs** (Frequently Asked Questions)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- question (TEXT)
- answer (TEXT)
- category (ENUM: 'general', 'application_process', 'special_requests',
                  'letter_requests', 'timeline', 'medical_tests',
                  'hospitals', 'file_uploads')
- is_active (BOOLEAN, DEFAULT TRUE)
- display_order (INT, DEFAULT 0)
- view_count (INT, DEFAULT 0)
- created_by (FK → users.id, NULL)
- created_at, updated_at (TIMESTAMP)

Indexes:
- idx_category, idx_is_active, idx_display_order
```

---

### 11. **activity_logs** (Audit Trail)
```sql
Columns:
- id (PK, AUTO_INCREMENT)
- request_id (FK → checkup_requests.id, NULL)
- user_id (FK → users.id, NULL)
- action (VARCHAR(100))
- description (TEXT)
- old_values (JSON)
- new_values (JSON)
- file_id (FK → request_files.id, NULL)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- session_id (VARCHAR(255))
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

Indexes:
- idx_request_id, idx_user_id, idx_action, idx_created_at
```

---

## Request Workflow Logic

### Executive Actions:

**Can Edit/Delete Request When:**
- `assigned_hr_id IS NULL` (HR has not claimed yet)
- `current_status = 'pending'`

**Can Upload Additional Files When:**
- Request has been claimed by HR (`assigned_hr_id IS NOT NULL`)
- There's a pending file request for this request

**Cannot Submit New Request When:**
- Active request exists (status NOT IN 'approved', 'rejected', 'completed', 'cancelled', 'deleted')

### HR Personnel Actions:
- Claim pending requests
- Process requests (assign hospital, upload files)
- Request additional files from executive
- Approve/reject at HR stage
- Final verification at HR final stage

### Benefits Officer Actions:
- Review requests at benefits stage
- Request additional files from executive
- Approve/reject at benefits stage

### Welfare Head Actions:
- Review requests at welfare stage
- Request additional files from executive
- Approve/reject at welfare stage
- Generate final letter upon approval

---

## File Request System Flow (v1.3)

1. **Approver Creates File Request:**
   - Insert into `file_requests` (status = 'pending')
   - Notification sent to executive

2. **Executive Uploads Files:**
   - Files inserted into `request_files` with:
     - `file_request_id` = ID of the file request
     - `submission_type` = 'additional_requested'

3. **System Marks Request Fulfilled:**
   - Update `file_requests.status` = 'fulfilled'
   - Set `file_requests.fulfilled_at` = CURRENT_TIMESTAMP
   - Notification sent to approver

---

## Obsolete Files (Moved to `to_be_deleted/`)

The following files are **no longer needed** as all schema changes have been consolidated:

### Backend Root:
- ❌ `run_migration.js` - Referenced non-existent migration path
- ❌ `simple_migration.js` - Added columns already in manual-schema
- ❌ `fix_admin_role.js` - One-time fix script
- ❌ `fix_corrupted_users.js` - References deleted columns that don't exist

### Backend/config/database:
- ❌ `update-schema.js` - One-time schema update (approver_id nullable)

### Backend/config/database/migrations:
- ❌ `add_user_fields_migration.sql` - User fields already in schema
- ❌ `add_hr_final_verification.sql` - HR final stage already in schema
- ❌ `add_file_request_system.sql` - File request system already in schema
- ❌ `rollback_file_request_system.sql` - No longer needed

**Note:** These files have been moved to `Backend/to_be_deleted/` for reference. They can be safely deleted after verifying production deployment.

---

## Database Management Commands

### Reset Database (Development Only):
```bash
npm run db:reset
```
**⚠️ WARNING:** This drops all tables and recreates them. All data is lost!

### Verify Schema:
```sql
-- Check table structure
SHOW CREATE TABLE table_name;

-- Check ENUM values
SELECT COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'checkup_requests'
AND COLUMN_NAME = 'current_status';
```

---

## Version History

### v1.3 (January 2025) - Request Management Enhancement
✅ Added file request system (`file_requests` table)
✅ Added request editability for executives (delete/edit unclaimed requests)
✅ Added 4-stage approval workflow (HR final verification)
✅ Added timestamp tracking for role assignments
✅ Added 'cancelled' and 'deleted' request statuses
✅ Consolidated all schema into `manual-schema.js`

### v1.2 (December 2024) - Enhanced Authentication
✅ Added user fields (department, branch, birth_date)
✅ Improved role-based access control
✅ Added profile management

### v1.1 (November 2024) - Initial Production Release
✅ Core request submission workflow
✅ Basic approval system
✅ File upload functionality

---

## Notes for Deployment

### Production Deployment:
1. **Never run `db:reset` in production!**
2. Use incremental ALTER TABLE statements for schema changes
3. Always backup database before schema changes
4. Test migrations on staging environment first

### Environment Variables Required:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=metroexecucare_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret
```

---

## Contact

For schema questions or issues, refer to:
- **Manual Schema:** `Backend/config/database/manual-schema.js`
- **Seed Data:** `Backend/config/database/init.js`
- **Documentation:** This file

**Last Schema Sync:** January 2025
**Schema Version:** 1.3.0
**Status:** ✅ Production Ready
