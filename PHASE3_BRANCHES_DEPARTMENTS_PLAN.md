# Phase 3: Branches & Departments Normalization

## Current State Analysis

### Existing Data:
- **Total Users:** 17
- **All users have departments** (17/17)
- **16 users have branches** (1 without branch)

### Current Departments (9 unique):
1. IT (6 users)
2. Management (3 users)
3. Data (2 users)
4. IT Department (1 user) - **Duplicate of "IT"**
5. Human Resources (1 user)
6. Benefits &amp; Services (1 user) - **Has HTML encoding issue**
7. Welfare and Recreation (1 user)
8. Finance (1 user)
9. Human Resource (1 user) - **Duplicate of "Human Resources"**

**Resolution**
use these departments as basic seeds:
1. IT
2. Human Resources
3. Marketing
4. Finance & Accounting
5. Legal
6. Customer Relations
- this is only to name a few, since Admin can add departments when necessary
- If user's department does not exist, edit their department to an existing department

**Issues:**
- ❌ Inconsistent naming ("IT" vs "IT Department")
- ❌ HTML encoding artifacts ("&amp;amp;" instead of "&")
- ❌ Spelling variations ("Human Resources" vs "Human Resource")
- ❌ No standardization

### Current Branches (4 unique):
1. Metrobank Fort - Ecoprime Tower (9 users)
2. Metrobank Taguig - Puregold Branch (4 users)
3. Metrobank Fort - Mckinley Branch (2 users)
4. Metrobank Fort-Ten West Campus Branch (1 user)

**Issues:**
- ❌ Inconsistent formatting ("Fort-Ten" vs "Fort -")
- ❌ Free-text entry allows typos
- ❌ No address/contact information stored
- ❌ No way to add new branches systematically

---

## Objectives

### Primary Goals:
1. ✅ Create `departments` table with predefined company departments
2. ✅ Create `branches` table with complete branch information
3. ✅ Migrate existing VARCHAR data to FK relationships
4. ✅ Clean up data inconsistencies during migration
5. ✅ Create CRUD APIs for managing departments and branches
6. ✅ Create Admin UI for managing departments and branches
7. ✅ Update NewUserFormModal to use dropdowns instead of free text

### Benefits:
- ✅ Data consistency (no typos, no duplicates)
- ✅ Standardized department names
- ✅ Complete branch information (address, contact, manager)
- ✅ Easy to add new branches/departments
- ✅ Better reporting and filtering capabilities

---

## Database Schema Design

### 1. Departments Table

```sql
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
);
```

**Note:** Removed `head_user_id` as requested by user (no branch heads in system)

#### Predefined Departments for Metrobank:
Based on typical banking organizational structure:

1. **Executive Management**
2. **Human Resources**
3. **Information Technology**
4. **Finance & Accounting**
5. **Benefits & Services**
6. **Welfare & Recreation**
7. **Operations**
8. **Risk Management**
9. **Compliance**
10. **Audit**
11. **Marketing**
12. **Branch Operations**
13. **Customer Service**
14. **Treasury**
15. **Legal**

### 2. Branches Table

```sql
CREATE TABLE branches (
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
```

**Note:** Removed `manager_user_id` as requested by user

#### Initial Branches (from existing data):
1. Metrobank Fort - Ecoprime Tower
2. Metrobank Taguig - Puregold Branch
3. Metrobank Fort - McKinley Branch
4. Metrobank Fort - Ten West Campus Branch

### 3. Update Users Table

```sql
-- Add new FK columns
ALTER TABLE users
  ADD COLUMN department_id INT AFTER role,
  ADD COLUMN branch_id INT AFTER department_id;

-- Add foreign keys
ALTER TABLE users
  ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  ADD FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Add indexes
ALTER TABLE users
  ADD INDEX idx_department_id (department_id),
  ADD INDEX idx_branch_id (branch_id);

-- After migration complete, drop old VARCHAR columns
-- ALTER TABLE users
--   DROP COLUMN department,
--   DROP COLUMN branch;
```

---

## Data Migration Strategy

### Step 1: Create Tables
- Create `departments` table
- Create `branches` table
- Add FK columns to `users` table

### Step 2: Seed Initial Data

#### Departments Mapping:
```
"IT" → "Information Technology"
"IT Department" → "Information Technology"
"Management" → "Executive Management"
"Data" → "Information Technology" (assuming data team is under IT)
"Human Resources" → "Human Resources"
"Human Resource" → "Human Resources"
"Benefits & Services" → "Benefits & Services" (fix HTML encoding)
"Benefits &amp;amp; Services" → "Benefits & Services"
"Welfare and Recreation" → "Welfare & Recreation"
"Finance" → "Finance & Accounting"
```

#### Branches Mapping:
```
"Metrobank Fort - Ecoprime Tower" → "Metrobank Fort - Ecoprime Tower"
"Metrobank Taguig - Puregold Branch" → "Metrobank Taguig - Puregold Branch"
"Metrobank Fort - Mckinley Branch" → "Metrobank Fort - McKinley Branch"
"Metrobank Fort-Ten West Campus Branch" → "Metrobank Fort - Ten West Campus Branch"
```

### Step 3: Migrate User Data
- Update users.department_id based on department VARCHAR mapping
- Update users.branch_id based on branch VARCHAR mapping
- Verify all users have proper FK references

### Step 4: Verification
- Verify all 17 users have department_id set
- Verify 16 users have branch_id set (1 user legitimately has no branch)
- Verify no orphaned FKs

### Step 5: Drop Old Columns (Optional - keep for rollback safety)
- **Recommendation:** Keep department and branch VARCHAR columns for 30 days
- After verification period, drop the old columns

---

## API Endpoints Design

### Departments API

```
GET    /api/departments              - List all departments
GET    /api/departments/:id          - Get department details
POST   /api/departments              - Create new department (Admin only)
PUT    /api/departments/:id          - Update department (Admin only)
DELETE /api/departments/:id          - Soft delete (set is_active=false) (Admin only)
GET    /api/departments/:id/users    - Get all users in department
```

### Branches API

```
GET    /api/branches                 - List all branches
GET    /api/branches/:id             - Get branch details
POST   /api/branches                 - Create new branch (Admin only)
PUT    /api/branches/:id             - Update branch (Admin only)
DELETE /api/branches/:id             - Soft delete (set is_active=false) (Admin only)
GET    /api/branches/:id/users       - Get all users in branch
```

---

## Frontend Changes

### 1. Admin UI - Department Management
**Location:** Create new page `/admin/departments`

**Features:**
- DataTable showing all departments
- Add Department button (opens modal)
- Edit/Delete buttons for each department
- Show user count per department
- Filter by active/inactive

**Form Fields:**
- Name (required, unique)
- Description (optional)
- Is Active (checkbox)

### 2. Admin UI - Branch Management
**Location:** Create new page `/admin/branches`

**Features:**
- DataTable showing all branches
- Add Branch button (opens modal)
- Edit/Delete buttons for each branch
- Show user count per branch
- Filter by active/inactive, city

**Form Fields:**
- Name (required, unique)
- Code (optional, unique branch code)
- Address (optional)
- City (optional)
- Region (optional)
- Contact Number (optional)
- Email (optional)
- Is Active (checkbox)

### 3. Update NewUserFormModal

**Current:**
- department: Free text input field
- branch: Free text input field

**New:**
- department_id: Dropdown (fetched from /api/departments)
- branch_id: Dropdown (fetched from /api/branches)

**Implementation:**
- Fetch departments on component mount
- Fetch branches on component mount
- Use react-select or native select element
- Show department/branch name, send ID

### 4. Update User Display Components
- Show department name from department.name (via JOIN)
- Show branch name from branch.name (via JOIN)
- Update any user listing/filtering to use new FK relationships

---

## Implementation Steps

### Phase 3.1: Database Schema
1. Create migration SQL file
2. Create departments table
3. Create branches table
4. Add FK columns to users table
5. Seed initial departments
6. Seed initial branches

### Phase 3.2: Data Migration
1. Create data migration script
2. Map existing departments to new IDs
3. Map existing branches to new IDs
4. Update all users with new FK values
5. Verify migration success

### Phase 3.3: Backend API
1. Create departments controller
2. Create branches controller
3. Create departments routes
4. Create branches routes
5. Add admin authorization middleware
6. Update user controller to use FK relationships
7. Update validators

### Phase 3.4: Frontend - API Integration
1. Create API service methods for departments
2. Create API service methods for branches

### Phase 3.5: Frontend - Admin UI
1. Create DepartmentManagement page
2. Create BranchManagement page
3. Create AddDepartmentModal component
4. Create EditDepartmentModal component
5. Create AddBranchModal component
6. Create EditBranchModal component
7. Add navigation links to admin panel

### Phase 3.6: Frontend - User Forms
1. Update NewUserFormModal with dropdowns
2. Update EditUserModal with dropdowns
3. Update user display components
4. Test form submission

### Phase 3.7: Testing
1. Test department CRUD operations
2. Test branch CRUD operations
3. Test user creation with new dropdowns
4. Test user editing with dropdowns
5. Test filtering/searching by department/branch
6. Test edge cases (inactive departments, etc.)

---

## Rollback Plan

### If Issues Arise:

**Step 1: Revert User FK Values**
```sql
-- Clear FK values, revert to VARCHAR
UPDATE users SET department_id = NULL, branch_id = NULL;
```

**Step 2: Drop New Columns**
```sql
ALTER TABLE users
  DROP FOREIGN KEY users_ibfk_department,
  DROP FOREIGN KEY users_ibfk_branch,
  DROP COLUMN department_id,
  DROP COLUMN branch_id;
```

**Step 3: Drop New Tables**
```sql
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS branches;
```

**Step 4: Revert Code**
```bash
git revert [commit-hash]
git push origin feature/enhanced-authentication-v1.2
```

---

## Timeline Estimate

- Phase 3.1 (Database): 1 hour
- Phase 3.2 (Data Migration): 1 hour
- Phase 3.3 (Backend API): 2-3 hours
- Phase 3.4 (API Integration): 1 hour
- Phase 3.5 (Admin UI): 4-5 hours
- Phase 3.6 (User Forms): 2-3 hours
- Phase 3.7 (Testing): 2 hours

**Total: 13-16 hours of development**

---

## Success Criteria

- ✅ All 17 users successfully migrated to new FK relationships
- ✅ No data loss
- ✅ Admins can add/edit/delete departments
- ✅ Admins can add/edit/delete branches
- ✅ NewUserFormModal uses dropdowns
- ✅ All user displays show correct department/branch names
- ✅ No "undefined" or null displays
- ✅ Consistent department naming across system
- ✅ No free-text entry for departments/branches anymore

---

## Notes

- Keep old VARCHAR columns for 30 days as safety backup
- Department list based on typical banking organization structure
- Can add more departments later via Admin UI
- Branch manager and department head features deferred (per user request)
- All changes backward compatible during migration period