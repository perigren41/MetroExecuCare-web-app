# MetroExecuCare Database Entity-Relationship Diagram (ERD)

## Version 1.3 - Complete Database Schema
**Last Updated:** January 2025

---

## 📊 Visual ERD Diagram

```
┌──────────────────┐
│     users        │◄─────────────────────────────────────┐
│  (PK) id         │                                       │
│  employee_id     │                                       │
│  email           │                                       │
│  password_hash   │                                       │
│  first_name      │                                       │
│  last_name       │                                       │
│  role            │                                       │
│  department      │                                       │
│  position        │                                       │
│  branch          │                                       │
│  is_active       │                                       │
└──────────────────┘                                       │
         △                                                 │
         │                                                 │
         │ FK: employee_id                                │
         │                                                 │
┌────────┴──────────────────────────────────────────┐     │
│                                                    │     │
│  ┌─────────────────────────────────────────┐      │     │
│  │         checkup_requests                │      │     │
│  │  (PK) id                                │      │     │
│  │  (FK) employee_id → users.id            │      │     │
│  │  request_number                         │      │     │
│  │  request_type                           │      │     │
│  │  (FK) hospital_id → hospitals.id        │      │     │
│  │  (FK) hr_assigned_hospital_id → hospitals.id   │     │
│  │  hospital_name, hospital_address        │      │     │
│  │  current_status                         │      │     │
│  │  priority_level                         │      │     │
│  │  (FK) assigned_hr_id → users.id         │      │     │
│  │  (FK) assigned_benefits_id → users.id   │      │     │
│  │  (FK) assigned_welfare_id → users.id    │      │     │
│  │  (FK) rejected_by → users.id            │      │     │
│  │  (FK) letter_generated_by → users.id    │      │     │
│  │  preferred_date, due_date               │      │     │
│  │  created_at, completed_at               │      │     │
│  └─────────────────────────────────────────┘      │     │
│           △                                        │     │
│           │ FK: request_id                         │     │
│           │                                        │     │
│  ┌────────┴──────────────┐  ┌────────────────────┐│     │
│  │                       │  │                     ││     │
│  │  ┌──────────────────┐ │  │  ┌────────────────┐││     │
│  │  │ request_approvals│ │  │  │ file_requests  │││     │
│  │  │ (PK) id          │ │  │  │ (PK) id        │││     │
│  │  │ (FK) request_id  │ │  │  │ (FK) request_id│││     │
│  │  │ (FK) approver_id │─┼──┼──│ (FK) requested_by → users.id
│  │  │       → users.id │ │  │  │ requested_by_role  ││     │
│  │  │ approver_role    │ │  │  │ message        │││     │
│  │  │ approval_stage   │ │  │  │ status         │││     │
│  │  │ action           │ │  │  │ created_at     │││     │
│  │  │ comments         │ │  │  │ fulfilled_at   │││     │
│  │  │ (FK) approved_hospital_id  │ cancelled_at │││     │
│  │  │       → hospitals.id│     │ │              │││     │
│  │  │ is_current_stage │ │  │  └────────────────┘││     │
│  │  │ stage_order      │ │  │          △         ││     │
│  │  └──────────────────┘ │  │          │ FK: file_request_id
│  │                       │  │          │         ││     │
│  │  ┌──────────────────┐ │  │  ┌───────┴────────┐││     │
│  │  │request_assignments│ │  │ │ request_files  │││     │
│  │  │ (PK) id          │ │  │  │ (PK) id        │││     │
│  │  │ (FK) request_id  │ │  │  │ (FK) request_id│││     │
│  │  │ (FK) hr_personnel_id  │  │ (FK) file_request_id  ││
│  │  │       → users.id │ │  │  │ file_name      │││     │
│  │  │ (FK) assigned_by │─┼──┼──│ file_path      │││     │
│  │  │       → users.id │ │  │  │ file_category  │││     │
│  │  │ (FK) reassigned_to│ │  │  │ submission_type│││     │
│  │  │       → users.id │ │  │  │ (FK) uploaded_by   ││     │
│  │  │ assignment_type  │ │  │  │       → users.id││     │
│  │  │ is_active        │ │  │  │ (FK) generated_by  ││     │
│  │  │ assigned_at      │ │  │  │       → users.id││     │
│  │  │ completed_at     │ │  │  │ is_active      │││     │
│  │  └──────────────────┘ │  │  │ is_sent_to_executive ││
│  │                       │  │  │ access_token   │││     │
│  │  ┌──────────────────┐ │  │  └────────────────┘││     │
│  │  │  activity_logs   │ │  │                     ││     │
│  │  │ (PK) id          │ │  └─────────────────────┘│     │
│  │  │ (FK) request_id  │ │                          │     │
│  │  │ (FK) user_id → users.id                      │     │
│  │  │ (FK) file_id → request_files.id              │     │
│  │  │ action           │ │                          │     │
│  │  │ description      │ │                          │     │
│  │  │ old_values (JSON)│ │                          │     │
│  │  │ new_values (JSON)│ │                          │     │
│  │  │ created_at       │ │                          │     │
│  │  └──────────────────┘ │                          │     │
│  │                       │                          │     │
│  │  ┌──────────────────┐ │                          │     │
│  │  │  notifications   │ │                          │     │
│  │  │ (PK) id          │ │                          │     │
│  │  │ (FK) request_id  │ │                          │     │
│  │  │ (FK) recipient_id → users.id                 │     │
│  │  │ notification_type│ │                          │     │
│  │  │ recipient_email  │ │                          │     │
│  │  │ subject, message │ │                          │     │
│  │  │ status           │ │                          │     │
│  │  │ sent_at          │ │                          │     │
│  │  └──────────────────┘ │                          │     │
│  └───────────────────────┘                          │     │
│                                                      │     │
└──────────────────────────────────────────────────────┘     │
                                                             │
┌──────────────────┐                                         │
│    hospitals     │◄────────────────────────────────────────┘
│  (PK) id         │
│  name            │  Referenced by:
│  address         │  - checkup_requests.hospital_id
│  city            │  - checkup_requests.hr_assigned_hospital_id
│  contact_number  │  - request_approvals.approved_hospital_id
│  is_accredited   │
│  is_active       │
└──────────────────┘

┌──────────────────┐
│ system_settings  │  (Independent table for app configuration)
│  (PK) id         │
│  setting_key     │
│  setting_value   │
│  (FK) updated_by → users.id
└──────────────────┘

┌──────────────────┐
│      faqs        │  (Independent table for help content)
│  (PK) id         │
│  question        │
│  answer          │
│  category        │
│  (FK) created_by → users.id
│  display_order   │
└──────────────────┘
```

---

## 🔗 Table Relationships Summary

### 1. **users** (Central Hub)
- **Primary Key:** `id`
- **Relationships:**
  - → `checkup_requests.employee_id` (1:Many) - Employees create requests
  - → `checkup_requests.assigned_hr_id` (1:Many) - HR assigned to requests
  - → `checkup_requests.assigned_benefits_id` (1:Many) - BO assigned to requests
  - → `checkup_requests.assigned_welfare_id` (1:Many) - WH assigned to requests
  - → `checkup_requests.rejected_by` (1:Many) - Who rejected requests
  - → `checkup_requests.letter_generated_by` (1:Many) - Who generated letters
  - → `request_approvals.approver_id` (1:Many) - Who approved/rejected
  - → `request_assignments.hr_personnel_id` (1:Many) - HR assignments
  - → `request_assignments.assigned_by` (1:Many) - Who made assignment
  - → `request_assignments.reassigned_to` (1:Many) - Reassignment target
  - → `file_requests.requested_by` (1:Many) - Who requested files
  - → `request_files.uploaded_by` (1:Many) - Who uploaded files
  - → `request_files.generated_by` (1:Many) - Who generated files
  - → `notifications.recipient_id` (1:Many) - Notification recipients
  - → `activity_logs.user_id` (1:Many) - Activity tracker
  - → `system_settings.updated_by` (1:Many) - Settings updates
  - → `faqs.created_by` (1:Many) - FAQ creator

### 2. **hospitals**
- **Primary Key:** `id`
- **Relationships:**
  - → `checkup_requests.hospital_id` (1:Many) - Selected hospital
  - → `checkup_requests.hr_assigned_hospital_id` (1:Many) - HR assigned hospital
  - → `request_approvals.approved_hospital_id` (1:Many) - Approved hospital

### 3. **checkup_requests** (Main Entity)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `employee_id` → `users.id` (ON DELETE CASCADE)
  - `hospital_id` → `hospitals.id` (ON DELETE SET NULL)
  - `hr_assigned_hospital_id` → `hospitals.id` (ON DELETE SET NULL)
  - `assigned_hr_id` → `users.id` (ON DELETE SET NULL)
  - `assigned_benefits_id` → `users.id` (ON DELETE SET NULL)
  - `assigned_welfare_id` → `users.id` (ON DELETE SET NULL)
  - `rejected_by` → `users.id` (ON DELETE SET NULL)
  - `letter_generated_by` → `users.id` (ON DELETE SET NULL)
- **Relationships:**
  - → `request_approvals.request_id` (1:Many) - Approval stages
  - → `request_assignments.request_id` (1:Many) - Assignment history
  - → `file_requests.request_id` (1:Many) - File requests
  - → `request_files.request_id` (1:Many) - Uploaded files
  - → `notifications.request_id` (1:Many) - Notifications
  - → `activity_logs.request_id` (1:Many) - Activity logs

### 4. **file_requests** (File Request System - v1.3)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `request_id` → `checkup_requests.id` (ON DELETE CASCADE)
  - `requested_by` → `users.id` (ON DELETE CASCADE)
- **Relationships:**
  - → `request_files.file_request_id` (1:Many) - Files uploaded in response
- **Purpose:** Approvers request additional files from executives

### 5. **request_files** (File Storage)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `request_id` → `checkup_requests.id` (ON DELETE CASCADE)
  - `file_request_id` → `file_requests.id` (ON DELETE SET NULL) - Links to file request
  - `uploaded_by` → `users.id` (ON DELETE SET NULL)
  - `generated_by` → `users.id` (ON DELETE SET NULL)
- **Relationships:**
  - → `activity_logs.file_id` (1:Many) - File activity tracking

### 6. **request_assignments** (Assignment History)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `request_id` → `checkup_requests.id` (ON DELETE CASCADE)
  - `hr_personnel_id` → `users.id` (ON DELETE CASCADE)
  - `assigned_by` → `users.id` (ON DELETE CASCADE)
  - `reassigned_to` → `users.id` (ON DELETE SET NULL)
- **Purpose:** Tracks HR assignment history (manual & self-claimed)
- **Active Usage:** ✅ **YES** - Used for:
  - Manual assignments by admin/benefits/welfare
  - Self-claimed requests by HR personnel

### 7. **request_approvals** (Approval Workflow)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `request_id` → `checkup_requests.id` (ON DELETE CASCADE)
  - `approver_id` → `users.id` (ON DELETE CASCADE, **NULLABLE**)
  - `approved_hospital_id` → `hospitals.id` (ON DELETE SET NULL)
- **Purpose:** 4-stage approval workflow tracking

### 8. **notifications** (Email Queue)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `request_id` → `checkup_requests.id` (ON DELETE CASCADE)
  - `recipient_id` → `users.id` (ON DELETE SET NULL)
- **Purpose:** Email notification queue and status

### 9. **activity_logs** (Audit Trail)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `request_id` → `checkup_requests.id` (ON DELETE CASCADE)
  - `user_id` → `users.id` (ON DELETE SET NULL)
  - `file_id` → `request_files.id` (ON DELETE SET NULL)
- **Purpose:** Complete audit trail of all actions

### 10. **system_settings** (Configuration)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `updated_by` → `users.id` (ON DELETE SET NULL)
- **Purpose:** Application settings and configuration

### 11. **faqs** (Help Content)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `created_by` → `users.id` (ON DELETE SET NULL)
- **Purpose:** Frequently Asked Questions management

---

## ❓ ERD Issue Resolution

### Question 1: Why is `request_assignments` table still active?

**Answer:** ✅ **The table IS actively used in production!**

**Usage Evidence:**
1. **Manual Assignment** (line 87 in requestWorkflowController.js):
   ```javascript
   INSERT INTO request_assignments (
     request_id, hr_personnel_id, assigned_by, assignment_type, notes, assigned_at
   ) VALUES (?, ?, ?, 'manually_assigned', ?, NOW())
   ```
   - When admin/benefits officer/welfare head assigns a request to specific HR

2. **Self-Claimed Assignment** (line 228 in requestWorkflowController.js):
   ```javascript
   INSERT INTO request_assignments (
     request_id, hr_personnel_id, assigned_by, assignment_type, assigned_at
   ) VALUES (?, ?, ?, 'self_claimed', NOW())
   ```
   - When HR personnel claims a request themselves

**Purpose:**
- Maintains complete assignment history
- Tracks who assigned what to whom
- Supports reassignment functionality
- Differentiates between manual vs self-claimed assignments

### Question 2: How is `file_requests` table connected?

**Answer:** ✅ **Connected through multi-level relationships**

**Connection Flow:**
```
checkup_requests (id)
    ↓ FK: request_id
file_requests (id)
    ↓ FK: file_request_id
request_files
```

**Workflow:**
1. Approver creates file request → Insert into `file_requests`
2. Executive uploads files → Insert into `request_files` with `file_request_id`
3. System marks fulfilled → Update `file_requests.status = 'fulfilled'`

**Foreign Keys:**
- `file_requests.request_id` → `checkup_requests.id` (ON DELETE CASCADE)
- `file_requests.requested_by` → `users.id` (ON DELETE CASCADE)
- `request_files.file_request_id` → `file_requests.id` (ON DELETE SET NULL)

---

## 🔄 Data Flow Diagram

### Request Lifecycle with Database Interactions

```
1. EXECUTIVE SUBMITS REQUEST
   └─> INSERT checkup_requests (status='pending')
       └─> INSERT request_approvals (4 stages, all action='pending')
           └─> INSERT notifications (to HR personnel)

2. HR CLAIMS REQUEST
   └─> UPDATE checkup_requests (assigned_hr_id, status='hr_processing')
       └─> INSERT request_assignments (type='self_claimed')
           └─> UPDATE request_approvals (hr_stage: approver_id = HR user)
               └─> INSERT activity_logs
                   └─> INSERT notifications (to executive)

3. HR PROCESSES & APPROVES
   └─> UPDATE checkup_requests (hospital_id, status='benefits_review')
       └─> UPDATE request_approvals (hr_stage: action='approved', is_current_stage=FALSE)
           └─> UPDATE request_approvals (benefits_stage: is_current_stage=TRUE)
               └─> INSERT notifications (to benefits officers)

4. BENEFITS OFFICER CLAIMS & REQUESTS FILES
   └─> UPDATE request_approvals (benefits_stage: approver_id = BO user)
       └─> INSERT file_requests (status='pending')
           └─> INSERT notifications (to executive)

5. EXECUTIVE UPLOADS ADDITIONAL FILES
   └─> INSERT request_files (file_request_id, submission_type='additional_requested')
       └─> UPDATE file_requests (status='fulfilled', fulfilled_at)
           └─> INSERT notifications (to benefits officer)

6. BENEFITS OFFICER APPROVES
   └─> UPDATE checkup_requests (status='welfare_review')
       └─> UPDATE request_approvals (benefits_stage: action='approved', is_current_stage=FALSE)
           └─> UPDATE request_approvals (welfare_stage: is_current_stage=TRUE)
               └─> INSERT notifications (to welfare heads)

7. WELFARE HEAD CLAIMS & APPROVES
   └─> UPDATE request_approvals (welfare_stage: approver_id = WH user)
       └─> UPDATE checkup_requests (status='hr_final_verification')
           └─> UPDATE request_approvals (welfare_stage: action='approved', is_current_stage=FALSE)
               └─> UPDATE request_approvals (hr_final_stage: is_current_stage=TRUE)
                   └─> INSERT notifications (to assigned HR)

8. HR FINAL VERIFICATION & COMPLETION
   └─> UPDATE checkup_requests (status='completed', completed_at)
       └─> UPDATE request_approvals (hr_final_stage: action='approved')
           └─> INSERT request_files (file_category='letter_of_approval/authorization', is_sent_to_executive=TRUE)
               └─> INSERT notifications (to executive with download links)
```

---

## 🗃️ Cascade Behaviors

### ON DELETE CASCADE (Data is deleted when parent is deleted)
- `checkup_requests.employee_id` → `users.id`
- `request_approvals.request_id` → `checkup_requests.id`
- `request_assignments.request_id` → `checkup_requests.id`
- `request_assignments.hr_personnel_id` → `users.id`
- `request_assignments.assigned_by` → `users.id`
- `request_approvals.approver_id` → `users.id`
- `file_requests.request_id` → `checkup_requests.id`
- `file_requests.requested_by` → `users.id`
- `request_files.request_id` → `checkup_requests.id`
- `notifications.request_id` → `checkup_requests.id`
- `activity_logs.request_id` → `checkup_requests.id`

### ON DELETE SET NULL (Reference is nullified when parent is deleted)
- `checkup_requests.hospital_id` → `hospitals.id`
- `checkup_requests.hr_assigned_hospital_id` → `hospitals.id`
- `checkup_requests.assigned_hr_id` → `users.id`
- `checkup_requests.assigned_benefits_id` → `users.id`
- `checkup_requests.assigned_welfare_id` → `users.id`
- `checkup_requests.rejected_by` → `users.id`
- `checkup_requests.letter_generated_by` → `users.id`
- `request_approvals.approved_hospital_id` → `hospitals.id`
- `request_assignments.reassigned_to` → `users.id`
- `request_files.file_request_id` → `file_requests.id`
- `request_files.uploaded_by` → `users.id`
- `request_files.generated_by` → `users.id`
- `notifications.recipient_id` → `users.id`
- `activity_logs.user_id` → `users.id`
- `activity_logs.file_id` → `request_files.id`
- `system_settings.updated_by` → `users.id`
- `faqs.created_by` → `users.id`

---

## 📈 Database Statistics

### Table Count: **11 tables**
1. users (Central hub)
2. hospitals (Reference data)
3. checkup_requests (Main entity)
4. file_requests (v1.3 - File request system)
5. request_files (File storage)
6. request_assignments (Assignment history) ✅ **ACTIVE**
7. request_approvals (Approval workflow)
8. notifications (Email queue)
9. activity_logs (Audit trail)
10. system_settings (Configuration)
11. faqs (Help content)

### Foreign Key Relationships: **32 FKs**
- users → 18 relationships
- hospitals → 3 relationships
- checkup_requests → 8 relationships
- file_requests → 2 relationships
- request_files → 1 relationship

### Cardinality:
- **1:Many relationships:** All current relationships
- **Many:Many relationships:** None (using junction tables pattern)
- **1:1 relationships:** None

---

## 🔍 Query Performance Optimization

### Indexed Columns (for fast lookups):

**users:**
- employee_id, email, role, is_active

**hospitals:**
- name, city, is_accredited, is_active

**checkup_requests:**
- request_number, employee_id, current_status, request_type, created_at
- assigned_hr_id, assigned_benefits_id, assigned_welfare_id
- assigned_hr_at, assigned_benefits_at, assigned_welfare_at

**request_approvals:**
- request_id, approver_id, approval_stage, action, is_current_stage

**request_assignments:**
- request_id, hr_personnel_id, is_active

**file_requests:**
- request_id, requested_by, status, created_at

**request_files:**
- request_id, file_category, file_request_id, submission_type, is_active, access_token

**notifications:**
- request_id, recipient_email, notification_type, status, created_at

**activity_logs:**
- request_id, user_id, action, created_at

**system_settings:**
- setting_key

**faqs:**
- category, is_active, display_order

---

## 📝 Notes

- All timestamps use MySQL `TIMESTAMP` type with automatic updates
- JSON fields used for flexible data: `old_values`, `new_values`, `attached_file_ids`
- ENUM fields ensure data integrity for status, role, and type columns
- Soft delete not used; `is_active` flags for users/hospitals, 'deleted' status for requests
- Foreign keys use appropriate cascade behaviors to maintain referential integrity

---

**Last Updated:** January 2025
**Schema Version:** 1.3.0
**Database:** MySQL 8.0+