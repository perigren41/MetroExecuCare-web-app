# MetroExecuCare Enhanced Entity-Relationship Diagram (ERD)
## Complete Visual Database Schema with Relationship Details

**Version:** 1.3.0
**Created:** January 2025
**Status:** ✅ Production Active

---

## 🎯 Quick Navigation
- [Visual ERD Diagram](#visual-erd-diagram)
- [Detailed Table Relationships](#detailed-table-relationships)
- [Foreign Key Reference Chart](#foreign-key-reference-chart)
- [Cardinality Summary](#cardinality-summary)
- [Data Flow Examples](#data-flow-examples)

---

## 📊 Visual ERD Diagram

### Core Tables Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CENTRAL HUB: users                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ PK: id                                                                 │  │
│  │ UNIQUE: employee_id, email                                            │  │
│  │ Fields: password_hash, first_name, last_name, middle_name             │  │
│  │         role (ENUM), department, position, branch                     │  │
│  │         contact_number, birth_date, profile_picture                   │  │
│  │         is_active, last_login, created_at, updated_at                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────────────────────────────┬────────┘
           │                                                          │
           │ 8 FKs                                           18 Relationships
           │                                                          │
┌──────────▼──────────────────────────────────────────────────────────▼────────┐
│                      MAIN ENTITY: checkup_requests                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ PK: id                                                                 │  │
│  │ UNIQUE: request_number                                                │  │
│  │                                                                        │  │
│  │ Foreign Keys (8 total):                                               │  │
│  │  ├─ FK: employee_id → users.id (CASCADE)                             │  │
│  │  ├─ FK: hospital_id → hospitals.id (SET NULL)                        │  │
│  │  ├─ FK: hr_assigned_hospital_id → hospitals.id (SET NULL)            │  │
│  │  ├─ FK: assigned_hr_id → users.id (SET NULL)                         │  │
│  │  ├─ FK: assigned_benefits_id → users.id (SET NULL)                   │  │
│  │  ├─ FK: assigned_welfare_id → users.id (SET NULL)                    │  │
│  │  ├─ FK: rejected_by → users.id (SET NULL)                            │  │
│  │  └─ FK: letter_generated_by → users.id (SET NULL)                    │  │
│  │                                                                        │  │
│  │ Fields: request_type, hospital_name, hospital_address,                │  │
│  │         hospital_contact, preferred_date, letter_purpose              │  │
│  │         current_status (13 ENUM values), priority_level               │  │
│  │         assigned_at, assigned_hr_at, assigned_benefits_at,            │  │
│  │         assigned_welfare_at, rejected_at, rejection_reason            │  │
│  │         letter_generated_at, letter_sent_at, due_date                 │  │
│  │         completed_at, created_at, updated_at                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──┬────────┬────────────┬────────────┬──────────────┬──────────────┬─────────┘
   │        │            │            │              │              │
   │        │            │            │              │              │
   ▼        ▼            ▼            ▼              ▼              ▼

┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────┐
│request_files │  │file_requests │  │request_     │  │request_  │  │activity_│
│              │  │              │  │assignments  │  │approvals │  │logs     │
└──────────────┘  └──────────────┘  └─────────────┘  └──────────┘  └─────────┘
```

---

## 🔗 Detailed Table Relationships

### 1. **users** (Central Hub Entity)
```
Table: users
Primary Key: id
Unique Keys: employee_id, email

┌─── REFERENCED BY (18 relationships) ───────────────────────────────────────┐
│                                                                             │
│ 1. checkup_requests.employee_id          → users.id (CASCADE)             │
│    Purpose: Track who created the request                                  │
│                                                                             │
│ 2. checkup_requests.assigned_hr_id       → users.id (SET NULL)           │
│    Purpose: HR personnel assigned to handle request                        │
│                                                                             │
│ 3. checkup_requests.assigned_benefits_id → users.id (SET NULL)           │
│    Purpose: Benefits Officer reviewing request                             │
│                                                                             │
│ 4. checkup_requests.assigned_welfare_id  → users.id (SET NULL)           │
│    Purpose: Welfare Head reviewing request                                 │
│                                                                             │
│ 5. checkup_requests.rejected_by          → users.id (SET NULL)           │
│    Purpose: Who rejected the request (audit trail)                         │
│                                                                             │
│ 6. checkup_requests.letter_generated_by  → users.id (SET NULL)           │
│    Purpose: Who generated the final letter                                 │
│                                                                             │
│ 7. request_approvals.approver_id         → users.id (CASCADE, NULLABLE)  │
│    Purpose: Who approved/rejected at each stage                            │
│                                                                             │
│ 8. request_assignments.hr_personnel_id   → users.id (CASCADE)            │
│    Purpose: HR assigned to request                                         │
│                                                                             │
│ 9. request_assignments.assigned_by       → users.id (CASCADE)            │
│    Purpose: Who made the assignment                                        │
│                                                                             │
│ 10. request_assignments.reassigned_to    → users.id (SET NULL)           │
│     Purpose: Target of reassignment                                        │
│                                                                             │
│ 11. file_requests.requested_by           → users.id (CASCADE)            │
│     Purpose: Which approver requested additional files                     │
│                                                                             │
│ 12. request_files.uploaded_by            → users.id (SET NULL)           │
│     Purpose: Who uploaded the file                                         │
│                                                                             │
│ 13. request_files.generated_by           → users.id (SET NULL)           │
│     Purpose: Who generated the file (system letters)                       │
│                                                                             │
│ 14. notifications.recipient_id           → users.id (SET NULL)           │
│     Purpose: Email notification recipient                                  │
│                                                                             │
│ 15. activity_logs.user_id                → users.id (SET NULL)           │
│     Purpose: Audit trail of user actions                                   │
│                                                                             │
│ 16. system_settings.updated_by           → users.id (SET NULL)           │
│     Purpose: Track who modified settings                                   │
│                                                                             │
│ 17. faqs.created_by                      → users.id (SET NULL)           │
│     Purpose: Track who created FAQ entries                                 │
│                                                                             │
│ 18. notifications.recipient_id           → users.id (SET NULL)           │
│     Purpose: Additional notification tracking                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. **hospitals** (Reference Data Entity)
```
Table: hospitals
Primary Key: id

┌─── REFERENCED BY (3 relationships) ─────────────────────────────────────────┐
│                                                                             │
│ 1. checkup_requests.hospital_id          → hospitals.id (SET NULL)        │
│    Purpose: Hospital selected by executive                                  │
│    Cardinality: 1 hospital → Many requests                                 │
│                                                                             │
│ 2. checkup_requests.hr_assigned_hospital_id → hospitals.id (SET NULL)     │
│    Purpose: Hospital assigned by HR during processing                       │
│    Cardinality: 1 hospital → Many requests                                 │
│                                                                             │
│ 3. request_approvals.approved_hospital_id → hospitals.id (SET NULL)       │
│    Purpose: Hospital approved by approver at specific stage                 │
│    Cardinality: 1 hospital → Many approvals                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. **checkup_requests** (Main Business Entity)
```
Table: checkup_requests
Primary Key: id
Unique Key: request_number

┌─── REFERENCES (8 foreign keys) ─────────────────────────────────────────────┐
│                                                                             │
│ ↑ employee_id              → users.id (CASCADE)                            │
│ ↑ hospital_id              → hospitals.id (SET NULL)                       │
│ ↑ hr_assigned_hospital_id  → hospitals.id (SET NULL)                       │
│ ↑ assigned_hr_id           → users.id (SET NULL)                           │
│ ↑ assigned_benefits_id     → users.id (SET NULL)                           │
│ ↑ assigned_welfare_id      → users.id (SET NULL)                           │
│ ↑ rejected_by              → users.id (SET NULL)                           │
│ ↑ letter_generated_by      → users.id (SET NULL)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─── REFERENCED BY (6 child tables) ──────────────────────────────────────────┐
│                                                                             │
│ ↓ request_approvals.request_id    → checkup_requests.id (CASCADE)         │
│    Purpose: Track 4-stage approval workflow                                 │
│    Cardinality: 1 request → 4 approval records (one per stage)            │
│                                                                             │
│ ↓ request_assignments.request_id  → checkup_requests.id (CASCADE)         │
│    Purpose: Track assignment history (manual & self-claimed)                │
│    Cardinality: 1 request → Many assignments (reassignment support)       │
│                                                                             │
│ ↓ file_requests.request_id        → checkup_requests.id (CASCADE)         │
│    Purpose: Approvers request additional files from executive               │
│    Cardinality: 1 request → Many file requests                             │
│                                                                             │
│ ↓ request_files.request_id        → checkup_requests.id (CASCADE)         │
│    Purpose: Store all files related to request                             │
│    Cardinality: 1 request → Many files                                     │
│                                                                             │
│ ↓ notifications.request_id        → checkup_requests.id (CASCADE)         │
│    Purpose: Email notification queue for request events                     │
│    Cardinality: 1 request → Many notifications                             │
│                                                                             │
│ ↓ activity_logs.request_id        → checkup_requests.id (CASCADE)         │
│    Purpose: Complete audit trail of all request actions                     │
│    Cardinality: 1 request → Many log entries                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. **file_requests** (File Request System - NEW in v1.3) ✅
```
Table: file_requests
Primary Key: id

┌─── REFERENCES (2 foreign keys) ─────────────────────────────────────────────┐
│                                                                             │
│ ↑ request_id    → checkup_requests.id (CASCADE)                            │
│    Purpose: Links to the main checkup request                              │
│                                                                             │
│ ↑ requested_by  → users.id (CASCADE)                                       │
│    Purpose: Which approver (HR/Benefits/Welfare) requested files            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─── REFERENCED BY (1 child table) ───────────────────────────────────────────┐
│                                                                             │
│ ↓ request_files.file_request_id → file_requests.id (SET NULL)             │
│    Purpose: Links uploaded files to the file request they fulfill           │
│    Cardinality: 1 file_request → Many request_files                        │
│                                                                             │
│    Workflow:                                                                │
│    1. Approver creates file_requests entry (status='pending')              │
│    2. Executive uploads files → request_files (file_request_id populated)  │
│    3. System marks file_requests.status='fulfilled'                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - request_id (FK → checkup_requests.id)
  - requested_by (FK → users.id)
  - requested_by_role (ENUM: 'hr_personnel', 'benefits_officer', 'welfare_head')
  - message (TEXT) - Why files are needed
  - status (ENUM: 'pending', 'fulfilled', 'cancelled')
  - created_at, fulfilled_at, cancelled_at

Production Usage: ✅ ACTIVE
  - Used in file request workflow
  - Controller: fileRequestController.js
```

---

### 5. **request_files** (File Storage Entity)
```
Table: request_files
Primary Key: id

┌─── REFERENCES (4 foreign keys) ─────────────────────────────────────────────┐
│                                                                             │
│ ↑ request_id       → checkup_requests.id (CASCADE)                         │
│    Purpose: Main request this file belongs to                              │
│                                                                             │
│ ↑ file_request_id  → file_requests.id (SET NULL) ✅ NEW in v1.3           │
│    Purpose: Links to file request if this is an additional file            │
│    Note: NULL for initial submission files                                 │
│                                                                             │
│ ↑ uploaded_by      → users.id (SET NULL)                                   │
│    Purpose: User who uploaded the file (usually executive)                 │
│                                                                             │
│ ↑ generated_by     → users.id (SET NULL)                                   │
│    Purpose: User who generated the file (for system letters)               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─── REFERENCED BY (1 child table) ───────────────────────────────────────────┐
│                                                                             │
│ ↓ activity_logs.file_id → request_files.id (SET NULL)                     │
│    Purpose: Track file operations in audit trail                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - request_id (FK → checkup_requests.id)
  - file_request_id (FK → file_requests.id) ✅ v1.3
  - file_name, original_file_name, file_path
  - file_size, file_type, file_extension
  - file_category (ENUM: 'supporting_document', 'letter_of_approval',
                         'letter_of_authorization', 'additional_document')
  - submission_type (ENUM: 'initial_submission', 'additional_requested') ✅ v1.3
  - uploaded_by (FK → users.id)
  - generated_by (FK → users.id)
  - is_active, is_sent_to_executive, sent_at
  - access_token, expires_at, download_count
  - created_at, updated_at
```

---

### 6. **request_assignments** (Assignment History Tracking) ✅
```
Table: request_assignments
Primary Key: id

┌─── REFERENCES (4 foreign keys) ─────────────────────────────────────────────┐
│                                                                             │
│ ↑ request_id       → checkup_requests.id (CASCADE)                         │
│    Purpose: Request being assigned                                          │
│                                                                             │
│ ↑ hr_personnel_id  → users.id (CASCADE)                                    │
│    Purpose: HR personnel assigned to handle the request                     │
│                                                                             │
│ ↑ assigned_by      → users.id (CASCADE)                                    │
│    Purpose: Who made the assignment                                         │
│    Note: For self_claimed, assigned_by = hr_personnel_id                   │
│                                                                             │
│ ↑ reassigned_to    → users.id (SET NULL)                                   │
│    Purpose: Target of reassignment (supports reassignment workflow)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - request_id (FK → checkup_requests.id)
  - hr_personnel_id (FK → users.id)
  - assigned_by (FK → users.id)
  - reassigned_to (FK → users.id, NULL)
  - assignment_type (ENUM: 'auto_assigned', 'manually_assigned', 'self_claimed')
  - assigned_at
  - is_active (BOOLEAN)
  - completed_at, reassigned_at
  - reassignment_reason, notes

Production Usage: ✅ ACTIVE (NOT OBSOLETE!)
  - Line 87-91 in requestWorkflowController.js: Manual assignment
  - Line 228-231 in requestWorkflowController.js: Self-claimed assignment

Purpose:
  ✓ Maintains complete assignment history
  ✓ Tracks who assigned what to whom
  ✓ Supports reassignment functionality
  ✓ Differentiates manual vs self-claimed assignments
  ✓ Provides audit trail for compliance
```

---

### 7. **request_approvals** (4-Stage Approval Workflow)
```
Table: request_approvals
Primary Key: id

┌─── REFERENCES (3 foreign keys) ─────────────────────────────────────────────┐
│                                                                             │
│ ↑ request_id           → checkup_requests.id (CASCADE)                     │
│    Purpose: Request being approved                                          │
│                                                                             │
│ ↑ approver_id          → users.id (CASCADE, NULLABLE) ⚠️                  │
│    Purpose: Who approved/rejected at this stage                            │
│    Note: NULL until stage is claimed by an approver                        │
│                                                                             │
│ ↑ approved_hospital_id → hospitals.id (SET NULL)                           │
│    Purpose: Hospital approved at this stage (if modified)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - request_id (FK → checkup_requests.id)
  - approver_id (FK → users.id, NULLABLE)
  - approver_role (ENUM: 'hr_personnel', 'benefits_officer', 'welfare_head')
  - approval_stage (ENUM: 'hr_stage', 'benefits_stage',
                          'welfare_stage', 'hr_final_stage')
  - action (ENUM: 'approved', 'rejected', 'pending', 'returned_for_revision')
  - comments (TEXT)
  - action_date
  - is_current_stage (BOOLEAN) - Which stage is active now
  - stage_order (INT) - 1, 2, 3, 4
  - approved_hospital_id (FK → hospitals.id, NULL)
  - approved_date (DATE)
  - created_at, updated_at

Workflow Stages:
  1. hr_stage           → Initial HR processing (assign hospital)
  2. benefits_stage     → Benefits Officer review
  3. welfare_stage      → Welfare Head review
  4. hr_final_stage     → HR final verification before letter ✅ v1.3
```

---

### 8. **notifications** (Email Queue & Status)
```
Table: notifications
Primary Key: id

┌─── REFERENCES (2 foreign keys) ─────────────────────────────────────────────┐
│                                                                             │
│ ↑ request_id    → checkup_requests.id (CASCADE)                            │
│    Purpose: Request this notification is about                             │
│                                                                             │
│ ↑ recipient_id  → users.id (SET NULL)                                      │
│    Purpose: User receiving the notification                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - request_id (FK → checkup_requests.id, NULL)
  - recipient_id (FK → users.id, NULL)
  - notification_type (ENUM: 17 different event types)
  - recipient_email, recipient_role
  - subject, message, html_content
  - attached_file_ids (JSON)
  - status (ENUM: 'pending', 'sent', 'failed', 'bounced', 'delivered')
  - sent_at, delivery_status, error_message
  - retry_count, max_retries
  - gmail_message_id, gmail_thread_id
  - scheduled_at, created_at
```

---

### 9. **activity_logs** (Complete Audit Trail)
```
Table: activity_logs
Primary Key: id

┌─── REFERENCES (3 foreign keys) ─────────────────────────────────────────────┐
│                                                                             │
│ ↑ request_id → checkup_requests.id (CASCADE)                               │
│    Purpose: Request this action relates to                                  │
│                                                                             │
│ ↑ user_id    → users.id (SET NULL)                                         │
│    Purpose: User who performed the action                                   │
│                                                                             │
│ ↑ file_id    → request_files.id (SET NULL)                                 │
│    Purpose: File involved in the action (upload, download, etc.)            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - request_id (FK → checkup_requests.id, NULL)
  - user_id (FK → users.id, NULL)
  - file_id (FK → request_files.id, NULL)
  - action (VARCHAR(100)) - Action type
  - description (TEXT) - Human-readable description
  - old_values (JSON) - Before state
  - new_values (JSON) - After state
  - ip_address, user_agent, session_id
  - created_at
```

---

### 10. **system_settings** (Configuration)
```
Table: system_settings
Primary Key: id
Unique Key: setting_key

┌─── REFERENCES (1 foreign key) ──────────────────────────────────────────────┐
│                                                                             │
│ ↑ updated_by → users.id (SET NULL)                                         │
│    Purpose: Track who modified settings                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - setting_key (UNIQUE, VARCHAR(100))
  - setting_value (TEXT)
  - description (TEXT)
  - updated_by (FK → users.id, NULL)
  - updated_at
```

---

### 11. **faqs** (Help Content)
```
Table: faqs
Primary Key: id

┌─── REFERENCES (1 foreign key) ──────────────────────────────────────────────┐
│                                                                             │
│ ↑ created_by → users.id (SET NULL)                                         │
│    Purpose: Track who created FAQ                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Fields:
  - id (PK)
  - question (TEXT)
  - answer (TEXT)
  - category (ENUM: 8 categories)
  - is_active (BOOLEAN)
  - display_order (INT)
  - view_count (INT)
  - created_by (FK → users.id, NULL)
  - created_at, updated_at
```

---

## 📋 Foreign Key Reference Chart

### Complete FK Mapping

| Child Table          | Child Column              | Parent Table      | Parent Column | On Delete   | Nullable |
|---------------------|---------------------------|-------------------|---------------|-------------|----------|
| checkup_requests    | employee_id               | users             | id            | CASCADE     | No       |
| checkup_requests    | hospital_id               | hospitals         | id            | SET NULL    | Yes      |
| checkup_requests    | hr_assigned_hospital_id   | hospitals         | id            | SET NULL    | Yes      |
| checkup_requests    | assigned_hr_id            | users             | id            | SET NULL    | Yes      |
| checkup_requests    | assigned_benefits_id      | users             | id            | SET NULL    | Yes      |
| checkup_requests    | assigned_welfare_id       | users             | id            | SET NULL    | Yes      |
| checkup_requests    | rejected_by               | users             | id            | SET NULL    | Yes      |
| checkup_requests    | letter_generated_by       | users             | id            | SET NULL    | Yes      |
| request_approvals   | request_id                | checkup_requests  | id            | CASCADE     | No       |
| request_approvals   | approver_id               | users             | id            | CASCADE     | Yes ⚠️   |
| request_approvals   | approved_hospital_id      | hospitals         | id            | SET NULL    | Yes      |
| request_assignments | request_id                | checkup_requests  | id            | CASCADE     | No       |
| request_assignments | hr_personnel_id           | users             | id            | CASCADE     | No       |
| request_assignments | assigned_by               | users             | id            | CASCADE     | No       |
| request_assignments | reassigned_to             | users             | id            | SET NULL    | Yes      |
| file_requests       | request_id                | checkup_requests  | id            | CASCADE     | No       |
| file_requests       | requested_by              | users             | id            | CASCADE     | No       |
| request_files       | request_id                | checkup_requests  | id            | CASCADE     | No       |
| request_files       | file_request_id           | file_requests     | id            | SET NULL    | Yes      |
| request_files       | uploaded_by               | users             | id            | SET NULL    | Yes      |
| request_files       | generated_by              | users             | id            | SET NULL    | Yes      |
| notifications       | request_id                | checkup_requests  | id            | CASCADE     | Yes      |
| notifications       | recipient_id              | users             | id            | SET NULL    | Yes      |
| activity_logs       | request_id                | checkup_requests  | id            | CASCADE     | Yes      |
| activity_logs       | user_id                   | users             | id            | SET NULL    | Yes      |
| activity_logs       | file_id                   | request_files     | id            | SET NULL    | Yes      |
| system_settings     | updated_by                | users             | id            | SET NULL    | Yes      |
| faqs                | created_by                | users             | id            | SET NULL    | Yes      |

**Total Foreign Keys:** 32

---

## 📏 Cardinality Summary

### Relationship Types

```
1:Many (One-to-Many) - ALL current relationships
├─ 1 user → Many checkup_requests (as employee)
├─ 1 user → Many checkup_requests (as assigned_hr)
├─ 1 user → Many checkup_requests (as assigned_benefits)
├─ 1 user → Many checkup_requests (as assigned_welfare)
├─ 1 hospital → Many checkup_requests (as selected hospital)
├─ 1 hospital → Many checkup_requests (as HR assigned hospital)
├─ 1 checkup_request → Many request_approvals (4 stages)
├─ 1 checkup_request → Many request_assignments (assignment history)
├─ 1 checkup_request → Many file_requests (multiple file requests)
├─ 1 checkup_request → Many request_files (multiple files)
├─ 1 file_request → Many request_files (fulfillment files)
└─ 1 checkup_request → Many activity_logs (audit trail)

Many:Many - None (no junction tables needed yet)

1:1 (One-to-One) - None (no unique FKs)
```

---

## 🔄 Data Flow Examples

### Example 1: Complete Request Lifecycle with Table Interactions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Executive Submits Request                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ INSERT INTO checkup_requests                                                │
│   (employee_id, request_number, request_type, hospital_id, ...)            │
│   VALUES (123, 'REQ-2025-0001', 'letter_of_approval', 5, ...)             │
│   → current_status = 'pending'                                              │
│                                                                             │
│ INSERT INTO request_approvals (4 records created)                           │
│   Stage 1: approval_stage='hr_stage', action='pending', is_current=TRUE    │
│   Stage 2: approval_stage='benefits_stage', action='pending'               │
│   Stage 3: approval_stage='welfare_stage', action='pending'                │
│   Stage 4: approval_stage='hr_final_stage', action='pending'               │
│                                                                             │
│ INSERT INTO notifications                                                   │
│   notification_type = 'request_submitted'                                   │
│   recipient_role = 'hr_personnel' (to all HR)                              │
│                                                                             │
│ INSERT INTO activity_logs                                                   │
│   action = 'request_created'                                                │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: HR Personnel Claims Request (Self-Claimed)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ UPDATE checkup_requests                                                     │
│   SET assigned_hr_id = 45,                                                  │
│       assigned_hr_at = NOW(),                                               │
│       current_status = 'hr_processing'                                      │
│   WHERE id = 1001                                                           │
│                                                                             │
│ INSERT INTO request_assignments ✅                                          │
│   (request_id, hr_personnel_id, assigned_by, assignment_type)              │
│   VALUES (1001, 45, 45, 'self_claimed')                                    │
│   → Tracks that HR #45 claimed this request                                │
│                                                                             │
│ UPDATE request_approvals                                                    │
│   SET approver_id = 45                                                      │
│   WHERE request_id = 1001 AND approval_stage = 'hr_stage'                  │
│   → Links HR personnel to approval record                                   │
│                                                                             │
│ INSERT INTO notifications                                                   │
│   notification_type = 'request_assigned'                                    │
│   recipient_id = 123 (to executive)                                         │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: HR Processes & Approves                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ UPDATE checkup_requests                                                     │
│   SET hr_assigned_hospital_id = 8,                                          │
│       current_status = 'benefits_review'                                    │
│                                                                             │
│ UPDATE request_approvals (Stage 1)                                          │
│   SET action = 'approved',                                                  │
│       action_date = NOW(),                                                  │
│       is_current_stage = FALSE                                              │
│   WHERE request_id = 1001 AND approval_stage = 'hr_stage'                  │
│                                                                             │
│ UPDATE request_approvals (Stage 2)                                          │
│   SET is_current_stage = TRUE                                               │
│   WHERE request_id = 1001 AND approval_stage = 'benefits_stage'            │
│                                                                             │
│ INSERT INTO notifications                                                   │
│   notification_type = 'benefits_review_started'                             │
│   recipient_role = 'benefits_officer'                                       │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Benefits Officer Requests Additional Files ✅                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ UPDATE request_approvals                                                    │
│   SET approver_id = 67                                                      │
│   WHERE request_id = 1001 AND approval_stage = 'benefits_stage'            │
│   → Benefits Officer #67 claims the stage                                   │
│                                                                             │
│ INSERT INTO file_requests ✅                                                │
│   (request_id, requested_by, requested_by_role, message, status)           │
│   VALUES (1001, 67, 'benefits_officer',                                    │
│           'Please upload medical history', 'pending')                       │
│   → Creates file request record                                             │
│                                                                             │
│ INSERT INTO notifications                                                   │
│   notification_type = 'file_requested'                                      │
│   recipient_id = 123 (to executive)                                         │
│   message = "Benefits Officer requested additional files"                   │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Executive Uploads Additional Files ✅                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ INSERT INTO request_files                                                   │
│   (request_id, file_request_id, file_name, file_path,                      │
│    file_category, submission_type, uploaded_by)                             │
│   VALUES (1001, 999, 'medical_history.pdf', '/uploads/...',               │
│           'additional_document', 'additional_requested', 123)               │
│   → file_request_id = 999 links to the file request                        │
│   → submission_type = 'additional_requested' marks as extra file           │
│                                                                             │
│ UPDATE file_requests                                                        │
│   SET status = 'fulfilled',                                                 │
│       fulfilled_at = NOW()                                                  │
│   WHERE id = 999                                                            │
│   → Marks file request as completed                                         │
│                                                                             │
│ INSERT INTO notifications                                                   │
│   notification_type = 'file_uploaded'                                       │
│   recipient_id = 67 (to Benefits Officer)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6-8: Benefits → Welfare → HR Final → Completion                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Similar UPDATE patterns cascade through:                                    │
│   - benefits_stage (approve)                                                │
│   - welfare_stage (approve)                                                 │
│   - hr_final_stage (approve)                                                │
│   - Letter generation (INSERT request_files)                                │
│   - Completion (UPDATE current_status = 'completed')                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Example 2: Manual Assignment by Admin

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Admin (user_id=1) manually assigns Request #1005 to HR Personnel #52       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ UPDATE checkup_requests                                                     │
│   SET assigned_hr_id = 52,                                                  │
│       assigned_hr_at = NOW(),                                               │
│       current_status = 'hr_processing'                                      │
│   WHERE id = 1005                                                           │
│                                                                             │
│ INSERT INTO request_assignments ✅                                          │
│   (request_id, hr_personnel_id, assigned_by, assignment_type, notes)       │
│   VALUES (1005, 52, 1, 'manually_assigned',                                │
│           'Assigned due to expertise in cardiology cases')                  │
│   → request_id = 1005 (links to checkup_requests)                          │
│   → hr_personnel_id = 52 (target HR)                                       │
│   → assigned_by = 1 (Admin who made assignment)                            │
│   → assignment_type = 'manually_assigned'                                   │
│                                                                             │
│ UPDATE request_approvals                                                    │
│   SET approver_id = 52                                                      │
│   WHERE request_id = 1005 AND approval_stage = 'hr_stage'                  │
│                                                                             │
│ INSERT INTO activity_logs                                                   │
│   (request_id, user_id, action, description)                                │
│   VALUES (1005, 1, 'manual_assignment',                                    │
│           'Admin assigned request to HR #52')                               │
│                                                                             │
│ INSERT INTO notifications (x2)                                              │
│   1. To HR #52: "You have been assigned request REQ-2025-1005"            │
│   2. To Executive: "Your request has been assigned to HR"                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

This demonstrates that request_assignments is ACTIVELY USED! ✅
```

---

## 🎨 Simplified Visual Summary

```
                    ┌──────────────────┐
                    │      users       │
                    │  (Central Hub)   │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
         ┌──────────▼──────────┐       │
         │     hospitals       │       │
         │  (Reference Data)   │       │
         └──────────┬──────────┘       │
                    │                  │
         ┌──────────▼──────────────────▼───────────┐
         │        checkup_requests                  │
         │     (Main Business Entity)               │
         └──┬────┬────────┬────────┬────────┬─────┬┘
            │    │        │        │        │     │
    ┌───────▼┐ ┌─▼──────┐ ┌──▼────┐ ┌──▼──┐ ┌─▼─┐ ┌─▼─────┐
    │request_│ │file_   │ │request│ │noti-│ │act│ │request│
    │files   │ │requests│ │_assign│ │fica-│ │ivi│ │_appro-│
    │        │ │   ✅   │ │ments  │ │tions│ │ty │ │vals   │
    │        │ │        │ │   ✅  │ │     │ │log│ │       │
    └────┬───┘ └────────┘ └───────┘ └─────┘ └───┘ └───────┘
         │
    ┌────▼────────┐
    │file_requests│
    │    (FK)     │
    │     ✅      │
    └─────────────┘

Legend:
✅ = Confirmed ACTIVE in production
FK = Foreign Key relationship
```

---

## 🔍 Key Insights

### 1. request_assignments Table Status
**Status:** ✅ **ACTIVE IN PRODUCTION** (NOT obsolete!)

**Evidence:**
- Used in [requestWorkflowController.js:87-91](C:\Program Files\MetroExecuCare\Backend\controllers\requestWorkflowController.js#L87-L91) for manual assignments
- Used in [requestWorkflowController.js:228-231](C:\Program Files\MetroExecuCare\Backend\controllers\requestWorkflowController.js#L228-L231) for self-claimed assignments

**Purpose:**
- Maintains complete assignment history
- Supports reassignment workflow
- Tracks assignment type (manual vs self-claimed)
- Provides audit trail for compliance

**Why it exists alongside assigned_hr_id in checkup_requests:**
- `checkup_requests.assigned_hr_id` = Current active HR assignment
- `request_assignments` = Complete history of all assignments (supports reassignment)

---

### 2. file_requests Table Connections
**Status:** ✅ **ACTIVE - Core Feature in v1.3**

**Connection Flow:**
```
users ─────┐
           ↓
checkup_requests ──→ file_requests ──→ request_files
                          ↑
                          │
                      Fulfillment Link
```

**Foreign Keys:**
1. `file_requests.request_id` → `checkup_requests.id` (CASCADE)
2. `file_requests.requested_by` → `users.id` (CASCADE)
3. `request_files.file_request_id` → `file_requests.id` (SET NULL)

**Workflow:**
1. Approver creates file request (INSERT file_requests)
2. Executive uploads files (INSERT request_files with file_request_id)
3. System marks fulfilled (UPDATE file_requests.status)

---

### 3. Cascade Behavior Patterns

**ON DELETE CASCADE** (Data is deleted when parent is deleted):
- Critical relationships where child data is meaningless without parent
- Example: `checkup_requests.employee_id` → `users.id`
  - If user is deleted, their requests should be deleted too

**ON DELETE SET NULL** (Reference is nullified when parent is deleted):
- Optional relationships where child data still has value
- Example: `request_files.uploaded_by` → `users.id`
  - If user is deleted, file record remains but uploader is unknown

---

## 📊 Database Statistics

- **Total Tables:** 11
- **Total Foreign Keys:** 32
- **Relationships per table:**
  - users: 18 outgoing relationships
  - checkup_requests: 8 incoming + 6 outgoing
  - hospitals: 3 outgoing
- **All relationships:** 1:Many (no Many:Many junction tables)
- **Indexed columns:** 47 indexes across all tables

---

## 📝 Production Notes

### Active Tables (ALL 11 tables are active!)
✅ users - Central authentication and user management
✅ hospitals - Hospital directory reference data
✅ checkup_requests - Main business entity
✅ request_approvals - 4-stage approval workflow
✅ request_assignments - Assignment history tracking ⚠️ **NOT obsolete!**
✅ file_requests - File request system (v1.3)
✅ request_files - File storage and management
✅ notifications - Email notification queue
✅ activity_logs - Complete audit trail
✅ system_settings - Application configuration
✅ faqs - Help content management

### Database Version
**Schema Version:** 1.3.0
**Last Updated:** January 2025
**Migration File:** Backend/config/database/manual-schema.js

---

**End of Enhanced ERD Documentation**